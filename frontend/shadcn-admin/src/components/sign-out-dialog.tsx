import { ConfirmDialog } from '@/components/confirm-dialog'
import { authAPI } from '@/lib/api'; // Add this
import { useAuthStore } from '@/stores/auth-store'
import { useLocation, useNavigate } from '@tanstack/react-router'

interface SignOutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SignOutDialog({ open, onOpenChange }: SignOutDialogProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const reset = useAuthStore((state) => state.reset)  // ✅ Fixed: direct reset()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  const handleSignOut = async () => {
    try {
      // Optional: Call backend logout (stateless JWT, so mostly UI feedback)
      await authAPI.logout().catch(() => {
        // Ignore errors - still logout locally
      })
    } catch (error) {
      // Ignore backend errors
    } finally {
      // 1. Clear auth state (clears localStorage too via zustand persist)
      reset()

      // 2. Redirect to sign-in with current location preserved
      const currentPath = location.href
      navigate({
        to: '/sign-in',
        search: { redirect: currentPath },
        replace: true,
      })
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Sign out"
      desc="Are you sure you want to sign out? You will need to sign in again to access your account."
      confirmText="Sign out"
      destructive
      handleConfirm={handleSignOut}
      className="sm:max-w-sm"
    />
  )
}
