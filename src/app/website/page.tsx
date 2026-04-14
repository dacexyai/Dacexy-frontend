'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, Send, Globe, Code, Eye, Download, Plus, Clock, ExternalLink, Loader2, X, ChevronLeft, RefreshCw, Maximize2, Monitor, Tablet, Smartphone, Copy, Check } from 'lucide-react'

const API_URL = "https://dacexy-backend-v7ku.onrender.com/api/v1"
const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('access_token') : null

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}

interface Website {
  id: string
  prompt: string
  status: string
  created_at: string
  preview_url?: string
}

const SUGGESTIONS = [
  'A modern SaaS landing page with pricing and features',
  'A portfolio website for a freelance designer',
  'A restaurant website with menu and reservations',
  'A startup landing page with waitlist signup',
  'An e-commerce product page for a skincare brand',
  'A personal blog with dark theme',
]

type ViewMode = 'preview' | 'code'
type DeviceMode = 'desktop' | 'tablet' | 'mobile'

export default function WebsitePage() {
  const router = useRouter()
  const [prompt, setPrompt] = useState('')
  const [generating, setGenerating] = useState(false)
  const [websites, setWebsites] = useState<Website[]>([])
  const [loadingList, setLoadingList] = useState(true)
  const [activeWebsite, setActiveWebsite] = useState<Website | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('preview')
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('desktop')
  const [htmlCode, setHtmlCode] = useState('')
  const [loadingCode, setLoadingCode] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const generateRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    if (!getToken()) { router.replace('/login'); return }
    loadWebsites()
    const savedPrompt = localStorage.getItem('website_prompt')
    if (savedPrompt) {
      setPrompt(savedPrompt)
      localStorage.removeItem('website_prompt')
      setTimeout(() => { if (generateRef.current) generateRef.current() }, 300)
    }
  }, [])

  async function authFetch(url: string, options: RequestInit = {}) {
    const token = getToken()
    if (!token) { router.replace('/login'); throw new Error('No token') }
    const res = await fetch(url, {
      ...options,
      headers: { ...(options.headers as Record<string, string> || {}), Authorization: `Bearer ${token}` }
    })
    if (res.status === 401) { router.replace('/login'); throw new Error('Session expired') }
    return res
  }

  async function loadWebsites() {
    try {
      const r = await authFetch(`${API_URL}/websites/`)
      if (!r.ok) return
      const data = await r.json()
      setWebsites(data.websites || [])
    } catch {} finally { setLoadingList(false) }
  }

  async function loadCode(websiteId: string) {
    setLoadingCode(true)
    try {
      const r = await fetch(`${API_URL}/websites/${websiteId}/preview`)
      setHtmlCode(await r.text())
    } catch {} finally { setLoadingCode(false) }
  }

  async function generate() {
    const currentPrompt = prompt.trim()
    if (!currentPrompt || generating) return
    setGenerating(true)
    setError('')
    setHtmlCode('')
    try {
      const res = await authFetch(`${API_URL}/websites/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: currentPrompt })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Generation failed')
      const newSite: Website = {
        id: data.id,
        prompt: currentPrompt,
        status: data.status,
        created_at: new Date().toISOString(),
        preview_url: `${API_URL}/websites/${data.id}/preview`
      }
      setActiveWebsite(newSite)
      setWebsites(prev => [newSite, ...prev])
      setPrompt('')
      loadCode(data.id)
    } catch (err: any) {
      setError(err.message || 'Generation failed. Please try again.')
    } finally { setGenerating(false) }
  }

  useEffect(() => { generateRef.current = generate }, [prompt, generating])

  function selectWebsite(site: Website) {
    setActiveWebsite({ ...site, preview_url: `${API_URL}/websites/${site.id}/preview` })
    loadCode(site.id)
    setViewMode('preview')
  }

  function downloadHtml() {
    if (!htmlCode) return
    const blob = new Blob([htmlCode], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'website.html'; a.click()
    URL.revokeObjectURL(url)
  }

  function copyCode() {
    if (!htmlCode) return
    navigator.clipboard.writeText(htmlCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setPrompt(e.target.value)
    const t = e.target
    t.style.height = 'auto'
    t.style.height = Math.min(t.scrollHeight, 160) + 'px'
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); generate() }
  }

  const deviceWidth = deviceMode === 'mobile' ? 'w-[390px]' : deviceMode === 'tablet' ? 'w-[768px]' : 'w-full'

  return (
    <div className="flex h-screen bg-[#F9F7F2] overflow-hidden">

      {/* Left sidebar */}
      <div className={cn(
        'flex flex-col bg-white border-r border-black/6 shrink-0 transition-all duration-300',
        sidebarOpen ? 'w-60' : 'w-0 overflow-hidden'
      )}>
        {/* Logo */}
        <div className="p-4 border-b border-black/6">
          <div className="flex items-center gap-2 mb-0.5">
            <div className="w-7 h-7 bg-violet-700 rounded-xl flex items-center justify-center shadow-sm">
              <Sparkles size={12} className="text-white" />
            </div>
            <span className="font-serif font-bold text-sm text-[#0F0F0F]">Dacexy</span>
          </div>
          <p className="text-[9px] text-[#B0B0B0] ml-9 font-semibold uppercase tracking-widest">Website Builder</p>
        </div>

        {/* Actions */}
        <div className="p-3 space-y-1.5 border-b border-black/6">
          <button onClick={() => { setActiveWebsite(null); setHtmlCode(''); setPrompt(''); setError('') }}
            className="w-full flex items-center gap-2 bg-violet-700 hover:bg-violet-800 text-white text-xs font-semibold px-3 py-2.5 rounded-xl transition-all">
            <Plus size={13} /> New Website
          </button>
          <button onClick={() => router.push('/chat')}
            className="w-full flex items-center gap-2 bg-[#F2EFE8] hover:bg-[#E8E4DC] text-[#5C5C5C] text-xs font-semibold px-3 py-2.5 rounded-xl transition-all">
            ← Back to Chat
          </button>
        </div>

        {/* History */}
        <div className="flex-1 overflow-y-auto p-2">
          <p className="text-[9px] font-extrabold text-[#C0C0C0] uppercase tracking-widest px-2 py-2">Recent</p>
          {loadingList ? (
            <div className="flex justify-center py-6"><Loader2 size={15} className="animate-spin text-[#C0C0C0]" /></div>
          ) : websites.length === 0 ? (
            <div className="text-center py-10">
              <Globe size={22} className="mx-auto text-[#D0D0D0] mb-2" />
              <p className="text-xs text-[#C0C0C0]">No websites yet</p>
            </div>
          ) : websites.map(site => (
            <button key={site.id} onClick={() => selectWebsite(site)}
              className={cn(
                'w-full text-left px-3 py-2.5 rounded-xl mb-1 transition-all border',
                activeWebsite?.id === site.id ? 'bg-violet-50 border-violet-200' : 'hover:bg-[#F9F7F2] border-transparent hover:border-black/6'
              )}>
              <div className="flex items-center gap-1.5 mb-1">
                <div className={cn('w-1.5 h-1.5 rounded-full',
                  site.status === 'completed' ? 'bg-emerald-500' : site.status === 'failed' ? 'bg-red-500' : 'bg-amber-400')} />
                <span className={cn('text-[9px] font-bold uppercase tracking-wider',
                  site.status === 'completed' ? 'text-emerald-600' : site.status === 'failed' ? 'text-red-500' : 'text-amber-500')}>
                  {site.status}
                </span>
              </div>
              <p className="text-xs text-[#0F0F0F] leading-relaxed line-clamp-2 font-medium">{site.prompt}</p>
              <p className="text-[10px] text-[#C0C0C0] mt-1.5 flex items-center gap-1">
                <Clock size={9} />{new Date(site.created_at).toLocaleDateString()}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">

        {activeWebsite ? (
          <>
            {/* Top toolbar — Lovable style */}
            <div className="flex items-center justify-between px-3 h-12 border-b border-black/6 bg-white shrink-0">
              <div className="flex items-center gap-2">
                <button onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-1.5 hover:bg-[#F2EFE8] rounded-lg transition-colors">
                  <ChevronLeft size={15} className={cn('text-[#5C5C5C] transition-transform', !sidebarOpen && 'rotate-180')} />
                </button>
                <div className="w-px h-4 bg-black/8" />
                <p className="text-xs text-[#5C5C5C] truncate max-w-[200px] font-medium">{activeWebsite.prompt}</p>
              </div>

              {/* Center — view toggle */}
              <div className="flex items-center gap-1 bg-[#F2EFE8] rounded-lg p-0.5">
                <button onClick={() => setViewMode('preview')}
                  className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all',
                    viewMode === 'preview' ? 'bg-white text-violet-700 shadow-sm' : 'text-[#9E9E9E] hover:text-[#5C5C5C]')}>
                  <Eye size={12} /> Preview
                </button>
                <button onClick={() => setViewMode('code')}
                  className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all',
                    viewMode === 'code' ? 'bg-white text-violet-700 shadow-sm' : 'text-[#9E9E9E] hover:text-[#5C5C5C]')}>
                  <Code size={12} /> Code
                </button>
              </div>

              {/* Right actions */}
              <div className="flex items-center gap-1.5">
                {viewMode === 'preview' && (
                  <div className="flex items-center gap-0.5 bg-[#F2EFE8] rounded-lg p-0.5 mr-1">
                    {(['desktop', 'tablet', 'mobile'] as DeviceMode[]).map(d => (
                      <button key={d} onClick={() => setDeviceMode(d)}
                        className={cn('p-1.5 rounded-md transition-all',
                          deviceMode === d ? 'bg-white shadow-sm text-violet-700' : 'text-[#9E9E9E] hover:text-[#5C5C5C]')}>
                        {d === 'desktop' ? <Monitor size={13} /> : d === 'tablet' ? <Tablet size={13} /> : <Smartphone size={13} />}
                      </button>
                    ))}
                  </div>
                )}
                {viewMode === 'code' && (
                  <button onClick={copyCode}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#F2EFE8] hover:bg-[#E8E4DC] text-[#5C5C5C] text-xs font-semibold rounded-lg transition-all">
                    {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                )}
                <button onClick={downloadHtml} disabled={!htmlCode}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#F2EFE8] hover:bg-[#E8E4DC] text-[#5C5C5C] text-xs font-semibold rounded-lg transition-all disabled:opacity-40">
                  <Download size={12} /> Download
                </button>
                <a href={activeWebsite.preview_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-700 hover:bg-violet-800 text-white text-xs font-semibold rounded-lg transition-all">
                  <ExternalLink size={12} /> Open
                </a>
              </div>
            </div>

            {/* Preview / Code area */}
            <div className="flex-1 overflow-hidden bg-[#F2EFE8]">
              {viewMode === 'preview' ? (
                <div className={cn('h-full flex items-start justify-center transition-all duration-300',
                  deviceMode === 'desktop' ? 'p-0' : 'pt-4 pb-0')}>
                  <div className={cn('h-full bg-white transition-all duration-300 overflow-hidden',
                    deviceMode === 'desktop' ? 'w-full' : deviceWidth + ' rounded-t-2xl shadow-2xl border border-black/8')}>
                    {loadingCode ? (
                      <div className="flex flex-col items-center justify-center h-full gap-3">
                        <Loader2 size={24} className="animate-spin text-violet-600" />
                        <p className="text-sm text-[#9E9E9E]">Loading preview…</p>
                      </div>
                    ) : (
                      <iframe
                        src={activeWebsite.preview_url}
                        className="w-full h-full border-0"
                        title="Website Preview"
                        sandbox="allow-scripts allow-same-origin allow-forms"
                      />
                    )}
                  </div>
                </div>
              ) : (
                <div className="h-full overflow-auto p-4">
                  {loadingCode ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 size={20} className="animate-spin text-violet-600" />
                    </div>
                  ) : (
                    <div className="bg-[#0F0F0F] rounded-2xl overflow-hidden h-full">
                      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/8">
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-3 rounded-full bg-red-500/70" />
                          <div className="w-3 h-3 rounded-full bg-amber-500/70" />
                          <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
                        </div>
                        <span className="text-[10px] text-white/30 font-mono">index.html</span>
                        <div className="w-14" />
                      </div>
                      <pre className="text-xs text-emerald-400/90 font-mono leading-relaxed p-5 overflow-auto h-[calc(100%-40px)] whitespace-pre-wrap">
                        {htmlCode || '<!-- No code available -->'}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom prompt bar */}
            <div className="border-t border-black/6 bg-white p-3">
              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2 mb-2">
                  <X size={12} className="text-red-500 shrink-0" />
                  <p className="text-xs text-red-600 flex-1">{error}</p>
                  <button onClick={() => setError('')}><X size={11} className="text-red-400" /></button>
                </div>
              )}
              <div className="flex items-end gap-2 bg-[#F2EFE8] border border-black/8 focus-within:border-violet-400 focus-within:bg-white rounded-2xl px-4 py-3 transition-all">
                <textarea
                  value={prompt}
                  onChange={handleInput}
                  onKeyDown={handleKeyDown}
                  placeholder="Describe changes… e.g. make the hero blue, add a pricing section, change font to serif"
                  rows={1}
                  className="flex-1 bg-transparent text-sm text-[#0F0F0F] placeholder-[#B0B0B0] resize-none outline-none leading-relaxed max-h-32"
                />
                <button onClick={generate} disabled={!prompt.trim() || generating}
                  className="w-8 h-8 bg-violet-700 hover:bg-violet-800 disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition-all shrink-0">
                  {generating ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                </button>
              </div>
            </div>
          </>

        ) : (
          /* Empty / generate state */
          <div className="flex-1 flex flex-col overflow-hidden">

            {/* Top bar */}
            <div className="flex items-center px-4 h-12 border-b border-black/6 bg-white shrink-0">
              <button onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-1.5 hover:bg-[#F2EFE8] rounded-lg transition-colors mr-2">
                <ChevronLeft size={15} className={cn('text-[#5C5C5C] transition-transform', !sidebarOpen && 'rotate-180')} />
              </button>
              <div className="w-px h-4 bg-black/8 mr-3" />
              <span className="text-xs font-semibold text-[#5C5C5C]">New Website</span>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center px-6 overflow-y-auto">
              <div className="w-full max-w-2xl py-8">

                {/* Header */}
                <div className="text-center mb-8">
                  <div className="w-14 h-14 bg-violet-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-700/20">
                    <Globe size={24} className="text-white" />
                  </div>
                  <h1 className="font-serif text-3xl font-semibold text-[#0F0F0F] mb-2">
                    Build any website with AI
                  </h1>
                  <p className="text-sm text-[#9E9E9E] leading-relaxed">
                    Describe what you want and Dacexy AI generates a complete, beautiful website in seconds.
                  </p>
                </div>

                {error && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
                    <X size={13} className="text-red-500 shrink-0" />
                    <p className="text-xs text-red-600">{error}</p>
                  </div>
                )}

                {generating && (
                  <div className="bg-violet-50 border border-violet-200 rounded-2xl p-6 mb-5 text-center">
                    <div className="relative w-10 h-10 mx-auto mb-3">
                      <Loader2 size={40} className="animate-spin text-violet-300 absolute inset-0" />
                      <Sparkles size={16} className="text-violet-600 absolute inset-0 m-auto" />
                    </div>
                    <p className="text-sm font-semibold text-violet-700 mb-1">Building your website…</p>
                    <p className="text-xs text-violet-400">This takes 30–60 seconds. Hang tight!</p>
                    <div className="mt-3 flex justify-center gap-1">
                      {[0,1,2,3,4].map(i => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce"
                          style={{ animationDelay: `${i * 0.15}s` }} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Main prompt box */}
                <div className="bg-white border border-black/8 rounded-2xl shadow-sm overflow-hidden mb-5 focus-within:border-violet-300 focus-within:shadow-md transition-all">
                  <textarea
                    ref={textareaRef}
                    value={prompt}
                    onChange={handleInput}
                    onKeyDown={handleKeyDown}
                    placeholder="Describe your website… e.g. A modern SaaS landing page with dark hero section, feature cards, pricing table, and FAQ"
                    rows={4}
                    className="w-full px-5 py-4 text-sm text-[#0F0F0F] placeholder-[#C0C0C0] resize-none outline-none leading-relaxed"
                  />
                  <div className="flex items-center justify-between px-4 py-3 border-t border-black/6 bg-[#FAFAF9]">
                    <p className="text-[10px] text-[#C0C0C0]">↵ Enter to generate · Shift+Enter for new line</p>
                    <button onClick={generate} disabled={!prompt.trim() || generating}
                      className="flex items-center gap-2 bg-violet-700 hover:bg-violet-800 disabled:opacity-40 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-all shadow-sm shadow-violet-700/30">
                      {generating
                        ? <><Loader2 size={14} className="animate-spin" /> Generating…</>
                        : <><Sparkles size={14} /> Generate Website</>}
                    </button>
                  </div>
                </div>

                {/* Suggestions */}
                <div>
                  <p className="text-[9px] font-extrabold text-[#C0C0C0] uppercase tracking-widest mb-2.5">Start with a template</p>
                  <div className="grid grid-cols-2 gap-2">
                    {SUGGESTIONS.map(s => (
                      <button key={s} onClick={() => { setPrompt(s); textareaRef.current?.focus() }}
                        className="text-left text-xs text-[#5C5C5C] bg-white hover:bg-violet-50 hover:border-violet-200 border border-black/6 rounded-xl px-4 py-3 transition-all leading-relaxed font-medium group">
                        <Globe size={11} className="text-[#C0C0C0] group-hover:text-violet-500 mb-1.5 transition-colors" />
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
