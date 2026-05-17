import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/stores/auth-store'

export function DashboardAdmin() {
  const user = useAuthStore((state) => state.user)

  return (
    <>
      {/* ===== Top Heading ===== */}
      <Header>
        <div className='flex items-center justify-between w-full'>
          <h1 className='text-2xl font-bold tracking-tight'>
            Admin Dashboard 
          </h1>
          <div className='flex items-center space-x-2'>
            <span className='text-sm text-muted-foreground'>
              Welcome, {user?.username}
            </span>
          </div>
        </div>
      </Header>

      {/* ===== Main ===== */}
      <Main>
        <div className='mb-6'>
          <h2 className='text-xl font-semibold'>System Overview</h2>
          <p className='text-muted-foreground'>
            Manage users, monitor system, and configure settings
          </p>
        </div>

        {/* Admin Stats */}
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Total Users
              </CardTitle>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                className='h-4 w-4 text-muted-foreground'
              >
                <path d='M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' />
                <circle cx='9' cy='7' r='4' />
                <path d='M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75' />
              </svg>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>0</div>
              <p className='text-xs text-muted-foreground'>
                Registered users
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Total Tasks
              </CardTitle>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                className='h-4 w-4 text-muted-foreground'
              >
                <path d='M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' />
              </svg>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>0</div>
              <p className='text-xs text-muted-foreground'>
                Across all users
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Documents
              </CardTitle>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                className='h-4 w-4 text-muted-foreground'
              >
                <rect width='20' height='14' x='2' y='5' rx='2' />
                <path d='M2 10h20' />
              </svg>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>0</div>
              <p className='text-xs text-muted-foreground'>
                Total files stored
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                AI Queries
              </CardTitle>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                className='h-4 w-4 text-muted-foreground'
              >
                <path d='M22 12h-4l-3 9L9 3l-3 9H2' />
              </svg>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>0</div>
              <p className='text-xs text-muted-foreground'>
                Total requests
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Admin Actions */}
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
                  View and manage all users
                </p>
              </CardContent>
            </Card>

            <Card className='cursor-pointer hover:bg-accent transition-colors'>
              <CardHeader>
                <CardTitle className='text-base flex items-center gap-2'>
                  <span>📊</span> Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-sm text-muted-foreground'>
                  System statistics and reports
                </p>
              </CardContent>
            </Card>

            <Card className='cursor-pointer hover:bg-accent transition-colors'>
              <CardHeader>
                <CardTitle className='text-base flex items-center gap-2'>
                  <span>⚙️</span> Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-sm text-muted-foreground'>
                  Configure system settings
                </p>
              </CardContent>
            </Card>

            <Card className='cursor-pointer hover:bg-accent transition-colors'>
              <CardHeader>
                <CardTitle className='text-base flex items-center gap-2'>
                  <span>📝</span> System Logs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-sm text-muted-foreground'>
                  View activity logs
                </p>
              </CardContent>
            </Card>

            <Card className='cursor-pointer hover:bg-accent transition-colors'>
              <CardHeader>
                <CardTitle className='text-base flex items-center gap-2'>
                  <span>🔒</span> Security
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-sm text-muted-foreground'>
                  Security settings
                </p>
              </CardContent>
            </Card>

            <Card className='cursor-pointer hover:bg-accent transition-colors'>
              <CardHeader>
                <CardTitle className='text-base flex items-center gap-2'>
                  <span>🤖</span> AI Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-sm text-muted-foreground'>
                  Monitor AI usage
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </Main>
    </>
  )
}