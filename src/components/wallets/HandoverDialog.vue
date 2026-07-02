<script setup>
import { ref, reactive, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useToast } from '@/composables/useToast'
import { recordHandover } from '@/api/wallets'

const props = defineProps({
  open: { type: Boolean, default: false },
  rider: { type: Object, default: null },
})
const emit = defineEmits(['update:open', 'saved'])

const { t } = useI18n()
const toast = useToast()
const saving = ref(false)
const form = reactive({ amount: '', date: new Date().toISOString().slice(0, 10), note: '' })
const errors = reactive({})

watch(
  () => props.open,
  (v) => {
    if (v) Object.assign(form, { amount: '', date: new Date().toISOString().slice(0, 10), note: '' })
  },
)

async function submit() {
  if (saving.value) return
  delete errors.amount
  if (!(Number(form.amount) > 0)) {
    errors.amount = t('wallets.invalidAmount')
    return
  }
  saving.value = true
  try {
    await recordHandover(props.rider.id, form)
    toast.success(t('wallets.recorded'))
    emit('saved')
    emit('update:open', false)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <Dialog :open="open" :title="t('wallets.handoverTitle')" :description="rider?.name" @update:open="emit('update:open', $event)">
    <form class="space-y-4" @submit.prevent="submit">
      <div class="grid gap-4 sm:grid-cols-2">
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('wallets.amount') }}</label>
          <Input v-model="form.amount" type="number" dir="ltr" :invalid="!!errors.amount" />
          <p v-if="errors.amount" class="text-danger text-xs">{{ errors.amount }}</p>
        </div>
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('common.date') }}</label>
          <Input v-model="form.date" type="date" dir="ltr" />
        </div>
      </div>
      <div class="space-y-1.5">
        <label class="text-sm font-medium">{{ t('wallets.note') }}</label>
        <Textarea v-model="form.note" :rows="2" />
      </div>
    </form>
    <template #footer>
      <Button variant="ghost" @click="emit('update:open', false)">{{ t('common.cancel') }}</Button>
      <Button :disabled="saving" @click="submit">{{ t('common.save') }}</Button>
    </template>
  </Dialog>
</template>
