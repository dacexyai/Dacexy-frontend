'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/lib/store'

const API_URL = "https://dacexy-backend-v7ku.onrender.com/api/v1"

export default function DashboardPage() {
  const router = useRouter()
  const { user, org, logout } = useAuthStore()
  const [usage, setUsage] = useState<any>(null)
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null

  useEffect(() => {
    if (!token) { router.replace('/login'); return }
    fetch(`${API_URL}/billing/usage`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setUsage).catch(() => {})
  }, [])

  const features = [
    { title: 'AI Chat', desc: 'Chat with DeepSeek AI', href: '/chat', icon: '💬', color: 'bg-violet-50 border-violet-200 hover:bg-violet-100' },
    { title: 'AI Agent', desc: 'Automate complex tasks', href: '/agent', icon: '🤖', color: 'bg-amber-50 border-amber-200 hover:bg-amber-100' },
    { title: 'Billing', desc: 'Manage your plan', href: '/billing', icon: '💳', color: 'bg-green-50 border-green-200 hover:bg-green-100' },
    { title: 'Team', desc: 'Manage members', href: '/team', icon: '👥', color: 'bg-blue-50 border-blue-200 hover:bg-blue-100' },
    { title: 'Settings', desc: 'Account settings', href: '/settings', icon: '⚙️', color: 'bg-gray-50 border-gray-200 hover:bg-gray-100' },
    { title: 'Audit Logs', desc: 'View activity', href: '/audit-logs', icon: '📋', color: 'bg-rose-50 border-rose-200 hover:bg-rose-100' },
  ]

  return (
    <div className="min-h-screen bg-[#F9F7F2]">
      {/* Top nav */}
      <nav className="bg-white border-b border-black/6 px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-violet-700 rounded-lg flex items-center justify-center">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="white"><path d="M13 2L3 14h9l-1 8 10-12h-9z"/></svg>
          </div>
          <span className="font-serif font-bold text-[#0F0F0F]">Dacexy</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-[#9E9E9E]">{user?.email || ''}</span>
          <button
            onClick={() => { logout(); window.location.href = '/login' }}
            className="text-sm text-[#5C5C5C] hover:text-[#0F0F0F] font-medium transition-colors"
          >
            Sign out
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-semibold text-[#0F0F0F]">
            Welcome back{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''} 👋
          </h1>
          <p className="text-[#9E9E9E] mt-1">
            {org?.name || 'Your workspace'} · <span className="capitalize">{org?.plan_tier || 'free'}</span> plan
          </p>
        </div>

        {/* Usage cards */}
        {usage && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white border border-black/6 rounded-2xl p-5 shadow-soft">
              <p className="text-xs text-[#9E9E9E] font-medium uppercase tracking-wide">AI Calls</p>
              <p className="text-2xl font-serif font-semibold text-[#0F0F0F] mt-1">{usage.monthly_ai_calls || 0}</p>
              <p className="text-xs text-[#B0B0B0] mt-1">This month</p>
            </div>
            <div className="bg-white border border-black/6 rounded-2xl p-5 shadow-soft">
              <p className="text-xs text-[#9E9E9E] font-medium uppercase tracking-wide">Credits</p>
              <p className="text-2xl font-serif font-semibold text-[#0F0F0F] mt-1">{usage.credits_balance || 0}</p>
              <p className="text-xs text-[#B0B0B0] mt-1">Available</p>
            </div>
            <div className="bg-white border border-black/6 rounded-2xl p-5 shadow-soft">
              <p className="text-xs text-[#9E9E9E] font-medium uppercase tracking-wide">Plan</p>
              <p className="text-2xl font-serif font-semibold text-[#0F0F0F] mt-1 capitalize">{usage.plan_tier || 'Free'}</p>
              <Link href="/billing" className="text-xs text-violet-600 font-semibold mt-1 block hover:text-violet-800">Upgrade →</Link>
            </div>
          </div>
        )}

        {/* Features grid */}
        <h2 className="font-serif text-lg font-semibold text-[#0F0F0F] mb-4">Quick access</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {features.map((f) => (
            <Link
              key={f.title}
              href={f.href}
              className={`p-5 bg-white border rounded-2xl transition-all shadow-soft hover:shadow-card hover:-translate-y-0.5 ${f.color}`}
            >
              <div className="text-2xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-[#0F0F0F] text-sm">{f.title}</h3>
              <p className="text-[#9E9E9E] text-xs mt-1">{f.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
