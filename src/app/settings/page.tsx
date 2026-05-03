'use client'
import { useState, useEffect } from 'react'
import { useAuthStore } from '@/lib/store'
import { orgs } from '@/lib/api'
import { getInitials, cn } from '@/lib/utils'
import { Copy, Check, Plus, Monitor, Download, Key, User, Building, CreditCard, LogOut, ChevronRight, ChevronLeft, ArrowLeft } from 'lucide-react'

type Tab = 'menu' | 'profile' | 'organization' | 'agent' | 'billing' | 'apikeys'

export default function SettingsPage() {
  const { user, org, logout } = useAuthStore()
  const [activeTab, setActiveTab] = useState<Tab>('menu')
  const [apiKeys, setApiKeys] = useState<any[]>([])
  const [newKeyName, setNewKeyName] = useState('')
  const [newKey, setNewKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [agentConnected, setAgentConnected] = useState(false)

  useEffect(() => {
    orgs.listApiKeys().then((data: any) => {
      setApiKeys(Array.isArray(data) ? data : (data?.api_keys ?? []))
    }).catch(() => {})
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
    if (token) {
      fetch('https://dacexy-backend-v7ku.onrender.com/api/v1/agent/desktop/status', {
        headers: { Authorization: `Bearer ${token}` }
      }).then(r => r.json()).then(d => setAgentConnected(d.connected ?? false)).catch(() => {})
    }
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

  const MENU_ITEMS = [
    { id: 'profile' as Tab, label: 'Profile', icon: User, sub: user?.full_name || '' },
    { id: 'organization' as Tab, label: 'Organization', icon: Building, sub: (org as any)?.name || 'My Workspace' },
    { id: 'agent' as Tab, label: 'Desktop Agent', icon: Monitor, sub: agentConnected ? 'Connected' : 'Not connected' },
    { id: 'billing' as Tab, label: 'Billing', icon: CreditCard, sub: (org as any)?.plan_tier || 'Free plan' },
    { id: 'apikeys' as Tab, label: 'API Keys', icon: Key, sub: `${apiKeys.length} key${apiKeys.length !== 1 ? 's' : ''}` },
  ]

  const tabTitle: Record<Tab, string> = {
    menu: 'Settings',
    profile: 'Profile',
    organization: 'Organization',
    agent: 'Desktop Agent',
    billing: 'Billing',
    apikeys: 'API Keys',
  }

  return (
    <div className="min-h-screen bg-[#F9F7F2]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 h-14 bg-white border-b border-black/6 sticky top-0 z-10">
        {activeTab !== 'menu' && (
          <button onClick={() => setActiveTab('menu')} className="p-2 hover:bg-gray-100 rounded-lg -ml-2">
            <ArrowLeft size={18} className="text-[#5C5C5C]" />
          </button>
        )}
        <h1 className="font-semibold text-base text-[#0F0F0F]">{tabTitle[activeTab]}</h1>
      </div>

      {/* Menu list — shown on main settings page */}
      {activeTab === 'menu' && (
        <div className="px-4 py-4 space-y-3">
          {/* Account card */}
          <div className="bg-white border border-black/6 rounded-2xl px-4 py-3 flex items-center justify-between shadow-soft">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center text-violet-700 font-bold text-sm">
                {user ? getInitials(user.full_name) : 'U'}
              </div>
              <div>
                <p className="text-sm font-semibold text-[#0F0F0F]">{user?.email}</p>
                <p className="text-xs text-[#9E9E9E]">{user?.full_name}</p>
              </div>
            </div>
            <span className="text-xs font-bold bg-violet-100 text-violet-700 px-2.5 py-1 rounded-full capitalize">
              {(org as any)?.plan_tier || 'Free'}
            </span>
          </div>

          {/* Nav items */}
          <div className="bg-white border border-black/6 rounded-2xl overflow-hidden shadow-soft">
            {MENU_ITEMS.map((item, i) => (
              <button key={item.id} onClick={() => setActiveTab(item.id)}
                className={cn('w-full flex items-center gap-4 px-4 py-4 text-left transition-all hover:bg-gray-50',
                  i < MENU_ITEMS.length - 1 && 'border-b border-black/4'
                )}>
                <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center shrink-0">
                  <item.icon size={16} className="text-violet-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#0F0F0F]">{item.label}</p>
                  <p className="text-xs text-[#9E9E9E] truncate">{item.sub}</p>
                </div>
                <ChevronRight size={16} className="text-[#C0C0C0] shrink-0" />
              </button>
            ))}
          </div>

          {/* Sign out */}
          <div className="bg-white border border-black/6 rounded-2xl overflow-hidden shadow-soft">
            <button onClick={handleLogout}
              className="w-full flex items-center gap-4 px-4 py-4 text-left hover:bg-red-50 transition-all">
              <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                <LogOut size={16} className="text-red-500" />
              </div>
              <p className="text-sm font-semibold text-red-500">Sign out</p>
            </button>
          </div>
        </div>
      )}

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="px-4 py-4 space-y-3">
          <div className="bg-white border border-black/6 rounded-2xl p-5 shadow-soft">
            <div className="flex items-center gap-4 mb-5 pb-5 border-b border-black/6">
              <div className="w-16 h-16 rounded-2xl bg-violet-100 flex items-center justify-center text-violet-700 text-xl font-bold">
                {user ? getInitials(user.full_name) : 'U'}
              </div>
              <div>
                <p className="font-semibold text-[#0F0F0F] text-base">{user?.full_name}</p>
                <p className="text-sm text-[#9E9E9E]">{user?.email}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="bg-[#F9F7F2] rounded-xl p-4">
                <p className="text-xs text-[#9E9E9E] mb-1 uppercase tracking-wide font-semibold">Role</p>
                <p className="text-sm font-semibold text-[#0F0F0F] capitalize">{user?.role || 'owner'}</p>
              </div>
              <div className="bg-[#F9F7F2] rounded-xl p-4">
                <p className="text-xs text-[#9E9E9E] mb-1 uppercase tracking-wide font-semibold">Email Status</p>
                <p className={cn('text-sm font-semibold', user?.is_verified ? 'text-green-600' : 'text-amber-600')}>
                  {user?.is_verified ? 'Verified ✓' : 'Not verified'}
                </p>
              </div>
              <div className="bg-[#F9F7F2] rounded-xl p-4">
                <p className="text-xs text-[#9E9E9E] mb-1 uppercase tracking-wide font-semibold">Account Type</p>
                <p className="text-sm font-semibold text-[#0F0F0F]">Personal</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Organization Tab */}
      {activeTab === 'organization' && (
        <div className="px-4 py-4 space-y-3">
          <div className="bg-white border border-black/6 rounded-2xl p-5 shadow-soft">
            <div className="space-y-3">
              {[
                { label: 'Name', value: (org as any)?.name || 'My Workspace' },
                { label: 'Plan', value: (org as any)?.plan_tier || 'Free' },
                { label: 'Credits Balance', value: String((org as any)?.credits_balance ?? 0) },
                { label: 'AI Calls This Month', value: String((org as any)?.monthly_ai_calls ?? 0) },
              ].map(item => (
                <div key={item.label} className="bg-[#F9F7F2] rounded-xl p-4">
                  <p className="text-xs text-[#9E9E9E] mb-1 uppercase tracking-wide font-semibold">{item.label}</p>
                  <p className="text-sm font-semibold text-[#0F0F0F] capitalize">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Desktop Agent Tab */}
      {activeTab === 'agent' && (
        <div className="px-4 py-4 space-y-3">
          <div className="bg-white border border-black/6 rounded-2xl p-5 shadow-soft">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm font-semibold text-[#0F0F0F]">Connection Status</p>
              <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full', agentConnected ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500')}>
                {agentConnected ? '● Connected' : '○ Not connected'}
              </span>
            </div>
            <p className="text-sm text-[#9E9E9E] mb-5">
              Install the desktop agent to let Dacexy AI control your computer 24/7 with voice and chat.
            </p>

            <div className="bg-violet-50 border border-violet-200 rounded-xl p-4 mb-5">
              <p className="text-xs font-semibold text-violet-700 mb-1">Login with your Dacexy account when asked</p>
              <p className="text-xs text-violet-600">Use the same email and password you use on this website</p>
            </div>

            <p className="text-xs font-semibold text-[#5C5C5C] uppercase tracking-wide mb-3">Download</p>
            <div className="space-y-2 mb-5">
              <a href="https://dacexy-backend-v7ku.onrender.com/api/v1/agent/download/windows"
                className="flex items-center gap-3 bg-[#F9F7F2] hover:bg-gray-100 border border-black/8 rounded-xl px-4 py-3.5 transition-all">
                <Download size={15} className="text-[#9E9E9E] shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-[#0F0F0F]">Windows</p>
                  <p className="text-xs text-[#9E9E9E]">Double click to install</p>
                </div>
                <ChevronRight size={14} className="text-[#C0C0C0] ml-auto" />
              </a>
              <a href="https://raw.githubusercontent.com/dacexyai/Dacexy-backend/main/desktop_agent/install_mac.sh"
                download="install_dacexy_agent.sh"
                className="flex items-center gap-3 bg-[#F9F7F2] hover:bg-gray-100 border border-black/8 rounded-xl px-4 py-3.5 transition-all">
                <Download size={15} className="text-[#9E9E9E] shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-[#0F0F0F]">macOS</p>
                  <p className="text-xs text-[#9E9E9E]">Run in terminal</p>
                </div>
                <ChevronRight size={14} className="text-[#C0C0C0] ml-auto" />
              </a>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-amber-700 mb-2">How to use</p>
              <ol className="text-xs text-amber-800 space-y-1.5 list-decimal list-inside">
                <li>Download and run the installer</li>
                <li>Enter your Dacexy email and password</li>
                <li>Agent starts automatically and connects</li>
                <li>Say "Hey Dacexy" or use Agent button in chat</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* Billing Tab */}
      {activeTab === 'billing' && (
        <div className="px-4 py-4 space-y-3">
          <div className="bg-white border border-black/6 rounded-2xl p-5 shadow-soft">
            <div className="bg-violet-50 border border-violet-200 rounded-xl p-4 mb-5">
              <p className="text-xs text-violet-600 font-semibold uppercase tracking-wide mb-1">Current Plan</p>
              <p className="text-2xl font-bold text-[#0F0F0F] capitalize">{(org as any)?.plan_tier || 'Free'}</p>
            </div>
            <div className="space-y-3">
              {[
                { name: 'Starter', price: '₹999/mo', calls: '1,000 AI calls' },
                { name: 'Growth', price: '₹2,999/mo', calls: '10,000 AI calls' },
                { name: 'Enterprise', price: '₹9,999/mo', calls: 'Unlimited calls' },
              ].map(plan => (
                <div key={plan.name} className="flex items-center justify-between bg-[#F9F7F2] rounded-xl px-4 py-3.5">
                  <div>
                    <p className="text-sm font-semibold text-[#0F0F0F]">{plan.name}</p>
                    <p className="text-xs text-[#9E9E9E]">{plan.calls}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-bold text-violet-700">{plan.price}</p>
                    <button className="px-3 py-1.5 bg-violet-700 hover:bg-violet-800 text-white text-xs font-semibold rounded-lg transition-all">
                      Upgrade
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* API Keys Tab */}
      {activeTab === 'apikeys' && (
        <div className="px-4 py-4 space-y-3">
          {newKey && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
              <p className="text-xs font-semibold text-green-700 mb-2">New key — copy now, won't show again</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs font-mono text-green-800 bg-white border border-green-200 rounded-lg px-3 py-2 truncate">{newKey}</code>
                <button onClick={() => copyText(newKey, 'newkey')} className="p-2 hover:bg-green-100 rounded-lg">
                  {copied === 'newkey' ? <Check size={14} className="text-green-600" /> : <Copy size={14} className="text-green-600" />}
                </button>
              </div>
            </div>
          )}
          <div className="bg-white border border-black/6 rounded-2xl p-5 shadow-soft">
            <div className="flex gap-2 mb-4">
              <input value={newKeyName} onChange={e => setNewKeyName(e.target.value)}
                placeholder="Key name e.g. Production"
                className="flex-1 px-3 py-2.5 bg-[#F9F7F2] border border-black/8 rounded-xl text-sm focus:outline-none focus:border-violet-400 transition-all" />
              <button onClick={createKey} disabled={loading || !newKeyName.trim()}
                className="flex items-center gap-1.5 px-3 py-2.5 bg-violet-700 hover:bg-violet-800 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all">
                <Plus size={13} /> Create
              </button>
            </div>
            <div className="space-y-2">
              {apiKeys.length === 0 ? (
                <p className="text-sm text-[#9E9E9E] text-center py-6">No API keys yet</p>
              ) : apiKeys.map((k: any) => (
                <div key={k.id} className="flex items-center justify-between p-3.5 bg-[#F9F7F2] rounded-xl">
                  <div>
                    <p className="text-sm font-semibold text-[#0F0F0F]">{k.name}</p>
                    <p className="text-xs text-[#9E9E9E] font-mono mt-0.5">{k.key_prefix}••••••••</p>
                  </div>
                  <p className="text-xs text-[#B0B0B0]">{k.created_at ? new Date(k.created_at).toLocaleDateString() : ''}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
      }
