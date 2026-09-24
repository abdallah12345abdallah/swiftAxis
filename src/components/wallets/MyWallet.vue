<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  Wallet, HandCoins, ArrowDownLeft, Hourglass, FileWarning, ArrowUpRight,
  Landmark, AlertTriangle, Download, History,
} from 'lucide-vue-next'
import MetricTile from '@/components/common/MetricTile.vue'
import FilterBar from '@/components/common/FilterBar.vue'
import RiderCode from '@/components/common/RiderCode.vue'
import { Card } from '@/components/ui/card'
import { DataTable } from '@/components/ui/table'
import { DateRangePicker } from '@/components/ui/datepicker'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useCurrency } from '@/composables/useCurrency'
import { useDate } from '@/lib/format'
import { exportCsv, todayStamp } from '@/lib/export'
import { useAuthStore } from '@/stores/auth'
import { fetchMyWallet } from '@/api/wallets'

/* "My wallet" — the rider's own cash wallet: what they hold now, what is
   waiting for the accountant, what they owe, and every past movement on one
   timeline. Always the signed-in rider's data (auth.user.riderId), never
   another rider's. */
const { t } = useI18n()
const { sar, num } = useCurrency()
const { formatDate } = useDate()
const auth = useAuthStore()

const loading = ref(true)
const failed = ref(false)
const data = ref(null)

async function load() {
  loading.value = true
  failed.value = false
  try {
    data.value = await fetchMyWallet(auth.user?.riderId ?? '')
  } catch {
    data.value = null
    failed.value = true
  } finally {
    loading.value = false
  }
}
onMounted(load)

const rider = computed(() => data.value?.rider ?? null)

/* history: date range + search, movement type in the tray */
const query = ref('')
const range = ref(['', ''])
const filters = ref({ kind: '' })
const KINDS = ['collected', 'handover', 'toDebt', 'withdrawal', 'debit', 'credit']
const filterDefs = computed(() => [
  { key: 'kind', label: t('wallets.type'), options: KINDS.map((k) => ({ value: k, label: t(`wallets.mine.kinds.${k}`) })) },
])
const inRange = (d, [a, b]) => (!a || d >= a) && (!b || d <= b)
const rows = computed(() => {
  const q = query.value.trim().toLowerCase()
  return (data.value?.history ?? []).filter((r) =>
    inRange(r.date, range.value) &&
    (!filters.value.kind || r.kind === filters.value.kind) &&
    (!q || [r.label, r.ref, t(`wallets.mine.kinds.${r.kind}`)].some((v) => String(v ?? '').toLowerCase().includes(q))),
  )
})
const hasRange = computed(() => !!(range.value[0] || range.value[1]))

/* period figures follow the date range; balance, pending and debt are "now" */
const sum = (list) => list.reduce((s, r) => s + r.amount, 0)
const inPeriod = computed(() => (data.value?.history ?? []).filter((r) => inRange(r.date, range.value)))
const collected = computed(() => sum(inPeriod.value.filter((r) => r.kind === 'collected')))
const handedOver = computed(() => sum(inPeriod.value.filter((r) => r.kind === 'handover' && r.status === 'approved')))
const withdrawals = computed(() => sum(inPeriod.value.filter((r) => r.kind === 'withdrawal')))
const periodHint = computed(() => (hasRange.value ? t('wallets.mine.inPeriod') : t('wallets.mine.allTime')))
const limitUse = computed(() => (rider.value?.limit ? Math.min(100, Math.round((rider.value.balance / rider.value.limit) * 100)) : null))

const KIND_VARIANT = { collected: 'success', handover: 'secondary', toDebt: 'danger', withdrawal: 'warning', debit: 'danger', credit: 'success' }
const STATUS_VARIANT = { pending: 'warning', approved: 'success', rejected: 'danger' }
const amountClass = (r) => (r.sign > 0 ? 'text-success' : r.sign < 0 ? 'text-danger' : 'text-foreground')
const amountSign = (r) => (r.sign > 0 ? '+' : r.sign < 0 ? '−' : '')

const columns = computed(() => [
  { key: 'date', label: t('common.date'), sortable: true },
  { key: 'kind', label: t('wallets.type') },
  { key: 'label', label: t('common.description'), hideBelow: 'md' },
  { key: 'ref', label: t('common.ref'), hideBelow: 'lg' },
  { key: 'amount', label: t('common.amount'), align: 'end', sortable: true },
  { key: 'balance', label: t('wallets.mine.balanceAfter'), align: 'end', hideBelow: 'sm' },
])

function exportHistory() {
  exportCsv(
    `my-wallet-${rider.value?.id ?? ''}-${todayStamp()}`,
    [t('common.date'), t('wallets.type'), t('common.status'), t('common.description'), t('common.ref'), t('common.amount'), t('wallets.mine.balanceAfter')],
    rows.value.map((r) => [
      r.date, t(`wallets.mine.kinds.${r.kind}`), r.status === 'posted' ? '' : t(`wallets.deposits.statuses.${r.status}`),
      r.label ?? '', r.ref ?? '', `${amountSign(r)}${r.amount}`, r.balance ?? '',
    ]),
  )
}
</script>

