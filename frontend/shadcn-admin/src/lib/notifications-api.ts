const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const getHeaders = () => {
  const authStorage = localStorage.getItem('auth-storage')
  const token = authStorage ? JSON.parse(authStorage).state?.token : null
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
}

export interface Notification {
  id: number
  title: string
  message: string
  is_read: boolean
  notification_type: string
  created_at: string
}

export const getNotifications = async (): Promise<Notification[]> => {
  const res = await fetch(`${API_URL}/notifications/`, { headers: getHeaders() })
  return res.json()
}

export const getUnreadCount = async (): Promise<number> => {
  const res = await fetch(`${API_URL}/notifications/unread-count`, { headers: getHeaders() })
  const data = await res.json()
  return data.count
}

export const markAsRead = async (id: number): Promise<void> => {
  await fetch(`${API_URL}/notifications/${id}/read`, {
    method: 'PUT',
    headers: getHeaders(),
  })
}

export const markAllAsRead = async (): Promise<void> => {
  await fetch(`${API_URL}/notifications/read-all`, {
    method: 'PUT',
    headers: getHeaders(),
  })
}

export const deleteNotification = async (id: number): Promise<void> => {
  await fetch(`${API_URL}/notifications/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  })
}