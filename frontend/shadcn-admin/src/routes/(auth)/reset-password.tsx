import { ResetPasswordForm } from '@/features/auth/reset-password/reset-password'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(auth)/reset-password')({
  component: ResetPasswordForm,
})