<template>
  <div class="space-y-6">
    <div v-if="loading && !data" class="space-y-4">
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Skeleton v-for="i in 6" :key="i" class="h-28 rounded-2xl" />
      </div>
      <Skeleton class="h-64 rounded-2xl" />
    </div>

    <Card v-else-if="failed || !rider" class="p-6">
      <p class="text-muted-foreground flex items-center gap-2 text-sm"><AlertTriangle class="text-warning-foreground size-4" /> {{ t('wallets.mine.noRider') }}</p>
    </Card>

    <template v-else>
      <!-- who + custody box -->
      <div class="bg-card flex flex-wrap items-center gap-3 rounded-2xl border px-4 py-3 text-sm">
        <span class="font-semibold">{{ rider.name }}</span>
        <RiderCode :code="rider.id" />
        <span class="text-muted-foreground inline-flex items-center gap-1 text-xs"><Landmark class="size-3.5" /> {{ t('wallets.treasury') }}: {{ rider.treasuryName }}</span>
        <Badge v-if="rider.over" variant="danger" class="ms-auto"><AlertTriangle class="size-3.5" /> {{ t('wallets.mine.overLimit', { limit: sar(rider.limit) }) }}</Badge>
      </div>

      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricTile :label="t('wallets.mine.balance')" :value="rider.balance" :format="sar" :icon="Wallet" :tone="rider.over ? 'danger' : 'brand'"
          :progress="limitUse" :hint="t('wallets.mine.balanceHint', { v: sar(rider.available), limit: sar(rider.limit) })" />
        <MetricTile :label="t('wallets.mine.pending')" :value="rider.pending" :format="sar" :icon="Hourglass" tone="warning"
          :hint="t('wallets.mine.pendingHint')" />
        <MetricTile :label="t('wallets.mine.debt')" :value="rider.debt" :format="sar" :icon="FileWarning" tone="danger"
          :hint="rider.openDebts ? t('wallets.mine.debtHint', { n: num(rider.openDebts) }) : t('wallets.mine.noDebt')" />
        <MetricTile :label="t('wallets.mine.collected')" :value="collected" :format="sar" :icon="ArrowDownLeft" tone="success" :hint="periodHint" />
        <MetricTile :label="t('wallets.mine.handedOver')" :value="handedOver" :format="sar" :icon="HandCoins" tone="orange" :hint="periodHint" />
        <MetricTile :label="t('wallets.mine.withdrawals')" :value="withdrawals" :format="sar" :icon="ArrowUpRight" tone="primary" :hint="periodHint" />
      </div>

      <section class="space-y-4" aria-labelledby="my-wallet-history">
        <h2 id="my-wallet-history" class="flex items-center gap-2 font-semibold"><History class="text-primary size-4" /> {{ t('wallets.mine.history') }}</h2>
        <FilterBar v-model:search="query" v-model="filters" :filters="filterDefs" :search-placeholder="t('wallets.mine.searchPh')">
          <template #extra><DateRangePicker v-model="range" /></template>
          <template #actions>
            <Button variant="outline" size="sm" class="ms-auto" :disabled="!rows.length" @click="exportHistory"><Download /> {{ t('common.export') }}</Button>
          </template>
        </FilterBar>

        <Card class="overflow-hidden">
          <DataTable :loading="loading" :rows="rows" :empty="t('wallets.mine.empty')" :columns="columns" :page-size="12">
            <template #cell-date="{ row }"><span class="tabular-nums">{{ formatDate(row.date) }}</span></template>
            <template #cell-kind="{ row }">
              <span class="inline-flex flex-wrap items-center gap-1">
                <Badge :variant="KIND_VARIANT[row.kind] ?? 'secondary'">{{ t(`wallets.mine.kinds.${row.kind}`) }}</Badge>
                <Badge v-if="row.kind === 'handover' && row.status !== 'approved'" :variant="STATUS_VARIANT[row.status] ?? 'secondary'">{{ t(`wallets.deposits.statuses.${row.status}`) }}</Badge>
              </span>
            </template>
            <template #cell-label="{ row }">
              <span>{{ row.label || '—' }}</span>
              <span v-if="row.decision?.note" class="text-muted-foreground block text-xs">{{ row.decision.note }}</span>
            </template>
            <template #cell-ref="{ row }"><span class="text-muted-foreground tabular-nums" dir="ltr">{{ row.ref || '—' }}</span></template>
            <template #cell-amount="{ row }"><span class="font-semibold tabular-nums" :class="amountClass(row)">{{ amountSign(row) }}{{ sar(row.amount) }}</span></template>
            <template #cell-balance="{ row }"><span class="tabular-nums" :class="row.balance === null && 'text-muted-foreground'">{{ row.balance === null ? '—' : sar(row.balance) }}</span></template>
          </DataTable>
        </Card>
        <p class="text-muted-foreground text-xs leading-relaxed">{{ t('wallets.mine.legend') }}</p>
      </section>
    </template>
  </div>
</template>
