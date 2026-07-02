<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { createContract, updateContract } from '@/api/riders'

const props = defineProps({
  open: { type: Boolean, default: false },
  contract: { type: Object, default: null },
  cityOptions: { type: Array, default: () => [] },
})
const emit = defineEmits(['update:open', 'saved'])

const { t } = useI18n()
const isEdit = computed(() => !!props.contract)
const saving = ref(false)

const blank = () => ({ company: '', city: '', start: '', end: '', active: true })
const form = reactive(blank())
const errors = reactive({})

watch(
  () => props.open,
  (v) => {
    if (!v) return
    Object.assign(form, blank())
    Object.keys(errors).forEach((k) => delete errors[k])
    if (props.contract) {
      Object.assign(form, {
        company: props.contract.company,
        city: props.contract.city,
        start: props.contract.start ?? '',
        end: props.contract.end ?? '',
        active: props.contract.active,
      })
    }
  },
)

async function submit() {
  if (saving.value) return
  Object.keys(errors).forEach((k) => delete errors[k])
  if (!form.company.trim()) {
    errors.company = t('riders.contract.errCompany')
    return
  }
  saving.value = true
  try {
    const saved = isEdit.value
      ? await updateContract(props.contract.id, { ...form })
      : await createContract({ ...form })
    emit('saved', saved)
    emit('update:open', false)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <Dialog
    :open="open"
    :title="isEdit ? t('riders.contract.editTitle') : t('riders.contract.addTitle')"
    @update:open="emit('update:open', $event)"
  >
    <form class="space-y-4" @submit.prevent="submit">
      <div class="space-y-1.5">
        <label class="text-sm font-medium">{{ t('riders.contract.company') }}</label>
        <Input v-model="form.company" :placeholder="t('riders.contract.companyPh')" :invalid="!!errors.company" />
        <p v-if="errors.company" class="text-danger text-xs">{{ errors.company }}</p>
      </div>

      <div class="space-y-1.5">
        <label class="text-sm font-medium">{{ t('riders.contract.city') }}</label>
        <Select v-model="form.city" :options="cityOptions" :placeholder="t('riders.form.cityPh')" />
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('riders.contract.start') }}</label>
          <Input v-model="form.start" type="date" dir="ltr" />
        </div>
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('riders.contract.end') }}</label>
          <Input v-model="form.end" type="date" dir="ltr" />
        </div>
      </div>

      <div class="bg-muted/40 flex items-center justify-between rounded-lg px-4 py-3">
        <span class="text-sm font-medium">{{ t('riders.contract.status') }}</span>
        <Switch v-model="form.active" />
      </div>
    </form>

    <template #footer>
      <Button variant="ghost" @click="emit('update:open', false)">{{ t('riders.contract.cancel') }}</Button>
      <Button :disabled="saving" @click="submit">{{ t('riders.contract.save') }}</Button>
    </template>
  </Dialog>
</template>
