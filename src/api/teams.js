/** Team management API (Agency plan). */

import api from './axios'

export const teamsApi = {
  async list() {
    const { data } = await api.get('/teams')
    return data
  },

  async listMembers(teamId) {
    const { data } = await api.get(`/teams/${teamId}/members`)
    return data
  },

  async inviteMember(teamId, payload) {
    const { data } = await api.post(`/teams/${teamId}/members/invite`, payload)
    return data
  },

  async updateMemberRole(teamId, memberId, role) {
    const { data } = await api.patch(`/teams/${teamId}/members/${memberId}`, { role })
    return data
  },

  async removeMember(teamId, memberId) {
    await api.delete(`/teams/${teamId}/members/${memberId}`)
  },

  async revokeInvite(teamId, inviteId) {
    await api.delete(`/teams/${teamId}/invites/${inviteId}`)
  },
}
