import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import OverviewView from '@/views/dashboard/OverviewView.vue'
import { useAuthStore } from '@/stores/auth'

describe('OverviewView', () => {
  it('loads, renders stat values and stops showing skeletons', async () => {
    setActivePinia(createPinia())
    const auth = useAuthStore()
    auth.setSession('test-token', { id: 'usr_demo', name: 'Amara Osei', email: 'demo@brandload.so', plan: 'agency' })

    const wrapper = mount(OverviewView, {
      global: { stubs: { RouterLink: { template: '<a><slot /></a>' } } },
    })

    // Skeletons visible while loading
    expect(wrapper.find('.skeleton-row').exists()).toBe(true)

    // Mock latency is 120–400ms; give it room to settle
    await new Promise((r) => setTimeout(r, 700))

    expect(wrapper.find('.skeleton-row').exists()).toBe(false)
    const statCards = wrapper.findAll('.stat-card')
    expect(statCards.length).toBe(4)
    // First card should render a concrete number, not a skeleton
    expect(statCards[0].find('.value-skeleton').exists()).toBe(false)
    expect(statCards[0].text()).toMatch(/\d+/)
  })
})
