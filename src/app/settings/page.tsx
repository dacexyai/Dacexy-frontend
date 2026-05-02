'use client'
import { useState, useEffect } from 'react'
import { useAuthStore } from '@/lib/store'
import { orgs } from '@/lib/api'
import { getInitials, cn } from '@/lib/utils'
import { Copy, Check, Plus, Monitor, Download, Key, User, Building } from 'lucide-react'

export default function SettingsPage() {
  const { user, org } = useAuthStore()
  const [apiKeys, setApiKeys] = useState<any[]>([])
  const [newKeyName, setNewKeyName] = useState('')
  const [newKey, setNewKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [agentToken] = useState('dxd_' + Math.random().toString(36).slice(2, 18).toUpperCase())

  useEffect(() => {
    orgs.listApiKeys().then(data => {
      const keys = Array.isArray(data) ? data : (data?.api_keys ?? [])
      setApiKeys(keys)
    }).catch(() => {})
  }, [])

  async function createKey() {
    if (!newKeyName.trim()) return
    setLoading(true)
    try {
      const data = await orgs.createApiKey(newKeyName)
      setNewKey(data.key)
      setNewKeyName('')
      orgs.listApiKeys().then(data => {
        const keys = Array.isArray(data) ? data : (data?.api_keys ?? [])
        setApiKeys(keys)
      }).catch(() => {})
    } catch (err: any) {
      alert(err.message)
    } finally { setLoading(false) }
  }

  function copyText(text: string) {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-semibold text-[#0F0F0F] mb-1">Settings</h1>
        <p className="text-sm text-[#9E9E9E]">Manage your account and workspace</p>
      </div>

      <div className="bg-white border border-black/6 rounded-2xl p-6 shadow-soft mb-6">
        <div className="flex items-center gap-2 mb-5">
          <User size={16} className="text-violet-600" />
          <h2 className="font-semibold text-[#0F0F0F]">Profile</h2>
        </div>
        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 rounded-2xl bg-violet-100 flex items-center justify-center text-violet-700 text-lg font-bold">
            {user ? getInitials(user.full_name) : 'U'}
          </div>
          <div>
            <p className="font-semibold text-[#0F0F0F]">{user?.full_name}</p>
            <p className="text-sm text-[#9E9E9E]">{user?.email}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#F9F7F2] rounded-xl p-3">
            <p className="text-xs text-[#9E9E9E] mb-1">Role</p>
            <p className="text-sm font-semibold text-[#0F0F0F] capitalize">{user?.role || 'owner'}</p>
          </div>
          <div className="bg-[#F9F7F2] rounded-xl p-3">
            <p className="text-xs text-[#9E9E9E] mb-1">Email Verified</p>
            <p className={cn('text-sm font-semibold', user?.is_verified ? 'text-green-600' : 'text-amber-600')}>
              {user?.is_verified ? 'Verified ✓' : 'Not verified'}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-black/6 rounded-2xl p-6 shadow-soft mb-6">
        <div className="flex items-center gap-2 mb-5">
          <Building size={16} className="text-violet-600" />
          <h2 className="font-semibold text-[#0F0F0F]">Organization</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#F9F7F2] rounded-xl p-3">
            <p className="text-xs text-[#9E9E9E] mb-1">Name</p>
            <p className="text-sm font-semibold text-[#0F0F0F]">{(org as any)?.name || 'My Workspace'}</p>
          </div>
          <div className="bg-[#F9F7F2] rounded-xl p-3">
            <p className="text-xs text-[#9E9E9E] mb-1">Plan</p>
            <p className="text-sm font-semibold text-[#0F0F0F] capitalize">{(org as any)?.plan_tier || 'Free'}</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-black/6 rounded-2xl p-6 shadow-soft mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Monitor size={16} className="text-violet-600" />
          <h2 className="font-semibold text-[#0F0F0F]">Desktop Agent</h2>
          <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Beta</span>
        </div>
        <p className="text-sm text-[#9E9E9E] mb-5">
          Install the desktop agent on your computer to let Dacexy AI control your screen, mouse, keyboard and respond to voice commands.
        </p>

        <div className="bg-violet-50 border border-violet-200 rounded-xl p-4 mb-5">
          <p className="text-xs font-semibold text-violet-700 mb-2">Your Agent Token</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs font-mono text-violet-800 bg-white border border-violet-200 rounded-lg px-3 py-2 truncate">
              {agentToken}
            </code>
            <button onClick={() => copyText(agentToken)} className="p-2 hover:bg-violet-100 rounded-lg transition-colors">
              {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} className="text-violet-600" />}
            </button>
          </div>
          <p className="text-[10px] text-violet-600 mt-2">Copy this token and paste it into the desktop agent installer</p>
        </div>

        <p className="text-xs font-semibold text-[#5C5C5C] uppercase tracking-wide mb-3">Download Installer</p>
        <div className="grid grid-cols-1 gap-2">
          <a
            href="https://dacexy-backend-v7ku.onrender.com/api/v1/agent/download/windows"
            className="flex items-center gap-3 bg-[#F9F7F2] hover:bg-gray-100 border border-black/8 rounded-xl px-4 py-3 transition-all"
          >
            <Download size={15} className="text-[#9E9E9E]" />
            <div>
              <p className="text-sm font-semibold text-[#0F0F0F]">Windows</p>
              <p className="text-xs text-[#9E9E9E]">install_windows.bat — double click to install</p>
            </div>
          </a>
          <a
            href="https://raw.githubusercontent.com/dacexyai/Dacexy-backend/main/desktop_agent/install_mac.sh"
            download="install_dacexy_agent.sh"
            className="flex items-center gap-3 bg-[#F9F7F2] hover:bg-gray-100 border border-black/8 rounded-xl px-4 py-3 transition-all"
          >
            <Download size={15} className="text-[#9E9E9E]" />
            <div>
              <p className="text-sm font-semibold text-[#0F0F0F]">macOS</p>
              <p className="text-xs text-[#9E9E9E]">install_mac.sh — run in terminal</p>
            </div>
          </a>
          <a
            href="https://raw.githubusercontent.com/dacexyai/Dacexy-backend/main/desktop_agent/install_linux.sh"
            download="install_dacexy_agent_linux.sh"
            className="flex items-center gap-3 bg-[#F9F7F2] hover:bg-gray-100 border border-black/8 rounded-xl px-4 py-3 transition-all"
          >
            <Download size={15} className="text-[#9E9E9E]" />
            <div>
              <p className="text-sm font-semibold text-[#0F0F0F]">Linux</p>
              <p className="text-xs text-[#9E9E9E]">install_linux.sh — run in terminal</p>
            </div>
          </a>
        </div>

        <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-xs font-semibold text-amber-700 mb-1">How to use</p>
          <ol className="text-xs text-amber-800 space-y-1 list-decimal list-inside">
            <li>Download installer for your OS</li>
            <li>Run the installer — it sets up everything automatically</li>
            <li>Copy your Agent Token above and paste when asked</li>
            <li>Agent starts and connects to your Dacexy account</li>
            <li>Say "Hey Dacexy" or type commands in the chat</li>
          </ol>
        </div>
      </div>

      <div className="bg-white border border-black/6 rounded-2xl p-6 shadow-soft">
        <div className="flex items-center gap-2 mb-5">
          <Key size={16} className="text-violet-600" />
          <h2 className="font-semibold text-[#0F0F0F]">API Keys</h2>
        </div>
        {newKey && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
            <p className="text-xs font-semibold text-green-700 mb-2">New key created — copy it now, it won't show again</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs font-mono text-green-800 bg-white border border-green-200 rounded-lg px-3 py-2 truncate">{newKey}</code>
              <button onClick={() => copyText(newKey)} className="p-2 hover:bg-green-100 rounded-lg">
                <Copy size={14} className="text-green-600" />
              </button>
            </div>
          </div>
        )}
        <div className="flex gap-3 mb-4">
          <input
            value={newKeyName}
            onChange={e => setNewKeyName(e.target.value)}
            placeholder="Key name e.g. Production"
            className="flex-1 px-4 py-2.5 bg-[#F9F7F2] border border-black/8 rounded-xl text-sm focus:outline-none focus:border-violet-400 transition-all"
          />
          <button onClick={createKey} disabled={loading || !newKeyName.trim()}
            className="flex items-center gap-2 px-4 py-2.5 bg-violet-700 hover:bg-violet-800 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all">
            <Plus size={14} />
            Create
          </button>
        </div>
        <div className="space-y-2">
          {apiKeys.length === 0 ? (
            <p className="text-sm text-[#9E9E9E] text-center py-4">No API keys yet</p>
          ) : (
            apiKeys.map((k: any) => (
              <div key={k.id} className="flex items-center justify-between p-3 bg-[#F9F7F2] rounded-xl">
                <div>
                  <p className="text-sm font-semibold text-[#0F0F0F]">{k.name}</p>
                  <p className="text-xs text-[#9E9E9E] font-mono">{k.key_prefix}...</p>
                </div>
                <p className="text-xs text-[#B0B0B0]">{k.created_at ? new Date(k.created_at).toLocaleDateString() : ''}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
