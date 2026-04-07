const API_URL = "https://dacexy-backend-v7ku.onrender.com/api/v1"

export function getAccessToken() {
  return typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
}

export function setTokens(a: string, r: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('access_token', a)
    localStorage.setItem('refresh_token', r)
    localStorage.setItem('token_time', Date.now().toString())
  }
}

export function clearTokens() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('token_time')
    localStorage.removeItem('dacexy_auth')
  }
}

async function request(path: string, opts: { method?: string; body?: any; headers?: any } = {}) {
  const token = getAccessToken()
  if (!token) {
    if (typeof window !== 'undefined') window.location.replace('/login')
    throw new Error('Not logged in')
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...(opts.headers || {}),
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 60000)

  try {
    const res = await fetch(`${API_URL}${path}`, {
      method: opts.method || 'GET',
      headers,
      body: opts.body ? JSON.stringify(opts.body) : undefined,
      signal: controller.signal,
    })
    clearTimeout(timeout)

    if (res.status === 401) {
      clearTokens()
      if (typeof window !== 'undefined') window.location.replace('/login')
      throw new Error('Session expired. Please login again.')
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Request failed' }))
      throw new Error(typeof err.detail === 'object' ? err.detail.message : err.detail || 'Request failed')
    }

    const text = await res.text()
    return text ? JSON.parse(text) : {}
  } catch (err: any) {
    clearTimeout(timeout)
    if (err.name === 'AbortError') throw new Error('Server timeout. Please try again.')
    throw err
  }
}

export const auth = {
  register: (d: { full_name: string; email: string; password: string; org_name?: string }) =>
    request('/auth/register', {
      method: 'POST',
      body: { ...d, org_name: d.org_name || `${d.full_name.split(' ')[0]}'s Workspace` },
    }),
  login: (email: string, password: string) =>
    request('/auth/login', { method: 'POST', body: { email, password } }),
  me: () => request('/auth/me'),
  logout: () => request('/auth/logout', { method: 'POST' }).catch(() => {}),
  verifyEmail: (token: string) => request('/auth/verify-email', { method: 'POST', body: { token } }),
}

export const orgs = {
  getMe: () => request('/orgs/me'),
  getMembers: () => request('/orgs/members').then((r: any) => r.members || []),
  listApiKeys: () => request('/orgs/api-keys').then((r: any) => r.api_keys || []),
  createApiKey: (name: string) => request('/orgs/api-keys', { method: 'POST', body: { name } }),
}

export const chat = {
  listSessions: () => request('/ai/sessions').then((r: any) => r.sessions || []),
  getSession: (id: string) => request(`/ai/sessions/${id}/messages`),
  send: async (messages: { role: string; content: string }[], session_id?: string) => {
    const token = getAccessToken()
    if (!token) {
      window.location.replace('/login')
      throw new Error('Not logged in')
    }
    return fetch(`${API_URL}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ messages, session_id, stream: true }),
    })
  },
}

export const agent = {
  list: () => request('/agent/tasks').then((r: any) => r.tasks || []),
  create: (task: string, context?: string) =>
    request('/agent/run', { method: 'POST', body: { task, context } }),
  wsUrl: (id: string) => `wss://dacexy-backend-v7ku.onrender.com/ws/agent/${id}`,
}

export const billing = {
  getPlans: () => request('/billing/plans').then((r: any) => r.plans || []),
  getUsage: () => request('/billing/usage'),
  createOrder: (plan_tier: string) => request('/billing/order', { method: 'POST', body: { plan_tier } }),
}

export const media = {
  generateImage: (prompt: string) => request('/media/image', { method: 'POST', body: { prompt } }),
  generateVideo: (prompt: string) => request('/media/video', { method: 'POST', body: { prompt } }),
}

export const websites = {
  generate: (prompt: string) => request('/websites/generate', { method: 'POST', body: { prompt } }),
  list: () => request('/websites/').then((r: any) => r.websites || []),
}

export const memory = {
  list: () => request('/memory/').then((r: any) => r.memories || []),
  add: (content: string) => request('/memory/', { method: 'POST', body: { content } }),
}

export const desktop = {
  getStatus: () => Promise.resolve({ connected: false }),
  downloadUrl: (os: string) => `https://raw.githubusercontent.com/dacexyai/Dacexy-backend/main/desktop_agent/install_${os}.bat`,
}
