<script setup>
import { computed } from 'vue'
import { cn } from '@/lib/utils'
const props = defineProps({ class: { type: null, default: '' } })
const classes = computed(() => cn('text-muted-foreground text-sm', props.class))
</script>

<template>
  <p :class="classes"><slot /></p>
</template>
