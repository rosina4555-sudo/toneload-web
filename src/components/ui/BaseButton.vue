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
/*
 * Vercel-style buttons: crisp 6px radii, medium weight, flat fills,
 * hairline borders, restrained shadows, clear focus rings.
 */
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
  box-shadow: 0 0 0 2px var(--bg-card), 0 0 0 4px rgba(0, 102, 255, 0.55);
}
.base-btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* ── Sizes ─────────────────────────────────────────────── */
.base-btn--md { height: 40px; padding: 0 18px; }
.base-btn--sm { height: 32px; padding: 0 13px; font-size: 13px; }

/* ── Primary — solid brand blue ────────────────────────── */
.base-btn--primary {
  background: var(--brand);
  color: #fff;
}
.base-btn--primary:hover:not(:disabled) {
  background: var(--brand-hover);
}

/* ── Secondary / ghost — bordered white ────────────────── */
.base-btn--ghost {
  background: var(--bg-card);
  color: var(--text-primary);
  border-color: var(--border-strong);
  box-shadow: 0 1px 2px rgba(10, 25, 47, 0.04);
}
.base-btn--ghost:hover:not(:disabled) {
  background: var(--bg-page);
}

/* ── Subtle — quiet tinted accent ──────────────────────── */
.base-btn--subtle {
  background: var(--accent-light);
  color: var(--accent-text);
  border-color: transparent;
}
.base-btn--subtle:hover:not(:disabled) {
  background: #b2f0d4;
}

/* ── Danger — bordered red ─────────────────────────────── */
.base-btn--danger {
  background: var(--error-bg);
  color: var(--error-text);
  border-color: var(--error-border);
}
.base-btn--danger:hover:not(:disabled) {
  background: var(--error-border);
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
