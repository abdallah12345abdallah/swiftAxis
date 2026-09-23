<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import ReportShell from '@/components/accounting/shared/ReportShell.vue'
import { DataTable } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { DatePicker } from '@/components/ui/datepicker'
import { Dropdown } from '@/components/ui/dropdown'
import { useCurrency } from '@/composables/useCurrency'
import { useAccountingOptions } from '@/composables/useAccountingOptions'
import { useDateRange } from '@/composables/useDateRange'
import { exportCsv, todayStamp } from '@/lib/export'
import { costCenterBalances } from '@/api/accounting'

const { t } = useI18n()
const { sar, num } = useCurrency()
const opts = useAccountingOptions()
const { from, to, range, params } = useDateRange()
const unit = ref('')
const loading = ref(true)
const data = ref(null)
const unitFilter = computed(() => [{ value: '', label: t('accounting.reports.allUnits') }, ...opts.unitOptions.value])

async function load() {
  loading.value = true
  data.value = await costCenterBalances({ ...params.value, unit: unit.value || undefined })
  loading.value = false
}
onMounted(async () => {
  await opts.load()
  await load()
})
watch([from, to, unit], load)
const money = (v) => sar(v, { decimals: 2 })
const exportRows = () => data.value && exportCsv(`cost-center-balances-${todayStamp()}`, [t('accounting.common.code'), t('ledger.cc.name'), t('ledger.cc.unit'), t('ledger.debit'), t('ledger.credit'), t('accounting.common.expenses'), t('accounting.common.revenue'), t('accounting.common.net')], data.value.rows.map((r) => [r.code, r.name, r.unitName, r.debit, r.credit, r.expenses, r.revenue, r.net]))
</script>

<template>
  <ReportShell :title="t('accounting.screens.costCenterBalances')" :period="`${from} → ${to}`" @export="exportRows">
    <template #filters>
      <DatePicker v-model="range" range class="w-auto min-w-[240px]" />
      <Dropdown v-model="unit" :options="unitFilter" class="w-auto min-w-[220px]" />
    </template>
    <DataTable
      :loading="loading" :rows="data?.rows ?? []" :empty="t('common.noData')"
      :columns="[
        { key: 'name', label: t('ledger.cc.name'), sortable: true },
        { key: 'unitName', label: t('ledger.cc.unit'), hideBelow: 'lg' },
        { key: 'entries', label: t('accounting.common.entries'), align: 'end', hideBelow: 'xl' },
        { key: 'debit', label: t('ledger.debit'), align: 'end', hideBelow: 'md' },
        { key: 'credit', label: t('ledger.credit'), align: 'end', hideBelow: 'md' },
        { key: 'expenses', label: t('accounting.common.expenses'), align: 'end', sortable: true },
        { key: 'revenue', label: t('accounting.common.revenue'), align: 'end', sortable: true },
        { key: 'net', label: t('accounting.common.net'), align: 'end', sortable: true },
      ]"
    >
      <template #cell-name="{ row }"><span dir="ltr" class="font-mono text-xs">{{ row.code }}</span> <span class="font-medium">{{ row.name }}</span><Badge v-if="row.over" variant="danger" class="ms-2">{{ t('ledger.cc.over') }}</Badge></template>
      <template #cell-unitName="{ row }"><span class="text-muted-foreground text-xs">{{ row.unitName }}</span></template>
      <template #cell-entries="{ row }"><span class="tabular-nums">{{ num(row.entries) }}</span></template>
      <template #cell-debit="{ row }"><span class="tabular-nums">{{ row.debit ? money(row.debit) : '' }}</span></template>
      <template #cell-credit="{ row }"><span class="tabular-nums">{{ row.credit ? money(row.credit) : '' }}</span></template>
      <template #cell-expenses="{ row }"><span class="text-danger tabular-nums">{{ row.expenses ? money(row.expenses) : '' }}</span></template>
      <template #cell-revenue="{ row }"><span class="text-success tabular-nums">{{ row.revenue ? money(row.revenue) : '' }}</span></template>
      <template #cell-net="{ row }"><span class="font-semibold tabular-nums" :class="row.net < 0 ? 'text-danger' : 'text-success'">{{ money(row.net) }}</span></template>
    </DataTable>
    <div v-if="data" class="bg-muted/40 flex flex-wrap justify-end gap-6 border-t px-5 py-3 text-sm font-semibold tabular-nums">
      <span>{{ t('accounting.common.expenses') }}: {{ money(data.totals.expenses) }}</span><span>{{ t('accounting.common.revenue') }}: {{ money(data.totals.revenue) }}</span>
    </div>
  </ReportShell>
</template>
