import fitz  # PyMuPDF
import json
import re
import os
import numpy as np
import requests
import faiss
from pathlib import Path
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

# ─────────────────────────────────────────────
# CONFIG
# ─────────────────────────────────────────────
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
OLLAMA_URL = "http://localhost:11434"
EMBED_MODEL = "nomic-embed-text"  # still using Ollama for embeddings (lightweight)
GROQ_MODEL = "llama-3.3-70b-versatile" # fast and accurate on Groq
VECTORSTORE_DIR = "vectorstores"
CHUNK_SIZE = 500
CHUNK_OVERLAP = 50

os.makedirs(VECTORSTORE_DIR, exist_ok=True)

# Groq client
client = Groq(api_key=GROQ_API_KEY)


# ─────────────────────────────────────────────
# STEP 1 — Extract text from PDF
# ─────────────────────────────────────────────
def extract_text_from_pdf_bytes(file_bytes: bytes) -> str:
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    text = ""
    for page in doc:
        text += page.get_text()
    doc.close()
    return text.strip()


# ─────────────────────────────────────────────
# STEP 2 — Split text into chunks
# ─────────────────────────────────────────────
def split_text(text: str) -> list[str]:
    chunks = []
    start = 0
    while start < len(text):
        end = start + CHUNK_SIZE
        chunks.append(text[start:end])
        start += CHUNK_SIZE - CHUNK_OVERLAP
    return [c.strip() for c in chunks if c.strip()]


# ─────────────────────────────────────────────
# STEP 3 — Get embeddings from Ollama
# ─────────────────────────────────────────────
def get_embedding(text: str) -> list[float]:
    response = requests.post(
        f"{OLLAMA_URL}/api/embeddings",
        json={"model": EMBED_MODEL, "prompt": text},
        timeout=30
    )
    response.raise_for_status()
    return response.json()["embedding"]


def get_embeddings(texts: list[str]) -> np.ndarray:
    embeddings = []
    for text in texts:
        emb = get_embedding(text)
        embeddings.append(emb)
    return np.array(embeddings, dtype=np.float32)


# ─────────────────────────────────────────────
# STEP 4 — Build FAISS index
# ─────────────────────────────────────────────
def build_vectorstore(chunks: list[str], doc_id: str):
    embeddings = get_embeddings(chunks)
    dim = embeddings.shape[1]
    index = faiss.IndexFlatL2(dim)
    index.add(embeddings)

    save_dir = Path(VECTORSTORE_DIR) / doc_id
    save_dir.mkdir(exist_ok=True)
    faiss.write_index(index, str(save_dir / "index.faiss"))

    with open(save_dir / "chunks.json", "w", encoding="utf-8") as f:
        json.dump(chunks, f, ensure_ascii=False)

    return index, chunks


def load_vectorstore(doc_id: str):
    save_dir = Path(VECTORSTORE_DIR) / doc_id
    if not save_dir.exists():
        return None, None

    index = faiss.read_index(str(save_dir / "index.faiss"))
    with open(save_dir / "chunks.json", "r", encoding="utf-8") as f:
        chunks = json.load(f)

    return index, chunks


# ─────────────────────────────────────────────
# STEP 5 — Retrieve relevant chunks
# ─────────────────────────────────────────────
def retrieve(query: str, index, chunks: list[str], k: int = 3) -> str:
    query_emb = np.array([get_embedding(query)], dtype=np.float32)
    _, indices = index.search(query_emb, k)
    relevant = [chunks[i] for i in indices[0] if i < len(chunks)]
    return "\n\n".join(relevant)


# ─────────────────────────────────────────────
# STEP 6 — Ask Groq (replaces Mistral/Ollama)
# ─────────────────────────────────────────────
def ask_groq(context: str, question: str) -> str:
    """
    Send context + question to Groq API.
    Ultra fast — response in under 1 second.
    """
    prompt = f"""Use the following document excerpt to answer the question.
Only use information from the excerpt. Be concise and precise.
The document may be in French or English — answer in the same language.

Document excerpt:
{context}

Question: {question}

Answer:"""

    response = client.chat.completions.create(
        model=GROQ_MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.05,
        max_tokens=500,
    )
    return response.choices[0].message.content.strip()


# ─────────────────────────────────────────────
# MAIN PIPELINE
# ─────────────────────────────────────────────
def process_document(file_bytes: bytes, filename: str, doc_id: str) -> dict:
    """Full RAG pipeline — extract, embed, query with Groq"""

    # Step 1: Extract text
    if filename.lower().endswith(".pdf"):
        text = extract_text_from_pdf_bytes(file_bytes)
    else:
        try:
            text = file_bytes.decode("utf-8")
        except Exception:
            return {"error": "Unsupported file type. Please upload a PDF."}

    if not text.strip() or len(text) < 20:
        return {"error": "No text could be extracted. Make sure the PDF has a text layer."}

    # Step 2: Split and embed
    chunks = split_text(text)
    index, chunks = build_vectorstore(chunks, doc_id)

    # Step 3: Extract key info using targeted questions
    questions = {
        "document_type": "What type of document is this? Answer in a short phrase.",
        "summary": "Summarize this document in 2 sentences.",
        "deadline": "Is there a payment deadline or due date? If yes state it exactly, if no say null.",
        "amount": "Is there a total amount to pay? If yes state it exactly with currency, if no say null.",
        "action_required": "What does the person need to do because of this document?",
    }

    results = {}
    for key, question in questions.items():
        context = retrieve(question, index, chunks)
        results[key] = ask_groq(context, question)

    # Step 4: Get all important items
    items_context = retrieve(
        "important dates amounts deadlines names references obligations",
        index, chunks, k=5
    )

    items_prompt = f"""From this document excerpt, list ALL important information as a JSON array.
Each item must have: label, value, priority (high/medium/low).
Examples: payment deadline, amount due, reference number, contract dates, names.

Document:
{items_context}

Return ONLY a JSON array like:
[{{"label": "...", "value": "...", "priority": "high"}}]"""

    raw_items = ask_groq(items_context, items_prompt)

    try:
        match = re.search(r'\[.*\]', raw_items, re.DOTALL)
        important_items = json.loads(match.group()) if match else []
    except Exception:
        important_items = []

    return {
        "document_type": results.get("document_type", "unknown"),
        "summary": results.get("summary", ""),
        "deadline": results.get("deadline"),
        "amount": results.get("amount"),
        "action_required": results.get("action_required"),
        "important_items": important_items,
        "text_length": len(text),
        "chunks_count": len(chunks)
    }


# ─────────────────────────────────────────────
# CHAT WITH DOCUMENT
# ─────────────────────────────────────────────
def chat_with_document(doc_id: str, question: str) -> str:
    """Answer a question about a previously uploaded document"""
    index, chunks = load_vectorstore(doc_id)
    if index is None:
        return "Document not found. Please upload it again."

    context = retrieve(question, index, chunks)
    return ask_groq(context, question)