<script setup>
import { computed } from 'vue'
import { cn } from '@/lib/utils'
const props = defineProps({ class: { type: null, default: '' } })
/* Flat card: white surface, a faint hairline border, no drop shadow (only
   floating layers such as menus, dialogs and toasts cast shadows). */
const classes = computed(() =>
  cn('bg-card text-card-foreground border-border/70 rounded-2xl border', props.class),
)
</script>

<template>
  <div :class="classes"><slot /></div>
</template>
