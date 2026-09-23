<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Plus, Pencil, TrendingUp, TrendingDown } from 'lucide-vue-next'
import ReportShell from '@/components/accounting/shared/ReportShell.vue'
import { DataTable } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Dropdown } from '@/components/ui/dropdown'
import { Switch } from '@/components/ui/switch'
import { DatePicker } from '@/components/ui/datepicker'
import { useCurrency } from '@/composables/useCurrency'
import { useToast } from '@/composables/useToast'
import { useDateRange } from '@/composables/useDateRange'
import { exportCsv, todayStamp } from '@/lib/export'
import { financialRatios, createRatio, updateRatio, AGGREGATES } from '@/api/accounting'

/* اعدادات التحليل المالي — ratio definitions (numerator / denominator over
   statement aggregates) with their live values for the chosen period. */
const { t, locale } = useI18n()
const { sar, num } = useCurrency()
const toast = useToast()
const { from, to, range, params } = useDateRange()
const loading = ref(true)
const data = ref(null)
const dialog = ref(false)
const editing = ref(null)
const saving = ref(false)
const error = ref('')
const form = reactive({ name: '', en: '', numerator: 'net_profit', denominator: 'revenue', format: 'percent', target: 0, enabled: true })

const aggOptions = computed(() => AGGREGATES.map((k) => ({ value: k, label: t(`accounting.ratios.agg.${k}`) })))
const formatOptions = computed(() => [{ value: 'ratio', label: t('accounting.ratios.formatRatio') }, { value: 'percent', label: t('accounting.ratios.formatPercent') }])

async function load() {
  loading.value = true
  data.value = await financialRatios(params.value)
  loading.value = false
}
onMounted(load)
watch([from, to], load)

function open(r = null) {
  editing.value = r
  Object.assign(form, { name: r?.name ?? '', en: r?.en ?? '', numerator: r?.numerator ?? 'net_profit', denominator: r?.denominator ?? 'revenue', format: r?.format ?? 'percent', target: r?.target ?? 0, enabled: r?.enabled ?? true })
  error.value = ''
  dialog.value = true
}
async function save() {
  if (saving.value) return
  saving.value = true
  error.value = ''
  try {
    editing.value ? await updateRatio(editing.value.id, { ...form }) : await createRatio({ ...form })
    toast.success(t('common.saved'))
    dialog.value = false
    await load()
  } catch {
    error.value = t('common.required')
  } finally {
    saving.value = false
  }
}
async function toggle(r) {
  await updateRatio(r.id, { enabled: !r.enabled })
  await load()
}
const fmt = (r) => (r.value === null ? '—' : r.format === 'percent' ? `${num(r.value, { decimals: 1 })}%` : num(r.value, { decimals: 2 }))
const fmtTarget = (r) => (r.format === 'percent' ? `${num(r.target, { decimals: 1 })}%` : num(r.target, { decimals: 2 }))
const exportRows = () => data.value && exportCsv(`financial-analysis-${todayStamp()}`, [t('common.name'), t('accounting.ratios.numerator'), t('accounting.ratios.denominator'), t('accounting.ratios.value'), t('accounting.ratios.target')], data.value.rows.map((r) => [r.name, r.numerator, r.denominator, r.value ?? '', r.target]))
</script>

