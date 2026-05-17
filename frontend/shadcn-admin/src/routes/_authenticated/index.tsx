import { useAuthStore } from '@/stores/auth-store'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/')({
  beforeLoad: () => {
    const user = useAuthStore.getState().user

    // Redirect based on role
    if (user?.role?.toLowerCase() === 'admin') {
      throw redirect({ to: '/admin' })      
    } else {
      throw redirect({ to: '/dashboard' })
    }
  },
})