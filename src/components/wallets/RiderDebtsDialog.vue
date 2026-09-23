<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ArrowDownLeft, ArrowUpRight, Landmark, Receipt, HandCoins, FileWarning } from 'lucide-vue-next'
import { Dialog } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import Avatar from '@/components/common/Avatar.vue'
import RiderCode from '@/components/common/RiderCode.vue'
import DebtActionDialog from '@/components/wallets/DebtActionDialog.vue'
import { useCurrency } from '@/composables/useCurrency'
import { useDate } from '@/lib/format'
import { fetchRiderDebts } from '@/api/wallets'

/* Per-rider money view (#4b): debts, notices, withdrawals, deposits and the
   custody-box movements — opened from the "details" button on the debts screen. */
const props = defineProps({
  open: { type: Boolean, default: false },
  riderId: { type: String, default: '' },
  treasuryOptions: { type: Array, default: () => [] },
  canAct: { type: Boolean, default: false },
})
const emit = defineEmits(['update:open', 'changed'])

const { t } = useI18n()
const { sar } = useCurrency()
const { formatDate } = useDate()

const loading = ref(false)
const data = ref(null)
const tab = ref('debts')
const tabs = computed(() => [
  { value: 'debts', label: t('wallets.debts.debtsList') },
  { value: 'notices', label: t('wallets.debts.noticesList') },
  { value: 'withdrawals', label: t('wallets.debts.withdrawalsList') },
  { value: 'deposits', label: t('wallets.debts.depositsList') },
  { value: 'treasury', label: t('wallets.debts.treasuryMoves') },
])

async function load() {
  if (!props.riderId) return
  loading.value = true
  try {
    data.value = await fetchRiderDebts(props.riderId)
  } finally {
    loading.value = false
  }
}
watch(
  () => [props.open, props.riderId],
  ([open]) => {
    if (open) {
      tab.value = 'debts'
      load()
    }
  },
)

const actionOpen = ref(false)
const actionMode = ref('convert')
function act(mode) {
  actionMode.value = mode
  actionOpen.value = true
}
function onActed() {
  load()
  emit('changed')
}

const statusVariant = { pending: 'warning', approved: 'success', rejected: 'danger', posted: 'success' }
const moveIcon = (type) => (type === 'receipt' || type === 'transfer_in' ? ArrowDownLeft : ArrowUpRight)
const isIn = (type) => type === 'receipt' || type === 'transfer_in'
</script>

