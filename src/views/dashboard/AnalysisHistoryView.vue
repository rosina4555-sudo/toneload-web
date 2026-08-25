<template>
  <div>
    <PageHeader title="Scoring History" subtitle="Every stored scoring run, with the flags that shaped each verdict." />

    <!-- Toolbar -->
    <div class="toolbar">
      <div class="filter-group">
        <label for="brand-filter">Brand</label>
        <select id="brand-filter" v-model="brandFilter">
          <option value="">All brands</option>
          <option v-for="b in store.items" :key="b.id" :value="b.id">{{ b.name }}</option>
        </select>
      </div>
      <div class="summary">
        <span><strong>{{ visibleRows.length }}</strong> runs</span>
        <span v-if="avgScore != null">· avg <strong :class="`score-text--${avgTone}`">{{ avgScore }}</strong></span>
        <span>· <strong>{{ openFlags }}</strong> open flags</span>
      </div>
    </div>

    <!-- States -->
    <div v-if="loading && !rows.length" class="skeleton-block" />

    <EmptyState
      v-else-if="!visibleRows.length"
      title="No scoring history"
      description="Stored results appear here as your team writes with the extension. Ephemeral (unsaved) checks are never kept."
    >
      <template #icon><PhChartLine :size="26" /></template>
    </EmptyState>

    <div v-else class="history-card card">
      <table class="data-table">
        <thead>
          <tr><th></th><th>Content</th><th>Brand</th><th>Channel</th><th>Tone</th><th>Score</th><th>Confidence</th><th>When</th></tr>
        </thead>
        <tbody>
          <template v-for="r in visibleRows" :key="r.id">
            <tr class="main-row" @click="toggle(r.id)">
              <td class="expand-cell">
                <PhCaretRight v-if="expanded !== r.id" :size="13" />
                <PhCaretDown v-else :size="13" />
              </td>
              <td class="cell-preview">{{ r.content_preview }}</td>
              <td>{{ brandName(r.brand_id) }}</td>
              <td>{{ channelName(r.channel) }}</td>
              <td>{{ r.tone_context ?? '—' }}</td>
              <td><ScorePill :score="r.alignment_score" /></td>
              <td>
                <BaseBadge :tone="confidenceTone(r.confidence_score)">{{ confidenceLabel(r.confidence_score) }}</BaseBadge>
              </td>
              <td class="cell-time">{{ timeAgo(r.created_at) }}</td>
            </tr>

            <!-- Expanded flag detail -->
            <tr v-if="expanded === r.id" class="detail-row">
              <td></td>
              <td colspan="7">
                <div v-if="r.flags.length" class="flag-list">
                  <div v-for="(f, i) in r.flags" :key="i" class="flag-item" :class="{ resolved: !!f.resolution }">
                    <div class="flag-head">
                      <BaseBadge :tone="severityTone(f.severity)">{{ f.severity }}</BaseBadge>
                      <code class="flag-phrase font-mono">“{{ f.phrase }}”</code>
                      <span class="flag-type">{{ f.type }}</span>
                      <BaseBadge v-if="f.resolution" tone="neutral">{{ f.resolution.replaceAll('_', ' ') }}</BaseBadge>
                    </div>
                    <p v-if="f.suggestion" class="flag-suggestion"><strong>Suggestion:</strong> {{ f.suggestion }}</p>
                  </div>
                </div>
                <p v-else class="muted">No flags — this draft was fully on-brand.</p>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { analysisApi } from '@/api/analysis'
import { useBrandsStore } from '@/stores/brands'
import PageHeader from '@/components/ui/PageHeader.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import ScorePill from '@/components/ui/ScorePill.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import { timeAgo } from '@/utils/format'
import { PhChartLine, PhCaretRight, PhCaretDown } from '@phosphor-icons/vue'

const store = useBrandsStore()
const rows = ref([])
const loading = ref(true)
const brandFilter = ref('')
const expanded = ref(null)

const visibleRows = computed(() =>
  brandFilter.value ? rows.value.filter((r) => r.brand_id === brandFilter.value) : rows.value,
)

