import { type Document } from './schema'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

function getAuthHeaders(): HeadersInit {
  try {
    const raw = localStorage.getItem('auth-storage')
    const parsed = raw ? JSON.parse(raw) : null
    const token = parsed?.state?.token
    return {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }
  } catch {
    return {}
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(error.detail ?? 'Something went wrong')
  }
  if (res.status === 204) return undefined as T
  return res.json()
}

export async function getDocuments(): Promise<Document[]> {
  const res = await fetch(`${API_BASE}/documents/`, {
    headers: getAuthHeaders(),
  })
  return handleResponse<Document[]>(res)
}

export async function uploadDocument(file: File): Promise<Document> {
  const formData = new FormData()
  formData.append('file', file)
  const res = await fetch(`${API_BASE}/documents/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: formData,
  })
  return handleResponse<Document>(res)
}

export async function deleteDocument(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/documents/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })
  return handleResponse<void>(res)
}

export async function updateDocument(id: number, title: string): Promise<Document> {
  const res = await fetch(`${API_BASE}/documents/${id}`, {
    method: 'PUT',
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  })
  return handleResponse<Document>(res)
}

export async function extractDocument(id: number): Promise<Document> {
  const res = await fetch(`${API_BASE}/documents/${id}/extract`, {
    method: 'POST',
    headers: getAuthHeaders(),
  })
  return handleResponse<Document>(res)
}

export async function chatWithDocument(
  docId: string,
  question: string
): Promise<{ answer: string }> {
  const res = await fetch(`${API_BASE}/documents/chat`, {
    method: 'POST',
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ doc_id: docId, question }),
  })
  return handleResponse<{ answer: string }>(res)
}

export function getDownloadUrl(id: number): string {
  return `${API_BASE}/documents/${id}/download`
}