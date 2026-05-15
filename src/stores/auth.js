import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '../api/auth'
import router from '../router'

export const useAuthStore = defineStore('auth', () => {
  // ── State ───────────────────────────────────────────────
  const token = ref(null)
  const user  = ref(null)
  const isRefreshing = ref(false)

  // ── Getters ─────────────────────────────────────────────
  const isAuthenticated = computed(() => !!token.value)
  const fullName      = computed(() => user.value?.full_name ?? '')
  const userId        = computed(() => user.value?.id ?? null)

  // ── Actions ─────────────────────────────────────────────
  function setSession(accessToken, userData) {
    token.value = accessToken
    user.value  = userData
  }

  function clearSession() {
    token.value = null
    user.value  = null
  }

  async function login(credentials) {
    const { access_token, user: userData } = await authApi.login(credentials)
    setSession(access_token, userData)
    return userData
  }

  async function register(payload) {
    const { access_token, user: userData } = await authApi.register(payload)
    setSession(access_token, userData)
    return userData
  }

  async function logout() {
    try {
      // Tell the server to invalidate the HttpOnly refresh token cookie
      await authApi.logout()
    } catch {
      // Even if server call fails, clear client session
    } finally {
      clearSession()
      router.push({ name: 'Login' })
    }
  }

  // Called on every app load / tab focus — silently gets a new access token
  // using the HttpOnly refresh cookie (browser sends it automatically)
  async function refreshAccessToken() {
    if (isRefreshing.value) return null
    isRefreshing.value = true
    try {
      const { access_token, user: userData } = await authApi.refresh()
      setSession(access_token, userData)
      return access_token
    } catch {
      // Refresh token expired or invalid — force logout
      clearSession()
      router.push({ name: 'Login' })
      return null
    } finally {
      isRefreshing.value = false
    }
  }

  return {
    token,
    user,
    isRefreshing,
    isAuthenticated,
    fullName,
    userId,
    login,
    register,
    logout,
    refreshAccessToken,
    setSession,
    clearSession,
  }
})