const scored = computed(() => visibleRows.value.filter((r) => r.alignment_score != null))
const avgScore = computed(() =>
  scored.value.length ? Math.round(scored.value.reduce((s, r) => s + r.alignment_score, 0) / scored.value.length) : null,
)
const avgTone = computed(() => (avgScore.value >= 80 ? 'high' : avgScore.value >= 60 ? 'mid' : 'low'))
const openFlags = computed(() =>
  visibleRows.value.reduce((n, r) => n + r.flags.filter((f) => !f.resolution).length, 0),
)

function toggle(id) {
  expanded.value = expanded.value === id ? null : id
}
const brandName = (id) => store.items.find((b) => b.id === id)?.name ?? 'Unknown'

const CHANNEL_NAMES = {
  linkedin: 'LinkedIn', twitter_x: 'Twitter / X', blog: 'Blog', email: 'Email',
  instagram: 'Instagram', google_docs: 'Google Docs',
}
const channelName = (c) => CHANNEL_NAMES[c] ?? c

const CONF_LABELS = {
  very_high: 'Very high', high: 'High', medium: 'Medium', low: 'Low', very_low: 'Very low',
}
const confidenceLabel = (c) => CONF_LABELS[c] ?? c
const confidenceTone = (c) => ({ high: 'success', very_high: 'success', medium: 'warning', low: 'danger', very_low: 'danger' }[c] ?? 'neutral')
const severityTone = (s) => ({ high: 'danger', medium: 'warning', low: 'neutral' }[s] ?? 'neutral')

onMounted(async () => {
  try {
    const [{ items }, ] = await Promise.all([
      analysisApi.list(),
      store.fetchList(), // needed for the brand filter dropdown
    ])
    rows.value = items.map((r) => ({ ...r, flags: r.flags ?? [] }))
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 16px;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}
.filter-group { display: flex; align-items: center; gap: 10px; }
.filter-group label { font-size: 12px; font-weight: 600; color: var(--text-muted); }
.filter-group select {
  height: 34px;
  padding: 0 10px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--bg-card);
  font-size: 13px;
  font-family: inherit;
  color: var(--text-primary);
  outline: none;
  transition: border-color 0.14s;
}
.filter-group select:hover { border-color: var(--border-strong); }
.filter-group select:focus { border-color: var(--brand); box-shadow: 0 0 0 2px rgba(0,102,255,0.08); }
.summary { display: flex; gap: 8px; font-size: 13px; color: var(--text-muted); }
.score-text--high { color: var(--score-high-text); }
.score-text--mid { color: var(--score-mid-text); }
.score-text--low { color: var(--score-low-text); }

.history-card { padding: 6px 12px; overflow-x: auto; }

.data-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.data-table th {
  text-align: left;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-disabled);
  padding: 10px 8px;
  border-bottom: 1px solid var(--border);
  white-space: nowrap;
}
.data-table td { padding: 10px 8px; border-bottom: 1px solid var(--border); vertical-align: middle; }
.main-row { cursor: pointer; transition: background 0.1s; }
.main-row:hover { background: var(--bg-page); }
.expand-cell { width: 24px; color: var(--text-muted); }
.cell-preview {
  max-width: 280px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--text-secondary);
  font-weight: 500;
}
.cell-time { color: var(--text-muted); font-size: 12px; white-space: nowrap; }

.detail-row td {
  background: var(--bg-page);
  border-bottom: 1px solid var(--border);
}
.flag-list { display: flex; flex-direction: column; gap: 8px; padding: 4px 2px 10px; }
.flag-item {
  border-left: 3px solid var(--error-border);
  background: var(--bg-card);
  border-radius: 0 8px 8px 0;
  padding: 10px 12px;
}
.flag-item.resolved { border-left-color: var(--accent-light); opacity: 0.7; }
.flag-head { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.flag-phrase { color: var(--text-primary); font-size: 13px; }
.flag-type { font-size: 11.5px; color: var(--text-muted); }
.flag-suggestion { font-size: 12.5px; color: var(--text-secondary); margin-top: 6px; }

.muted { color: var(--text-muted); font-size: 13px; }

.skeleton-block {
  height: 300px;
  border-radius: 8px;
  background: linear-gradient(90deg, var(--bg-sunken) 25%, var(--bg-surface) 50%, var(--bg-sunken) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
}
@keyframes shimmer { to { background-position: -200% 0; } }
</style>
