<script setup>
import { cn } from '@/lib/utils'

const props = defineProps({
  initials: { type: String, default: '?' },
  class: { type: null, default: '' },
})
</script>

<template>
  <div
    :class="
      cn(
        'bg-primary/12 text-primary flex size-9 items-center justify-center rounded-full text-sm font-bold',
        props.class,
      )
    "
  >
    {{ initials }}
  </div>
</template>
