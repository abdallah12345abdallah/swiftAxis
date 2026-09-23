<script setup>
import { ref, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import ReportShell from '@/components/accounting/shared/ReportShell.vue'
import { Skeleton } from '@/components/ui/skeleton'
import { DatePicker } from '@/components/ui/datepicker'
import { useCurrency } from '@/composables/useCurrency'
import { useDateRange } from '@/composables/useDateRange'
import { exportCsv, todayStamp } from '@/lib/export'
import { incomeStatement } from '@/api/accounting'

/* قائمة الدخل — by account, or by financial-statement item (byItems). */
const props = defineProps({ byItems: { type: Boolean, default: false } })
const { t, locale } = useI18n()
const { sar } = useCurrency()
const { from, to, range, params } = useDateRange()
const loading = ref(true)
const data = ref(null)
async function load() {
  loading.value = true
  data.value = await incomeStatement({ ...params.value, byItems: props.byItems })
  loading.value = false
}
onMounted(load)
watch([from, to], load)
const money = (v) => sar(v, { decimals: 2 })
const name = (x) => (locale.value === 'ar' ? x.name : x.en)
const title = () => (props.byItems ? t('accounting.screens.incomeByItems') : t('accounting.screens.incomeStatement'))
const exportRows = () => data.value && exportCsv(`income-${todayStamp()}`, [t('accounting.common.section'), t('common.name'), t('common.amount')], data.value.groups.flatMap((g) => g.items.map((i) => [t(`accounting.sections.${g.section}`), i.name, i.amount])))
</script>

<template>
  <ReportShell :title="title()" :period="`${from} → ${to}`" @export="exportRows">
    <template #filters><DatePicker v-model="range" range class="w-auto min-w-[240px]" /></template>
    <div v-if="loading || !data" class="space-y-3 p-5"><Skeleton v-for="i in 5" :key="i" class="h-10 rounded-lg" /></div>
    <div v-else class="p-5">
      <div v-for="g in data.groups" :key="g.section" class="mb-5">
        <div class="mb-1 flex items-center justify-between border-b pb-1">
          <p class="text-muted-foreground text-xs font-bold uppercase tracking-wide">{{ t(`accounting.sections.${g.section}`) }}</p>
          <p class="font-semibold tabular-nums">{{ money(g.total) }}</p>
        </div>
        <div v-for="i in g.items" :key="i.id" class="flex items-center justify-between py-1.5 text-sm">
          <span class="flex items-center gap-2"><span dir="ltr" class="text-muted-foreground font-mono text-xs">{{ i.code }}</span> {{ name(i) }}<span v-if="byItems && i.accounts?.length" class="text-muted-foreground text-xs">({{ i.accounts.length }})</span></span>
          <span class="tabular-nums" :class="i.amount < 0 ? 'text-danger' : ''">{{ money(i.amount) }}</span>
        </div>
        <p v-if="!g.items.length" class="text-muted-foreground py-1.5 text-xs">{{ t('common.none') }}</p>
      </div>
      <div class="grid gap-3 sm:grid-cols-3">
        <div class="bg-success/10 rounded-xl p-4"><p class="text-muted-foreground text-xs">{{ t('accounting.common.revenue') }}</p><p class="text-success mt-1 text-xl font-bold tabular-nums">{{ money(data.revenue) }}</p></div>
        <div class="bg-danger/10 rounded-xl p-4"><p class="text-muted-foreground text-xs">{{ t('accounting.common.expenses') }}</p><p class="text-danger mt-1 text-xl font-bold tabular-nums">{{ money(data.expenses) }}</p></div>
        <div class="bg-navy rounded-xl p-4 text-white"><p class="text-xs text-white/70">{{ t('accounting.common.netProfit') }}</p><p class="mt-1 text-xl font-extrabold tabular-nums">{{ money(data.net) }}</p></div>
      </div>
    </div>
  </ReportShell>
</template>
