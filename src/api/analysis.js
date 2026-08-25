/** Analysis / scoring history API. */

import api from './axios'

export const analysisApi = {
  async list(params = {}) {
    const { data } = await api.get('/analysis', { params })
    return data
  },

  async get(id) {
    const { data } = await api.get(`/analysis/${id}`)
    return data
  },
}
