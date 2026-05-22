import { Finance } from '@/features/finance'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/finance/')({
  component: Finance,
})