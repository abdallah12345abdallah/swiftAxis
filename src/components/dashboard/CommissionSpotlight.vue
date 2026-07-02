<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ArrowUpRight, ArrowDownRight, Package, Users } from 'lucide-vue-next'
import { useCurrency } from '@/composables/useCurrency'
import Sparkline from './Sparkline.vue'

const props = defineProps({
  value: { type: Number, default: 0 },
  delta: { type: Number, default: 0 },
  orders: { type: Number, default: 0 },
  activeRiders: { type: Number, default: 0 },
  spark: { type: Array, default: () => [] },
})

const { t } = useI18n()
const { sar, num } = useCurrency()
const up = computed(() => props.delta >= 0)
</script>

<template>
  <div class="bg-navy relative flex flex-col justify-between overflow-hidden rounded-2xl p-6 text-white sm:p-7">
    <!-- glow -->
    <div class="bg-orange/25 absolute -end-16 -top-20 size-56 rounded-full blur-[90px]" />
    <div class="bg-primary/30 absolute -start-16 -bottom-24 size-56 rounded-full blur-[90px]" />

    <div class="relative z-10">
      <div class="flex items-start justify-between gap-3">
        <p class="text-sm font-medium text-white/70">{{ t('dashboard.kpi.commissionsDue') }}</p>
        <span
          class="inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-bold"
          :class="up ? 'bg-success/25 text-success' : 'bg-danger/25 text-danger'"
        >
          <component :is="up ? ArrowUpRight : ArrowDownRight" class="size-3.5" />
          {{ Math.abs(delta) }}%
        </span>
      </div>
      <p class="mt-2 text-4xl font-extrabold tracking-tight tabular-nums sm:text-5xl">{{ sar(value) }}</p>
    </div>

    <!-- sparkline -->
    <div class="text-orange relative z-10 my-4">
      <Sparkline :values="spark" :height="56" />
    </div>

    <!-- footer chips -->
    <div class="relative z-10 flex flex-wrap gap-2.5">
      <div class="flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 py-2 backdrop-blur">
        <Package class="size-4 text-white/70" />
        <span class="text-sm font-semibold tabular-nums">{{ num(orders) }}</span>
        <span class="text-xs text-white/55">{{ t('dashboard.kpi.totalOrders') }}</span>
      </div>
      <div class="flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 py-2 backdrop-blur">
        <Users class="size-4 text-white/70" />
        <span class="text-sm font-semibold tabular-nums">{{ num(activeRiders) }}</span>
        <span class="text-xs text-white/55">{{ t('dashboard.kpi.activeRiders') }}</span>
      </div>
    </div>
  </div>
</template>
