'use client'
import { useState } from 'react'
import { Gift, Copy, Check, Users } from 'lucide-react'
import { useAuthStore } from '@/lib/store'

export default function ReferralPage() {
  const { user } = useAuthStore()
  const [copied, setCopied] = useState(false)

  const referralCode = user?.id?.slice(0, 8).toUpperCase() || 'DACEXY'
  const referralLink = `https://dacexy.vercel.app/register?ref=${referralCode}`

  function copyLink() {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-semibold text-[#0F0F0F] mb-1">Referrals</h1>
        <p className="text-sm text-[#9E9E9E]">Invite friends and earn credits</p>
      </div>

      <div className="bg-white border border-black/6 rounded-2xl p-6 shadow-soft mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-violet-50 rounded-2xl flex items-center justify-center">
            <Gift size={22} className="text-violet-600" />
          </div>
          <div>
            <h2 className="font-semibold text-[#0F0F0F]">Invite Friends, Earn Credits</h2>
            <p className="text-sm text-[#9E9E9E]">Get 200 credits for every friend who signs up</p>
          </div>
        </div>

        <div className="bg-[#F9F7F2] rounded-xl p-4 mb-4">
          <p className="text-xs font-semibold text-[#5C5C5C] uppercase tracking-wide mb-2">Your Referral Link</p>
          <div className="flex items-center gap-2">
            <input
              value={referralLink}
              readOnly
              className="flex-1 text-xs font-mono text-[#5C5C5C] bg-white border border-black/8 rounded-lg px-3 py-2.5 outline-none"
            />
            <button onClick={copyLink}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-violet-700 hover:bg-violet-800 text-white text-sm font-semibold rounded-lg transition-all">
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        <div className="bg-[#F9F7F2] rounded-xl p-4">
          <p className="text-xs font-semibold text-[#5C5C5C] uppercase tracking-wide mb-2">Your Referral Code</p>
          <p className="text-2xl font-serif font-bold text-violet-700 tracking-widest">{referralCode}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white border border-black/6 rounded-2xl p-5 shadow-soft text-center">
          <p className="font-serif text-3xl font-bold text-[#0F0F0F]">0</p>
          <p className="text-sm text-[#9E9E9E] mt-1">Total Referrals</p>
        </div>
        <div className="bg-white border border-black/6 rounded-2xl p-5 shadow-soft text-center">
          <p className="font-serif text-3xl font-bold text-[#0F0F0F]">0</p>
          <p className="text-sm text-[#9E9E9E] mt-1">Credits Earned</p>
        </div>
      </div>

      <div className="bg-violet-50 border border-violet-200 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Users size={15} className="text-violet-600" />
          <p className="text-sm font-semibold text-violet-700">How it works</p>
        </div>
        <ol className="space-y-2 text-xs text-violet-800 list-decimal list-inside">
          <li>Share your referral link with friends</li>
          <li>They sign up using your link</li>
          <li>You both get 200 free credits</li>
          <li>Credits can be used for AI calls and agent runs</li>
        </ol>
      </div>
    </div>
  )
}
