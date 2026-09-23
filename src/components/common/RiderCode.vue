<script setup>
import { useI18n } from 'vue-i18n'
import { cn } from '@/lib/utils'

/* The rider's code (R-001) as a small mono pill — shown wherever a rider
   appears so they can be recognised at a glance (#1). */
const props = defineProps({
  code: { type: String, default: '' },
  class: { type: null, default: '' },
})
const { t } = useI18n()
</script>

<template>
  <span
    v-if="code"
    dir="ltr"
    :title="t('common.riderCode')"
    :class="
      cn(
        'bg-muted text-muted-foreground inline-flex items-center rounded-md px-1.5 py-px font-mono text-[11px] font-semibold tracking-wide tabular-nums',
        props.class,
      )
    "
  >
    {{ code }}
  </span>
</template>
