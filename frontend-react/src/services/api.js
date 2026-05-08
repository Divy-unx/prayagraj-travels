import axios from 'axios'
import logger from '../utils/logger'

// ── API Configuration ────────────────────────────────────────────────────────
// VITE_API_BASE_URL must be set in .env (dev) or as a build arg (Docker/CI).
// Missing it causes a hard error at startup rather than silently hitting a wrong server.
// Dev:  VITE_API_BASE_URL=http://localhost:8081
// Prod: VITE_API_BASE_URL=https://your-backend.onrender.com

if (!import.meta.env.VITE_API_BASE_URL) {
  throw new Error('[api.js] VITE_API_BASE_URL is not set. Add it to .env or your deployment environment.')
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
const API_ENDPOINT = `${API_BASE_URL}/api/travels`
const AUTH_ENDPOINT = `${API_BASE_URL}/api/auth`

const tokenKey = 'pt_token'

// ── Timeout configuration (ms) ──────────────────────────────────────────────
const TIMEOUTS = {
  default: 20000,
  search: 30000,   // Search may hit cold start
  auth: 15000,
}

// ── Retry configuration ─────────────────────────────────────────────────────
const RETRY_CONFIG = {
  maxRetries: 2,
  baseDelay: 500,      // ms
  maxDelay: 5000,      // ms
  retryableStatuses: [500, 502, 503, 504, 408, 429],
}

function getToken() {
  try {
    return localStorage.getItem(tokenKey)
  } catch {
    return null
  }
}

function setToken(token) {
  try {
    if (token) localStorage.setItem(tokenKey, token)
    else localStorage.removeItem(tokenKey)
  } catch {
    // ignore storage errors in non-browser contexts
  }
}

// ── Axios instances ─────────────────────────────────────────────────────────

const api = axios.create({
  baseURL: API_ENDPOINT,
  timeout: TIMEOUTS.default,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

const auth = axios.create({
  baseURL: AUTH_ENDPOINT,
  timeout: TIMEOUTS.auth,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// ── Request interceptors (attach auth token + log) ──────────────────────────

function attachToken(config) {
  const token = getToken()
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  logger.debug('API', `${config.method?.toUpperCase()} ${config.url}`, {
    params: config.params,
  })
  return config
}

api.interceptors.request.use(attachToken)
auth.interceptors.request.use(attachToken)

// ── Response interceptors (error normalization + logging) ───────────────────

function handleResponseError(err) {
  const method = err.config?.method?.toUpperCase()
  const url = err.config?.url

  if (err.response) {
    // Server responded with error status
    const { status, data, statusText } = err.response
    logger.error('API', `${method} ${url} → ${status}`, {
      status,
      data: typeof data === 'object' ? JSON.stringify(data).slice(0, 200) : data,
    })
    const msg = data?.error || data?.message || `HTTP ${status}: ${statusText}`
    const error = new Error(msg)
    error.status = status
    error.serverData = data
    return Promise.reject(error)
  }

  if (err.request) {
    // No response received
    if (err.code === 'ECONNABORTED') {
      logger.error('API', `${method} ${url} → TIMEOUT`, { timeout: err.config?.timeout })
      return Promise.reject(new Error('Request timed out. The server may be starting up.'))
    }
    logger.error('API', `${method} ${url} → NO RESPONSE`, { code: err.code })
    return Promise.reject(new Error('No response from server. Check server status and CORS settings.'))
  }

  logger.error('API', 'Request setup failed', { message: err.message })
  return Promise.reject(err)
}

api.interceptors.response.use(res => res, handleResponseError)
auth.interceptors.response.use(
  res => res,
  err => {
    const msg = err.response?.data?.error || err.message || 'Something went wrong'
    logger.error('Auth', 'Auth request failed', { message: msg })
    return Promise.reject(new Error(msg))
  }
)

// ── Retry with exponential backoff + jitter ─────────────────────────────────

function shouldRetry(error, attempt) {
  if (attempt >= RETRY_CONFIG.maxRetries) return false

  // Always retry on network errors (no response)
  if (!error.response && !error.status) return true

  // Retry on specific status codes
  const status = error.status || error.response?.status
  return status && RETRY_CONFIG.retryableStatuses.includes(status)
}

function getRetryDelay(attempt) {
  const exponential = RETRY_CONFIG.baseDelay * Math.pow(2, attempt)
  const jitter = Math.random() * RETRY_CONFIG.baseDelay
  return Math.min(exponential + jitter, RETRY_CONFIG.maxDelay)
}

async function requestWithRetry(fn, { retries = RETRY_CONFIG.maxRetries, signal } = {}) {
  let lastError
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      if (signal?.aborted) {
        throw new DOMException('Request aborted', 'AbortError')
      }
      return await fn(signal)
    } catch (error) {
      lastError = error

      // Don't retry aborted requests
      if (error.name === 'AbortError' || error.name === 'CanceledError' || signal?.aborted) {
        throw error
      }

      if (attempt < retries && shouldRetry(error, attempt)) {
        const delay = getRetryDelay(attempt)
        logger.warn('API', `Retry ${attempt + 1}/${retries} in ${Math.round(delay)}ms`, {
          error: error.message,
        })
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }
  throw lastError
}

// ── Public service APIs ─────────────────────────────────────────────────────

export const authService = {
  register: async payload => {
    const { data } = await auth.post('/register', payload)
    if (data?.accessToken) setToken(data.accessToken)
    return data
  },
  login: async payload => {
    const { data } = await auth.post('/login', payload)
    if (data?.accessToken) setToken(data.accessToken)
    return data
  },
  googleSignIn: async credential => {
    const { data } = await auth.post('/google', { credential })
    if (data?.accessToken) setToken(data.accessToken)
    return data
  },
  me: async () => {
    const { data } = await auth.get('/me')
    return data
  },
  updateProfile: async payload => {
    const { data } = await auth.put('/profile', payload)
    return data
  },
  verifyEmail: async otp => {
    const { data } = await auth.post('/verify-email', { otp })
    return data
  },
  resendVerification: async () => {
    const { data } = await auth.post('/resend-verification')
    return data
  },
  forgotPassword: async email => {
    const { data } = await auth.post('/forgot-password', { email })
    return data
  },
  resetPassword: async payload => {
    const { data } = await auth.post('/reset-password', payload)
    return data
  },
  logout: async () => {
    try { await auth.post('/logout') } catch { /* ignore */ }
    setToken(null)
  },
  getToken,
}

export const busService = {
  getAll: () => api.get('/buses').then(r => r.data),
  getById: id => api.get(`/buses/${id}`).then(r => r.data),

  suggestLocations: (query, signal) =>
    requestWithRetry(
      (sig) => api.get('/locations/suggest', { params: { query }, signal: sig }).then(r => r.data),
      { retries: 1, signal }
    ),

  search: (source, destination, params = {}, signal) =>
    requestWithRetry(
      (sig) => api.get('/search', {
        params: { source, destination, ...params },
        timeout: TIMEOUTS.search,
        signal: sig,
      }).then(r => r.data),
      { retries: RETRY_CONFIG.maxRetries, signal }
    ),

  getSeats: (busId, travelDate) => api.get('/seats', { params: { busId, travelDate } }).then(r => r.data),
  holdSeat: data => api.post('/seats/hold', data).then(r => r.data),
  releaseSeat: data => api.post('/seats/release', data).then(r => r.data),
  getLiveLocation: busId => api.get('/live-location', { params: { busId } }).then(r => r.data),
  getAllLiveLocations: () => api.get('/live-location/all').then(r => r.data),
  getFavorites: userId => api.get('/favorites', { params: { userId } }).then(r => r.data),
  saveFavorite: (userId, payload) => api.post('/favorites', payload, { params: { userId } }).then(r => r.data),
  deleteFavorite: (userId, source, destination) => api.delete('/favorites', { params: { userId, source, destination } }).then(r => r.data),
}

export const adminService = {
  getRoutes: () => api.get('/admin/routes').then(r => r.data),
  createRoute: payload => api.post('/admin/routes', payload).then(r => r.data),
  updateRoute: (id, payload) => api.put(`/admin/routes/${id}`, payload).then(r => r.data),
  deleteRoute: id => api.delete(`/admin/routes/${id}`).then(r => r.data),
}

// ── Booking normalizer ──────────────────────────────────────────────────────
// Backend now consistently returns `id` (aliased from booking_id in SQL).
// This normalizer is a safety net — it ensures `id` is always present.
function normalizeBooking(raw) {
  if (!raw || typeof raw !== 'object') return raw
  // Backend returns `id` from the SQL alias; this is a defensive fallback only
  if (raw.id == null && raw.booking_id != null) {
    raw.id = raw.booking_id
  }
  return raw
}

function normalizeBookingList(data) {
  if (!Array.isArray(data)) return []
  return data.map(normalizeBooking)
}

export const bookingService = {
  book: data => api.post('/book', data).then(r => {
    const res = r.data
    // Normalize the nested booking object — backend returns booking.id
    if (res.booking) res.booking = normalizeBooking(res.booking)
    return res
  }),
  getByUser: userId => api.get('/bookings', { params: { userId } })
    .then(r => normalizeBookingList(r.data)),
  cancel: (bookingId, userId) =>
    requestWithRetry(
      () => api.delete(`/bookings/${bookingId}`, { params: { userId } }).then(r => r.data),
      { retries: 1 }
    ),
  getCancellationHistory: userId =>
    api.get('/bookings/cancellations', { params: { userId } }).then(r => r.data),
}

export const setAuthToken = setToken

export default api
