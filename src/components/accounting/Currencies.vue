<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { Plus, Pencil, Star } from 'lucide-vue-next'
import { Card } from '@/components/ui/card'
import { DataTable } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { useCurrency } from '@/composables/useCurrency'
import { useToast } from '@/composables/useToast'
import { fetchCurrencies, createCurrency, updateCurrency, setBaseCurrency } from '@/api/accounting'

const { t, locale } = useI18n()
const { num } = useCurrency()
const toast = useToast()
const loading = ref(true)
const rows = ref([])
const dialog = ref(false)
const editing = ref(null)
const saving = ref(false)
const form = reactive({ code: '', name: '', en: '', symbol: '', rate: 1, active: true })
const error = ref('')

async function load() {
  loading.value = true
  rows.value = await fetchCurrencies()
  loading.value = false
}
onMounted(load)

function open(c = null) {
  editing.value = c
  Object.assign(form, { code: c?.code ?? '', name: c?.name ?? '', en: c?.en ?? '', symbol: c?.symbol ?? '', rate: c?.rate ?? 1, active: c?.active ?? true })
  error.value = ''
  dialog.value = true
}
const ERR = { CODE_INVALID: 'accounting.currencies.errCode', DUPLICATE: 'accounting.currencies.errDuplicate', BASE_LOCKED: 'accounting.currencies.errBase' }
async function save() {
  if (saving.value) return
  saving.value = true
  error.value = ''
  try {
    editing.value ? await updateCurrency(editing.value.id, { ...form }) : await createCurrency({ ...form })
    toast.success(t('common.saved'))
    dialog.value = false
    await load()
  } catch (e) {
    error.value = t(ERR[e.message] ?? 'journal.errGeneric')
  } finally {
    saving.value = false
  }
}
async function makeBase(c) {
  await setBaseCurrency(c.id)
  toast.success(t('accounting.currencies.baseSet', { code: c.code }))
  await load()
}
const label = (c) => (locale.value === 'ar' ? c.name : c.en)
const columns = computed(() => [
  { key: 'code', label: t('accounting.currencies.code'), sortable: true },
  { key: 'name', label: t('common.name'), sortable: true },
  { key: 'symbol', label: t('accounting.currencies.symbol') },
  { key: 'rate', label: t('accounting.currencies.rate'), align: 'end', sortable: true },
  { key: 'active', label: t('common.status') },
  { key: 'actions', label: t('common.actions'), align: 'end' },
])
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <p class="text-muted-foreground text-sm">{{ t('accounting.currencies.hint') }}</p>
      <Button @click="open()"><Plus /> {{ t('accounting.currencies.add') }}</Button>
    </div>
    <Card class="overflow-hidden">
      <DataTable :loading="loading" :rows="rows" :empty="t('common.noData')" :columns="columns">
        <template #cell-code="{ row }"><span dir="ltr" class="inline-flex items-center gap-1.5 font-mono font-semibold">{{ row.code }} <Star v-if="row.isBase" class="text-orange size-3.5" /></span></template>
        <template #cell-name="{ row }">{{ label(row) }}<Badge v-if="row.isBase" variant="accent" class="ms-2">{{ t('accounting.currencies.base') }}</Badge></template>
        <template #cell-rate="{ row }"><span class="tabular-nums" dir="ltr">{{ num(row.rate, { decimals: 4 }) }}</span></template>
        <template #cell-active="{ row }"><Badge :variant="row.active ? 'success' : 'secondary'">{{ row.active ? t('common.active') : t('common.inactive') }}</Badge></template>
        <template #cell-actions="{ row }">
          <div class="flex items-center justify-end gap-1">
            <Button v-if="!row.isBase && row.active" size="sm" variant="ghost" @click="makeBase(row)"><Star /> {{ t('accounting.currencies.setBase') }}</Button>
            <button type="button" class="hover:bg-accent text-muted-foreground hover:text-foreground inline-flex size-8 items-center justify-center rounded-lg" @click="open(row)"><Pencil class="size-4" /></button>
          </div>
        </template>
      </DataTable>
    </Card>

    <Dialog v-model:open="dialog" :title="editing ? t('accounting.currencies.editTitle') : t('accounting.currencies.addTitle')">
      <form class="space-y-4" @submit.prevent="save">
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="space-y-1.5">
            <label class="text-sm font-medium">{{ t('accounting.currencies.code') }}</label>
            <Input v-model="form.code" dir="ltr" maxlength="3" class="uppercase" :disabled="!!editing" placeholder="USD" />
          </div>
          <div class="space-y-1.5">
            <label class="text-sm font-medium">{{ t('accounting.currencies.symbol') }}</label>
            <Input v-model="form.symbol" />
          </div>
          <div class="space-y-1.5">
            <label class="text-sm font-medium">{{ t('common.name') }}</label>
            <Input v-model="form.name" />
          </div>
          <div class="space-y-1.5">
            <label class="text-sm font-medium">{{ t('accounting.common.nameEn') }}</label>
            <Input v-model="form.en" dir="ltr" />
          </div>
          <div class="space-y-1.5">
            <label class="text-sm font-medium">{{ t('accounting.currencies.rate') }}</label>
            <Input v-model="form.rate" type="number" step="0.0001" min="0" dir="ltr" :disabled="!!editing?.isBase" />
            <p class="text-muted-foreground text-xs">{{ t('accounting.currencies.rateHint') }}</p>
          </div>
          <div class="bg-muted/40 flex items-center justify-between self-end rounded-lg px-4 py-3">
            <span class="text-sm font-medium">{{ t('common.status') }}</span>
            <Switch v-model="form.active" :disabled="!!editing?.isBase" />
          </div>
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
