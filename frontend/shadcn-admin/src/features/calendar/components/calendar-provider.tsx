import { type Task, type TaskCreate } from '@/features/tasks/data/schema'
import { createTask, deleteTask, getTasks, toggleTaskComplete, updateTask } from '@/features/tasks/data/tasks'
import { addDays, addMonths, addWeeks, subDays, subMonths, subWeeks } from 'date-fns'
import React, { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

export type CalendarView = 'month' | 'week' | 'day'

type CalendarContextType = {
  view: CalendarView
  setView: (v: CalendarView) => void
  currentDate: Date
  goNext: () => void
  goPrev: () => void
  goToday: () => void
  tasks: Task[]
  isLoading: boolean
  refetch: () => Promise<void>
  selectedTask: Task | null
  setSelectedTask: (t: Task | null) => void
  isDrawerOpen: boolean
  setIsDrawerOpen: (v: boolean) => void
  isCreating: boolean
  setIsCreating: (v: boolean) => void
  newTaskDate: Date | null
  setNewTaskDate: (d: Date | null) => void
  handleCreateTask: (data: TaskCreate) => Promise<void>
  handleUpdateTask: (id: number, data: TaskCreate) => Promise<void>
  handleDeleteTask: (id: number) => Promise<void>
  handleToggleComplete: (id: number) => Promise<void>
}

const CalendarContext = React.createContext<CalendarContextType | null>(null)

export function CalendarProvider({ children }: { children: React.ReactNode }) {
  const [view, setView] = useState<CalendarView>('month')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [newTaskDate, setNewTaskDate] = useState<Date | null>(null)

  const refetch = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await getTasks()
      setTasks(data as Task[])
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load tasks')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { refetch() }, [refetch])

  const goNext = () => {
    if (view === 'month') setCurrentDate(d => addMonths(d, 1))
    else if (view === 'week') setCurrentDate(d => addWeeks(d, 1))
    else setCurrentDate(d => addDays(d, 1))
  }

  const goPrev = () => {
    if (view === 'month') setCurrentDate(d => subMonths(d, 1))
    else if (view === 'week') setCurrentDate(d => subWeeks(d, 1))
    else setCurrentDate(d => subDays(d, 1))
  }

  const goToday = () => setCurrentDate(new Date())

  const handleCreateTask = async (data: TaskCreate) => {
    try {
      await createTask(data)
      await refetch()
      toast.success('Task created!')
      setIsDrawerOpen(false)
      setIsCreating(false)
      setNewTaskDate(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create task')
    }
  }

  const handleUpdateTask = async (id: number, data: TaskCreate) => {
    try {
      await updateTask(id, data)
      await refetch()
      toast.success('Task updated!')
      setIsDrawerOpen(false)
      setSelectedTask(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update task')
    }
  }

  const handleDeleteTask = async (id: number) => {
    try {
      await deleteTask(id)
      await refetch()
      toast.success('Task deleted!')
      setIsDrawerOpen(false)
      setSelectedTask(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete task')
    }
  }

  const handleToggleComplete = async (id: number) => {
    try {
      const updated = await toggleTaskComplete(id)
      setTasks(prev => prev.map(t => t.id === id ? updated as Task : t))
      toast.success((updated as Task).completed ? 'Task completed!' : 'Task reopened')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update task')
    }
  }

  return (
    <CalendarContext
      value={{
        view, setView,
        currentDate, goNext, goPrev, goToday,
        tasks, isLoading, refetch,
        selectedTask, setSelectedTask,
        isDrawerOpen, setIsDrawerOpen,
        isCreating, setIsCreating,
        newTaskDate, setNewTaskDate,
        handleCreateTask, handleUpdateTask, handleDeleteTask, handleToggleComplete,
      }}
    >
      {children}
    </CalendarContext>
  )
}

export const useCalendar = () => {
  const ctx = React.useContext(CalendarContext)
  if (!ctx) throw new Error('useCalendar must be used within <CalendarProvider>')
  return ctx
}