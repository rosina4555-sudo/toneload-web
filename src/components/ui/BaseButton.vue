<template>
  <button :type="type" :disabled="disabled || loading" class="base-btn" :class="[`base-btn--${variant}`, `base-btn--${size}`]">
    <span v-if="loading" class="spinner" aria-hidden="true"></span>
    <slot />
  </button>
</template>

<script setup>
defineProps({
  variant: { type: String, default: 'primary' }, // primary | ghost | subtle | danger
  size: { type: String, default: 'md' }, // sm | md
  type: { type: String, default: 'button' },
  disabled: Boolean,
  loading: Boolean,
})
</script>

<style scoped>
.base-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 1px solid transparent;
  border-radius: 6px;
  font-family: inherit;
  font-weight: 500;
  font-size: 14px;
  letter-spacing: -0.15px;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.14s ease, border-color 0.14s ease, color 0.14s ease,
    box-shadow 0.14s ease;
}
.base-btn:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px var(--bg-card), 0 0 0 4px rgba(0, 102, 255, 0.4);
}
.base-btn:disabled { opacity: 0.45; cursor: not-allowed; }

.base-btn--md { height: 40px; padding: 0 18px; }
.base-btn--sm { height: 32px; padding: 0 14px; font-size: 13px; }

.base-btn--primary {
  background: var(--brand);
  color: #fff;
  border-color: var(--brand);
}
.base-btn--primary:hover:not(:disabled) {
  background: var(--brand-hover);
  border-color: var(--brand-hover);
}

.base-btn--ghost {
  background: transparent;
  color: var(--text-primary);
  border-color: var(--border-strong);
}
.base-btn--ghost:hover:not(:disabled) {
  background: var(--bg-surface);
}

.base-btn--subtle {
  background: var(--brand-light);
  color: var(--brand-text);
  border-color: transparent;
}
.base-btn--subtle:hover:not(:disabled) {
  background: #d6e8ff;
}

.base-btn--danger {
  background: var(--error-bg);
  color: var(--error-text);
  border-color: var(--error-border);
}
.base-btn--danger:hover:not(:disabled) {
  background: #fecaca;
}

.spinner {
  width: 14px;
  height: 14px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
