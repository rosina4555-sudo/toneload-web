import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// ── Marketing ───────────────────────────────────────────────────────────────
import HomeView from '@/views/marketing/HomeView.vue'

// ── Auth ────────────────────────────────────────────────────────────────────
import SigninView from '@/views/auth/Signin.vue'

// ── Dashboard — lazy loaded so the landing page stays fast ─────────────────
const OverviewView        = () => import('@/views/dashboard/OverviewView.vue')
const BrandListView       = () => import('@/views/dashboard/BrandListView.vue')
const BrandCreateView     = () => import('@/views/dashboard/BrandCreateView.vue')
const BrandDetailView     = () => import('@/views/dashboard/BrandDetailView.vue')
const AnalysisHistoryView = () => import('@/views/dashboard/AnalysisHistoryView.vue')
const TeamView            = () => import('@/views/dashboard/TeamView.vue')
const BillingView         = () => import('@/views/dashboard/BillingView.vue')
const SettingsView        = () => import('@/views/dashboard/SettingsView.vue')
const NotFoundView        = () => import('@/views/NotFoundView.vue')

// ── Route guards ────────────────────────────────────────────────────────────

/**
 * Allows the route only for authenticated users.
 * The access token lives in memory (never localStorage — spec §6), so after a
 * page reload we attempt one silent refresh via the HttpOnly cookie session
 * before bouncing to the sign-in page.
 */
async function requireAuth(to) {
  const auth = useAuthStore()

  if (!auth.isAuthenticated) {
    await auth.refreshAccessToken()
  }
  if (!auth.isAuthenticated) {
    return { name: 'Auth', query: { mode: 'login', redirect: to.fullPath } }
  }
}

/** Keeps authenticated users away from the sign-in page. */
async function requireGuest() {
  const auth = useAuthStore()
  if (auth.isAuthenticated || (await auth.refreshAccessToken())) {
    return { name: 'Dashboard' }
  }
}

const routes = [
  // ── Marketing ─────────────────────────────────────────────────────────────
  {
    path: '/',
    name: 'Home',
    component: HomeView,
    meta: { title: 'Brandload — Instantly align your team with any brand voice' },
  },

  // ── Auth ────────────────────────────────────────────────────────────────────
  {
    path: '/auth',
    name: 'Auth',
    component: SigninView,
    beforeEnter: requireGuest,
    meta: { title: 'Sign in — Brandload' },
  },

  // ── Dashboard ─────────────────────────────────────────────────────────────
  {
    path: '/dashboard',
    component: () => import('@/layouts/DashboardLayout.vue'),
    beforeEnter: requireAuth,
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: OverviewView,
        meta: { title: 'Overview — Brandload' },
      },
      {
        path: 'brands',
        name: 'Brands',
        component: BrandListView,
        meta: { title: 'Brands — Brandload' },
      },
      {
        path: 'brands/new',
        name: 'BrandCreate',
        component: BrandCreateView,
        meta: { title: 'New Brand — Brandload' },
      },
      {
        path: 'brands/:id',
        name: 'BrandDetail',
        component: BrandDetailView,
        meta: { title: 'Brand Profile — Brandload' },
      },
      {
        // Editing happens inline on the detail page tabs; keep the legacy
        // route working by redirecting to it.
        path: 'brands/:id/edit',
        redirect: (to) => ({ name: 'BrandDetail', params: to.params, query: { tab: 'vocabulary' } }),
      },
      {
        path: 'brands/:id/rebuild',
        redirect: (to) => ({ name: 'BrandDetail', params: to.params, query: { rebuild: '1' } }),
      },
      {
        path: 'analysis',
        name: 'Analysis',
        component: AnalysisHistoryView,
        meta: { title: 'Scoring History — Brandload' },
      },
      {
        path: 'teams',
        name: 'Teams',
        component: TeamView,
        meta: { title: 'Team — Brandload' },
      },
      {
        path: 'billing',
        name: 'Billing',
        component: BillingView,
        meta: { title: 'Billing — Brandload' },
      },
      {
        path: 'settings',
        name: 'Settings',
        component: SettingsView,
        meta: { title: 'Settings — Brandload' },
      },
    ],
  },

  // ── Fallback ─────────────────────────────────────────────────────────────
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFoundView,
    meta: { title: '404 — Brandload' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { top: 0 }
  },
})

router.afterEach((to) => {
  document.title = to.meta.title ?? 'Brandload'
})

export default router
