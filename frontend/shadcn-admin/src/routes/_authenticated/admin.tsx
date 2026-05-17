import { DashboardAdmin } from '@/features/dashboard-admin'
import { useAuthStore } from '@/stores/auth-store'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/admin')({
  beforeLoad: () => {
    const user = useAuthStore.getState().user
    if (user?.role?.toLowerCase() !== 'admin') {
      throw redirect({ to: '/admin' })
    }
  },
  component: DashboardAdmin,
})