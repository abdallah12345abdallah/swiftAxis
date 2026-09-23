<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Check, X, FileText, ExternalLink } from 'lucide-vue-next'
import { Dialog } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import RiderCode from '@/components/common/RiderCode.vue'
import { useCurrency } from '@/composables/useCurrency'
import { useDate } from '@/lib/format'
import { useToast } from '@/composables/useToast'
import { useAuthStore } from '@/stores/auth'
import { decideDeposit } from '@/api/wallets'

/* Accountant approval (#4b): approve or reject a deposit with a dated note. */
const props = defineProps({
  open: { type: Boolean, default: false },
  deposit: { type: Object, default: null },
})
const emit = defineEmits(['update:open', 'saved'])

const { t } = useI18n()
const { sar } = useCurrency()
const { formatDate } = useDate()
const toast = useToast()
const auth = useAuthStore()

const note = ref('')
const saving = ref(false)
watch(
  () => props.open,
  (v) => {
    if (v) note.value = ''
  },
)

async function decide(approve) {
  if (saving.value || !props.deposit) return
  saving.value = true
  try {
    await decideDeposit(props.deposit.id, { approve, note: note.value, by: auth.user?.name })
    toast.success(approve ? t('wallets.deposits.approved') : t('wallets.deposits.rejected'))
    emit('saved')
    emit('update:open', false)
  } catch {
    toast.error(t('common.required'))
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <Dialog :open="open" :title="t('wallets.deposits.decisionTitle')" @update:open="emit('update:open', $event)">
    <div v-if="deposit" class="space-y-4">
      <div class="bg-muted/40 grid grid-cols-2 gap-3 rounded-xl p-4 text-sm">
        <div class="col-span-2 flex items-center gap-2 font-semibold">{{ deposit.riderName }} <RiderCode :code="deposit.riderId" /></div>
        <div><p class="text-muted-foreground text-xs">{{ t('wallets.amount') }}</p><p class="text-primary text-xl font-bold tabular-nums">{{ sar(deposit.amount) }}</p></div>
        <div><p class="text-muted-foreground text-xs">{{ t('common.date') }}</p><p class="font-medium tabular-nums">{{ formatDate(deposit.date) }}</p></div>
        <div><p class="text-muted-foreground text-xs">{{ t('wallets.deposits.wallet') }}</p><p class="font-medium tabular-nums">{{ sar(deposit.walletBalance) }}</p></div>
        <div><p class="text-muted-foreground text-xs">{{ t('wallets.treasury') }}</p><p class="font-medium">{{ deposit.treasuryName }}</p></div>
        <p v-if="deposit.label" class="text-muted-foreground col-span-2 text-xs">{{ deposit.label }}</p>
      </div>

      <!-- receipt -->
      <div v-if="deposit.receipt" class="space-y-1.5">
        <p class="text-sm font-medium">{{ t('wallets.receipt') }}</p>
        <a :href="deposit.receipt.url" target="_blank" rel="noopener" class="hover:border-primary/50 flex items-center gap-3 rounded-xl border p-2.5 transition-colors">
          <img v-if="deposit.receipt.isImage" :src="deposit.receipt.url" class="size-14 rounded-lg object-cover" alt="" />
          <span v-else class="bg-muted grid size-14 shrink-0 place-items-center rounded-lg"><FileText class="size-6" /></span>
          <span class="min-w-0 flex-1 truncate text-sm">{{ deposit.receipt.name }}</span>
          <ExternalLink class="text-muted-foreground size-4" />
        </a>
      </div>

      <div class="space-y-1.5">
        <label class="text-sm font-medium">{{ t('wallets.deposits.decisionNote') }}</label>
        <Textarea v-model="note" :rows="3" />
        <p class="text-muted-foreground text-xs">{{ t('wallets.deposits.decisionHint') }}</p>
      </div>
    </div>
    <template #footer>
      <Button variant="ghost" @click="emit('update:open', false)">{{ t('common.cancel') }}</Button>
      <Button variant="destructive" :disabled="saving" @click="decide(false)"><X /> {{ t('wallets.deposits.reject') }}</Button>
      <Button :disabled="saving" @click="decide(true)"><Check /> {{ t('wallets.deposits.approve') }}</Button>
    </template>
  </Dialog>
</template>
