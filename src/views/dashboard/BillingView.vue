<template>
  <div>
    <PageHeader title="Billing" subtitle="Your plan, usage and invoices." />

    <!-- Current plan + usage -->
    <div class="current-grid">
      <div class="card current-card">
        <div class="plan-row">
          <div>
            <p class="label">Current plan</p>
            <h2 class="font-display">{{ capitalize(subscription?.plan) }}</h2>
            <p v-if="subscription?.status === 'active'" class="renew-hint">
              Renews {{ formatDate(subscription.current_period_end) }}
            </p>
          </div>
          <BaseBadge tone="success" :dot="true">Active</BaseBadge>
        </div>
      </div>

      <div class="card usage-card">
        <h3>This period</h3>
        <div class="usage-item">
          <div class="usage-head"><span>Brand profiles</span><span>{{ u.brands_used ?? '—' }} / {{ u.brands_limit ?? '∞' }}</span></div>
          <div class="meter"><div class="meter-fill" :style="{ width: pct(u.brands_used, u.brands_limit) }" /></div>
        </div>
        <div class="usage-item">
          <div class="usage-head"><span>Checks today</span><span>{{ u.checks_today ?? '—' }} / {{ u.checks_limit ?? '∞' }}</span></div>
          <div class="meter"><div class="meter-fill" :style="{ width: pct(u.checks_today, u.checks_limit) }" /></div>
        </div>
      </div>
    </div>

    <!-- Plans -->
    <h3 class="plans-title font-display">Change plan</h3>
    <div class="plans-grid">
      <div
        v-for="p in plans"
        :key="p.id"
        class="plan-card"
        :class="{ 'plan-card--current': p.id === subscription?.plan, 'plan-card--popular': p.popular }"
      >
        <div class="plan-head">
          <h4>{{ p.name }}</h4>
          <BaseBadge v-if="p.id === subscription?.plan" tone="brand">Current</BaseBadge>
          <BaseBadge v-else-if="p.popular" tone="info">Popular</BaseBadge>
        </div>
        <p class="price"><strong>${{ p.price_monthly }}</strong><span>/mo</span></p>
        <p class="tagline">{{ p.tagline }}</p>
        <ul class="feature-list">
          <li v-for="f in p.features" :key="f"><PhCheckCircle :size="15" weight="fill" /> {{ f }}</li>
        </ul>
        <BaseButton
          class="plan-btn"
          :variant="p.id === subscription?.plan ? 'ghost' : 'primary'"
          size="sm"
          :disabled="p.id === subscription?.plan || switching"
          :loading="switching === p.id"
          @click="switchPlan(p)"
        >
          {{ p.id === subscription?.plan ? 'Your plan' : `Switch to ${p.name}` }}
        </BaseButton>
      </div>
    </div>

    <!-- Invoices -->
    <section v-if="invoices.length" class="card invoices-card">
      <h3>Invoices</h3>
      <table class="data-table">
        <thead><tr><th>Date</th><th>Amount</th><th>Status</th><th></th></tr></thead>
        <tbody>
          <tr v-for="inv in invoices" :key="inv.id">
            <td>{{ formatDate(inv.date) }}</td>
            <td>${{ inv.amount }}.00 {{ inv.currency.toUpperCase() }}</td>
            <td><BaseBadge tone="success">{{ inv.status }}</BaseBadge></td>
            <td class="cell-action"><button class="link-btn" @click="toast.info('Invoice PDFs come with the live Stripe integration.')">Download</button></td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { billingApi } from '@/api/billing'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { formatDate } from '@/utils/format'
import PageHeader from '@/components/ui/PageHeader.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import { PhCheckCircle } from '@phosphor-icons/vue'

const auth = useAuthStore()
const toast = useToast()

const plans = ref([])
const subscription = ref(null)
const loading = ref(true)
const switching = ref(null)

const u = computed(() => subscription.value?.usage ?? {})
const invoices = computed(() => subscription.value?.invoices ?? [])

function pct(used, limit) {
  if (!limit) return used ? '12%' : '0%'
  return `${Math.min(100, Math.round((used / limit) * 100))}%`
}
function capitalize(s) {
  return s ? s[0].toUpperCase() + s.slice(1) : '—'
}

async function switchPlan(plan) {
  switching.value = plan.id
  try {
    // Real flow redirects to Stripe Checkout; the mock switches instantly.
    await billingApi.checkout(plan.id)
    auth.user.plan = plan.id
    subscription.value = await billingApi.subscription()
    toast.success(`You're now on the ${capitalize(plan.id)} plan.`)
  } catch (e) {
    toast.error(e.message)
  } finally {
    switching.value = null
  }
}

onMounted(async () => {
  try {
    const [planList, sub] = await Promise.all([billingApi.plans(), billingApi.subscription()])
    plans.value = planList
    subscription.value = sub
  } catch (e) {
    toast.error(e.message)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 20px;
}
.card h3 { font-family: 'Cabinet Grotesk', sans-serif; font-size: 16.5px; margin-bottom: 14px; }

.current-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.4fr);
  gap: 16px;
  margin-bottom: 30px;
}

.plan-row { display: flex; justify-content: space-between; align-items: center; }
.label { font-size: 13px; color: var(--text-muted); }
.current-card h2 { font-size: 32px; margin-top: 2px; }
.renew-hint { font-size: 13px; color: var(--text-muted); margin-top: 4px; }

.usage-item { margin-bottom: 16px; }
.usage-item:last-child { margin-bottom: 0; }
.usage-head {
  display: flex;
  justify-content: space-between;
  font-size: 13.5px;
  color: var(--text-secondary);
  margin-bottom: 7px;
}
.meter { height: 8px; background: var(--bg-sunken); border-radius: 999px; overflow: hidden; }
.meter-fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--accent), #34d399);
  transition: width 0.4s ease;
}

.plans-title { font-size: 19px; margin-bottom: 14px; }

.plans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 14px;
  margin-bottom: 30px;
}
.plan-card {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 22px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 16px;
}
.plan-card--popular { border-color: var(--brand); box-shadow: 0 8px 28px rgba(0, 102, 255, 0.14); }
.plan-head { display: flex; justify-content: space-between; align-items: center; }
.plan-head h4 { font-family: 'Cabinet Grotesk', sans-serif; font-size: 17px; }
.price { margin-top: 10px; }
.price strong { font-size: 34px; font-weight: 700; letter-spacing: -0.6px; }
.price span { font-size: 14px; color: var(--text-muted); margin-left: 3px; }
.tagline { font-size: 13px; color: var(--text-muted); margin-top: 2px; }
.feature-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 9px;
  margin: 16px 0 20px;
  flex: 1;
}
.feature-list li { display: flex; align-items: center; gap: 8px; font-size: 13.5px; color: var(--text-secondary); }
.feature-list svg { color: var(--accent); flex-shrink: 0; }

.invoices-card { overflow-x: auto; }
.data-table { width: 100%; border-collapse: collapse; font-size: 13.5px; }
.data-table th {
  text-align: left;
  font-size: 11.5px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: var(--text-disabled);
  padding: 8px;
  border-bottom: 1px solid var(--border);
}
.data-table td { padding: 11px 8px; border-bottom: 1px solid var(--border); }
.cell-action { text-align: right; }
.link-btn {
  border: none;
  background: none;
  font-size: 13px;
  font-weight: 600;
  color: var(--accent-text);
  cursor: pointer;
}
.link-btn:hover { text-decoration: underline; }

@media (max-width: 800px) {
  .current-grid { grid-template-columns: 1fr; }
}
</style>
