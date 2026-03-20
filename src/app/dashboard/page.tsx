'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  MessageSquare, Bot, Zap, ArrowRight,
  CreditCard, Users, Sparkles, Clock,
  ChevronRight, Activity, RefreshCw, AlertCircle
} from 'lucide-react'
import { useAuthStore } from '@/lib/store'
import { planLabel, planColor, formatRelative, cn } from '@/lib/utils'

const API_URL = "https://dacexy-backend-v7ku.onrender.com/api/v1"

function StatCard({ icon: Icon, label, value, sub, color = 'violet', href }: any) {
  const colorMap: any = {
    violet:  'bg-violet-50 text-violet-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    amber:   'bg-amber-50 text-amber-700',
    blue:    'bg-blue-50 text-blue-700',
  }
  const card = (
    <div className="bg-white border border-black/6 rounded-2xl p-5 shadow-soft hover:shadow-md transition-all group">
      <div className="flex items-center justify-between mb-4">
        <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center', colorMap[color])}>
          <Icon size={16} />
        </div>
        {href && <ChevronRight size={14} className="text-gray-300 group-hover:text-violet-400 transition-colors" />}
      </div>
      <p className="font-serif text-2xl font-bold text-[#0F0F0F] mb-0.5">{value}</p>
      <p className="text-xs font-semibold text-[#5C5C5C]">{label}</p>
      {sub && <p className="text-[10px] text-[#B0B0B0] mt-0.5">{sub}</p>}
    </div>
  )
  return href ? <Link href={href}>{card}</Link> : card
}

function QuickAction({ icon: Icon, title, desc, href }: any) {
  return (
    <Link href={href}
      className="flex items-center gap-4 bg-white border border-black/6 rounded-2xl p-4 shadow-soft hover:border-violet-200 hover:shadow-md transition-all group">
      <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-violet-100 transition-colors">
        <Icon size={18} className="text-violet-700" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#0F0F0F]">{title}</p>
        <p className="text-xs text-[#9E9E9E] truncate">{desc}</p>
      </div>
      <ArrowRight size={14} className="text-gray-300 group-hover:text-violet-500 transition-colors shrink-0" />
    </Link>
  )
}

export default function DashboardPage() {
  const { user, org } = useAuthStore()
  const [usage, setUsage] = useState<any>(null)
  const [sessions, setSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null

  useEffect(() => {
    if (!token) { window.location.href = '/login'; return }
    const headers = { Authorization: `Bearer ${token}` }
    Promise.allSettled([
      fetch(`${API_URL}/billing/usage`, { headers }).then(r => r.json()).then(setUsage),
      fetch(`${API_URL}/ai/sessions`, { headers }).then(r => r.json()).then(d => setSessions((d.sessions || []).slice(0, 5))),
    ]).finally(() => setLoading(false))
  }, [])

  const plan = (org as any)?.plan ?? (org as any)?.plan_tier ?? 'free'
  const creditsUsed = usage?.monthly_ai_calls ?? 0
  const creditsBalance = usage?.credits_balance ?? 0

  const greeting = () => {
    const h = new Date().getHours()
    const name = user?.full_name?.split(' ')[0] || 'there'
    if (h < 12) return `Good morning, ${name} 👋`
    if (h < 18) return `Good afternoon, ${name} 👋`
    return `Good evening, ${name} 👋`
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-[#0F0F0F] mb-1">{greeting()}</h1>
          <p className="text-sm text-[#9E9E9E]">
            {(org as any)?.name ?? 'My Workspace'} ·{' '}
            <span className={cn('font-semibold px-1.5 py-0.5 rounded-full text-[10px]', planColor(plan))}>
              {planLabel(plan)} Plan
            </span>
          </p>
        </div>
        {(plan === 'free' || plan === 'starter') && (
          <Link href="/billing"
            className="flex items-center gap-2 bg-violet-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-violet-800 transition-all shadow-glow">
            <Sparkles size={13} /> Upgrade plan
          </Link>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Zap}          color="violet"  label="AI Calls"      value={creditsUsed}    sub="This month"         href="/billing" />
        <StatCard icon={MessageSquare}color="blue"    label="Chat sessions"  value={sessions.length} sub="Total"             href="/chat" />
        <StatCard icon={Bot}          color="emerald" label="Agent runs"     value="0"              sub="Autonomous tasks"    href="/agent" />
        <StatCard icon={CreditCard}   color="amber"   label="Credits"        value={creditsBalance} sub="Available"          href="/billing" />
      </div>

      <div className="bg-white border border-black/6 rounded-2xl p-5 shadow-soft mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Activity size={15} className="text-violet-600" />
          <span className="text-sm font-bold text-[#0F0F0F]">Plan: {planLabel(plan)}</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
          <div className="h-full rounded-full bg-violet-600 transition-all duration-700" style={{ width: '10%' }} />
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-[10px] text-[#B0B0B0]">Resets monthly</span>
          <Link href="/billing" className="text-[10px] font-bold text-violet-600 hover:text-violet-800">Upgrade →</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xs font-extrabold text-[#9E9E9E] uppercase tracking-widest mb-4">Quick actions</h2>
          <div className="space-y-2.5">
            <QuickAction icon={MessageSquare} href="/chat"      title="New chat"         desc="Start a conversation with DeepSeek AI" />
            <QuickAction icon={Bot}           href="/agent"     title="Run agent"        desc="Give AI a multi-step autonomous goal" />
            <QuickAction icon={Users}         href="/team"      title="Invite teammates" desc="Add colleagues to your workspace" />
            <QuickAction icon={CreditCard}    href="/billing"   title="Manage billing"   desc="View plans and upgrade your account" />
          </div>
        </div>

        <div>
          <h2 className="text-xs font-extrabold text-[#9E9E9E] uppercase tracking-widest mb-4">Recent chats</h2>
          <div className="bg-white border border-black/6 rounded-2xl shadow-soft overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw size={16} className="animate-spin text-violet-600" />
              </div>
            ) : sessions.length === 0 ? (
              <div className="py-8 text-center">
                <MessageSquare size={24} className="mx-auto text-gray-300 mb-2" />
                <p className="text-sm text-[#9E9E9E]">No chats yet. Start a conversation!</p>
                <Link href="/chat" className="inline-block mt-3 text-xs font-bold text-violet-600 hover:text-violet-800">
                  Start chatting →
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-black/4">
                {sessions.map((s: any) => (
                  <Link key={s.id} href={`/chat`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-all">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                      <MessageSquare size={12} className="text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#0F0F0F] truncate">{s.title || 'Chat session'}</p>
                      <p className="text-xs text-[#9E9E9E]">{s.created_at ? formatRelative(s.created_at) : ''}</p>
                    </div>
                    <ChevronRight size={12} className="text-gray-300 shrink-0" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
    }
