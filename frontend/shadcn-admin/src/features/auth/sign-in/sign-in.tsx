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
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from '@tanstack/react-router'
import { AxiosError } from 'axios'
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

/* ─────────────────────────────────────────────
   Styles — same design system as LandingPage
───────────────────────────────────────────── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Sora:wght@400;600;700&display=swap');

  .si-root {
    min-height: 100vh;
    display: flex;
    font-family: 'Nunito', sans-serif;
    background: #f8f7ff;
    position: relative;
    overflow: hidden;
  }

  /* Blobs — same as landing */
  .si-blob {
    position: fixed;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.25;
    animation: siFloat 6s ease-in-out infinite;
    pointer-events: none;
    z-index: 0;
  }
  .si-blob1 { width: 500px; height: 500px; background: #FF6B6B; top: -150px; left: -150px; animation-delay: 0s; }
  .si-blob2 { width: 350px; height: 350px; background: #4ECDC4; bottom: -100px; right: -100px; animation-delay: 2s; }
  .si-blob3 { width: 300px; height: 300px; background: #FFD93D; bottom: 20%; left: 10%; animation-delay: 4s; }

  @keyframes siFloat {
    0%, 100% { transform: translateY(0) scale(1); }
    50% { transform: translateY(-20px) scale(1.04); }
  }

  /* Left panel */
  .si-left {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem 2rem;
    position: relative;
    z-index: 1;
  }

.si-card input {
    border-radius: 12px !important;
    border: 1.5px solid rgba(0,0,0,0.1) !important;
    background: #ffffff !important;
    color: #1a1a2e !important;
    -webkit-text-fill-color: #1a1a2e !important;
    font-family: 'Nunito', sans-serif !important;
    font-size: 0.95rem !important;
    padding: 0.65rem 1rem !important;
    transition: border-color 0.15s, box-shadow 0.15s !important;
  }
  /* Logo */
  .si-logo {
    font-family: 'Sora', sans-serif;
    font-size: 1.5rem;
    font-weight: 700;
    background: linear-gradient(135deg, #FF6B6B, #A855F7);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 2rem;
    display: block;
    text-align: center;
  }

  .si-title {
    font-family: 'Sora', sans-serif;
    font-size: 1.6rem;
    font-weight: 700;
    color: #1a1a2e;
    margin-bottom: 0.35rem;
  }

  .si-subtitle {
    font-size: 0.9rem;
    color: #6b7280;
    margin-bottom: 2rem;
    line-height: 1.6;
  }

  /* Form fields */
  .si-field {
    margin-bottom: 1.1rem;
  }

  .si-label {
    display: block;
    font-size: 0.85rem;
    font-weight: 700;
    color: #1a1a2e;
    margin-bottom: 0.4rem;
  }

  .si-input-wrap {
    position: relative;
  }

  /* Override shadcn input to match style */
  .si-card input {
    border-radius: 12px !important;
    border: 1.5px solid rgba(0,0,0,0.1) !important;
    background: #fff !important;
    font-family: 'Nunito', sans-serif !important;
    font-size: 0.95rem !important;
    padding: 0.65rem 1rem !important;
    transition: border-color 0.15s, box-shadow 0.15s !important;
  }

  .si-card input:focus {
    border-color: #A855F7 !important;
    box-shadow: 0 0 0 3px rgba(168,85,247,0.12) !important;
    outline: none !important;
  }

  /* Submit button */
  .si-btn {
    width: 100%;
    background: linear-gradient(135deg, #FF6B6B, #A855F7) !important;
    color: #fff !important;
    border: none !important;
    border-radius: 99px !important;
    padding: 0.75rem !important;
    font-family: 'Nunito', sans-serif !important;
    font-size: 1rem !important;
    font-weight: 800 !important;
    cursor: pointer;
    margin-top: 0.5rem;
    transition: transform 0.15s, box-shadow 0.15s !important;
    box-shadow: 0 4px 20px rgba(168,85,247,0.35) !important;
  }

  .si-btn:hover:not(:disabled) {
    transform: translateY(-2px) !important;
    box-shadow: 0 8px 30px rgba(168,85,247,0.45) !important;
  }

  .si-btn:disabled {
    opacity: 0.7 !important;
  }

  /* Forgot password */
  .si-forgot {
    font-size: 0.8rem;
    font-weight: 700;
    color: #A855F7;
    text-decoration: none;
    position: absolute;
    right: 0;
    top: 0;
  }
  .si-forgot:hover { opacity: 0.75; }

  /* Divider */
  .si-divider {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin: 1.25rem 0;
  }
  .si-divider-line {
    flex: 1;
    height: 1px;
    background: rgba(0,0,0,0.08);
  }
  .si-divider-text {
    font-size: 0.78rem;
    color: #9ca3af;
    font-weight: 600;
  }

  /* Footer text */
  .si-footer-text {
    text-align: center;
    font-size: 0.82rem;
    color: #6b7280;
    margin-top: 1.25rem;
  }
  .si-footer-text a {
    color: #A855F7;
    font-weight: 700;
    text-decoration: none;
  }
  .si-footer-text a:hover { opacity: 0.75; }

  .si-terms {
    text-align: center;
    font-size: 0.75rem;
    color: #9ca3af;
    margin-top: 1rem;
    line-height: 1.6;
  }
  .si-terms a {
    color: #6b7280;
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  /* Right panel */
  .si-right {
    flex: 1;
    background: linear-gradient(135deg, #1a1a2e, #2d1b69);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem;
    position: relative;
    overflow: hidden;
    z-index: 1;
  }

  @media (max-width: 1024px) {
    .si-right { display: none; }
  }

  .si-right-blob {
    position: absolute;
    border-radius: 50%;
    filter: blur(60px);
    opacity: 0.2;
    animation: siFloat 6s ease-in-out infinite;
  }
  .si-right-blob1 { width: 300px; height: 300px; background: #FF6B6B; top: -50px; right: -50px; }
  .si-right-blob2 { width: 250px; height: 250px; background: #4ECDC4; bottom: -50px; left: -50px; animation-delay: 3s; }

  .si-right-title {
    font-family: 'Sora', sans-serif;
    font-size: 2.2rem;
    font-weight: 700;
    color: #fff;
    text-align: center;
    line-height: 1.2;
    margin-bottom: 1rem;
    position: relative;
    z-index: 1;
  }

  .si-right-sub {
    font-size: 1rem;
    color: rgba(255,255,255,0.6);
    text-align: center;
    max-width: 320px;
    line-height: 1.7;
    position: relative;
    z-index: 1;
    margin-bottom: 3rem;
  }

  /* Mini dashboard preview */
  .si-preview {
    background: rgba(255,255,255,0.07);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 20px;
    padding: 1.25rem;
    width: 100%;
    max-width: 360px;
    position: relative;
    z-index: 1;
  }

  .si-preview-bar { display: flex; gap: 6px; margin-bottom: 1rem; }
  .si-dot { width: 8px; height: 8px; border-radius: 50%; }
  .si-d1 { background: #FF6B6B; }
  .si-d2 { background: #FFD93D; }
  .si-d3 { background: #6BCB77; }

  .si-preview-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }

  .si-pcard {
    border-radius: 12px;
    padding: 0.85rem;
  }
  .si-pcard h4 {
    font-size: 0.65rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-bottom: 0.3rem;
    opacity: 0.7;
  }
  .si-pcard .si-big { font-size: 1.3rem; font-weight: 900; }
  .si-pcard .si-sub { font-size: 0.7rem; margin-top: 2px; opacity: 0.6; }

  .si-pc-tasks { background: rgba(255,248,240,0.1); color: #FFD93D; }
  .si-pc-docs  { background: rgba(240,244,255,0.1); color: #4ECDC4; }
  .si-pc-money { background: rgba(240,253,244,0.1); color: #6BCB77; }
  .si-pc-ai {
    background: rgba(253,244,255,0.1);
    color: rgba(255,255,255,0.8);
    grid-column: span 2;
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  .si-pc-ai-msg { font-size: 0.78rem; font-weight: 600; opacity: 0.8; flex: 1; }
  .si-ai-dot {
    width: 7px; height: 7px;
    border-radius: 50%;
    background: #A855F7;
    flex-shrink: 0;
    animation: siPulse 1.5s ease-in-out infinite;
  }
  @keyframes siPulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.4; transform: scale(0.8); }
  }

  /* Feature pills */
  .si-pills {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    justify-content: center;
    margin-top: 1.5rem;
    position: relative;
    z-index: 1;
  }
  .si-pill {
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 99px;
    padding: 0.3rem 0.85rem;
    font-size: 0.78rem;
    color: rgba(255,255,255,0.7);
    font-weight: 600;
  }
`

/* ─────────────────────────────────────────────
   Form Schema
───────────────────────────────────────────── */
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

/* ─────────────────────────────────────────────
   Main Component
───────────────────────────────────────────── */
export function SignIn({ redirectTo }: SignInProps) {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)

  useEffect(() => {
    const styleEl = document.createElement('style')
    styleEl.textContent = styles
    document.head.appendChild(styleEl)
    return () => document.head.removeChild(styleEl)
  }, [])

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
    <div className='si-root'>
      {/* Background blobs */}
      <div className='si-blob si-blob1' />
      <div className='si-blob si-blob2' />
      <div className='si-blob si-blob3' />

      {/* ── Left: Form ── */}
      <div className='si-left'>
        <div className='si-card'>
          <span className='si-logo'>Personal Manager</span>

          <h1 className='si-title'>Welcome back</h1>
          <p className='si-subtitle'>
            Sign in to your account and pick up where you left off.
          </p>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              {/* Email */}
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem className='si-field'>
                    <FormLabel className='si-label'>Email</FormLabel>
                    <FormControl>
                      <Input placeholder='name@example.com' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password */}
              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem className='si-field' style={{ position: 'relative' }}>
                    <FormLabel className='si-label'>Password</FormLabel>
                    <FormControl>
                      <PasswordInput placeholder='••••••••' {...field} />
                    </FormControl>
                    <FormMessage />
                    <Link to='/forgot-password' className='si-forgot'>
                      Forgot password?
                    </Link>
                  </FormItem>
                )}
              />

              {/* Submit */}
              <Button className='si-btn' disabled={isLoading}>
                {isLoading ? <Loader2 className='animate-spin' style={{ marginRight: 8 }} /> : null}
                Sign in
              </Button>
            </form>
          </Form>

          {/* Sign up link */}
          <p className='si-footer-text'>
            Don't have an account?{' '}
            <Link to='/sign-up'>Sign up for free</Link>
          </p>

          {/* Terms */}
          <p className='si-terms'>
            By signing in you agree to our{' '}
            <a href='/terms'>Terms of Service</a> and{' '}
            <a href='/privacy'>Privacy Policy</a>.
          </p>
        </div>
      </div>

      {/* ── Right: Visual Panel ── */}
      <div className='si-right'>
        <div className='si-right-blob si-right-blob1' />
        <div className='si-right-blob si-right-blob2' />

        <h2 className='si-right-title'>
          Your life,<br />organized.
        </h2>
        <p className='si-right-sub'>
          Documents, tasks, finances and calendar — all in one place, powered by AI.
        </p>

        {/* Mini dashboard preview */}
        <div className='si-preview'>
          <div className='si-preview-bar'>
            <div className='si-dot si-d1' />
            <div className='si-dot si-d2' />
            <div className='si-dot si-d3' />
          </div>
          <div className='si-preview-grid'>
            <div className='si-pcard si-pc-tasks'>
              <h4>Tasks today</h4>
              <div className='si-big'>5</div>
              <div className='si-sub'>3 completed</div>
            </div>
            <div className='si-pcard si-pc-docs'>
              <h4>Documents</h4>
              <div className='si-big'>12</div>
              <div className='si-sub'>2 deadlines soon</div>
            </div>
            <div className='si-pcard si-pc-money'>
              <h4>Balance</h4>
              <div className='si-big'>€1,240</div>
              <div className='si-sub'>This month</div>
            </div>
            <div className='si-pcard si-pc-ai'>
              <div className='si-ai-dot' />
              <div className='si-pc-ai-msg'>"Electricity bill due in 3 days — €87.50"</div>
            </div>
          </div>
        </div>

        {/* Feature pills */}
        <div className='si-pills'>
          {['📋 Tasks', '📄 Documents', '📅 Calendar', '💰 Finance', '🤖 AI Assistant'].map(p => (
            <span key={p} className='si-pill'>{p}</span>
          ))}
        </div>
      </div>
    </div>
  )
}