<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useCurrency } from '@/composables/useCurrency'
import { useToast } from '@/composables/useToast'
import { computeCommission, updateFormula } from '@/api/commissions'

const props = defineProps({
  open: { type: Boolean, default: false },
  row: { type: Object, default: null }, // { contract, company, formula }
})
const emit = defineEmits(['update:open', 'saved'])

const { t } = useI18n()
const { sar, num } = useCurrency()
const toast = useToast()
const saving = ref(false)

const form = reactive({ target: 0, base: 0, perOrder: 0 })
const sampleOrders = ref(500)

watch(
  () => props.open,
  (v) => {
    if (!v || !props.row) return
    Object.assign(form, { ...props.row.formula })
    sampleOrders.value = props.row.formula.target + 20
  },
)

const preview = computed(() => computeCommission(Number(sampleOrders.value) || 0, form))

async function submit() {
  if (saving.value) return
  saving.value = true
  try {
    await updateFormula(props.row.contract, form)
    toast.success(t('commissions.formula.saved'))
    emit('saved')
    emit('update:open', false)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <Dialog :open="open" :title="t('commissions.formula.editTitle')" :description="row?.company" @update:open="emit('update:open', $event)">
    <form class="space-y-4" @submit.prevent="submit">
      <div class="grid gap-4 sm:grid-cols-3">
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('commissions.formula.target') }}</label>
          <Input v-model="form.target" type="number" dir="ltr" />
        </div>
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('commissions.formula.base') }}</label>
          <Input v-model="form.base" type="number" dir="ltr" />
        </div>
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('commissions.formula.perOrder') }}</label>
          <Input v-model="form.perOrder" type="number" dir="ltr" />
        </div>
      </div>

      <!-- live preview -->
      <div class="bg-muted/40 space-y-3 rounded-xl p-4">
        <p class="text-muted-foreground text-xs">{{ t('commissions.formula.previewHint') }}</p>
        <div class="flex items-center gap-3">
          <label class="text-sm">{{ t('commissions.formula.ordersLabel') }}</label>
          <Input v-model="sampleOrders" type="number" dir="ltr" class="h-9 w-28" />
          <span class="text-primary ms-auto text-2xl font-bold tabular-nums">{{ sar(preview.total) }}</span>
        </div>
        <p class="text-muted-foreground text-xs">
          {{ t('commissions.formula.base') }} {{ sar(preview.base) }} + {{ num(preview.extra) }} × {{ sar(preview.perOrder) }} = {{ sar(preview.extraAmount) }}
        </p>
      </div>
    </form>
    <template #footer>
      <Button variant="ghost" @click="emit('update:open', false)">{{ t('common.cancel') }}</Button>
      <Button :disabled="saving" @click="submit">{{ t('common.save') }}</Button>
    </template>
  </Dialog>
</template>
