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
import { useToast } from '@/composables/useToast'
import { useCurrency } from '@/composables/useCurrency'
import { createFuelLog, fetchFuelCost } from '@/api/vehicles'

/* Fuel sheet entry (#5/#6): a fill-up per vehicle — liters and odometer.
   No rider and no typed amount: the cost is liters × the fuel's moving average
   cost, booked automatically on the vehicle's cost center. */
const props = defineProps({
  open: { type: Boolean, default: false },
  vehicles: { type: Array, default: () => [] },
})
const emit = defineEmits(['update:open', 'saved'])

const { t } = useI18n()
const toast = useToast()
const { sar, num } = useCurrency()
const cost = ref({ avgCost: 0, stockLiters: 0 })
const fillCost = computed(() => Math.round((Number(form.liters) || 0) * cost.value.avgCost * 100) / 100)

const today = new Date().toISOString().slice(0, 10)
const blank = () => ({ vehicleId: '', date: today, liters: '', odometer: '', station: '', invoiceNo: '', note: '' })
const form = reactive(blank())
const errors = reactive({})
const saving = ref(false)

const vehicleOptions = computed(() => props.vehicles.map((v) => ({ value: v.id, label: v.label ?? v.plate, hint: v.tankCapacity ? `${v.tankCapacity} L` : '' })))

watch(
  () => props.open,
  (v) => {
    if (!v) return
    Object.assign(form, blank())
    Object.keys(errors).forEach((k) => delete errors[k])
    fetchFuelCost().then((c) => (cost.value = c))
  },
)

async function submit() {
  if (saving.value) return
  Object.keys(errors).forEach((k) => delete errors[k])
  if (!form.vehicleId) errors.vehicleId = t('vehicles.fuel.errVehicle')
  if (!(Number(form.liters) > 0)) errors.liters = t('vehicles.fuel.errLiters')
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
          <label class="text-sm font-medium">{{ t('common.date') }}</label>
          <DatePicker v-model="form.date" :max="today" :clearable="false" />
        </div>
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('vehicles.fuel.odometer') }}</label>
          <Input v-model="form.odometer" type="number" min="0" dir="ltr" placeholder="0" />
        </div>
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('vehicles.fuel.liters') }}</label>
          <Input v-model="form.liters" type="number" step="0.1" min="0" dir="ltr" placeholder="0" :invalid="!!errors.liters" />
          <p v-if="errors.liters" class="text-danger text-xs">{{ errors.liters }}</p>
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

      <!-- cost: automatic, from the moving average -->
      <div class="bg-muted/40 space-y-1 rounded-xl px-4 py-3 text-sm">
        <div class="flex items-center justify-between">
          <span class="text-muted-foreground">{{ t('vehicles.fuel.avgCost') }}</span>
          <span class="tabular-nums" dir="ltr">{{ sar(cost.avgCost, { decimals: 2 }) }}</span>
        </div>
        <div class="flex items-center justify-between font-semibold">
          <span>{{ t('vehicles.fuel.fillCost') }}</span>
          <span class="tabular-nums" dir="ltr">{{ sar(fillCost, { decimals: 2 }) }}</span>
        </div>
        <p v-if="!cost.avgCost" class="text-warning-foreground text-xs">{{ t('vehicles.fuel.noAvgCost') }}</p>
        <p v-else-if="Number(form.liters) > cost.stockLiters" class="text-warning-foreground text-xs">{{ t('vehicles.fuel.overStock', { n: num(cost.stockLiters, { decimals: 1 }) }) }}</p>
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
