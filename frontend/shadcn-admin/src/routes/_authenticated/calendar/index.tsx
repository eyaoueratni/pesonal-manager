import { Calendar } from '@/features/calendar'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/calendar/')({
  component: Calendar,
})
