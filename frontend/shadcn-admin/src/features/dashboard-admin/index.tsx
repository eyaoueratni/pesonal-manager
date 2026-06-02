import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  getAdminDocuments,
  getAdminTasks,
  getDocumentsStats,
  getTasksStats,
  getUsers,
  type AdminDocument,
  type AdminTask,
  type AdminUser,
  type DocStats,
  type TaskStats,
} from '@/lib/admin-api'
import { useAuthStore } from '@/stores/auth-store'
import { useSearch } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

export function DashboardAdmin() {
  const user = useAuthStore((state) => state.user)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [tasks, setTasks] = useState<AdminTask[]>([])
  const [documents, setDocuments] = useState<AdminDocument[]>([])
  const [taskStats, setTaskStats] = useState<TaskStats>({ total: 0, completed: 0, pending: 0 })
  const [docStats, setDocStats] = useState<DocStats>({ total: 0, processed: 0, pending: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const search = useSearch({ strict: false }) as { tab?: string }

  useEffect(() => {
    fetchAll()
  }, [])

  const fetchAll = async () => {
    try {
      setLoading(true)
      setError(null)
      const [u, ts, ds, t, d] = await Promise.all([
        getUsers(),
        getTasksStats(),
        getDocumentsStats(),
        getAdminTasks(),
        getAdminDocuments(),
      ])
      setUsers(u)
      setTaskStats(ts)
      setDocStats(ds)
      setTasks(t)
      setDocuments(d)
    } catch (err) {
      setError('Failed to load admin data.')
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

        {/* ── Tabs ── */}
        <Tabs defaultValue={search.tab || 'tasks'}>
          <TabsList className='mb-4'>
            <TabsTrigger value='tasks'>📝 All Tasks</TabsTrigger>
            <TabsTrigger value='documents'>📄 All Documents</TabsTrigger>
            <TabsTrigger value='users'>👥 Users</TabsTrigger>
          </TabsList>

          {/* ── Tasks Tab ── */}
          <TabsContent value='tasks'>
            <div className='rounded-md border overflow-hidden'>
              <table className='w-full text-sm'>
                <thead className='bg-muted'>
                  <tr>
                    <th className='p-3 text-left font-medium'>Title</th>
                    <th className='p-3 text-left font-medium'>Category</th>
                    <th className='p-3 text-left font-medium'>Priority</th>
                    <th className='p-3 text-left font-medium'>Status</th>
                    <th className='p-3 text-left font-medium'>User ID</th>
                    <th className='p-3 text-left font-medium'>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.length === 0 ? (
                    <tr>
                      <td colSpan={6} className='p-3 text-center text-muted-foreground'>
                        No tasks found.
                      </td>
                    </tr>
                  ) : (
                    tasks.map((task) => (
                      <tr key={task.id} className='border-t hover:bg-muted/50'>
                        <td className='p-3 font-medium'>{task.title}</td>
                        <td className='p-3 capitalize'>{task.category}</td>
                        <td className='p-3 capitalize'>{task.priority}</td>
                        <td className='p-3'>
                          {task.completed ? (
                            <span className='text-green-600 font-medium'>✅ Completed</span>
                          ) : (
                            <span className='text-orange-500 font-medium'>⏳ Pending</span>
                          )}
                        </td>
                        <td className='p-3 text-muted-foreground'>{task.user_id}</td>
                        <td className='p-3 text-muted-foreground'>
                          {new Date(task.created_at).toLocaleDateString('en-GB')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* ── Documents Tab ── */}
          <TabsContent value='documents'>
            <div className='rounded-md border overflow-hidden'>
              <table className='w-full text-sm'>
                <thead className='bg-muted'>
                  <tr>
                    <th className='p-3 text-left font-medium'>Title</th>
                    <th className='p-3 text-left font-medium'>File Type</th>
                    <th className='p-3 text-left font-medium'>Status</th>
                    <th className='p-3 text-left font-medium'>User ID</th>
                    <th className='p-3 text-left font-medium'>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.length === 0 ? (
                    <tr>
                      <td colSpan={5} className='p-3 text-center text-muted-foreground'>
                        No documents found.
                      </td>
                    </tr>
                  ) : (
                    documents.map((doc) => (
                      <tr key={doc.id} className='border-t hover:bg-muted/50'>
                        <td className='p-3 font-medium'>{doc.title}</td>
                        <td className='p-3 uppercase'>{doc.file_type}</td>
                        <td className='p-3'>
                          {doc.summary_status === 'completed' ? (
                            <span className='text-green-600 font-medium'>✅ Processed</span>
                          ) : (
                            <span className='text-orange-500 font-medium'>⏳ Pending</span>
                          )}
                        </td>
                        <td className='p-3 text-muted-foreground'>{doc.user_id}</td>
                        <td className='p-3 text-muted-foreground'>
                          {new Date(doc.created_at).toLocaleDateString('en-GB')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* ── Users Tab ── */}
          <TabsContent value='users'>
            <div className='rounded-md border overflow-hidden'>
              <table className='w-full text-sm'>
                <thead className='bg-muted'>
                  <tr>
                    <th className='p-3 text-left font-medium'>Username</th>
                    <th className='p-3 text-left font-medium'>Email</th>
                    <th className='p-3 text-left font-medium'>Role</th>
                    <th className='p-3 text-left font-medium'>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={4} className='p-3 text-center text-muted-foreground'>
                        No users found.
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u.id} className='border-t hover:bg-muted/50'>
                        <td className='p-3 font-medium'>{u.username}</td>
                        <td className='p-3 text-muted-foreground'>{u.email}</td>
                        <td className='p-3 capitalize'>{u.role}</td>
                        <td className='p-3'>
                          {u.is_active ? (
                            <span className='text-green-600 font-medium'>✅ Active</span>
                          ) : (
                            <span className='text-red-500 font-medium'>❌ Inactive</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </Main>
    </>
  )
}