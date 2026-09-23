<script setup>
import { cn } from '@/lib/utils'

/* Initials fallback, or the rider's uploaded photo when one exists (#1). */
const props = defineProps({
  initials: { type: String, default: '?' },
  src: { type: String, default: '' },
  class: { type: null, default: '' },
})
</script>

<template>
  <img
    v-if="src"
    :src="src"
    alt=""
    :class="cn('ring-border size-9 shrink-0 rounded-full object-cover ring-1', props.class)"
  />
  <div
    v-else
    :class="
      cn(
        'bg-primary/12 text-primary flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold',
        props.class,
      )
    "
  >
    {{ initials }}
  </div>
</template>
