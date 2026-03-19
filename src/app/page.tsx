"use client"
import Link from 'next/link'
import { useState, useEffect } from 'react'
import {
  Zap, Brain, Shield, Globe, ChevronRight, Check,
  ArrowRight, Sparkles, Terminal, Layers, Bot, Star,
  Menu, X
} from 'lucide-react'

function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', h)
    return () => window.removeEventListener('scroll', h)
  }, [])
  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-xl shadow-soft border-b border-black/5' : ''}`}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-violet-700 flex items-center justify-center shadow-glow">
            <Zap size={16} className="text-white fill-white" />
          </div>
          <span className="font-serif text-xl font-semibold tracking-tight">Dacexy</span>
        </Link>
        <div className="hidden md:flex items-center gap-8">
          {['Features','Pricing','Docs'].map(l => (
            <a key={l} href={`#${l.toLowerCase()}`} className="text-sm font-medium text-[#5C5C5C] hover:text-[#0F0F0F] transition-colors">{l}</a>
          ))}
        </div>
        <div className="hidden md:flex items-center gap-3">
          <Link href="/login" className="text-sm font-medium text-[#5C5C5C] hover:text-[#0F0F0F] transition-colors px-4 py-2">Sign in</Link>
          <Link href="/register" className="text-sm font-semibold bg-[#0F0F0F] text-white px-5 py-2.5 rounded-xl hover:bg-violet-800 transition-colors shadow-sm">Get started free</Link>
        </div>
        <button onClick={() => setOpen(!open)} className="md:hidden p-2 rounded-lg hover:bg-black/5">
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      {open && (
        <div className="md:hidden bg-white border-t border-black/5 px-6 py-4 flex flex-col gap-4">
          {['Features','Pricing','Docs'].map(l => (
            <a key={l} href={`#${l.toLowerCase()}`} onClick={() => setOpen(false)} className="text-sm font-medium text-[#5C5C5C]">{l}</a>
          ))}
          <hr className="border-black/8" />
          <Link href="/login" className="text-sm font-medium">Sign in</Link>
          <Link href="/register" className="text-sm font-semibold bg-[#0F0F0F] text-white px-5 py-2.5 rounded-xl text-center">Get started free</Link>
        </div>
      )}
    </nav>
  )
}

