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
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Sora:wght@400;600;700&display=swap');
  .si-root { min-height: 100vh; display: flex; font-family: 'Nunito', sans-serif; background: #f8f7ff; position: relative; overflow: hidden; }
  .si-blob { position: fixed; border-radius: 50%; filter: blur(80px); opacity: 0.25; animation: siFloat 6s ease-in-out infinite; pointer-events: none; z-index: 0; }
  .si-blob1 { width: 500px; height: 500px; background: #FF6B6B; top: -150px; left: -150px; animation-delay: 0s; }
  .si-blob2 { width: 350px; height: 350px; background: #4ECDC4; bottom: -100px; right: -100px; animation-delay: 2s; }
  .si-blob3 { width: 300px; height: 300px; background: #FFD93D; bottom: 20%; left: 10%; animation-delay: 4s; }
  @keyframes siFloat { 0%, 100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-20px) scale(1.04); } }
  .si-left { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 3rem 2rem; position: relative; z-index: 1; }
  .si-card input {
    border-radius: 12px !important;
    border: 1.5px solid rgba(0,0,0,0.1) !important;
    background: #fff !important;
    color: #1a1a2e !important;
    font-family: 'Nunito', sans-serif !important;
    font-size: 0.95rem !important;
    padding: 0.65rem 1rem !important;
    transition: border-color 0.15s, box-shadow 0.15s !important;
  }
  
  .si-logo { font-family: 'Sora', sans-serif; font-size: 1.5rem; font-weight: 700; background: linear-gradient(135deg, #FF6B6B, #A855F7); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin-bottom: 2rem; display: block; text-align: center; }
  .si-title { font-family: 'Sora', sans-serif; font-size: 1.6rem; font-weight: 700; color: #1a1a2e; margin-bottom: 0.35rem; }
  .si-subtitle { font-size: 0.9rem; color: #6b7280; margin-bottom: 2rem; line-height: 1.6; }
  .si-field { margin-bottom: 1.1rem; }
  .si-label { display: block; font-size: 0.85rem; font-weight: 700; color: #1a1a2e; margin-bottom: 0.4rem; }
  .si-card input { border-radius: 12px !important; border: 1.5px solid rgba(0,0,0,0.1) !important; background: #fff !important; font-family: 'Nunito', sans-serif !important; font-size: 0.95rem !important; padding: 0.65rem 1rem !important; transition: border-color 0.15s, box-shadow 0.15s !important; }
  .si-card input:focus { border-color: #A855F7 !important; box-shadow: 0 0 0 3px rgba(168,85,247,0.12) !important; outline: none !important; }
  .si-btn { width: 100%; background: linear-gradient(135deg, #FF6B6B, #A855F7) !important; color: #fff !important; border: none !important; border-radius: 99px !important; padding: 0.75rem !important; font-family: 'Nunito', sans-serif !important; font-size: 1rem !important; font-weight: 800 !important; cursor: pointer; margin-top: 0.5rem; transition: transform 0.15s, box-shadow 0.15s !important; box-shadow: 0 4px 20px rgba(168,85,247,0.35) !important; }
  .si-btn:hover:not(:disabled) { transform: translateY(-2px) !important; box-shadow: 0 8px 30px rgba(168,85,247,0.45) !important; }
  .si-btn:disabled { opacity: 0.7 !important; }
  .si-footer-text { text-align: center; font-size: 0.82rem; color: #6b7280; margin-top: 1.25rem; }
  .si-footer-text a { color: #A855F7; font-weight: 700; text-decoration: none; }
  .si-footer-text a:hover { opacity: 0.75; }
  .si-right { flex: 1; background: linear-gradient(135deg, #1a1a2e, #2d1b69); display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 3rem; position: relative; overflow: hidden; z-index: 1; }
  @media (max-width: 1024px) { .si-right { display: none; } }
  .si-right-blob { position: absolute; border-radius: 50%; filter: blur(60px); opacity: 0.2; animation: siFloat 6s ease-in-out infinite; }
  .si-right-blob1 { width: 300px; height: 300px; background: #FF6B6B; top: -50px; right: -50px; }
  .si-right-blob2 { width: 250px; height: 250px; background: #4ECDC4; bottom: -50px; left: -50px; animation-delay: 3s; }
  .si-right-title { font-family: 'Sora', sans-serif; font-size: 2.2rem; font-weight: 700; color: #fff; text-align: center; line-height: 1.2; margin-bottom: 1rem; position: relative; z-index: 1; }
  .si-right-sub { font-size: 1rem; color: rgba(255,255,255,0.6); text-align: center; max-width: 320px; line-height: 1.7; position: relative; z-index: 1; margin-bottom: 3rem; }
  .si-success { text-align: center; padding: 2rem 0; }
  .si-success-icon { font-size: 3rem; margin-bottom: 1rem; }
  .si-success-title { font-family: 'Sora', sans-serif; font-size: 1.4rem; font-weight: 700; color: #1a1a2e; margin-bottom: 0.5rem; }
  .si-success-sub { font-size: 0.88rem; color: #6b7280; line-height: 1.6; }
  .si-invalid { text-align: center; padding: 2rem 0; }
`

const formSchema = z
  .object({
    new_password: z.string().min(6, 'Password must be at least 6 characters'),
    confirm_password: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords don't match",
    path: ['confirm_password'],
  })

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export function ResetPasswordForm() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const styleEl = document.createElement('style')
    styleEl.textContent = styles
    document.head.appendChild(styleEl)
    return () => document.head.removeChild(styleEl)
  }, [])

  useEffect(() => {
    // Get token from URL
    const params = new URLSearchParams(window.location.search)
    setToken(params.get('token'))
  }, [])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { new_password: '', confirm_password: '' },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    if (!token) {
      toast.error('Invalid reset link.')
      return
    }
    setIsLoading(true)
    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, new_password: data.new_password }),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.detail || 'Something went wrong')
      }
      setSuccess(true)
      toast.success('Password reset successfully!')
      setTimeout(() => navigate({ to: '/sign-in' }), 2000)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to reset password')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='si-root'>
      <div className='si-blob si-blob1' />
      <div className='si-blob si-blob2' />
      <div className='si-blob si-blob3' />

      <div className='si-left'>
        <div className='si-card'>
          <span className='si-logo'>Planora</span>

          {success ? (
            <div className='si-success'>
              <div className='si-success-icon'>✅</div>
              <div className='si-success-title'>Password reset!</div>
              <p className='si-success-sub'>
                Your password has been changed successfully.
                Redirecting to sign in...
              </p>
            </div>
          ) : !token ? (
            <div className='si-invalid'>
              <div className='si-success-icon'>❌</div>
              <div className='si-success-title'>Invalid Link</div>
              <p className='si-success-sub'>
                This reset link is invalid or has expired.
              </p>
              <p className='si-footer-text' style={{ marginTop: '1.5rem' }}>
                <Link to='/forgot-password'>Request a new link</Link>
              </p>
            </div>
          ) : (
            <>
              <h1 className='si-title'>Reset password</h1>
              <p className='si-subtitle'>
                Enter your new password below.
              </p>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <FormField
                    control={form.control}
                    name='new_password'
                    render={({ field }) => (
                      <FormItem className='si-field'>
                        <FormLabel className='si-label'>New Password</FormLabel>
                        <FormControl>
                          <PasswordInput placeholder='••••••••' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='confirm_password'
                    render={({ field }) => (
                      <FormItem className='si-field'>
                        <FormLabel className='si-label'>Confirm Password</FormLabel>
                        <FormControl>
                          <PasswordInput placeholder='••••••••' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button className='si-btn' disabled={isLoading}>
                    {isLoading
                      ? <Loader2 className='animate-spin' style={{ marginRight: 8 }} />
                      : null}
                    Reset Password
                  </Button>
                </form>
              </Form>

              <p className='si-footer-text'>
                Remember your password?{' '}
                <Link to='/sign-in'>Sign in</Link>
              </p>
            </>
          )}
        </div>
      </div>

      <div className='si-right'>
        <div className='si-right-blob si-right-blob1' />
        <div className='si-right-blob si-right-blob2' />
        <h2 className='si-right-title'>
          Keep your<br />account safe.
        </h2>
        <p className='si-right-sub'>
          Choose a strong password to protect your tasks, documents and personal data.
        </p>
      </div>
    </div>
  )
}