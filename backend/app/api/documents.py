import os
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel

from app.database import get_db
from app.models.document import Document
from app.schemas.document import DocumentResponse, DocumentUpdate
from app.core.dependencies import get_current_user
from app.models.user import User
from app.services.rag_processor import process_document, chat_with_document

router = APIRouter(prefix="/documents", tags=["Documents"])

# Upload directory
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

ALLOWED_TYPES = {
    "application/pdf": "pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
    "image/jpeg": "image",
    "image/png": "image",
    "image/jpg": "image",
}

MAX_FILE_SIZE = 20 * 1024 * 1024  # 20MB


class ChatRequest(BaseModel):
    doc_id: str
    question: str


# ─────────────────────────────────────────────
# GET ALL DOCUMENTS
# ─────────────────────────────────────────────
@router.get("/", response_model=List[DocumentResponse])
def get_all_documents(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all documents for current user"""
    return db.query(Document).filter(Document.user_id == current_user.id).all()


# ─────────────────────────────────────────────
# UPLOAD DOCUMENT + AI EXTRACTION
# ─────────────────────────────────────────────
@router.post("/", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upload a document, save it, and extract important info using RAG + Mistral.
    Supports PDF and DOCX only for AI extraction.
    """
    # Validate file type
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail="File type not allowed. Allowed: PDF, DOCX, JPG, PNG"
        )

    # Read file
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large. Max 20MB.")

    # Save file to disk
    user_dir = UPLOAD_DIR / str(current_user.id)
    user_dir.mkdir(exist_ok=True)

    file_path = user_dir / file.filename
    counter = 1
    while file_path.exists():
        stem = Path(file.filename).stem
        suffix = Path(file.filename).suffix
        file_path = user_dir / f"{stem}_{counter}{suffix}"
        counter += 1

    with open(file_path, "wb") as f:
        f.write(contents)

    # Run RAG extraction for PDF and DOCX only
    extracted_data = None
    file_type = ALLOWED_TYPES[file.content_type]

    if file_type in ["pdf", "docx"]:
        doc_id = f"{current_user.id}_{file.filename.replace(' ', '_')}"
        extracted_data = process_document(contents, file.filename, doc_id)

    # Save to DB
    doc = Document(
        title=Path(file.filename).stem,
        original_filename=file.filename,
        file_path=str(file_path),
        file_type=file_type,
        file_size=len(contents),
        summary=extracted_data.get("summary") if extracted_data else None,
        summary_status="done" if extracted_data else "pending",
        extracted_data=extracted_data if extracted_data else None,
        user_id=current_user.id,
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc


# ─────────────────────────────────────────────
# GET SINGLE DOCUMENT
# ─────────────────────────────────────────────
@router.get("/{doc_id}", response_model=DocumentResponse)
def get_document(
    doc_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a single document by ID"""
    doc = db.query(Document).filter(
        Document.id == doc_id,
        Document.user_id == current_user.id
    ).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc


# ─────────────────────────────────────────────
# DOWNLOAD DOCUMENT
# ─────────────────────────────────────────────
@router.get("/{doc_id}/download")
def download_document(
    doc_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Download the original file"""
    doc = db.query(Document).filter(
        Document.id == doc_id,
        Document.user_id == current_user.id
    ).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    if not Path(doc.file_path).exists():
        raise HTTPException(status_code=404, detail="File not found on disk")
    return FileResponse(
        path=doc.file_path,
        filename=doc.original_filename,
        media_type="application/octet-stream"
    )


# ─────────────────────────────────────────────
# UPDATE DOCUMENT
# ─────────────────────────────────────────────
@router.put("/{doc_id}", response_model=DocumentResponse)
def update_document(
    doc_id: int,
    doc_update: DocumentUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update document title or other fields"""
    doc = db.query(Document).filter(
        Document.id == doc_id,
        Document.user_id == current_user.id
    ).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    for field, value in doc_update.dict(exclude_unset=True).items():
        setattr(doc, field, value)
    db.commit()
    db.refresh(doc)
    return doc


# ─────────────────────────────────────────────
# DELETE DOCUMENT
# ─────────────────────────────────────────────
@router.delete("/{doc_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(
    doc_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete document and file from disk"""
    doc = db.query(Document).filter(
        Document.id == doc_id,
        Document.user_id == current_user.id
    ).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    file_path = Path(doc.file_path)
    if file_path.exists():
        file_path.unlink()

    db.delete(doc)
    db.commit()
    return None


# ─────────────────────────────────────────────
# AI CHAT WITH DOCUMENT
# ─────────────────────────────────────────────
@router.post("/chat")
async def chat_with_doc(
    request: ChatRequest,
    current_user: User = Depends(get_current_user)
):
    """Ask a question about a previously uploaded document"""
    answer = chat_with_document(request.doc_id, request.question)
    return {"answer": answer}


# ─────────────────────────────────────────────
# RE-EXTRACT (trigger AI extraction again)
# ─────────────────────────────────────────────
@router.post("/{doc_id}/extract", response_model=DocumentResponse)
async def extract_document(
    doc_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Re-run AI extraction on an existing document"""
    doc = db.query(Document).filter(
        Document.id == doc_id,
        Document.user_id == current_user.id
    ).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    file_path = Path(doc.file_path)
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found on disk")

    if doc.file_type not in ["pdf", "docx"]:
        raise HTTPException(
            status_code=400,
            detail="AI extraction only works on PDF and DOCX files"
        )

    with open(file_path, "rb") as f:
        contents = f.read()

    rag_doc_id = f"{current_user.id}_{doc.original_filename.replace(' ', '_')}"
    extracted_data = process_document(contents, doc.original_filename, rag_doc_id)

    doc.summary = extracted_data.get("summary")
    doc.summary_status = "done"
    doc.extracted_data = str(extracted_data)
    db.commit()
    db.refresh(doc)
    return doc


# ─────────────────────────────────────────────
# TEST OLLAMA
# ─────────────────────────────────────────────
@router.get("/test-ollama")
async def test_ollama():
    """Check if Ollama and Mistral are running"""
    import requests
    try:
        response = requests.get("http://localhost:11434/api/tags", timeout=5)
        models = response.json().get("models", [])
        model_names = [m["name"] for m in models]
        return {
            "ollama_running": True,
            "available_models": model_names,
            "mistral_ready": any("mistral" in m for m in model_names)
        }
    except Exception as e:
        return {"ollama_running": False, "error": str(e)}