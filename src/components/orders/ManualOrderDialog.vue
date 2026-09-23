<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Info } from 'lucide-vue-next'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { DatePicker } from '@/components/ui/datepicker'
import { Dropdown } from '@/components/ui/dropdown'
import { Button } from '@/components/ui/button'
import { useCurrency } from '@/composables/useCurrency'
import { useToast } from '@/composables/useToast'
import { useAuthStore } from '@/stores/auth'
import { createManualOrder } from '@/api/orders'

/* Manual single-order entry (#3): order no, time, km, price, collected, rider. */
const props = defineProps({
  open: { type: Boolean, default: false },
  riderOptions: { type: Array, default: () => [] },
})
const emit = defineEmits(['update:open', 'saved'])

const { t } = useI18n()
const { sar } = useCurrency()
const toast = useToast()
const auth = useAuthStore()

const today = new Date().toISOString().slice(0, 10)
const nowTime = () => new Date().toTimeString().slice(0, 5)
const blank = () => ({ orderNo: '', riderId: '', date: today, time: nowTime(), km: '', price: '', collected: '' })
const form = reactive(blank())
const errors = reactive({})
const saving = ref(false)

watch(
  () => props.open,
  (v) => {
    if (!v) return
    Object.assign(form, blank())
    Object.keys(errors).forEach((k) => delete errors[k])
  },
)

const uncollected = computed(() => Math.max(0, (Number(form.price) || 0) - (Number(form.collected) || 0)))

function validate() {
  Object.keys(errors).forEach((k) => delete errors[k])
  if (!form.orderNo.trim()) errors.orderNo = t('orders.manual.errOrderNo')
  if (!form.riderId) errors.riderId = t('orders.manual.errRider')
  if (!(Number(form.price) > 0)) errors.price = t('common.required')
  if ((Number(form.collected) || 0) > (Number(form.price) || 0)) errors.collected = t('orders.manual.errCollected')
  return Object.keys(errors).length === 0
}

async function submit() {
  if (saving.value || !validate()) return
  saving.value = true
  try {
    await createManualOrder({ ...form, by: auth.user?.name })
    toast.success(t('orders.manual.saved'))
    emit('saved')
    emit('update:open', false)
  } catch (e) {
    if (e.message === 'DUPLICATE_ORDER') errors.orderNo = t('orders.manual.errDuplicate')
    else if (e.message === 'FUTURE_DATE') toast.error(t('orders.futureDate'))
    else if (e.message === 'COLLECTED_EXCEEDS_PRICE') errors.collected = t('orders.manual.errCollected')
    else toast.error(t('common.required'))
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <Dialog :open="open" :title="t('orders.manual.title')" @update:open="emit('update:open', $event)">
    <form class="space-y-4" @submit.prevent="submit">
      <p class="bg-primary/5 text-muted-foreground flex items-start gap-2 rounded-lg px-3 py-2 text-xs">
        <Info class="text-primary mt-0.5 size-3.5 shrink-0" /> {{ t('orders.manual.hint') }}
      </p>

      <div class="grid gap-4 sm:grid-cols-2">
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('orders.manual.orderNo') }}</label>
          <Input v-model="form.orderNo" dir="ltr" :placeholder="t('orders.manual.orderNoPh')" :invalid="!!errors.orderNo" />
          <p v-if="errors.orderNo" class="text-danger text-xs">{{ errors.orderNo }}</p>
        </div>
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('orders.manual.rider') }}</label>
          <Dropdown v-model="form.riderId" :options="riderOptions" :placeholder="t('orders.manual.riderPh')" :invalid="!!errors.riderId" />
          <p v-if="errors.riderId" class="text-danger text-xs">{{ errors.riderId }}</p>
        </div>
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('orders.fields.date') }}</label>
          <DatePicker v-model="form.date" :max="today" :clearable="false" />
        </div>
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('orders.manual.time') }}</label>
          <Input v-model="form.time" type="time" dir="ltr" />
        </div>
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('orders.manual.km') }}</label>
          <Input v-model="form.km" type="number" step="0.1" min="0" dir="ltr" placeholder="0" />
        </div>
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('orders.manual.price') }}</label>
          <Input v-model="form.price" type="number" step="0.5" min="0" dir="ltr" placeholder="0" :invalid="!!errors.price" />
          <p v-if="errors.price" class="text-danger text-xs">{{ errors.price }}</p>
        </div>
        <div class="space-y-1.5 sm:col-span-2">
          <label class="text-sm font-medium">{{ t('orders.manual.collected') }}</label>
          <Input v-model="form.collected" type="number" step="0.5" min="0" dir="ltr" placeholder="0" :invalid="!!errors.collected" />
          <p v-if="errors.collected" class="text-danger text-xs">{{ errors.collected }}</p>
        </div>
      </div>

      <div class="bg-muted/40 flex items-center justify-between rounded-xl px-4 py-3 text-sm">
        <span class="text-muted-foreground">{{ t('orders.manual.uncollected') }}</span>
        <span class="font-semibold tabular-nums" :class="uncollected ? 'text-warning-foreground' : 'text-success'">{{ sar(uncollected) }}</span>
      </div>
    </form>
    <template #footer>
      <Button variant="ghost" @click="emit('update:open', false)">{{ t('common.cancel') }}</Button>
      <Button :disabled="saving" @click="submit">{{ t('common.save') }}</Button>
    </template>
  </Dialog>
</template>
