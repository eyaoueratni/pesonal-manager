import { deleteNotification, getNotifications, markAllAsRead, type Notification } from '@/lib/notifications-api'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

function getTypeColor(type: string) {
  switch (type) {
    case 'success': return 'bg-green-100 text-green-700'
    case 'warning': return 'bg-yellow-100 text-yellow-700'
    case 'error': return 'bg-red-100 text-red-700'
    default: return 'bg-blue-100 text-blue-700'
  }
}

function getTypeIcon(type: string) {
  switch (type) {
    case 'success': return '✅'
    case 'warning': return '⚠️'
    case 'error': return '❌'
    default: return 'ℹ️'
  }
}

export function NotificationsForm() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const data = await getNotifications()
      setNotifications(data)
    } catch {
      toast.error('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
      toast.success('All notifications marked as read')
    } catch {
      toast.error('Failed to mark as read')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteNotification(id)
      setNotifications((prev) => prev.filter((n) => n.id !== id))
      toast.success('Notification deleted')
    } catch {
      toast.error('Failed to delete notification')
    }
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length

  return (
    <div className='space-y-4'>
      
      <div className='flex items-center justify-between'>
        <div>
          <p className='text-sm text-muted-foreground'>
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}.`
              : 'All notifications have been read.'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className='text-sm text-blue-600 hover:underline'
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* List */}
      {loading ? (
        <p className='text-sm text-muted-foreground'>Loading...</p>
      ) : notifications.length === 0 ? (
        <div className='flex flex-col items-center justify-center py-16 text-center'>
          <span className='text-4xl mb-3'>🔔</span>
          <p className='text-sm font-medium'>No notifications yet</p>
          <p className='text-xs text-muted-foreground mt-1'>
            You'll see notifications here when something happens.
          </p>
        </div>
      ) : (
        <div className='space-y-2'>
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`flex items-start gap-3 rounded-lg border p-4 transition-colors ${
                !n.is_read ? 'bg-muted/40' : 'bg-background'
              }`}
            >
              <span className='text-xl mt-0.5'>{getTypeIcon(n.notification_type)}</span>
              <div className='flex-1 min-w-0'>
                <div className='flex items-center gap-2 mb-1'>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getTypeColor(n.notification_type)}`}>
                    {n.notification_type}
                  </span>
                  {!n.is_read && (
                    <span className='h-2 w-2 rounded-full bg-blue-500 flex-shrink-0' />
                  )}
                </div>
                <p className='text-sm font-medium'>{n.title}</p>
                <p className='text-xs text-muted-foreground mt-0.5'>{n.message}</p>
                <p className='text-xs text-muted-foreground mt-1'>
                  {new Date(n.created_at).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <button
                onClick={() => handleDelete(n.id)}
                className='text-xs text-muted-foreground hover:text-red-500 transition-colors flex-shrink-0'
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}