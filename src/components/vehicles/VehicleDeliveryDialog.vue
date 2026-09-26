<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Info } from 'lucide-vue-next'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { DatePicker } from '@/components/ui/datepicker'
import { Dropdown } from '@/components/ui/dropdown'
import { Textarea } from '@/components/ui/textarea'
import { FileDrop } from '@/components/ui/file-drop'
import { Button } from '@/components/ui/button'
import { useToast } from '@/composables/useToast'
import { useAuthStore } from '@/stores/auth'
import { RIDERS } from '@/api/fixtures'
import { createDelivery } from '@/api/vehicles'

/* Delivery voucher (سند تسليم): the company hands a vehicle to a rider for a
   shift, with odometer, fuel level and condition. The voucher stays open until
   the vehicle is received back (VehicleReceiptDialog). */
const props = defineProps({
  open: { type: Boolean, default: false },
  vehicles: { type: Array, default: () => [] }, // decorated fleet
  shiftOptions: { type: Array, default: () => [] },
})
const emit = defineEmits(['update:open', 'saved'])

const { t } = useI18n()
const toast = useToast()
const auth = useAuthStore()

const today = new Date().toISOString().slice(0, 10)
const nowTime = () => new Date().toTimeString().slice(0, 5)
const blank = () => ({ vehicleId: '', shiftId: '', riderId: '', date: today, time: nowTime(), odometer: '', fuel: 100, condition: 'good', notes: '', photo: null })
const form = reactive(blank())
const errors = reactive({})
const saving = ref(false)

const vehicleOptions = computed(() => props.vehicles.filter((v) => v.status === 'active').map((v) => ({ value: v.id, label: v.label ?? v.plate, hint: v.ridersLabel })))
const selectedVehicle = computed(() => props.vehicles.find((v) => v.id === form.vehicleId))
// a rider already driving a vehicle has to hand it back first
const busy = computed(() => new Set(props.vehicles.flatMap((v) => [v.morningRiderId, v.eveningRiderId]).filter(Boolean)))
const riderOptions = computed(() => RIDERS.filter((r) => r.active && !busy.value.has(r.id)).map((r) => ({ value: r.id, label: r.name, hint: r.id })))
const shiftTaken = computed(() => !!(selectedVehicle.value && form.shiftId && selectedVehicle.value[`${form.shiftId}RiderId`]))
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
  if (!form.vehicleId) errors.vehicleId = t('vehicles.handover.errVehicle')
  if (!form.shiftId) errors.shiftId = t('vehicles.handover.errShift')
  else if (shiftTaken.value) errors.shiftId = t('vehicles.handover.errShiftTaken')
  if (!form.riderId) errors.riderId = t('vehicles.handover.errRider')
  if (form.odometer === '') errors.odometer = t('vehicles.handover.errOdometer')
  return Object.keys(errors).length === 0
}

async function submit() {
  if (saving.value || !validate()) return
  saving.value = true
  try {
    await createDelivery({ ...form, by: auth.user?.name })
    toast.success(t('vehicles.handover.deliverySaved'))
    emit('saved')
    emit('update:open', false)
  } catch (e) {
    if (e.message === 'SHIFT_TAKEN') errors.shiftId = t('vehicles.handover.errShiftTaken')
    else if (e.message === 'RIDER_BUSY') errors.riderId = t('vehicles.handover.errRiderBusy')
    else toast.error(t('common.required'))
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <Dialog :open="open" size="lg" :title="t('vehicles.handover.deliveryTitle')" @update:open="emit('update:open', $event)">
    <form class="space-y-4" @submit.prevent="submit">
      <div class="grid gap-4 sm:grid-cols-2">
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('vehicles.handover.vehicle') }}</label>
          <Dropdown v-model="form.vehicleId" :options="vehicleOptions" :placeholder="t('vehicles.handover.vehicle')" :invalid="!!errors.vehicleId" searchable />
          <p v-if="errors.vehicleId" class="text-danger text-xs">{{ errors.vehicleId }}</p>
        </div>
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('vehicles.handover.shift') }}</label>
          <Dropdown v-model="form.shiftId" :options="shiftOptions" :placeholder="t('vehicles.handover.shift')" :invalid="!!errors.shiftId || shiftTaken" />
          <p v-if="errors.shiftId || shiftTaken" class="text-danger text-xs">{{ errors.shiftId || t('vehicles.handover.errShiftTaken') }}</p>
        </div>
        <div class="space-y-1.5 sm:col-span-2">
          <label class="text-sm font-medium">{{ t('vehicles.handover.toRider') }}</label>
          <Dropdown v-model="form.riderId" :options="riderOptions" :placeholder="t('orders.manual.riderPh')" :invalid="!!errors.riderId" searchable />
          <p v-if="errors.riderId" class="text-danger text-xs">{{ errors.riderId }}</p>
        </div>
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('common.date') }}</label>
          <DatePicker v-model="form.date" :max="today" :clearable="false" />
        </div>
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('vehicles.handover.time') }}</label>
          <Input v-model="form.time" type="time" dir="ltr" />
        </div>
      </div>

      <!-- condition at delivery -->
      <div class="grid gap-4 sm:grid-cols-3">
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('vehicles.handover.odometer') }}</label>
          <Input v-model="form.odometer" type="number" min="0" dir="ltr" placeholder="0" :invalid="!!errors.odometer" />
          <p v-if="errors.odometer" class="text-danger text-xs">{{ errors.odometer }}</p>
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

      <p class="text-muted-foreground flex items-start gap-2 text-xs"><Info class="mt-0.5 size-3.5 shrink-0" /> {{ t('vehicles.handover.deliveryHint') }}</p>
    </form>
    <template #footer>
      <Button variant="ghost" @click="emit('update:open', false)">{{ t('common.cancel') }}</Button>
      <Button :disabled="saving" @click="submit">{{ t('common.save') }}</Button>
    </template>
  </Dialog>
</template>
