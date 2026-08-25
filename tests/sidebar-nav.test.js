import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

vi.mock('@/router', () => ({
  default: { push: vi.fn(), replace: vi.fn(), afterEach: vi.fn() },
}))

let currentPath = '/dashboard'
vi.mock('vue-router', () => ({
  useRoute: () => ({ path: currentPath, params: {}, query: {}, fullPath: currentPath }),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  RouterLink: {
    name: 'RouterLink',
    props: ['to'],
    template: '<a :href="typeof to === \'string\' ? to : to?.path"><slot /></a>',
  },
}))

import SidebarNav from '@/components/dashboard/SidebarNav.vue'
import { useAuthStore } from '@/stores/auth'

function mountNav() {
  setActivePinia(createPinia())
  const auth = useAuthStore()
  auth.setSession('tok', { id: 'usr_1', name: 'Demo', email: 'demo@brandload.so', plan: 'agency' })
  return mount(SidebarNav)
}

describe('SidebarNav active-state', () => {
  const cases = [
    ['/dashboard', 'Overview'],
    ['/dashboard/brands', 'Brands'],
    ['/dashboard/brands/brn_fintech', 'Brands'],
    ['/dashboard/analysis', 'Scoring History'],
    ['/dashboard/settings', 'Settings'],
    ['/dashboard/billing', 'Billing'],
    ['/dashboard/teams', 'Team'],
  ]

  for (const [path, expected] of cases) {
    it(`marks only "${expected}" active on ${path}`, () => {
      currentPath = path
      const w = mountNav()
      const active = w.findAll('.nav-item.nav-item--active')
      expect(active.length).toBe(1)
      expect(active[0].text()).toContain(expected)
      // vue-router's automatic class must never leak through
      expect(w.findAll('.nav-item.router-link-active').length).toBe(0)
      w.unmount()
    })
  }
})