<template>
  <div class="space-y-4">
    <ReportShell :title="t('accounting.screens.analysisSettings')" :subtitle="t('accounting.ratios.hint')" :period="`${from} → ${to}`" @export="exportRows">
      <template #actions><Button size="sm" @click="open()"><Plus /> {{ t('accounting.ratios.add') }}</Button></template>
      <template #filters><DatePicker v-model="range" range class="w-auto min-w-[240px]" /></template>

      <div v-if="data" class="grid grid-cols-3 gap-2 border-b p-4 text-center text-xs sm:grid-cols-5 lg:grid-cols-9">
        <div v-for="k in AGGREGATES" :key="k" class="bg-muted/40 rounded-lg p-2"><p class="text-muted-foreground">{{ t(`accounting.ratios.agg.${k}`) }}</p><p class="mt-0.5 font-semibold tabular-nums">{{ sar(data.aggregates[k]) }}</p></div>
      </div>

      <DataTable
        :loading="loading" :rows="data?.rows ?? []" :empty="t('common.noData')"
        :columns="[
          { key: 'name', label: t('common.name'), sortable: true },
          { key: 'formula', label: t('accounting.ratios.formula'), hideBelow: 'md' },
          { key: 'value', label: t('accounting.ratios.value'), align: 'end' },
          { key: 'target', label: t('accounting.ratios.target'), align: 'end', hideBelow: 'sm' },
          { key: 'ok', label: t('common.status') },
          { key: 'enabled', label: t('accounting.ratios.enabled') },
          { key: 'actions', label: t('common.actions'), align: 'end' },
        ]"
      >
        <template #cell-name="{ row }"><span class="font-medium">{{ locale === 'ar' ? row.name : row.en }}</span></template>
        <template #cell-formula="{ row }"><span class="text-muted-foreground text-xs">{{ t(`accounting.ratios.agg.${row.numerator}`) }} ÷ {{ t(`accounting.ratios.agg.${row.denominator}`) }}</span></template>
        <template #cell-value="{ row }"><span class="font-bold tabular-nums" :class="row.ok === false ? 'text-danger' : row.ok ? 'text-success' : ''">{{ fmt(row) }}</span></template>
        <template #cell-target="{ row }"><span class="text-muted-foreground tabular-nums">{{ fmtTarget(row) }}</span></template>
        <template #cell-ok="{ row }">
          <Badge v-if="row.value === null" variant="secondary">—</Badge>
          <Badge v-else :variant="row.ok ? 'success' : 'danger'"><component :is="row.ok ? TrendingUp : TrendingDown" class="size-3" /> {{ row.ok ? t('accounting.ratios.onTarget') : t('accounting.ratios.offTarget') }}</Badge>
        </template>
        <template #cell-enabled="{ row }"><Switch :model-value="row.enabled" @update:model-value="toggle(row)" /></template>
        <template #cell-actions="{ row }">
          <button type="button" class="hover:bg-accent text-muted-foreground hover:text-foreground inline-flex size-8 items-center justify-center rounded-lg" @click="open(row)"><Pencil class="size-4" /></button>
        </template>
      </DataTable>
    </ReportShell>

    <Dialog v-model:open="dialog" :title="editing ? t('accounting.ratios.editTitle') : t('accounting.ratios.addTitle')">
      <form class="space-y-4" @submit.prevent="save">
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="space-y-1.5"><label class="text-sm font-medium">{{ t('common.name') }}</label><Input v-model="form.name" /></div>
          <div class="space-y-1.5"><label class="text-sm font-medium">{{ t('accounting.common.nameEn') }}</label><Input v-model="form.en" dir="ltr" /></div>
          <div class="space-y-1.5"><label class="text-sm font-medium">{{ t('accounting.ratios.numerator') }}</label><Dropdown v-model="form.numerator" :options="aggOptions" /></div>
          <div class="space-y-1.5"><label class="text-sm font-medium">{{ t('accounting.ratios.denominator') }}</label><Dropdown v-model="form.denominator" :options="aggOptions" /></div>
          <div class="space-y-1.5"><label class="text-sm font-medium">{{ t('accounting.ratios.format') }}</label><Dropdown v-model="form.format" :options="formatOptions" /></div>
          <div class="space-y-1.5"><label class="text-sm font-medium">{{ t('accounting.ratios.target') }}</label><Input v-model="form.target" type="number" step="0.1" dir="ltr" /></div>
        </div>
        <div class="bg-muted/40 flex items-center justify-between rounded-lg px-4 py-3"><span class="text-sm font-medium">{{ t('accounting.ratios.enabled') }}</span><Switch v-model="form.enabled" /></div>
        <p v-if="error" class="text-danger text-xs">{{ error }}</p>
      </form>
      <template #footer>
        <Button variant="ghost" @click="dialog = false">{{ t('common.cancel') }}</Button>
        <Button :disabled="saving" @click="save">{{ t('common.save') }}</Button>
      </template>
    </Dialog>
  </div>
</template>
