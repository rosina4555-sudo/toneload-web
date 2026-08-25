<template>
  <span class="badge" :class="`badge--${tone}`">
    <span v-if="dot" class="dot" />
    <slot />
  </span>
</template>

<script setup>
defineProps({
  tone: { type: String, default: 'neutral' }, // neutral | brand | success | warning | danger | info
  dot: Boolean,
})
</script>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.1px;
  white-space: nowrap;
}
.dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }

.badge--neutral { background: var(--bg-sunken); color: var(--text-secondary); }
.badge--brand   { background: var(--brand-light); color: var(--brand-text); }
.badge--success { background: var(--success-bg); color: var(--success-text); }
.badge--warning { background: var(--score-mid-bg); color: var(--score-mid-text); }
.badge--danger  { background: var(--error-bg); color: var(--error-text); }
.badge--info    { background: var(--accent-light); color: var(--accent-text); }
</style>
