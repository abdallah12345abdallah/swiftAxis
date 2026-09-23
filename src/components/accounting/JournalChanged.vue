<script setup>
import { ref, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Ban, Pencil } from 'lucide-vue-next'
import ReportShell from '@/components/accounting/shared/ReportShell.vue'
import { DataTable } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { DatePicker } from '@/components/ui/datepicker'
import { useCurrency } from '@/composables/useCurrency'
import { useDate } from '@/lib/format'
import { useDateRange } from '@/composables/useDateRange'
import { exportCsv, todayStamp } from '@/lib/export'
import { journalChanged } from '@/api/accounting'

/* القيود المعدلة والملغاة — audit view of edited and voided entries. */
const { t } = useI18n()
const { sar } = useCurrency()
const { formatDate } = useDate()
const { from, to, range, params } = useDateRange()
const loading = ref(true)
const rows = ref([])
async function load() {
  loading.value = true
  rows.value = await journalChanged(params.value)
  loading.value = false
}
onMounted(load)
watch([from, to], load)
const exportRows = () => exportCsv(`journal-changed-${todayStamp()}`, [t('journal.docNo'), t('common.date'), t('accounting.reports.change'), t('accounting.reports.changedAt'), t('common.by'), t('common.reason'), t('common.amount')], rows.value.map((e) => [e.ref, e.date, e.change, e.changedAt ?? '', e.changedBy ?? '', e.reason, e.total]))
</script>

<template>
  <ReportShell :title="t('accounting.screens.journalChanged')" :period="`${from} → ${to}`" @export="exportRows">
    <template #filters><DatePicker v-model="range" range class="w-auto min-w-[240px]" /></template>
    <DataTable
      :loading="loading" :rows="rows" :empty="t('accounting.reports.noChanges')" :page-size="15"
      :columns="[
        { key: 'ref', label: t('journal.docNo'), sortable: true },
        { key: 'date', label: t('common.date'), sortable: true },
        { key: 'description', label: t('journal.statement'), hideBelow: 'md' },
        { key: 'change', label: t('accounting.reports.change') },
        { key: 'changedAt', label: t('accounting.reports.changedAt'), hideBelow: 'lg' },
        { key: 'reason', label: t('common.reason'), hideBelow: 'lg' },
        { key: 'total', label: t('common.amount'), align: 'end' },
      ]"
    >
      <template #cell-ref="{ row }"><RouterLink :to="`/ledger/entry/${row.id}`" class="text-primary font-medium tabular-nums hover:underline" dir="ltr">{{ row.ref }}</RouterLink></template>
      <template #cell-date="{ row }"><span class="tabular-nums">{{ formatDate(row.date) }}</span></template>
      <template #cell-description="{ row }"><span class="text-muted-foreground">{{ row.description || '—' }}</span></template>
      <template #cell-change="{ row }"><Badge :variant="row.change === 'voided' ? 'danger' : 'warning'"><component :is="row.change === 'voided' ? Ban : Pencil" class="size-3" /> {{ row.change === 'voided' ? t('journal.voidedBadge') : t('accounting.reports.modified') }}</Badge></template>
      <template #cell-changedAt="{ row }"><span class="text-xs tabular-nums" dir="ltr">{{ row.changedAt?.replace('T', ' ') ?? '—' }}</span><span class="text-muted-foreground ms-1 text-xs">{{ row.changedBy }}</span></template>
      <template #cell-reason="{ row }"><span class="text-muted-foreground text-xs">{{ row.reason || '—' }}</span></template>
      <template #cell-total="{ row }"><span class="font-semibold tabular-nums">{{ sar(row.total, { decimals: 2 }) }}</span></template>
    </DataTable>
  </ReportShell>
</template>
