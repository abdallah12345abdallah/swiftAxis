<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { DatePicker } from '@/components/ui/datepicker'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { createContract, updateContract } from '@/api/riders'

const props = defineProps({
  open: { type: Boolean, default: false },
  contract: { type: Object, default: null },
})
const emit = defineEmits(['update:open', 'saved'])

const { t } = useI18n()
const isEdit = computed(() => !!props.contract)
const saving = ref(false)

const blank = () => ({ company: '', amount: '', start: '', end: '', active: true })
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
        amount: props.contract.amount ?? '',
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
    errors.company = t('contracts.errCompany')
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
    :title="isEdit ? t('contracts.editTitle') : t('contracts.addTitle')"
    @update:open="emit('update:open', $event)"
  >
    <form class="space-y-4" @submit.prevent="submit">
      <div class="space-y-1.5">
        <label class="text-sm font-medium">{{ t('contracts.company') }}</label>
        <Input v-model="form.company" :placeholder="t('contracts.companyPh')" :invalid="!!errors.company" />
        <p v-if="errors.company" class="text-danger text-xs">{{ errors.company }}</p>
      </div>

      <div class="space-y-1.5">
        <label class="text-sm font-medium">{{ t('contracts.amount') }}</label>
        <Input v-model="form.amount" type="number" dir="ltr" min="0" />
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('contracts.start') }}</label>
          <DatePicker v-model="form.start" />
        </div>
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('contracts.end') }}</label>
          <DatePicker v-model="form.end" />
        </div>
      </div>

      <div class="bg-muted/40 flex items-center justify-between rounded-lg px-4 py-3">
        <span class="text-sm font-medium">{{ t('contracts.status') }}</span>
        <Switch v-model="form.active" />
      </div>
    </form>

    <template #footer>
      <Button variant="ghost" @click="emit('update:open', false)">{{ t('contracts.cancel') }}</Button>
      <Button :disabled="saving" @click="submit">{{ t('contracts.save') }}</Button>
    </template>
  </Dialog>
</template>
