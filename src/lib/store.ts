import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  email: string
  full_name: string
  role: string
  is_verified: boolean
}

interface Organization {
  id: string
  name: string
  slug: string
  plan_tier: string
  plan?: string
  credits_balance?: number
}

interface AuthState {
  user: User | null
  org: Organization | null
  isLoading: boolean
  isAuthenticated: boolean
  token: string | null
  setUser: (user: User) => void
  setOrg: (org: Organization) => void
  login: (user: User, org: Organization | null, access: string, refresh: string) => void
  logout: () => void
  setLoading: (v: boolean) => void
  setTokens: (access: string, refresh: string) => void
  init: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      org: null,
      isLoading: false,
      isAuthenticated: false,
      token: null,

      init: () => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
      if (userData) login(userData, orgData, data.access_token, data.refresh_token ?? '')
try { userData = await auth.me() } catch {}
try { orgData = await fetch(`https://dacexy-backend-v7ku.onrender.com/api/v1/orgs/me`, { headers: { Authorization: `Bearer ${data.access_token}` } }).then(r => r.json()) } catch {}
if (userData) {
  login(userData, orgData, data.access_token, data.refresh_token ?? '')
}
window.location.replace('/onboarding')
      },

      setUser: (user) => set({ user, isAuthenticated: true }),
      setOrg: (org) => set({ org }),

      login: (user, org, access, refresh) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('access_token', access)
          localStorage.setItem('refresh_token', refresh)
        }
        set({ user, org, isAuthenticated: true, isLoading: false, token: access })
      },

      setTokens: (access, refresh) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('access_token', access)
          localStorage.setItem('refresh_token', refresh)
        }
        set({ token: access, isAuthenticated: true })
      },

      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          localStorage.removeItem('dacexy_auth')
        }
        set({ user: null, org: null, isAuthenticated: false, token: null })
      },

      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'dacexy_auth',
      partialize: (s) => ({ user: s.user, org: s.org, isAuthenticated: s.isAuthenticated, token: s.token }),
    }
  )
)
