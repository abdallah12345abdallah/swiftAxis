<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import ReportShell from '@/components/accounting/shared/ReportShell.vue'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { DatePicker } from '@/components/ui/datepicker'
import { Dropdown } from '@/components/ui/dropdown'
import { useCurrency } from '@/composables/useCurrency'
import { useDate } from '@/lib/format'
import { useAccountingOptions } from '@/composables/useAccountingOptions'
import { useDateRange } from '@/composables/useDateRange'
import { exportCsv, todayStamp } from '@/lib/export'
import { journalDetailed } from '@/api/accounting'

/* قيد اليومية تفصيلي — every posted entry with all its lines. */
const { t } = useI18n()
const { sar, num } = useCurrency()
const { formatDate } = useDate()
const opts = useAccountingOptions()
const { from, to, range, params } = useDateRange()
const docType = ref('')
const loading = ref(true)
const data = ref(null)
const typeFilter = computed(() => [{ value: '', label: t('accounting.reports.allTypes') }, ...opts.docTypeOptions.value])
async function load() {
  loading.value = true
  data.value = await journalDetailed({ ...params.value, docType: docType.value || undefined })
  loading.value = false
}
onMounted(async () => {
  await opts.load()
  await load()
})
watch([from, to, docType], load)
const money = (v) => (v ? sar(v, { decimals: 2 }) : '')
const exportRows = () => data.value && exportCsv(`journal-detailed-${todayStamp()}`, [t('journal.serial'), t('journal.docNo'), t('common.date'), t('journal.docType'), t('journal.statement'), t('journal.accountNo'), t('journal.accountName'), t('journal.costCenter'), t('ledger.debit'), t('ledger.credit'), t('journal.lineStatement')], data.value.rows.flatMap((e) => e.lines.map((l) => [e.serial, e.ref, e.date, e.docTypeName, e.description, l.accountCode, l.accountName, l.costCenterName, l.debit, l.credit, l.description])))
</script>

<template>
  <ReportShell :title="t('accounting.screens.journalDetailed')" :period="`${from} → ${to}`" @export="exportRows">
    <template #filters>
      <DatePicker v-model="range" range class="w-auto min-w-[240px]" />
      <Dropdown v-model="docType" :options="typeFilter" class="w-auto min-w-[200px]" />
      <span v-if="data" class="text-muted-foreground ms-auto text-xs tabular-nums">{{ t('accounting.common.entries') }}: {{ num(data.totals.entries) }} · {{ t('accounting.common.lines') }}: {{ num(data.totals.lines) }} · {{ sar(data.totals.debit, { decimals: 2 }) }}</span>
    </template>
    <div v-if="loading || !data" class="space-y-3 p-5"><Skeleton v-for="i in 4" :key="i" class="h-20 rounded-xl" /></div>
    <div v-else class="divide-y">
      <p v-if="!data.rows.length" class="text-muted-foreground py-12 text-center text-sm">{{ t('ledger.empty') }}</p>
      <div v-for="e in data.rows" :key="e.id" class="p-5">
        <div class="mb-2 flex flex-wrap items-center gap-2 text-sm">
          <RouterLink :to="`/ledger/entry/${e.id}`" class="text-primary font-bold tabular-nums hover:underline" dir="ltr">{{ e.ref }}</RouterLink>
          <span class="text-muted-foreground text-xs tabular-nums">#{{ e.serial }}</span>
          <Badge variant="secondary">{{ e.docTypeName }}</Badge>
          <Badge variant="outline">{{ e.source }}</Badge>
          <span class="text-muted-foreground ms-auto tabular-nums">{{ formatDate(e.date) }}</span>
        </div>
        <p v-if="e.description" class="text-muted-foreground mb-2 text-sm">{{ e.description }}</p>
        <table class="w-full text-sm">
          <thead class="text-muted-foreground text-xs"><tr class="border-b"><th class="py-1 text-start font-medium">#</th><th class="py-1 text-start font-medium">{{ t('journal.account') }}</th><th class="hidden py-1 text-start font-medium md:table-cell">{{ t('journal.costCenter') }}</th><th class="hidden py-1 text-start font-medium lg:table-cell">{{ t('journal.lineStatement') }}</th><th class="py-1 text-end font-medium">{{ t('ledger.debit') }}</th><th class="py-1 text-end font-medium">{{ t('ledger.credit') }}</th></tr></thead>
          <tbody>
            <tr v-for="l in e.lines" :key="l.lineNo" class="border-b last:border-0">
              <td class="text-muted-foreground py-1.5 tabular-nums">{{ l.lineNo }}</td>
              <td class="py-1.5"><span dir="ltr" class="font-mono text-xs">{{ l.accountCode }}</span> {{ l.accountName }}</td>
              <td class="text-muted-foreground hidden py-1.5 text-xs md:table-cell">{{ l.costCenterName || '—' }}</td>
              <td class="text-muted-foreground hidden py-1.5 text-xs lg:table-cell">{{ l.description || '—' }}</td>
              <td class="py-1.5 text-end tabular-nums">{{ money(l.debit) }}</td>
              <td class="py-1.5 text-end tabular-nums">{{ money(l.credit) }}</td>
            </tr>
          </tbody>
          <tfoot><tr class="font-semibold tabular-nums"><td colspan="4" class="py-1.5 text-xs">{{ t('common.total') }}</td><td class="py-1.5 text-end">{{ money(e.total) }}</td><td class="py-1.5 text-end">{{ money(e.total) }}</td></tr></tfoot>
        </table>
      </div>
    </div>
  </ReportShell>
</template>
