<script setup>
import { computed } from 'vue'

const props = defineProps({
  value: { type: Number, default: 0 },
  size: { type: Number, default: 132 },
  stroke: { type: Number, default: 12 },
})

const pct = computed(() => Math.max(0, Math.min(100, props.value)))
const radius = computed(() => (props.size - props.stroke) / 2)
const circumference = computed(() => 2 * Math.PI * radius.value)
const offset = computed(() => circumference.value * (1 - pct.value / 100))
const color = computed(() =>
  pct.value >= 100 ? 'var(--success)' : pct.value >= 70 ? 'var(--primary)' : 'var(--orange)',
)
</script>

<template>
  <div class="relative inline-grid place-items-center" :style="{ width: size + 'px', height: size + 'px' }">
    <svg :width="size" :height="size" class="-rotate-90">
      <circle
        :cx="size / 2"
        :cy="size / 2"
        :r="radius"
        fill="none"
        stroke="var(--muted)"
        :stroke-width="stroke"
      />
      <circle
        :cx="size / 2"
        :cy="size / 2"
        :r="radius"
        fill="none"
        :stroke="color"
        :stroke-width="stroke"
        stroke-linecap="round"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="offset"
        class="transition-[stroke-dashoffset] duration-700 ease-out"
      />
    </svg>
    <div class="absolute text-center">
      <span class="block text-2xl font-bold tabular-nums">{{ Math.round(pct) }}%</span>
    </div>
  </div>
</template>
