'use client'
import { useState, useEffect } from 'react'
import { Users, Mail, Shield } from 'lucide-react'
import { orgs } from '@/lib/api'
import { getInitials, cn } from '@/lib/utils'

export default function TeamPage() {
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    orgs.getMembers().then(setMembers).catch(() => {}).finally(() => setLoading(false))
  }, [])

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-semibold text-[#0F0F0F] mb-1">Team</h1>
        <p className="text-sm text-[#9E9E9E]">Manage your workspace members</p>
      </div>

      <div className="bg-white border border-black/6 rounded-2xl shadow-soft overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/6">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-violet-600" />
            <h2 className="font-semibold text-[#0F0F0F]">Members ({members.length})</h2>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm text-[#9E9E9E]">Loading...</div>
        ) : members.length === 0 ? (
          <div className="p-12 text-center">
            <Users size={32} className="mx-auto text-gray-300 mb-3" />
            <p className="text-sm text-[#9E9E9E]">No team members yet</p>
          </div>
        ) : (
          <div className="divide-y divide-black/4">
            {members.map((m: any) => (
              <div key={m.id} className="flex items-center gap-4 px-6 py-4">
                <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 text-sm font-bold shrink-0">
                  {getInitials(m.full_name || 'U')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#0F0F0F]">{m.full_name}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Mail size={11} className="text-[#B0B0B0]" />
                    <p className="text-xs text-[#9E9E9E] truncate">{m.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-full capitalize',
                    m.role === 'owner' ? 'bg-violet-50 text-violet-700' :
                    m.role === 'admin' ? 'bg-blue-50 text-blue-700' :
                    'bg-gray-100 text-gray-600'
                  )}>
                    {m.role}
                  </span>
                  {m.is_verified && (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-50 text-green-700">
                      Verified
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 bg-violet-50 border border-violet-200 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-2">
          <Shield size={15} className="text-violet-600" />
          <p className="text-sm font-semibold text-violet-700">Invite team members</p>
        </div>
        <p className="text-xs text-violet-600 mb-3">Share your referral link to invite colleagues to your workspace.</p>
        <a href="/referral" className="text-xs font-bold text-violet-700 hover:text-violet-900 underline">
          Go to Referrals →
        </a>
      </div>
    </div>
  )
}
