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
/*
 * Vercel-style status pill: one quiet neutral surface for every state,
 * state communicated through a small colored dot and a tinted label —
 * never through a loud filled chip.
 */
.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 22px;
  padding: 0 10px;
  border-radius: 999px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  font-size: 12px;
  font-weight: 500;
  line-height: 1;
  letter-spacing: -0.1px;
  white-space: nowrap;
}
.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* Neutral surface stays constant; only dot + label take the tone */
.badge--neutral { color: var(--text-secondary); }
.badge--neutral .dot { background: #a3aec2; }

.badge--brand { color: var(--brand-text); }
.badge--brand .dot { background: var(--brand); }

.badge--success { color: var(--success-text); }
.badge--success .dot { background: var(--accent); }

.badge--warning { color: var(--score-mid-text); }
.badge--warning .dot { background: #d97706; }

.badge--danger { color: var(--error-text); }
.badge--danger .dot { background: var(--error-text); }

.badge--info { color: #0369a1; }
.badge--info .dot { background: #0284c7; }
</style>
