/** Dashboard overview stats + activity feed. */

import api from './axios'

export const dashboardApi = {
  async stats() {
    const { data } = await api.get('/dashboard/stats')
    return data
  },
}