<template>
  <Dialog :open="open" size="lg" :title="t('wallets.debts.details')" @update:open="emit('update:open', $event)">
    <div v-if="loading || !data" class="space-y-3">
      <Skeleton class="h-16 rounded-2xl" />
      <Skeleton class="h-40 rounded-2xl" />
    </div>

    <div v-else class="space-y-4">
      <!-- header -->
      <div class="flex flex-wrap items-center gap-3">
        <Avatar :initials="data.rider.name.charAt(0)" :src="data.rider.photo?.url" class="size-12 text-base" />
        <div class="min-w-0 flex-1">
          <p class="flex items-center gap-2 font-bold">{{ data.rider.name }} <RiderCode :code="data.rider.id" /></p>
          <p class="text-muted-foreground flex items-center gap-1 text-xs"><Landmark class="size-3.5" /> {{ data.rider.treasuryName }}</p>
        </div>
        <div v-if="canAct" class="flex gap-2">
          <Button variant="outline" size="sm" @click="act('notice')"><FileWarning /> {{ t('wallets.debts.notice') }}</Button>
          <Button size="sm" :disabled="data.rider.wallet - data.rider.pending <= 0" @click="act('convert')"><HandCoins /> {{ t('wallets.debts.convert') }}</Button>
        </div>
      </div>

      <div class="grid grid-cols-3 gap-2 text-center text-sm">
        <div class="bg-muted/40 rounded-xl p-3"><p class="text-muted-foreground text-xs">{{ t('wallets.debts.wallet') }}</p><p class="mt-0.5 font-bold tabular-nums">{{ sar(data.rider.wallet) }}</p></div>
        <div class="bg-warning/10 rounded-xl p-3"><p class="text-muted-foreground text-xs">{{ t('wallets.pending') }}</p><p class="text-warning-foreground mt-0.5 font-bold tabular-nums">{{ sar(data.rider.pending) }}</p></div>
        <div class="bg-danger/8 rounded-xl p-3"><p class="text-muted-foreground text-xs">{{ t('wallets.debts.totalDebt') }}</p><p class="text-danger mt-0.5 font-bold tabular-nums">{{ sar(data.rider.debt) }}</p></div>
      </div>

      <Tabs v-model="tab" :tabs="tabs" />

      <div class="max-h-[42vh] overflow-auto rounded-xl border">
        <!-- debts -->
        <table v-if="tab === 'debts'" class="w-full text-sm">
          <thead class="bg-muted/50 text-muted-foreground sticky top-0"><tr>
            <th class="px-4 py-2 text-start font-medium">{{ t('common.date') }}</th>
            <th class="px-4 py-2 text-start font-medium">{{ t('common.notes') }}</th>
            <th class="px-4 py-2 text-start font-medium">{{ t('common.ref') }}</th>
            <th class="px-4 py-2 text-end font-medium">{{ t('common.amount') }}</th>
            <th class="px-4 py-2 text-end font-medium">{{ t('wallets.debts.remaining') }}</th>
          </tr></thead>
          <tbody>
            <tr v-for="d in data.debts" :key="d.id" class="border-t">
              <td class="px-4 py-2 tabular-nums">{{ formatDate(d.date) }}</td>
              <td class="px-4 py-2">{{ d.note || '—' }}<span class="text-muted-foreground ms-1 text-xs">{{ d.by }}</span></td>
              <td class="px-4 py-2 tabular-nums" dir="ltr">{{ d.noticeRef }}</td>
              <td class="px-4 py-2 text-end tabular-nums">{{ sar(d.amount) }}</td>
              <td class="px-4 py-2 text-end font-semibold tabular-nums" :class="d.remaining ? 'text-danger' : 'text-success'">{{ sar(d.remaining) }}</td>
            </tr>
            <tr v-if="!data.debts.length"><td colspan="5" class="text-muted-foreground py-8 text-center">{{ t('wallets.debts.empty') }}</td></tr>
          </tbody>
        </table>

        <!-- notices -->
        <table v-else-if="tab === 'notices'" class="w-full text-sm">
          <thead class="bg-muted/50 text-muted-foreground sticky top-0"><tr>
            <th class="px-4 py-2 text-start font-medium">{{ t('common.ref') }}</th>
            <th class="px-4 py-2 text-start font-medium">{{ t('common.date') }}</th>
            <th class="px-4 py-2 text-start font-medium">{{ t('wallets.debts.noticeType') }}</th>
            <th class="px-4 py-2 text-start font-medium">{{ t('common.notes') }}</th>
            <th class="px-4 py-2 text-end font-medium">{{ t('common.amount') }}</th>
          </tr></thead>
          <tbody>
            <tr v-for="n in data.notices" :key="n.id" class="border-t">
              <td class="px-4 py-2 tabular-nums" dir="ltr">{{ n.ref }}</td>
              <td class="px-4 py-2 tabular-nums">{{ formatDate(n.date) }}</td>
              <td class="px-4 py-2"><Badge :variant="n.type === 'debit' ? 'danger' : 'success'">{{ n.type === 'debit' ? t('wallets.debts.debit') : t('wallets.debts.credit') }}</Badge> <span class="text-muted-foreground text-xs">{{ t(`wallets.debts.source.${n.source}`) }}</span></td>
              <td class="px-4 py-2">{{ n.note || '—' }}</td>
              <td class="px-4 py-2 text-end font-semibold tabular-nums" :class="n.type === 'debit' ? 'text-danger' : 'text-success'">{{ n.type === 'debit' ? '−' : '+' }}{{ sar(n.amount) }}</td>
            </tr>
            <tr v-if="!data.notices.length"><td colspan="5" class="text-muted-foreground py-8 text-center">{{ t('wallets.debts.noNotices') }}</td></tr>
          </tbody>
        </table>

        <!-- withdrawals -->
        <table v-else-if="tab === 'withdrawals'" class="w-full text-sm">
          <thead class="bg-muted/50 text-muted-foreground sticky top-0"><tr>
            <th class="px-4 py-2 text-start font-medium">{{ t('common.date') }}</th>
            <th class="px-4 py-2 text-start font-medium">{{ t('wallets.withdrawals.reason') }}</th>
            <th class="px-4 py-2 text-start font-medium">{{ t('wallets.withdrawals.voucher') }}</th>
            <th class="px-4 py-2 text-end font-medium">{{ t('common.amount') }}</th>
          </tr></thead>
          <tbody>
            <tr v-for="w in data.withdrawals" :key="w.id" class="border-t">
              <td class="px-4 py-2 tabular-nums">{{ formatDate(w.date) }}</td>
              <td class="px-4 py-2">{{ w.reason || '—' }} <span class="text-muted-foreground text-xs">{{ w.treasuryName }}</span></td>
              <td class="px-4 py-2 tabular-nums" dir="ltr">{{ w.voucherRef }}</td>
              <td class="px-4 py-2 text-end font-semibold tabular-nums">{{ sar(w.amount) }}</td>
            </tr>
            <tr v-if="!data.withdrawals.length"><td colspan="4" class="text-muted-foreground py-8 text-center">{{ t('wallets.withdrawals.empty') }}</td></tr>
          </tbody>
        </table>

        <!-- deposits -->
        <table v-else-if="tab === 'deposits'" class="w-full text-sm">
          <thead class="bg-muted/50 text-muted-foreground sticky top-0"><tr>
            <th class="px-4 py-2 text-start font-medium">{{ t('common.date') }}</th>
            <th class="px-4 py-2 text-start font-medium">{{ t('common.status') }}</th>
            <th class="px-4 py-2 text-start font-medium">{{ t('wallets.deposits.decision') }}</th>
            <th class="px-4 py-2 text-end font-medium">{{ t('common.amount') }}</th>
          </tr></thead>
          <tbody>
            <tr v-for="m in data.deposits" :key="m.id" class="border-t">
              <td class="px-4 py-2 tabular-nums">{{ formatDate(m.date) }}<span class="text-muted-foreground ms-1 text-xs">{{ m.label }}</span></td>
              <td class="px-4 py-2"><Badge :variant="statusVariant[m.status] ?? 'secondary'">{{ t(`wallets.deposits.statuses.${m.status}`) }}</Badge></td>
              <td class="px-4 py-2 text-xs">
                <template v-if="m.decision">{{ m.decision.by }} · <span dir="ltr" class="tabular-nums">{{ m.decision.at?.replace('T', ' ') }}</span><span v-if="m.decision.note"> — {{ m.decision.note }}</span></template>
                <span v-else class="text-muted-foreground">—</span>
              </td>
              <td class="px-4 py-2 text-end font-semibold tabular-nums">{{ sar(m.amount) }}</td>
            </tr>
            <tr v-if="!data.deposits.length"><td colspan="4" class="text-muted-foreground py-8 text-center">{{ t('wallets.deposits.empty') }}</td></tr>
          </tbody>
        </table>

        <!-- treasury movements -->
        <table v-else class="w-full text-sm">
          <thead class="bg-muted/50 text-muted-foreground sticky top-0"><tr>
            <th class="px-4 py-2 text-start font-medium">{{ t('common.date') }}</th>
            <th class="px-4 py-2 text-start font-medium">{{ t('common.ref') }}</th>
            <th class="px-4 py-2 text-start font-medium">{{ t('treasury.voucher.treasury') }}</th>
            <th class="px-4 py-2 text-start font-medium">{{ t('common.description') }}</th>
            <th class="px-4 py-2 text-end font-medium">{{ t('common.amount') }}</th>
          </tr></thead>
          <tbody>
            <tr v-for="m in data.treasuryMovements" :key="m.id" class="border-t">
              <td class="px-4 py-2 tabular-nums">{{ formatDate(m.date) }}</td>
              <td class="px-4 py-2 tabular-nums" dir="ltr">{{ m.ref }} <Badge v-if="m.status !== 'posted'" :variant="statusVariant[m.status] ?? 'secondary'" class="ms-1">{{ t(`treasury.statuses.${m.status}`) }}</Badge></td>
              <td class="px-4 py-2">{{ m.treasuryName }}</td>
              <td class="px-4 py-2">{{ m.description }}</td>
              <td class="px-4 py-2 text-end font-semibold tabular-nums" :class="isIn(m.type) ? 'text-success' : 'text-danger'">
                <component :is="moveIcon(m.type)" class="inline size-3.5" /> {{ sar(m.amount) }}
              </td>
            </tr>
            <tr v-if="!data.treasuryMovements.length"><td colspan="5" class="text-muted-foreground py-8 text-center">{{ t('wallets.debts.noMoves') }}</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <template #footer>
      <Button variant="ghost" @click="emit('update:open', false)">{{ t('common.close') }}</Button>
    </template>

    <DebtActionDialog v-model:open="actionOpen" :mode="actionMode" :rider="data?.rider" :treasury-options="treasuryOptions" @saved="onActed" />
  </Dialog>
</template>
