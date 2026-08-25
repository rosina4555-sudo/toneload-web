/**
 * Brand domain API — the only place the dashboard touches brand endpoints.
 * Works identically against the mock adapter or the real API.
 */

import api from './axios'

export const brandsApi = {
  async list(params = {}) {
    const { data } = await api.get('/brands', { params })
    return data
  },

  async get(id) {
    const { data } = await api.get(`/brands/${id}`)
    return data
  },

  async create(payload) {
    const { data } = await api.post('/brands', payload)
    return data
  },

  async update(id, payload) {
    const { data } = await api.patch(`/brands/${id}`, payload)
    return data
  },

  async remove(id) {
    await api.delete(`/brands/${id}`)
  },

  async rebuild(id) {
    const { data } = await api.post(`/brands/${id}/rebuild`)
    return data
  },

  async createShareLink(id) {
    const { data } = await api.post(`/brands/${id}/share`)
    return data
  },

  async revokeShareLink(id) {
    await api.delete(`/brands/${id}/share`)
  },

  // ── Tone contexts ────────────────────────────────────────────────────────
  async createToneContext(brandId, payload) {
    const { data } = await api.post(`/brands/${brandId}/tone-contexts`, payload)
    return data
  },

  async updateToneContext(brandId, toneId, payload) {
    const { data } = await api.patch(`/brands/${brandId}/tone-contexts/${toneId}`, payload)
    return data
  },

  async removeToneContext(brandId, toneId) {
    await api.delete(`/brands/${brandId}/tone-contexts/${toneId}`)
  },

  // ── Vocabulary ───────────────────────────────────────────────────────────
  async addVocabularyEntry(brandId, payload) {
    const { data } = await api.post(`/brands/${brandId}/vocabulary`, payload)
    return data
  },

  async removeVocabularyEntry(brandId, entryId) {
    await api.delete(`/brands/${brandId}/vocabulary/${entryId}`)
  },

  // ── Channel overrides ─────────────────────────────────────────────────────
  async saveChannelOverride(brandId, channel, payload) {
    const { data } = await api.put(`/brands/${brandId}/channel-overrides/${channel}`, payload)
    return data
  },
}
