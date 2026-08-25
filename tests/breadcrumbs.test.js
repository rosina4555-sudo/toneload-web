import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

vi.mock('@/router', () => ({
  default: { push: vi.fn(), replace: vi.fn(), afterEach: vi.fn() },
}))

// Shared mutable route state — the mocked useRoute() returns this same
// object so tests can set path/params/matched before mounting.
const routeState = vi.hoisted(() => ({
  path: '/dashboard',
  params: {},
  query: {},
  fullPath: '/dashboard',
  matched: [],
}))

vi.mock('vue-router', () => ({
  useRoute: () => routeState,
  RouterLink: { name: 'RouterLink', props: ['to'], template: '<a><slot /></a>' },
}))

import Breadcrumbs from '@/components/dashboard/Breadcrumbs.vue'
import { useBrandsStore } from '@/stores/brands'

function mountCrumbs(matched) {
  routeState.matched = matched
  setActivePinia(createPinia())
  const brands = useBrandsStore()
  brands.items = [{ id: 'brn_fintech', name: 'Ledgerly' }]
  return mount(Breadcrumbs)
}

const m = (path, name) => ({ path, name: name ?? null })

describe('Breadcrumbs', () => {
  it('renders nothing on Overview (single crumb)', () => {
    routeState.path = '/dashboard'; routeState.params = {}
    const w = mountCrumbs([m('/dashboard')])
    expect(w.find('.breadcrumbs').exists()).toBe(false)
    w.unmount()
  })

  it('builds Dashboard > Brands > New Brand on the wizard', () => {
    routeState.path = '/dashboard/brands/new'; routeState.params = {}
    const w = mountCrumbs([m('/dashboard'), m('/dashboard/brands'), m('/dashboard/brands/new')])
    const labels = w.findAll('.label').map((l) => l.text())
    expect(labels).toEqual(['Overview', 'Brands', 'New Brand'])
    expect(w.findAll('.label--current').length).toBe(1)
    expect(w.find('.label--current').text()).toBe('New Brand')
    w.unmount()
  })

  it('shows the real brand name on a detail page', () => {
    routeState.path = '/dashboard/brands/brn_fintech'; routeState.params = { id: 'brn_fintech' }
    const w = mountCrumbs([
      m('/dashboard'),
      m('/dashboard/brands'),
      m('/dashboard/brands/:id', 'BrandDetail'),
    ])
    const labels = w.findAll('.label').map((l) => l.text())
    expect(labels).toEqual(['Overview', 'Brands', 'Ledgerly'])
    w.unmount()
  })

  it('falls back gracefully when the brand is unknown', () => {
    routeState.path = '/dashboard/brands/brn_unknown'; routeState.params = { id: 'brn_unknown' }
    const w = mountCrumbs([
      m('/dashboard'),
      m('/dashboard/brands'),
      m('/dashboard/brands/:id', 'BrandDetail'),
    ])
    expect(w.find('.label--current').text()).toBe('Brand Profile')
    w.unmount()
  })
})
