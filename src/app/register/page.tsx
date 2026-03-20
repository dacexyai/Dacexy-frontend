'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Loader2, AlertCircle, Check } from 'lucide-react'
import { auth } from '@/lib/api'
import { useAuthStore } from '@/lib/store'

function Requirement({ met, text }: { met: boolean; text: string }) {
  return (
    <div className={`flex items-center gap-1.5 text-[11px] transition-colors ${met ? 'text-emerald-600' : 'text-[#B0B0B0]'}`}>
      <Check size={10} className={met ? 'opacity-100' : 'opacity-30'} /> {text}
    </div>
  )
}

export default function RegisterPage() {
  const router = useRouter()
  const { login, isAuthenticated } = useAuthStore()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isAuthenticated) router.replace('/dashboard')
  }, [isAuthenticated])

  const p8 = password.length >= 8
  const pUp = /[A-Z]/.test(password)
  const pNum = /[0-9]/.test(password)

  async function handleRegister(e?: React.FormEvent) {
    e?.preventDefault()
    if (!name || !email || !password) return
    if (!p8) { setError('Password must be at least 8 characters'); return }
    setLoading(true)
    setError('')
    try {
      const data = await auth.register({ full_name: name, email, password })
      let userData = null
      let orgData = null
      try { userData = await auth.me() } catch {}
      try { orgData = await fetch(`https://dacexy-backend-v7ku.onrender.com/api/v1/orgs/me`, { headers: { Authorization: `Bearer ${data.access_token}` } }).then(r => r.json()) } catch {}
      login(userData, orgData, data.access_token, data.refresh_token)
      window.location.replace('/onboarding')
    } catch (err: any) {
      setError(err?.message || 'Registration failed. Email may already be in use.')
    } finally {
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

        <h1 className="font-serif text-2xl font-semibold text-[#0F0F0F] mb-1">Create your account</h1>
        <p className="text-sm text-[#9E9E9E] mb-8">Start your free workspace. No credit card required.</p>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-[9px] font-extrabold text-[#5C5C5C] uppercase tracking-widest mb-1.5">Full name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              type="text"
              placeholder="Jane Smith"
              required
              autoFocus
              className="w-full bg-[#F2EFE8] border border-black/8 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-400 transition-all"
            />
          </div>
          <div>
            <label className="block text-[9px] font-extrabold text-[#5C5C5C] uppercase tracking-widest mb-1.5">Work email</label>
            <input
              value={email}
              onChange={e => setEmail(e.target.value)}
              type="email"
              placeholder="you@company.com"
              required
              className="w-full bg-[#F2EFE8] border border-black/8 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-400 transition-all"
            />
          </div>
          <div>
            <label className="block text-[9px] font-extrabold text-[#5C5C5C] uppercase tracking-widest mb-1.5">Password</label>
            <div className="relative">
              <input
                value={password}
                onChange={e => setPassword(e.target.value)}
                type={show ? 'text' : 'password'}
                placeholder="Min. 8 characters"
                required
                className="w-full bg-[#F2EFE8] border border-black/8 rounded-xl px-4 py-3 pr-11 text-sm outline-none focus:border-violet-400 transition-all"
              />
              <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-3 text-[#9E9E9E]">
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {password && (
              <div className="flex gap-4 mt-2 px-1">
                <Requirement met={p8} text="8+ chars" />
                <Requirement met={pUp} text="Uppercase" />
                <Requirement met={pNum} text="Number" />
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
              <AlertCircle size={13} className="text-red-500 shrink-0" />
              <p className="text-xs text-red-600">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !name || !email || !p8}
            className="w-full bg-violet-700 text-white font-bold text-sm py-3.5 rounded-xl hover:bg-violet-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2 mt-2"
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : null}
            Create account
          </button>
        </form>

        <p className="text-center text-[11px] text-[#B0B0B0] mt-4">
          By signing up you agree to our Terms of Service and Privacy Policy.
        </p>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-black/6" />
          <span className="text-xs text-[#9E9E9E]">or</span>
          <div className="flex-1 h-px bg-black/6" />
        </div>

        <p className="text-center text-sm text-[#9E9E9E]">
          Already have an account?{' '}
          <Link href="/login" className="text-violet-700 font-bold hover:text-violet-900">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
