'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Send, Plus, MessageSquare, Trash2, Sparkles } from 'lucide-react'
import { useAuthStore } from '@/lib/store'

const API_URL = "https://dacexy-backend-v7ku.onrender.com/api/v1"

interface Msg { id: string; role: string; content: string }
interface Session { id: string; title: string; created_at: string }

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}

function Message({ role, content, streaming }: { role: string; content: string; streaming?: boolean }) {
  if (role === 'user') {
    return (
      <div className="flex justify-end px-4 py-2">
        <div className="max-w-[70%] bg-[#0F0F0F] text-white text-sm leading-relaxed px-4 py-3 rounded-2xl rounded-tr-sm">
          {content}
        </div>
      </div>
    )
  }
  return (
    <div className="px-4 py-5 border-b border-black/4 last:border-0">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-6 h-6 rounded-lg bg-violet-700 flex items-center justify-center flex-shrink-0">
          <Sparkles size={11} className="text-white" />
        </div>
        <span className="text-xs font-semibold text-violet-700">Dacexy AI</span>
      </div>
      <div className={cn('text-sm text-[#0F0F0F] leading-7 pl-8 whitespace-pre-wrap', streaming && 'after:content-["▋"] after:animate-pulse')}>
        {content}
      </div>
    </div>
  )
}

