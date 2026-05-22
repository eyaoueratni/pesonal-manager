import { ForgotPasswordForm } from '@/features/auth/forgot-password/components/forgot-password-form'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(auth)/forgot-password')({
  component: ForgotPasswordForm,
})