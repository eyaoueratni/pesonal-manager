import { Main } from '@/components/layout/main'
import { PageHeader } from '@/components/layout/page-header'
import { adminAPI } from '@/lib/api'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { TasksTable } from './components/tasks-table'

export function AdminTasks() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const search = useSearch({ strict: false })
  const navigate = useNavigate()

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const response = await adminAPI.getAllTasks()
      setTasks(response.data)
    } catch {
      toast.error('Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <PageHeader />
      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>All Tasks</h2>
          <p className='text-muted-foreground'>
            View all tasks across all users — read only.
          </p>
        </div>

        {loading ? (
          <p className='text-muted-foreground text-sm'>Loading...</p>
        ) : (
          <TasksTable
            data={tasks}
            search={search}
            navigate={navigate}
          />
        )}
      </Main>
    </>
  )
}