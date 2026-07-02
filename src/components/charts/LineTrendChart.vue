<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useUiStore } from '@/stores/ui'

const props = defineProps({
  labels: { type: Array, default: () => [] },
  orders: { type: Array, default: () => [] },
  commissions: { type: Array, default: () => [] },
})

const { t } = useI18n()
const ui = useUiStore()

const BLUE = '#1E6FE0'
const ORANGE = '#F47A20'

const series = computed(() => [
  { name: t('dashboard.trendOrders'), type: 'area', data: props.orders },
  { name: t('dashboard.trendCommissions'), type: 'line', data: props.commissions },
])

const options = computed(() => {
  const grid = ui.isDark ? '#ffffff14' : '#0f172a12'
  const text = ui.isDark ? '#cbd5e1' : '#64748b'
  return {
    chart: {
      fontFamily: 'inherit',
      toolbar: { show: false },
      zoom: { enabled: false },
      background: 'transparent',
    },
    theme: { mode: ui.isDark ? 'dark' : 'light' },
    colors: [BLUE, ORANGE],
    stroke: { curve: 'smooth', width: [2.5, 2.5] },
    fill: {
      type: ['gradient', 'solid'],
      gradient: { shadeIntensity: 1, opacityFrom: 0.35, opacityTo: 0.02, stops: [0, 90] },
    },
    dataLabels: { enabled: false },
    markers: { size: 0, hover: { size: 5 } },
    grid: { borderColor: grid, strokeDashArray: 4, padding: { left: 8, right: 8 } },
    xaxis: {
      categories: props.labels,
      labels: { style: { colors: text, fontSize: '12px' } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: [
      { labels: { style: { colors: text }, formatter: (v) => Math.round(v) } },
      { opposite: true, labels: { style: { colors: text }, formatter: (v) => Math.round(v) } },
    ],
    legend: { labels: { colors: text }, markers: { radius: 12 } },
    tooltip: { theme: ui.isDark ? 'dark' : 'light' },
  }
})
</script>

<template>
  <apexchart type="line" height="300" :options="options" :series="series" />
</template>
