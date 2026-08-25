<template>
  <nav class="sidebar-nav">
    <RouterLink to="/dashboard" class="brand-row">
      <img src="/images/voice_load_logo_web.png" alt="Brandload" class="brand-logo" />
      <span class="brand-name font-display">Brandload</span>
    </RouterLink>

    <div class="nav-section">
      <p class="nav-section-label">Workspace</p>
      <RouterLink
        v-for="item in items"
        :key="item.to"
        :to="item.to"
        class="nav-item"
        :class="{ 'nav-item--active': isActive(item) }"
        active-class=""
        exact-active-class=""
      >
        <component :is="item.icon" :size="19" weight="regular" />
        <span>{{ item.label }}</span>
        <span v-if="item.badge" class="nav-badge">{{ item.badge }}</span>
      </RouterLink>
    </div>

    <div v-if="planName" class="plan-card">
      <p class="plan-name">{{ planName }} plan</p>
      <p class="plan-hint">{{ planHint }}</p>
      <RouterLink to="/dashboard/billing" class="plan-link">Manage billing →</RouterLink>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useBrandsStore } from '@/stores/brands'
import {
  PhSquaresFour,
  PhTag,
  PhChartLine,
  PhUsersThree,
  PhCreditCard,
  PhGearSix,
} from '@phosphor-icons/vue'

const route = useRoute()
const auth = useAuthStore()
const brandsStore = useBrandsStore()

const items = computed(() => {
  const base = [
    // Overview matches exactly — otherwise every /dashboard/* child route
    // would keep its indicator lit.
    { to: '/dashboard', label: 'Overview', icon: PhSquaresFour, match: ['/dashboard'], exact: true },
    { to: '/dashboard/brands', label: 'Brands', icon: PhTag, match: ['/dashboard/brands'] },
    { to: '/dashboard/analysis', label: 'Scoring History', icon: PhChartLine, match: ['/dashboard/analysis'] },
  ]
  if (auth.user?.plan === 'agency') {
    base.push({ to: '/dashboard/teams', label: 'Team', icon: PhUsersThree, match: ['/dashboard/teams'] })
  }
  base.push(
    { to: '/dashboard/billing', label: 'Billing', icon: PhCreditCard, match: ['/dashboard/billing'] },
    { to: '/dashboard/settings', label: 'Settings', icon: PhGearSix, match: ['/dashboard/settings'] },
  )
  if (brandsStore.hasBuilding) {
    const brandsItem = base.find((i) => i.label === 'Brands')
    brandsItem.badge = 'building'
  }
  return base
})

function isActive(item) {
  return item.match.some((m) =>
    item.exact ? route.path === m : route.path === m || route.path.startsWith(m + '/'),
  )
}

const planName = computed(() => {
  const names = { free: 'Free', pro: 'Pro', agency: 'Agency' }
  return names[auth.user?.plan] ?? null
})
const planHint = computed(() => ({
  free: '1 brand · 20 checks/day',
  pro: '10 brands · unlimited checks',
  agency: 'Unlimited brands · 5 seats',
}[auth.user?.plan] ?? ''))
</script>

<style scoped>
.sidebar-nav {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 20px 14px;
}
.brand-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 8px 20px;
  text-decoration: none;
}
.brand-logo { width: 28px; height: 28px; border-radius: 7px; object-fit: cover; }
.brand-name { font-size: 18px; font-weight: 700; color: var(--text-primary); }

.nav-section { display: flex; flex-direction: column; gap: 2px; flex: 1; }
.nav-section-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: var(--text-disabled);
  padding: 0 10px;
  margin-bottom: 6px;
}
.nav-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 10px 12px;
  border-radius: 10px;
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: background 0.12s, color 0.12s;
}
.nav-item:hover { background: var(--bg-surface); color: var(--text-primary); }
.nav-item.nav-item--active {
  background: var(--bg-dark);
  color: var(--text-on-dark);
}
.nav-badge {
  margin-left: auto;
  font-size: 10.5px;
  font-weight: 600;
  background: var(--brand);
  color: var(--text-primary);
  border-radius: 999px;
  padding: 2px 8px;
}

.plan-card {
  margin-top: 16px;
  padding: 14px;
  border-radius: 12px;
  background: var(--bg-surface);
  border: 1px solid var(--border);
}
.plan-name { font-size: 13px; font-weight: 700; }
.plan-hint { font-size: 12px; color: var(--text-muted); margin-top: 2px; }
.plan-link { display: inline-block; margin-top: 8px; font-size: 12.5px; font-weight: 600; color: var(--accent-text); text-decoration: none; }
.plan-link:hover { text-decoration: underline; }
</style>
