<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useUiStore } from '@/stores/ui'

const props = defineProps({
  // [{ name, orders, goal }]
  riders: { type: Array, default: () => [] },
})

const emit = defineEmits(['select'])

const { t } = useI18n()
const ui = useUiStore()

const GREEN = '#16A34A'
const RED = '#DC2626'

const series = computed(() => [
  { name: t('common.orders'), data: props.riders.map((r) => r.orders) },
])

// green when goal met, red when below (US-022)
const barColors = computed(() =>
  props.riders.map((r) => (r.orders >= r.goal ? GREEN : RED)),
)

const options = computed(() => {
  const text = ui.isDark ? '#cbd5e1' : '#64748b'
  const grid = ui.isDark ? '#ffffff14' : '#0f172a12'
  return {
    chart: {
      fontFamily: 'inherit',
      toolbar: { show: false },
      background: 'transparent',
      events: {
        dataPointSelection: (_e, _ctx, cfg) => {
          const r = props.riders[cfg.dataPointIndex]
          if (r) emit('select', r)
        },
      },
    },
    theme: { mode: ui.isDark ? 'dark' : 'light' },
    plotOptions: {
      bar: { distributed: true, borderRadius: 6, columnWidth: '55%' },
    },
    colors: barColors.value,
    dataLabels: { enabled: false },
    legend: { show: false },
    grid: { borderColor: grid, strokeDashArray: 4 },
    xaxis: {
      categories: props.riders.map((r) => r.name),
      labels: { style: { colors: text, fontSize: '11px' }, rotate: -35, trim: true },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: { labels: { style: { colors: text } } },
    tooltip: { theme: ui.isDark ? 'dark' : 'light' },
  }
})
</script>

<template>
  <apexchart type="bar" height="300" :options="options" :series="series" />
</template>
