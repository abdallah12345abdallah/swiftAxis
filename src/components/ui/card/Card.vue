<script setup>
import { computed } from 'vue'
import { cn } from '@/lib/utils'
const props = defineProps({ class: { type: null, default: '' } })
const classes = computed(() =>
  cn('bg-card text-card-foreground rounded-2xl border shadow-sm', props.class),
)
</script>

<template>
  <div :class="classes"><slot /></div>
</template>
