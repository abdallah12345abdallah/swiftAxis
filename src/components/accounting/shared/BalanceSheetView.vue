<script setup>
import { ref, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import ReportShell from '@/components/accounting/shared/ReportShell.vue'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { DatePicker } from '@/components/ui/datepicker'
import { useCurrency } from '@/composables/useCurrency'
import { exportCsv, todayStamp } from '@/lib/export'
import { balanceSheet } from '@/api/accounting'

/* قائمة المركز المالي — by account, or by financial-statement item (byItems). */
const props = defineProps({ byItems: { type: Boolean, default: false } })
const { t, locale } = useI18n()
const { sar } = useCurrency()
const asOf = ref(new Date().toISOString().slice(0, 10))
const loading = ref(true)
const data = ref(null)
async function load() {
  loading.value = true
  data.value = await balanceSheet({ asOf: asOf.value, byItems: props.byItems })
  loading.value = false
}
onMounted(load)
watch(asOf, load)
const money = (v) => sar(v, { decimals: 2 })
const name = (x) => (locale.value === 'ar' ? x.name : x.en)
const title = () => (props.byItems ? t('accounting.screens.balanceSheetByItems') : t('accounting.screens.balanceSheet'))
const exportRows = () => data.value && exportCsv(`balance-sheet-${todayStamp()}`, [t('accounting.common.section'), t('common.name'), t('common.amount')], ['assets', 'liabilities', 'equity'].flatMap((s) => data.value.sides[s].map((i) => [t(`accounting.sections.${s}`), i.name, i.amount])))
</script>

<template>
  <ReportShell :title="title()" :period="`${t('accounting.reports.asOf')} ${asOf}`" @export="exportRows">
    <template #filters>
      <div class="space-y-1.5"><label class="text-muted-foreground text-xs font-medium">{{ t('accounting.reports.asOf') }}</label><DatePicker v-model="asOf" :clearable="false" class="w-auto min-w-[200px]" /></div>
      <Badge v-if="data" :variant="data.balanced ? 'success' : 'danger'" class="ms-auto">{{ data.balanced ? t('ledger.balanced') : t('journal.errUnbalanced') }}</Badge>
    </template>
    <div v-if="loading || !data" class="space-y-3 p-5"><Skeleton v-for="i in 5" :key="i" class="h-10 rounded-lg" /></div>
    <div v-else class="grid gap-6 p-5 lg:grid-cols-2">
      <div>
        <div class="mb-2 flex items-center justify-between border-b pb-1"><p class="text-xs font-bold uppercase tracking-wide">{{ t('accounting.sections.assets') }}</p><p class="font-bold tabular-nums">{{ money(data.assets) }}</p></div>
        <div v-for="i in data.sides.assets" :key="i.id" class="flex items-center justify-between py-1.5 text-sm">
          <span class="flex items-center gap-2"><span dir="ltr" class="text-muted-foreground font-mono text-xs">{{ i.code }}</span> {{ name(i) }}<span v-if="i.section" class="text-muted-foreground text-[10px]">{{ t(`accounting.sections.${i.section}`) }}</span></span>
          <span class="tabular-nums" :class="i.amount < 0 ? 'text-danger' : ''">{{ money(i.amount) }}</span>
        </div>
      </div>
      <div>
        <div class="mb-2 flex items-center justify-between border-b pb-1"><p class="text-xs font-bold uppercase tracking-wide">{{ t('accounting.sections.liabilities') }}</p><p class="font-bold tabular-nums">{{ money(data.liabilities) }}</p></div>
        <div v-for="i in data.sides.liabilities" :key="i.id" class="flex items-center justify-between py-1.5 text-sm">
          <span class="flex items-center gap-2"><span dir="ltr" class="text-muted-foreground font-mono text-xs">{{ i.code }}</span> {{ name(i) }}</span>
          <span class="tabular-nums" :class="i.amount < 0 ? 'text-danger' : ''">{{ money(i.amount) }}</span>
        </div>
        <div class="mt-4 mb-2 flex items-center justify-between border-b pb-1"><p class="text-xs font-bold uppercase tracking-wide">{{ t('accounting.sections.equity') }}</p><p class="font-bold tabular-nums">{{ money(data.equity) }}</p></div>
        <div v-for="i in data.sides.equity" :key="i.id" class="flex items-center justify-between py-1.5 text-sm">
          <span class="flex items-center gap-2"><span dir="ltr" class="text-muted-foreground font-mono text-xs">{{ i.code }}</span> {{ name(i) }}</span>
          <span class="tabular-nums" :class="i.amount < 0 ? 'text-danger' : ''">{{ money(i.amount) }}</span>
        </div>
        <div class="bg-navy mt-4 flex items-center justify-between rounded-xl p-4 text-white"><span class="text-sm">{{ t('accounting.reports.liabilitiesEquity') }}</span><span class="text-lg font-extrabold tabular-nums">{{ money(data.liabilities + data.equity) }}</span></div>
      </div>
    </div>
  </ReportShell>
</template>
