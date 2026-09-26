<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Info, FileText, Gauge } from 'lucide-vue-next'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { DatePicker } from '@/components/ui/datepicker'
import { Dropdown } from '@/components/ui/dropdown'
import { Textarea } from '@/components/ui/textarea'
import { FileDrop } from '@/components/ui/file-drop'
import { Button } from '@/components/ui/button'
import { useCurrency } from '@/composables/useCurrency'
import { useDate } from '@/lib/format'
import { useToast } from '@/composables/useToast'
import { useAuthStore } from '@/stores/auth'
import { createReceipt } from '@/api/vehicles'

/* Receipt voucher (سند استلام): always made from an open delivery voucher.
   Vehicle, rider and shift come from the delivery; the odometer reading is
   required and can't be lower than the reading at delivery. */
const props = defineProps({
  open: { type: Boolean, default: false },
  deliveries: { type: Array, default: () => [] }, // open delivery vouchers (decorated)
  deliveryId: { type: String, default: '' }, // preselected from a delivery row
})
const emit = defineEmits(['update:open', 'saved'])

const { t } = useI18n()
const { num } = useCurrency()
const { formatDate } = useDate()
const toast = useToast()
const auth = useAuthStore()

const today = new Date().toISOString().slice(0, 10)
const nowTime = () => new Date().toTimeString().slice(0, 5)
const blank = () => ({ deliveryId: props.deliveryId || '', date: today, time: nowTime(), odometer: '', fuel: 50, condition: 'good', notes: '', photo: null })
const form = reactive(blank())
const errors = reactive({})
const saving = ref(false)

const deliveryOptions = computed(() =>
  props.deliveries.map((d) => ({ value: d.id, label: `${d.ref} · ${d.plate} · ${d.riderName}`, hint: `${d.shiftName} · ${formatDate(d.date)}` })),
)
const delivery = computed(() => props.deliveries.find((d) => d.id === form.deliveryId) ?? null)
const km = computed(() => (delivery.value && form.odometer !== '' ? Number(form.odometer) - delivery.value.odometer : null))
const conditionOptions = computed(() => [
  { value: 'good', label: t('vehicles.handover.conditions.good') },
  { value: 'damaged', label: t('vehicles.handover.conditions.damaged') },
])

watch(
  () => props.open,
  (v) => {
    if (!v) return
    Object.assign(form, blank())
    Object.keys(errors).forEach((k) => delete errors[k])
  },
)

function validate() {
  Object.keys(errors).forEach((k) => delete errors[k])
  if (!form.deliveryId) errors.deliveryId = t('vehicles.handover.errDelivery')
  if (form.odometer === '') errors.odometer = t('vehicles.handover.errOdometer')
  else if (delivery.value && Number(form.odometer) < delivery.value.odometer) errors.odometer = t('vehicles.handover.errOdometerBelow', { n: num(delivery.value.odometer) })
  if (delivery.value && form.date < delivery.value.date) errors.date = t('vehicles.handover.errDateBefore')
  return Object.keys(errors).length === 0
}

