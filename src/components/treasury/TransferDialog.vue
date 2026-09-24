<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ArrowLeftRight, ShieldCheck } from 'lucide-vue-next'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { DatePicker } from '@/components/ui/datepicker'
import { Dropdown } from '@/components/ui/dropdown'
import { Button } from '@/components/ui/button'
import { useToast } from '@/composables/useToast'
import { createTransfer } from '@/api/treasury'

/* Only the boxes the signed-in user has permission on are offered, on both
   sides (the page passes them already filtered; the manager gets all). */
const props = defineProps({
  open: { type: Boolean, default: false },
  treasuryOptions: { type: Array, default: () => [] },
  allBoxes: { type: Boolean, default: false },
})
const emit = defineEmits(['update:open', 'saved'])

const { t } = useI18n()
const toast = useToast()
const saving = ref(false)
const form = reactive({ fromId: '', toId: '', date: new Date().toISOString().slice(0, 10), amount: '', description: '' })
const errors = reactive({})
// the destination list leaves out the source box
const toOptions = computed(() => props.treasuryOptions.filter((o) => o.value !== form.fromId))
watch(
  () => form.fromId,
  (v) => {
    if (form.toId === v) form.toId = toOptions.value[0]?.value || ''
  },
)

watch(
  () => props.open,
  (v) => {
    if (!v) return
    Object.assign(form, { fromId: props.treasuryOptions[0]?.value || '', toId: props.treasuryOptions[1]?.value || '', date: new Date().toISOString().slice(0, 10), amount: '', description: '' })
    Object.keys(errors).forEach((k) => delete errors[k])
  },
)

async function submit() {
  if (saving.value) return
  Object.keys(errors).forEach((k) => delete errors[k])
  if (!form.fromId || !form.toId) errors.to = t('common.required')
  else if (form.fromId === form.toId) errors.to = t('treasury.transfer.same')
  if (!(Number(form.amount) > 0)) errors.amount = t('treasury.voucher.errAmount')
  if (Object.keys(errors).length) return
  saving.value = true
  try {
    const { ref } = await createTransfer({ ...form })
    toast.success(t('treasury.transfer.saved', { ref }))
    emit('saved')
    emit('update:open', false)
  } catch (e) {
    if (e.message === 'SAME_TREASURY') errors.to = t('treasury.transfer.same')
    else errors.amount = t('treasury.voucher.errAmount')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <Dialog :open="open" :title="t('treasury.transfer.title')" :icon="ArrowLeftRight" @update:open="emit('update:open', $event)">
    <form class="space-y-4" @submit.prevent="submit">
      <p v-if="!allBoxes" class="bg-muted/40 text-muted-foreground flex items-start gap-2 rounded-lg px-3 py-2 text-xs">
        <ShieldCheck class="text-primary mt-0.5 size-3.5 shrink-0" />
        {{ treasuryOptions.length < 2 ? t('treasury.access.transferTooFew') : t('treasury.access.transferHint') }}
      </p>
      <div class="grid gap-4 sm:grid-cols-2">
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('treasury.transfer.from') }}</label>
          <Dropdown v-model="form.fromId" :options="treasuryOptions" />
        </div>
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('treasury.transfer.to') }}</label>
          <Dropdown v-model="form.toId" :options="toOptions" :invalid="!!errors.to" />
          <p v-if="errors.to" class="text-danger text-xs">{{ errors.to }}</p>
        </div>
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('common.amount') }}</label>
          <Input v-model="form.amount" type="number" dir="ltr" :invalid="!!errors.amount" />
          <p v-if="errors.amount" class="text-danger text-xs">{{ errors.amount }}</p>
        </div>
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('common.date') }}</label>
          <DatePicker v-model="form.date" :clearable="false" />
        </div>
      </div>
      <div class="space-y-1.5">
        <label class="text-sm font-medium">{{ t('common.description') }}</label>
        <Input v-model="form.description" />
      </div>
    </form>
    <template #footer>
      <Button variant="ghost" @click="emit('update:open', false)">{{ t('common.cancel') }}</Button>
      <Button :disabled="saving" @click="submit">{{ t('common.save') }}</Button>
    </template>
  </Dialog>
</template>
