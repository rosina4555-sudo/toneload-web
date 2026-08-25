<template>
  <div class="empty-state">
    <div class="empty-icon"><slot name="icon"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="4" width="18" height="16" rx="3"/><path d="M3 9h18M9 20V9"/></svg></slot></div>
    <h3>{{ title }}</h3>
    <p v-if="description">{{ description }}</p>
    <div v-if="$slots.action" class="empty-action">
      <slot name="action" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  description: { type: String, default: '' },
})
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 48px 24px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-card);
}
.empty-icon {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  border-radius: 10px;
  background: var(--brand-light);
  color: var(--brand-text);
  margin-bottom: 14px;
}
h3 {
  font-family: 'Cabinet Grotesk', sans-serif;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: -0.1px;
}
p {
  color: var(--text-muted);
  font-size: 13px;
  margin-top: 5px;
  max-width: 380px;
  line-height: 1.5;
}
.empty-action { margin-top: 16px; }
</style>
