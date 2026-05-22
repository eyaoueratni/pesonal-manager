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

const formSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z
    .string()
    .min(1, 'Please enter your password')
    .min(7, 'Password must be at least 7 characters long'),
})

interface SignInProps {
  redirectTo?: string
}

export function SignIn({ redirectTo }: SignInProps) {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '', password: '' },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      const response = await authAPI.login({ email: data.email, password: data.password })
      const { access_token, user } = response.data
      setAuth(user, access_token)
      toast.success(`Welcome back, ${user.username}!`)
      navigate({ to: user.role === 'admin' ? '/' : (redirectTo || '/'), replace: true })
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.detail || 'Invalid credentials')
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

          <h1 className='hb-auth-title'>Welcome back</h1>
          <p className='hb-auth-subtitle'>
            Sign in to your account and pick up where you left off.
          </p>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
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
                  <FormItem className='hb-field' style={{ position: 'relative' }}>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <PasswordInput placeholder='••••••••' {...field} />
                    </FormControl>
                    <FormMessage />
                    <Link to='/forgot-password' className='hb-forgot-link'>
                      Forgot password?
                    </Link>
                  </FormItem>
                )}
              />

              <Button className='hb-btn-primary' disabled={isLoading}>
                {isLoading && <Loader2 className='animate-spin' style={{ marginRight: 8 }} />}
                Sign in
              </Button>
            </form>
          </Form>

          <p className='hb-auth-footer'>
            Don't have an account?{' '}
            <Link to='/sign-up'>Sign up for free</Link>
          </p>

          <p className='hb-auth-terms'>
            By signing in you agree to our{' '}
            <a href='/terms'>Terms of Service</a> and{' '}
            <a href='/privacy'>Privacy Policy</a>.
          </p>
        </div>
      </div>

      {/* ── Right: Visual Panel ── */}
      <div className='hb-auth-right'>
        <div className='hb-auth-right-blob hb-auth-right-blob1' />
        <div className='hb-auth-right-blob hb-auth-right-blob2' />

        <h2 className='hb-auth-right-title'>Your life,<br />organized.</h2>
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