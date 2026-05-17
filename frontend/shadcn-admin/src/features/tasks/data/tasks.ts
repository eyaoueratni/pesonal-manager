const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

function getAuthHeaders(): HeadersInit {
  try {
    const raw = localStorage.getItem('auth-storage')
    const parsed = raw ? JSON.parse(raw) : null
    const token = parsed?.state?.token
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }
  } catch {
    return { 'Content-Type': 'application/json' }
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }))
    // Pass through the backend error message directly (includes conflict details)
    throw new Error(error.detail ?? 'Something went wrong')
  }
  if (res.status === 204) return undefined as T
  return res.json()
}

export async function getTasks() {
  const res = await fetch(`${API_BASE}/tasks/`, { headers: getAuthHeaders() })
  return handleResponse(res)
}

export async function getTask(id: number) {
  const res = await fetch(`${API_BASE}/tasks/${id}`, { headers: getAuthHeaders() })
  return handleResponse(res)
}

export async function createTask(data: unknown) {
  const res = await fetch(`${API_BASE}/tasks/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  })
  return handleResponse(res)
}

export async function updateTask(id: number, data: unknown) {
  const res = await fetch(`${API_BASE}/tasks/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  })
  return handleResponse(res)
}

export async function updateFutureTasks(id: number, data: unknown) {
  const res = await fetch(`${API_BASE}/tasks/${id}/future`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  })
  return handleResponse(res)
}

export async function deleteTask(id: number) {
  const res = await fetch(`${API_BASE}/tasks/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })
  return handleResponse(res)
}

export async function toggleTaskComplete(id: number) {
  const res = await fetch(`${API_BASE}/tasks/${id}/complete`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
  })
  return handleResponse(res)
}

export async function deleteTasks(ids: number[]) {
  await Promise.all(ids.map(deleteTask))
}