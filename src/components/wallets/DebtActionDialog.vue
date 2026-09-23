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
import RiderCode from '@/components/common/RiderCode.vue'
import { useCurrency } from '@/composables/useCurrency'
import { useToast } from '@/composables/useToast'
import { useAuthStore } from '@/stores/auth'
import { convertToDebt, createNotice } from '@/api/wallets'

/* Two accountant actions on a rider's money (#4b):
   - convert: move the remaining (un-deposited) wallet balance into a debt
   - notice:  issue a debit / credit notice (a credit can also collect cash) */
const props = defineProps({
  open: { type: Boolean, default: false },
  mode: { type: String, default: 'convert' }, // convert | notice
  rider: { type: Object, default: null }, // { id, name, wallet|balance, pending, debt }
  treasuryOptions: { type: Array, default: () => [] },
})
const emit = defineEmits(['update:open', 'saved'])

const { t } = useI18n()
const { sar } = useCurrency()
const toast = useToast()
const auth = useAuthStore()

const saving = ref(false)
const form = reactive({ type: 'debit', amount: '', date: new Date().toISOString().slice(0, 10), note: '', treasuryId: '' })
const errors = reactive({})

const available = computed(() => Math.max(0, (props.rider?.wallet ?? props.rider?.balance ?? 0) - (props.rider?.pending ?? 0)))
const isConvert = computed(() => props.mode === 'convert')
const typeOptions = computed(() => [
  { value: 'debit', label: t('wallets.debts.debit') },
  { value: 'credit', label: t('wallets.debts.credit') },
])
const settleOptions = computed(() => [{ value: '', label: t('wallets.debts.noSettle') }, ...props.treasuryOptions])

watch(
  () => props.open,
  (v) => {
    if (!v) return
    Object.assign(form, { type: 'debit', amount: isConvert.value ? available.value || '' : '', date: new Date().toISOString().slice(0, 10), note: '', treasuryId: '' })
    Object.keys(errors).forEach((k) => delete errors[k])
  },
)

async function submit() {
  if (saving.value) return
  Object.keys(errors).forEach((k) => delete errors[k])
  const amt = Number(form.amount) || 0
  if (amt <= 0) errors.amount = t('wallets.invalidAmount')
  else if (isConvert.value && amt > available.value) errors.amount = t('wallets.exceedsBalance')
  if (Object.keys(errors).length) return
  saving.value = true
  try {
    if (isConvert.value) {
      await convertToDebt(props.rider.id, { amount: amt, date: form.date, note: form.note, by: auth.user?.name })
      toast.success(t('wallets.debts.converted'))
    } else {
      await createNotice(props.rider.id, { type: form.type, amount: amt, date: form.date, note: form.note, treasuryId: form.type === 'credit' ? form.treasuryId || null : null, by: auth.user?.name })
      toast.success(t('wallets.debts.saved'))
    }
    emit('saved')
    emit('update:open', false)
  } catch (e) {
    errors.amount = e.message === 'EXCEEDS_BALANCE' ? t('wallets.exceedsBalance') : t('wallets.invalidAmount')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <Dialog :open="open" :title="isConvert ? t('wallets.debts.convertTitle') : t('wallets.debts.noticeTitle')" @update:open="emit('update:open', $event)">
    <form v-if="rider" class="space-y-4" @submit.prevent="submit">
      <div class="bg-muted/40 rounded-xl p-3 text-sm">
        <div class="flex items-center gap-2 font-semibold">{{ rider.name }} <RiderCode :code="rider.id" /></div>
        <div class="mt-2 grid grid-cols-3 gap-2 text-center">
          <div><p class="text-muted-foreground text-xs">{{ t('wallets.balance') }}</p><p class="font-semibold tabular-nums">{{ sar(rider.wallet ?? rider.balance) }}</p></div>
          <div><p class="text-muted-foreground text-xs">{{ t('wallets.available') }}</p><p class="text-primary font-semibold tabular-nums">{{ sar(available) }}</p></div>
          <div><p class="text-muted-foreground text-xs">{{ t('wallets.debt') }}</p><p class="text-danger font-semibold tabular-nums">{{ sar(rider.debt) }}</p></div>
        </div>
      </div>

      <div v-if="!isConvert" class="space-y-1.5">
        <label class="text-sm font-medium">{{ t('wallets.debts.noticeType') }}</label>
        <Dropdown v-model="form.type" :options="typeOptions" />
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

      <div v-if="!isConvert && form.type === 'credit'" class="space-y-1.5">
        <label class="text-sm font-medium">{{ t('wallets.debts.settleInto') }}</label>
        <Dropdown v-model="form.treasuryId" :options="settleOptions" />
      </div>

      <div class="space-y-1.5">
        <label class="text-sm font-medium">{{ t('common.notes') }}</label>
        <Textarea v-model="form.note" :rows="2" />
      </div>

      <p v-if="isConvert" class="text-muted-foreground flex items-start gap-2 text-xs">
        <Info class="mt-0.5 size-3.5 shrink-0" /> {{ t('wallets.debts.convertHint') }}
      </p>
    </form>
    <template #footer>
      <Button variant="ghost" @click="emit('update:open', false)">{{ t('common.cancel') }}</Button>
      <Button :disabled="saving" @click="submit">{{ isConvert ? t('wallets.debts.convert') : t('common.save') }}</Button>
    </template>
  </Dialog>
</template>
