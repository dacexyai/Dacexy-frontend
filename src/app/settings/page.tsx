'use client'
import { useState, useEffect } from 'react'
import { useAuthStore } from '@/lib/store'
import { orgs } from '@/lib/api'
import { getInitials, cn } from '@/lib/utils'
import { Copy, Check, Plus, Monitor, Download, Key, User, Building, CreditCard, LogOut, ChevronRight, ArrowLeft, Sparkles, Shield, Gift, Users, Check as CheckIcon, Bot, MessageSquare } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

type Tab = 'menu' | 'profile' | 'organization' | 'agent' | 'billing' | 'apikeys' | 'team' | 'referral'

const API = 'https://dacexy-backend-v7ku.onrender.com/api/v1'

export default function SettingsPage() {
  const { user, org, logout } = useAuthStore()
  const [activeTab, setActiveTab] = useState<Tab>('menu')
  const [apiKeys, setApiKeys] = useState<any[]>([])
  const [newKeyName, setNewKeyName] = useState('')
  const [newKey, setNewKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [agentConnected, setAgentConnected] = useState(false)
  const [usage, setUsage] = useState<any>(null)

  const plan = (org as any)?.plan_tier ?? 'free'

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
    if (!token) return

    orgs.listApiKeys().then((data: any) => {
      setApiKeys(Array.isArray(data) ? data : (data?.api_keys ?? []))
    }).catch(() => {})

    fetch(`${API}/agent/desktop/status`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => setAgentConnected(d.connected ?? false)).catch(() => {})

    fetch(`${API}/billing/usage`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setUsage).catch(() => {})
  }, [])

  async function createKey() {
    if (!newKeyName.trim()) return
    setLoading(true)
    try {
      const data = await orgs.createApiKey(newKeyName)
      setNewKey(data.key)
      setNewKeyName('')
      orgs.listApiKeys().then((data: any) => {
        setApiKeys(Array.isArray(data) ? data : (data?.api_keys ?? []))
      }).catch(() => {})
    } catch (err: any) { alert(err.message) }
    finally { setLoading(false) }
  }

  function copyText(text: string, id: string) {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  function handleLogout() {
    logout()
    localStorage.removeItem('access_token')
    window.location.replace('/login')
  }

  const tabTitle: Record<Tab, string> = {
    menu: 'Settings', profile: 'Profile', organization: 'Organization',
    agent: 'Desktop Agent', billing: 'Billing & Plans', apikeys: 'API Keys',
    team: 'Team', referral: 'Referrals',
  }

  const MENU_ITEMS = [
    {
      section: 'Account',
      items: [
        { id: 'profile' as Tab, label: 'Profile', icon: User, sub: user?.email || '' },
        { id: 'organization' as Tab, label: 'Organization', icon: Building, sub: (org as any)?.name || 'My Workspace' },
        { id: 'billing' as Tab, label: 'Billing & Plans', icon: CreditCard, sub: plan.charAt(0).toUpperCase() + plan.slice(1) + ' Plan', highlight: plan === 'free' },
      ]
    },
    {
      section: 'Features',
      items: [
        { id: 'agent' as Tab, label: 'Desktop Agent', icon: Monitor, sub: agentConnected ? '🟢 Connected' : '⚪ Not connected' },
        { id: 'apikeys' as Tab, label: 'API Keys', icon: Key, sub: `${apiKeys.length} active key${apiKeys.length !== 1 ? 's' : ''}` },
      ]
    },
    {
      section: 'Workspace',
      items: [
        { id: 'team' as Tab, label: 'Team', icon: Users, sub: 'Manage members' },
        { id: 'referral' as Tab, label: 'Referrals', icon: Gift, sub: 'Earn credits' },
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-[#F9F7F2]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 h-14 bg-white border-b border-black/6 sticky top-0 z-10">
        {activeTab !== 'menu' && (
          <button onClick={() => setActiveTab('menu')} className="p-2 hover:bg-gray-100 rounded-xl -ml-1 transition-all">
            <ArrowLeft size={18} className="text-[#5C5C5C]" />
          </button>
        )}
        <h1 className="font-semibold text-base text-[#0F0F0F]">{tabTitle[activeTab]}</h1>
      </div>

      {/* ══════════ MENU ══════════ */}
      {activeTab === 'menu' && (
        <div className="px-4 py-5 space-y-4 max-w-2xl mx-auto">

          {/* Hero account card */}
          <div className="relative bg-gradient-to-br from-violet-700 via-violet-600 to-purple-700 rounded-3xl p-5 overflow-hidden shadow-lg">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
            </div>
            <div className="relative flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-white font-bold text-xl shrink-0">
                {user ? getInitials(user.full_name) : 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-base truncate">{user?.full_name}</p>
                <p className="text-white/70 text-sm truncate">{user?.email}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[10px] font-bold bg-white/20 text-white px-2.5 py-0.5 rounded-full capitalize">
                    {plan} Plan
                  </span>
                  {user?.is_verified && (
                    <span className="text-[10px] font-bold bg-white/20 text-white px-2 py-0.5 rounded-full">✓ Verified</span>
                  )}
                </div>
              </div>
              {plan === 'free' && (
                <button onClick={() => setActiveTab('billing')}
                  className="shrink-0 flex items-center gap-1.5 bg-white text-violet-700 font-bold text-xs px-3 py-2 rounded-xl hover:bg-white/90 transition-all">
                  <Sparkles size={11} /> Upgrade
                </button>
              )}
            </div>
            {/* Quick stats */}
            <div className="relative grid grid-cols-3 gap-2 mt-4">
              {[
                { label: 'AI Calls', value: usage?.monthly_ai_calls ?? 0 },
                { label: 'API Keys', value: apiKeys.length },
                { label: 'Agent', value: agentConnected ? 'On' : 'Off' },
              ].map(stat => (
                <div key={stat.label} className="bg-white/10 backdrop-blur rounded-xl p-2.5 text-center">
                  <p className="text-white font-bold text-lg leading-tight">{stat.value}</p>
                  <p className="text-white/60 text-[10px] font-medium">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-2 gap-3">
            <Link href="/chat" className="bg-white border border-black/6 rounded-2xl p-4 flex items-center gap-3 hover:bg-gray-50 transition-all shadow-soft">
              <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center">
                <MessageSquare size={16} className="text-violet-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#0F0F0F]">AI Chat</p>
                <p className="text-xs text-[#9E9E9E]">Start chatting</p>
              </div>
            </Link>
            <Link href="/agent" className="bg-white border border-black/6 rounded-2xl p-4 flex items-center gap-3 hover:bg-gray-50 transition-all shadow-soft">
              <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center">
                <Bot size={16} className="text-violet-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#0F0F0F]">Agent Runs</p>
                <p className="text-xs text-[#9E9E9E]">Automate tasks</p>
              </div>
            </Link>
          </div>

          {/* Nav sections */}
          {MENU_ITEMS.map(section => (
            <div key={section.section}>
              <p className="text-[10px] font-extrabold text-[#B0B0B0] uppercase tracking-widest px-1 mb-2">{section.section}</p>
              <div className="bg-white border border-black/6 rounded-2xl overflow-hidden shadow-soft">
                {section.items.map((item, i) => (
                  <button key={item.id} onClick={() => setActiveTab(item.id)}
                    className={cn('w-full flex items-center gap-4 px-4 py-4 text-left transition-all hover:bg-gray-50',
                      i < section.items.length - 1 && 'border-b border-black/4'
                    )}>
                    <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0',
                      item.highlight ? 'bg-gradient-to-br from-violet-500 to-purple-600' : 'bg-[#F2EFE8]'
                    )}>
                      <item.icon size={16} className={item.highlight ? 'text-white' : 'text-[#5C5C5C]'} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#0F0F0F]">{item.label}</p>
                      <p className="text-xs text-[#9E9E9E] truncate">{item.sub}</p>
                    </div>
                    <ChevronRight size={15} className="text-[#C0C0C0] shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Sign out */}
          <div className="bg-white border border-black/6 rounded-2xl overflow-hidden shadow-soft">
            <button onClick={handleLogout}
              className="w-full flex items-center gap-4 px-4 py-4 text-left hover:bg-red-50 transition-all">
              <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                <LogOut size={16} className="text-red-500" />
              </div>
              <p className="text-sm font-semibold text-red-500 flex-1">Sign out</p>
              <ChevronRight size={15} className="text-red-300" />
            </button>
          </div>

          <p className="text-center text-xs text-[#C0C0C0] pb-4">Dacexy v5.0 · Built with ❤️</p>
        </div>
      )}

      {/* ══════════ PROFILE ══════════ */}
      {activeTab === 'profile' && (
        <div className="px-4 py-5 space-y-3 max-w-2xl mx-auto">
          <div className="bg-white border border-black/6 rounded-2xl overflow-hidden shadow-soft">
            <div className="bg-gradient-to-br from-violet-700 to-purple-700 px-5 pt-8 pb-12 relative">
              <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-white font-bold text-2xl mx-auto">
                {user ? getInitials(user.full_name) : 'U'}
              </div>
            </div>
            <div className="-mt-6 px-5 pb-5">
              <div className="bg-white border border-black/8 rounded-2xl p-4 shadow-sm mb-4">
                <p className="text-base font-bold text-[#0F0F0F] text-center">{user?.full_name}</p>
                <p className="text-sm text-[#9E9E9E] text-center">{user?.email}</p>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Role', value: user?.role || 'Owner', capitalize: true },
                  { label: 'Email Status', value: user?.is_verified ? 'Verified ✓' : 'Not verified', color: user?.is_verified ? 'text-green-600' : 'text-amber-600' },
                  { label: 'Plan', value: plan.charAt(0).toUpperCase() + plan.slice(1) },
                  { label: 'Account Type', value: 'Personal' },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between bg-[#F9F7F2] rounded-xl px-4 py-3">
                    <p className="text-sm text-[#9E9E9E] font-medium">{item.label}</p>
                    <p className={cn('text-sm font-bold text-[#0F0F0F]', item.color, item.capitalize && 'capitalize')}>
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ ORGANIZATION ══════════ */}
      {activeTab === 'organization' && (
        <div className="px-4 py-5 space-y-3 max-w-2xl mx-auto">
          <div className="bg-white border border-black/6 rounded-2xl p-5 shadow-soft">
            <div className="flex items-center gap-3 mb-5 pb-5 border-b border-black/6">
              <div className="w-12 h-12 rounded-2xl bg-violet-100 flex items-center justify-center">
                <Building size={20} className="text-violet-600" />
              </div>
              <div>
                <p className="font-bold text-[#0F0F0F]">{(org as any)?.name || 'My Workspace'}</p>
                <p className="text-xs text-[#9E9E9E] capitalize">{plan} Plan</p>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Workspace Name', value: (org as any)?.name || 'My Workspace' },
                { label: 'Plan Tier', value: plan.charAt(0).toUpperCase() + plan.slice(1), capitalize: true },
                { label: 'Credits Balance', value: String((org as any)?.credits_balance ?? 0) },
                { label: 'AI Calls This Month', value: String(usage?.monthly_ai_calls ?? 0) },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between bg-[#F9F7F2] rounded-xl px-4 py-3">
                  <p className="text-sm text-[#9E9E9E] font-medium">{item.label}</p>
                  <p className={cn('text-sm font-bold text-[#0F0F0F]', item.capitalize && 'capitalize')}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════ BILLING ══════════ */}
      {activeTab === 'billing' && (
        <div className="px-4 py-5 space-y-4 max-w-2xl mx-auto">
          {/* Current plan hero */}
          <div className="bg-gradient-to-br from-violet-700 to-purple-700 rounded-2xl p-5 text-white shadow-lg">
            <p className="text-white/70 text-xs font-semibold uppercase tracking-wide mb-1">Current Plan</p>
            <p className="text-3xl font-bold capitalize mb-3">{plan}</p>
            <div className="flex items-center gap-3 text-sm text-white/80">
              <span>✓ {usage?.monthly_ai_calls ?? 0} AI calls used</span>
              <span>✓ {apiKeys.length} API keys</span>
            </div>
          </div>

          {/* Plans */}
          <p className="text-xs font-extrabold text-[#B0B0B0] uppercase tracking-widest px-1">Choose a Plan</p>
          {[
            {
              id: 'free', name: 'Free', price: '₹0', period: '/mo', color: 'border-black/8',
              features: ['100 AI calls/month', '1 workspace member', 'Basic AI chat', 'Website builder'],
              current: plan === 'free'
            },
            {
              id: 'starter', name: 'Starter', price: '₹999', period: '/mo', color: 'border-violet-300', popular: false,
              features: ['1,000 AI calls/month', '3 workspace members', 'Image generation', 'Agent runs', 'Priority support'],
              current: plan === 'starter'
            },
            {
              id: 'growth', name: 'Growth', price: '₹2,999', period: '/mo', color: 'border-violet-500 ring-2 ring-violet-200', popular: true,
              features: ['10,000 AI calls/month', '10 workspace members', 'Video generation', 'Desktop agent', 'Advanced analytics', 'API access'],
              current: plan === 'growth'
            },
            {
              id: 'enterprise', name: 'Enterprise', price: '₹9,999', period: '/mo', color: 'border-black/8',
              features: ['Unlimited AI calls', 'Unlimited members', 'All features included', 'Dedicated support', 'Custom integrations', 'SLA guarantee'],
              current: plan === 'enterprise'
            },
          ].map(p => (
            <div key={p.id} className={cn('bg-white border rounded-2xl p-5 shadow-soft relative', p.color)}>
              {p.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-violet-600 to-purple-600 text-white text-[10px] font-bold px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-bold text-[#0F0F0F] text-base">{p.name}</p>
                  <div className="flex items-baseline gap-0.5 mt-0.5">
                    <span className="text-2xl font-bold text-violet-700">{p.price}</span>
                    <span className="text-sm text-[#9E9E9E]">{p.period}</span>
                  </div>
                </div>
                {p.current ? (
                  <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2.5 py-1 rounded-full">Current</span>
                ) : (
                  <button className="bg-violet-700 hover:bg-violet-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all">
                    Upgrade
                  </button>
                )}
              </div>
              <div className="space-y-1.5">
                {p.features.map(f => (
                  <div key={f} className="flex items-center gap-2">
                    <CheckIcon size={12} className="text-violet-600 shrink-0" />
                    <p className="text-xs text-[#5C5C5C]">{f}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ══════════ DESKTOP AGENT ══════════ */}
      {activeTab === 'agent' && (
        <div className="px-4 py-5 space-y-3 max-w-2xl mx-auto">
          {/* Status banner */}
          <div className={cn('rounded-2xl p-4 flex items-center gap-3', agentConnected ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200')}>
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', agentConnected ? 'bg-green-100' : 'bg-amber-100')}>
              <Monitor size={18} className={agentConnected ? 'text-green-600' : 'text-amber-600'} />
            </div>
            <div>
              <p className={cn('text-sm font-bold', agentConnected ? 'text-green-700' : 'text-amber-700')}>
                {agentConnected ? 'Agent Connected ✓' : 'Agent Not Connected'}
              </p>
              <p className={cn('text-xs', agentConnected ? 'text-green-600' : 'text-amber-600')}>
                {agentConnected ? 'Dacexy can control your computer' : 'Download and run the installer below'}
              </p>
            </div>
          </div>

          {/* What it can do */}
          <div className="bg-white border border-black/6 rounded-2xl p-5 shadow-soft">
            <p className="text-sm font-bold text-[#0F0F0F] mb-3">What the agent can do</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                '🖥️ Control your screen', '🖱️ Click & type anywhere',
                '🎤 Voice commands', '📧 Send emails',
                '🌐 Browse the web', '📁 Manage files',
                '⚡ Run automations', '🔊 Talk back to you',
              ].map(item => (
                <div key={item} className="bg-[#F9F7F2] rounded-xl px-3 py-2.5 text-xs font-medium text-[#5C5C5C]">{item}</div>
              ))}
            </div>
          </div>

          {/* Download */}
          <div className="bg-white border border-black/6 rounded-2xl p-5 shadow-soft">
            <p className="text-xs font-extrabold text-[#B0B0B0] uppercase tracking-widest mb-3">Download Installer</p>
            <div className="space-y-2">
              <a href="https://dacexy-backend-v7ku.onrender.com/api/v1/agent/download/windows"
                className="flex items-center gap-3 bg-[#F9F7F2] hover:bg-violet-50 border border-black/8 hover:border-violet-200 rounded-xl px-4 py-3.5 transition-all">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                  <span className="text-base">🪟</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#0F0F0F]">Windows</p>
                  <p className="text-xs text-[#9E9E9E]">Double click to install automatically</p>
                </div>
                <Download size={14} className="text-[#9E9E9E]" />
              </a>
              <a href="https://raw.githubusercontent.com/dacexyai/Dacexy-backend/main/desktop_agent/install_mac.sh"
                download="install_dacexy_agent.sh"
                className="flex items-center gap-3 bg-[#F9F7F2] hover:bg-violet-50 border border-black/8 hover:border-violet-200 rounded-xl px-4 py-3.5 transition-all">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                  <span className="text-base">🍎</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#0F0F0F]">macOS</p>
                  <p className="text-xs text-[#9E9E9E]">Run in terminal</p>
                </div>
                <Download size={14} className="text-[#9E9E9E]" />
              </a>
              <a href="https://raw.githubusercontent.com/dacexyai/Dacexy-backend/main/desktop_agent/install_linux.sh"
                download="install_linux.sh"
                className="flex items-center gap-3 bg-[#F9F7F2] hover:bg-violet-50 border border-black/8 hover:border-violet-200 rounded-xl px-4 py-3.5 transition-all">
                <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                  <span className="text-base">🐧</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#0F0F0F]">Linux</p>
                  <p className="text-xs text-[#9E9E9E]">Run in terminal</p>
                </div>
                <Download size={14} className="text-[#9E9E9E]" />
              </a>
            </div>
          </div>

          {/* How to use */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
            <p className="text-sm font-bold text-amber-700 mb-3">How to set up</p>
            <div className="space-y-3">
              {[
                { step: '1', text: 'Download the installer for your OS above' },
                { step: '2', text: 'Double click it — installs Python and everything automatically' },
                { step: '3', text: 'Enter your Dacexy email and password when asked' },
                { step: '4', text: 'Agent connects and shows "Remote control connected"' },
                { step: '5', text: 'Say "Hey Dacexy" or use the Agent button in chat' },
              ].map(item => (
                <div key={item.step} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-amber-200 text-amber-800 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{item.step}</span>
                  <p className="text-sm text-amber-800">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════ API KEYS ══════════ */}
      {activeTab === 'apikeys' && (
        <div className="px-4 py-5 space-y-3 max-w-2xl mx-auto">
          {newKey && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
              <p className="text-xs font-bold text-green-700 mb-2">⚠️ Copy now — won't show again!</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs font-mono text-green-800 bg-white border border-green-200 rounded-xl px-3 py-2.5 truncate">{newKey}</code>
                <button onClick={() => copyText(newKey, 'newkey')} className="p-2.5 bg-green-100 hover:bg-green-200 rounded-xl transition-all">
                  {copied === 'newkey' ? <Check size={14} className="text-green-600" /> : <Copy size={14} className="text-green-600" />}
                </button>
              </div>
            </div>
          )}
          <div className="bg-white border border-black/6 rounded-2xl p-5 shadow-soft">
            <p className="text-sm font-bold text-[#0F0F0F] mb-3">Create New Key</p>
            <div className="flex gap-2 mb-5">
              <input value={newKeyName} onChange={e => setNewKeyName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && createKey()}
                placeholder="e.g. Production, Development..."
                className="flex-1 px-4 py-3 bg-[#F9F7F2] border border-black/8 rounded-xl text-sm focus:outline-none focus:border-violet-400 transition-all" />
              <button onClick={createKey} disabled={loading || !newKeyName.trim()}
                className="flex items-center gap-1.5 px-4 py-3 bg-violet-700 hover:bg-violet-800 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-all">
                <Plus size={14} /> Create
              </button>
            </div>
            <p className="text-xs font-extrabold text-[#B0B0B0] uppercase tracking-widest mb-3">Your Keys</p>
            {apiKeys.length === 0 ? (
              <div className="text-center py-8">
                <Key size={24} className="mx-auto text-[#D0D0D0] mb-2" />
                <p className="text-sm text-[#9E9E9E]">No API keys yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {apiKeys.map((k: any) => (
                  <div key={k.id} className="flex items-center justify-between p-4 bg-[#F9F7F2] rounded-xl">
                    <div>
                      <p className="text-sm font-bold text-[#0F0F0F]">{k.name}</p>
                      <p className="text-xs text-[#9E9E9E] font-mono mt-0.5">{k.key_prefix}••••••••••••</p>
                    </div>
                    <p className="text-xs text-[#B0B0B0]">{k.created_at ? new Date(k.created_at).toLocaleDateString() : ''}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════ TEAM ══════════ */}
      {activeTab === 'team' && (
        <div className="px-4 py-5 max-w-2xl mx-auto">
          <div className="bg-white border border-black/6 rounded-2xl p-5 shadow-soft">
            <div className="text-center py-8">
              <Users size={32} className="mx-auto text-[#D0D0D0] mb-3" />
              <p className="text-base font-bold text-[#0F0F0F] mb-1">Team Management</p>
              <p className="text-sm text-[#9E9E9E] mb-4">Invite team members to collaborate on your workspace</p>
              <button onClick={() => setActiveTab('billing')}
                className="inline-flex items-center gap-2 bg-violet-700 hover:bg-violet-800 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all">
                <Sparkles size={13} /> Upgrade to invite members
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ REFERRAL ══════════ */}
      {activeTab === 'referral' && (
        <div className="px-4 py-5 space-y-3 max-w-2xl mx-auto">
          <div className="bg-gradient-to-br from-violet-700 to-purple-700 rounded-2xl p-5 text-white shadow-lg">
            <p className="text-xl font-bold mb-1">Earn Free Credits 🎁</p>
            <p className="text-white/70 text-sm">Invite friends and get ₹500 credits for each signup</p>
          </div>
          <div className="bg-white border border-black/6 rounded-2xl p-5 shadow-soft">
            <p className="text-sm font-bold text-[#0F0F0F] mb-3">Your Referral Link</p>
            <div className="flex items-center gap-2 bg-[#F9F7F2] border border-black/8 rounded-xl px-4 py-3">
              <p className="text-sm text-[#5C5C5C] flex-1 truncate font-mono">https://dacexy.vercel.app/register?ref=...</p>
              <button onClick={() => copyText('https://dacexy.vercel.app/register', 'ref')}
                className="p-1.5 hover:bg-gray-200 rounded-lg transition-all">
                {copied === 'ref' ? <Check size={14} className="text-green-600" /> : <Copy size={14} className="text-[#9E9E9E]" />}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="bg-violet-50 rounded-xl p-3 text-center">
                <p className="text-xl font-bold text-violet-700">0</p>
                <p className="text-xs text-violet-600">Total Referrals</p>
              </div>
              <div className="bg-green-50 rounded-xl p-3 text-center">
                <p className="text-xl font-bold text-green-700">₹0</p>
                <p className="text-xs text-green-600">Credits Earned</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
