<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useToast } from '@/composables/useToast'
import { createVehicle, updateVehicle } from '@/api/vehicles'

const props = defineProps({
  open: { type: Boolean, default: false },
  vehicle: { type: Object, default: null },
  typeOptions: { type: Array, default: () => [] },
  riderOptions: { type: Array, default: () => [] },
})
const emit = defineEmits(['update:open', 'saved'])

const { t } = useI18n()
const toast = useToast()
const isEdit = computed(() => !!props.vehicle)
const saving = ref(false)
const form = reactive({ plate: '', type: 'motorcycle', riderId: '' })
const errors = reactive({})

watch(
  () => props.open,
  (v) => {
    if (!v) return
    Object.assign(form, { plate: props.vehicle?.plate ?? '', type: props.vehicle?.type ?? 'motorcycle', riderId: props.vehicle?.riderId ?? '' })
    delete errors.plate
  },
)

async function submit() {
  if (saving.value) return
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
  <Dialog :open="open" :title="t('vehicles.vehicleTitle')" @update:open="emit('update:open', $event)">
    <form class="space-y-4" @submit.prevent="submit">
      <div class="space-y-1.5">
        <label class="text-sm font-medium">{{ t('vehicles.plate') }}</label>
        <Input v-model="form.plate" dir="ltr" :invalid="!!errors.plate" />
        <p v-if="errors.plate" class="text-danger text-xs">{{ errors.plate }}</p>
      </div>
      <div class="space-y-1.5">
        <label class="text-sm font-medium">{{ t('vehicles.type') }}</label>
        <Select v-model="form.type" :options="typeOptions" />
      </div>
      <div class="space-y-1.5">
        <label class="text-sm font-medium">{{ t('vehicles.rider') }}</label>
        <Select v-model="form.riderId" :options="riderOptions" :placeholder="t('vehicles.unassigned')" />
      </div>
    </form>
    <template #footer>
      <Button variant="ghost" @click="emit('update:open', false)">{{ t('common.cancel') }}</Button>
      <Button :disabled="saving" @click="submit">{{ t('common.save') }}</Button>
    </template>
  </Dialog>
</template>
