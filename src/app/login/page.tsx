'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react'
import { useAuthStore } from '@/lib/store'

const API = 'https://dacexy-backend-v7ku.onrender.com/api/v1'

export default function LoginPage() {
  const router = useRouter()
  const { login, isAuthenticated } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  
useEffect(() => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
  if (isAuthenticated && token) router.replace('/chat')
}, [isAuthenticated])
  async function handleLogin(e?: React.FormEvent) {
    e?.preventDefault()
    if (!email || !password) return
    setLoading(true)
    setError('')
    try {
      // Step 1: Login
      const res = await fetch(`${API}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
})

      const data = await res.json()
if (!res.ok) {
  const d = data.detail
  const msg = Array.isArray(d) ? d.map((e:any) => e.msg || JSON.stringify(e)).join(', ') : typeof d === 'string' ? d : 'Login failed'
  throw new Error(msg)
}
      const token = data.access_token
      localStorage.setItem('access_token', token)

      // Step 2: Get user info
      let userData = null
      try {
        const meRes = await fetch(`${API}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (meRes.ok) userData = await meRes.json()
      } catch {}

      // Step 3: Get org info
      let orgData = null
      try {
        const orgRes = await fetch(`${API}/orgs/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (orgRes.ok) orgData = await orgRes.json()
      } catch {}

      // Step 4: Save to store and redirect
      login(userData, orgData, token, '')
      window.location.replace('/chat')

    } catch (err: any) {
  const msg = err?.message ?? err?.detail ?? String(err) ?? 'Invalid email or password'
  setError(typeof msg === 'string' ? msg : JSON.stringify(msg))
    }finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F9F7F2] flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-soft border border-black/6 p-10 w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-violet-700 rounded-xl flex items-center justify-center shadow-glow">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M13 2L3 14h9l-1 8 10-12h-9z"/></svg>
            </div>
            <span className="font-serif text-xl font-bold text-[#0F0F0F]">Dacexy</span>
          </div>
        </div>

        <h1 className="font-serif text-2xl font-semibold text-[#0F0F0F] mb-1">Welcome back</h1>
        <p className="text-sm text-[#9E9E9E] mb-8">Sign in to your Dacexy workspace</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-[9px] font-extrabold text-[#5C5C5C] uppercase tracking-widest mb-1.5">Email</label>
            <input
              value={email}
              onChange={e => setEmail(e.target.value)}
              type="email"
              placeholder="you@company.com"
              required
              autoFocus
              className="w-full bg-[#F2EFE8] border border-black/8 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-400 transition-all"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[9px] font-extrabold text-[#5C5C5C] uppercase tracking-widest">Password</label>
              <Link href="/reset-password" className="text-[10px] text-violet-600 font-bold hover:text-violet-800">Forgot?</Link>
            </div>
            <div className="relative">
              <input
                value={password}
                onChange={e => setPassword(e.target.value)}
                type={show ? 'text' : 'password'}
                placeholder="••••••••"
                required
                className="w-full bg-[#F2EFE8] border border-black/8 rounded-xl px-4 py-3 pr-11 text-sm outline-none focus:border-violet-400 transition-all"
              />
              <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-3 text-[#9E9E9E]">
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
              <AlertCircle size={13} className="text-red-500 shrink-0" />
              <p className="text-xs text-red-600">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full bg-violet-700 text-white font-bold text-sm py-3.5 rounded-xl hover:bg-violet-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2 mt-2"
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : null}
            Sign in
          </button>
        </form>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-black/6" />
          <span className="text-xs text-[#9E9E9E]">or</span>
          <div className="flex-1 h-px bg-black/6" />
        </div>

        <p className="text-center text-sm text-[#9E9E9E]">
          Don't have an account?{' '}
          <Link href="/register" className="text-violet-700 font-bold hover:text-violet-900">Create one</Link>
        </p>
      </div>
    </div>
  )
          }
