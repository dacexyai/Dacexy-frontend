'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, Send, Globe, Code, Eye, Download, Plus, Clock, ExternalLink, Loader2, X, ChevronLeft } from 'lucide-react'

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

export default function WebsitePage() {
  const router = useRouter()
  const [prompt, setPrompt] = useState('')
  const [generating, setGenerating] = useState(false)
  const [websites, setWebsites] = useState<Website[]>([])
  const [loadingList, setLoadingList] = useState(true)
  const [activeWebsite, setActiveWebsite] = useState<Website | null>(null)
  const [previewMode, setPreviewMode] = useState<'preview' | 'code'>('preview')
  const [htmlCode, setHtmlCode] = useState('')
  const [loadingCode, setLoadingCode] = useState(false)
  const [error, setError] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!getToken()) { router.replace('/login'); return }
    loadWebsites()
  }, [])

  async function authFetch(url: string, options: RequestInit = {}) {
    const token = getToken()
    if (!token) { router.replace('/login'); throw new Error('No token') }
    const res = await fetch(url, {
      ...options,
      headers: {
        ...(options.headers as Record<string, string> || {}),
        Authorization: `Bearer ${token}`,
      }
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
      const html = await r.text()
      setHtmlCode(html)
    } catch {} finally { setLoadingCode(false) }
  }

  async function generate() {
    if (!prompt.trim() || generating) return
    setGenerating(true)
    setError('')
    setActiveWebsite(null)
    try {
      const res = await authFetch(`${API_URL}/websites/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim() })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Generation failed')
      const newSite: Website = {
        id: data.id,
        prompt: prompt.trim(),
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

  function selectWebsite(site: Website) {
    setActiveWebsite({ ...site, preview_url: `${API_URL}/websites/${site.id}/preview` })
    loadCode(site.id)
    setPreviewMode('preview')
  }

  function downloadHtml() {
    if (!htmlCode) return
    const blob = new Blob([htmlCode], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'website.html'
    a.click()
    URL.revokeObjectURL(url)
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

  return (
    <div className="flex h-screen bg-white overflow-hidden">

      {/* Left sidebar — history */}
      <div className="w-60 border-r border-black/6 flex flex-col bg-[#FAFAF9] shrink-0">
        <div className="p-4 border-b border-black/6">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 bg-violet-700 rounded-lg flex items-center justify-center">
              <Sparkles size={11} className="text-white" />
            </div>
            <span className="font-serif font-bold text-sm text-[#0F0F0F]">Dacexy</span>
          </div>
          <p className="text-[10px] text-[#9E9E9E] ml-8">Website Builder</p>
        </div>

        <div className="p-3">
          <button
            onClick={() => { setActiveWebsite(null); setHtmlCode(''); setPrompt('') }}
            className="w-full flex items-center gap-2 bg-violet-700 hover:bg-violet-800 text-white text-xs font-semibold px-3 py-2.5 rounded-xl transition-all">
            <Plus size={13} /> New Website
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-4">
          <p className="text-[9px] font-extrabold text-[#B0B0B0] uppercase tracking-widest px-2 mb-2">Recent</p>
          {loadingList ? (
            <div className="flex justify-center py-6">
              <Loader2 size={16} className="animate-spin text-[#B0B0B0]" />
            </div>
          ) : websites.length === 0 ? (
            <div className="text-center py-8">
              <Globe size={20} className="mx-auto text-[#D0D0D0] mb-2" />
              <p className="text-xs text-[#C0C0C0]">No websites yet</p>
            </div>
          ) : websites.map(site => (
            <button key={site.id} onClick={() => selectWebsite(site)}
              className={cn(
                'w-full text-left px-3 py-2.5 rounded-xl mb-1 transition-all group',
                activeWebsite?.id === site.id ? 'bg-violet-50 border border-violet-200' : 'hover:bg-white hover:border hover:border-black/6 border border-transparent'
              )}>
              <div className="flex items-center gap-2 mb-1">
                <Globe size={11} className={activeWebsite?.id === site.id ? 'text-violet-600' : 'text-[#B0B0B0]'} />
                <span className={cn('text-[10px] font-semibold uppercase tracking-wide',
                  site.status === 'completed' ? 'text-emerald-600' : site.status === 'failed' ? 'text-red-500' : 'text-amber-500')}>
                  {site.status}
                </span>
              </div>
              <p className="text-xs text-[#0F0F0F] leading-relaxed line-clamp-2">{site.prompt}</p>
              <p className="text-[10px] text-[#C0C0C0] mt-1 flex items-center gap-1">
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
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 h-12 border-b border-black/6 bg-white shrink-0">
              <div className="flex items-center gap-3">
                <button onClick={() => setActiveWebsite(null)}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                  <ChevronLeft size={15} className="text-[#5C5C5C]" />
                </button>
                <p className="text-xs text-[#5C5C5C] truncate max-w-xs">{activeWebsite.prompt}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex bg-[#F2EFE8] rounded-lg p-0.5">
                  <button onClick={() => setPreviewMode('preview')}
                    className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all',
                      previewMode === 'preview' ? 'bg-white text-violet-700 shadow-sm' : 'text-[#9E9E9E]')}>
                    <Eye size={12} /> Preview
                  </button>
                  <button onClick={() => setPreviewMode('code')}
                    className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all',
                      previewMode === 'code' ? 'bg-white text-violet-700 shadow-sm' : 'text-[#9E9E9E]')}>
                    <Code size={12} /> Code
                  </button>
                </div>
                <button onClick={downloadHtml} disabled={!htmlCode}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F2EFE8] hover:bg-gray-200 text-[#5C5C5C] text-xs font-semibold rounded-lg transition-all disabled:opacity-40">
                  <Download size={12} /> Download
                </button>
                <a href={activeWebsite.preview_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-700 hover:bg-violet-800 text-white text-xs font-semibold rounded-lg transition-all">
                  <ExternalLink size={12} /> Open
                </a>
              </div>
            </div>

            {/* Preview / Code */}
            <div className="flex-1 overflow-hidden bg-[#F9F7F2]">
              {previewMode === 'preview' ? (
                <iframe
                  src={activeWebsite.preview_url}
                  className="w-full h-full border-0 bg-white"
                  title="Website Preview"
                  sandbox="allow-scripts allow-same-origin allow-forms"
                />
              ) : (
                <div className="h-full overflow-auto p-4">
                  {loadingCode ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 size={20} className="animate-spin text-violet-600" />
                    </div>
                  ) : (
                    <pre className="text-xs text-[#0F0F0F] font-mono leading-relaxed bg-white border border-black/6 rounded-2xl p-6 overflow-auto whitespace-pre-wrap">
                      {htmlCode || 'No code available'}
                    </pre>
                  )}
                </div>
              )}
            </div>

            {/* Bottom prompt bar for iteration */}
            <div className="border-t border-black/6 bg-white p-3">
              <div className="flex items-end gap-2 bg-[#F2EFE8] border border-black/8 focus-within:border-violet-400 focus-within:bg-white rounded-2xl px-4 py-3 transition-all">
                <textarea
                  ref={textareaRef}
                  value={prompt}
                  onChange={handleInput}
                  onKeyDown={handleKeyDown}
                  placeholder="Describe changes… e.g. make the hero section blue"
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
          /* Empty state — prompt to generate */
          <div className="flex-1 flex flex-col items-center justify-center px-6">
            <div className="w-full max-w-2xl">
              <div className="text-center mb-10">
                <div className="w-16 h-16 bg-violet-700 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <Globe size={28} className="text-white" />
                </div>
                <h1 className="font-serif text-3xl font-semibold text-[#0F0F0F] mb-3">
                  Build any website with AI
                </h1>
                <p className="text-sm text-[#9E9E9E] leading-relaxed">
                  Describe what you want and Dacexy AI will generate a complete, beautiful website in seconds.
                </p>
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
                  <X size={13} className="text-red-500 shrink-0" />
                  <p className="text-xs text-red-600">{error}</p>
                </div>
              )}

              <div className="bg-white border border-black/8 rounded-2xl shadow-sm overflow-hidden mb-6">
                <textarea
                  ref={textareaRef}
                  value={prompt}
                  onChange={handleInput}
                  onKeyDown={handleKeyDown}
                  placeholder="Describe your website… e.g. A modern SaaS landing page with dark hero, pricing table, and FAQ"
                  rows={3}
                  className="w-full px-5 py-4 text-sm text-[#0F0F0F] placeholder-[#B0B0B0] resize-none outline-none leading-relaxed"
                />
                <div className="flex items-center justify-between px-4 py-3 border-t border-black/6 bg-[#FAFAF9]">
                  <p className="text-xs text-[#B0B0B0]">Press Enter to generate · Shift+Enter for new line</p>
                  <button onClick={generate} disabled={!prompt.trim() || generating}
                    className="flex items-center gap-2 bg-violet-700 hover:bg-violet-800 disabled:opacity-40 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-all">
                    {generating
                      ? <><Loader2 size={14} className="animate-spin" /> Generating...</>
                      : <><Sparkles size={14} /> Generate</>}
                  </button>
                </div>
              </div>

              {generating && (
                <div className="bg-violet-50 border border-violet-200 rounded-2xl p-6 mb-6 text-center">
                  <Loader2 size={24} className="animate-spin text-violet-600 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-violet-700">Building your website…</p>
                  <p className="text-xs text-violet-500 mt-1">This usually takes 20–40 seconds</p>
                </div>
              )}

              <div>
                <p className="text-[9px] font-extrabold text-[#B0B0B0] uppercase tracking-widest mb-3">Try these</p>
                <div className="grid grid-cols-2 gap-2">
                  {SUGGESTIONS.map(s => (
                    <button key={s} onClick={() => { setPrompt(s); textareaRef.current?.focus() }}
                      className="text-left text-xs text-[#5C5C5C] bg-white hover:bg-violet-50 hover:border-violet-200 border border-black/6 rounded-xl px-4 py-3 transition-all leading-relaxed">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
