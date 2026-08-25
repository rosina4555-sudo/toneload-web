<template>
  <div class="dim">
    <div class="dim-head">
      <span class="dim-label">{{ label }}</span>
      <span class="dim-value">{{ value }}</span>
    </div>
    <div class="dim-track"><div class="dim-fill" :style="{ width: value + '%' }" /></div>
  </div>
</template>

<script setup>
defineProps({
  label: { type: String, required: true },
  value: { type: Number, required: true },
})
</script>

<style scoped>
.dim { margin-bottom: 12px; }
.dim-head { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 5px; }
.dim-label { color: var(--text-secondary); }
.dim-value { font-weight: 600; font-variant-numeric: tabular-nums; }
.dim-track { height: 7px; border-radius: 999px; background: var(--bg-sunken); overflow: hidden; }
.dim-fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--brand), #4d94ff);
  transition: width 0.4s ease;
}
</style>
