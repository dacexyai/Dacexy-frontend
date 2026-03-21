'use client'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import { Sparkles, MessageSquare, Bot, Globe, Brain, Zap } from 'lucide-react'

export default function OnboardingPage() {
  const router = useRouter()
  const { user } = useAuthStore()

  return (
    <div className="min-h-screen bg-[#F9F7F2] flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-violet-700 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-glow">
            <Sparkles size={28} className="text-white" />
          </div>
          <h1 className="font-serif text-3xl font-semibold text-[#0F0F0F] mb-2">
            Welcome to Dacexy{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}! 🎉
          </h1>
          <p className="text-[#9E9E9E] text-sm leading-relaxed">
            Your AI-powered workspace is ready. A verification email has been sent to your inbox.
          </p>
        </div>

        <div className="bg-white border border-black/6 rounded-2xl p-6 shadow-soft mb-6">
          <h2 className="font-semibold text-[#0F0F0F] mb-4 text-sm uppercase tracking-wide">What you can do with Dacexy</h2>
          <div className="space-y-3">
            {[
              { icon: MessageSquare, color: 'bg-blue-50 text-blue-700', title: 'AI Chat', desc: 'Chat with powerful DeepSeek AI for any task' },
              { icon: Bot, color: 'bg-violet-50 text-violet-700', title: 'Autonomous Agent', desc: 'Let AI execute complex multi-step tasks' },
              { icon: Globe, color: 'bg-green-50 text-green-700', title: 'Website Builder', desc: 'Build websites with AI in seconds' },
              { icon: Brain, color: 'bg-amber-50 text-amber-700', title: 'Memory & RAG', desc: 'AI that remembers your business context' },
              { icon: Zap, color: 'bg-rose-50 text-rose-700', title: 'Desktop Agent', desc: 'AI that controls your computer via voice' },
            ].map((item) => (
              <div key={item.title} className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
                  <item.icon size={16} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#0F0F0F]">{item.title}</p>
                  <p className="text-xs text-[#9E9E9E]">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6">
          <p className="text-xs font-semibold text-amber-700 mb-1">📧 Verify your email</p>
          <p className="text-xs text-amber-600">Check your inbox and click the verification link to unlock all features.</p>
        </div>

        <button
          onClick={() => router.push('/chat')}
          className="w-full py-4 bg-violet-700 hover:bg-violet-800 text-white font-semibold rounded-2xl transition-all shadow-glow text-sm"
        >
          Start using Dacexy →
        </button>
      </div>
    </div>
  )
}
