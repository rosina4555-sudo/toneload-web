import { createRouter, createWebHistory } from 'vue-router'
// import { requireAuth, requireGuest } from './guards'

import HomeView from '@/views/HomeView.vue'

// Layouts
// import DashboardLayout from '@/layouts/DashboardLayout.vue'
// import AuthLayout from '@/layouts/AuthLayout.vue'
// import StorefrontLayout from '@/layouts/StorefrontLayout.vue'

// Auth views
import SigninView from '@/views/auth/Signin.vue'
// import RegisterView from '@/views/auth/RegisterView.vue'

// Dashboard views — lazy loaded
// const OverviewView    = () => import('@/views/dashboard/OverviewView.vue')
// const ProductsView    = () => import('@/views/dashboard/ProductsView.vue')
// const OrdersView      = () => import('@/views/dashboard/OrdersView.vue')
// const StorefrontView  = () => import('@/views/dashboard/StorefrontView.vue')
// const AnalyticsView   = () => import('@/views/dashboard/AnalyticsView.vue')
// const SettingsView    = () => import('@/views/dashboard/SettingsView.vue')


// const NotFoundView = () => import('../views/NotFoundView.vue')

const routes = [

{
  path: '/',
  name: 'Home',
  component: HomeView,
  meta: { title: 'Home | Toneload' },
},

  {
    path: '/auth/signin',
    component: SigninView,
    name: "signin",
    // component: AuthLayout,
    // beforeEnter: requireGuest,
    // children: [
    //   {
    //     path: 'login',
    //     name: 'Login',
    //     component: LoginView,
    //     meta: { title: 'Login — Kweek' },
    //   },
    //   {
    //     path: 'register',
    //     name: 'Register',
    //     component: RegisterView,
    //     meta: { title: 'Create account — Kweek' },
    //   },
    //   {
    //     path: '',
    //     redirect: { name: 'Login' },
    //   },
    // ],
  },


//   {
//     path: '/dashboard',
//     component: DashboardLayout,
//     // beforeEnter: requireAuth,
//     children: [
//       {
//         path: '',
//         redirect: { name: 'Overview' },
//       },
//       {
//         path: 'overview',
//         name: 'Overview',
//         component: OverviewView,
//         meta: { title: 'Overview — Kweek' },
//       },
//       {
//         path: 'products',
//         name: 'Products',
//         component: ProductsView,
//         meta: { title: 'Products — Kweek' },
//       },
//       {
//         path: 'orders',
//         name: 'Orders',
//         component: OrdersView,
//         meta: { title: 'Orders — Kweek' },
//       },
//       {
//         path: 'storefront',
//         name: 'Storefront',
//         component: StorefrontView,
//         meta: { title: 'My Storefront — Kweek' },
//       },
//       {
//         path: 'analytics',
//         name: 'Analytics',
//         component: AnalyticsView,
//         meta: { title: 'Analytics — Kweek' },
//       },
//       {
//         path: 'settings',
//         name: 'Settings',
//         component: SettingsView,
//         meta: { title: 'Settings — Kweek' },
//       },
//     ],
//   },


  {
    path: '/',
    redirect: { name: 'Home' },
  },

//   {
//     path: '/:pathMatch(.*)*',
//     name: 'NotFound',
//     component: NotFoundView,
//     meta: { title: '404 — Kweek' },
//   },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { top: 0 }
  },
})


router.afterEach((to) => {
  document.title = to.meta.title || 'Toneload'
})

export default router