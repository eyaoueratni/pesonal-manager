import { z } from 'zod'

export const taskSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string().nullable().optional(),
  start_time: z.string(),
  end_time: z.string(),
  all_day: z.boolean().default(false),
  category: z.string().default('personal'),
  priority: z.string().default('normal'),
  completed: z.boolean().default(false),
  // Recurrence fields
  is_recurring: z.boolean().default(false),
  recurrence_days: z.string().nullable().optional(), // "0,2,4"
  recurrence_end_date: z.string().nullable().optional(),
  parent_task_id: z.number().nullable().optional(),
  // Metadata
  user_id: z.number(),
  created_at: z.string().optional(),
  updated_at: z.string().nullable().optional(),
})

export type Task = z.infer<typeof taskSchema>

export const taskCreateSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  description: z.string().optional(),
  start_time: z.string().min(1, 'Start time is required.'),
  end_time: z.string().min(1, 'End time is required.'),
  all_day: z.boolean().default(false),
  category: z.string().min(1, 'Please select a category.'),
  priority: z.string().min(1, 'Please choose a priority.'),
  completed: z.boolean().default(false),
  // Recurrence
  is_recurring: z.boolean().default(false),
  recurrence_days: z.string().optional(),       // "0,2,4"
  recurrence_end_date: z.string().optional(),   // ISO date string
})

export type TaskCreate = z.infer<typeof taskCreateSchema>

export const taskUpdateSchema = taskCreateSchema.partial()
export type TaskUpdate = z.infer<typeof taskUpdateSchema>

// Day options for recurrence picker
export const WEEK_DAYS = [
  { label: 'Mon', value: '0' },
  { label: 'Tue', value: '1' },
  { label: 'Wed', value: '2' },
  { label: 'Thu', value: '3' },
  { label: 'Fri', value: '4' },
  { label: 'Sat', value: '5' },
  { label: 'Sun', value: '6' },
]