<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Bike, Car, Info } from 'lucide-vue-next'
import { VEHICLE_TYPES } from '@/api/fixtures'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Dropdown } from '@/components/ui/dropdown'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { FileDrop } from '@/components/ui/file-drop'
import Avatar from '@/components/common/Avatar.vue'
import { cn } from '@/lib/utils'
import { createRider, updateRider } from '@/api/riders'

const props = defineProps({
  open: { type: Boolean, default: false },
  rider: { type: Object, default: null }, // null = create
  contractOptions: { type: Array, default: () => [] }, // [{ value, label }]
  cityOptions: { type: Array, default: () => [] },
  vehicles: { type: Array, default: () => [] }, // the fleet, from fetchVehicles()
})
const emit = defineEmits(['update:open', 'saved'])

const { t, locale } = useI18n()

const isEdit = computed(() => !!props.rider)
const saving = ref(false)

const blank = () => ({
  photo: null,
  name: '',
  nationalId: '',
  mobile: '',
  city: '',
  vehicleId: '',
  contracts: [],
  active: true,
})

/* The fleet as one pickable list: "type · plate", with the current assignment
   as a hint. A vehicle seats one rider per shift, so one whose two shifts are
   both taken by other riders can't be picked. */
const typeName = (k) => VEHICLE_TYPES[k]?.[locale.value] ?? VEHICLE_TYPES[k]?.ar ?? k

const vehicleOptions = computed(() =>
  props.vehicles.map((v) => {
    const riderId = props.rider?.id
    const shiftsTaken = [v.morningRiderId, v.eveningRiderId].filter(Boolean)
    const mine = riderId && shiftsTaken.includes(riderId)
    return {
      value: v.id,
      label: `${typeName(v.type)} · ${v.plate}`,
      icon: v.type === 'car' ? Car : Bike,
      hint: shiftsTaken.length ? v.ridersLabel : t('riders.form.vehicleFree'),
      disabled: !mine && shiftsTaken.length >= 2,
    }
  }),
)

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
        photo: props.rider.photo ?? null,
        name: props.rider.name,
        nationalId: props.rider.nationalId,
        mobile: props.rider.mobile,
        city: props.rider.city,
        // older records only carry the plate — match it back to the fleet
        vehicleId:
          props.rider.vehicleId ??
          props.vehicles.find((v) => v.plate === props.rider.vehicle)?.id ??
          '',
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
    // the picker holds the vehicle id; plate + type stay denormalised on the
    // rider so tables, exports and reports keep reading them directly
    const picked = props.vehicles.find((v) => v.id === form.vehicleId) ?? null
    const payload = {
      ...form,
      vehicle: picked?.plate ?? '',
      vehicleType: picked?.type ?? '',
    }
    const saved = isEdit.value
      ? await updateRider(props.rider.id, payload)
      : await createRider(payload)
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
      <!-- photo (#1) -->
      <div class="flex items-start gap-4">
        <Avatar :initials="(form.name || '?').charAt(0)" :src="form.photo?.url" class="size-20 text-2xl" />
        <div class="min-w-0 flex-1 space-y-1.5">
          <label class="text-sm font-medium">{{ t('riders.form.photo') }} <span class="text-muted-foreground text-xs font-normal">({{ t('common.optional') }})</span></label>
          <FileDrop v-model="form.photo" accept="image/*" :hint="t('riders.form.photoHint')" />
        </div>
      </div>

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
          <Dropdown v-model="form.city" :options="cityOptions" :placeholder="t('riders.form.cityPh')" />
        </div>

        <!-- vehicle — one pick from the fleet (type + plate) -->
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('riders.form.vehicle') }}</label>
          <Dropdown
            v-model="form.vehicleId"
            :options="vehicleOptions"
            :placeholder="t('riders.form.vehiclePh')"
            clearable
          />
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
