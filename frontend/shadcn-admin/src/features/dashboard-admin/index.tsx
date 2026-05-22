import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  getDocumentsStats,
  getTasksStats,
  getUsers,
  type AdminUser,
  type DocStats,
  type TaskStats,
} from '@/lib/admin-api'
import { useAuthStore } from '@/stores/auth-store'
import { useEffect, useState } from 'react'

export function DashboardAdmin() {
  const user = useAuthStore((state) => state.user)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [taskStats, setTaskStats] = useState<TaskStats>({ total: 0, completed: 0, pending: 0 })
  const [docStats, setDocStats] = useState<DocStats>({ total: 0, processed: 0, pending: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAll()
  }, [])

  const fetchAll = async () => {
    try {
      setLoading(true)
      setError(null)
      const [u, ts, ds] = await Promise.all([
        getUsers(),
        getTasksStats(),
        getDocumentsStats(),
      ])
      setUsers(u)
      setTaskStats(ts)
      setDocStats(ds)
    } catch (err) {
      setError('Failed to load admin data. Make sure you have admin privileges.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <>
        <Header>
          <h1 className='text-2xl font-bold tracking-tight'>Admin Dashboard</h1>
        </Header>
        <Main>
          <p className='text-muted-foreground'>Loading...</p>
        </Main>
      </>
    )
  }

  if (error) {
    return (
      <>
        <Header>
          <h1 className='text-2xl font-bold tracking-tight'>Admin Dashboard</h1>
        </Header>
        <Main>
          <p className='text-red-500'>{error}</p>
        </Main>
      </>
    )
  }

  return (
    <>
      <Header>
        <div className='flex items-center justify-between w-full'>
          <h1 className='text-2xl font-bold tracking-tight'>Admin Dashboard</h1>
          <span className='text-sm text-muted-foreground'>
            Welcome, {user?.username}
          </span>
        </div>
      </Header>

      <Main>
        {/* ── Overview ── */}
        <div className='mb-6'>
          <h2 className='text-xl font-semibold'>System Overview</h2>
          <p className='text-muted-foreground'>
            Monitor and manage your application
          </p>
        </div>

        {/* ── Stats Cards ── */}
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8'>
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium'>Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{users.length}</div>
              <p className='text-xs text-muted-foreground'>
                {users.filter((u) => u.is_active).length} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium'>Total Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{taskStats.total}</div>
              <p className='text-xs text-muted-foreground'>
                {taskStats.completed} completed · {taskStats.pending} pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium'>Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{docStats.total}</div>
              <p className='text-xs text-muted-foreground'>
                {docStats.processed} processed · {docStats.pending} pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium'>Active Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {users.filter((u) => u.is_active).length}
              </div>
              <p className='text-xs text-muted-foreground'>Currently active</p>
            </CardContent>
          </Card>
        </div>

        {/* ── Quick Actions ── */}
        <div>
          <h2 className='text-xl font-bold mb-4'>Quick Actions</h2>
          <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
            <Card className='cursor-pointer hover:bg-accent transition-colors'>
              <CardHeader>
                <CardTitle className='text-base flex items-center gap-2'>
                  <span>👥</span> Manage Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-sm text-muted-foreground'>
                  {users.length} registered users
                </p>
              </CardContent>
            </Card>

            <Card className='cursor-pointer hover:bg-accent transition-colors'>
              <CardHeader>
                <CardTitle className='text-base flex items-center gap-2'>
                  <span>📝</span> View Tasks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-sm text-muted-foreground'>
                  {taskStats.total} total tasks
                </p>
              </CardContent>
            </Card>

            <Card className='cursor-pointer hover:bg-accent transition-colors'>
              <CardHeader>
                <CardTitle className='text-base flex items-center gap-2'>
                  <span>📄</span> View Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-sm text-muted-foreground'>
                  {docStats.total} total documents
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </Main>
    </>
  )
}