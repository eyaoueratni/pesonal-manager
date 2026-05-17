import useDialogState from '@/hooks/use-dialog-state'
import React, { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { type Task } from '../data/schema'
import { deleteTasks, getTasks, toggleTaskComplete } from '../data/tasks'

type TasksDialogType = 'create' | 'update' | 'delete' | 'import'

type TasksContextType = {
  open: TasksDialogType | null
  setOpen: (str: TasksDialogType | null) => void
  currentRow: Task | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Task | null>>
  tasks: Task[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
  handleToggleComplete: (id: number) => Promise<void>
  handleDeleteSelected: (ids: number[]) => Promise<void>
}

const TasksContext = React.createContext<TasksContextType | null>(null)

export function TasksProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<TasksDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Task | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await getTasks()
      setTasks(data as Task[])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load tasks'
      setError(message)
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  const handleToggleComplete = useCallback(async (id: number) => {
    try {
      const updated = await toggleTaskComplete(id)
      setTasks((prev) => prev.map((t) => (t.id === id ? (updated as Task) : t)))
      toast.success((updated as Task).completed ? 'Task completed!' : 'Task reopened')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update task'
      toast.error(message)
    }
  }, [])

  const handleDeleteSelected = useCallback(async (ids: number[]) => {
    try {
      await deleteTasks(ids)
      setTasks((prev) => prev.filter((t) => !ids.includes(t.id)))
      toast.success(`${ids.length} task(s) deleted.`)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete tasks'
      toast.error(message)
    }
  }, [])

  return (
    <TasksContext
      value={{
        open,
        setOpen,
        currentRow,
        setCurrentRow,
        tasks,
        isLoading,
        error,
        refetch,
        handleToggleComplete,
        handleDeleteSelected,
      }}
    >
      {children}
    </TasksContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useTasks = () => {
  const tasksContext = React.useContext(TasksContext)
  if (!tasksContext) {
    throw new Error('useTasks has to be used within <TasksContext>')
  }
  return tasksContext
}