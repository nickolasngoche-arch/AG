// Thin fetch wrapper for the Django REST API.
const BASE = (import.meta.env.VITE_API_URL ?? '/api').replace(/\/$/, '')
const TOKEN_KEY = 'agrigenius_token'

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
}

// Turns DRF error bodies ({detail}, {field: [msgs]}, [msgs]) into one readable string.
function messageFrom(data) {
  if (!data) return null
  if (typeof data === 'string') return data
  if (Array.isArray(data)) return data.join(' ')
  if (typeof data.detail === 'string') return data.detail
  return Object.entries(data)
    .map(([field, msgs]) => {
      const text = Array.isArray(msgs) ? msgs.join(' ') : String(msgs)
      return field === 'non_field_errors' ? text : `${field.replace(/_/g, ' ')}: ${text}`
    })
    .join(' ')
}

export class ApiError extends Error {
  constructor(status, data) {
    super(messageFrom(data) ?? `Request failed (${status}).`)
    this.status = status
    this.data = data
  }
}

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { Accept: 'application/json' }
  const token = auth ? tokenStore.get() : null
  if (token) headers.Authorization = `Token ${token}`
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  let response
  try {
    response = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError(0, { detail: 'Cannot reach the server. Make sure the Django backend is running.' })
  }
  if (response.status === 204) return null
  const data = await response.json().catch(() => null)
  if (!response.ok) throw new ApiError(response.status, data)
  return data
}

export const api = {
  get: (path, options) => request(path, options),
  post: (path, body, options) => request(path, { ...options, method: 'POST', body }),
  patch: (path, body, options) => request(path, { ...options, method: 'PATCH', body }),
  delete: (path, options) => request(path, { ...options, method: 'DELETE' }),
}

/** Per-field messages from a DRF validation error, e.g. { phone: "Enter a valid…" }. */
export function fieldErrors(error) {
  const data = error?.data
  if (!data || typeof data !== 'object' || Array.isArray(data)) return {}
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => [key, Array.isArray(value) ? value.join(' ') : String(value)]),
  )
}
