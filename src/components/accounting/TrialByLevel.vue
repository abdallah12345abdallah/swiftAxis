<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import ReportShell from '@/components/accounting/shared/ReportShell.vue'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { DatePicker } from '@/components/ui/datepicker'
import { Dropdown } from '@/components/ui/dropdown'
import { Switch } from '@/components/ui/switch'
import { useCurrency } from '@/composables/useCurrency'
import { useDateRange } from '@/composables/useDateRange'
import { exportCsv, todayStamp } from '@/lib/export'
import { trialBalanceByLevel } from '@/api/accounting'

/* ميزان المراجعة حسب المستوى — opening / movement / closing, at tree level 1, 2 or 3. */
const { t, locale } = useI18n()
const { sar } = useCurrency()
const { from, to, range, params } = useDateRange()
const level = ref(3)
const onlyMovement = ref(true)
const loading = ref(true)
const data = ref(null)
const levelOptions = computed(() => [1, 2, 3].map((l) => ({ value: l, label: t('accounting.reports.levelN', { n: l }) })))

async function load() {
  loading.value = true
  data.value = await trialBalanceByLevel({ level: level.value, ...params.value, onlyMovement: onlyMovement.value })
  loading.value = false
}
onMounted(load)
watch([level, from, to, onlyMovement], load)
const money = (v) => (v ? sar(v, { decimals: 2 }) : '')
const balanced = computed(() => data.value && Math.round((data.value.totals.closingDebit - data.value.totals.closingCredit) * 100) === 0)
const exportRows = () => data.value && exportCsv(`trial-balance-L${level.value}-${todayStamp()}`, [t('accounting.common.code'), t('journal.account'), `${t('accounting.common.opening')} ${t('ledger.debit')}`, `${t('accounting.common.opening')} ${t('ledger.credit')}`, t('ledger.debit'), t('ledger.credit'), `${t('accounting.common.closing')} ${t('ledger.debit')}`, `${t('accounting.common.closing')} ${t('ledger.credit')}`], data.value.rows.map((r) => [r.code, r.name, r.openingDebit, r.openingCredit, r.debit, r.credit, r.closingDebit, r.closingCredit]))
</script>

<template>
  <ReportShell :title="t('accounting.screens.trialByLevel')" :period="`${from} → ${to}`" @export="exportRows">
    <template #filters>
      <Dropdown v-model="level" :options="levelOptions" class="w-auto min-w-[160px]" />
      <DatePicker v-model="range" range class="w-auto min-w-[240px]" />
      <label class="flex h-11 items-center gap-2 text-sm"><Switch v-model="onlyMovement" /> {{ t('accounting.reports.onlyMovement') }}</label>
      <Badge v-if="data" :variant="balanced ? 'success' : 'danger'" class="ms-auto">{{ balanced ? t('ledger.balanced') : t('journal.errUnbalanced') }}</Badge>
    </template>
    <div v-if="loading" class="space-y-3 p-5"><Skeleton v-for="i in 6" :key="i" class="h-10 rounded-lg" /></div>
    <div v-else class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="text-muted-foreground">
          <tr class="border-b">
            <th rowspan="2" class="px-4 py-2 text-start font-medium">{{ t('journal.account') }}</th>
            <th colspan="2" class="border-s px-4 py-1.5 text-center font-medium">{{ t('accounting.common.opening') }}</th>
            <th colspan="2" class="border-s px-4 py-1.5 text-center font-medium">{{ t('accounting.common.movement') }}</th>
            <th colspan="2" class="border-s px-4 py-1.5 text-center font-medium">{{ t('accounting.common.closing') }}</th>
          </tr>
          <tr class="border-b text-xs">
            <th class="border-s px-4 py-1.5 text-end font-medium">{{ t('ledger.debit') }}</th><th class="px-4 py-1.5 text-end font-medium">{{ t('ledger.credit') }}</th>
            <th class="border-s px-4 py-1.5 text-end font-medium">{{ t('ledger.debit') }}</th><th class="px-4 py-1.5 text-end font-medium">{{ t('ledger.credit') }}</th>
            <th class="border-s px-4 py-1.5 text-end font-medium">{{ t('ledger.debit') }}</th><th class="px-4 py-1.5 text-end font-medium">{{ t('ledger.credit') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in data.rows" :key="r.id" class="hover:bg-muted/40 border-b last:border-0">
            <td class="px-4 py-2"><span dir="ltr" class="font-mono text-xs">{{ r.code }}</span> <span :class="r.level < 3 ? 'font-semibold' : ''">{{ locale === 'ar' ? r.name : r.en }}</span></td>
            <td class="border-s px-4 py-2 text-end tabular-nums">{{ money(r.openingDebit) }}</td><td class="px-4 py-2 text-end tabular-nums">{{ money(r.openingCredit) }}</td>
            <td class="border-s px-4 py-2 text-end tabular-nums">{{ money(r.debit) }}</td><td class="px-4 py-2 text-end tabular-nums">{{ money(r.credit) }}</td>
            <td class="border-s px-4 py-2 text-end font-semibold tabular-nums">{{ money(r.closingDebit) }}</td><td class="px-4 py-2 text-end font-semibold tabular-nums">{{ money(r.closingCredit) }}</td>
          </tr>
          <tr v-if="!data.rows.length"><td colspan="7" class="text-muted-foreground py-10 text-center">{{ t('common.noData') }}</td></tr>
        </tbody>
        <tfoot>
          <tr class="bg-muted/40 border-t font-bold tabular-nums">
            <td class="px-4 py-3">{{ t('common.total') }}</td>
            <td class="border-s px-4 py-3 text-end">{{ money(data.totals.openingDebit) }}</td><td class="px-4 py-3 text-end">{{ money(data.totals.openingCredit) }}</td>
            <td class="border-s px-4 py-3 text-end">{{ money(data.totals.debit) }}</td><td class="px-4 py-3 text-end">{{ money(data.totals.credit) }}</td>
            <td class="border-s px-4 py-3 text-end">{{ money(data.totals.closingDebit) }}</td><td class="px-4 py-3 text-end">{{ money(data.totals.closingCredit) }}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  </ReportShell>
</template>
