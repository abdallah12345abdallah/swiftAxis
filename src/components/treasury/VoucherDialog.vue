<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Info } from 'lucide-vue-next'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { DatePicker } from '@/components/ui/datepicker'
import { Dropdown } from '@/components/ui/dropdown'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useToast } from '@/composables/useToast'
import { createReceipt, createPayment } from '@/api/treasury'

/* Receipt (money in) or payment (money out) voucher. A payment picks an
   expense item — its GL account is used — and may target any cost center,
   which is how the warehouse charges a vehicle (#6). */
const props = defineProps({
  open: { type: Boolean, default: false },
  mode: { type: String, default: 'payment' }, // receipt | payment
  treasuryOptions: { type: Array, default: () => [] },
  accountOptions: { type: Array, default: () => [] }, // counter accounts for receipts
  expenseItemOptions: { type: Array, default: () => [] },
  costCenterOptions: { type: Array, default: () => [] },
  defaultTreasury: { type: String, default: '' },
})
const emit = defineEmits(['update:open', 'saved'])

const { t } = useI18n()
const toast = useToast()
const isPayment = computed(() => props.mode === 'payment')
const saving = ref(false)
const form = reactive({ treasuryId: '', date: new Date().toISOString().slice(0, 10), amount: '', party: '', description: '', account: 'delivery_revenue', expenseItem: '', costCenter: '' })
const errors = reactive({})

const ccOptions = computed(() => [{ value: '', label: t('treasury.voucher.costCenterPh') }, ...props.costCenterOptions])

watch(
  () => props.open,
  (v) => {
    if (!v) return
    Object.assign(form, { treasuryId: props.defaultTreasury || props.treasuryOptions[0]?.value || '', date: new Date().toISOString().slice(0, 10), amount: '', party: '', description: '', account: 'delivery_revenue', expenseItem: props.expenseItemOptions[0]?.value || '', costCenter: '' })
    Object.keys(errors).forEach((k) => delete errors[k])
  },
)

async function submit() {
  if (saving.value) return
  Object.keys(errors).forEach((k) => delete errors[k])
  if (!form.treasuryId) errors.treasuryId = t('treasury.voucher.errTreasury')
  if (!(Number(form.amount) > 0)) errors.amount = t('treasury.voucher.errAmount')
  if (isPayment.value && !form.expenseItem) errors.expenseItem = t('common.required')
  if (Object.keys(errors).length) return
  saving.value = true
  try {
    const row = isPayment.value
      ? await createPayment({ treasuryId: form.treasuryId, date: form.date, amount: form.amount, party: form.party, description: form.description, expenseItem: form.expenseItem, costCenter: form.costCenter || null })
      : await createReceipt({ treasuryId: form.treasuryId, date: form.date, amount: form.amount, party: form.party, description: form.description, account: form.account })
    toast.success(t('treasury.voucher.saved', { ref: row.ref }))
    emit('saved')
    emit('update:open', false)
  } catch {
    errors.amount = t('treasury.voucher.errAmount')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <Dialog :open="open" :title="isPayment ? t('treasury.voucher.newPayment') : t('treasury.voucher.newReceipt')" @update:open="emit('update:open', $event)">
    <form class="space-y-4" @submit.prevent="submit">
      <div class="grid gap-4 sm:grid-cols-2">
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('treasury.voucher.treasury') }}</label>
          <Dropdown v-model="form.treasuryId" :options="treasuryOptions" :invalid="!!errors.treasuryId" />
        </div>
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('common.date') }}</label>
          <DatePicker v-model="form.date" :clearable="false" />
        </div>
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('common.amount') }}</label>
          <Input v-model="form.amount" type="number" dir="ltr" :invalid="!!errors.amount" />
          <p v-if="errors.amount" class="text-danger text-xs">{{ errors.amount }}</p>
        </div>
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ isPayment ? t('treasury.voucher.party') : t('treasury.voucher.payer') }}</label>
          <Input v-model="form.party" />
        </div>

        <template v-if="isPayment">
          <div class="space-y-1.5">
            <label class="text-sm font-medium">{{ t('treasury.voucher.expenseItem') }}</label>
            <Dropdown v-model="form.expenseItem" :options="expenseItemOptions" :placeholder="t('treasury.voucher.expenseItemPh')" :invalid="!!errors.expenseItem" />
          </div>
          <div class="space-y-1.5">
            <label class="text-sm font-medium">{{ t('treasury.voucher.costCenter') }}</label>
            <Dropdown v-model="form.costCenter" :options="ccOptions" />
          </div>
        </template>
        <div v-else class="space-y-1.5 sm:col-span-2">
          <label class="text-sm font-medium">{{ t('treasury.voucher.account') }}</label>
          <Dropdown v-model="form.account" :options="accountOptions" />
        </div>
      </div>

      <div class="space-y-1.5">
        <label class="text-sm font-medium">{{ t('treasury.voucher.description') }}</label>
        <Textarea v-model="form.description" :rows="2" />
      </div>

      <p v-if="isPayment" class="text-muted-foreground flex items-start gap-2 text-xs">
        <Info class="mt-0.5 size-3.5 shrink-0" /> {{ t('treasury.voucher.costCenterHint') }}
      </p>
    </form>
    <template #footer>
      <Button variant="ghost" @click="emit('update:open', false)">{{ t('common.cancel') }}</Button>
      <Button :disabled="saving" @click="submit">{{ t('common.save') }}</Button>
    </template>
  </Dialog>
</template>