export default function ChatPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const [sessions, setSessions] = useState<Session[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [loadingSessions, setLoadingSessions] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null

  useEffect(() => {
    if (!token) { router.replace('/login'); return }
    loadSessions()
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function loadSessions() {
    try {
      const r = await fetch(`${API_URL}/ai/sessions`, { headers: { Authorization: `Bearer ${token}` } })
      const data = await r.json()
      setSessions(data.sessions || [])
    } catch {} finally { setLoadingSessions(false) }
  }

  async function loadSession(id: string) {
    setActiveId(id)
    try {
      const r = await fetch(`${API_URL}/ai/sessions/${id}/messages`, { headers: { Authorization: `Bearer ${token}` } })
      const data = await r.json()
      const msgs: Msg[] = (data.messages || []).map((m: any, i: number) => ({
        id: String(i),
        role: m.role,
        content: m.content
      }))
      setMessages(msgs)
    } catch {}
  }

  async function newSession() {
    setActiveId(null)
    setMessages([])
  }

  const send = useCallback(async () => {
    const msg = input.trim()
    if (!msg || streaming) return
    setInput('')
    setStreaming(true)

    const userMsg: Msg = { id: Date.now().toString(), role: 'user', content: msg }
    const aiMsg: Msg = { id: (Date.now() + 1).toString(), role: 'assistant', content: '' }
    const allMessages = [...messages, userMsg]
    setMessages([...allMessages, aiMsg])

    try {
      const res = await fetch(`${API_URL}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          messages: allMessages.map(m => ({ role: m.role, content: m.content })),
          session_id: activeId || undefined,
          stream: true
        })
      })

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let full = ''

      while (reader) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              if (data.type === 'session_id' && !activeId) {
                setActiveId(data.session_id)
              }
              if (data.type === 'chunk') {
                full += data.content
                setMessages(prev => prev.map(m =>
                  m.id === aiMsg.id ? { ...m, content: full } : m
                ))
              }
              if (data.type === 'done') {
                setStreaming(false)
                loadSessions()
              }
            } catch {}
          }
        }
      }
    } catch (err) {
      setMessages(prev => prev.map(m =>
        m.id === aiMsg.id ? { ...m, content: 'Something went wrong. Please try again.' } : m
      ))
    } finally {
      setStreaming(false)
    }
  }, [input, streaming, activeId, messages, token])

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value)
    const t = e.target
    t.style.height = 'auto'
    t.style.height = Math.min(t.scrollHeight, 180) + 'px'
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-60 bg-white border-r border-black/6 flex flex-col shrink-0">
        <div className="p-3 border-b border-black/6">
          <button onClick={newSession}
            className="w-full flex items-center gap-2 bg-violet-50 hover:bg-violet-100 text-violet-700 font-semibold text-sm px-3.5 py-2.5 rounded-xl transition-all">
            <Plus size={15} />
            New chat
          </button>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          {loadingSessions ? (
            <div className="px-3 py-4 text-center text-xs text-[#B0B0B0]">Loading...</div>
          ) : sessions.length === 0 ? (
            <div className="px-3 py-8 text-center">
              <MessageSquare size={24} className="mx-auto text-[#D0D0D0] mb-2" />
              <p className="text-xs text-[#B0B0B0]">No conversations yet</p>
            </div>
          ) : (
            sessions.map(s => (
              <div key={s.id} onClick={() => loadSession(s.id)}
                className={cn(
                  'group flex items-center gap-2.5 px-3 py-2.5 cursor-pointer transition-all mx-1 rounded-xl',
                  activeId === s.id ? 'bg-violet-50' : 'hover:bg-gray-50'
                )}>
                <MessageSquare size={13} className={activeId === s.id ? 'text-violet-600' : 'text-[#B0B0B0]'} />
                <div className="flex-1 min-w-0">
                  <p className={cn('text-xs font-medium truncate', activeId === s.id ? 'text-violet-700' : 'text-[#5C5C5C]')}>
                    {s.title || 'New conversation'}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="p-3 border-t border-black/6">
          <button onClick={() => { useAuthStore.getState().logout(); window.location.href = '/login' }}
            className="w-full text-xs text-[#9E9E9E] hover:text-[#5C5C5C] py-2 transition-colors">
            Sign out
          </button>
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 overflow-y-auto bg-[#F9F7F2]">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center max-w-lg px-8">
                <div className="w-14 h-14 bg-violet-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-glow">
                  <Sparkles size={24} className="text-white" />
                </div>
                <h2 className="font-serif text-3xl font-semibold text-[#0F0F0F] mb-3">
                  How can I help you?
                </h2>
                <p className="text-sm text-[#9E9E9E] leading-relaxed mb-8">
                  I&apos;m Dacexy AI, powered by DeepSeek. I can analyze data,
                  write code, answer questions, and execute complex tasks autonomously.
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    'Analyze this dataset for trends',
                    'Write a Python script to automate my workflow',
                    'Research competitors in our market',
                    'Draft a project proposal email',
                  ].map(s => (
                    <button key={s} onClick={() => { setInput(s); inputRef.current?.focus() }}
                      className="text-left text-xs text-[#5C5C5C] bg-white hover:bg-gray-50 border border-black/8 rounded-xl px-4 py-3 transition-all shadow-soft leading-relaxed">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto pb-8">
              {messages.map(m => (
                <Message
                  key={m.id}
                  role={m.role}
                  content={m.content}
                  streaming={streaming && m.role === 'assistant' && m === messages[messages.length - 1]}
                />
              ))}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-black/6 bg-white/80 backdrop-blur-sm p-4">
          <div className="max-w-3xl mx-auto">
            <div className="bg-[#F2EFE8] border border-black/8 rounded-2xl focus-within:border-violet-400 focus-within:bg-white transition-all shadow-soft">
              <textarea
                ref={inputRef}
                value={input}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything… (Shift+Enter for new line)"
                rows={1}
                className="w-full px-4 pt-3.5 pb-1 bg-transparent text-sm text-[#0F0F0F] placeholder-[#B0B0B0] resize-none outline-none leading-relaxed max-h-44"
              />
              <div className="flex items-center justify-end px-3 pb-3 pt-1">
                <button onClick={send} disabled={!input.trim() || streaming}
                  className={cn(
                    'w-8 h-8 rounded-xl flex items-center justify-center transition-all',
                    input.trim() && !streaming
                      ? 'bg-violet-700 text-white hover:bg-violet-800'
                      : 'bg-[#E8E3D8] text-[#C0C0C0] cursor-not-allowed'
                  )}>
                  <Send size={14} />
                </button>
              </div>
            </div>
            <p className="text-center text-[10px] text-[#C0C0C0] mt-2">
              Powered by DeepSeek R1 · Responses may not always be accurate
            </p>
          </div>
        </div>
      </div>
    </div>
  )
                  }
