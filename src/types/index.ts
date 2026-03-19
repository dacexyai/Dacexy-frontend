

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_verified: boolean;
  org?: Org;
}

export interface Org {
  id: string;
  name: string;
  slug: string;
  plan_tier: string;
  credits_balance?: number;
}

export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface Session {
  id: string;
  title: string;
  created_at: string;
}

export interface Plan {
  id: string;
  name: string;
  price_inr: number;
  ai_calls: number;
  features: string[];
}

export interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  created_at: string;
}

export interface AgentTask {
  id: string;
  task_type: string;
  status: string;
  created_at: string;
}
