<template>
  <header class="page-header">
    <div>
      <h1 class="font-display">{{ title }}</h1>
      <p v-if="subtitle">{{ subtitle }}</p>
    </div>
    <div v-if="$slots.actions" class="page-actions">
      <slot name="actions" />
    </div>
  </header>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
})
</script>

<style scoped>
.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 28px;
}
h1 { font-size: 26px; letter-spacing: -0.3px; }
p { color: var(--text-muted); font-size: 14px; margin-top: 4px; }
.page-actions { display: flex; gap: 10px; flex-wrap: wrap; }
</style>
