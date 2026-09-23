<script setup>
import { ref, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Folder, FileText } from 'lucide-vue-next'
import ReportShell from '@/components/accounting/shared/ReportShell.vue'
import { DataTable } from '@/components/ui/table'
import { DatePicker } from '@/components/ui/datepicker'
import { Dropdown } from '@/components/ui/dropdown'
import { useCurrency } from '@/composables/useCurrency'
import { useAccountingOptions } from '@/composables/useAccountingOptions'
import { useDateRange } from '@/composables/useDateRange'
import { exportCsv, todayStamp } from '@/lib/export'
import { mainAccountStatement } from '@/api/accounting'

/* كشف حساب رئيسي — a group account broken down by its direct children. */
const { t, locale } = useI18n()
const { sar } = useCurrency()
const opts = useAccountingOptions()
const { from, to, range, params } = useDateRange()
const account = ref('')
const loading = ref(false)
const data = ref(null)

async function load() {
  if (!account.value) return
  loading.value = true
  data.value = await mainAccountStatement(account.value, params.value)
  loading.value = false
}
onMounted(async () => {
  await opts.load()
  account.value = 'assets'
  await load()
})
watch([account, from, to], load)
const money = (v) => sar(v, { decimals: 2 })
const drill = (row) => row.isGroup && (account.value = row.id)
const exportRows = () => data.value && exportCsv(`main-${account.value}-${todayStamp()}`, [t('accounting.common.code'), t('journal.account'), t('accounting.common.opening'), t('ledger.debit'), t('ledger.credit'), t('accounting.common.closing')], data.value.rows.map((r) => [r.code, r.name, r.opening, r.debit, r.credit, r.closing]))
</script>

<template>
  <ReportShell :title="t('accounting.screens.mainAccountStatement')" :subtitle="t('accounting.reports.mainHint')" :period="`${from} → ${to}`" @export="exportRows">
    <template #filters>
      <Dropdown v-model="account" :options="opts.groupAccountOptions.value" searchable class="w-auto min-w-[280px]" />
      <DatePicker v-model="range" range class="w-auto min-w-[240px]" />
    </template>
    <DataTable
      :loading="loading" :rows="data?.rows ?? []" :empty="t('common.noData')"
      :columns="[
        { key: 'name', label: t('journal.account'), sortable: true },
        { key: 'opening', label: t('accounting.common.opening'), align: 'end' },
        { key: 'debit', label: t('ledger.debit'), align: 'end', sortable: true },
        { key: 'credit', label: t('ledger.credit'), align: 'end', sortable: true },
        { key: 'closing', label: t('accounting.common.closing'), align: 'end', sortable: true },
      ]"
    >
      <template #cell-name="{ row }">
        <button type="button" class="inline-flex items-center gap-2 text-start" :class="row.isGroup ? 'hover:text-primary font-semibold hover:underline' : 'font-medium'" @click="drill(row)">
          <component :is="row.isGroup ? Folder : FileText" class="size-4" :class="row.isGroup ? 'text-orange' : 'text-muted-foreground'" />
          <span dir="ltr" class="font-mono text-xs">{{ row.code }}</span> {{ locale === 'ar' ? row.name : row.en }}
        </button>
      </template>
      <template #cell-opening="{ row }"><span class="text-muted-foreground tabular-nums">{{ money(row.opening) }}</span></template>
      <template #cell-debit="{ row }"><span class="tabular-nums">{{ row.debit ? money(row.debit) : '' }}</span></template>
      <template #cell-credit="{ row }"><span class="tabular-nums">{{ row.credit ? money(row.credit) : '' }}</span></template>
      <template #cell-closing="{ row }"><span class="font-semibold tabular-nums">{{ money(row.closing) }}</span></template>
    </DataTable>
    <div v-if="data" class="bg-muted/40 grid grid-cols-4 gap-2 border-t px-5 py-3 text-end text-sm font-semibold tabular-nums">
      <span>{{ money(data.totals.opening) }}</span><span>{{ money(data.totals.debit) }}</span><span>{{ money(data.totals.credit) }}</span><span>{{ money(data.totals.closing) }}</span>
    </div>
  </ReportShell>
</template>
