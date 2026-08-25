<template>
  <div class="input-group">
    <div class="label-row">
      <label :for="id">{{ label }}</label>
      <slot name="label-right"></slot>
    </div>
    <div class="input-wrapper">
      <component :is="icon" class="input-icon" :size="18" />
      <input 
        :id="id"
        :type="type" 
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        :placeholder="placeholder" 
        :class="{ 'input-error': error }"
      />
      <slot name="input-right"></slot>
    </div>
    <Transition name="fade">
      <span v-if="error" class="field-error">
        <PhWarningCircle :size="14" weight="fill" />
        {{ error }}
      </span>
    </Transition>
  </div>
</template>

<script setup>
import { PhWarningCircle } from "@phosphor-icons/vue"
defineProps(['label', 'modelValue', 'error', 'type', 'placeholder', 'icon', 'id'])
defineEmits(['update:modelValue'])
</script>

<style scoped>
.input-group { margin-bottom: 18px; width: 100%; }
.label-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
label { font-size: 13px; font-weight: 600; color: var(--text-primary); }
.input-wrapper { position: relative; display: flex; align-items: center; width: 100%; }
.input-icon { position: absolute; left: 12px; color: var(--text-muted); z-index: 2; }
input {
  width: 100%;
  height: 40px;
  padding: 0 12px 0 40px;
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  background: var(--bg-card);
  color: var(--text-primary);
  transition: border-color 0.14s, box-shadow 0.14s;
}
input.input-error { border-color: var(--error-text); background: var(--error-bg); }
input:hover { border-color: var(--border-strong); }
input:focus { outline: none; border-color: var(--brand); box-shadow: 0 0 0 2px rgba(0,102,255,0.08); }
.field-error { color: var(--error-text); font-size: 12px; margin-top: 5px; display: flex; align-items: center; gap: 4px; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>