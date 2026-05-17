import { Tasks } from '@/features/tasks'
import { completionStatuses, priorities } from '@/features/tasks/data/data'
import { createFileRoute } from '@tanstack/react-router'
import z from 'zod'

const taskSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  completed: z
    .array(z.enum(completionStatuses.map((s) => s.value) as [string, ...string[]]))
    .optional()
    .catch([]),
  priority: z
    .array(z.enum(priorities.map((p) => p.value) as [string, ...string[]]))
    .optional()
    .catch([]),
  filter: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/tasks/')({
  validateSearch: taskSearchSchema,
  component: Tasks,
})