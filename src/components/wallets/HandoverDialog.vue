<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Info } from 'lucide-vue-next'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { DatePicker } from '@/components/ui/datepicker'
import { Textarea } from '@/components/ui/textarea'
import { FileDrop } from '@/components/ui/file-drop'
import { Button } from '@/components/ui/button'
import { useCurrency } from '@/composables/useCurrency'
import { useToast } from '@/composables/useToast'
import { recordHandover } from '@/api/wallets'

/* Cash handover (#4b): the receipt image is mandatory; the deposit then waits
   for the accountant's approval. */
const props = defineProps({
  open: { type: Boolean, default: false },
  rider: { type: Object, default: null }, // wallet row: { id, name, balance, pending, available, treasuryName }
})
const emit = defineEmits(['update:open', 'saved'])

const { t } = useI18n()
const { sar } = useCurrency()
const toast = useToast()
const saving = ref(false)
const form = reactive({ amount: '', date: new Date().toISOString().slice(0, 10), note: '', receipt: null })
const errors = reactive({})

const available = computed(() => props.rider?.available ?? props.rider?.balance ?? 0)

watch(
  () => props.open,
  (v) => {
    if (!v) return
    Object.assign(form, { amount: '', date: new Date().toISOString().slice(0, 10), note: '', receipt: null })
    Object.keys(errors).forEach((k) => delete errors[k])
  },
)

async function submit() {
  if (saving.value) return
  Object.keys(errors).forEach((k) => delete errors[k])
  if (!(Number(form.amount) > 0)) errors.amount = t('wallets.invalidAmount')
  else if (Number(form.amount) > available.value) errors.amount = t('wallets.exceedsBalance')
  if (!form.receipt) errors.receipt = t('wallets.receiptRequired')
  if (Object.keys(errors).length) return
  saving.value = true
  try {
    await recordHandover(props.rider.id, form)
    toast.success(t('wallets.submittedPending'))
    emit('saved')
    emit('update:open', false)
  } catch (e) {
    if (e.message === 'RECEIPT_REQUIRED') errors.receipt = t('wallets.receiptRequired')
    else if (e.message === 'EXCEEDS_BALANCE') errors.amount = t('wallets.exceedsBalance')
    else errors.amount = t('wallets.invalidAmount')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <Dialog :open="open" :title="t('wallets.handoverTitle')" :description="rider?.name" @update:open="emit('update:open', $event)">
    <form class="space-y-4" @submit.prevent="submit">
      <div class="bg-muted/40 grid grid-cols-2 gap-2 rounded-xl p-3 text-center text-sm">
        <div><p class="text-muted-foreground text-xs">{{ t('wallets.balance') }}</p><p class="mt-0.5 font-semibold tabular-nums">{{ sar(rider?.balance) }}</p></div>
        <div><p class="text-muted-foreground text-xs">{{ t('wallets.available') }}</p><p class="text-primary mt-0.5 font-semibold tabular-nums">{{ sar(available) }}</p></div>
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('wallets.amount') }}</label>
          <Input v-model="form.amount" type="number" dir="ltr" :invalid="!!errors.amount" />
          <p v-if="errors.amount" class="text-danger text-xs">{{ errors.amount }}</p>
        </div>
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('common.date') }}</label>
          <DatePicker v-model="form.date" :clearable="false" />
        </div>
      </div>

      <div class="space-y-1.5">
        <label class="text-sm font-medium">{{ t('wallets.receipt') }} <span class="text-danger">*</span></label>
        <FileDrop v-model="form.receipt" accept="image/*,application/pdf" />
        <p v-if="errors.receipt" class="text-danger text-xs">{{ errors.receipt }}</p>
      </div>

      <div class="space-y-1.5">
        <label class="text-sm font-medium">{{ t('wallets.note') }}</label>
        <Textarea v-model="form.note" :rows="2" />
      </div>

      <p class="text-muted-foreground flex items-start gap-2 text-xs">
        <Info class="mt-0.5 size-3.5 shrink-0" /> {{ t('wallets.handoverHint') }}
      </p>
    </form>
    <template #footer>
      <Button variant="ghost" @click="emit('update:open', false)">{{ t('common.cancel') }}</Button>
      <Button :disabled="saving" @click="submit">{{ t('common.save') }}</Button>
    </template>
  </Dialog>
</template>
