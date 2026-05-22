import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const getHeaders = () => {
  const authStorage = localStorage.getItem('auth-storage')
  const token = authStorage ? JSON.parse(authStorage).state?.token : null
  return {
    Authorization: `Bearer ${token}`,
  }
}
export interface AdminUser {
  id: number
  username: string
  email: string
  role: string
  is_active: boolean
}

export interface AdminTask {
  id: number
  title: string
  category: string
  priority: string
  completed: boolean
  user_id: number
  created_at: string
}

export interface AdminDocument {
  id: number
  title: string
  file_type: string
  summary_status: string
  user_id: number
  created_at: string
}

export interface TaskStats {
  total: number
  completed: number
  pending: number
}

export interface DocStats {
  total: number
  processed: number
  pending: number
}

// ── Users ──────────────────────────────────────────────────────
export const getUsers = async (): Promise<AdminUser[]> => {
  const res = await axios.get(`${API_URL}/admin/users`, { headers: getHeaders() })
  return res.data
}

export const deleteUser = async (userId: number): Promise<void> => {
  await axios.delete(`${API_URL}/admin/users/${userId}`, { headers: getHeaders() })
}

export const activateUser = async (userId: number): Promise<void> => {
  await axios.patch(`${API_URL}/admin/users/${userId}/activate`, {}, { headers: getHeaders() })
}

export const deactivateUser = async (userId: number): Promise<void> => {
  await axios.patch(`${API_URL}/admin/users/${userId}/deactivate`, {}, { headers: getHeaders() })
}

// ── Tasks ──────────────────────────────────────────────────────
export const getAdminTasks = async (): Promise<AdminTask[]> => {
  const res = await axios.get(`${API_URL}/admin/tasks`, { headers: getHeaders() })
  return res.data
}

export const getTasksStats = async (): Promise<TaskStats> => {
  const res = await axios.get(`${API_URL}/admin/tasks/stats`, { headers: getHeaders() })
  return res.data
}

// ── Documents ──────────────────────────────────────────────────
export const getAdminDocuments = async (): Promise<AdminDocument[]> => {
  const res = await axios.get(`${API_URL}/admin/documents`, { headers: getHeaders() })
  return res.data
}

export const getDocumentsStats = async (): Promise<DocStats> => {
  const res = await axios.get(`${API_URL}/admin/documents/stats`, { headers: getHeaders() })
  return res.data
}

export const deleteDocument = async (documentId: number): Promise<void> => {
  await axios.delete(`${API_URL}/admin/documents/${documentId}`, { headers: getHeaders() })
}