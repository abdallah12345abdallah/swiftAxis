<script setup>
import { computed } from 'vue'
import { cn } from '@/lib/utils'
const props = defineProps({ class: { type: null, default: '' } })
const classes = computed(() => cn('flex flex-col gap-1.5 p-5', props.class))
</script>

<template>
  <div :class="classes"><slot /></div>
</template>
