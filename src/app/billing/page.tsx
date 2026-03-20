'use client'
import { useState, useEffect } from 'react'
import { Check, Zap, Loader2 } from 'lucide-react'
import { billing } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import { planLabel, planColor, cn } from '@/lib/utils'

const PLANS = [
  { id: 'free', name: 'Free', price: 0, desc: 'For individuals exploring AI', features: ['50 AI messages/month', '5 agent runs/month', '1 GB storage', 'Community support'] },
  { id: 'starter', name: 'Starter', price: 999, desc: 'For small teams getting started', features: ['500 AI messages/month', '50 agent runs/month', '10 GB storage', 'Email support', 'API access'] },
  { id: 'growth', name: 'Growth', price: 2999, desc: 'For teams that move fast', popular: true, features: ['5,000 AI messages/month', '500 agent runs/month', '100 GB storage', 'Priority support', 'Desktop Agent', 'Website Builder'] },
  { id: 'enterprise', name: 'Enterprise', price: 9999, desc: 'For mission-critical workloads', features: ['Unlimited messages', 'Unlimited agent runs', '1 TB storage', 'Dedicated support', 'SSO + SAML', 'Custom models', 'SLA guarantee'] },
]

export default function BillingPage() {
  const { org } = useAuthStore()
  const [usage, setUsage] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState<string | null>(null)

  useEffect(() => {
    billing.getUsage().then(setUsage).catch(() => {}).finally(() => setLoading(false))
  }, [])

  async function handleUpgrade(plan_id: string) {
    setUpgrading(plan_id)
    try {
      const order = await billing.createOrder(plan_id)
      if (order.message) alert(order.message)
      else if (order.order_id) alert('Order created: ' + order.order_id + '. Payment integration coming soon.')
    } catch (err: any) {
      alert(err.message)
    } finally { setUpgrading(null) }
  }

  const plan = (org as any)?.plan ?? (org as any)?.plan_tier ?? 'free'

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-semibold text-[#0F0F0F] mb-1">Billing & Plans</h1>
        <p className="text-sm text-[#9E9E9E]">Manage your subscription and usage</p>
      </div>

      {usage && (
        <div className="bg-white border border-black/6 rounded-2xl p-6 shadow-soft mb-8">
          <h2 className="font-semibold text-[#0F0F0F] mb-4">Current Usage</h2>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <p className="text-xs text-[#9E9E9E] uppercase tracking-wide mb-1">Plan</p>
              <span className={cn('text-sm font-bold px-2 py-1 rounded-full', planColor(plan))}>{planLabel(plan)}</span>
            </div>
            <div>
              <p className="text-xs text-[#9E9E9E] uppercase tracking-wide mb-1">AI Calls</p>
              <p className="text-xl font-serif font-bold text-[#0F0F0F]">{usage.monthly_ai_calls || 0}</p>
            </div>
            <div>
              <p className="text-xs text-[#9E9E9E] uppercase tracking-wide mb-1">Credits</p>
              <p className="text-xl font-serif font-bold text-[#0F0F0F]">{usage.credits_balance || 0}</p>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-violet-600" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PLANS.map((p) => (
            <div key={p.id} className={cn('relative rounded-2xl p-6 border transition-all', p.popular ? 'bg-violet-700 border-violet-700 shadow-glow scale-105' : 'bg-white border-black/8 shadow-soft hover:shadow-card hover:-translate-y-0.5')}>
              {p.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-[#0F0F0F] text-xs font-bold px-3 py-1 rounded-full">Most Popular</div>
              )}
              <h3 className={cn('font-serif font-semibold text-lg mb-1', p.popular ? 'text-white' : 'text-[#0F0F0F]')}>{p.name}</h3>
              <p className={cn('text-xs mb-4', p.popular ? 'text-violet-200' : 'text-[#9E9E9E]')}>{p.desc}</p>
              <div className="flex items-baseline gap-1 mb-6">
                <span className={cn('font-serif text-3xl font-bold', p.popular ? 'text-white' : 'text-[#0F0F0F]')}>
                  {p.price === 0 ? 'Free' : `₹${p.price}`}
                </span>
                {p.price > 0 && <span className={cn('text-sm', p.popular ? 'text-violet-200' : 'text-[#9E9E9E]')}>/mo</span>}
              </div>
              <ul className="space-y-2 mb-6">
                {p.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check size={13} className={cn('mt-0.5 shrink-0', p.popular ? 'text-violet-200' : 'text-violet-600')} />
                    <span className={p.popular ? 'text-violet-100' : 'text-[#5C5C5C]'}>{f}</span>
                  </li>
                ))}
              </ul>
              {p.id !== 'free' && p.id !== plan && (
                <button onClick={() => handleUpgrade(p.id)} disabled={upgrading === p.id}
                  className={cn('w-full py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2', p.popular ? 'bg-white text-violet-700 hover:bg-gray-50' : 'bg-violet-700 text-white hover:bg-violet-800')}>
                  {upgrading === p.id ? <Loader2 size={14} className="animate-spin" /> : null}
                  Upgrade to {p.name}
                </button>
              )}
              {p.id === plan && (
                <div className={cn('w-full py-2.5 rounded-xl text-sm font-semibold text-center', p.popular ? 'bg-violet-600 text-white' : 'bg-gray-100 text-[#9E9E9E]')}>
                  Current Plan
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
                                }
