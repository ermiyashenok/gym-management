// src/api/api.js
// Central API client — all backend calls go through here.
// Uses the JWT token stored in localStorage by the auth flow.

import { normalizeKeys } from './normalize'

const BASE_URL = 'http://localhost:3000/api'

// ─── Core fetch wrapper ──────────────────────────────────────────────────────
function getToken() {
  try {
    const raw = localStorage.getItem('gymsys-store')
    const parsed = raw ? JSON.parse(raw) : null
    return parsed?.state?.currentUser?.access_token ?? null
  } catch {
    return null
  }
}

async function apiFetch(path, options = {}) {
  const token = getToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })

  if (!res.ok) {
    let errMsg = `API Error ${res.status}`
    try {
      const body = await res.json()
      errMsg = Array.isArray(body.message) ? body.message.join(', ') : (body.message ?? errMsg)
    } catch {}
    throw new Error(errMsg)
  }

  // 204 No Content has no body
  if (res.status === 204) return null
  const data = await res.json()
  return normalizeKeys(data)
}

const api = {
  get:    (path)         => apiFetch(path),
  post:   (path, body)   => apiFetch(path, { method: 'POST',   body: JSON.stringify(body) }),
  put:    (path, body)   => apiFetch(path, { method: 'PUT',    body: JSON.stringify(body) }),
  patch:  (path, body)   => apiFetch(path, { method: 'PATCH',  body: JSON.stringify(body) }),
  delete: (path)         => apiFetch(path, { method: 'DELETE' }),
}

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authApi = {
  login:    (email, password) => api.post('/auth/login', { email, password }),
  register: (data)            => api.post('/auth/register', data),
}

// ─── Gyms ────────────────────────────────────────────────────────────────────
export const gymsApi = {
  list:   ()     => api.get('/gyms'),
  get:    (id)   => api.get(`/gyms/${id}`),
  create: (data) => api.post('/gyms', data),
  delete: (id)   => api.delete(`/gyms/${id}`),
}

// ─── Branches ────────────────────────────────────────────────────────────────
export const branchesApi = {
  list:   (gymId)      => api.get(`/branches${gymId ? `?gymId=${gymId}` : ''}`),
  get:    (id)         => api.get(`/branches/${id}`),
  create: (data)       => api.post('/branches', data),
  update: (id, data)   => api.put(`/branches/${id}`, data),
  delete: (id)         => api.delete(`/branches/${id}`),
}

// ─── Trainers ────────────────────────────────────────────────────────────────
export const trainersApi = {
  list:         (branchId)              => api.get(`/trainers${branchId ? `?branchId=${branchId}` : ''}`),
  get:          (id)                    => api.get(`/trainers/${id}`),
  create:       (data)                  => api.post('/trainers', data),
  updateStatus: (id, status, until, duration) =>
    api.patch(`/trainers/${id}/status`, {
      status,
      ...(until    ? { unavailable_until:    until    } : {}),
      ...(duration ? { unavailable_duration: duration } : {}),
    }),
  delete: (id) => api.delete(`/trainers/${id}`),
}

// ─── Members ─────────────────────────────────────────────────────────────────
export const membersApi = {
  list:   (branchId)   => api.get(`/members${branchId && branchId !== 'all' ? `?branchId=${branchId}` : ''}`),
  get:    (id)         => api.get(`/members/${id}`),
  create: (data)       => api.post('/members', data),
  update: (id, data)   => api.put(`/members/${id}`, data),
  delete: (id)         => api.delete(`/members/${id}`),
}

// ─── Payments ────────────────────────────────────────────────────────────────
export const paymentsApi = {
  list:       (branchId, memberId) => {
    const params = []
    if (branchId && branchId !== 'all') params.push(`branchId=${branchId}`)
    if (memberId)                       params.push(`memberId=${memberId}`)
    return api.get(`/payments${params.length ? '?' + params.join('&') : ''}`)
  },
  renew:      (data) => api.post('/payments', data),
  dailyEntry: (data) => api.post('/payments/daily', data),
}

// ─── Schedules ───────────────────────────────────────────────────────────────
export const schedulesApi = {
  list:   (trainerId, memberId) => {
    const params = []
    if (trainerId) params.push(`trainerId=${trainerId}`)
    if (memberId)  params.push(`memberId=${memberId}`)
    return api.get(`/schedules${params.length ? '?' + params.join('&') : ''}`)
  },
  book:   (data)                            => api.post('/schedules', data),
  cancel: (trainerId, day, time)            =>
    api.delete(`/schedules?trainerId=${encodeURIComponent(trainerId)}&day=${day}&time=${encodeURIComponent(time)}`),
}

// ─── Amenities ───────────────────────────────────────────────────────────────
export const amenitiesApi = {
  list:   (branchId) => api.get(`/amenities${branchId && branchId !== 'all' ? `?branchId=${branchId}` : ''}`),
  create: (data)     => api.post('/amenities', data),
  sell:   (id)       => api.post(`/amenities/${id}/sell`, {}),
}

// ─── Expenses ────────────────────────────────────────────────────────────────
export const expensesApi = {
  list:   (branchId) => api.get(`/expenses${branchId && branchId !== 'all' ? `?branchId=${branchId}` : ''}`),
  create: (data)     => api.post('/expenses', data),
}

// ─── Notifications ───────────────────────────────────────────────────────────
export const notificationsApi = {
  list:       (branchId) => api.get(`/notifications${branchId && branchId !== 'all' ? `?branchId=${branchId}` : ''}`),
  markRead:   (id)       => api.put(`/notifications/${id}/read`),
  markAllRead:(branchId) => api.put(`/notifications/read-all${branchId && branchId !== 'all' ? `?branchId=${branchId}` : ''}`),
}
