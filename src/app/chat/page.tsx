'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Send, Plus, MessageSquare, Sparkles, Menu, X, Bot, Brain, Trash2, Paperclip, FileText, Globe, ImageIcon, VideoIcon, Loader2, Monitor, MonitorOff } from 'lucide-react'

const API_URL = "https://dacexy-backend-v7ku.onrender.com/api/v1"
const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('access_token') : null

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}

interface Msg {
  id: string
  role: string
  content: string
  type?: 'text' | 'image' | 'video'
  loading?: boolean
}
interface Session { id: string; title: string; created_at: string }
interface Memory { id: string; content: string; created_at: string }

function Message({ msg, streaming }: { msg: Msg; streaming?: boolean }) {
  if (msg.role === 'user') {
    return (
      <div className="flex justify-end px-4 py-3">
        <div className="max-w-[75%] bg-[#0F0F0F] text-white text-base leading-relaxed px-5 py-3.5 rounded-2xl rounded-tr-sm">
          {msg.content}
        </div>
      </div>
    )
  }

  const websiteMatch = msg.content.match(/\/websites\/([a-zA-Z0-9-]+)\/preview/)
  const previewUrl = websiteMatch ? `${API_URL}/websites/${websiteMatch[1]}/preview` : null

  return (
    <div className="px-4 py-6 border-b border-black/4 last:border-0">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-7 h-7 rounded-xl bg-violet-700 flex items-center justify-center flex-shrink-0">
          <Sparkles size={13} className="text-white" />
        </div>
        <span className="text-sm font-semibold text-violet-700">Dacexy AI</span>
      </div>

      {msg.type === 'image' && (
        <div className="pl-9">
          {msg.loading ? (
            <div className="flex items-center gap-3 bg-violet-50 border border-violet-200 rounded-2xl px-5 py-4">
              <Loader2 size={18} className="animate-spin text-violet-600 shrink-0" />
              <div>
                <p className="text-base font-semibold text-violet-700">Generating image…</p>
                <p className="text-sm text-violet-400 mt-0.5">This takes 15–30 seconds</p>
              </div>
            </div>
          ) : (msg.content.startsWith('http') || msg.content.startsWith('data:')) ? (
            <div className="rounded-2xl overflow-hidden border border-black/8 shadow-sm max-w-lg">
              <img src={msg.content} alt="Generated" className="w-full h-auto" />
              <div className="flex items-center justify-between px-4 py-2.5 bg-[#F9F7F2]">
                <span className="text-sm text-[#9E9E9E]">AI Generated Image</span>
                <a href={msg.content} download target="_blank" rel="noopener noreferrer"
                  className="text-sm text-violet-600 font-semibold hover:text-violet-800">Download ↓</a>
              </div>
            </div>
          ) : (
            <p className="text-base text-red-500">{msg.content}</p>
          )}
        </div>
      )}

      {msg.type === 'video' && (
        <div className="pl-9">
          {msg.loading ? (
            <div className="flex items-center gap-3 bg-violet-50 border border-violet-200 rounded-2xl px-5 py-4">
              <Loader2 size={18} className="animate-spin text-violet-600 shrink-0" />
              <div>
                <p className="text-base font-semibold text-violet-700">Generating video…</p>
                <p className="text-sm text-violet-400 mt-0.5">This takes 30–60 seconds</p>
              </div>
            </div>
          ) : msg.content.startsWith('http') ? (
            <div className="rounded-2xl overflow-hidden border border-black/8 shadow-sm max-w-lg">
              <video src={msg.content} controls className="w-full h-auto" />
              <div className="flex items-center justify-between px-4 py-2.5 bg-[#F9F7F2]">
                <span className="text-sm text-[#9E9E9E]">AI Generated Video</span>
                <a href={msg.content} download target="_blank" rel="noopener noreferrer"
                  className="text-sm text-violet-600 font-semibold hover:text-violet-800">Download ↓</a>
              </div>
            </div>
          ) : (
            <p className="text-base text-red-500">{msg.content}</p>
          )}
        </div>
      )}

      {(!msg.type || msg.type === 'text') && (
        <>
          <div className={cn(
            'text-base text-[#1a1a1a] leading-8 pl-9 whitespace-pre-wrap',
            streaming && 'after:content-["▋"] after:animate-pulse'
          )}>
            {msg.content || (streaming ? '' : 'No response received.')}
          </div>
          {previewUrl && (
            <div className="mt-4 pl-9">
              <div className="border border-black/8 rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-black/6">
                  <div className="flex items-center gap-2">
                    <Globe size={13} className="text-[#9E9E9E]" />
                    <span className="text-sm text-[#9E9E9E]">Website Preview</span>
                  </div>
                  <a href={previewUrl} target="_blank" rel="noopener noreferrer"
                    className="text-sm text-violet-600 hover:text-violet-800 font-semibold">Open ↗</a>
                </div>
                <iframe src={previewUrl} className="w-full h-72 border-0" title="Website Preview"
                  sandbox="allow-scripts allow-same-origin" />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// Desktop Agent Panel shown when agent button is clicked
function AgentPanel({ token, onClose }: { token: string; onClose: () => void }) {
  const [connected, setConnected] = useState(false)
  const [task, setTask] = useState('')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState('')

  useEffect(() => {
    checkStatus()
    const interval = setInterval(checkStatus, 5000)
    return () => clearInterval(interval)
  }, [])

  async function checkStatus() {
    try {
      const r = await fetch(`${API_URL}/agent/desktop/status`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const d = await r.json()
      setConnected(d.connected ?? false)
    } catch {}
  }

  async function sendTask() {
    if (!task.trim() || sending) return
    setSending(true)
    setResult('')
    try {
      const r = await fetch(`${API_URL}/agent/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ task: task.trim() })
      })
      const d = await r.json()
      setResult(d.result || d.response || 'Task sent!')
      setTask('')
    } catch (e: any) {
      setResult('Error: ' + e.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="border-t border-black/6 bg-white">
      <div className="max-w-3xl mx-auto px-4 py-3">
        <div className="bg-white border border-black/8 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-[#F9F7F2] border-b border-black/6">
            <div className="flex items-center gap-2">
              <Monitor size={15} className={connected ? 'text-green-600' : 'text-[#9E9E9E]'} />
              <span className="text-sm font-semibold text-[#0F0F0F]">Desktop Agent</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${connected ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {connected ? 'Connected' : 'Not connected'}
              </span>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-lg">
              <X size={14} className="text-[#9E9E9E]" />
            </button>
          </div>
          {!connected ? (
            <div className="px-4 py-4 text-center">
              <p className="text-sm text-[#9E9E9E] mb-2">Agent not running on your computer.</p>
              <a href="/settings" className="text-sm text-violet-600 font-semibold hover:text-violet-800">
                Go to Settings → Download & install agent →
              </a>
            </div>
          ) : (
            <div className="p-3">
              {result && (
                <div className="mb-3 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
                  <p className="text-xs text-green-700">{result}</p>
                </div>
              )}
              <div className="flex gap-2">
                <input
                  value={task}
                  onChange={e => setTask(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendTask()}
                  placeholder="Tell agent what to do on your computer…"
                  className="flex-1 px-3 py-2.5 bg-[#F2EFE8] border border-black/8 rounded-xl text-sm outline-none focus:border-violet-400"
                />
                <button onClick={sendTask} disabled={!task.trim() || sending}
                  className="px-4 py-2.5 bg-violet-700 hover:bg-violet-800 disabled:opacity-50 text-white text-sm font-semibold rounded-xl flex items-center gap-1.5">
                  {sending ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                  Run
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ChatPage() {
  const router = useRouter()
  const [sessions, setSessions] = useState<Session[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [loadingSessions, setLoadingSessions] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [memoryOpen, setMemoryOpen] = useState(false)
  const [agentPanelOpen, setAgentPanelOpen] = useState(false)
  const [agentConnected, setAgentConnected] = useState(false)
  const [memories, setMemories] = useState<Memory[]>([])
  const [loadingMemories, setLoadingMemories] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<{name: string; text: string} | null>(null)
  const [uploading, setUploading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function loadSessions() {
    try {
      const r = await authFetch(`${API_URL}/ai/sessions`)
      if (!r.ok) return
      const data = await r.json()
      setSessions(Array.isArray(data) ? data : data.sessions || [])
    } catch {} finally { setLoadingSessions(false) }
  }

  async function checkAgentStatus() {
    try {
      const token = getToken()
      if (!token) return
      const r = await fetch(`${API_URL}/agent/desktop/status`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const d = await r.json()
      setAgentConnected(d.connected ?? false)
    } catch {}
  }

  useEffect(() => {
    const token = getToken()
    if (!token) { router.replace('/login'); return }
    loadSessions()
    checkAgentStatus()
    const interval = setInterval(checkAgentStatus, 8000)
    const templatePrompt = localStorage.getItem('template_prompt')
    if (templatePrompt) { setInput(templatePrompt); localStorage.removeItem('template_prompt') }
    return () => clearInterval(interval)
  }, [])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])
  useEffect(() => { if (memoryOpen) loadMemories() }, [memoryOpen])

  async function authFetch(url: string, options: RequestInit = {}) {
    const token = getToken()
    if (!token) { router.replace('/login'); throw new Error('No token') }
    const res = await fetch(url, {
      ...options,
      headers: { ...(options.headers as Record<string, string> || {}), Authorization: `Bearer ${token}` }
    })
    if (res.status === 401) {
      localStorage.removeItem('access_token')
      router.replace('/login')
      throw new Error('Session expired')
    }
    return res
  }

  async function loadSession(id: string) {
    setActiveId(id)
    setSidebarOpen(false)
    try {
      const r = await authFetch(`${API_URL}/ai/sessions/${id}/messages`)
      if (!r.ok) return
      const data = await r.json()
      const rawMessages = Array.isArray(data) ? data : Array.isArray(data.messages) ? data.messages : []
      const msgs: Msg[] = rawMessages
        .filter((m: any) => m.role !== 'system' && m.content)
        .map((m: any, i: number) => ({ id: String(i), role: m.role, content: m.content, type: 'text' as const }))
      setMessages(msgs)
    } catch {}
  }

  async function loadMemories() {
    setLoadingMemories(true)
    try {
      const r = await authFetch(`${API_URL}/memory/`)
      if (!r.ok) return
      const data = await r.json()
      setMemories(Array.isArray(data) ? data : data.memories || [])
    } catch {} finally { setLoadingMemories(false) }
  }

  async function deleteMemory(id: string) {
    try {
      await authFetch(`${API_URL}/memory/${id}`, { method: 'DELETE' })
      setMemories(prev => prev.filter(m => m.id !== id))
    } catch {}
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await authFetch(`${API_URL}/upload/file`, { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Upload failed')
      setUploadedFile({ name: file.name, text: data.extracted_text || '' })
      setInput(`I uploaded "${file.name}":\n\n${(data.extracted_text || '').slice(0, 3000)}\n\nPlease analyze this.`)
    } catch (err: any) {
      alert(err.message || 'Upload failed')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  function newSession() { setActiveId(null); setMessages([]); setSidebarOpen(false) }

  const send = useCallback(async () => {
    const msg = input.trim()
    if (!msg || streaming) return
    const token = getToken()
    if (!token) { router.replace('/login'); return }

    const websiteKw = ['build', 'make', 'create', 'generate', 'design']
    const siteKw = ['website', 'landing page', 'webpage', 'web app', 'homepage', 'site']
    if (websiteKw.some(w => msg.toLowerCase().includes(w)) && siteKw.some(w => msg.toLowerCase().includes(w))) {
      localStorage.setItem('website_prompt', msg)
      router.push('/website')
      return
    }

    const imageKw = ['create image', 'generate image', 'make image', 'draw ', 'create a picture', 'generate a picture', 'image of ', 'picture of ', 'create an image', 'generate an image', 'create art', 'generate art']
    if (imageKw.some(w => msg.toLowerCase().includes(w))) {
      setInput('')
      setStreaming(true)
      const userMsg: Msg = { id: Date.now().toString(), role: 'user', content: msg, type: 'text' }
      const aiMsg: Msg = { id: (Date.now() + 1).toString(), role: 'assistant', content: '', type: 'image', loading: true }
      setMessages(prev => [...prev, userMsg, aiMsg])
      try {
        const res = await authFetch(`${API_URL}/media/image`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: msg })
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.detail || 'Failed')
        setMessages(prev => prev.map(m => m.id === aiMsg.id ? { ...m, content: data.url, loading: false } : m))
      } catch (err: any) {
        setMessages(prev => prev.map(m => m.id === aiMsg.id ? { ...m, content: err.message, loading: false, type: 'text' } : m))
      } finally { setStreaming(false) }
      return
    }

    const videoKw = ['create video', 'generate video', 'make video', 'create a video', 'generate a video', 'video of ', 'animate ']
    if (videoKw.some(w => msg.toLowerCase().includes(w))) {
      setInput('')
      setStreaming(true)
      const userMsg: Msg = { id: Date.now().toString(), role: 'user', content: msg, type: 'text' }
      const aiMsg: Msg = { id: (Date.now() + 1).toString(), role: 'assistant', content: '', type: 'video', loading: true }
      setMessages(prev => [...prev, userMsg, aiMsg])
      try {
        const res = await authFetch(`${API_URL}/media/video`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: msg })
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.detail || 'Failed')
        setMessages(prev => prev.map(m => m.id === aiMsg.id ? { ...m, content: data.url, loading: false } : m))
      } catch (err: any) {
        setMessages(prev => prev.map(m => m.id === aiMsg.id ? { ...m, content: err.message, loading: false, type: 'text' } : m))
      } finally { setStreaming(false) }
      return
    }

    setInput('')
    setUploadedFile(null)
    setStreaming(true)
    const userMsg: Msg = { id: Date.now().toString(), role: 'user', content: msg, type: 'text' }
    const aiMsg: Msg = { id: (Date.now() + 1).toString(), role: 'assistant', content: '', type: 'text' }
    const allMessages = [...messages, userMsg]
    setMessages([...allMessages, aiMsg])

    try {
      const res = await authFetch(`${API_URL}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: allMessages.filter(m => m.type === 'text' || !m.type).map(m => ({ role: m.role, content: m.content })),
          session_id: activeId || undefined,
          stream: true
        })
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        const d = err.detail
        const errMsg = Array.isArray(d) ? d.map((e: any) => e.msg).join(', ') : typeof d === 'string' ? d : `Error ${res.status}`
        setMessages(prev => prev.map(m => m.id === aiMsg.id ? { ...m, content: errMsg } : m))
        setStreaming(false)
        return
      }

      const contentType = res.headers.get('content-type') || ''
      if (contentType.includes('application/json')) {
        const data = await res.json()
        const reply = data.response || data.content || data.message || data.text || JSON.stringify(data)
        if (data.session_id && !activeId) setActiveId(data.session_id)
        setMessages(prev => prev.map(m => m.id === aiMsg.id ? { ...m, content: reply } : m))
        setStreaming(false)
        loadSessions()
        return
      }

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let full = ''
      if (!reader) { setMessages(prev => prev.map(m => m.id === aiMsg.id ? { ...m, content: 'No response.' } : m)); setStreaming(false); return }

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        for (const line of chunk.split('\n')) {
          if (!line.startsWith('data: ')) continue
          const raw = line.slice(6).trim()
          if (!raw || raw === '[DONE]') continue
          try {
            const data = JSON.parse(raw)
            if (data.session_id && !activeId) setActiveId(data.session_id)
            if (data.type === 'chunk' && data.content) full += data.content
            else if (data.content) full += data.content
            if (full) setMessages(prev => prev.map(m => m.id === aiMsg.id ? { ...m, content: full } : m))
          } catch {
            if (raw && raw !== '[DONE]') { full += raw; setMessages(prev => prev.map(m => m.id === aiMsg.id ? { ...m, content: full } : m)) }
          }
        }
      }
      if (!full) setMessages(prev => prev.map(m => m.id === aiMsg.id ? { ...m, content: 'No response received.' } : m))
      loadSessions()
    } catch (err: any) {
      setMessages(prev => prev.map(m => m.id === aiMsg.id ? { ...m, content: err?.message || 'Something went wrong.' } : m))
    } finally { setStreaming(false) }
  }, [input, streaming, activeId, messages])

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value)
    const t = e.target; t.style.height = 'auto'; t.style.height = Math.min(t.scrollHeight, 180) + 'px'
  }

  const token = getToken() || ''

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {sidebarOpen && <div className="fixed inset-0 bg-black/20 z-30" onClick={() => setSidebarOpen(false)} />}
      {memoryOpen && <div className="fixed inset-0 bg-black/20 z-30" onClick={() => setMemoryOpen(false)} />}

      {/* Sidebar */}
      <div className={cn('fixed left-0 top-0 h-full z-40 flex flex-col w-64 bg-white border-r border-black/6 transition-transform duration-300', sidebarOpen ? 'translate-x-0' : '-translate-x-full')}>
        <div className="flex items-center justify-between p-3 border-b border-black/6">
          <button onClick={newSession} className="flex-1 flex items-center gap-2 bg-violet-50 hover:bg-violet-100 text-violet-700 font-semibold text-sm px-3.5 py-2.5 rounded-xl transition-all">
            <Plus size={15} /> New chat
          </button>
          <button onClick={() => setSidebarOpen(false)} className="ml-2 p-2 hover:bg-gray-100 rounded-lg"><X size={16} /></button>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          {loadingSessions ? <div className="px-3 py-4 text-center text-sm text-[#B0B0B0]">Loading...</div>
          : sessions.length === 0 ? (
            <div className="px-3 py-8 text-center">
              <MessageSquare size={24} className="mx-auto text-[#D0D0D0] mb-2" />
              <p className="text-sm text-[#B0B0B0]">No conversations yet</p>
            </div>
          ) : sessions.map(s => (
            <div key={s.id} onClick={() => loadSession(s.id)}
              className={cn('flex items-center gap-2.5 px-3 py-2.5 cursor-pointer transition-all mx-1 rounded-xl', activeId === s.id ? 'bg-violet-50' : 'hover:bg-gray-50')}>
              <MessageSquare size={13} className={activeId === s.id ? 'text-violet-600' : 'text-[#B0B0B0]'} />
              <p className={cn('text-sm font-medium truncate flex-1', activeId === s.id ? 'text-violet-700' : 'text-[#5C5C5C]')}>
                {s.title || 'New conversation'}
              </p>
            </div>
          ))}
        </div>
        {/* Settings link at bottom of sidebar */}
        <div className="border-t border-black/6 p-3">
          <a href="/settings" className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-gray-50 text-[#5C5C5C] hover:text-violet-700 transition-all text-sm font-medium">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 0-14.14 0M4.93 19.07a10 10 0 0 0 14.14 0"/>
              <path d="M12 2v2M12 20v2M2 12h2M20 12h2"/>
            </svg>
            Settings
          </a>
        </div>
      </div>

      {/* Memory panel */}
      <div className={cn('fixed right-0 top-0 h-full z-40 flex flex-col w-72 bg-white border-l border-black/6 transition-transform duration-300', memoryOpen ? 'translate-x-0' : 'translate-x-full')}>
        <div className="flex items-center justify-between p-4 border-b border-black/6">
          <div className="flex items-center gap-2">
            <Brain size={16} className="text-violet-600" />
            <h3 className="font-semibold text-base text-[#0F0F0F]">AI Memory</h3>
          </div>
          <button onClick={() => setMemoryOpen(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={16} /></button>
        </div>
        <div className="p-3 border-b border-black/6 bg-violet-50">
          <p className="text-sm text-violet-700">The AI saves context from your business info automatically.</p>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {loadingMemories ? <p className="text-sm text-center text-[#B0B0B0] py-4">Loading...</p>
          : memories.length === 0 ? (
            <div className="text-center py-8">
              <Brain size={24} className="mx-auto text-[#D0D0D0] mb-2" />
              <p className="text-sm text-[#B0B0B0]">No memories yet</p>
            </div>
          ) : memories.map(m => (
            <div key={m.id} className="bg-[#F9F7F2] border border-black/6 rounded-xl p-3 group">
              <p className="text-sm text-[#0F0F0F] leading-relaxed">{m.content}</p>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-[#B0B0B0]">{new Date(m.created_at).toLocaleDateString()}</p>
                <button onClick={() => deleteMemory(m.id)} className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-all">
                  <Trash2 size={11} />
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="p-3 border-t border-black/6">
          <p className="text-xs text-[#B0B0B0] text-center">Say "my company is..." to add memories</p>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-between gap-3 px-4 h-14 border-b border-black/6 bg-white shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Menu size={18} className="text-[#5C5C5C]" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-violet-700 flex items-center justify-center">
                <Sparkles size={13} className="text-white" />
              </div>
              <span className="font-serif font-semibold text-base text-[#0F0F0F]">Dacexy AI</span>
            </div>
          </div>
          <button onClick={() => setMemoryOpen(!memoryOpen)}
            className={cn('flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-colors', memoryOpen ? 'bg-violet-100 text-violet-700' : 'text-[#9E9E9E] hover:bg-gray-100')}>
            <Brain size={15} /><span>Memory</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-[#F9F7F2]">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center max-w-lg px-8">
                <div className="w-16 h-16 bg-violet-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Sparkles size={28} className="text-white" />
                </div>
                <h2 className="font-serif text-3xl font-semibold text-[#0F0F0F] mb-3">How can I help you?</h2>
                <p className="text-base text-[#9E9E9E] leading-relaxed mb-8">
                  I&apos;m Dacexy AI. Chat, write code, generate images & videos, build websites, and execute tasks.
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    'Write a Python script to automate my workflow',
                    'Generate image of a futuristic city at night',
                    'Search for latest AI news today',
                    'Build me a landing page for my SaaS',
                  ].map(s => (
                    <button key={s} onClick={() => { setInput(s); inputRef.current?.focus() }}
                      className="text-left text-sm text-[#5C5C5C] bg-white hover:bg-gray-50 border border-black/8 rounded-xl px-4 py-3 transition-all leading-relaxed">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto pb-8">
              {messages.map(m => (
                <Message key={m.id} msg={m}
                  streaming={streaming && m.role === 'assistant' && m === messages[messages.length - 1]} />
              ))}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Agent Panel — shows above input bar when open */}
        {agentPanelOpen && <AgentPanel token={token} onClose={() => setAgentPanelOpen(false)} />}

        {/* Input bar */}
        <div className="border-t border-black/6 bg-white p-4">
          <div className="max-w-3xl mx-auto">
            <div className="bg-[#F2EFE8] border border-black/8 rounded-2xl focus-within:border-violet-400 focus-within:bg-white transition-all">
              {uploadedFile && (
                <div className="flex items-center gap-2 px-4 pt-3 pb-1">
                  <FileText size={13} className="text-violet-600" />
                  <span className="text-sm text-violet-700 font-medium truncate flex-1">{uploadedFile.name}</span>
                  <button onClick={() => { setUploadedFile(null); setInput('') }} className="text-[#B0B0B0] hover:text-red-500"><X size={12} /></button>
                </div>
              )}
              <textarea ref={inputRef} value={input} onChange={handleInput} onKeyDown={handleKeyDown}
                placeholder="Ask anything, generate image/video, build a website…"
                rows={1} className="w-full px-4 pt-3.5 pb-1 bg-transparent text-base text-[#0F0F0F] placeholder-[#B0B0B0] resize-none outline-none leading-relaxed max-h-44" />
              <div className="flex items-center justify-between px-3 pb-3 pt-1">
                <div className="flex items-center gap-1">
                  <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileUpload} accept=".pdf,.txt,.doc,.docx,.csv,.json" />
                  <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
                    className="p-2 text-[#9E9E9E] hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-all">
                    <Paperclip size={15} />
                  </button>
                  {/* Desktop Agent button — replaces old Agent Mode toggle */}
                  <button
                    onClick={() => setAgentPanelOpen(!agentPanelOpen)}
                    className={cn('flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-semibold transition-all relative',
                      agentPanelOpen ? 'bg-violet-100 text-violet-700' : 'text-[#9E9E9E] hover:bg-gray-100'
                    )}
                  >
                    {agentConnected
                      ? <Monitor size={14} className="text-green-500" />
                      : <MonitorOff size={14} />
                    }
                    Agent
                    {agentConnected && (
                      <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full" />
                    )}
                  </button>
                  <button onClick={() => { setInput('Generate image of '); inputRef.current?.focus() }}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-semibold text-[#9E9E9E] hover:bg-gray-100 transition-all">
                    <ImageIcon size={14} /> Image
                  </button>
                  <button onClick={() => { setInput('Generate video of '); inputRef.current?.focus() }}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-semibold text-[#9E9E9E] hover:bg-gray-100 transition-all">
                    <VideoIcon size={14} /> Video
                  </button>
                </div>
                <button onClick={send} disabled={!input.trim() || streaming}
                  className="w-9 h-9 bg-violet-700 hover:bg-violet-800 disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition-all">
                  <Send size={14} />
                </button>
              </div>
            </div>
            <p className="text-center text-xs text-[#C0C0C0] mt-2">
              Powered by DeepSeek R1 · Responses may not always be accurate
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
