<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Sparkles, Lock } from 'lucide-vue-next'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { DatePicker } from '@/components/ui/datepicker'
import { Dropdown } from '@/components/ui/dropdown'
import { FileDrop } from '@/components/ui/file-drop'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useCurrency } from '@/composables/useCurrency'
import { useToast } from '@/composables/useToast'
import { computeSalesTotals, createSalesInvoice, parseSalesSheet } from '@/api/sales'

/* Register a partner sheet (Hunger Station …) as a sales invoice (#7).
   The invoice is entered as one amount before tax (the sheet prefills it);
   VAT is computed and added automatically — never typed by hand. */
const props = defineProps({
  open: { type: Boolean, default: false },
  contractOptions: { type: Array, default: () => [] },
})
const emit = defineEmits(['update:open', 'saved'])

const { t } = useI18n()
const { sar, num } = useCurrency()
const toast = useToast()

const today = new Date().toISOString().slice(0, 10)
const thisMonth = today.slice(0, 7)
const blank = () => ({ contract: '', period: thisMonth, date: today, amount: '', notes: '' })
const form = reactive(blank())
const sheet = ref(null)
const parsing = ref(false)
const parsedCount = ref(0)
const errors = reactive({})
const saving = ref(false)

watch(
  () => props.open,
  (v) => {
    if (!v) return
    Object.assign(form, blank())
    sheet.value = null
    parsedCount.value = 0
    Object.keys(errors).forEach((k) => delete errors[k])
  },
)

// a dropped sheet prefills the invoice
watch(sheet, async (f) => {
  if (!f) return
  parsing.value = true
  const parsed = await parseSalesSheet(f)
  Object.assign(form, { contract: parsed.contract, period: parsed.period, amount: parsed.amount })
  parsedCount.value = parsed.rows
  parsing.value = false
})

const totals = computed(() => computeSalesTotals(form))
const vatPct = computed(() => Math.round(totals.value.vatRate * 100))

async function submit() {
  if (saving.value) return
  Object.keys(errors).forEach((k) => delete errors[k])
  if (!form.contract) errors.contract = t('sales.errContract')
  if (totals.value.preTax <= 0) errors.amount = t('sales.errPreTax')
  if (Object.keys(errors).length) return
  saving.value = true
  try {
    const inv = await createSalesInvoice({ ...form, sheet: sheet.value })
    toast.success(t('sales.saved', { ref: inv.ref }))
    emit('saved')
    emit('update:open', false)
  } catch (e) {
    if (e.message === 'DUPLICATE_PERIOD') errors.contract = t('sales.errDuplicate')
    else errors.amount = t('sales.errPreTax')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <Dialog :open="open" size="lg" :title="t('sales.newTitle')" @update:open="emit('update:open', $event)">
    <form class="space-y-4" @submit.prevent="submit">
      <div class="space-y-1.5">
        <label class="text-sm font-medium">{{ t('sales.sheet') }}</label>
        <FileDrop v-model="sheet" accept=".xlsx,.xls,.csv,application/pdf" :hint="t('sales.sheetHint')" />
        <p v-if="parsing" class="text-muted-foreground text-xs">…</p>
        <p v-else-if="parsedCount" class="text-success flex items-center gap-1 text-xs"><Sparkles class="size-3.5" /> {{ t('sales.parsed', { n: num(parsedCount) }) }}</p>
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('sales.contract') }}</label>
          <Dropdown v-model="form.contract" :options="contractOptions" :placeholder="t('sales.contractPh')" :invalid="!!errors.contract" />
          <p v-if="errors.contract" class="text-danger text-xs">{{ errors.contract }}</p>
        </div>
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('sales.period') }}</label>
          <Input v-model="form.period" type="month" dir="ltr" />
        </div>
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('sales.date') }}</label>
          <DatePicker v-model="form.date" :clearable="false" />
        </div>
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('sales.amountPreTax') }}</label>
          <Input v-model="form.amount" type="number" step="0.01" min="0" dir="ltr" placeholder="0.00" :invalid="!!errors.amount" />
          <p v-if="errors.amount" class="text-danger text-xs">{{ errors.amount }}</p>
        </div>
      </div>

      <!-- totals: VAT is derived, locked -->
      <div class="bg-muted/40 grid grid-cols-3 gap-2 rounded-xl p-4 text-center text-sm">
        <div><p class="text-muted-foreground text-xs">{{ t('sales.preTax') }}</p><p class="mt-1 font-semibold tabular-nums">{{ sar(totals.preTax, { decimals: 2 }) }}</p></div>
        <div>
          <p class="text-muted-foreground flex items-center justify-center gap-1 text-xs"><Lock class="size-3" /> {{ t('sales.vat', { rate: vatPct }) }}</p>
          <p class="text-orange mt-1 font-semibold tabular-nums">{{ sar(totals.vat, { decimals: 2 }) }}</p>
        </div>
        <div><p class="text-muted-foreground text-xs">{{ t('sales.total') }}</p><p class="mt-1 font-bold tabular-nums">{{ sar(totals.total, { decimals: 2 }) }}</p></div>
      </div>
      <p class="text-muted-foreground text-xs">{{ t('sales.vatAuto') }}</p>

      <div class="space-y-1.5">
        <label class="text-sm font-medium">{{ t('common.notes') }}</label>
        <Textarea v-model="form.notes" :rows="2" />
      </div>
    </form>
    <template #footer>
      <Button variant="ghost" @click="emit('update:open', false)">{{ t('common.cancel') }}</Button>
      <Button :disabled="saving || parsing" @click="submit">{{ t('common.save') }}</Button>
    </template>
  </Dialog>
</template>
