<script setup>
import { computed } from 'vue'
import { cn } from '@/lib/utils'
const props = defineProps({ class: { type: null, default: '' } })
const classes = computed(() => cn('text-base leading-snug font-bold tracking-tight', props.class))
</script>

<template>
  <h3 :class="classes"><slot /></h3>
</template>
