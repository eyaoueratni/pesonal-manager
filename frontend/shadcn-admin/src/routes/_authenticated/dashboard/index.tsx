// src/routes/_authenticated/dashboard/index.tsx
import { Dashboard } from '@/features/dashboard'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/dashboard/')({
  component: Dashboard,
})