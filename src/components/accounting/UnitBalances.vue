<script setup>
import { ref, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Building2 } from 'lucide-vue-next'
import ReportShell from '@/components/accounting/shared/ReportShell.vue'
import { DataTable } from '@/components/ui/table'
import { DatePicker } from '@/components/ui/datepicker'
import { useCurrency } from '@/composables/useCurrency'
import { useDateRange } from '@/composables/useDateRange'
import { exportCsv, todayStamp } from '@/lib/export'
import { unitBalances } from '@/api/accounting'

const { t } = useI18n()
const { sar, num } = useCurrency()
const { from, to, range, params } = useDateRange()
const loading = ref(true)
const data = ref(null)
async function load() {
  loading.value = true
  data.value = await unitBalances(params.value)
  loading.value = false
}
onMounted(load)
watch([from, to], load)
const money = (v) => sar(v, { decimals: 2 })
const exportRows = () => data.value && exportCsv(`unit-balances-${todayStamp()}`, [t('accounting.common.code'), t('ledger.cc.unit'), t('ledger.tabs.costCenters'), t('accounting.common.expenses'), t('accounting.common.revenue'), t('accounting.common.net')], data.value.rows.map((r) => [r.code, r.name, r.costCenters, r.expenses, r.revenue, r.net]))
</script>

<template>
  <ReportShell :title="t('accounting.screens.unitBalances')" :period="`${from} → ${to}`" @export="exportRows">
    <template #filters><DatePicker v-model="range" range class="w-auto min-w-[240px]" /></template>
    <DataTable
      :loading="loading" :rows="data?.rows ?? []" :empty="t('common.noData')"
      :columns="[
        { key: 'name', label: t('ledger.cc.unit'), sortable: true },
        { key: 'parentName', label: t('accounting.common.parent'), hideBelow: 'lg' },
        { key: 'costCenters', label: t('ledger.tabs.costCenters'), align: 'end', hideBelow: 'md' },
        { key: 'expenses', label: t('accounting.common.expenses'), align: 'end', sortable: true },
        { key: 'revenue', label: t('accounting.common.revenue'), align: 'end', sortable: true },
        { key: 'net', label: t('accounting.common.net'), align: 'end', sortable: true },
      ]"
    >
      <template #cell-name="{ row }"><span class="inline-flex items-center gap-2 font-medium"><Building2 class="text-muted-foreground size-4" /><span dir="ltr" class="font-mono text-xs">{{ row.code }}</span> {{ row.name }}</span></template>
      <template #cell-parentName="{ row }"><span class="text-muted-foreground text-xs">{{ row.parentName ?? '—' }}</span></template>
      <template #cell-costCenters="{ row }"><span class="tabular-nums">{{ num(row.costCenters) }}</span></template>
      <template #cell-expenses="{ row }"><span class="text-danger tabular-nums">{{ row.expenses ? money(row.expenses) : '' }}</span></template>
      <template #cell-revenue="{ row }"><span class="text-success tabular-nums">{{ row.revenue ? money(row.revenue) : '' }}</span></template>
      <template #cell-net="{ row }"><span class="font-semibold tabular-nums" :class="row.net < 0 ? 'text-danger' : 'text-success'">{{ money(row.net) }}</span></template>
    </DataTable>
    <div v-if="data" class="bg-muted/40 flex flex-wrap justify-end gap-6 border-t px-5 py-3 text-sm font-semibold tabular-nums">
      <span>{{ t('accounting.common.expenses') }}: {{ money(data.totals.expenses) }}</span><span>{{ t('accounting.common.revenue') }}: {{ money(data.totals.revenue) }}</span><span>{{ t('accounting.common.net') }}: {{ money(data.totals.net) }}</span>
    </div>
  </ReportShell>
</template>
