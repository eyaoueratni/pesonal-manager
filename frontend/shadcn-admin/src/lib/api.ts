import { useAuthStore } from '@/stores/auth-store'
import axios, { type AxiosError } from 'axios'

// ✅ LOCALHOST
const API_URL = 'http://127.0.0.1:8000'

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ✅ Add token to every request
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Handle 401 errors (token expired)
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().reset()
      window.location.href = '/sign-in'
    }
    return Promise.reject(error)
  }
)

// Auth endpoints
export const authAPI = {
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),

  register: (data: {
    username: string
    email: string
    password: string
  }) => api.post('/auth/register', data),

  logout: () => api.post('/auth/logout'),
}

// User endpoints
export const userAPI = {
  getMe: () => api.get('/users/me'),
  updateProfile: (data: { username?: string; email?: string }) => 
    api.put('/users/me', data),
  changePassword: (data: { current_password: string; new_password: string }) => 
    api.post('/auth/change-password', data),
  deleteAccount: () => api.delete('/users/me'),
}

// Task endpoints
export const taskAPI = {
  getAll: () => api.get('/tasks/'),
  create: (data: unknown) => api.post('/tasks/', data),
  update: (id: number, data: unknown) => api.put(`/tasks/${id}`, data),
  delete: (id: number) => api.delete(`/tasks/${id}`),
  toggleComplete: (id: number) => api.patch(`/tasks/${id}/complete`),
}

// Admin endpoints
export const adminAPI = {
  getAllUsers: () => api.get('/admin/users'),
  getUser: (id: number) => api.get(`/admin/users/${id}`),
  createUser: (data: unknown) => api.post('/admin/users', data),
  updateUser: (id: number, data: unknown) => api.patch(`/admin/users/${id}`, data),
  deleteUser: (id: number) => api.delete(`/admin/users/${id}`),
  activateUser: (id: number) => api.patch(`/admin/users/${id}/activate`),
  deactivateUser: (id: number) => api.patch(`/admin/users/${id}/deactivate`),
  getAllTasks: () => api.get('/admin/tasks'),
}

// Document endpoints (for future use)
export const documentAPI = {
  getAll: () => api.get('/documents/'),
  upload: (formData: FormData) => api.post('/documents/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id: number) => api.delete(`/documents/${id}`),
  chat: (doc_id: string, question: string) => api.post('/documents/chat', { doc_id, question }),
}

export default api