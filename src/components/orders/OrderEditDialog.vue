<script setup>
import { ref, reactive, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useToast } from '@/composables/useToast'
import { useAuthStore } from '@/stores/auth'
import { updateOrder } from '@/api/orders'

const props = defineProps({
  open: { type: Boolean, default: false },
  log: { type: Object, default: null },
  bySupervisor: { type: Boolean, default: true },
})
const emit = defineEmits(['update:open', 'saved'])

const { t } = useI18n()
const toast = useToast()
const auth = useAuthStore()
const saving = ref(false)
const form = reactive({ orders: '', cash: '', hours: '', notes: '', reason: '' })
const errors = reactive({})

watch(
  () => props.open,
  (v) => {
    if (!v || !props.log) return
    Object.assign(form, { orders: props.log.orders, cash: props.log.cash, hours: props.log.hours, notes: props.log.notes, reason: '' })
    delete errors.reason
  },
)

async function submit() {
  if (saving.value) return
  delete errors.reason
  if (props.bySupervisor && !form.reason.trim()) {
    errors.reason = t('orders.reasonRequired')
    return
  }
  saving.value = true
  try {
    await updateOrder(props.log.id, form, { bySupervisor: props.bySupervisor, editor: auth.user?.name, reason: form.reason })
    toast.success(t('orders.saved'))
    emit('saved')
    emit('update:open', false)
  } catch (e) {
    toast.error(e.message === 'OUT_OF_WINDOW' ? t('orders.outOfWindow') : t('orders.reasonRequired'))
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <Dialog :open="open" :title="t('orders.editTitle')" @update:open="emit('update:open', $event)">
    <form class="space-y-4" @submit.prevent="submit">
      <div class="grid gap-4 sm:grid-cols-3">
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('orders.fields.orders') }}</label>
          <Input v-model="form.orders" type="number" dir="ltr" />
        </div>
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('orders.fields.cash') }}</label>
          <Input v-model="form.cash" type="number" dir="ltr" />
        </div>
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('orders.fields.hours') }}</label>
          <Input v-model="form.hours" type="number" dir="ltr" />
        </div>
      </div>
      <div class="space-y-1.5">
        <label class="text-sm font-medium">{{ t('orders.fields.notes') }}</label>
        <Textarea v-model="form.notes" :rows="2" />
      </div>
      <div v-if="bySupervisor" class="space-y-1.5">
        <label class="text-sm font-medium">{{ t('orders.reason') }}</label>
        <Input v-model="form.reason" :invalid="!!errors.reason" />
        <p v-if="errors.reason" class="text-danger text-xs">{{ errors.reason }}</p>
      </div>
    </form>
    <template #footer>
      <Button variant="ghost" @click="emit('update:open', false)">{{ t('common.cancel') }}</Button>
      <Button :disabled="saving" @click="submit">{{ t('common.save') }}</Button>
    </template>
  </Dialog>
</template>
