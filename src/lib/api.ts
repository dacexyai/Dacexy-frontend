const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://dacexy-backend-v7ku.onrender.com/api/v1";

export const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
};

export const setToken = (token: string): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem("access_token", token);
};

export const removeToken = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("access_token");
};

async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }
  return response.json();
}

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface RegisterResponse {
  id: string;
  email: string;
  full_name: string;
  access_token: string;
  refresh_token: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_verified: boolean;
  plan?: string;
  credits?: number;
}

export interface Message {
  role: "user" | "assistant";
  content: string;
}

export interface ChatRequest {
  message: string;
  conversation_id?: string;
  use_web_search?: boolean;
  use_memory?: boolean;
}

export interface ChatResponse {
  response: string;
  conversation_id: string;
  sources?: string[];
}

export interface WebsiteGenRequest {
  prompt: string;
  style?: string;
}

export interface AgentTask {
  task: string;
  context?: string;
}

// ─── Raw functions ────────────────────────────────────────────────────────────

export async function login(email: string, password: string): Promise<LoginResponse> {
  const formData = new URLSearchParams();
  formData.append("username", email);
  formData.append("password", password);
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: formData.toString(),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Login failed" }));
    throw new Error(error.detail || "Login failed");
  }
  const data: LoginResponse = await response.json();
  setToken(data.access_token);
  return data;
}

export async function register(email: string, password: string, full_name: string): Promise<RegisterResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, full_name }),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Registration failed" }));
    throw new Error(error.detail || "Registration failed");
  }
  const data: RegisterResponse = await res.json();
  if (data.access_token) setToken(data.access_token);
  return data;
}

export async function logout(): Promise<void> { removeToken(); }
export async function getMe(): Promise<User> { return apiFetch<User>("/auth/me"); }
export async function sendMessage(payload: ChatRequest): Promise<ChatResponse> {
  return apiFetch<ChatResponse>("/chat/message", { method: "POST", body: JSON.stringify(payload) });
}

export async function streamMessage(payload: ChatRequest, onChunk: (chunk: string) => void): Promise<void> {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/chat/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error("Stream failed");
  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  if (!reader) return;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const text = decoder.decode(value, { stream: true });
    const lines = text.split("\n").filter((l) => l.startsWith("data: "));
    for (const line of lines) {
      const data = line.replace("data: ", "").trim();
      if (data && data !== "[DONE]") {
        try { const parsed = JSON.parse(data); if (parsed.content) onChunk(parsed.content); }
        catch { onChunk(data); }
      }
    }
  }
}

export async function getConversations(): Promise<any[]> { return apiFetch<any[]>("/chat/conversations"); }
export async function getConversation(id: string): Promise<any> { return apiFetch<any>(`/chat/conversations/${id}`); }

export async function uploadFile(file: File): Promise<any> {
  const token = getToken();
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch(`${API_BASE_URL}/files/upload`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  if (!response.ok) throw new Error("File upload failed");
  return response.json();
}

export async function getMemories(): Promise<any[]> { return apiFetch<any[]>("/memory/list"); }
export async function addMemory(content: string, category?: string): Promise<any> {
  return apiFetch<any>("/memory/add", { method: "POST", body: JSON.stringify({ content, category }) });
}
export async function deleteMemory(id: string): Promise<void> { return apiFetch<void>(`/memory/${id}`, { method: "DELETE" }); }
export async function generateWebsite(payload: WebsiteGenRequest): Promise<any> {
  return apiFetch<any>("/website/generate", { method: "POST", body: JSON.stringify(payload) });
}
export async function runAgent(payload: AgentTask): Promise<any> {
  return apiFetch<any>("/agent/run", { method: "POST", body: JSON.stringify(payload) });
}
export async function getAgentStatus(taskId: string): Promise<any> { return apiFetch<any>(`/agent/status/${taskId}`); }
export async function getPlans(): Promise<any[]> { return apiFetch<any[]>("/billing/plans"); }
export async function createOrder(planId: string): Promise<any> {
  return apiFetch<any>("/billing/create-order", { method: "POST", body: JSON.stringify({ plan_id: planId }) });
}
export async function verifyPayment(payload: any): Promise<any> {
  return apiFetch<any>("/billing/verify-payment", { method: "POST", body: JSON.stringify(payload) });
}
export async function getTeamMembers(): Promise<any[]> { return apiFetch<any[]>("/team/members"); }
export async function inviteTeamMember(email: string, role: string): Promise<any> {
  return apiFetch<any>("/team/invite", { method: "POST", body: JSON.stringify({ email, role }) });
}
export async function getSettings(): Promise<any> { return apiFetch<any>("/settings"); }
export async function updateSettings(settings: any): Promise<any> {
  return apiFetch<any>("/settings", { method: "PUT", body: JSON.stringify(settings) });
}

// ─── Grouped exports (used by pages) ─────────────────────────────────────────

export const auth = {
  login,
  register: async (payload: { full_name: string; email: string; password: string }): Promise<RegisterResponse> =>
    register(payload.email, payload.password, payload.full_name),
  logout,
  me: getMe,
  verifyEmail: async (token: string) => {
    const res = await fetch(`${API_BASE_URL}/auth/verify-email?token=${token}`);
    if (!res.ok) throw new Error("Verification failed");
    return res.json();
  },
};

export const agent = {
  list: async () => apiFetch<any[]>("/agent/runs"),
  run: runAgent,
  status: getAgentStatus,
  create: async (goal: string, context?: string) =>
    apiFetch<any>("/agent/run", { method: "POST", body: JSON.stringify({ task: goal, context }) }),
};

export const billing = {
  getPlans,
  createOrder,
  verifyPayment,
  getSubscription: async () => apiFetch<any>("/billing/subscription"),
  getUsage: async () => apiFetch<any>("/billing/usage"),
};

export const orgs = {
  me: async () => apiFetch<any>("/orgs/me"),
  update: async (data: any) => apiFetch<any>("/orgs/me", { method: "PUT", body: JSON.stringify(data) }),
  members: getTeamMembers,
  invite: inviteTeamMember,
  listApiKeys: async () => apiFetch<any[]>("/orgs/api-keys"),
  createApiKey: async (name: string) => apiFetch<any>("/orgs/api-keys", { method: "POST", body: JSON.stringify({ name }) }),
  deleteApiKey: async (id: string) => apiFetch<any>(`/orgs/api-keys/${id}`, { method: "DELETE" }),
  getUsage: async () => apiFetch<any>("/orgs/usage"),
  getStats: async () => apiFetch<any>("/orgs/stats"),
};
export default {
  login, register, logout, getMe, getToken, setToken, removeToken,
  sendMessage, streamMessage, getConversations, getConversation,
  uploadFile, getMemories, addMemory, deleteMemory,
  generateWebsite, runAgent, getAgentStatus,
  getPlans, createOrder, verifyPayment,
  getTeamMembers, inviteTeamMember, getSettings, updateSettings,
  auth, agent, billing, orgs,
};
