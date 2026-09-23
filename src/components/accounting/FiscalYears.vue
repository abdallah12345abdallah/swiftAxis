<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { Plus, Pencil, Star, Lock, CalendarRange } from 'lucide-vue-next'
import { Card } from '@/components/ui/card'
import { DataTable } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { DatePicker } from '@/components/ui/datepicker'
import { useCurrency } from '@/composables/useCurrency'
import { useDate } from '@/lib/format'
import { useToast } from '@/composables/useToast'
import { fetchFiscalYearsFull, createFiscalYear, updateFiscalYear, setDefaultFiscalYear } from '@/api/accounting'

const { t, locale } = useI18n()
const { sar, num } = useCurrency()
const { formatDate } = useDate()
const toast = useToast()
const loading = ref(true)
const rows = ref([])
const dialog = ref(false)
const editing = ref(null)
const saving = ref(false)
const error = ref('')
const form = reactive({ name: '', en: '', dateFrom: '', dateTo: '' })

async function load() {
  loading.value = true
  rows.value = await fetchFiscalYearsFull()
  loading.value = false
}
onMounted(load)

function open(y = null) {
  editing.value = y
  const next = rows.value.length ? Number(rows.value[rows.value.length - 1].year) + 1 : new Date().getFullYear()
  Object.assign(form, { name: y?.name ?? `السنة المالية ${next}`, en: y?.en ?? `Fiscal year ${next}`, dateFrom: y?.dateFrom ?? `${next}-01-01`, dateTo: y?.dateTo ?? `${next}-12-31` })
  error.value = ''
  dialog.value = true
}
const ERR = { RANGE_INVALID: 'accounting.years.errRange', OVERLAP: 'accounting.years.errOverlap', YEAR_CLOSED: 'journal.errYearClosed' }
async function save() {
  if (saving.value) return
  saving.value = true
  error.value = ''
  try {
    editing.value ? await updateFiscalYear(editing.value.id, { ...form }) : await createFiscalYear({ ...form })
    toast.success(t('common.saved'))
    dialog.value = false
    await load()
  } catch (e) {
    error.value = t(ERR[e.message] ?? 'journal.errGeneric')
  } finally {
    saving.value = false
  }
}
async function makeDefault(y) {
  await setDefaultFiscalYear(y.id)
  toast.success(t('accounting.years.defaultSet', { name: locale.value === 'ar' ? y.name : y.en }))
  await load()
}
const columns = computed(() => [
  { key: 'name', label: t('common.name'), sortable: true },
  { key: 'range', label: t('accounting.common.period') },
  { key: 'months', label: t('accounting.years.months'), align: 'end', hideBelow: 'md' },
  { key: 'entries', label: t('accounting.common.entries'), align: 'end', hideBelow: 'md' },
  { key: 'total', label: t('accounting.common.movement'), align: 'end', hideBelow: 'lg' },
  { key: 'status', label: t('common.status') },
  { key: 'actions', label: t('common.actions'), align: 'end' },
])
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <p class="text-muted-foreground text-sm">{{ t('accounting.years.hint') }}</p>
      <Button @click="open()"><Plus /> {{ t('accounting.years.add') }}</Button>
    </div>
    <Card class="overflow-hidden">
      <DataTable :loading="loading" :rows="rows" :empty="t('common.noData')" :columns="columns">
        <template #cell-name="{ row }"><span class="inline-flex items-center gap-1.5 font-medium"><CalendarRange class="text-muted-foreground size-4" /> {{ locale === 'ar' ? row.name : row.en }} <Star v-if="row.isDefault" class="text-orange size-3.5" /></span></template>
        <template #cell-range="{ row }"><span class="tabular-nums" dir="ltr">{{ formatDate(row.dateFrom) }} → {{ formatDate(row.dateTo) }}</span></template>
        <template #cell-months="{ row }"><span class="tabular-nums">{{ num(row.closedMonths) }} / {{ num(row.months) }}</span></template>
        <template #cell-entries="{ row }"><span class="tabular-nums">{{ num(row.entries) }}</span></template>
        <template #cell-total="{ row }"><span class="tabular-nums">{{ sar(row.total) }}</span></template>
        <template #cell-status="{ row }">
          <Badge v-if="row.closed" variant="secondary"><Lock class="size-3" /> {{ t('accounting.years.closed') }}</Badge>
          <Badge v-else-if="row.isDefault" variant="success">{{ t('accounting.years.default') }}</Badge>
          <Badge v-else variant="default">{{ t('accounting.years.open') }}</Badge>
          <p v-if="row.closingRef" class="text-muted-foreground mt-0.5 text-xs tabular-nums" dir="ltr">{{ row.closingRef }}</p>
        </template>
        <template #cell-actions="{ row }">
          <div class="flex items-center justify-end gap-1">
            <Button v-if="!row.closed && !row.isDefault" size="sm" variant="ghost" @click="makeDefault(row)"><Star /> {{ t('accounting.years.setDefault') }}</Button>
            <button v-if="!row.closed" type="button" class="hover:bg-accent text-muted-foreground hover:text-foreground inline-flex size-8 items-center justify-center rounded-lg" @click="open(row)"><Pencil class="size-4" /></button>
          </div>
        </template>
      </DataTable>
    </Card>

    <Dialog v-model:open="dialog" :title="editing ? t('accounting.years.editTitle') : t('accounting.years.addTitle')">
      <form class="space-y-4" @submit.prevent="save">
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="space-y-1.5"><label class="text-sm font-medium">{{ t('common.name') }}</label><Input v-model="form.name" /></div>
          <div class="space-y-1.5"><label class="text-sm font-medium">{{ t('accounting.common.nameEn') }}</label><Input v-model="form.en" dir="ltr" /></div>
          <div class="space-y-1.5"><label class="text-sm font-medium">{{ t('common.from') }}</label><DatePicker v-model="form.dateFrom" :disabled="!!editing" :clearable="false" /></div>
          <div class="space-y-1.5"><label class="text-sm font-medium">{{ t('common.to') }}</label><DatePicker v-model="form.dateTo" :disabled="!!editing" :clearable="false" /></div>
        </div>
        <p v-if="error" class="text-danger text-xs">{{ error }}</p>
      </form>
      <template #footer>
        <Button variant="ghost" @click="dialog = false">{{ t('common.cancel') }}</Button>
        <Button :disabled="saving" @click="save">{{ t('common.save') }}</Button>
      </template>
    </Dialog>
  </div>
</template>
