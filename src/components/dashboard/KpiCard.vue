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
  // accent colour group: 'primary' | 'orange' | 'success' | 'warning'
  accent: { type: String, default: 'primary' },
})

const { t } = useI18n()

const GRAD = {
  primary: 'from-primary to-primary/70',
  orange: 'from-orange to-orange/75',
  success: 'from-success to-success/75',
  warning: 'from-warning to-warning/80',
}
const WATERMARK = {
  primary: 'text-primary',
  orange: 'text-orange',
  success: 'text-success',
  warning: 'text-warning',
}

const gradClass = computed(() => GRAD[props.accent] ?? GRAD.primary)
const iconTextClass = computed(() => (props.accent === 'warning' ? 'text-warning-foreground' : 'text-white'))
const watermarkClass = computed(() => WATERMARK[props.accent] ?? WATERMARK.primary)
const deltaUp = computed(() => (props.delta ?? 0) >= 0)
</script>

<template>
  <Card class="group relative overflow-hidden p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
    <!-- watermark -->
    <component
      :is="icon"
      v-if="icon"
      class="pointer-events-none absolute -top-4 -end-4 size-28 opacity-[0.06] transition-transform duration-300 group-hover:scale-110"
      :class="watermarkClass"
    />

    <div class="relative">
      <div class="flex items-center justify-between gap-3">
        <div
          v-if="icon"
          class="grid size-11 place-items-center rounded-xl bg-gradient-to-br shadow-sm"
          :class="[gradClass, iconTextClass]"
        >
          <component :is="icon" class="size-5" />
        </div>

        <span
          v-if="delta !== null"
          class="inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-bold"
          :class="deltaUp ? 'bg-success/12 text-success' : 'bg-danger/12 text-danger'"
        >
          <component :is="deltaUp ? ArrowUpRight : ArrowDownRight" class="size-3.5" />
          {{ Math.abs(delta) }}%
        </span>
      </div>

      <p class="mt-4 text-3xl font-extrabold tracking-tight tabular-nums">{{ value }}</p>
      <p class="text-muted-foreground mt-1 text-sm font-medium">{{ label }}</p>
    </div>
  </Card>
</template>
