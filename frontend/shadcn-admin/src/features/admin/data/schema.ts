import { z } from 'zod'

export const adminTaskSchema = z.object({
  id: z.number(),
  title: z.string(),
  category: z.string(),
  priority: z.string(),
  completed: z.boolean(),
  user_id: z.number(),
  created_at: z.string(),
  start_time: z.string(),
  end_time: z.string(),
})

export type AdminTask = z.infer<typeof adminTaskSchema>