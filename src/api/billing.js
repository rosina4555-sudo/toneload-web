/** Billing + settings (API credentials, extension token) APIs. */

import api from './axios'

export const billingApi = {
  async plans() {
    const { data } = await api.get('/billing/plans')
    return data
  },

  async subscription() {
    const { data } = await api.get('/billing/subscription')
    return data
  },

  async checkout(planId) {
    const { data } = await api.post('/billing/checkout', { plan_id: planId })
    return data
  },
}

export const credentialsApi = {
  async list() {
    const { data } = await api.get('/auth/api-credentials')
    return data
  },

  async create(label) {
    // Secret is shown exactly once — BR-W-05 pattern applies to API keys too.
    const { data } = await api.post('/auth/api-credentials', { label })
    return data
  },

  async remove(id) {
    await api.delete(`/auth/api-credentials/${id}`)
  },
}

export const extensionApi = {
  /** BR-A-04: short-lived extension token issued from the dashboard session. */
  async createToken() {
    const { data } = await api.post('/auth/extension-token')
    return data
  },
}
