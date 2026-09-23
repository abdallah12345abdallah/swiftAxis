<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import ReportShell from '@/components/accounting/shared/ReportShell.vue'
import StatementTable from '@/components/accounting/shared/StatementTable.vue'
import { Dropdown } from '@/components/ui/dropdown'
import { useAccountingOptions } from '@/composables/useAccountingOptions'
import { exportCsv, todayStamp } from '@/lib/export'
import { accountStatement } from '@/api/accounting'

/* كشف حساب شهري — one account, one month of a fiscal year. */
const { t } = useI18n()
const opts = useAccountingOptions()
const account = ref('')
const year = ref('')
const month = ref('')
const loading = ref(false)
const data = ref(null)

const AR_MONTHS = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
const monthOptions = computed(() => {
  const y = opts.yearById(year.value)
  if (!y) return []
  const out = []
  let [yy, mm] = y.dateFrom.slice(0, 7).split('-').map(Number)
  for (let i = 0; i < 24; i++) {
    const ym = `${yy}-${String(mm).padStart(2, '0')}`
    out.push({ value: ym, label: `${AR_MONTHS[mm - 1]} ${yy}`, hint: ym })
    if (ym === y.dateTo.slice(0, 7)) break
    mm += 1
    if (mm > 12) { mm = 1; yy += 1 }
  }
  return out
})
const lastDay = (ym) => new Date(Number(ym.slice(0, 4)), Number(ym.slice(5)), 0).toISOString().slice(0, 10)

async function load() {
  if (!account.value || !month.value) return
  loading.value = true
  data.value = await accountStatement(account.value, { from: `${month.value}-01`, to: lastDay(month.value) })
  loading.value = false
}
onMounted(async () => {
  await opts.load()
  year.value = opts.defaultYear.value
  month.value = monthOptions.value.find((m) => m.value === new Date().toISOString().slice(0, 7))?.value ?? monthOptions.value[0]?.value ?? ''
  account.value = opts.leafAccountOptions.value[0]?.value ?? ''
  await load()
})
watch(year, () => (month.value = monthOptions.value[0]?.value ?? ''))
watch([account, month], load)
const exportRows = () => data.value && exportCsv(`monthly-${account.value}-${month.value}`, [t('common.date'), t('journal.docNo'), t('common.description'), t('ledger.debit'), t('ledger.credit'), t('ledger.balance')], data.value.rows.map((r) => [r.date, r.ref, r.statement, r.debit, r.credit, r.balance]))
</script>

<template>
  <ReportShell :title="t('accounting.screens.monthlyStatement')" :period="month" @export="exportRows">
    <template #filters>
      <Dropdown v-model="account" :options="opts.allAccountOptions.value" searchable class="w-auto min-w-[280px]" />
      <Dropdown v-model="year" :options="opts.yearOptions.value" class="w-auto min-w-[180px]" />
      <Dropdown v-model="month" :options="monthOptions" class="w-auto min-w-[180px]" />
    </template>
    <StatementTable :data="data" :loading="loading" />
  </ReportShell>
</template>
