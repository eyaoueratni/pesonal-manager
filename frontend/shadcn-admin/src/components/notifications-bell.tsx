import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  deleteNotification,
  getNotifications,
  getUnreadCount,
  markAllAsRead,
  markAsRead,
  type Notification,
} from '@/lib/notifications-api'
import { Bell } from 'lucide-react'
import { useEffect, useState } from 'react'

export function NotificationsBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    fetchUnreadCount()
    // Poll every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchUnreadCount = async () => {
    try {
      const count = await getUnreadCount()
      setUnreadCount(count)
    } catch {
      console.error('Failed to fetch unread count')
    }
  }

  const fetchNotifications = async () => {
    try {
      const data = await getNotifications()
      setNotifications(data)
    } catch {
      console.error('Failed to fetch notifications')
    }
  }

  const handleOpen = (isOpen: boolean) => {
    setOpen(isOpen)
    if (isOpen) fetchNotifications()
  }

  const handleMarkAsRead = async (id: number) => {
    await markAsRead(id)
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    )
    setUnreadCount((prev) => Math.max(0, prev - 1))
  }

  const handleMarkAllAsRead = async () => {
    await markAllAsRead()
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    setUnreadCount(0)
  }

  const handleDelete = async (id: number) => {
    await deleteNotification(id)
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-100 text-green-700'
      case 'warning': return 'bg-yellow-100 text-yellow-700'
      case 'error': return 'bg-red-100 text-red-700'
      default: return 'bg-blue-100 text-blue-700'
    }
  }

  return (
    <Popover open={open} onOpenChange={handleOpen}>
      <PopoverTrigger asChild>
        <Button variant='outline' size='icon' className='relative'>
          <Bell className='h-4 w-4' />
          {unreadCount > 0 && (
            <span className='absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white'>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className='w-80 p-0' align='end'>
        {/* Header */}
        <div className='flex items-center justify-between p-4 border-b'>
          <h3 className='font-semibold'>Notifications</h3>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className='text-xs text-blue-600 hover:underline'
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* List */}
        <div className='max-h-80 overflow-y-auto'>
          {notifications.length === 0 ? (
            <div className='p-4 text-center text-sm text-muted-foreground'>
              No notifications
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`flex items-start gap-3 p-3 border-b hover:bg-muted/50 ${
                  !n.is_read ? 'bg-muted/30' : ''
                }`}
              >
                <div className='flex-1'>
                  <div className='flex items-center gap-2 mb-1'>
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${getTypeColor(n.notification_type)}`}
                    >
                      {n.notification_type}
                    </span>
                    {!n.is_read && (
                      <span className='h-2 w-2 rounded-full bg-blue-500' />
                    )}
                  </div>
                  <p className='text-sm font-medium'>{n.title}</p>
                  <p className='text-xs text-muted-foreground'>{n.message}</p>
                  <p className='text-xs text-muted-foreground mt-1'>
                    {new Date(n.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className='flex flex-col gap-1'>
                  {!n.is_read && (
                    <button
                      onClick={() => handleMarkAsRead(n.id)}
                      className='text-xs text-blue-600 hover:underline'
                    >
                      Read
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(n.id)}
                    className='text-xs text-red-500 hover:underline'
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}