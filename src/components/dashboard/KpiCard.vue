<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ArrowUpRight, ArrowDownRight } from 'lucide-vue-next'
import { Card } from '@/components/ui/card'

const props = defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], required: true },
  delta: { type: Number, default: null },
  icon: { type: [Object, Function], default: null },
  // accent colour class group: 'primary' | 'orange' | 'success' | 'warning'
  accent: { type: String, default: 'primary' },
})

const { t } = useI18n()

const accentClass = computed(
  () =>
    ({
      primary: 'bg-primary/12 text-primary',
      orange: 'bg-orange/12 text-orange',
      success: 'bg-success/12 text-success',
      warning: 'bg-warning/15 text-warning-foreground',
    })[props.accent] ?? 'bg-primary/12 text-primary',
)

const deltaUp = computed(() => (props.delta ?? 0) >= 0)
</script>

<template>
  <Card class="p-5">
    <div class="flex items-start justify-between gap-3">
      <div class="space-y-2">
        <p class="text-muted-foreground text-sm font-medium">{{ label }}</p>
        <p class="text-2xl font-bold tracking-tight tabular-nums">{{ value }}</p>
      </div>
      <div v-if="icon" :class="accentClass" class="flex size-11 items-center justify-center rounded-xl">
        <component :is="icon" class="size-5" />
      </div>
    </div>

    <div v-if="delta !== null" class="mt-3 flex items-center gap-1.5 text-xs">
      <span
        class="inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-semibold"
        :class="deltaUp ? 'bg-success/12 text-success' : 'bg-danger/12 text-danger'"
      >
        <component :is="deltaUp ? ArrowUpRight : ArrowDownRight" class="size-3.5" />
        {{ Math.abs(delta) }}%
      </span>
      <span class="text-muted-foreground">{{ t('common.vsPrev') }}</span>
    </div>
  </Card>
</template>
