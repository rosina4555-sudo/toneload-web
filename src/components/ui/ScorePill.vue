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
  min-width: 40px;
  height: 26px;
  padding: 0 10px;
  border-radius: 999px;
  border: 1px solid transparent;
  font-size: 13px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
.score-pill--high { background: var(--score-high-bg); border-color: rgba(5, 150, 105, 0.2); color: var(--score-high-text); }
.score-pill--mid  { background: #fef3c7; border-color: rgba(217, 119, 6, 0.22); color: var(--score-mid-text); }
.score-pill--low  { background: var(--score-low-bg); border-color: var(--error-border); color: var(--score-low-text); }
.score-pill--none { background: var(--bg-surface); border-color: var(--border); color: var(--text-muted); font-weight: 500; font-size: 11.5px; }
</style>
