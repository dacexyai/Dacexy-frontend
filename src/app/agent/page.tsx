use client'
import { useState, useEffect } from 'react'
import { Bot, Plus, CheckCircle2, XCircle, Clock, Loader2, Play } from 'lucide-react'
import { agent } from '@/lib/api'
import { formatRelative, cn } from '@/lib/utils'
import type { AgentRun } from '@/types'

function RunCard({ run }: { run: AgentRun }) {
  const statusStyles: Record<string, string> = {
    completed: 'bg-green-50 text-green-700 border-green-200',
    running:   'bg-blue-50 text-blue-700 border-blue-200',
    failed:    'bg-red-50 text-red-700 border-red-200',
    pending:   'bg-amber-50 text-amber-700 border-amber-200',
  }

  return (
    <div className="bg-white rounded-2xl border border-black/6 shadow-soft p-5">
      <div className="flex items-start gap-4">
        <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0', {
          'bg-green-50': run.status === 'completed',
          'bg-blue-50': run.status === 'running',
          'bg-red-50': run.status === 'failed',
          'bg-amber-50': run.status === 'pending',
        })}>
          {run.status === 'running' ? <Loader2 size={16} className="text-blue-600 animate-spin" /> :
           run.status === 'completed' ? <CheckCircle2 size={16} className="text-green-600" /> :
           run.status === 'failed' ? <XCircle size={16} className="text-red-500" /> :
           <Clock size={16} className="text-amber-500" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#0F0F0F] mb-1">{run.task || run.goal || 'Agent task'}</p>
          <div className="flex items-center gap-3">
            <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full border', statusStyles[run.status] || 'bg-gray-50 text-gray-600 border-gray-200')}>
              {run.status}
            </span>
            <span className="text-xs text-[#9E9E9E]">{run.created_at ? formatRelative(run.created_at) : ''}</span>
          </div>
          {run.result && (
            <div className="mt-3 bg-green-50 border border-green-200 rounded-xl p-3">
              <p className="text-xs font-semibold text-green-700 mb-1">Result</p>
              <p className="text-sm text-green-800 leading-relaxed whitespace-pre-wrap">{run.result}</p>
            </div>
          )}
          {run.error && (
            <div className="mt-3 bg-red-50 border border-red-200 rounded-xl p-3">
              <p className="text-xs font-semibold text-red-700 mb-1">Error</p>
              <p className="text-sm text-red-800">{run.error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function NewRunModal({ onCreated, onClose }: { onCreated: (r: AgentRun) => void; onClose: () => void }) {
  const [goal, setGoal] = useState('')
  const [context, setContext] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!goal.trim()) return
    setLoading(true)
    setError('')
    try {
      const run = await agent.create(goal, context) as AgentRun
      onCreated(run)
      onClose()
    } catch (e: any) {
      setError(e.message || 'Failed to start agent')
    } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-black/8 shadow-card w-full max-w-lg p-6">
        <h2 className="font-serif text-xl font-semibold text-[#0F0F0F] mb-1">New Agent Run</h2>
        <p className="text-sm text-[#9E9E9E] mb-6">Describe what you want the agent to accomplish</p>
        {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">{error}</p>}
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#5C5C5C] uppercase tracking-wide mb-1.5">Goal</label>
            <textarea
              value={goal}
              onChange={e => setGoal(e.target.value)}
              rows={3}
              placeholder="e.g. Research the top 5 AI companies and summarize their latest products"
              className="w-full px-4 py-3 bg-[#F2EFE8] border border-black/8 rounded-xl text-sm placeholder-[#B0B0B0] focus:outline-none focus:border-violet-500 focus:bg-white resize-none transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#5C5C5C] uppercase tracking-wide mb-1.5">Context (optional)</label>
            <textarea
              value={context}
              onChange={e => setContext(e.target.value)}
              rows={2}
              placeholder="Any additional context or constraints"
              className="w-full px-4 py-3 bg-[#F2EFE8] border border-black/8 rounded-xl text-sm placeholder-[#B0B0B0] focus:outline-none focus:border-violet-500 focus:bg-white resize-none transition-all"
            />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 text-sm font-semibold text-[#5C5C5C] bg-gray-100 hover:bg-gray-200 rounded-xl transition-all">
              Cancel
            </button>
            <button type="submit" disabled={!goal.trim() || loading}
              className="flex-1 py-3 text-sm font-semibold text-white bg-violet-700 hover:bg-violet-800 disabled:opacity-60 rounded-xl transition-all flex items-center justify-center gap-2">
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
              {loading ? 'Starting…' : 'Start agent'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AgentPage() {
  const [runs, setRuns] = useState<AgentRun[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    agent.list().then(r => { setRuns(r as AgentRun[]); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-[#0F0F0F] mb-1">Agent Runs</h1>
          <p className="text-sm text-[#9E9E9E]">Autonomous multi-step AI tasks</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-violet-700 hover:bg-violet-800 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all shadow-glow">
          <Plus size={15} />
          New run
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={24} className="animate-spin text-violet-600" />
        </div>
      ) : runs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-black/6 p-16 text-center shadow-soft">
          <div className="w-16 h-16 bg-violet-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Bot size={28} className="text-violet-600" />
          </div>
          <h2 className="font-serif text-xl font-semibold text-[#0F0F0F] mb-2">No agent runs yet</h2>
          <p className="text-sm text-[#9E9E9E] mb-6 max-w-sm mx-auto">
            Start your first agent run to let AI handle complex multi-step tasks autonomously.
          </p>
          <button onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 bg-violet-700 hover:bg-violet-800 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-all">
            <Plus size={15} />
            Start first run
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {runs.map(r => <RunCard key={r.id} run={r} />)}
        </div>
      )}

      {showModal && <NewRunModal onCreated={(r) => setRuns(prev => [r, ...prev])} onClose={() => setShowModal(false)} />}
    </div>
  )
       }
