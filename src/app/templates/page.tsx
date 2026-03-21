'use client'
import { useRouter } from 'next/navigation'
import { MessageSquare, Bot, Globe, Mail, FileText, TrendingUp, Zap, Users } from 'lucide-react'

const TEMPLATES = [
  { icon: TrendingUp, title: 'Market Research', desc: 'Analyze competitors and market trends', prompt: 'Research the top 5 competitors in my industry and summarize their key features, pricing, and weaknesses', color: 'bg-violet-50 text-violet-700' },
  { icon: Mail, title: 'Cold Email', desc: 'Write compelling outreach emails', prompt: 'Write a professional cold email to a potential B2B client introducing our AI platform Dacexy and requesting a demo call', color: 'bg-blue-50 text-blue-700' },
  { icon: FileText, title: 'Business Proposal', desc: 'Create detailed project proposals', prompt: 'Write a detailed business proposal for a client who wants to integrate AI into their operations. Include executive summary, solution overview, timeline and pricing', color: 'bg-green-50 text-green-700' },
  { icon: Globe, title: 'SEO Blog Post', desc: 'Write SEO optimized content', prompt: 'Write a 1000 word SEO optimized blog post about the benefits of AI for small businesses in India. Include keywords naturally and add a compelling CTA', color: 'bg-amber-50 text-amber-700' },
  { icon: Users, title: 'LinkedIn Post', desc: 'Engaging social media content', prompt: 'Write an engaging LinkedIn post about how AI is transforming business operations in 2026. Make it personal, insightful and end with a question to drive engagement', color: 'bg-rose-50 text-rose-700' },
  { icon: Bot, title: 'Product Description', desc: 'Convert visitors to buyers', prompt: 'Write a compelling product description for Dacexy — an enterprise AI platform that includes AI chat, autonomous agents, image generation and website building. Target audience is Indian SMBs', color: 'bg-indigo-50 text-indigo-700' },
  { icon: Zap, title: 'Go-to-Market Plan', desc: 'Launch strategy for your product', prompt: 'Create a detailed 90-day go-to-market plan for launching an AI SaaS product in India. Include target audience, channels, pricing strategy, and KPIs', color: 'bg-emerald-50 text-emerald-700' },
  { icon: MessageSquare, title: 'Customer Support', desc: 'Professional support responses', prompt: 'Write 5 professional customer support email templates for common scenarios: billing issue, feature request, bug report, account access problem, and general inquiry', color: 'bg-orange-50 text-orange-700' },
]

export default function TemplatesPage() {
  const router = useRouter()

  function useTemplate(prompt: string) {
    localStorage.setItem('template_prompt', prompt)
    router.push('/chat')
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-semibold text-[#0F0F0F] mb-1">Templates</h1>
        <p className="text-sm text-[#9E9E9E]">Ready-made prompts to get started instantly</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {TEMPLATES.map((t) => (
          <button key={t.title} onClick={() => useTemplate(t.prompt)}
            className="flex items-start gap-4 bg-white border border-black/6 rounded-2xl p-5 shadow-soft hover:border-violet-200 hover:shadow-card transition-all text-left group">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${t.color}`}>
              <t.icon size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#0F0F0F] mb-1">{t.title}</p>
              <p className="text-xs text-[#9E9E9E] mb-2">{t.desc}</p>
              <p className="text-xs text-[#B0B0B0] line-clamp-2 leading-relaxed">{t.prompt}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
