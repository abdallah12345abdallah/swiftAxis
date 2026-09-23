<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import ReportShell from '@/components/accounting/shared/ReportShell.vue'
import { DataTable } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useCurrency } from '@/composables/useCurrency'
import { exportCsv, todayStamp } from '@/lib/export'
import { adminUnitsReport } from '@/api/accounting'

const { t } = useI18n()
const { sar, num } = useCurrency()
const loading = ref(true)
const rows = ref([])
onMounted(async () => {
  rows.value = await adminUnitsReport()
  loading.value = false
})
const exportRows = () => exportCsv(`admin-units-${todayStamp()}`, [t('accounting.common.code'), t('ledger.cc.unit'), t('accounting.common.parent'), t('ledger.tabs.costCenters'), t('accounting.common.expenses'), t('accounting.common.revenue')], rows.value.map((r) => [r.code, r.name, r.parentName ?? '', r.costCenters, r.expenses, r.revenue]))
</script>

<template>
  <ReportShell :title="t('accounting.screens.adminUnitsReport')" @export="exportRows">
    <DataTable
      :loading="loading" :rows="rows" :empty="t('common.noData')"
      :columns="[
        { key: 'code', label: t('accounting.common.code'), sortable: true },
        { key: 'name', label: t('ledger.cc.unit'), sortable: true },
        { key: 'parentName', label: t('accounting.common.parent'), hideBelow: 'md' },
        { key: 'costCenters', label: t('ledger.tabs.costCenters'), align: 'end', hideBelow: 'sm' },
        { key: 'expenses', label: t('accounting.common.expenses'), align: 'end', sortable: true },
        { key: 'revenue', label: t('accounting.common.revenue'), align: 'end', hideBelow: 'lg' },
        { key: 'active', label: t('common.status') },
      ]"
    >
      <template #cell-code="{ row }"><span dir="ltr" class="font-mono text-xs font-semibold">{{ row.code }}</span></template>
      <template #cell-name="{ row }"><span class="font-medium">{{ row.name }}</span></template>
      <template #cell-parentName="{ row }"><span class="text-muted-foreground">{{ row.parentName ?? t('accounting.common.root') }}</span></template>
      <template #cell-costCenters="{ row }"><span class="tabular-nums">{{ num(row.costCenters) }}</span></template>
      <template #cell-expenses="{ row }"><span class="font-semibold tabular-nums">{{ sar(row.expenses, { decimals: 2 }) }}</span></template>
      <template #cell-revenue="{ row }"><span class="tabular-nums">{{ sar(row.revenue, { decimals: 2 }) }}</span></template>
      <template #cell-active="{ row }"><Badge :variant="row.active ? 'success' : 'secondary'">{{ row.active ? t('common.active') : t('common.inactive') }}</Badge></template>
    </DataTable>
  </ReportShell>
</template>
