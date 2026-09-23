<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Lock, Unlock, CalendarCheck } from 'lucide-vue-next'
import { Card } from '@/components/ui/card'
import { DataTable } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { Dropdown } from '@/components/ui/dropdown'
import { useCurrency } from '@/composables/useCurrency'
import { useToast } from '@/composables/useToast'
import { useAuthStore } from '@/stores/auth'
import { useAccountingOptions } from '@/composables/useAccountingOptions'
import { fetchMonths, closeMonth, reopenMonth } from '@/api/accounting'

const { t } = useI18n()
const { sar, num } = useCurrency()
const toast = useToast()
const auth = useAuthStore()
const opts = useAccountingOptions()
const year = ref('')
const loading = ref(true)
const data = ref(null)
const confirm = ref(false)
const action = ref(null) // { row, close: boolean }
const busy = ref(false)

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

function ask(row, close) {
  action.value = { row, close }
  confirm.value = true
}
const ERR = { SEQUENCE: 'accounting.months.errSequence', YEAR_CLOSED: 'journal.errYearClosed' }
async function run() {
  if (busy.value) return
  busy.value = true
  try {
    action.value.close ? await closeMonth(year.value, action.value.row.ym, { by: auth.user?.name }) : await reopenMonth(year.value, action.value.row.ym, { by: auth.user?.name })
    toast.success(action.value.close ? t('accounting.months.closed', { month: action.value.row.label }) : t('accounting.months.reopened', { month: action.value.row.label }))
    confirm.value = false
    await load()
  } catch (e) {
    toast.error(t(ERR[e.message] ?? 'journal.errGeneric'))
  } finally {
    busy.value = false
  }
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
      <Card class="p-5"><p class="text-muted-foreground text-sm">{{ t('accounting.months.closedCount') }}</p><p class="mt-1 text-2xl font-bold tabular-nums">{{ num(closedCount) }} / {{ num(data.rows.length) }}</p></Card>
      <Card class="p-5"><p class="text-muted-foreground text-sm">{{ t('accounting.common.entries') }}</p><p class="mt-1 text-2xl font-bold tabular-nums">{{ num(data.year.entries) }}</p></Card>
      <Card class="p-5"><p class="text-muted-foreground text-sm">{{ t('common.status') }}</p><p class="mt-1"><Badge :variant="data.year.closed ? 'secondary' : 'success'">{{ data.year.closed ? t('accounting.years.closed') : t('accounting.years.open') }}</Badge></p></Card>
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
          <Button v-if="row.canClose" size="sm" variant="outline" @click="ask(row, true)"><Lock /> {{ t('accounting.months.close') }}</Button>
          <Button v-else-if="row.canReopen" size="sm" variant="ghost" @click="ask(row, false)"><Unlock /> {{ t('accounting.months.reopen') }}</Button>
          <span v-else class="text-muted-foreground text-xs">—</span>
        </template>
      </DataTable>
    </Card>

    <Dialog v-model:open="confirm" :title="action?.close ? t('accounting.months.close') : t('accounting.months.reopen')" size="sm">
      <p class="text-muted-foreground text-sm">{{ action?.close ? t('accounting.months.closeHint', { month: action?.row.label }) : t('accounting.months.reopenHint', { month: action?.row.label }) }}</p>
      <template #footer>
        <Button variant="ghost" @click="confirm = false">{{ t('common.cancel') }}</Button>
        <Button :disabled="busy" :variant="action?.close ? 'default' : 'destructive'" @click="run">{{ t('common.confirm') }}</Button>
      </template>
    </Dialog>
  </div>
</template>
