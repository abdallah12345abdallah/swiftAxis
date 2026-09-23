<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Info, Fuel } from 'lucide-vue-next'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { DatePicker } from '@/components/ui/datepicker'
import { Dropdown } from '@/components/ui/dropdown'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useCurrency } from '@/composables/useCurrency'
import { useToast } from '@/composables/useToast'
import { createFuelLog } from '@/api/vehicles'

/* Fuel sheet entry (#5/#6): a fill-up per vehicle + rider; books a fuel expense. */
const props = defineProps({
  open: { type: Boolean, default: false },
  vehicles: { type: Array, default: () => [] },
  riderOptions: { type: Array, default: () => [] },
})
const emit = defineEmits(['update:open', 'saved'])

const { t } = useI18n()
const { sar } = useCurrency()
const toast = useToast()

const today = new Date().toISOString().slice(0, 10)
const blank = () => ({ vehicleId: '', riderId: '', date: today, liters: '', amount: '', odometer: '', station: '', invoiceNo: '', note: '' })
const form = reactive(blank())
const errors = reactive({})
const saving = ref(false)

const vehicleOptions = computed(() => props.vehicles.map((v) => ({ value: v.id, label: v.label ?? v.plate, hint: v.tankCapacity ? `${v.tankCapacity} L` : '' })))
const pricePerLiter = computed(() => (Number(form.liters) ? Math.round((Number(form.amount) / Number(form.liters)) * 100) / 100 : 0))

watch(
  () => props.open,
  (v) => {
    if (!v) return
    Object.assign(form, blank())
    Object.keys(errors).forEach((k) => delete errors[k])
  },
)
// default the rider to whoever drives the vehicle in the morning
watch(
  () => form.vehicleId,
  (id) => {
    const v = props.vehicles.find((x) => x.id === id)
    if (v && !form.riderId) form.riderId = v.morningRiderId || v.eveningRiderId || ''
  },
)

async function submit() {
  if (saving.value) return
  Object.keys(errors).forEach((k) => delete errors[k])
  if (!form.vehicleId) errors.vehicleId = t('vehicles.fuel.errVehicle')
  if (!(Number(form.amount) > 0)) errors.amount = t('vehicles.fuel.errAmount')
  if (Object.keys(errors).length) return
  saving.value = true
  try {
    await createFuelLog({ ...form })
    toast.success(t('vehicles.fuel.saved'))
    emit('saved')
    emit('update:open', false)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <Dialog :open="open" :title="t('vehicles.fuel.add')" :icon="Fuel" @update:open="emit('update:open', $event)">
    <form class="space-y-4" @submit.prevent="submit">
      <div class="grid gap-4 sm:grid-cols-2">
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('vehicles.fields.vehicle') }}</label>
          <Dropdown v-model="form.vehicleId" :options="vehicleOptions" :placeholder="t('vehicles.fields.vehicle')" :invalid="!!errors.vehicleId" />
          <p v-if="errors.vehicleId" class="text-danger text-xs">{{ errors.vehicleId }}</p>
        </div>
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('vehicles.fuel.rider') }}</label>
          <Dropdown v-model="form.riderId" :options="riderOptions" :placeholder="t('orders.manual.riderPh')" clearable />
        </div>
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('common.date') }}</label>
          <DatePicker v-model="form.date" :max="today" :clearable="false" />
        </div>
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('vehicles.fuel.odometer') }}</label>
          <Input v-model="form.odometer" type="number" min="0" dir="ltr" placeholder="0" />
        </div>
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('vehicles.fuel.liters') }}</label>
          <Input v-model="form.liters" type="number" step="0.1" min="0" dir="ltr" placeholder="0" />
        </div>
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('vehicles.fuel.amount') }}</label>
          <Input v-model="form.amount" type="number" step="0.5" min="0" dir="ltr" placeholder="0" :invalid="!!errors.amount" />
          <p v-if="errors.amount" class="text-danger text-xs">{{ errors.amount }}</p>
        </div>
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('vehicles.fuel.station') }}</label>
          <Input v-model="form.station" />
        </div>
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('vehicles.fields.invoiceNo') }}</label>
          <Input v-model="form.invoiceNo" dir="ltr" />
        </div>
      </div>

      <div class="bg-muted/40 flex items-center justify-between rounded-xl px-4 py-3 text-sm">
        <span class="text-muted-foreground">{{ t('vehicles.fuel.pricePerLiter') }}</span>
        <span class="font-semibold tabular-nums">{{ sar(pricePerLiter, { decimals: 2 }) }}</span>
      </div>

      <div class="space-y-1.5">
        <label class="text-sm font-medium">{{ t('vehicles.fields.note') }}</label>
        <Textarea v-model="form.note" :rows="2" />
      </div>
      <p class="text-muted-foreground flex items-start gap-2 text-xs"><Info class="mt-0.5 size-3.5 shrink-0" /> {{ t('vehicles.fuel.hint') }}</p>
    </form>
    <template #footer>
      <Button variant="ghost" @click="emit('update:open', false)">{{ t('common.cancel') }}</Button>
      <Button :disabled="saving" @click="submit">{{ t('common.save') }}</Button>
    </template>
  </Dialog>
</template>
