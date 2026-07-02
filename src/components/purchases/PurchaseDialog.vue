<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { FileDrop } from '@/components/ui/file-drop'
import { Button } from '@/components/ui/button'
import { useCurrency } from '@/composables/useCurrency'
import { useToast } from '@/composables/useToast'
import { computeTotals, createPurchase } from '@/api/purchases'

const props = defineProps({
  open: { type: Boolean, default: false },
  supplierOptions: { type: Array, default: () => [] },
  costCenterOptions: { type: Array, default: () => [] },
})
const emit = defineEmits(['update:open', 'saved'])

const { t } = useI18n()
const { sar } = useCurrency()
const toast = useToast()
const saving = ref(false)
const receipt = ref(null)
const form = reactive({
  supplierId: '', itemType: '', qty: 1, unitPrice: '', date: new Date().toISOString().slice(0, 10),
  inclVat: false, taxable: true, costCenter: '', invoiceNo: '',
})
const errors = reactive({})

watch(
  () => props.open,
  (v) => {
    if (!v) return
    Object.assign(form, { supplierId: '', itemType: '', qty: 1, unitPrice: '', date: new Date().toISOString().slice(0, 10), inclVat: false, taxable: true, costCenter: '', invoiceNo: '' })
    receipt.value = null
    Object.keys(errors).forEach((k) => delete errors[k])
  },
)

const totals = computed(() => computeTotals(form))

async function submit() {
  if (saving.value) return
  Object.keys(errors).forEach((k) => delete errors[k])
  if (!form.supplierId) errors.supplierId = t('common.required')
  if (!form.costCenter) errors.costCenter = t('common.required')
  if (!(Number(form.unitPrice) > 0)) errors.unitPrice = t('common.required')
  if (Object.keys(errors).length) return
  saving.value = true
  try {
    await createPurchase({ ...form })
    toast.success(t('purchases.saved'))
    emit('saved')
    emit('update:open', false)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <Dialog :open="open" size="lg" :title="t('purchases.purchaseTitle')" @update:open="emit('update:open', $event)">
    <form class="space-y-4" @submit.prevent="submit">
      <div class="grid gap-4 sm:grid-cols-2">
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('purchases.fields.supplier') }}</label>
          <Select v-model="form.supplierId" :options="supplierOptions" :placeholder="t('purchases.fields.supplier')" :invalid="!!errors.supplierId" />
        </div>
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('purchases.fields.itemType') }}</label>
          <Input v-model="form.itemType" />
        </div>
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('purchases.fields.qty') }}</label>
          <Input v-model="form.qty" type="number" dir="ltr" />
        </div>
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('purchases.fields.unitPrice') }}</label>
          <Input v-model="form.unitPrice" type="number" dir="ltr" :invalid="!!errors.unitPrice" />
        </div>
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('purchases.fields.date') }}</label>
          <Input v-model="form.date" type="date" dir="ltr" />
        </div>
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('purchases.fields.costCenter') }}</label>
          <Select v-model="form.costCenter" :options="costCenterOptions" :placeholder="t('purchases.fields.costCenter')" :invalid="!!errors.costCenter" />
        </div>
        <div class="space-y-1.5 sm:col-span-2">
          <label class="text-sm font-medium">{{ t('purchases.fields.invoiceNo') }}</label>
          <Input v-model="form.invoiceNo" dir="ltr" />
        </div>
      </div>

      <div class="flex flex-wrap gap-4">
        <label class="flex cursor-pointer items-center gap-2 text-sm"><Switch v-model="form.taxable" /> {{ t('purchases.fields.taxable') }}</label>
        <label v-if="form.taxable" class="flex cursor-pointer items-center gap-2 text-sm"><Switch v-model="form.inclVat" /> {{ t('purchases.fields.inclVat') }}</label>
      </div>

      <!-- computed totals -->
      <div class="bg-muted/40 grid grid-cols-3 gap-2 rounded-xl p-4 text-center text-sm">
        <div><p class="text-muted-foreground text-xs">{{ t('purchases.fields.preTax') }}</p><p class="mt-1 font-semibold tabular-nums">{{ sar(totals.preTax) }}</p></div>
        <div><p class="text-muted-foreground text-xs">{{ t('purchases.fields.vat') }}</p><p class="text-orange mt-1 font-semibold tabular-nums">{{ sar(totals.vat) }}</p></div>
        <div><p class="text-muted-foreground text-xs">{{ t('purchases.fields.total') }}</p><p class="mt-1 font-bold tabular-nums">{{ sar(totals.total) }}</p></div>
      </div>

      <div class="space-y-1.5">
        <label class="text-sm font-medium">{{ t('purchases.fields.receipt') }}</label>
        <FileDrop v-model="receipt" />
      </div>
    </form>
    <template #footer>
      <Button variant="ghost" @click="emit('update:open', false)">{{ t('common.cancel') }}</Button>
      <Button :disabled="saving" @click="submit">{{ t('common.save') }}</Button>
    </template>
  </Dialog>
</template>
