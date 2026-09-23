<script setup>
import { useI18n } from 'vue-i18n'
import { DataTable } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useCurrency } from '@/composables/useCurrency'
import { useDate } from '@/lib/format'

/* Account statement rows with running balance; `extended` adds the document,
   cost-center, unit and line-statement columns (كشف حساب ممتد). */
const props = defineProps({
  data: { type: Object, default: null }, // accountStatement() result
  loading: { type: Boolean, default: false },
  extended: { type: Boolean, default: false },
})
const { t } = useI18n()
const { sar } = useCurrency()
const { formatDate } = useDate()
const money = (v) => (v ? sar(v, { decimals: 2 }) : '')
const columns = () => [
  { key: 'date', label: t('common.date'), sortable: true },
  { key: 'ref', label: t('journal.docNo') },
  ...(props.extended ? [{ key: 'docTypeName', label: t('journal.docType'), hideBelow: 'lg' }, { key: 'accountName', label: t('journal.account'), hideBelow: 'md' }] : []),
  { key: 'statement', label: t('accounting.reports.entryStatement'), hideBelow: 'md' },
  ...(props.extended ? [{ key: 'description', label: t('journal.lineStatement'), hideBelow: 'lg' }, { key: 'costCenterName', label: t('journal.costCenter'), hideBelow: 'lg' }, { key: 'unitName', label: t('ledger.cc.unit'), hideBelow: 'xl' }] : [{ key: 'costCenterName', label: t('journal.costCenter'), hideBelow: 'lg' }]),
  { key: 'debit', label: t('ledger.debit'), align: 'end' },
  { key: 'credit', label: t('ledger.credit'), align: 'end' },
  { key: 'balance', label: t('ledger.balance'), align: 'end' },
]
</script>

<template>
  <div>
    <div v-if="data" class="bg-muted/40 flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3 text-sm">
      <span class="font-semibold"><span dir="ltr" class="font-mono">{{ data.account.code }}</span> — {{ data.account.name }} <Badge variant="secondary" class="ms-1">{{ data.nature === 'credit' ? t('accounting.common.creditNature') : t('accounting.common.debitNature') }}</Badge></span>
      <span>{{ t('accounting.common.opening') }}: <b class="tabular-nums">{{ sar(data.opening, { decimals: 2 }) }}</b></span>
    </div>
    <DataTable :loading="loading" :rows="data?.rows ?? []" :row-key="'entryId'" :empty="t('accounting.reports.noMovement')" :columns="columns()" :page-size="25">
      <template #cell-date="{ row }"><span class="tabular-nums">{{ formatDate(row.date) }}</span></template>
      <template #cell-ref="{ row }"><RouterLink :to="`/ledger/entry/${row.entryId}`" class="text-primary tabular-nums hover:underline" dir="ltr">{{ row.ref }}</RouterLink></template>
      <template #cell-statement="{ row }"><span class="text-muted-foreground">{{ row.statement || '—' }}</span></template>
      <template #cell-description="{ row }"><span class="text-muted-foreground">{{ row.description || '—' }}</span></template>
      <template #cell-costCenterName="{ row }"><span class="text-muted-foreground text-xs">{{ row.costCenterName || '—' }}</span></template>
      <template #cell-unitName="{ row }"><span class="text-muted-foreground text-xs">{{ row.unitName || '—' }}</span></template>
      <template #cell-accountName="{ row }"><span dir="ltr" class="font-mono text-xs">{{ row.accountCode }}</span> {{ row.accountName }}</template>
      <template #cell-debit="{ row }"><span class="tabular-nums">{{ money(row.debit) }}</span></template>
      <template #cell-credit="{ row }"><span class="tabular-nums">{{ money(row.credit) }}</span></template>
      <template #cell-balance="{ row }"><span class="font-semibold tabular-nums" :class="row.balance < 0 ? 'text-danger' : ''">{{ sar(row.balance, { decimals: 2 }) }}</span></template>
    </DataTable>
    <div v-if="data" class="bg-muted/40 flex flex-wrap items-center justify-between gap-3 border-t px-5 py-3 text-sm font-semibold">
      <span>{{ t('accounting.common.closing') }}: <span class="tabular-nums">{{ sar(data.closing, { decimals: 2 }) }}</span></span>
      <span class="flex gap-6 tabular-nums"><span>{{ t('ledger.debit') }}: {{ sar(data.totalDebit, { decimals: 2 }) }}</span><span>{{ t('ledger.credit') }}: {{ sar(data.totalCredit, { decimals: 2 }) }}</span></span>
    </div>
  </div>
</template>
