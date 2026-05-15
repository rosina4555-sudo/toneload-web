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
.input-group { margin-bottom: 20px; width: 100%; }
.label-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
label { font-size: 13px; font-weight: 600; color: #0A192F; }
.input-wrapper { position: relative; display: flex; align-items: center; width: 100%; }
.input-icon { position: absolute; left: 14px; color: #64748B; z-index: 2; }
input {
  width: 100%;
  padding: 12px 12px 12px 42px;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  font-size: 15px;
  transition: all 0.2s;
}
input.input-error { border-color: #DC2626; background-color: #FEF2F2; }
input:focus { outline: none; border-color: #0066FF; box-shadow: 0 0 0 4px rgba(0, 102, 255, 0.1); }
.field-error { color: #DC2626; font-size: 12px; margin-top: 6px; display: flex; align-items: center; gap: 4px; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>