function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-amber-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30" />
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-violet-100 rounded-full mix-blend-multiply filter blur-3xl opacity-35" />
      </div>
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 bg-white/80 border border-violet-200 rounded-full px-4 py-1.5 mb-8 shadow-soft">
          <Sparkles size={13} className="text-violet-600" />
          <span className="text-xs font-semibold text-violet-700 tracking-wide uppercase">Enterprise Agentic AI</span>
        </div>
        <h1 className="font-serif text-6xl md:text-7xl lg:text-8xl font-semibold leading-[0.95] tracking-tight text-[#0F0F0F] mb-6">
          AI that works<br />
          <em className="not-italic text-violet-700">while you sleep</em>
        </h1>
        <p className="text-lg md:text-xl text-[#5C5C5C] max-w-2xl mx-auto mb-10 leading-relaxed font-light">
          Dacexy is a production-grade agentic AI platform. Deploy autonomous agents, chat with DeepSeek AI, and automate complex workflows — all from one workspace.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link href="/register" className="group flex items-center gap-2 bg-violet-700 hover:bg-violet-800 text-white font-semibold text-sm px-7 py-3.5 rounded-xl transition-all shadow-glow">
            Start free — no card needed
            <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <a href="#features" className="flex items-center gap-2 bg-white hover:bg-gray-50 text-[#0F0F0F] font-semibold text-sm px-7 py-3.5 rounded-xl border border-black/10 transition-all shadow-soft">
            See how it works
            <ChevronRight size={15} />
          </a>
        </div>
        <div className="flex items-center justify-center gap-2 text-sm text-[#9E9E9E]">
          <div className="flex -space-x-1.5">
            {['#6D28D9','#F59E0B','#10B981','#EF4444','#3B82F6'].map((c,i) => (
              <div key={i} className="w-7 h-7 rounded-full border-2 border-white" style={{ background: c }} />
            ))}
          </div>
          <span>Trusted by <strong className="text-[#5C5C5C]">2,000+</strong> teams</span>
          <span>·</span>
          <div className="flex">
            {[1,2,3,4,5].map(i => <Star key={i} size={12} className="fill-amber-400 text-amber-400" />)}
          </div>
          <span>4.9/5</span>
        </div>
        <div className="mt-16 relative mx-auto max-w-4xl">
          <div className="bg-white rounded-2xl shadow-card border border-black/6 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-black/5 bg-gray-50">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <div className="ml-4 flex-1 bg-gray-200 rounded-md h-5 max-w-xs" />
            </div>
            <div className="p-6 space-y-4 min-h-[260px]">
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-[#0F0F0F] flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">Y</span>
                </div>
                <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm text-[#0F0F0F] max-w-md">
                  Analyze our Q3 sales data and identify the top 3 growth opportunities
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <div className="bg-violet-700 rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm text-white max-w-lg text-left">
                  <div className="flex items-center gap-1.5 mb-2 opacity-70 text-xs">
                    <Bot size={11} /> Agent activated · 4 steps
                  </div>
                  I have analyzed your Q3 data across 12 markets. Here are the top 3 growth opportunities: <strong>1) APAC expansion</strong> (+43% YoY), <strong>2) Enterprise upsell</strong> (2.3x LTV), <strong>3) API product</strong> (fastest growing segment)...
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-[#0F0F0F] flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">Y</span>
                </div>
                <div className="flex items-center gap-2 text-[#9E9E9E] text-sm">
                  <span className="inline-block w-2 h-2 bg-violet-600 rounded-full animate-pulse" />
                  Dacexy is thinking...
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

const FEATURES = [
  { icon: Brain, title: 'Agentic AI', desc: 'Multi-step autonomous agents powered by DeepSeek R1. Plan, execute, and verify — all without human hand-holding.', color: 'text-violet-700 bg-violet-50' },
  { icon: Terminal, title: 'Desktop Agent', desc: 'A native app that runs on your machine. The AI controls your desktop, browser, and files directly.', color: 'text-amber-700 bg-amber-50' },
  { icon: Shield, title: 'Enterprise Security', desc: 'Zero-trust architecture, Argon2id hashing, MFA, rate limiting, full audit logs. SOC2-ready from day one.', color: 'text-green-700 bg-green-50' },
  { icon: Layers, title: 'Multi-Tenant Orgs', desc: 'Teams, roles, API keys, SSO, custom domains — the full enterprise org hierarchy built in.', color: 'text-blue-700 bg-blue-50' },
  { icon: Globe, title: 'AI Website Builder', desc: 'Describe a website in plain English. Get a production-ready website back in seconds.', color: 'text-rose-700 bg-rose-50' },
  { icon: Zap, title: 'Real-time Streaming', desc: 'WebSocket-powered live updates for every agent step. Watch your AI work in real time.', color: 'text-indigo-700 bg-indigo-50' },
]

function Features() {
  return (
    <section id="features" className="py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <p className="text-xs font-semibold uppercase tracking-widest text-violet-600 mb-4">Platform Features</p>
          <h2 className="font-serif text-5xl md:text-6xl font-semibold text-[#0F0F0F] leading-tight">
            Everything you need.<br />
            <span className="text-[#9E9E9E]">Nothing you don&apos;t.</span>
          </h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="group bg-white rounded-2xl p-7 border border-black/6 shadow-soft hover:shadow-card transition-all duration-300 hover:-translate-y-0.5">
              <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center mb-5`}>
                <Icon size={20} />
              </div>
              <h3 className="font-serif font-semibold text-lg text-[#0F0F0F] mb-2">{title}</h3>
              <p className="text-sm text-[#6B6B6B] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

const PLANS = [
  { name: 'Free', price: 0, desc: 'For individuals exploring AI', features: ['50 AI messages/month','5 agent runs/month','1 GB storage','Community support'], cta: 'Start free', highlight: false },
  { name: 'Starter', price: 999, desc: 'For small teams getting started', features: ['500 AI messages/month','50 agent runs/month','10 GB storage','Email support','API access'], cta: 'Get started', highlight: false },
  { name: 'Growth', price: 2999, desc: 'For teams that move fast', features: ['5,000 AI messages/month','500 agent runs/month','100 GB storage','Priority support','API access','Website Builder','Domain management'], cta: 'Start growing', highlight: true },
  { name: 'Enterprise', price: 9999, desc: 'For mission-critical workloads', features: ['Unlimited messages','Unlimited agent runs','1 TB storage','Dedicated support','SSO + SAML','Desktop Agent','Custom models','SLA guarantee'], cta: 'Contact sales', highlight: false },
]

function Pricing() {
  return (
    <section id="pricing" className="py-32 px-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <p className="text-xs font-semibold uppercase tracking-widest text-violet-600 mb-4">Pricing</p>
          <h2 className="font-serif text-5xl md:text-6xl font-semibold text-[#0F0F0F] leading-tight">Simple, honest pricing</h2>
          <p className="text-lg text-[#6B6B6B] mt-4">No hidden fees. Cancel anytime.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PLANS.map((plan) => (
            <div key={plan.name} className={`relative rounded-2xl p-7 border transition-all duration-200 ${plan.highlight ? 'bg-violet-700 border-violet-700 shadow-glow text-white scale-105' : 'bg-white border-black/8 shadow-soft hover:shadow-card hover:-translate-y-0.5'}`}>
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-[#0F0F0F] text-xs font-bold px-3 py-1 rounded-full">Most Popular</div>
              )}
              <div className="mb-6">
                <h3 className={`font-serif font-semibold text-lg mb-1 ${plan.highlight ? 'text-white' : 'text-[#0F0F0F]'}`}>{plan.name}</h3>
                <p className={`text-xs mb-4 ${plan.highlight ? 'text-violet-200' : 'text-[#9E9E9E]'}`}>{plan.desc}</p>
                <div className="flex items-baseline gap-1">
                  <span className={`font-serif text-4xl font-semibold ${plan.highlight ? 'text-white' : 'text-[#0F0F0F]'}`}>
                    {plan.price === 0 ? 'Free' : `₹${plan.price}`}
                  </span>
                  {plan.price > 0 && <span className={`text-sm ${plan.highlight ? 'text-violet-200' : 'text-[#9E9E9E]'}`}>/mo</span>}
                </div>
              </div>
              <ul className="space-y-2.5 mb-8">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <Check size={14} className={`mt-0.5 shrink-0 ${plan.highlight ? 'text-violet-200' : 'text-violet-600'}`} />
                    <span className={plan.highlight ? 'text-violet-100' : 'text-[#5C5C5C]'}>{f}</span>
                  </li>
                ))}
              </ul>
              <Link href="/register" className={`block text-center text-sm font-semibold px-5 py-3 rounded-xl transition-all ${plan.highlight ? 'bg-white text-violet-700 hover:bg-gray-100' : 'bg-violet-700 text-white hover:bg-violet-800'}`}>
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CTABanner() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <div className="bg-[#0F0F0F] rounded-3xl p-12 shadow-card relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-900/40 to-transparent pointer-events-none" />
          <div className="relative z-10">
            <h2 className="font-serif text-4xl md:text-5xl font-semibold text-white mb-4 leading-tight">Start building with AI today</h2>
            <p className="text-gray-400 text-lg mb-8">Free plan. No credit card. Set up in under 2 minutes.</p>
            <Link href="/register" className="inline-flex items-center gap-2 bg-violet-500 hover:bg-violet-400 text-white font-semibold text-sm px-8 py-4 rounded-xl transition-all shadow-glow">
              Create free account
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t border-black/8 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-violet-700 flex items-center justify-center">
              <Zap size={13} className="text-white fill-white" />
            </div>
            <span className="font-serif font-semibold">Dacexy</span>
          </div>
          <div className="flex items-center gap-8">
            {['Privacy','Terms','Docs','Status'].map(l => (
              <a key={l} href="#" className="text-xs text-[#9E9E9E] hover:text-[#5C5C5C] transition-colors">{l}</a>
            ))}
          </div>
          <p className="text-xs text-[#9E9E9E]">© 2026 Dacexy. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default function LandingPage() {
  return (
    <main className="bg-white">
      <Navbar />
      <Hero />
      <Features />
      <Pricing />
      <CTABanner />
      <Footer />
    </main>
  )
              }
