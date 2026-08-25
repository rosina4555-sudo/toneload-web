<template>
  <div class="stat-card">
    <div class="stat-top">
      <span class="stat-label">{{ label }}</span>
      <div v-if="icon" class="stat-icon"><component :is="icon" :size="18" /></div>
    </div>
    <div class="stat-value font-display">
      <template v-if="loading"><span class="skeleton value-skeleton" /></template>
      <template v-else>{{ value ?? '—' }}<small v-if="suffix" class="stat-suffix"> {{ suffix }}</small></template>
    </div>
    <p v-if="hint" class="stat-hint">{{ hint }}</p>
    <slot name="extra" />
  </div>
</template>

<script setup>
defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], default: null },
  suffix: { type: String, default: '' },
  hint: { type: String, default: '' },
  icon: { type: [Object, Function], default: null },
  loading: Boolean,
})
</script>

<style scoped>
.stat-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 16px;
}
.stat-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.stat-label { font-size: 12px; font-weight: 500; color: var(--text-muted); }
.stat-icon {
  display: grid; place-items: center;
  width: 32px; height: 32px;
  border-radius: 8px;
  background: var(--brand-light);
  color: var(--brand-text);
}
.stat-value { font-size: 26px; font-weight: 700; margin-top: 8px; letter-spacing: -0.4px; }
.stat-suffix { font-size: 13px; font-weight: 500; color: var(--text-muted); }
.stat-hint { font-size: 12px; color: var(--text-muted); margin-top: 3px; }

.skeleton {
  display: inline-block;
  background: linear-gradient(90deg, var(--bg-sunken) 25%, var(--bg-surface) 50%, var(--bg-sunken) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
  border-radius: 6px;
}
.value-skeleton { width: 60px; height: 26px; }
@keyframes shimmer { to { background-position: -200% 0; } }
</style>
