import { PasswordInput } from '@/components/password-input';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { authAPI } from '@/lib/api'; // ← ADD THIS
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store'; // ← ADD THIS
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from '@tanstack/react-router'; // ← ADD THIS
import { AxiosError } from 'axios'; // ← ADD THIS
import { Loader2, UserPlus } from 'lucide-react'; // ← ADD ICONS
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner'; // ← ADD THIS
import { z } from 'zod';

const formSchema = z
  .object({
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .max(20, 'Username must be less than 20 characters'),
    email: z.string().email({
      error: (iss) =>
        iss.input === '' ? 'Please enter your email' : undefined,
    }),
    password: z
      .string()
      .min(1, 'Please enter your password')
      .min(7, 'Password must be at least 7 characters long'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ['confirmPassword'],
  })

export function SignUpForm({
  className,
  ...props
}: React.HTMLAttributes<HTMLFormElement>) {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      // Call your FastAPI register endpoint
      const response = await authAPI.register({
        username: data.username,
        email: data.email,
        password: data.password,
      })

      // If backend returns token + user (auto-login)
      if (response.data.access_token && response.data.user) {
        const { access_token, user } = response.data
        setAuth(user, access_token)
        toast.success(`Welcome, ${user.username}!`)
        await navigate({ to: '/', replace: true })
      } else {
        // Otherwise, go to sign-in
        toast.success('Account created! Please sign in.')
        await navigate({ to: '/sign-in', replace: true })
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Sign up error:', error)
      if (error instanceof AxiosError) {
        const message =
          error.response?.data?.detail ||
          error.response?.data?.message ||
          'Failed to create account'
        toast.error(message)
      } else {
        toast.error('An unexpected error occurred')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('grid gap-3', className)}
        {...props}
      >
        {/* 👇 NEW USERNAME FIELD */}
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="john_doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="name@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <PasswordInput placeholder="********" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <PasswordInput placeholder="********" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button className="mt-2" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <UserPlus className="mr-2 h-4 w-4" />
              Create Account
            </>
          )}
        </Button>
      </form>
    </Form>
  )
}
