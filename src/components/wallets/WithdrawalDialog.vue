<script setup>
import { ref, reactive, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Info } from 'lucide-vue-next'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { DatePicker } from '@/components/ui/datepicker'
import { Dropdown } from '@/components/ui/dropdown'
import { Button } from '@/components/ui/button'
import { useToast } from '@/composables/useToast'
import { useAuthStore } from '@/stores/auth'
import { createWithdrawal } from '@/api/wallets'

/* Withdrawal from a rider's balance (#4b) — a payment voucher is created automatically. */
const props = defineProps({
  open: { type: Boolean, default: false },
  riderOptions: { type: Array, default: () => [] },
  treasuryOptions: { type: Array, default: () => [] },
  defaultTreasury: { type: String, default: '' },
  riderId: { type: String, default: '' },
})
const emit = defineEmits(['update:open', 'saved'])

const { t } = useI18n()
const toast = useToast()
const auth = useAuthStore()
const saving = ref(false)
const form = reactive({ riderId: '', amount: '', date: new Date().toISOString().slice(0, 10), reason: '', treasuryId: '' })
const errors = reactive({})

watch(
  () => props.open,
  (v) => {
    if (!v) return
    Object.assign(form, { riderId: props.riderId || '', amount: '', date: new Date().toISOString().slice(0, 10), reason: '', treasuryId: props.defaultTreasury || props.treasuryOptions[0]?.value || '' })
    Object.keys(errors).forEach((k) => delete errors[k])
  },
)

async function submit() {
  if (saving.value) return
  Object.keys(errors).forEach((k) => delete errors[k])
  if (!form.riderId) errors.riderId = t('common.required')
  if (!(Number(form.amount) > 0)) errors.amount = t('wallets.invalidAmount')
  if (!form.treasuryId) errors.treasuryId = t('common.required')
  if (Object.keys(errors).length) return
  saving.value = true
  try {
    const wd = await createWithdrawal(form.riderId, { ...form, by: auth.user?.name })
    toast.success(t('wallets.withdrawals.saved', { ref: wd.voucherRef }))
    emit('saved')
    emit('update:open', false)
  } catch {
    errors.amount = t('wallets.invalidAmount')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <Dialog :open="open" :title="t('wallets.withdrawals.title')" @update:open="emit('update:open', $event)">
    <form class="space-y-4" @submit.prevent="submit">
      <div class="space-y-1.5">
        <label class="text-sm font-medium">{{ t('dashboard.table.rider') }}</label>
        <Dropdown v-model="form.riderId" :options="riderOptions" :placeholder="t('orders.manual.riderPh')" :invalid="!!errors.riderId" />
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
        <label class="text-sm font-medium">{{ t('wallets.withdrawals.reason') }}</label>
        <Input v-model="form.reason" :placeholder="t('wallets.withdrawals.reasonPh')" />
      </div>
      <div class="space-y-1.5">
        <label class="text-sm font-medium">{{ t('wallets.withdrawals.treasury') }}</label>
        <Dropdown v-model="form.treasuryId" :options="treasuryOptions" :invalid="!!errors.treasuryId" />
      </div>
      <p class="text-muted-foreground flex items-start gap-2 text-xs">
        <Info class="mt-0.5 size-3.5 shrink-0" /> {{ t('wallets.withdrawals.hint') }}
      </p>
    </form>
    <template #footer>
      <Button variant="ghost" @click="emit('update:open', false)">{{ t('common.cancel') }}</Button>
      <Button :disabled="saving" @click="submit">{{ t('common.save') }}</Button>
    </template>
  </Dialog>
</template>
