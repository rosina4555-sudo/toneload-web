import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

// All dashboard views pull routing info; give them just enough to render.
// stores/auth imports the real router module, which registers afterEach hooks
// at import time — stub the whole module out instead.
vi.mock('@/router', () => ({
  default: { push: vi.fn(), replace: vi.fn(), afterEach: vi.fn() },
}))
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useRoute: () => ({ params: { id: 'brn_fintech' }, query: {}, fullPath: '/dashboard' }),
  RouterLink: { template: '<a><slot /></a>' },
}))

import OverviewView from '@/views/dashboard/OverviewView.vue'
import BrandListView from '@/views/dashboard/BrandListView.vue'
import BrandCreateView from '@/views/dashboard/BrandCreateView.vue'
import BrandDetailView from '@/views/dashboard/BrandDetailView.vue'
import AnalysisHistoryView from '@/views/dashboard/AnalysisHistoryView.vue'
import TeamView from '@/views/dashboard/TeamView.vue'
import BillingView from '@/views/dashboard/BillingView.vue'
import SettingsView from '@/views/dashboard/SettingsView.vue'

const settle = () => new Promise((r) => setTimeout(r, 700))

function mountWithAuth(view) {
  setActivePinia(createPinia())
  const auth = useAuthStore()
  auth.setSession('test-token', {
    id: 'usr_demo',
    name: 'Amara Osei',
    email: 'demo@brandload.so',
    plan: 'agency',
  })
  return mount(view)
}

import { useAuthStore } from '@/stores/auth'

describe('dashboard view smoke tests — every view renders its data without getting stuck', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('OverviewView settles and shows stats + activity', async () => {
    const w = mountWithAuth(OverviewView)
    await settle()
    expect(w.find('.skeleton-row').exists()).toBe(false)
    expect(w.findAll('.stat-card').length).toBe(4)
    expect(w.findAll('.activity-item').length).toBeGreaterThan(0)
    w.unmount()
  })

  it('BrandListView settles and renders brand cards', async () => {
    const w = mountWithAuth(BrandListView)
    await settle()
    expect(w.findAll('.brand-card').length).toBeGreaterThanOrEqual(3)
    w.unmount()
  })

  it('BrandCreateView wizard navigates steps', async () => {
    const w = mountWithAuth(BrandCreateView)
    expect(w.find('#brand-name').exists()).toBe(true)
    await w.find('#brand-name').setValue('Test Brand')
    await w.find('form .base-btn--primary, .wizard-footer .base-btn--primary').trigger('click')
    expect(w.find('.copy-area').exists()).toBe(true)
    w.unmount()
  })

  it('BrandDetailView loads a ready brand with voice data', async () => {
    const w = mountWithAuth(BrandDetailView)
    await settle()
    expect(w.text()).toContain('Ledgerly')
    expect(w.text()).toContain('Voice descriptors')
    expect(w.findAll('.dim').length).toBe(8) // all eight voice dimensions
    w.unmount()
  })

  it('AnalysisHistoryView settles with rows and summary', async () => {
    const w = mountWithAuth(AnalysisHistoryView)
    await settle()
    expect(w.findAll('.main-row').length).toBeGreaterThanOrEqual(5)
    // expand the second row — it's seeded with 3 flags (the first is clean)
    await w.findAll('.main-row')[1].trigger('click')
    expect(w.find('.flag-item').exists()).toBe(true)
    w.unmount()
  })

  it('TeamView settles with members and invites', async () => {
    const w = mountWithAuth(TeamView)
    await settle()
    expect(w.findAll('.member-row').length).toBeGreaterThanOrEqual(4)
    expect(w.text()).toContain('Pending invites')
    w.unmount()
  })

  it('BillingView settles with plans and usage meters', async () => {
    const w = mountWithAuth(BillingView)
    await settle()
    expect(w.findAll('.plan-card').length).toBe(3)
    expect(w.findAll('.usage-item').length).toBe(2)
    w.unmount()
  })

  it('SettingsView settles with credentials list', async () => {
    const w = mountWithAuth(SettingsView)
    await settle()
    expect(w.findAll('.cred-row').length).toBeGreaterThanOrEqual(2)
    w.unmount()
  })
})
