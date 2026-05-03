'use client'
import { useState, useEffect } from 'react'
import { useAuthStore } from '@/lib/store'
import { orgs } from '@/lib/api'
import { getInitials, cn } from '@/lib/utils'
import { Copy, Check, Plus, Monitor, Download, Key, User, Building, CreditCard, Settings, ChevronRight, LogOut } from 'lucide-react'

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'organization', label: 'Organization', icon: Building },
  { id: 'agent', label: 'Desktop Agent', icon: Monitor },
  { id: 'billing', label: 'Billing', icon: CreditCard },
  { id: 'apikeys', label: 'API Keys', icon: Key },
]

export default function SettingsPage() {
  const { user, org, logout } = useAuthStore()
  const [activeTab, setActiveTab] = useState('profile')
  const [apiKeys, setApiKeys] = useState<any[]>([])
  const [newKeyName, setNewKeyName] = useState('')
  const [newKey, setNewKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [agentToken] = useState('dxd_' + Math.random().toString(36).slice(2, 18).toUpperCase())
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

  return (
    <div className="min-h-screen bg-[#F9F7F2]">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-semibold text-[#0F0F0F] mb-1">Settings</h1>
          <p className="text-sm text-[#9E9E9E]">Manage your account, workspace and integrations</p>
        </div>

        <div className="flex gap-6">
          {/* Left nav */}
          <div className="w-52 shrink-0">
            <div className="bg-white border border-black/6 rounded-2xl overflow-hidden shadow-soft">
              {TABS.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={cn('w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all text-left border-b border-black/4 last:border-0',
                    activeTab === tab.id ? 'bg-violet-50 text-violet-700' : 'text-[#5C5C5C] hover:bg-gray-50'
                  )}>
                  <tab.icon size={15} className={activeTab === tab.id ? 'text-violet-600' : 'text-[#9E9E9E]'} />
                  {tab.label}
                  {activeTab === tab.id && <ChevronRight size={13} className="ml-auto text-violet-400" />}
                </button>
              ))}
              <button onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 transition-all text-left">
                <LogOut size={15} /> Sign out
              </button>
            </div>
          </div>

          {/* Right content */}
          <div className="flex-1 min-w-0">

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white border border-black/6 rounded-2xl p-6 shadow-soft">
                <h2 className="font-semibold text-lg text-[#0F0F0F] mb-6">Profile</h2>
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-black/6">
                  <div className="w-16 h-16 rounded-2xl bg-violet-100 flex items-center justify-center text-violet-700 text-xl font-bold">
                    {user ? getInitials(user.full_name) : 'U'}
                  </div>
                  <div>
                    <p className="font-semibold text-[#0F0F0F] text-lg">{user?.full_name}</p>
                    <p className="text-sm text-[#9E9E9E]">{user?.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
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
                    <p className="text-xs text-[#9E9E9E] mb-1 uppercase tracking-wide font-semibold">Member Since</p>
                    <p className="text-sm font-semibold text-[#0F0F0F]">2026</p>
                  </div>
                  <div className="bg-[#F9F7F2] rounded-xl p-4">
                    <p className="text-xs text-[#9E9E9E] mb-1 uppercase tracking-wide font-semibold">Account Type</p>
                    <p className="text-sm font-semibold text-[#0F0F0F]">Personal</p>
                  </div>
                </div>
              </div>
            )}

            {/* Organization Tab */}
            {activeTab === 'organization' && (
              <div className="bg-white border border-black/6 rounded-2xl p-6 shadow-soft">
                <h2 className="font-semibold text-lg text-[#0F0F0F] mb-6">Organization</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#F9F7F2] rounded-xl p-4">
                    <p className="text-xs text-[#9E9E9E] mb-1 uppercase tracking-wide font-semibold">Name</p>
                    <p className="text-sm font-semibold text-[#0F0F0F]">{(org as any)?.name || 'My Workspace'}</p>
                  </div>
                  <div className="bg-[#F9F7F2] rounded-xl p-4">
                    <p className="text-xs text-[#9E9E9E] mb-1 uppercase tracking-wide font-semibold">Plan</p>
                    <p className="text-sm font-semibold text-[#0F0F0F] capitalize">{(org as any)?.plan_tier || 'Free'}</p>
                  </div>
                  <div className="bg-[#F9F7F2] rounded-xl p-4">
                    <p className="text-xs text-[#9E9E9E] mb-1 uppercase tracking-wide font-semibold">Credits</p>
                    <p className="text-sm font-semibold text-[#0F0F0F]">{(org as any)?.credits_balance ?? 0}</p>
                  </div>
                  <div className="bg-[#F9F7F2] rounded-xl p-4">
                    <p className="text-xs text-[#9E9E9E] mb-1 uppercase tracking-wide font-semibold">AI Calls This Month</p>
                    <p className="text-sm font-semibold text-[#0F0F0F]">{(org as any)?.monthly_ai_calls ?? 0}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Desktop Agent Tab */}
            {activeTab === 'agent' && (
              <div className="space-y-4">
                <div className="bg-white border border-black/6 rounded-2xl p-6 shadow-soft">
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="font-semibold text-lg text-[#0F0F0F]">Desktop Agent</h2>
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Beta</span>
                    <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full ml-auto', agentConnected ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500')}>
                      {agentConnected ? '● Connected' : '○ Not connected'}
                    </span>
                  </div>
                  <p className="text-sm text-[#9E9E9E] mb-5">
                    Install the desktop agent to let Dacexy AI control your screen, mouse, keyboard and respond to voice commands 24/7.
                  </p>

                  <div className="bg-violet-50 border border-violet-200 rounded-xl p-4 mb-5">
                    <p className="text-xs font-semibold text-violet-700 mb-2">Your Agent Token</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-xs font-mono text-violet-800 bg-white border border-violet-200 rounded-lg px-3 py-2 truncate">
                        {agentToken}
                      </code>
                      <button onClick={() => copyText(agentToken, 'token')} className="p-2 hover:bg-violet-100 rounded-lg transition-colors">
                        {copied === 'token' ? <Check size={14} className="text-green-600" /> : <Copy size={14} className="text-violet-600" />}
                      </button>
                    </div>
                    <p className="text-[10px] text-violet-600 mt-2">Use your email and password when the agent asks — not this token</p>
                  </div>

                  <p className="text-xs font-semibold text-[#5C5C5C] uppercase tracking-wide mb-3">Download Installer</p>
                  <div className="grid grid-cols-1 gap-2 mb-4">
                    <a href="https://dacexy-backend-v7ku.onrender.com/api/v1/agent/download/windows"
                      className="flex items-center gap-3 bg-[#F9F7F2] hover:bg-gray-100 border border-black/8 rounded-xl px-4 py-3 transition-all">
                      <Download size={15} className="text-[#9E9E9E]" />
                      <div>
                        <p className="text-sm font-semibold text-[#0F0F0F]">Windows</p>
                        <p className="text-xs text-[#9E9E9E]">install_windows.bat — double click to install</p>
                      </div>
                    </a>
                    <a href="https://raw.githubusercontent.com/dacexyai/Dacexy-backend/main/desktop_agent/install_mac.sh"
                      download="install_dacexy_agent.sh"
                      className="flex items-center gap-3 bg-[#F9F7F2] hover:bg-gray-100 border border-black/8 rounded-xl px-4 py-3 transition-all">
                      <Download size={15} className="text-[#9E9E9E]" />
                      <div>
                        <p className="text-sm font-semibold text-[#0F0F0F]">macOS</p>
                        <p className="text-xs text-[#9E9E9E]">install_mac.sh — run in terminal</p>
                      </div>
                    </a>
                    <a href="https://raw.githubusercontent.com/dacexyai/Dacexy-backend/main/desktop_agent/install_linux.sh"
                      download="install_dacexy_agent_linux.sh"
                      className="flex items-center gap-3 bg-[#F9F7F2] hover:bg-gray-100 border border-black/8 rounded-xl px-4 py-3 transition-all">
                      <Download size={15} className="text-[#9E9E9E]" />
                      <div>
                        <p className="text-sm font-semibold text-[#0F0F0F]">Linux</p>
                        <p className="text-xs text-[#9E9E9E]">install_linux.sh — run in terminal</p>
                      </div>
                    </a>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <p className="text-xs font-semibold text-amber-700 mb-2">How to use</p>
                    <ol className="text-xs text-amber-800 space-y-1 list-decimal list-inside">
                      <li>Download installer for your OS above</li>
                      <li>Double click to run — installs everything automatically</li>
                      <li>Enter your Dacexy email and password when asked</li>
                      <li>Agent starts and shows "Remote control connected"</li>
                      <li>Say "Hey Dacexy open YouTube" or use the Agent button in chat</li>
                    </ol>
                  </div>
                </div>
              </div>
            )}

            {/* Billing Tab */}
            {activeTab === 'billing' && (
              <div className="bg-white border border-black/6 rounded-2xl p-6 shadow-soft">
                <h2 className="font-semibold text-lg text-[#0F0F0F] mb-6">Billing & Plans</h2>
                <div className="bg-violet-50 border border-violet-200 rounded-xl p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-violet-700">Current Plan</p>
                      <p className="text-2xl font-bold text-[#0F0F0F] capitalize mt-1">{(org as any)?.plan_tier || 'Free'}</p>
                    </div>
                    <span className="text-xs bg-violet-200 text-violet-800 px-3 py-1 rounded-full font-semibold">Active</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { name: 'Starter', price: '₹999', calls: '1,000 AI calls/mo', color: 'border-black/8' },
                    { name: 'Growth', price: '₹2,999', calls: '10,000 AI calls/mo', color: 'border-violet-300 ring-2 ring-violet-200' },
                    { name: 'Enterprise', price: '₹9,999', calls: 'Unlimited', color: 'border-black/8' },
                  ].map(plan => (
                    <div key={plan.name} className={cn('border rounded-xl p-4 text-center', plan.color)}>
                      <p className="text-sm font-bold text-[#0F0F0F] mb-1">{plan.name}</p>
                      <p className="text-xl font-bold text-violet-700 mb-1">{plan.price}<span className="text-xs text-[#9E9E9E] font-normal">/mo</span></p>
                      <p className="text-xs text-[#9E9E9E] mb-3">{plan.calls}</p>
                      <button className="w-full py-2 bg-violet-700 hover:bg-violet-800 text-white text-xs font-semibold rounded-lg transition-all">
                        Upgrade
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* API Keys Tab */}
            {activeTab === 'apikeys' && (
              <div className="bg-white border border-black/6 rounded-2xl p-6 shadow-soft">
                <h2 className="font-semibold text-lg text-[#0F0F0F] mb-6">API Keys</h2>
                {newKey && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                    <p className="text-xs font-semibold text-green-700 mb-2">New key created — copy it now, it won't show again</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-xs font-mono text-green-800 bg-white border border-green-200 rounded-lg px-3 py-2 truncate">{newKey}</code>
                      <button onClick={() => copyText(newKey, 'newkey')} className="p-2 hover:bg-green-100 rounded-lg">
                        {copied === 'newkey' ? <Check size={14} className="text-green-600" /> : <Copy size={14} className="text-green-600" />}
                      </button>
                    </div>
                  </div>
                )}
                <div className="flex gap-3 mb-5">
                  <input value={newKeyName} onChange={e => setNewKeyName(e.target.value)}
                    placeholder="Key name e.g. Production"
                    className="flex-1 px-4 py-2.5 bg-[#F9F7F2] border border-black/8 rounded-xl text-sm focus:outline-none focus:border-violet-400 transition-all" />
                  <button onClick={createKey} disabled={loading || !newKeyName.trim()}
                    className="flex items-center gap-2 px-4 py-2.5 bg-violet-700 hover:bg-violet-800 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all">
                    <Plus size={14} /> Create
                  </button>
                </div>
                <div className="space-y-2">
                  {apiKeys.length === 0 ? (
                    <p className="text-sm text-[#9E9E9E] text-center py-8">No API keys yet. Create one above.</p>
                  ) : apiKeys.map((k: any) => (
                    <div key={k.id} className="flex items-center justify-between p-3.5 bg-[#F9F7F2] rounded-xl">
                      <div>
                        <p className="text-sm font-semibold text-[#0F0F0F]">{k.name}</p>
                        <p className="text-xs text-[#9E9E9E] font-mono mt-0.5">{k.key_prefix}••••••••••••</p>
                      </div>
                      <p className="text-xs text-[#B0B0B0]">{k.created_at ? new Date(k.created_at).toLocaleDateString() : ''}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
      }
