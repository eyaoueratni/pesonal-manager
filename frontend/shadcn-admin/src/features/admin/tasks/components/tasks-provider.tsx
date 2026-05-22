import { type AdminTask } from '@/features/admin/data/schema'
import { getAdminTasks } from '@/lib/admin-api'
import React, { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

interface TasksContextType {
  tasks: AdminTask[]
  loading: boolean
  error: string | null
  refetch: () => void
}

const TasksContext = React.createContext<TasksContextType | null>(null)

export function TasksProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<AdminTask[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getAdminTasks()
      setTasks(data)
    } catch (err) {
      console.error('Failed to fetch tasks:', err)
      setError('Failed to load tasks')
      toast.error('Failed to load tasks')
      setTasks([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  return (
    <TasksContext.Provider value={{ tasks, loading, error, refetch: fetchTasks }}>
      {children}
    </TasksContext.Provider>
  )
}

export const useTasks = () => {
  const context = React.useContext(TasksContext)
  if (!context) {
    throw new Error('useTasks has to be used within <TasksProvider>')
  }
  return context
}