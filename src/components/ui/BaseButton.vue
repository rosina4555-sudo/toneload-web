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
  border-radius: 10px;
  font-family: inherit;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s, border-color 0.15s, color 0.15s, transform 0.1s;
}
.base-btn:active:not(:disabled) { transform: scale(0.98); }
.base-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.base-btn--md { height: 44px; padding: 0 20px; }
.base-btn--sm { height: 36px; padding: 0 14px; font-size: 13px; }

.base-btn--primary { background: var(--brand); color: var(--text-primary); }
.base-btn--primary:hover:not(:disabled) { background: var(--brand-hover); color: #fff; }

.base-btn--ghost { background: transparent; color: var(--text-primary); border-color: var(--border-strong); }
.base-btn--ghost:hover:not(:disabled) { background: var(--bg-surface); border-color: var(--text-muted); }

.base-btn--subtle { background: var(--accent-light); color: var(--accent-text); }
.base-btn--subtle:hover:not(:disabled) { background: #dceeeb; }

.base-btn--danger { background: var(--error-bg); color: var(--error-text); }
.base-btn--danger:hover:not(:disabled) { background: #fde2e2; }

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
