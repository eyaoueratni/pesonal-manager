import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { userAPI } from '@/lib/api'
import { useAuthStore } from '@/stores/auth-store'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

// ─────────────────────────────────────────────
// Schemas
// ─────────────────────────────────────────────
const profileSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be less than 20 characters'),
  email: z.string().email('Please enter a valid email'),
})

const passwordSchema = z
  .object({
    current_password: z.string().min(1, 'Please enter your current password'),
    new_password: z.string().min(7, 'Password must be at least 7 characters'),
    confirm_password: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords don't match",
    path: ['confirm_password'],
  })

type ProfileValues = z.infer<typeof profileSchema>
type PasswordValues = z.infer<typeof passwordSchema>

// ─────────────────────────────────────────────
// Profile Form
// ─────────────────────────────────────────────
function ProfileForm() {
  const [isLoading, setIsLoading] = useState(false)
  const user = useAuthStore((state) => state.user)
  const token = useAuthStore((state) => state.token)
  const setAuth = useAuthStore((state) => state.setAuth)

  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: user?.username || '',
      email: user?.email || '',
    },
  })

  async function onSubmit(data: ProfileValues) {
    setIsLoading(true)
    try {
      const response = await userAPI.updateProfile(data)
      if (token) setAuth(response.data, token)
      toast.success('Profile updated successfully!')
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || 'Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
        <FormField
          control={form.control}
          name='username'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder='your_username' {...field} />
              </FormControl>
              <FormDescription>
                This is your display name across the app.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder='your@email.com' type='email' {...field} />
              </FormControl>
              <FormDescription>
                Used for login and notifications.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type='submit' disabled={isLoading}>
          {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
          Update profile
        </Button>
      </form>
    </Form>
  )
}

// ─────────────────────────────────────────────
// Password Form
// ─────────────────────────────────────────────
function PasswordForm() {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      current_password: '',
      new_password: '',
      confirm_password: '',
    },
  })

  async function onSubmit(data: PasswordValues) {
    setIsLoading(true)
    try {
      await userAPI.changePassword({
        current_password: data.current_password,
        new_password: data.new_password,
      })
      toast.success('Password changed successfully!')
      form.reset()
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || 'Failed to change password')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
        <FormField
          control={form.control}
          name='current_password'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Current password</FormLabel>
              <FormControl>
                <Input type='password' placeholder='••••••••' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='new_password'
          render={({ field }) => (
            <FormItem>
              <FormLabel>New password</FormLabel>
              <FormControl>
                <Input type='password' placeholder='••••••••' {...field} />
              </FormControl>
              <FormDescription>Minimum 7 characters.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='confirm_password'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm new password</FormLabel>
              <FormControl>
                <Input type='password' placeholder='••••••••' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type='submit' disabled={isLoading}>
          {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
          Change password
        </Button>
      </form>
    </Form>
  )
}

// ─────────────────────────────────────────────
// Main AccountForm export
// ─────────────────────────────────────────────
export function AccountForm() {
  return (
    <div className='space-y-8'>
      <div>
        <h3 className='text-lg font-medium'>Profile</h3>
        <p className='text-sm text-muted-foreground mb-4'>
          Update your username and email address.
        </p>
        <ProfileForm />
      </div>

      <Separator />

      <div>
        <h3 className='text-lg font-medium'>Password</h3>
        <p className='text-sm text-muted-foreground mb-4'>
          Change your password to keep your account secure.
        </p>
        <PasswordForm />
      </div>
    </div>
  )
}
