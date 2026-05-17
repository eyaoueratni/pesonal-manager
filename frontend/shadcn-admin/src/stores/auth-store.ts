import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: number
  email: string
  username: string
  role: 'user' | 'admin'
  is_active: boolean
  created_at: string
}

interface AuthState {
  user: User | null
  token: string | null       // ✅ single source of truth for the JWT
  isAuthenticated: boolean

  setAuth: (user: User, token: string) => void
  reset: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      // ✅ Store raw JWT — no "Bearer " prefix
      setAuth: (user, token) => {
        set({
          user,
          token,
          isAuthenticated: true,
        })
      },

      reset: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        })
      },
    }),
    {
      name: 'auth-storage',
    }
  )
)