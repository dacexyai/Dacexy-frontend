const API_URL = "https://dacexy-backend-v7ku.onrender.com/api/v1"

export function getAccessToken() {
  return typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
}

export function setTokens(a: string, r: string) {
  localStorage.setItem('access_token', a)
  localStorage.setItem('refresh_token', r)
}

export function clearTokens() {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('dacexy_auth')
}

async function request(path: string, opts: { method?: string; body?: any; headers?: any; signal?: AbortSignal } = {}) {
  const token = getAccessToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(opts.headers as Record<string, string>),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 60000)

  try {
    const res = await fetch(`${API_URL}${path}`, {
      ...opts,
      headers,
      body: opts.body ? (typeof opts.body === 'string' ? opts.body : JSON.stringify(opts.body)) : opts.body,
      signal: controller.signal,
    })
    clearTimeout(timeout)
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
    return fetch(`${API_URL}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ messages, session_id, stream: true }),
    })
  },
}

export const billing = {
  getPlans: () => request('/billing/plans').then((r: any) => r.plans || []),
  getUsage: () => request('/billing/usage'),
  createOrder: (plan_tier: string) => request('/billing/order', { method: 'POST', body: { plan_tier } }),
}

export const agent = {
  run: (task: string, context?: string) => request('/agent/run', { method: 'POST', body: { task, context } }),
  listTasks: () => request('/agent/tasks').then((r: any) => r.tasks || []),
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
