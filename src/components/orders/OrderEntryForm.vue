<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useCurrency } from '@/composables/useCurrency'
import { useToast } from '@/composables/useToast'
import { createOrder, previewCommission } from '@/api/orders'

const props = defineProps({ riderId: { type: String, required: true } })
const emit = defineEmits(['saved'])

const { t } = useI18n()
const { sar, num } = useCurrency()
const toast = useToast()

const today = new Date().toISOString().slice(0, 10)
const saving = ref(false)
const form = reactive({ date: today, orders: '', cash: '', hours: '', notes: '' })

const preview = computed(() => previewCommissionSync())
function previewCommissionSync() {
  return previewCommission(props.riderId, form.orders)
}

async function submit() {
  if (saving.value) return
  saving.value = true
  try {
    await createOrder({ riderId: props.riderId, ...form })
    toast.success(t('orders.saved'))
    Object.assign(form, { orders: '', cash: '', hours: '', notes: '' })
    emit('saved')
  } catch (e) {
    toast.error(e.message === 'FUTURE_DATE' ? t('orders.futureDate') : t('common.required'))
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <Card class="p-5">
    <h3 class="mb-4 font-semibold">{{ t('orders.entryTitle') }}</h3>
    <form class="space-y-4" @submit.prevent="submit">
      <div class="grid gap-4 sm:grid-cols-2">
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('orders.fields.date') }}</label>
          <Input v-model="form.date" type="date" :max="today" dir="ltr" />
        </div>
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('orders.fields.orders') }}</label>
          <Input v-model="form.orders" type="number" dir="ltr" placeholder="0" />
        </div>
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('orders.fields.cash') }}</label>
          <Input v-model="form.cash" type="number" dir="ltr" placeholder="0" />
        </div>
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('orders.fields.hours') }}</label>
          <Input v-model="form.hours" type="number" dir="ltr" placeholder="0" />
        </div>
      </div>
      <div class="space-y-1.5">
        <label class="text-sm font-medium">{{ t('orders.fields.notes') }}</label>
        <Textarea v-model="form.notes" :rows="2" />
      </div>

      <!-- live commission preview -->
      <div class="bg-primary/5 border-primary/15 flex items-center justify-between rounded-xl border px-4 py-3">
        <div>
          <p class="text-muted-foreground text-xs">{{ t('orders.preview.title') }}</p>
          <p class="text-primary text-2xl font-bold tabular-nums">{{ sar(preview.total) }}</p>
        </div>
        <div class="text-muted-foreground text-end text-xs">
          <p>{{ t('orders.preview.base') }}: {{ sar(preview.base) }}</p>
          <p>{{ t('orders.preview.extra', { n: num(preview.extra) }) }}: {{ sar(preview.extraAmount) }}</p>
        </div>
      </div>

      <Button type="submit" class="w-full" size="lg" :disabled="saving">{{ t('orders.save') }}</Button>
    </form>
  </Card>
</template>
