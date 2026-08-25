import { describe, it, expect } from 'vitest'
import { mockAdapter } from '@/api/mock'

describe('mock adapter — auth', () => {
  it('signs in the seeded demo user', async () => {
    const res = await mockAdapter({
      method: 'post',
      url: '/auth/signin',
      data: { email: 'demo@brandload.so', password: 'brandload123' },
    })
    expect(res.status).toBe(200)
    expect(res.data.access_token).toBeTruthy()
    expect(res.data.user.plan).toBe('agency')
  })

  it('rejects bad credentials with 401', async () => {
    await expect(
      mockAdapter({ method: 'post', url: '/auth/signin', data: { email: 'demo@brandload.so', password: 'wrong' } }),
    ).rejects.toMatchObject({ response: { status: 401 } })
  })

  it('refreshes a session', async () => {
    const res = await mockAdapter({ method: 'post', url: '/auth/refresh' })
    expect(res.status).toBe(200)
    expect(res.data.access_token).toBeTruthy()
  })
})

describe('mock adapter — dashboard stats (overview page)', () => {
  it('returns stats for GET /dashboard/stats', async () => {
    const res = await mockAdapter({ method: 'get', url: '/dashboard/stats' })
    console.log('STATS RESPONSE:', JSON.stringify(res))
    expect(res.status).toBe(200)
    expect(res.data).toHaveProperty('active_brands')
    expect(Array.isArray(res.data.recent_activity)).toBe(true)
  })
})
