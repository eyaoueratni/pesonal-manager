import { z } from 'zod'

export const extractedItemSchema = z.object({
  label: z.string(),
  value: z.string(),
  priority: z.enum(['high', 'medium', 'low']),
})

export const extractedDataSchema = z.object({
  document_type: z.string().optional(),
  language: z.string().optional(),
  summary: z.string().optional(),
  deadline: z.string().nullable().optional(),
  amount: z.string().nullable().optional(),
  action_required: z.string().nullable().optional(),
  important_items: z.array(extractedItemSchema).optional(),
  text_length: z.number().optional(),
  chunks_count: z.number().optional(),
  error: z.string().optional(),
}).nullable().optional()

export const documentSchema = z.object({
  id: z.number(),
  title: z.string(),
  original_filename: z.string(),
  file_type: z.string(),
  file_size: z.number(),
  summary: z.string().nullable().optional(),
  summary_status: z.string(),
  extracted_data: extractedDataSchema,
  user_id: z.number(),
  created_at: z.string(),
  updated_at: z.string().nullable().optional(),
})

export type Document = z.infer<typeof documentSchema>
export type ExtractedData = z.infer<typeof extractedDataSchema>
export type ExtractedItem = z.infer<typeof extractedItemSchema>