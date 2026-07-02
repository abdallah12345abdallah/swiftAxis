<script setup>
import { computed } from 'vue'
import { cn } from '@/lib/utils'
const props = defineProps({ class: { type: null, default: '' } })
const classes = computed(() => cn('bg-muted animate-pulse rounded-md', props.class))
</script>

<template>
  <div :class="classes" />
</template>
