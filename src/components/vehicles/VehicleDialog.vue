<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
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
  riderOptions: { type: Array, default: () => [] },
})
const emit = defineEmits(['update:open', 'saved'])

const { t, locale } = useI18n()
const toast = useToast()
const isEdit = computed(() => !!props.vehicle)
const saving = ref(false)
const form = reactive({
  plate: '', type: 'motorcycle', morningRiderId: '', eveningRiderId: '',
  value: '', status: 'active', statusFrom: '', statusTo: '',
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
      morningRiderId: props.vehicle?.morningRiderId ?? '',
      eveningRiderId: props.vehicle?.eveningRiderId ?? '',
      value: props.vehicle?.value ?? '',
      status: props.vehicle?.status ?? 'active',
      statusFrom: props.vehicle?.statusFrom ?? '',
      statusTo: props.vehicle?.statusTo ?? '',
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
  if (form.morningRiderId && form.morningRiderId === form.eveningRiderId) {
    errors.riders = t('vehicles.errSameRider')
    return
  }
  saving.value = true
  try {
    isEdit.value ? await updateVehicle(props.vehicle.id, { ...form }) : await createVehicle({ ...form })
    toast.success(t('vehicles.saved'))
    emit('saved')
    emit('update:open', false)
  } catch (e) {
    if (e.message === 'SAME_RIDER') errors.riders = t('vehicles.errSameRider')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <Dialog :open="open" :title="t('vehicles.vehicleTitle')" @update:open="emit('update:open', $event)">
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

      <div class="space-y-1.5">
        <label class="text-sm font-medium">{{ t('vehicles.fields.value') }}</label>
        <Input v-model="form.value" type="number" dir="ltr" min="0" />
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('vehicles.riders.morning') }}</label>
          <Dropdown v-model="form.morningRiderId" :options="riderOptions" :placeholder="t('vehicles.unassigned')" />
        </div>
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('vehicles.riders.evening') }}</label>
          <Dropdown v-model="form.eveningRiderId" :options="riderOptions" :placeholder="t('vehicles.unassigned')" />
        </div>
      </div>
      <p v-if="errors.riders" class="text-danger text-xs">{{ errors.riders }}</p>

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
