<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useUiStore } from '@/stores/ui'

const props = defineProps({
  labels: { type: Array, default: () => [] },
  orders: { type: Array, default: () => [] },
  goal: { type: Number, default: 0 },
})

const { t } = useI18n()
const ui = useUiStore()
const BLUE = '#1E6FE0'

const series = computed(() => [{ name: t('common.orders'), data: props.orders }])

const options = computed(() => {
  const text = ui.isDark ? '#cbd5e1' : '#64748b'
  const grid = ui.isDark ? '#ffffff14' : '#0f172a12'
  return {
    chart: { fontFamily: 'inherit', toolbar: { show: false }, background: 'transparent' },
    theme: { mode: ui.isDark ? 'dark' : 'light' },
    colors: [BLUE],
    plotOptions: { bar: { borderRadius: 6, columnWidth: '50%' } },
    dataLabels: { enabled: false },
    grid: { borderColor: grid, strokeDashArray: 4 },
    xaxis: {
      categories: props.labels,
      labels: { style: { colors: text, fontSize: '11px' } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: { labels: { style: { colors: text } } },
    annotations: props.goal
      ? {
          yaxis: [
            {
              y: props.goal,
              borderColor: '#F47A20',
              strokeDashArray: 5,
              label: {
                text: `${t('common.target')}: ${props.goal}`,
                style: { background: '#F47A20', color: '#fff' },
              },
            },
          ],
        }
      : {},
    tooltip: { theme: ui.isDark ? 'dark' : 'light' },
  }
})
</script>

<template>
  <apexchart type="bar" height="260" :options="options" :series="series" />
</template>
