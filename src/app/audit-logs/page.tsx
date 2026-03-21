'use client'
import { useState, useEffect } from 'react'
import { Shield, Clock } from 'lucide-react'
import { formatRelative } from '@/lib/utils'

const API_URL = "https://dacexy-backend-v7ku.onrender.com/api/v1"

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null

  useEffect(() => {
    if (!token) return
    fetch(`${API_URL}/audit/logs`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setLogs(d.events || d.logs || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-semibold text-[#0F0F0F] mb-1">Audit Logs</h1>
        <p className="text-sm text-[#9E9E9E]">Track all activity in your workspace</p>
      </div>

      <div className="bg-white border border-black/6 rounded-2xl shadow-soft overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-4 border-b border-black/6">
          <Shield size={16} className="text-violet-600" />
          <h2 className="font-semibold text-[#0F0F0F]">Activity Log</h2>
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm text-[#9E9E9E]">Loading...</div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center">
            <Shield size={32} className="mx-auto text-gray-300 mb-3" />
            <p className="text-sm text-[#9E9E9E]">No audit events yet</p>
            <p className="text-xs text-[#B0B0B0] mt-1">Actions you and your team take will appear here</p>
          </div>
        ) : (
          <div className="divide-y divide-black/4">
            {logs.map((log: any, i: number) => (
              <div key={log.id || i} className="flex items-start gap-4 px-6 py-4">
                <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center shrink-0 mt-0.5">
                  <Shield size={13} className="text-violet-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#0F0F0F]">{log.action || 'Action'}</p>
                  {log.resource_type && (
                    <p className="text-xs text-[#9E9E9E] mt-0.5">{log.resource_type} {log.resource_id ? `· ${log.resource_id}` : ''}</p>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[#B0B0B0] shrink-0">
                  <Clock size={11} />
                  {log.created_at ? formatRelative(log.created_at) : ''}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
      }
