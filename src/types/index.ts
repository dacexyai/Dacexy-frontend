export interface User {
  id: string
  email: string
  full_name: string
  role: string
  is_active?: boolean
  is_verified?: boolean
  created_at?: string
}

export interface Organization {
  id: string
  name: string
  slug: string
  plan?: string
  plan_tier?: string
  billing_status?: string
  is_active?: boolean
  credit_balance?: number
  credits_balance?: number
  created_at?: string
}

export type PlanTier = 'free' | 'starter' | 'growth' | 'enterprise'

export interface ChatSession {
  id: string
  title?: string
  created_at: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  created_at?: string
}

export interface AgentRun {
  id: string
  status: string
  goal?: string
  task?: string
  result?: string
  error?: string
  created_at: string
  total_steps?: number
  current_step?: number
  steps?: AgentStep[]
}

export interface AgentStep {
  step: number
  tool: string
  input: Record<string, unknown>
  output?: string
  status: string
  duration_ms?: number
}

export interface Plan {
  id: string
  name: string
  price_inr: number
  ai_calls: number
  features: string[]
  }
