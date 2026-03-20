const API_URL = "https://dacexy-backend-v7ku.onrender.com/api/v1";

async function request(path: string, options: RequestInit = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  try {
    const res = await fetch(`${API_URL}${path}`, { ...options, headers, signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Request failed" }));
      throw new Error(err.detail || "Request failed");
    }
    return res.json();
  } catch (err: any) {
    clearTimeout(timeout);
    if (err.name === "AbortError") {
      throw new Error("Server timeout. Please try again.");
    }
    throw err;
  }
}

export const auth = {
  register: (data: { email: string; password: string; full_name: string; org_name?: string }) =>
    request("/auth/register", { method: "POST", body: JSON.stringify({ ...data, org_name: data.org_name || data.full_name + "'s Workspace" }) }),
  login: (data: { email: string; password: string }) =>
    request("/auth/login", { method: "POST", body: JSON.stringify(data) }),
  me: () => request("/auth/me"),
  logout: () => request("/auth/logout", { method: "POST" }),
  verifyEmail: (token: string) => request(`/auth/verify-email?token=${token}`, { method: "POST" }),
};

export const orgs = {
  getMe: () => request("/orgs/me"),
  getMembers: () => request("/orgs/members").then((r: any) => r.members || []),
  listApiKeys: () => request("/orgs/api-keys").then((r: any) => r.api_keys || []),
  createApiKey: (name: string) => request("/orgs/api-keys", { method: "POST", body: JSON.stringify({ name }) }),
};

export const chat = {
  send: async (messages: { role: string; content: string }[], session_id?: string) => {
    const token = localStorage.getItem("access_token");
    const res = await fetch(`${API_URL}/ai/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ messages, session_id, stream: true }),
    });
    return res;
  },
  listSessions: () => request("/ai/sessions").then((r: any) => r.sessions || []),
  getSession: (id: string) => request(`/ai/sessions/${id}/messages`),
};

export const billing = {
  getPlans: () => request("/billing/plans").then((r: any) => r.plans || []),
  getUsage: () => request("/billing/usage"),
  createOrder: (plan_tier: string) => request("/billing/order", { method: "POST", body: JSON.stringify({ plan_tier }) }),
};

export const agent = {
  run: (task: string, context?: string) => request("/agent/run", { method: "POST", body: JSON.stringify({ task, context }) }),
  listTasks: () => request("/agent/tasks").then((r: any) => r.tasks || []),
};

export const media = {
  generateImage: (prompt: string) => request("/media/image", { method: "POST", body: JSON.stringify({ prompt }) }),
  generateVideo: (prompt: string) => request("/media/video", { method: "POST", body: JSON.stringify({ prompt }) }),
};

export const websites = {
  generate: (prompt: string) => request("/websites/generate", { method: "POST", body: JSON.stringify({ prompt }) }),
  list: () => request("/websites/").then((r: any) => r.websites || []),
};

export const memory = {
  list: () => request("/memory/").then((r: any) => r.memories || []),
  add: (content: string) => request("/memory/", { method: "POST", body: JSON.stringify({ content }) }),
};
