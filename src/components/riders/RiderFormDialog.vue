<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Info } from 'lucide-vue-next'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { createRider, updateRider } from '@/api/riders'

const props = defineProps({
  open: { type: Boolean, default: false },
  rider: { type: Object, default: null }, // null = create
  contractOptions: { type: Array, default: () => [] }, // [{ value, label }]
  cityOptions: { type: Array, default: () => [] },
  vehicleTypeOptions: { type: Array, default: () => [] },
})
const emit = defineEmits(['update:open', 'saved'])

const { t } = useI18n()

const isEdit = computed(() => !!props.rider)
const saving = ref(false)

const blank = () => ({
  name: '',
  nationalId: '',
  mobile: '',
  city: '',
  vehicleType: '',
  vehicle: '',
  contracts: [],
  active: true,
})

const form = reactive(blank())
const errors = reactive({})

watch(
  () => props.open,
  (v) => {
    if (!v) return
    Object.assign(form, blank())
    Object.keys(errors).forEach((k) => delete errors[k])
    if (props.rider) {
      Object.assign(form, {
        name: props.rider.name,
        nationalId: props.rider.nationalId,
        mobile: props.rider.mobile,
        city: props.rider.city,
        vehicleType: props.rider.vehicleType,
        vehicle: props.rider.vehicle,
        contracts: [...(props.rider.contracts ?? [])],
        active: props.rider.active,
      })
    }
  },
)

function toggleContract(id) {
  const i = form.contracts.indexOf(id)
  if (i === -1) form.contracts.push(id)
  else form.contracts.splice(i, 1)
}

function validate() {
  Object.keys(errors).forEach((k) => delete errors[k])
  if (!form.name.trim()) errors.name = t('riders.form.errName')
  if (!isEdit.value) {
    if (!form.nationalId.trim()) errors.nationalId = t('riders.form.errNationalId')
    else if (!/^\d{10}$/.test(form.nationalId.trim())) errors.nationalId = t('riders.form.errNationalIdFormat')
  }
  if (form.mobile && !/^05\d{8}$/.test(form.mobile.trim())) errors.mobile = t('riders.form.errMobile')
  if (!form.contracts.length) errors.contracts = t('riders.form.errContract')
  return Object.keys(errors).length === 0
}

async function submit() {
  if (saving.value || !validate()) return
  saving.value = true
  try {
    const saved = isEdit.value
      ? await updateRider(props.rider.id, { ...form })
      : await createRider({ ...form })
    emit('saved', saved)
    emit('update:open', false)
  } catch (e) {
    if (e.message === 'DUPLICATE_ID') errors.nationalId = t('riders.form.errDuplicate')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <Dialog
    :open="open"
    size="lg"
    :title="isEdit ? t('riders.form.editTitle') : t('riders.form.addTitle')"
    @update:open="emit('update:open', $event)"
  >
    <form class="space-y-4" @submit.prevent="submit">
      <div class="grid gap-4 sm:grid-cols-2">
        <!-- name -->
        <div class="space-y-1.5 sm:col-span-2">
          <label class="text-sm font-medium">{{ t('riders.form.name') }}</label>
          <Input v-model="form.name" :placeholder="t('riders.form.namePh')" :invalid="!!errors.name" />
          <p v-if="errors.name" class="text-danger text-xs">{{ errors.name }}</p>
        </div>

        <!-- national id -->
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('riders.form.nationalId') }}</label>
          <Input
            v-model="form.nationalId"
            :placeholder="t('riders.form.nationalIdPh')"
            :disabled="isEdit"
            :invalid="!!errors.nationalId"
            inputmode="numeric"
          />
          <p v-if="errors.nationalId" class="text-danger text-xs">{{ errors.nationalId }}</p>
          <p v-else-if="isEdit" class="text-muted-foreground text-xs">{{ t('riders.form.nationalIdLocked') }}</p>
        </div>

        <!-- mobile -->
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('riders.form.mobile') }}</label>
          <Input v-model="form.mobile" :placeholder="t('riders.form.mobilePh')" :invalid="!!errors.mobile" inputmode="tel" dir="ltr" />
          <p v-if="errors.mobile" class="text-danger text-xs">{{ errors.mobile }}</p>
        </div>

        <!-- city -->
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('riders.form.city') }}</label>
          <Select v-model="form.city" :options="cityOptions" :placeholder="t('riders.form.cityPh')" />
        </div>

        <!-- vehicle type -->
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('riders.form.vehicleType') }}</label>
          <Select v-model="form.vehicleType" :options="vehicleTypeOptions" :placeholder="t('riders.form.vehicleTypePh')" />
        </div>

        <!-- plate -->
        <div class="space-y-1.5 sm:col-span-2">
          <label class="text-sm font-medium">{{ t('riders.form.vehiclePlate') }}</label>
          <Input v-model="form.vehicle" :placeholder="t('riders.form.vehiclePlatePh')" dir="ltr" />
        </div>
      </div>

      <!-- contracts multi-select -->
      <div class="space-y-2">
        <label class="text-sm font-medium">{{ t('riders.form.contracts') }}</label>
        <p class="text-muted-foreground -mt-1 text-xs">{{ t('riders.form.contractsHint') }}</p>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="c in contractOptions"
            :key="c.value"
            type="button"
            :class="cn(
              'rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all',
              form.contracts.includes(c.value)
                ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary/30'
                : 'border-input hover:bg-accent',
            )"
            @click="toggleContract(c.value)"
          >
            {{ c.label }}
          </button>
        </div>
        <p v-if="errors.contracts" class="text-danger text-xs">{{ errors.contracts }}</p>
      </div>

      <!-- active -->
      <div class="bg-muted/40 flex items-center justify-between rounded-lg px-4 py-3">
        <span class="text-sm font-medium">{{ t('riders.form.activeAccount') }}</span>
        <Switch v-model="form.active" />
      </div>

      <!-- auto-user note -->
      <p v-if="!isEdit" class="text-muted-foreground flex items-start gap-2 text-xs">
        <Info class="mt-0.5 size-3.5 shrink-0" />
        {{ t('riders.form.autoUser') }}
      </p>
    </form>

    <template #footer>
      <Button variant="ghost" @click="emit('update:open', false)">{{ t('riders.form.cancel') }}</Button>
      <Button :disabled="saving" @click="submit">{{ t('riders.form.save') }}</Button>
    </template>
  </Dialog>
</template>
