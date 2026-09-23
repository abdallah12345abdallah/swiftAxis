<script setup>
import { ref, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Lock } from 'lucide-vue-next'
import ReportShell from '@/components/accounting/shared/ReportShell.vue'
import { DataTable } from '@/components/ui/table'
import { Dropdown } from '@/components/ui/dropdown'
import { useCurrency } from '@/composables/useCurrency'
import { useAccountingOptions } from '@/composables/useAccountingOptions'
import { exportCsv } from '@/lib/export'
import { monthlySummary } from '@/api/accounting'

/* ملخص شهري لحركة الحساب — 12 rows: opening, debit, credit, closing per month. */
const { t } = useI18n()
const { sar } = useCurrency()
const opts = useAccountingOptions()
const account = ref('')
const year = ref('')
const loading = ref(false)
const data = ref(null)

async function load() {
  if (!account.value || !year.value) return
  loading.value = true
  data.value = await monthlySummary(account.value, year.value)
  loading.value = false
}
onMounted(async () => {
  await opts.load()
  year.value = opts.defaultYear.value
  account.value = 'cash'
  await load()
})
watch([account, year], load)
const money = (v) => sar(v, { decimals: 2 })
const exportRows = () => data.value && exportCsv(`monthly-summary-${account.value}-${year.value}`, [t('accounting.common.month'), t('accounting.common.opening'), t('ledger.debit'), t('ledger.credit'), t('accounting.common.closing')], data.value.rows.map((r) => [r.label, r.opening, r.debit, r.credit, r.closing]))
</script>

<template>
  <ReportShell :title="t('accounting.screens.monthlySummary')" :period="data ? data.year.name : ''" @export="exportRows">
    <template #filters>
      <Dropdown v-model="account" :options="opts.allAccountOptions.value" searchable class="w-auto min-w-[280px]" />
      <Dropdown v-model="year" :options="opts.yearOptions.value" class="w-auto min-w-[180px]" />
    </template>
    <div v-if="data" class="bg-muted/40 flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3 text-sm">
      <span class="font-semibold"><span dir="ltr" class="font-mono">{{ data.account.code }}</span> — {{ data.account.name }}</span>
      <span>{{ t('accounting.common.opening') }}: <b class="tabular-nums">{{ money(data.opening) }}</b></span>
    </div>
    <DataTable
      :loading="loading" :rows="data?.rows ?? []" row-key="ym" :empty="t('common.noData')"
      :columns="[
        { key: 'label', label: t('accounting.common.month') },
        { key: 'opening', label: t('accounting.common.opening'), align: 'end' },
        { key: 'debit', label: t('ledger.debit'), align: 'end' },
        { key: 'credit', label: t('ledger.credit'), align: 'end' },
        { key: 'closing', label: t('accounting.common.closing'), align: 'end' },
      ]"
    >
      <template #cell-label="{ row }"><span class="inline-flex items-center gap-1.5 font-medium">{{ row.label }} <Lock v-if="row.closed" class="text-muted-foreground size-3" /></span></template>
      <template #cell-opening="{ row }"><span class="text-muted-foreground tabular-nums">{{ money(row.opening) }}</span></template>
      <template #cell-debit="{ row }"><span class="tabular-nums">{{ row.debit ? money(row.debit) : '' }}</span></template>
      <template #cell-credit="{ row }"><span class="tabular-nums">{{ row.credit ? money(row.credit) : '' }}</span></template>
      <template #cell-closing="{ row }"><span class="font-semibold tabular-nums">{{ money(row.closing) }}</span></template>
    </DataTable>
    <div v-if="data" class="bg-muted/40 flex flex-wrap justify-between gap-3 border-t px-5 py-3 text-sm font-semibold tabular-nums">
      <span>{{ t('accounting.common.closing') }}: {{ money(data.closing) }}</span>
      <span class="flex gap-6"><span>{{ t('ledger.debit') }}: {{ money(data.totalDebit) }}</span><span>{{ t('ledger.credit') }}: {{ money(data.totalCredit) }}</span></span>
    </div>
  </ReportShell>
</template>
