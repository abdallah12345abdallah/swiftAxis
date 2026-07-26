<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useUiStore } from '@/stores/ui'
import { EXPENSE_TYPES } from '@/api/fixtures'

const props = defineProps({
  // { categories: [...buckets], series: [{ type, data }], totalsByType: [{ type, total }] }
  breakdown: { type: Object, default: null },
})

const { locale } = useI18n()
const ui = useUiStore()

// Apex can't read CSS tokens — same brand-hex exception as LineTrendChart
const TYPE_COLORS = {
  fuel: '#1E6FE0',
  maintenance: '#F47A20',
  insurance: '#16A34A',
  registration: '#8B5CF6',
  fines: '#DC2626',
  other: '#64748B',
}

const typeLabel = (k) => EXPENSE_TYPES[k]?.[locale.value] ?? EXPENSE_TYPES[k]?.ar ?? k

const series = computed(() =>
  (props.breakdown?.series ?? []).map((s) => ({ name: typeLabel(s.type), data: s.data })),
)

const options = computed(() => {
  const text = ui.isDark ? '#cbd5e1' : '#64748b'
  const grid = ui.isDark ? '#ffffff14' : '#0f172a12'
  return {
    chart: { fontFamily: 'inherit', toolbar: { show: false }, background: 'transparent', stacked: true },
    theme: { mode: ui.isDark ? 'dark' : 'light' },
    colors: (props.breakdown?.series ?? []).map((s) => TYPE_COLORS[s.type] ?? TYPE_COLORS.other),
    plotOptions: { bar: { borderRadius: 6, columnWidth: '45%' } },
    dataLabels: { enabled: false },
    legend: { labels: { colors: text } },
    grid: { borderColor: grid, strokeDashArray: 4 },
    xaxis: {
      categories: props.breakdown?.categories ?? [],
      labels: { style: { colors: text, fontSize: '11px' } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: { labels: { style: { colors: text } } },
    tooltip: { theme: ui.isDark ? 'dark' : 'light' },
  }
})
</script>

<template>
  <apexchart type="bar" height="280" :options="options" :series="series" />
</template>
