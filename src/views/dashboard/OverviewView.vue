<template>
  <div>
    <header class="overview-header">
      <div>
        <h1 class="font-display">{{ greeting }}, {{ firstName }}</h1>
        <p class="subtitle">Here's how your brand voices are holding up.</p>
      </div>
    </header>

    <!-- Stats -->
    <div class="stats-grid">
      <StatCard label="Active brands" :value="stats?.active_brands ?? null" :icon="PhTag" :loading="loading">
        <template #extra>
          <p v-if="buildingCount" class="stat-note"><span class="pulse-dot" /> {{ buildingCount }} building now</p>
        </template>
      </StatCard>
      <StatCard label="Avg. alignment" :value="stats?.avg_alignment ?? null" suffix="/100" hint="Across all ready brands" :loading="loading" />
      <StatCard
        label="Checks today"
        :value="stats?.checks_today ?? null"
        :suffix="stats?.checks_limit ? `/ ${stats.checks_limit}` : ''"
        hint="Free plan resets at midnight"
        :loading="loading"
      />
      <StatCard label="Open flags (7d)" :value="stats?.open_flags_7d ?? null" hint="Flags awaiting writer action" :loading="loading" />
    </div>

    <div class="overview-grid">
      <!-- Recent activity -->
      <section class="card activity-card">
        <div class="card-head">
          <h3>Recent activity</h3>
        </div>
        <ul v-if="activity.length" class="activity-list">
          <li v-for="a in activity" :key="a.id" class="activity-item">
            <span class="activity-icon" :class="`activity-icon--${iconFor(a.type)}`">
              <component :is="iconComponent(a.type)" :size="16" weight="fill" />
            </span>
            <div class="activity-body">
              <p>{{ a.message }}</p>
              <span class="activity-time">{{ timeAgo(a.created_at) }}</span>
            </div>
          </li>
        </ul>
        <p v-else-if="!loading" class="muted">No activity yet — create your first brand to get started.</p>
        <div v-else v-for="n in 4" :key="n" class="skeleton-row" />
      </section>

      <!-- Quick actions -->
      <aside class="side-col">
        <section class="card">
          <h3>Quick actions</h3>
          <RouterLink to="/dashboard/brands/new" class="quick-action">
            <PhPlusCircle :size="20" weight="fill" />
            <span>Create a brand profile<small>Load a client's identity in minutes</small></span>
          </RouterLink>
          <RouterLink to="/dashboard/analysis" class="quick-action">
            <PhChartLine :size="20" weight="fill" />
            <span>Review scoring history<small>See where drafts drifted off-voice</small></span>
          </RouterLink>
          <RouterLink to="/dashboard/settings" class="quick-action">
            <PhPlugsConnected :size="20" weight="fill" />
            <span>Connect the extension<small>Bring Brandload into your writing flow</small></span>
          </RouterLink>
        </section>

        <section class="card tip-card">
          <PhLightbulb :size="22" weight="fill" />
          <div>
            <h4>Tone ≠ voice</h4>
            <p>Tone contexts adjust tolerance around a brand's core voice — they never replace it. Set them up on each brand's profile.</p>
          </div>
        </section>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { dashboardApi } from '@/api/dashboard'
import { useAuthStore } from '@/stores/auth'
import StatCard from '@/components/ui/StatCard.vue'
import { timeAgo } from '@/utils/format'
import {
  PhTag,
  PhBuildings,
  PhFlag,
  PhUsersThree,
  PhPlusCircle,
  PhChartLine,
  PhPlugsConnected,
  PhLightbulb,
} from '@phosphor-icons/vue'

const auth = useAuthStore()
const stats = ref(null)
const loading = ref(true)

const firstName = computed(() => auth.user?.name?.split(' ')[0] ?? 'there')
const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
})
const activity = computed(() => stats.value?.recent_activity ?? [])
const buildingCount = computed(() => stats.value?.building_brands ?? 0)

function iconFor(type) {
  if (type.startsWith('build.completed')) return 'success'
  if (type.startsWith('build')) return 'brand'
  if (type.includes('flag')) return 'danger'
  return 'info'
}
function iconComponent(type) {
  if (type.startsWith('build.completed')) return PhTag
  if (type.startsWith('build')) return PhBuildings
  if (type.includes('flag')) return PhFlag
  return PhUsersThree
}

onMounted(async () => {
  try {
    stats.value = await dashboardApi.stats()
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.overview-header { margin-bottom: 20px; }
.overview-header h1 { font-size: 22px; font-weight: 600; letter-spacing: -0.2px; }
.subtitle { color: var(--text-muted); margin-top: 4px; font-size: 14px; }

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.overview-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.8fr) minmax(280px, 1fr);
  gap: 14px;
  align-items: start;
}

.card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 16px;
}
.card h3 {
  font-family: 'Cabinet Grotesk', sans-serif;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: -0.1px;
  margin-bottom: 12px;
  color: var(--text-primary);
}
.card-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }

.activity-list { list-style: none; display: flex; flex-direction: column; }
.activity-item { display: flex; gap: 10px; padding: 10px 0; border-bottom: 1px solid var(--border); }
.activity-item:last-child { border-bottom: none; }
.activity-icon {
  display: grid; place-items: center;
  width: 28px; height: 28px;
  border-radius: 6px;
  flex-shrink: 0;
}
.activity-icon--brand   { background: var(--brand-light); color: var(--brand-text); }
.activity-icon--success { background: #d1fae5; color: #065f46; }
.activity-icon--danger  { background: #fee2e2; color: #991b1b; }
.activity-icon--info    { background: #e0f2fe; color: #0369a1; }
.activity-body p { font-size: 13.5px; line-height: 1.4; }
.activity-time { font-size: 11.5px; color: var(--text-disabled); }

.side-col { display: flex; flex-direction: column; gap: 14px; }

.quick-action {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 10px;
  margin-top: 4px;
  border-radius: 6px;
  color: var(--text-primary);
  text-decoration: none;
  transition: background 0.12s;
}
.quick-action:hover { background: var(--bg-surface); }
.quick-action span { display: flex; flex-direction: column; font-size: 13.5px; font-weight: 500; line-height: 1.3; }
.quick-action small { font-size: 11.5px; font-weight: 400; color: var(--text-muted); }

.tip-card {
  display: flex;
  gap: 10px;
  background: var(--bg-dark-surface);
  border-color: transparent;
  color: var(--text-on-dark);
  border-radius: 8px;
}
.tip-card svg { color: var(--brand); flex-shrink: 0; }
.tip-card h4 { font-size: 13px; font-weight: 600; }
.tip-card p { font-size: 12.5px; color: var(--text-on-dark-secondary); margin-top: 3px; line-height: 1.4; }

.stat-note { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--accent-text); margin-top: 6px; }
.pulse-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent); animation: pulse 1.6s infinite; }
@keyframes pulse { 50% { opacity: 0.3; } }

.muted { color: var(--text-muted); font-size: 13px; }

.skeleton-row {
  height: 38px;
  margin-top: 8px;
  border-radius: 6px;
  background: linear-gradient(90deg, var(--bg-sunken) 25%, var(--bg-surface) 50%, var(--bg-sunken) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
}
@keyframes shimmer { to { background-position: -200% 0; } }

@media (max-width: 1000px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .overview-grid { grid-template-columns: 1fr; }
}
@media (max-width: 480px) {
  .stats-grid { grid-template-columns: 1fr; }
}
</style>
