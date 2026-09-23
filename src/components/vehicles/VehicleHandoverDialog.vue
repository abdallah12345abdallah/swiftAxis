<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Info, Building2, User } from 'lucide-vue-next'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { DatePicker } from '@/components/ui/datepicker'
import { Dropdown } from '@/components/ui/dropdown'
import { Textarea } from '@/components/ui/textarea'
import { FileDrop } from '@/components/ui/file-drop'
import { Button } from '@/components/ui/button'
import { useToast } from '@/composables/useToast'
import { useAuthStore } from '@/stores/auth'
import { cn } from '@/lib/utils'
import { createHandover } from '@/api/vehicles'

/* Vehicle handover (#5): who hands the vehicle to whom, on which shift, with
   odometer, fuel level and condition. Parties are riders or the company. */
const props = defineProps({
  open: { type: Boolean, default: false },
  vehicles: { type: Array, default: () => [] }, // decorated fleet
  riderOptions: { type: Array, default: () => [] },
  shiftOptions: { type: Array, default: () => [] },
})
const emit = defineEmits(['update:open', 'saved'])

const { t } = useI18n()
const toast = useToast()
const auth = useAuthStore()

const today = new Date().toISOString().slice(0, 10)
const nowTime = () => new Date().toTimeString().slice(0, 5)
const blank = () => ({ vehicleId: '', date: today, time: nowTime(), shiftId: '', fromType: 'rider', fromRiderId: '', toType: 'rider', toRiderId: '', odometer: '', fuel: 50, condition: 'good', notes: '', photo: null })
const form = reactive(blank())
const errors = reactive({})
const saving = ref(false)

const vehicleOptions = computed(() => props.vehicles.map((v) => ({ value: v.id, label: v.label ?? v.plate, hint: v.ridersLabel })))
const conditionOptions = computed(() => [
  { value: 'good', label: t('vehicles.handover.conditions.good') },
  { value: 'damaged', label: t('vehicles.handover.conditions.damaged') },
])
const selectedVehicle = computed(() => props.vehicles.find((v) => v.id === form.vehicleId))

watch(
  () => props.open,
  (v) => {
    if (!v) return
    Object.assign(form, blank())
    Object.keys(errors).forEach((k) => delete errors[k])
  },
)
// the rider currently on that shift is the natural "from" party
watch(
  () => [form.vehicleId, form.shiftId],
  () => {
    const v = selectedVehicle.value
    if (!v || !form.shiftId) return
    const current = v[`${form.shiftId}RiderId`]
    if (current) {
      form.fromType = 'rider'
      form.fromRiderId = current
    } else {
      form.fromType = 'company'
      form.fromRiderId = ''
    }
  },
)

function validate() {
  Object.keys(errors).forEach((k) => delete errors[k])
  if (!form.vehicleId) errors.vehicleId = t('vehicles.handover.errVehicle')
  if (!form.shiftId) errors.shiftId = t('vehicles.handover.errShift')
  if ((form.fromType === 'rider' && !form.fromRiderId) || (form.toType === 'rider' && !form.toRiderId)) errors.party = t('vehicles.handover.errParty')
  else if (form.fromType === 'company' && form.toType === 'company') errors.party = t('vehicles.handover.errSame')
  else if (form.fromType === 'rider' && form.toType === 'rider' && form.fromRiderId === form.toRiderId) errors.party = t('vehicles.handover.errSame')
  return Object.keys(errors).length === 0
}

async function submit() {
  if (saving.value || !validate()) return
  saving.value = true
  try {
    await createHandover({ ...form, by: auth.user?.name })
    toast.success(t('vehicles.handover.saved'))
    emit('saved')
    emit('update:open', false)
  } catch (e) {
    errors.party = e.message === 'SAME_PARTY' ? t('vehicles.handover.errSame') : t('vehicles.handover.errParty')
  } finally {
    saving.value = false
  }
}

const partyBtn = (active) =>
  cn('flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors', active ? 'border-primary bg-primary/10 text-primary' : 'border-input hover:bg-accent')
</script>

<template>
  <Dialog :open="open" size="lg" :title="t('vehicles.handover.title')" @update:open="emit('update:open', $event)">
    <form class="space-y-4" @submit.prevent="submit">
      <div class="grid gap-4 sm:grid-cols-2">
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('vehicles.handover.vehicle') }}</label>
          <Dropdown v-model="form.vehicleId" :options="vehicleOptions" :placeholder="t('vehicles.handover.vehicle')" :invalid="!!errors.vehicleId" />
          <p v-if="errors.vehicleId" class="text-danger text-xs">{{ errors.vehicleId }}</p>
        </div>
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('vehicles.handover.shift') }}</label>
          <Dropdown v-model="form.shiftId" :options="shiftOptions" :placeholder="t('vehicles.handover.shift')" :invalid="!!errors.shiftId" />
          <p v-if="errors.shiftId" class="text-danger text-xs">{{ errors.shiftId }}</p>
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

      <!-- parties -->
      <div class="grid gap-4 sm:grid-cols-2">
        <div class="space-y-2">
          <label class="text-sm font-medium">{{ t('vehicles.handover.from') }}</label>
          <div class="flex gap-2">
            <button type="button" :class="partyBtn(form.fromType === 'rider')" @click="form.fromType = 'rider'"><User class="size-4" /> {{ t('vehicles.handover.rider') }}</button>
            <button type="button" :class="partyBtn(form.fromType === 'company')" @click="form.fromType = 'company'"><Building2 class="size-4" /> {{ t('vehicles.handover.company') }}</button>
          </div>
          <Dropdown v-if="form.fromType === 'rider'" v-model="form.fromRiderId" :options="riderOptions" :placeholder="t('orders.manual.riderPh')" />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium">{{ t('vehicles.handover.to') }}</label>
          <div class="flex gap-2">
            <button type="button" :class="partyBtn(form.toType === 'rider')" @click="form.toType = 'rider'"><User class="size-4" /> {{ t('vehicles.handover.rider') }}</button>
            <button type="button" :class="partyBtn(form.toType === 'company')" @click="form.toType = 'company'"><Building2 class="size-4" /> {{ t('vehicles.handover.company') }}</button>
          </div>
          <Dropdown v-if="form.toType === 'rider'" v-model="form.toRiderId" :options="riderOptions" :placeholder="t('orders.manual.riderPh')" />
        </div>
      </div>
      <p v-if="errors.party" class="text-danger text-xs">{{ errors.party }}</p>

      <!-- condition -->
      <div class="grid gap-4 sm:grid-cols-3">
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('vehicles.handover.odometer') }}</label>
          <Input v-model="form.odometer" type="number" min="0" dir="ltr" placeholder="0" />
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

      <p class="text-muted-foreground flex items-start gap-2 text-xs"><Info class="mt-0.5 size-3.5 shrink-0" /> {{ t('vehicles.handover.hint') }}</p>
    </form>
    <template #footer>
      <Button variant="ghost" @click="emit('update:open', false)">{{ t('common.cancel') }}</Button>
      <Button :disabled="saving" @click="submit">{{ t('common.save') }}</Button>
    </template>
  </Dialog>
</template>
