<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { DatePicker } from '@/components/ui/datepicker'
import { Dropdown } from '@/components/ui/dropdown'
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
  vehicleOptions: { type: Array, default: () => [] }, // [{ value, label, costCenter }]
  suppliers: { type: Array, default: () => [] }, // raw list (taxNo lookup)
  itemOptions: { type: Array, default: () => [] }, // purchase items catalog (#6)
})
const emit = defineEmits(['update:open', 'saved'])

const { t } = useI18n()
const { sar } = useCurrency()
const toast = useToast()
const saving = ref(false)
const receipt = ref(null)
const OTHER = '__other__'
const form = reactive({
  supplierId: '', itemId: '', itemType: '', qty: 1, unitPrice: '', date: new Date().toISOString().slice(0, 10),
  inclVat: false, taxable: true, vehicleId: '', costCenter: '', invoiceNo: '', supplierTaxNo: '',
})
const errors = reactive({})

watch(
  () => props.open,
  (v) => {
    if (!v) return
    Object.assign(form, { supplierId: '', itemId: '', itemType: '', qty: 1, unitPrice: '', date: new Date().toISOString().slice(0, 10), inclVat: false, taxable: true, vehicleId: '', costCenter: '', invoiceNo: '', supplierTaxNo: '' })
    receipt.value = null
    Object.keys(errors).forEach((k) => delete errors[k])
  },
)

const totals = computed(() => computeTotals(form))

// the supplier's registered tax no. prefills the invoice field; it stays editable (#6)
watch(
  () => form.supplierId,
  (id) => {
    form.supplierTaxNo = props.suppliers.find((s) => s.id === id)?.taxNo ?? ''
  },
)
const itemPickOptions = computed(() => [...props.itemOptions, { value: OTHER, label: t('purchases.fields.itemOther') }])
const isOtherItem = computed(() => form.itemId === OTHER)

// vehicle chosen → cost center derived from it (#10)
const derivedCostCenter = computed(() => {
  if (!form.vehicleId) return null
  return props.vehicleOptions.find((v) => v.value === form.vehicleId)?.costCenter ?? null
})
const derivedCostCenterName = computed(() =>
  props.costCenterOptions.find((c) => c.value === derivedCostCenter.value)?.label ?? derivedCostCenter.value,
)

async function submit() {
  if (saving.value) return
  Object.keys(errors).forEach((k) => delete errors[k])
  if (!form.supplierId) errors.supplierId = t('common.required')
  if (!form.itemId || (isOtherItem.value && !form.itemType.trim())) errors.item = t('common.required')
  if (form.supplierTaxNo && !/^3\d{13}3$/.test(form.supplierTaxNo.trim())) errors.supplierTaxNo = t('purchases.supplier.errTax')
  if (!form.vehicleId && !form.costCenter) errors.costCenter = t('common.required')
  if (!(Number(form.unitPrice) > 0)) errors.unitPrice = t('common.required')
  if (Object.keys(errors).length) return
  saving.value = true
  try {
    await createPurchase({ ...form, itemId: isOtherItem.value ? null : form.itemId })
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
          <Dropdown v-model="form.supplierId" :options="supplierOptions" :placeholder="t('purchases.fields.supplier')" :invalid="!!errors.supplierId" />
        </div>
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('purchases.fields.supplierTaxNo') }}</label>
          <Input v-model="form.supplierTaxNo" dir="ltr" inputmode="numeric" placeholder="3xxxxxxxxxxxxx3" :invalid="!!errors.supplierTaxNo" />
          <p v-if="errors.supplierTaxNo" class="text-danger text-xs">{{ errors.supplierTaxNo }}</p>
          <p v-else class="text-muted-foreground text-xs">{{ t('purchases.fields.supplierTaxNoHint') }}</p>
        </div>
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('purchases.fields.item') }}</label>
          <Dropdown v-model="form.itemId" :options="itemPickOptions" :placeholder="t('purchases.fields.itemPh')" :invalid="!!errors.item" />
        </div>
        <div v-if="isOtherItem" class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('purchases.fields.itemType') }}</label>
          <Input v-model="form.itemType" :invalid="!!errors.item" />
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
          <DatePicker v-model="form.date" />
        </div>
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('purchases.fields.vehicle') }}</label>
          <Dropdown v-model="form.vehicleId" :options="vehicleOptions" :placeholder="t('purchases.fields.noVehicle')" />
        </div>
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('purchases.fields.costCenter') }}</label>
          <Dropdown v-if="!form.vehicleId" v-model="form.costCenter" :options="costCenterOptions" :placeholder="t('purchases.fields.costCenter')" :invalid="!!errors.costCenter" />
          <div v-else class="bg-muted/40 text-muted-foreground flex h-10 items-center rounded-lg px-3 text-sm">
            {{ t('purchases.fields.derivedCostCenter') }}: {{ derivedCostCenterName }}
          </div>
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
