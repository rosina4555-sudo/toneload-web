<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="modal-backdrop" @mousedown.self="$emit('close')">
        <div class="modal-card" :class="{ narrow }" role="dialog" aria-modal="true">
          <header class="modal-header">
            <h2 class="font-display">{{ title }}</h2>
            <button v-if="!hideClose" class="close-btn" aria-label="Close" @click="$emit('close')">&times;</button>
          </header>
          <div class="modal-body">
            <slot />
          </div>
          <footer v-if="$slots.footer" class="modal-footer">
            <slot name="footer" />
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { watch, onBeforeUnmount } from 'vue'

const props = defineProps({
  open: Boolean,
  title: { type: String, default: '' },
  narrow: Boolean,
  hideClose: Boolean,
})
const emit = defineEmits(['close'])

function onKeydown(e) {
  if (e.key === 'Escape' && props.open && !props.hideClose) emit('close')
}
watch(() => props.open, (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
  if (open) document.addEventListener('keydown', onKeydown)
  else document.removeEventListener('keydown', onKeydown)
})
onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(10, 25, 47, 0.5);
  backdrop-filter: blur(2px);
}
.modal-card {
  width: min(560px, 100%);
  max-height: calc(100vh - 40px);
  overflow-y: auto;
  background: var(--bg-card);
  border-radius: 10px;
  border: 1px solid var(--border);
  box-shadow: 0 16px 48px rgba(10, 25, 47, 0.18);
}
.modal-card.narrow { width: min(420px, 100%); }

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px 0;
}
.modal-header h2 { font-size: 17px; font-weight: 600; letter-spacing: -0.1px; }
.close-btn {
  border: none;
  background: none;
  font-size: 20px;
  line-height: 1;
  color: var(--text-muted);
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: background 0.14s, color 0.14s;
}
.close-btn:hover { background: var(--bg-surface); color: var(--text-primary); }

.modal-body { padding: 14px 20px 20px; }
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 0 20px 20px;
}

.modal-enter-active, .modal-leave-active { transition: opacity 0.18s ease; }
.modal-enter-active .modal-card, .modal-leave-active .modal-card { transition: transform 0.18s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from .modal-card, .modal-leave-to .modal-card { transform: translateY(10px) scale(0.98); }
</style>
