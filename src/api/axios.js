import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000',
  withCredentials: true,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// Request interceptor, attach access token
api.interceptors.request.use(
  (config) => {
    const auth = useAuthStore()
    if (auth.token) {
      config.headers.Authorization = `Bearer ${auth.token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ── Response interceptor — handle 401, auto refresh ─────
let isRefreshing = false
let failedQueue  = []

function processQueue(error, token = null) {
  failedQueue.forEach((prom) => {
    error ? prom.reject(error) : prom.resolve(token)
  })
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Not a 401 or already retried — just reject
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(normaliseError(error))
    }

    // Don't retry the refresh endpoint itself
    if (originalRequest.url?.includes('/auth/refresh')) {
      return Promise.reject(normaliseError(error))
    }

    if (isRefreshing) {
      // Queue other requests while refresh is in progress
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`
        return api(originalRequest)
      })
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      const auth = useAuthStore()
      const newToken = await auth.refreshAccessToken()

      if (!newToken) {
        processQueue(new Error('Session expired'), null)
        return Promise.reject(normaliseError(error))
      }

      processQueue(null, newToken)
      originalRequest.headers.Authorization = `Bearer ${newToken}`
      return api(originalRequest)
    } catch (refreshError) {
      processQueue(refreshError, null)
      return Promise.reject(normaliseError(refreshError))
    } finally {
      isRefreshing = false
    }
  }
)

// ── Normalise errors — never expose raw API errors to UI ─
function normaliseError(error) {
  const status  = error.response?.status
  const detail  = error.response?.data?.detail

  const messages = {
    400: detail ?? 'Invalid request. Please check your input.',
    401: 'Your session has expired. Please log in again.',
    403: 'You do not have permission to do that.',
    404: 'The requested resource was not found.',
    422: parseValidationError(error.response?.data),
    429: 'Too many attempts. Please wait a moment and try again.',
    500: 'Something went wrong on our end. Please try again.',
  }

  const message = messages[status] ?? detail ?? 'An unexpected error occurred.'
  const err = new Error(message)
  err.status  = status
  err.raw     = error.response?.data
  return err
}

function parseValidationError(data) {
  if (!data?.detail || !Array.isArray(data.detail)) {
    return 'Validation failed. Please check your input.'
  }
  return data.detail.map((e) => e.msg).join(', ')
}

export default api