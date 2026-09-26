<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Info } from 'lucide-vue-next'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { DatePicker } from '@/components/ui/datepicker'
import { Dropdown } from '@/components/ui/dropdown'
import { Button } from '@/components/ui/button'
import { useToast } from '@/composables/useToast'
import { createVehicle, updateVehicle } from '@/api/vehicles'
import { VEHICLE_STATUS } from '@/api/fixtures'

const props = defineProps({
  open: { type: Boolean, default: false },
  vehicle: { type: Object, default: null },
  typeOptions: { type: Array, default: () => [] },
})
const emit = defineEmits(['update:open', 'saved'])

const { t, locale } = useI18n()
const toast = useToast()
const isEdit = computed(() => !!props.vehicle)
const saving = ref(false)
const form = reactive({
  plate: '', type: 'motorcycle', status: 'active', statusFrom: '', statusTo: '',
  // identity (#5)
  chassis: '', color: '', model: '', year: '', tankCapacity: '',
})
const errors = reactive({})

const statusOptions = computed(() =>
  Object.keys(VEHICLE_STATUS).map((k) => ({ value: k, label: VEHICLE_STATUS[k][locale.value] ?? VEHICLE_STATUS[k].ar })),
)

watch(
  () => props.open,
  (v) => {
    if (!v) return
    Object.assign(form, {
      plate: props.vehicle?.plate ?? '',
      type: props.vehicle?.type ?? 'motorcycle',
      status: props.vehicle?.status ?? 'active',
      statusFrom: props.vehicle?.statusFrom ?? '',
      statusTo: props.vehicle?.statusTo ?? '',
      chassis: props.vehicle?.chassis ?? '',
      color: props.vehicle?.color ?? '',
      model: props.vehicle?.model ?? '',
      year: props.vehicle?.year ?? '',
      tankCapacity: props.vehicle?.tankCapacity ?? '',
    })
    Object.keys(errors).forEach((k) => delete errors[k])
  },
)

async function submit() {
  if (saving.value) return
  Object.keys(errors).forEach((k) => delete errors[k])
  if (!form.plate.trim()) {
    errors.plate = t('common.required')
    return
  }
  saving.value = true
  try {
    isEdit.value ? await updateVehicle(props.vehicle.id, { ...form }) : await createVehicle({ ...form })
    toast.success(t('vehicles.saved'))
    emit('saved')
    emit('update:open', false)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <Dialog :open="open" size="lg" :title="t('vehicles.vehicleTitle')" @update:open="emit('update:open', $event)">
    <form class="space-y-4" @submit.prevent="submit">
      <div class="grid gap-4 sm:grid-cols-2">
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('vehicles.plate') }}</label>
          <Input v-model="form.plate" dir="ltr" :invalid="!!errors.plate" />
          <p v-if="errors.plate" class="text-danger text-xs">{{ errors.plate }}</p>
        </div>
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('vehicles.type') }}</label>
          <Dropdown v-model="form.type" :options="typeOptions" />
        </div>
      </div>

      <!-- identity (#5) -->
      <p class="text-muted-foreground text-xs font-semibold uppercase tracking-wide">{{ t('vehicles.identity') }}</p>
      <div class="grid gap-4 sm:grid-cols-2">
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('vehicles.fields.model') }}</label>
          <Input v-model="form.model" />
        </div>
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('vehicles.fields.chassis') }}</label>
          <Input v-model="form.chassis" dir="ltr" />
        </div>
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('vehicles.fields.color') }}</label>
          <Input v-model="form.color" />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-1.5">
            <label class="text-sm font-medium">{{ t('vehicles.fields.year') }}</label>
            <Input v-model="form.year" type="number" min="1990" max="2100" dir="ltr" />
          </div>
          <div class="space-y-1.5">
            <label class="text-sm font-medium">{{ t('vehicles.fields.tankCapacity') }}</label>
            <Input v-model="form.tankCapacity" type="number" min="0" dir="ltr" />
          </div>
        </div>
      </div>

      <p class="bg-primary/5 text-muted-foreground flex items-start gap-2 rounded-lg px-3 py-2 text-xs">
        <Info class="text-primary mt-0.5 size-3.5 shrink-0" /> {{ t('vehicles.ridersViaDelivery') }}
      </p>

      <div class="space-y-1.5">
        <label class="text-sm font-medium">{{ t('vehicles.statusLabel') }}</label>
        <Dropdown v-model="form.status" :options="statusOptions" />
      </div>

      <div v-if="form.status !== 'active'" class="grid gap-4 sm:grid-cols-2">
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('vehicles.statusFrom') }}</label>
          <DatePicker v-model="form.statusFrom" />
        </div>
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('vehicles.statusTo') }}</label>
          <DatePicker v-model="form.statusTo" />
        </div>
      </div>
    </form>
    <template #footer>
      <Button variant="ghost" @click="emit('update:open', false)">{{ t('common.cancel') }}</Button>
      <Button :disabled="saving" @click="submit">{{ t('common.save') }}</Button>
    </template>
  </Dialog>
</template>
