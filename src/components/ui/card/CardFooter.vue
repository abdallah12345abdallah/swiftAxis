<script setup>
import { computed } from 'vue'
import { cn } from '@/lib/utils'
const props = defineProps({ class: { type: null, default: '' } })
const classes = computed(() => cn('flex items-center p-5 pt-0', props.class))
</script>

<template>
  <div :class="classes"><slot /></div>
</template>
