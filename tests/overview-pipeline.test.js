import { describe, it, expect } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

describe('overview page data flow through real axios instance', () => {
  it('authenticates then loads /dashboard/stats', async () => {
    setActivePinia(createPinia())
    const api = (await import('@/api/axios')).default
    const authApi = (await import('@/api/auth')).authApi

    // Simulate what the router guard does on a fresh load:
    const refreshed = await authApi.refresh()
    console.log('refresh ok:', !!refreshed.access_token)

    // Then what OverviewView does on mount:
    const res = await api.get('/dashboard/stats')
    console.log('stats keys:', Object.keys(res.data))
    expect(res.status).toBe(200)
    expect(res.data.active_brands).toBeGreaterThan(0)
  }, 20000)
})
