<template>
  <BaseModal :open="open" :title="title" narrow @close="$emit('cancel')">
    <p class="confirm-message">{{ message }}</p>
    <template #footer>
      <button class="btn-cancel" @click="$emit('cancel')">Cancel</button>
      <button class="btn-confirm" :disabled="loading" @click="$emit('confirm')">
        <span v-if="loading" class="spinner" />{{ confirmLabel }}
      </button>
    </template>
  </BaseModal>
</template>

<script setup>
import BaseModal from './BaseModal.vue'

defineProps({
  open: Boolean,
  title: { type: String, default: 'Are you sure?' },
  message: { type: String, required: true },
  confirmLabel: { type: String, default: 'Confirm' },
  loading: Boolean,
})
defineEmits(['confirm', 'cancel'])
</script>

<style scoped>
.confirm-message { color: var(--text-secondary); font-size: 15px; }
.btn-cancel {
  height: 40px;
  padding: 0 18px;
  border-radius: 6px;
  border: 1px solid var(--border-strong);
  background: transparent;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.14s ease;
}
.btn-cancel:hover { background: var(--bg-surface); }
.btn-confirm {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 40px;
  padding: 0 18px;
  border-radius: 6px;
  border: 1px solid var(--error-text);
  background: var(--error-text);
  color: #fff;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.14s ease, border-color 0.14s ease;
}
.btn-confirm:hover:not(:disabled) { background: #b91c1c; border-color: #b91c1c; }
.btn-confirm:disabled { opacity: 0.45; cursor: not-allowed; }
.spinner {
  width: 13px; height: 13px;
  border: 2px solid currentColor; border-top-color: transparent;
  border-radius: 50%; animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
