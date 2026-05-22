import { PasswordInput } from '@/components/password-input'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { authAPI } from '@/lib/api'
import { useAuthStore } from '@/stores/auth-store'
import '@/styles/homebase.css'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from '@tanstack/react-router'
import { AxiosError } from 'axios'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

const formSchema = z
  .object({
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .max(20, 'Username must be less than 20 characters'),
    email: z.string().email('Please enter a valid email'),
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

export function SignUp() {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { username: '', email: '', password: '', confirmPassword: '' },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      const response = await authAPI.register({
        username: data.username,
        email: data.email,
        password: data.password,
      })
      if (response.data.access_token && response.data.user) {
        const { access_token, user } = response.data
        setAuth(user, access_token)
        toast.success(`Welcome, ${user.username}!`)
        await navigate({ to: '/', replace: true })
      } else {
        toast.success('Account created! Please sign in.')
        await navigate({ to: '/sign-in', replace: true })
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(
          error.response?.data?.detail ||
          error.response?.data?.message ||
          'Failed to create account'
        )
      } else {
        toast.error('An unexpected error occurred')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='hb-auth-root'>
      {/* Blobs */}
      <div className='hb-blob hb-blob-coral hb-blob-tl' />
      <div className='hb-blob hb-blob-teal hb-blob-br' />
      <div className='hb-blob hb-blob-yellow hb-blob-bl' />

      {/* ── Left: Form ── */}
      <div className='hb-auth-left'>
        <div className='hb-glass-card hb-auth-card'>
          <div className='hb-logo' style={{ textAlign: 'center', marginBottom: '2rem', display: 'block' }}>
            Personal Manager
          </div>

          <h1 className='hb-auth-title'>Create your account</h1>
          <p className='hb-auth-subtitle'>
            Join HomeBase and start organizing your life today.
          </p>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name='username'
                render={({ field }) => (
                  <FormItem className='hb-field'>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder='john_doe' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem className='hb-field'>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder='name@example.com' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem className='hb-field'>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <PasswordInput placeholder='••••••••' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='confirmPassword'
                render={({ field }) => (
                  <FormItem className='hb-field'>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <PasswordInput placeholder='••••••••' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button className='hb-btn-primary' disabled={isLoading}>
                {isLoading && <Loader2 className='animate-spin' style={{ marginRight: 8 }} />}
                {isLoading ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>
          </Form>

          <p className='hb-auth-footer'>
            Already have an account?{' '}
            <Link to='/sign-in'>Sign in</Link>
          </p>

          <p className='hb-auth-terms'>
            By creating an account you agree to our{' '}
            <a href='/terms'>Terms of Service</a> and{' '}
            <a href='/privacy'>Privacy Policy</a>.
          </p>
        </div>
      </div>

      {/* ── Right: Visual Panel ── */}
      <div className='hb-auth-right'>
        <div className='hb-auth-right-blob hb-auth-right-blob1' />
        <div className='hb-auth-right-blob hb-auth-right-blob2' />

        <h2 className='hb-auth-right-title'>Everything<br />in one place.</h2>
        <p className='hb-auth-right-sub'>
          Documents, tasks, finances and calendar — all in one place, powered by AI.
        </p>

        <div className='hb-mini-preview'>
          <div className='hb-mini-bar'>
            <div className='hb-mini-dot hb-mini-dot-red' />
            <div className='hb-mini-dot hb-mini-dot-yellow' />
            <div className='hb-mini-dot hb-mini-dot-green' />
          </div>
          <div className='hb-mini-grid'>
            <div className='hb-mini-card hb-mini-tasks'>
              <h4>Tasks today</h4>
              <div className='hb-mini-big'>5</div>
              <div className='hb-mini-sub'>3 completed</div>
            </div>
            <div className='hb-mini-card hb-mini-docs'>
              <h4>Documents</h4>
              <div className='hb-mini-big'>12</div>
              <div className='hb-mini-sub'>2 deadlines soon</div>
            </div>
            <div className='hb-mini-card hb-mini-money'>
              <h4>Balance</h4>
              <div className='hb-mini-big'>€1,240</div>
              <div className='hb-mini-sub'>This month</div>
            </div>
            <div className='hb-mini-card hb-mini-ai'>
              <div className='hb-mini-ai-dot' />
              <div className='hb-mini-ai-msg'>"Electricity bill due in 3 days — €87.50"</div>
            </div>
          </div>
        </div>

        <div className='hb-pills'>
          {['📋 Tasks', '📄 Documents', '📅 Calendar', '💰 Finance', '🤖 AI Assistant'].map(p => (
            <span key={p} className='hb-pill'>{p}</span>
          ))}
        </div>
      </div>
    </div>
  )
}