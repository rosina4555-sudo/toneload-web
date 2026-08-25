<template>
  <span class="brand-avatar" :class="[`size-${size}`]" :style="{ background: gradient }" aria-hidden="true">
    {{ initials }}
  </span>
</template>

<script setup>
import { computed } from 'vue'

/*
 * Shared brand initials avatar. Each brand gets a deterministic gradient
 * picked from a small on-palette set, so lists feel varied yet cohesive
 * and the same brand always renders with its own color identity.
 */
const props = defineProps({
  name: { type: String, required: true },
  size: { type: String, default: 'sm' }, // sm (cards) | lg (detail header)
})

const GRADIENTS = [
  'linear-gradient(135deg, #0066FF 0%, #0047CC 100%)', // brand blue
  'linear-gradient(135deg, #0EA5E9 0%, #0369A1 100%)', // sky
  'linear-gradient(135deg, #6366F1 0%, #4338CA 100%)', // indigo
  'linear-gradient(135deg, #10B981 0%, #059669 100%)', // green
  'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', // amber
]

const initials = computed(() =>
  props.name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase(),
)

const gradient = computed(() => {
  const hash = [...props.name].reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  return GRADIENTS[hash % GRADIENTS.length]
})
</script>

<style scoped>
.brand-avatar {
  display: inline-grid;
  place-items: center;
  border-radius: 50%;
  color: #fff;
  font-family: 'Cabinet Grotesk', sans-serif;
  font-weight: 700;
  letter-spacing: 0.3px;
  flex-shrink: 0;
  user-select: none;
}

.size-sm { width: 40px; height: 40px; font-size: 14px; }
.size-lg { width: 56px; height: 56px; font-size: 19px; }
</style>
