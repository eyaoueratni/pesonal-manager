import { useAuthStore } from '@/stores/auth-store'
import axios, { type AxiosError } from 'axios'

const API_URL = 'http://178.105.159.62:30800'

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ✅ Single interceptor, reading correct key 'token'
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token // ← was 'accessToken', doesn't exist
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)
export const userAPI = {
  getMe: () => api.get('/users/me'),
  updateProfile: (data: { username?: string; email?: string }) => 
    api.put('/users/me', data),
changePassword: (data: { current_password: string; new_password: string }) => 
    api.post('/auth/change-password', data),
  deleteAccount: () => api.delete('/users/me'),
}
export const documentAPI = {
  getAll: () => api.get('/documents/'),
  upload: (formData: FormData) => api.post('/documents/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id: number) => api.delete(`/documents/${id}`),
  chat: (doc_id: string, question: string) => api.post('/documents/chat', { doc_id, question }),
}
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

export const taskAPI = {
  getAll: () => api.get('/tasks/'),
  create: (data: unknown) => api.post('/tasks/', data),
  update: (id: number, data: never) => api.put(`/tasks/${id}`, data),
  delete: (id: number) => api.delete(`/tasks/${id}`),
}

export const adminAPI = {
  getAllUsers: () => api.get('/admin/users'),
  getUser: (id: number) => api.get(`/admin/users/${id}`),
  createUser: (data: unknown) => api.post('/admin/users', data),  // ✅ add this
  updateUser: (id: number, data: unknown) => api.patch(`/admin/users/${id}`, data),
  deleteUser: (id: number) => api.delete(`/admin/users/${id}`),
  activateUser: (id: number) => api.patch(`/admin/users/${id}/activate`),
  deactivateUser: (id: number) => api.patch(`/admin/users/${id}/deactivate`),
}

export default api