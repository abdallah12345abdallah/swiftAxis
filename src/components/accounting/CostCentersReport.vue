<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import ReportShell from '@/components/accounting/shared/ReportShell.vue'
import { DataTable } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useCurrency } from '@/composables/useCurrency'
import { exportCsv, todayStamp } from '@/lib/export'
import { costCentersReport } from '@/api/accounting'

const { t } = useI18n()
const { sar, num } = useCurrency()
const loading = ref(true)
const rows = ref([])
onMounted(async () => {
  rows.value = await costCentersReport()
  loading.value = false
})
const exportRows = () => exportCsv(`cost-centers-${todayStamp()}`, [t('accounting.common.code'), t('ledger.cc.name'), t('ledger.cc.unit'), t('ledger.cc.budget'), t('accounting.common.expenses'), t('common.status')], rows.value.map((r) => [r.code, r.name, r.unitName, r.budget, r.expenses, r.active ? t('common.active') : t('common.inactive')]))
</script>

<template>
  <ReportShell :title="t('accounting.screens.costCentersReport')" @export="exportRows">
    <DataTable
      :loading="loading" :rows="rows" :empty="t('common.noData')"
      :columns="[
        { key: 'code', label: t('accounting.common.code'), sortable: true },
        { key: 'name', label: t('ledger.cc.name'), sortable: true },
        { key: 'unitName', label: t('ledger.cc.unit'), hideBelow: 'md' },
        { key: 'budget', label: t('ledger.cc.budget'), align: 'end', hideBelow: 'lg' },
        { key: 'expenses', label: t('accounting.common.expenses'), align: 'end', sortable: true },
        { key: 'entries', label: t('accounting.common.entries'), align: 'end', hideBelow: 'xl' },
        { key: 'active', label: t('common.status') },
      ]"
    >
      <template #cell-code="{ row }"><span dir="ltr" class="font-mono text-xs font-semibold">{{ row.code }}</span></template>
      <template #cell-name="{ row }"><span class="font-medium">{{ row.name }}</span><Badge v-if="row.vehicleId" variant="secondary" class="ms-2">{{ t('nav.vehicles') }}</Badge></template>
      <template #cell-unitName="{ row }"><span class="text-muted-foreground">{{ row.unitName }}</span></template>
      <template #cell-budget="{ row }"><span class="tabular-nums">{{ row.budget ? sar(row.budget) : '—' }}</span></template>
      <template #cell-expenses="{ row }"><span class="font-semibold tabular-nums" :class="row.over ? 'text-danger' : ''">{{ sar(row.expenses, { decimals: 2 }) }}</span></template>
      <template #cell-entries="{ row }"><span class="tabular-nums">{{ num(row.entries) }}</span></template>
      <template #cell-active="{ row }"><Badge :variant="row.active ? 'success' : 'secondary'">{{ row.active ? t('common.active') : t('common.inactive') }}</Badge></template>
    </DataTable>
  </ReportShell>
</template>
