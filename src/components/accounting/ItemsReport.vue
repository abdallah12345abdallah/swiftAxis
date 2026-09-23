<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import ReportShell from '@/components/accounting/shared/ReportShell.vue'
import { DataTable } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useCurrency } from '@/composables/useCurrency'
import { exportCsv, todayStamp } from '@/lib/export'
import { itemsReport } from '@/api/accounting'

const { t, locale } = useI18n()
const { num } = useCurrency()
const loading = ref(true)
const rows = ref([])
onMounted(async () => {
  rows.value = await itemsReport()
  loading.value = false
})
const exportRows = () => exportCsv(`statement-items-${todayStamp()}`, [t('accounting.common.code'), t('common.name'), t('accounting.items.statement'), t('accounting.common.section'), t('accounting.items.linked')], rows.value.map((i) => [i.code, i.name, i.statement, t(`accounting.sections.${i.section}`), i.accountNames.join(' | ')]))
</script>

<template>
  <ReportShell :title="t('accounting.screens.itemsReport')" @export="exportRows">
    <DataTable
      :loading="loading" :rows="rows" :empty="t('common.noData')"
      :columns="[
        { key: 'code', label: t('accounting.common.code'), sortable: true },
        { key: 'name', label: t('common.name'), sortable: true },
        { key: 'statement', label: t('accounting.items.statement') },
        { key: 'section', label: t('accounting.common.section'), hideBelow: 'md' },
        { key: 'accountNames', label: t('accounting.items.linked') },
      ]"
    >
      <template #cell-code="{ row }"><span dir="ltr" class="font-mono text-xs font-semibold">{{ row.code }}</span></template>
      <template #cell-name="{ row }"><span class="font-medium">{{ locale === 'ar' ? row.name : row.en }}</span></template>
      <template #cell-statement="{ row }"><Badge :variant="row.statement === 'income' ? 'success' : 'default'">{{ row.statement === 'income' ? t('accounting.items.income') : t('accounting.items.balance') }}</Badge></template>
      <template #cell-section="{ row }"><span class="text-muted-foreground text-xs">{{ t(`accounting.sections.${row.section}`) }}</span></template>
      <template #cell-accountNames="{ row }">
        <div class="flex flex-wrap gap-1"><Badge v-for="n in row.accountNames" :key="n" variant="secondary">{{ n }}</Badge><span v-if="!row.accountNames.length" class="text-muted-foreground text-xs">{{ num(0) }}</span></div>
      </template>
    </DataTable>
  </ReportShell>
</template>
