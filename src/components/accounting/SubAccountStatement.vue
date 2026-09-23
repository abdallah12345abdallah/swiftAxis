<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import ReportShell from '@/components/accounting/shared/ReportShell.vue'
import StatementTable from '@/components/accounting/shared/StatementTable.vue'
import { DatePicker } from '@/components/ui/datepicker'
import { Dropdown } from '@/components/ui/dropdown'
import { useAccountingOptions } from '@/composables/useAccountingOptions'
import { useDateRange } from '@/composables/useDateRange'
import { exportCsv, todayStamp } from '@/lib/export'
import { accountStatement } from '@/api/accounting'

const { t } = useI18n()
const opts = useAccountingOptions()
const { from, to, range, params } = useDateRange()
const account = ref('')
const costCenter = ref('')
const loading = ref(false)
const data = ref(null)
const ccOptions = computed(() => [{ value: '', label: t('ledger.allCenters') }, ...opts.centerOptions.value])

async function load() {
  if (!account.value) return
  loading.value = true
  data.value = await accountStatement(account.value, { ...params.value, costCenter: costCenter.value || undefined })
  loading.value = false
}
onMounted(async () => {
  await opts.load()
  account.value = opts.leafAccountOptions.value[0]?.value ?? ''
  await load()
})
watch([account, from, to, costCenter], load)
const exportRows = () => data.value && exportCsv(`statement-${account.value}-${todayStamp()}`, [t('common.date'), t('journal.docNo'), t('common.description'), t('journal.costCenter'), t('ledger.debit'), t('ledger.credit'), t('ledger.balance')], data.value.rows.map((r) => [r.date, r.ref, r.statement, r.costCenterName, r.debit, r.credit, r.balance]))
</script>

<template>
  <ReportShell :title="t('accounting.screens.subAccountStatement')" :period="`${from} → ${to}`" @export="exportRows">
    <template #filters>
      <Dropdown v-model="account" :options="opts.leafAccountOptions.value" searchable class="w-auto min-w-[280px]" />
      <DatePicker v-model="range" range class="w-auto min-w-[240px]" />
      <Dropdown v-model="costCenter" :options="ccOptions" class="w-auto min-w-[200px]" />
    </template>
    <StatementTable :data="data" :loading="loading" />
  </ReportShell>
</template>
