<template>
  <RouterLink :to="`/dashboard/brands/${brand.id}`" class="brand-card">
    <div class="brand-top">
      <BrandAvatar :name="brand.name" size="sm" />
      <BaseBadge :tone="statusTone" :dot="brand.identity_status === 'building'">{{ statusLabel }}</BaseBadge>
    </div>

    <h3 class="font-display">{{ brand.name }}</h3>
    <p v-if="brand.description" class="brand-desc">{{ brand.description }}</p>

    <div class="brand-meta">
      <ScorePill :score="brand.alignment_avg" />
      <span class="meta-text">
        <template v-if="brand.active_version">{{ brand.active_version }} · {{ corpusLabel }}</template>
        <template v-else>Identity building…</template>
      </span>
    </div>
  </RouterLink>
</template>

<script setup>
import { computed } from 'vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import BrandAvatar from '@/components/dashboard/BrandAvatar.vue'
import ScorePill from '@/components/ui/ScorePill.vue'

const props = defineProps({
  brand: { type: Object, required: true },
})

const statusLabel = computed(() => ({
  ready: 'Ready',
  building: 'Building',
  pending: 'Queued',
  failed: 'Failed',
}[props.brand.identity_status] ?? props.brand.identity_status))
const statusTone = computed(() => ({
  ready: 'success',
  building: 'info',
  pending: 'neutral',
  failed: 'danger',
}[props.brand.identity_status] ?? 'neutral'))
const corpusLabel = computed(() =>
  props.brand.corpus_mode === 'large_corpus' ? 'large corpus' : 'small corpus',
)
</script>

<style scoped>
.brand-card {
  display: flex;
  flex-direction: column;
  padding: 20px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  text-decoration: none;
  color: inherit;
  transition: box-shadow 0.15s, transform 0.15s, border-color 0.15s;
}
.brand-card:hover {
  transform: translateY(-2px);
  border-color: var(--border-strong);
  box-shadow: 0 6px 20px rgba(10, 25, 47, 0.08);
}

.brand-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
h3 { font-size: 17px; letter-spacing: -0.2px; }
.brand-desc {
  font-size: 13px;
  color: var(--text-muted);
  margin-top: 4px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.brand-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: auto;   /* pin to card bottom */
  padding-top: 14px;
  border-top: 1px solid var(--border);
}
.meta-text { font-size: 12.5px; color: var(--text-muted); }
</style>
