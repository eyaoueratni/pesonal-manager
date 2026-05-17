import { Documents } from '@/features/documents'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/documents/')({
  component: Documents,
})