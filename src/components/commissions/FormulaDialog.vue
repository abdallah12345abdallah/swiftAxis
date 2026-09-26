<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Plus, Trash2 } from 'lucide-vue-next'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useCurrency } from '@/composables/useCurrency'
import { useToast } from '@/composables/useToast'
import { computeCommission, updateFormula, tiersOf } from '@/api/commissions'

const props = defineProps({
  open: { type: Boolean, default: false },
  row: { type: Object, default: null }, // { riderId, name, formula }
})
const emit = defineEmits(['update:open', 'saved'])

const { t } = useI18n()
const { sar, num } = useCurrency()
const toast = useToast()
const saving = ref(false)

const form = reactive({ target: 0, base: 0, tiers: [] })
const sampleOrders = ref(500)

watch(
  () => props.open,
  (v) => {
    if (!v || !props.row) return
    form.target = props.row.formula.target
    form.base = props.row.formula.base
    form.tiers = tiersOf(props.row.formula).map((tier) => ({ upTo: tier.upTo, perOrder: tier.perOrder }))
    sampleOrders.value = props.row.formula.target + 20
  },
)

function addTier() {
  const last = form.tiers[form.tiers.length - 1]
  // the previous last tier was open-ended; give it a boundary so the new one can take over
  if (last && last.upTo == null) last.upTo = Number(form.target) + 100 * form.tiers.length
  form.tiers.push({ upTo: null, perOrder: last ? last.perOrder : 0 })
}
function removeTier(i) {
  if (form.tiers.length <= 1) return
  form.tiers.splice(i, 1)
  form.tiers[form.tiers.length - 1].upTo = null
}

const preview = computed(() => computeCommission(Number(sampleOrders.value) || 0, {
  target: Number(form.target) || 0,
  base: Number(form.base) || 0,
  tiers: form.tiers.map((tier) => ({ upTo: tier.upTo === null || tier.upTo === '' ? null : Number(tier.upTo) || 0, perOrder: Number(tier.perOrder) || 0 })),
}))

async function submit() {
  if (saving.value) return
  saving.value = true
  try {
    await updateFormula(props.row.riderId, form)
    toast.success(t('commissions.formula.saved'))
    emit('saved')
    emit('update:open', false)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <Dialog :open="open" :title="t('commissions.formula.editTitle')" :description="row ? `${row.name} · ${row.riderId}` : ''" @update:open="emit('update:open', $event)">
    <form class="space-y-4" @submit.prevent="submit">
      <div class="grid gap-4 sm:grid-cols-2">
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('commissions.formula.target') }}</label>
          <Input v-model="form.target" type="number" dir="ltr" />
        </div>
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('commissions.formula.base') }}</label>
          <Input v-model="form.base" type="number" dir="ltr" />
        </div>
      </div>

      <!-- tiers editor -->
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <label class="text-sm font-medium">{{ t('commissions.formula.tiers') }}</label>
          <Button type="button" variant="outline" size="sm" @click="addTier"><Plus /> {{ t('commissions.formula.addTier') }}</Button>
        </div>
        <div v-for="(tier, i) in form.tiers" :key="i" class="flex items-end gap-3">
          <div class="flex-1 space-y-1.5">
            <label class="text-muted-foreground text-xs">{{ t('commissions.formula.tierUpTo') }}</label>
            <Input v-if="tier.upTo !== null" v-model="tier.upTo" type="number" dir="ltr" class="h-9" />
            <div v-else class="bg-muted/40 text-muted-foreground flex h-9 items-center rounded-lg px-3 text-sm">{{ t('commissions.formula.tierUnlimited') }}</div>
          </div>
          <div class="flex-1 space-y-1.5">
            <label class="text-muted-foreground text-xs">{{ t('commissions.formula.tierPerOrder') }}</label>
            <Input v-model="tier.perOrder" type="number" dir="ltr" class="h-9" />
          </div>
          <button
            type="button"
            class="hover:bg-accent text-muted-foreground hover:text-destructive inline-flex size-9 shrink-0 items-center justify-center rounded-lg disabled:opacity-40"
            :disabled="form.tiers.length <= 1"
            :aria-label="t('commissions.formula.removeTier')"
            @click="removeTier(i)"
          >
            <Trash2 class="size-4" />
          </button>
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
          {{ t('commissions.formula.base') }} {{ sar(preview.base) }}
          <template v-for="(b, i) in preview.tierBreakdown" :key="i"> + {{ num(b.count) }} × {{ sar(b.perOrder) }}</template>
          = {{ sar(preview.total) }}
        </p>
      </div>
    </form>
    <template #footer>
      <Button variant="ghost" @click="emit('update:open', false)">{{ t('common.cancel') }}</Button>
      <Button :disabled="saving" @click="submit">{{ t('common.save') }}</Button>
    </template>
  </Dialog>
</template>
