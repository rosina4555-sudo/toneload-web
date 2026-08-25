<template>
  <Teleport to="body">
    <div class="toast-host" aria-live="polite">
      <TransitionGroup name="toast">
        <div v-for="t in toasts" :key="t.id" class="toast" :class="`toast--${t.kind}`" @click="dismiss(t.id)">
          <span class="toast-dot" />
          {{ t.message }}
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { useToast } from '@/composables/useToast'

const { toasts, dismiss } = useToast()
</script>

<style scoped>
.toast-host {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 2000;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.toast {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 260px;
  max-width: 380px;
  padding: 12px 16px;
  border-radius: 12px;
  background: var(--bg-dark);
  color: var(--text-on-dark);
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 12px 32px rgba(10, 25, 47, 0.3);
  cursor: pointer;
}
.toast-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.toast--success .toast-dot { background: var(--accent); }
.toast--error   .toast-dot { background: var(--error-text); }
.toast--info    .toast-dot { background: var(--brand); }

.toast-enter-active, .toast-leave-active { transition: all 0.25s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(10px); }
</style>