async function submit() {
  if (saving.value || !validate()) return
  saving.value = true
  try {
    await createReceipt({ ...form, by: auth.user?.name })
    toast.success(t('vehicles.handover.receiptSaved'))
    emit('saved')
    emit('update:open', false)
  } catch (e) {
    if (e.message === 'ODOMETER_BELOW') errors.odometer = t('vehicles.handover.errOdometerBelow', { n: num(delivery.value?.odometer ?? 0) })
    else if (e.message === 'DATE_BEFORE_DELIVERY') errors.date = t('vehicles.handover.errDateBefore')
    else if (e.message === 'ALREADY_RECEIVED') errors.deliveryId = t('vehicles.handover.errAlreadyReceived')
    else toast.error(t('common.required'))
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <Dialog :open="open" size="lg" :title="t('vehicles.handover.receiptTitle')" @update:open="emit('update:open', $event)">
    <form class="space-y-4" @submit.prevent="submit">
      <div class="space-y-1.5">
        <label class="text-sm font-medium">{{ t('vehicles.handover.pickDelivery') }}</label>
        <Dropdown v-model="form.deliveryId" :options="deliveryOptions" :placeholder="t('vehicles.handover.pickDeliveryPh')" :invalid="!!errors.deliveryId" searchable />
        <p v-if="errors.deliveryId" class="text-danger text-xs">{{ errors.deliveryId }}</p>
        <p v-else-if="!deliveries.length" class="text-muted-foreground text-xs">{{ t('vehicles.handover.noOpenDeliveries') }}</p>
      </div>

      <!-- what was delivered: read-only, from the delivery voucher -->
      <div v-if="delivery" class="bg-muted/40 grid gap-x-4 gap-y-2 rounded-xl p-4 text-sm sm:grid-cols-2">
        <p class="flex items-center gap-2 font-semibold sm:col-span-2"><FileText class="text-primary size-4" /> <span dir="ltr">{{ delivery.ref }}</span></p>
        <p><span class="text-muted-foreground">{{ t('vehicles.handover.vehicle') }}:</span> <b dir="ltr">{{ delivery.plate }}</b> <span class="text-muted-foreground">{{ delivery.model }}</span></p>
        <p><span class="text-muted-foreground">{{ t('vehicles.handover.rider') }}:</span> <b>{{ delivery.riderName }}</b></p>
        <p><span class="text-muted-foreground">{{ t('vehicles.handover.shift') }}:</span> <b>{{ delivery.shiftName }}</b></p>
        <p><span class="text-muted-foreground">{{ t('vehicles.handover.deliveredOn') }}:</span> <b class="tabular-nums">{{ formatDate(delivery.date) }}</b></p>
        <p class="sm:col-span-2"><span class="text-muted-foreground">{{ t('vehicles.handover.odometerAtDelivery') }}:</span> <b class="tabular-nums" dir="ltr">{{ num(delivery.odometer) }}</b></p>
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('common.date') }}</label>
          <DatePicker v-model="form.date" :min="delivery?.date" :max="today" :clearable="false" />
          <p v-if="errors.date" class="text-danger text-xs">{{ errors.date }}</p>
        </div>
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('vehicles.handover.time') }}</label>
          <Input v-model="form.time" type="time" dir="ltr" />
        </div>
      </div>

      <!-- odometer reading at receipt (required) + condition -->
      <div class="grid gap-4 sm:grid-cols-3">
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('vehicles.handover.odometerReading') }}</label>
          <Input v-model="form.odometer" type="number" :min="delivery?.odometer ?? 0" dir="ltr" placeholder="0" :invalid="!!errors.odometer" />
          <p v-if="errors.odometer" class="text-danger text-xs">{{ errors.odometer }}</p>
          <p v-else-if="km !== null && km >= 0" class="text-muted-foreground flex items-center gap-1 text-xs"><Gauge class="size-3.5" /> {{ t('vehicles.handover.kmDriven', { n: num(km) }) }}</p>
        </div>
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('vehicles.handover.fuel') }} <b class="tabular-nums">{{ form.fuel }}%</b></label>
          <input v-model.number="form.fuel" type="range" min="0" max="100" step="5" class="accent-primary h-11 w-full" dir="ltr" />
        </div>
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('vehicles.handover.condition') }}</label>
          <Dropdown v-model="form.condition" :options="conditionOptions" />
        </div>
      </div>

      <div class="space-y-1.5">
        <label class="text-sm font-medium">{{ t('common.notes') }}</label>
        <Textarea v-model="form.notes" :rows="2" />
      </div>
      <div class="space-y-1.5">
        <label class="text-sm font-medium">{{ t('vehicles.handover.photo') }} <span class="text-muted-foreground text-xs font-normal">({{ t('common.optional') }})</span></label>
        <FileDrop v-model="form.photo" accept="image/*" />
      </div>

      <p class="text-muted-foreground flex items-start gap-2 text-xs"><Info class="mt-0.5 size-3.5 shrink-0" /> {{ t('vehicles.handover.receiptHint') }}</p>
    </form>
    <template #footer>
      <Button variant="ghost" @click="emit('update:open', false)">{{ t('common.cancel') }}</Button>
      <Button :disabled="saving || !deliveries.length" @click="submit">{{ t('common.save') }}</Button>
    </template>
  </Dialog>
</template>
