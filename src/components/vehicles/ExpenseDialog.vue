<script setup>
import { ref, reactive, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { FileDrop } from '@/components/ui/file-drop'
import { Button } from '@/components/ui/button'
import { useToast } from '@/composables/useToast'
import { createExpense } from '@/api/vehicles'

const props = defineProps({
  open: { type: Boolean, default: false },
  vehicleOptions: { type: Array, default: () => [] },
  typeOptions: { type: Array, default: () => [] },
})
const emit = defineEmits(['update:open', 'saved'])

const { t } = useI18n()
const toast = useToast()
const saving = ref(false)
const receipt = ref(null)
const form = reactive({ vehicleId: '', type: 'fuel', amount: '', date: new Date().toISOString().slice(0, 10), invoiceNo: '', note: '' })
const errors = reactive({})

watch(
  () => props.open,
  (v) => {
    if (!v) return
    Object.assign(form, { vehicleId: '', type: 'fuel', amount: '', date: new Date().toISOString().slice(0, 10), invoiceNo: '', note: '' })
    receipt.value = null
    Object.keys(errors).forEach((k) => delete errors[k])
  },
)

async function submit() {
  if (saving.value) return
  Object.keys(errors).forEach((k) => delete errors[k])
  if (!form.vehicleId) errors.vehicleId = t('common.required')
  if (!(Number(form.amount) > 0)) errors.amount = t('common.required')
  if (Object.keys(errors).length) return
  saving.value = true
  try {
    await createExpense({ ...form })
    toast.success(t('vehicles.saved'))
    emit('saved')
    emit('update:open', false)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <Dialog :open="open" :title="t('vehicles.expenseTitle')" @update:open="emit('update:open', $event)">
    <form class="space-y-4" @submit.prevent="submit">
      <div class="grid gap-4 sm:grid-cols-2">
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('vehicles.fields.vehicle') }}</label>
          <Select v-model="form.vehicleId" :options="vehicleOptions" :placeholder="t('vehicles.fields.vehicle')" :invalid="!!errors.vehicleId" />
        </div>
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('vehicles.fields.type') }}</label>
          <Select v-model="form.type" :options="typeOptions" />
        </div>
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('vehicles.fields.amount') }}</label>
          <Input v-model="form.amount" type="number" dir="ltr" :invalid="!!errors.amount" />
        </div>
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('vehicles.fields.date') }}</label>
          <Input v-model="form.date" type="date" dir="ltr" />
        </div>
        <div class="space-y-1.5 sm:col-span-2">
          <label class="text-sm font-medium">{{ t('vehicles.fields.invoiceNo') }}</label>
          <Input v-model="form.invoiceNo" dir="ltr" />
        </div>
      </div>
      <div class="space-y-1.5">
        <label class="text-sm font-medium">{{ t('vehicles.fields.note') }}</label>
        <Textarea v-model="form.note" :rows="2" />
      </div>
      <div class="space-y-1.5">
        <label class="text-sm font-medium">{{ t('vehicles.fields.receipt') }}</label>
        <FileDrop v-model="receipt" />
      </div>
    </form>
    <template #footer>
      <Button variant="ghost" @click="emit('update:open', false)">{{ t('common.cancel') }}</Button>
      <Button :disabled="saving" @click="submit">{{ t('common.save') }}</Button>
    </template>
  </Dialog>
</template>
