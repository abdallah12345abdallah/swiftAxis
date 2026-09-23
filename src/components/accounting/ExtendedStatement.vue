<script setup>
import { ref, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import ReportShell from '@/components/accounting/shared/ReportShell.vue'
import StatementTable from '@/components/accounting/shared/StatementTable.vue'
import { DatePicker } from '@/components/ui/datepicker'
import { Dropdown } from '@/components/ui/dropdown'
import { useAccountingOptions } from '@/composables/useAccountingOptions'
import { useDateRange } from '@/composables/useDateRange'
import { exportCsv, todayStamp } from '@/lib/export'
import { accountStatement } from '@/api/accounting'

/* كشف حساب ممتد — any account (group or leaf) with every line detail. */
const { t } = useI18n()
const opts = useAccountingOptions()
const { from, to, range, params } = useDateRange()
const account = ref('')
const loading = ref(false)
const data = ref(null)

async function load() {
  if (!account.value) return
  loading.value = true
  data.value = await accountStatement(account.value, params.value)
  loading.value = false
}
onMounted(async () => {
  await opts.load()
  account.value = 'current_assets'
  await load()
})
watch([account, from, to], load)
const exportRows = () => data.value && exportCsv(`extended-${account.value}-${todayStamp()}`, [t('common.date'), t('journal.docNo'), t('journal.docType'), t('journal.account'), t('common.description'), t('journal.lineStatement'), t('journal.costCenter'), t('ledger.cc.unit'), t('ledger.debit'), t('ledger.credit'), t('ledger.balance')], data.value.rows.map((r) => [r.date, r.ref, r.docTypeName, `${r.accountCode} ${r.accountName}`, r.statement, r.description, r.costCenterName, r.unitName, r.debit, r.credit, r.balance]))
</script>

<template>
  <ReportShell :title="t('accounting.screens.extendedStatement')" :subtitle="t('accounting.reports.extendedHint')" :period="`${from} → ${to}`" @export="exportRows">
    <template #filters>
      <Dropdown v-model="account" :options="opts.allAccountOptions.value" searchable class="w-auto min-w-[300px]" />
      <DatePicker v-model="range" range class="w-auto min-w-[240px]" />
    </template>
    <StatementTable :data="data" :loading="loading" extended />
  </ReportShell>
</template>
