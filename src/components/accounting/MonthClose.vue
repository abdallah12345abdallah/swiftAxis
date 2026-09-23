<script setup>
import MetricTile from '@/components/common/MetricTile.vue'
import { CalendarCheck as MtCalendarCheck, FileText as MtFileText } from 'lucide-vue-next'
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import ActionMenu from '@/components/common/ActionMenu.vue'
import { Lock, Unlock, CalendarCheck } from 'lucide-vue-next'
import { useConfirm } from '@/composables/useConfirm'
import { Card } from '@/components/ui/card'
import { DataTable } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dropdown } from '@/components/ui/dropdown'
import { useCurrency } from '@/composables/useCurrency'
import { useToast } from '@/composables/useToast'
import { useAuthStore } from '@/stores/auth'
import { useAccountingOptions } from '@/composables/useAccountingOptions'
import { fetchMonths, closeMonth, reopenMonth } from '@/api/accounting'

const { t } = useI18n()
const ask2 = useConfirm()
const { sar, num } = useCurrency()
const toast = useToast()
const auth = useAuthStore()
const opts = useAccountingOptions()
const year = ref('')
const loading = ref(true)
const data = ref(null)

async function load() {
  if (!year.value) return
  loading.value = true
  data.value = await fetchMonths(year.value)
  loading.value = false
}
onMounted(async () => {
  await opts.load()
  year.value = opts.defaultYear.value
  await load()
})
watch(year, load)

const ERR = { SEQUENCE: 'accounting.months.errSequence', YEAR_CLOSED: 'journal.errYearClosed' }
async function ask(row, close) {
  await ask2({
    tone: close ? 'warning' : 'danger',
    icon: close ? Lock : Unlock,
    title: close ? t('accounting.months.close') : t('accounting.months.reopen'),
    message: close ? t('accounting.months.closeHint', { month: row.label }) : t('accounting.months.reopenHint', { month: row.label }),
    confirmText: close ? t('accounting.months.close') : t('accounting.months.reopen'),
    onConfirm: async () => {
      try {
        close ? await closeMonth(year.value, row.ym, { by: auth.user?.name }) : await reopenMonth(year.value, row.ym, { by: auth.user?.name })
      } catch (e) {
        toast.error(t(ERR[e.message] ?? 'journal.errGeneric'))
        return false
      }
      toast.success(close ? t('accounting.months.closed', { month: row.label }) : t('accounting.months.reopened', { month: row.label }))
      await load()
    },
  })
}
const closedCount = computed(() => data.value?.rows.filter((r) => r.closed).length ?? 0)
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div class="space-y-1.5">
        <label class="text-muted-foreground text-xs font-medium">{{ t('accounting.common.year') }}</label>
        <Dropdown v-model="year" :options="opts.yearOptions.value" class="w-auto min-w-[220px]" />
      </div>
      <p class="text-muted-foreground max-w-xl text-xs">{{ t('accounting.months.hint') }}</p>
    </div>

    <div v-if="data" class="grid gap-4 sm:grid-cols-3">
      <MetricTile :label="t('accounting.months.closedCount')" :value="closedCount" :format="(v) => `${num(Math.round(v))} / ${num(data.rows.length)}`" :icon="MtCalendarCheck" tone="success" :progress="data.rows.length ? (closedCount / data.rows.length) * 100 : 0" />
      <MetricTile :label="t('accounting.common.entries')" :value="data.year.entries" :format="(v) => num(Math.round(v))" :icon="MtFileText" tone="brand" />
      <!-- same look as the metric tiles beside it; the value is a status badge -->
      <div class="bg-card rounded-2xl border p-4">
        <div class="flex items-center gap-2.5">
          <span class="bg-primary/12 text-primary grid size-10 shrink-0 place-items-center rounded-xl"><component :is="data.year.closed ? Lock : Unlock" class="size-5" /></span>
          <p class="text-muted-foreground text-[13px] font-semibold">{{ t('common.status') }}</p>
        </div>
        <p class="mt-3"><Badge :variant="data.year.closed ? 'secondary' : 'success'">{{ data.year.closed ? t('accounting.years.closed') : t('accounting.years.open') }}</Badge></p>
      </div>
    </div>

    <Card class="overflow-hidden">
      <DataTable
        :loading="loading" :rows="data?.rows ?? []" row-key="ym" :empty="t('common.noData')"
        :columns="[
          { key: 'label', label: t('accounting.common.month') },
          { key: 'entries', label: t('accounting.common.entries'), align: 'end', hideBelow: 'sm' },
          { key: 'debit', label: t('accounting.common.movement'), align: 'end', hideBelow: 'md' },
          { key: 'closed', label: t('common.status') },
          { key: 'actions', label: t('common.actions'), align: 'end' },
        ]"
      >
        <template #cell-label="{ row }"><span class="inline-flex items-center gap-2 font-medium"><CalendarCheck class="text-muted-foreground size-4" /> {{ row.label }} <span class="text-muted-foreground text-xs tabular-nums" dir="ltr">{{ row.ym }}</span></span></template>
        <template #cell-entries="{ row }"><span class="tabular-nums">{{ num(row.entries) }}</span></template>
        <template #cell-debit="{ row }"><span class="tabular-nums">{{ sar(row.debit) }}</span></template>
        <template #cell-closed="{ row }"><Badge :variant="row.closed ? 'secondary' : 'success'"><component :is="row.closed ? Lock : Unlock" class="size-3" /> {{ row.closed ? t('accounting.months.closedBadge') : t('accounting.months.openBadge') }}</Badge></template>
        <template #cell-actions="{ row }">
          <ActionMenu :items="[
                    { label: t('accounting.months.close'), icon: Lock, tone: 'blue', show: row.canClose, onSelect: () => ask(row, true) },
                    { label: t('accounting.months.reopen'), icon: Unlock, danger: true, show: row.canReopen, onSelect: () => ask(row, false) },
                  ]" />
        </template>
      </DataTable>
    </Card>

  </div>
</template>
