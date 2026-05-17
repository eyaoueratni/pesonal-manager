import { z } from 'zod'

const userStatusSchema = z.union([
  z.literal('active'),
  z.literal('inactive'),
])
export type UserStatus = z.infer<typeof userStatusSchema>

const userRoleSchema = z.union([
  z.literal('user'),
  z.literal('admin'),
])

const userSchema = z.object({
  id: z.number(),           // ✅ number not string
  username: z.string(),
  email: z.string(),
  role: userRoleSchema,
  status: userStatusSchema,
  createdAt: z.coerce.date(),
  // ❌ removed: firstName, lastName, phoneNumber, updatedAt (backend doesn't have these)
})

export type User = z.infer<typeof userSchema>
export const userListSchema = z.array(userSchema)