<template>
  <span v-if="score == null" class="score-pill score-pill--none">No score yet</span>
  <span v-else class="score-pill" :class="toneClass">{{ score }}</span>
</template>

<script setup>
import { computed } from 'vue'

// Spec §9 sidebar thresholds: green ≥80, amber 60–79, red <60
const props = defineProps({
  score: { type: Number, default: null },
})

const toneClass = computed(() => {
  if (props.score >= 80) return 'score-pill--high'
  if (props.score >= 60) return 'score-pill--mid'
  return 'score-pill--low'
})
</script>

<style scoped>
.score-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  height: 30px;
  padding: 0 10px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.score-pill--high { background: var(--score-high-bg); color: var(--score-high-text); }
.score-pill--mid  { background: var(--score-mid-bg);  color: var(--score-mid-text); }
.score-pill--low  { background: var(--score-low-bg);  color: var(--score-low-text); }
.score-pill--none { background: var(--bg-sunken); color: var(--text-muted); font-weight: 500; font-size: 12px; }
</style>
