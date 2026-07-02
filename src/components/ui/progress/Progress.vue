<script setup>
import { computed } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps({
  value: { type: Number, default: 0 },
  // tailwind bg color class for the indicator
  indicatorClass: { type: String, default: 'bg-primary' },
  class: { type: null, default: '' },
})

const pct = computed(() => Math.max(0, Math.min(100, props.value)))
</script>

<template>
  <div :class="cn('bg-muted relative h-2 w-full overflow-hidden rounded-full', props.class)">
    <div
      class="h-full rounded-full transition-[width] duration-500 ease-out"
      :class="indicatorClass"
      :style="{ width: pct + '%' }"
    />
  </div>
</template>
