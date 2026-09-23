<script setup>
import MetricTile from '@/components/common/MetricTile.vue'
import { Wallet as MtWallet, Hourglass as MtHourglass, AlertTriangle as MtAlertTriangle, Target as MtTarget, ArrowUpRight as MtArrowUpRight, ListChecks as MtListChecks, FileWarning as MtFileWarning, Users as MtUsers } from 'lucide-vue-next'
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import ActionMenu from '@/components/common/ActionMenu.vue'
import { useRouteTab } from '@/composables/useRouteTab'
import {
  HandCoins, FileText, AlertTriangle, Plus, ClipboardCheck, Landmark,
  Eye, ListChecks, FileWarning, ExternalLink,
} from 'lucide-vue-next'
import PageHeader from '@/components/common/PageHeader.vue'
import FilterBar from '@/components/common/FilterBar.vue'
import { DateRangePicker } from '@/components/ui/datepicker'
import { CONTRACT_LIST } from '@/api/fixtures'
import Avatar from '@/components/common/Avatar.vue'
import RiderCode from '@/components/common/RiderCode.vue'
import { Card } from '@/components/ui/card'
import { DataTable } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import HandoverDialog from '@/components/wallets/HandoverDialog.vue'
import WalletStatementDialog from '@/components/wallets/WalletStatementDialog.vue'
import DepositDecisionDialog from '@/components/wallets/DepositDecisionDialog.vue'
import WithdrawalDialog from '@/components/wallets/WithdrawalDialog.vue'
import DebtActionDialog from '@/components/wallets/DebtActionDialog.vue'
import RiderDebtsDialog from '@/components/wallets/RiderDebtsDialog.vue'
import { useCurrency } from '@/composables/useCurrency'
import { useDate } from '@/lib/format'
import { useAuthStore } from '@/stores/auth'
import { ROLES, WALLET_WARNING_THRESHOLD } from '@/lib/constants'
import { fetchWallets, fetchDeposits, fetchWithdrawals, fetchDebtsOverview } from '@/api/wallets'
import { fetchTreasuries } from '@/api/treasury'

const { t } = useI18n()
const { sar, num } = useCurrency()
const { formatDate } = useDate()
const auth = useAuthStore()

/* the accountant (and the manager) decide deposits, withdraw and convert debts */
const canAct = computed(() => [ROLES.ACCOUNTANT, ROLES.MANAGER].includes(auth.role))

const tab = useRouteTab('wallets')
const tabs = computed(() => [
  { value: 'wallets', label: t('wallets.tabs.wallets') },
  { value: 'deposits', label: t('wallets.tabs.deposits') },
  { value: 'withdrawals', label: t('wallets.tabs.withdrawals') },
  { value: 'debts', label: t('wallets.tabs.debts') },
])

const loading = ref(true)
const wallets = ref([])
const deposits = ref([])
const withdrawals = ref([])
const debts = ref([])
const treasuries = ref([])

const query = ref('')

const handoverDialog = ref(false)
const statementDialog = ref(false)
const decisionDialog = ref(false)
const withdrawalDialog = ref(false)
const debtActionDialog = ref(false)
const debtActionMode = ref('convert')
const debtsDialog = ref(false)
const selected = ref(null)
const selectedDeposit = ref(null)
const selectedDebtRider = ref(null)

async function load() {
  loading.value = true
  ;[wallets.value, deposits.value, withdrawals.value, debts.value, treasuries.value] = await Promise.all([
    fetchWallets(), fetchDeposits(), fetchWithdrawals(), fetchDebtsOverview(), fetchTreasuries(),
  ])
  loading.value = false
}
onMounted(load)
async function reloadDeposits() {
  deposits.value = await fetchDeposits()
}

/* deposits: search, date range; status (pending by default, so the page opens
   on the approval queue) and receipt in the tray */
const depQuery = ref('')
const depRange = ref(['', ''])
const depFilters = ref({ status: 'pending', receipt: '' })
const depFilterDefs = computed(() => [
  { key: 'status', label: t('common.status'), options: ['pending', 'approved', 'rejected'].map((k) => ({ value: k, label: t(`wallets.deposits.statuses.${k}`) })) },
  { key: 'receipt', label: t('wallets.receipt'), options: [{ value: 'yes', label: t('wallets.filters.hasReceipt') }, { value: 'no', label: t('wallets.filters.noReceipt') }] },
])
const inRange2 = (d, [a, b]) => (!a || d >= a) && (!b || d <= b)
const textHit = (q, ...vals) => !q || vals.some((v) => String(v ?? '').toLowerCase().includes(q))
const shownDeposits = computed(() => {
  const q = depQuery.value.trim().toLowerCase()
  const f = depFilters.value
  return deposits.value.filter((d) =>
    inRange2(d.date, depRange.value) && textHit(q, d.riderName, d.riderId, d.label) &&
    (!f.status || d.status === f.status) &&
    (!f.receipt || (f.receipt === 'yes') === !!d.receipt),
  )
})

/* withdrawals: search, date range, custody box; the cards count what is shown */
const wdQuery = ref('')
const wdRange = ref(['', ''])
const wdFilters = ref({ treasury: '' })
const wdFilterDefs = computed(() => [
  { key: 'treasury', label: t('wallets.withdrawals.treasury'), options: [...new Set(withdrawals.value.map((w) => w.treasuryName).filter((n) => n && n !== '—'))].map((n) => ({ value: n, label: n })) },
])
const shownWithdrawals = computed(() => {
  const q = wdQuery.value.trim().toLowerCase()
  return withdrawals.value.filter((w) =>
    inRange2(w.date, wdRange.value) && textHit(q, w.riderName, w.riderId, w.reason, w.voucherRef) &&
    (!wdFilters.value.treasury || w.treasuryName === wdFilters.value.treasury),
  )
})

/* debts: search by rider, debt / pending in the tray (a balance "as of now",
   so no date range) */
const debtQuery = ref('')
const debtFilters = ref({ debt: '', pending: '' })
const debtFilterDefs = computed(() => [
  { key: 'debt', label: t('wallets.debt'), options: [{ value: 'yes', label: t('wallets.filters.hasDebt') }, { value: 'no', label: t('wallets.filters.noDebt') }] },
  { key: 'pending', label: t('wallets.pending'), options: [{ value: 'yes', label: t('wallets.filters.hasPending') }, { value: 'no', label: t('wallets.filters.noPending') }] },
])
const shownDebts = computed(() => {
  const q = debtQuery.value.trim().toLowerCase()
  const f = debtFilters.value
  return debts.value.filter((d) =>
    textHit(q, d.name, d.id) &&
    (!f.debt || (f.debt === 'yes') === d.debt > 0) &&
    (!f.pending || (f.pending === 'yes') === d.pending > 0),
  )
})

/* wallets: search by rider, tray filters on custody box, balance vs the limit,
   pending approval, debt and contract (balances are "as of now", so there is
   no date range here) */
const walletFilters = ref({ treasury: '', limit: '', pending: '', debt: '', contract: '' })
const yesNo = (key, yes, no) => [{ value: 'yes', label: t(`wallets.filters.${yes}`) }, { value: 'no', label: t(`wallets.filters.${no}`) }]
const walletFilterDefs = computed(() => [
  { key: 'treasury', label: t('wallets.treasury'), options: [...new Set(wallets.value.map((w) => w.treasuryName).filter((n) => n && n !== '—'))].map((n) => ({ value: n, label: n })) },
  { key: 'limit', label: t('wallets.balance'), options: [{ value: 'over', label: t('wallets.filters.overLimit') }, { value: 'within', label: t('wallets.filters.withinLimit') }] },
  { key: 'pending', label: t('wallets.pending'), options: yesNo('pending', 'hasPending', 'noPending') },
  { key: 'debt', label: t('wallets.debt'), options: yesNo('debt', 'hasDebt', 'noDebt') },
  { key: 'contract', label: t('riders.filters.contract'), options: CONTRACT_LIST.map((c) => ({ value: c.id, label: c.company })) },
])
const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  const f = walletFilters.value
  return wallets.value.filter((w) => {
    if (q && !`${w.name} ${w.id}`.toLowerCase().includes(q)) return false
    if (f.treasury && w.treasuryName !== f.treasury) return false
    if (f.limit === 'over' && !w.over) return false
    if (f.limit === 'within' && w.over) return false
    if (f.pending === 'yes' && !(w.pending > 0)) return false
    if (f.pending === 'no' && w.pending > 0) return false
    if (f.debt === 'yes' && !(w.debt > 0)) return false
    if (f.debt === 'no' && w.debt > 0) return false
    if (f.contract && w.contract !== f.contract) return false
    return true
  })
})
const overCount = computed(() => wallets.value.filter((w) => w.over).length)
const totalCash = computed(() => wallets.value.reduce((s, w) => s + w.balance, 0))
const totalPending = computed(() => wallets.value.reduce((s, w) => s + w.pending, 0))
const pendingCount = computed(() => deposits.value.filter((d) => d.status === 'pending').length)
const totalDebt = computed(() => debts.value.reduce((s, d) => s + d.debt, 0))
const ridersWithDebt = computed(() => debts.value.filter((d) => d.debt > 0).length)

const treasuryOptions = computed(() => treasuries.value.filter((x) => x.active && x.kind !== 'rider').map((x) => ({ value: x.id, label: x.name })))
const mainTreasuryId = computed(() => treasuries.value.find((x) => x.isMain)?.id ?? '')
const riderOptions = computed(() => wallets.value.filter((w) => w.active).map((w) => ({ value: w.id, label: w.name, hint: w.id })))

function openHandover(w) {
  selected.value = w
  handoverDialog.value = true
}
function openStatement(w) {
  selected.value = w
  statementDialog.value = true
}
function openDecision(d) {
  selectedDeposit.value = d
  decisionDialog.value = true
}
function openDebtAction(row, mode) {
  selectedDebtRider.value = row
  debtActionMode.value = mode
  debtActionDialog.value = true
}
function openReceipt(row) {
  if (row.receipt?.url) window.open(row.receipt.url, '_blank', 'noopener')
}
function openDebts(row) {
  selectedDebtRider.value = row
  debtsDialog.value = true
}

const statusVariant = { pending: 'warning', approved: 'success', rejected: 'danger' }
</script>

<template>
  <div>
    <PageHeader :title="t('wallets.title')" :subtitle="t('wallets.subtitle')">
      <template #actions>
        <Button v-if="tab === 'withdrawals' && canAct" @click="withdrawalDialog = true"><Plus /> {{ t('wallets.withdrawals.add') }}</Button>
      </template>
    </PageHeader>


    <!-- ── Wallets ─────────────────────────────────────────── -->
    <template v-if="tab === 'wallets'">
      <div class="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricTile :label="t('wallets.balance')" :value="totalCash" :format="sar" :icon="MtWallet" tone="brand" />
        <MetricTile :label="t('wallets.pending')" :value="totalPending" :format="sar" :icon="MtHourglass" tone="warning" />
        <MetricTile :label="t('wallets.over')" :value="overCount" :format="(v) => num(Math.round(v))" :icon="MtAlertTriangle" tone="danger" />
        <MetricTile :label="t('common.target')" :value="WALLET_WARNING_THRESHOLD" :format="sar" :icon="MtTarget" tone="orange" />
      </div>

      <FilterBar v-model:search="query" v-model="walletFilters" :filters="walletFilterDefs" :search-placeholder="t('wallets.searchPlaceholder')" class="mb-4" />

      <Card class="overflow-hidden">
        <DataTable
          :loading="loading"
          :rows="filtered"
          :empty="t('common.noData')"
          :columns="[
            { key: 'name', label: t('dashboard.table.rider'), sortable: true },
            { key: 'treasuryName', label: t('wallets.treasury'), hideBelow: 'lg' },
            { key: 'balance', label: t('wallets.balance'), align: 'end', sortable: true },
            { key: 'pending', label: t('wallets.pending'), align: 'end', hideBelow: 'md' },
            { key: 'debt', label: t('wallets.debt'), align: 'end', hideBelow: 'md' },
            { key: 'actions', label: t('common.actions'), align: 'end' },
          ]"
        >
          <template #cell-name="{ row }">
            <div class="flex items-center gap-3">
              <Avatar :initials="row.name.charAt(0)" :src="row.photo?.url" />
              <div class="min-w-0">
                <span class="block font-medium">{{ row.name }}</span>
                <RiderCode :code="row.id" />
              </div>
            </div>
          </template>
          <template #cell-treasuryName="{ row }"><span class="text-muted-foreground inline-flex items-center gap-1 text-xs"><Landmark class="size-3.5" /> {{ row.treasuryName }}</span></template>
          <template #cell-balance="{ row }">
            <span class="inline-flex items-center gap-1.5 font-semibold tabular-nums" :class="row.over ? 'text-danger' : ''">
              <AlertTriangle v-if="row.over" class="size-4" />
              {{ sar(row.balance) }}
            </span>
          </template>
          <template #cell-pending="{ row }"><span class="tabular-nums" :class="row.pending ? 'text-warning-foreground font-medium' : 'text-muted-foreground'">{{ row.pending ? sar(row.pending) : '—' }}</span></template>
          <template #cell-debt="{ row }"><span class="tabular-nums" :class="row.debt ? 'text-danger font-medium' : 'text-muted-foreground'">{{ row.debt ? sar(row.debt) : '—' }}</span></template>
          <template #expand="{ row }">
            <div class="flex flex-wrap gap-2 text-xs">
              <span class="bg-muted rounded-lg px-3 py-1.5">{{ t('wallets.treasury') }}: <b>{{ row.treasuryName }}</b></span>
              <span class="bg-muted rounded-lg px-3 py-1.5">{{ t('wallets.available') }}: <b class="tabular-nums">{{ sar(row.available) }}</b></span>
              <span class="bg-muted rounded-lg px-3 py-1.5">{{ t('wallets.pending') }}: <b class="tabular-nums">{{ sar(row.pending) }}</b></span>
              <span class="bg-muted rounded-lg px-3 py-1.5">{{ t('wallets.debt') }}: <b class="tabular-nums" :class="row.debt ? 'text-danger' : ''">{{ sar(row.debt) }}</b></span>
              <Button size="sm" variant="outline" class="ms-auto" @click="openStatement(row)"><FileText /> {{ t('wallets.statement') }}</Button>
              <Button size="sm" @click="openHandover(row)"><HandCoins /> {{ t('wallets.handover') }}</Button>
            </div>
          </template>
          <template #cell-actions="{ row }">
            <ActionMenu :items="[
                      { label: t('wallets.statement'), icon: FileText, tone: 'blue', onSelect: () => openStatement(row) },
                      { label: t('wallets.handover'), icon: HandCoins, tone: 'orange', onSelect: () => openHandover(row) },
                    ]" />
          </template>
        </DataTable>
      </Card>
    </template>

    <!-- ── Deposit approvals (#4b) ─────────────────────────── -->
    <template v-else-if="tab === 'deposits'">
      <FilterBar v-model:search="depQuery" v-model="depFilters" :filters="depFilterDefs" :search-placeholder="t('wallets.searchPlaceholder')" class="mb-4">
        <template #extra><DateRangePicker v-model="depRange" /></template>
        <template #actions>
          <Badge v-if="pendingCount" variant="warning" class="ms-auto"><ClipboardCheck class="size-3.5" /> {{ pendingCount }} {{ t('wallets.pending') }}</Badge>
        </template>
      </FilterBar>
      <Card class="overflow-hidden">
        <DataTable
          :loading="loading"
          :rows="shownDeposits"
          :empty="t('wallets.deposits.empty')"
          :page-size="12"
          :columns="[
            { key: 'riderName', label: t('dashboard.table.rider'), sortable: true },
            { key: 'date', label: t('wallets.deposits.submitted'), sortable: true },
            { key: 'amount', label: t('common.amount'), align: 'end', sortable: true },
            { key: 'receipt', label: t('wallets.receipt'), hideBelow: 'md' },
            { key: 'status', label: t('common.status') },
            { key: 'decision', label: t('wallets.deposits.decision'), hideBelow: 'lg' },
            { key: 'actions', label: t('common.actions'), align: 'end' },
          ]"
        >
          <template #cell-riderName="{ row }"><span class="flex items-center gap-2 font-medium">{{ row.riderName }} <RiderCode :code="row.riderId" /></span></template>
          <template #cell-date="{ row }"><span class="tabular-nums">{{ formatDate(row.date) }}</span><span v-if="row.label" class="text-muted-foreground ms-1 text-xs">{{ row.label }}</span></template>
          <template #cell-amount="{ row }"><span class="font-semibold tabular-nums">{{ sar(row.amount) }}</span></template>
          <template #cell-receipt="{ row }">
            <a v-if="row.receipt" :href="row.receipt.url" target="_blank" rel="noopener" class="text-primary inline-flex items-center gap-1 text-xs hover:underline"><Eye class="size-3.5" /> {{ t('wallets.deposits.viewReceipt') }}</a>
            <span v-else class="text-muted-foreground">—</span>
          </template>
          <template #cell-status="{ row }"><Badge :variant="statusVariant[row.status] ?? 'secondary'">{{ t(`wallets.deposits.statuses.${row.status}`) }}</Badge></template>
          <template #cell-decision="{ row }">
            <div v-if="row.decision" class="text-xs">
              <p>{{ t('wallets.deposits.decidedBy', { name: row.decision.by, date: row.decision.at?.replace('T', ' ') }) }}</p>
              <p v-if="row.decision.note" class="text-muted-foreground">{{ row.decision.note }}</p>
            </div>
            <span v-else class="text-muted-foreground">—</span>
          </template>
          <template #cell-actions="{ row }">
            <ActionMenu :items="[
                      { label: t('common.review'), icon: ListChecks, tone: 'green', show: row.status === 'pending' && canAct, onSelect: () => openDecision(row) },
                      { label: t('wallets.deposits.viewReceipt'), icon: Eye, tone: 'blue', show: !!row.receipt, onSelect: () => openReceipt(row) },
                    ]" />
          </template>
        </DataTable>
      </Card>
    </template>

    <!-- ── Withdrawals (#4b) ───────────────────────────────── -->
    <template v-else-if="tab === 'withdrawals'">
      <div class="mb-6 grid gap-4 sm:grid-cols-2">
        <MetricTile :label="t('wallets.withdrawals.total')" :value="shownWithdrawals.reduce((s, w) => s + w.amount, 0)" :format="sar" :icon="MtArrowUpRight" tone="orange" />
        <MetricTile :label="t('wallets.withdrawals.count')" :value="shownWithdrawals.length" :format="(v) => num(Math.round(v))" :icon="MtListChecks" tone="brand" />
      </div>
      <FilterBar v-model:search="wdQuery" v-model="wdFilters" :filters="wdFilterDefs" :search-placeholder="t('wallets.filters.searchWithdrawals')" class="mb-4">
        <template #extra><DateRangePicker v-model="wdRange" /></template>
      </FilterBar>
      <Card class="overflow-hidden">
        <DataTable
          :loading="loading"
          :rows="shownWithdrawals"
          :empty="t('wallets.withdrawals.empty')"
          :columns="[
            { key: 'date', label: t('common.date'), sortable: true },
            { key: 'riderName', label: t('dashboard.table.rider'), sortable: true },
            { key: 'reason', label: t('wallets.withdrawals.reason'), hideBelow: 'md' },
            { key: 'treasuryName', label: t('wallets.withdrawals.treasury'), hideBelow: 'lg' },
            { key: 'voucherRef', label: t('wallets.withdrawals.voucher') },
            { key: 'amount', label: t('common.amount'), align: 'end', sortable: true },
          ]"
        >
          <template #cell-date="{ row }"><span class="tabular-nums">{{ formatDate(row.date) }}</span></template>
          <template #cell-riderName="{ row }"><span class="flex items-center gap-2 font-medium">{{ row.riderName }} <RiderCode :code="row.riderId" /></span></template>
          <template #cell-reason="{ row }">{{ row.reason || '—' }}<span class="text-muted-foreground ms-1 text-xs">{{ row.by }}</span></template>
          <template #cell-voucherRef="{ row }"><RouterLink to="/treasury" class="text-primary tabular-nums hover:underline" dir="ltr">{{ row.voucherRef }}</RouterLink></template>
          <template #cell-amount="{ row }"><span class="font-semibold tabular-nums">{{ sar(row.amount) }}</span></template>
        </DataTable>
      </Card>
    </template>

    <!-- ── Debts (#4b) ─────────────────────────────────────── -->
    <template v-else>
      <div class="mb-6 grid gap-4 sm:grid-cols-3">
        <MetricTile :label="t('wallets.debts.kpi.total')" :value="totalDebt" :format="sar" :icon="MtFileWarning" tone="danger" />
        <MetricTile :label="t('wallets.debts.kpi.riders')" :value="ridersWithDebt" :format="(v) => num(Math.round(v))" :icon="MtUsers" tone="brand" />
        <MetricTile :label="t('wallets.debts.kpi.pending')" :value="totalPending" :format="sar" :icon="MtHourglass" tone="warning" />
      </div>
      <FilterBar v-model:search="debtQuery" v-model="debtFilters" :filters="debtFilterDefs" :search-placeholder="t('wallets.searchPlaceholder')" class="mb-4" />
      <Card class="overflow-hidden">
        <DataTable
          :loading="loading"
          :rows="shownDebts"
          :empty="t('common.noData')"
          :columns="[
            { key: 'name', label: t('dashboard.table.rider'), sortable: true },
            { key: 'wallet', label: t('wallets.debts.wallet'), align: 'end', hideBelow: 'md' },
            { key: 'pending', label: t('wallets.pending'), align: 'end', hideBelow: 'lg' },
            { key: 'debt', label: t('wallets.debts.totalDebt'), align: 'end', sortable: true },
            { key: 'lastNotice', label: t('wallets.debts.lastNotice'), hideBelow: 'xl' },
            { key: 'actions', label: t('common.actions'), align: 'end' },
          ]"
        >
          <template #cell-name="{ row }">
            <div class="flex items-center gap-3">
              <Avatar :initials="row.name.charAt(0)" :src="row.photo?.url" />
              <div class="min-w-0"><span class="block font-medium">{{ row.name }}</span><RiderCode :code="row.id" /></div>
            </div>
          </template>
          <template #cell-wallet="{ row }"><span class="tabular-nums">{{ sar(row.wallet) }}</span></template>
          <template #cell-pending="{ row }"><span class="tabular-nums" :class="row.pending ? 'text-warning-foreground' : 'text-muted-foreground'">{{ row.pending ? sar(row.pending) : '—' }}</span></template>
          <template #cell-debt="{ row }"><span class="font-semibold tabular-nums" :class="row.debt ? 'text-danger' : 'text-muted-foreground'">{{ row.debt ? sar(row.debt) : '—' }}</span></template>
          <template #cell-lastNotice="{ row }">
            <span v-if="row.lastNotice" class="text-xs"><Badge :variant="row.lastNotice.type === 'debit' ? 'danger' : 'success'">{{ row.lastNotice.ref }}</Badge> <span class="text-muted-foreground tabular-nums">{{ formatDate(row.lastNotice.date) }}</span></span>
            <span v-else class="text-muted-foreground">—</span>
          </template>
          <template #cell-actions="{ row }">
            <ActionMenu :items="[
                      { label: t('common.details'), icon: ExternalLink, tone: 'blue', onSelect: () => openDebts(row) },
                      { label: t('wallets.debts.notice'), icon: FileWarning, tone: 'orange', show: canAct, onSelect: () => openDebtAction(row, 'notice') },
                      { label: t('wallets.debts.convert'), icon: HandCoins, danger: true, show: canAct, disabled: row.wallet - row.pending <= 0, onSelect: () => openDebtAction(row, 'convert') },
                    ]" />
          </template>
        </DataTable>
      </Card>
    </template>

    <HandoverDialog v-model:open="handoverDialog" :rider="selected" @saved="load" />
    <WalletStatementDialog v-model:open="statementDialog" :rider="selected" />
    <DepositDecisionDialog v-model:open="decisionDialog" :deposit="selectedDeposit" @saved="load" />
    <WithdrawalDialog v-model:open="withdrawalDialog" :rider-options="riderOptions" :treasury-options="treasuryOptions" :default-treasury="mainTreasuryId" @saved="load" />
    <DebtActionDialog v-model:open="debtActionDialog" :mode="debtActionMode" :rider="selectedDebtRider" :treasury-options="treasuryOptions" @saved="load" />
    <RiderDebtsDialog v-model:open="debtsDialog" :rider-id="selectedDebtRider?.id ?? ''" :treasury-options="treasuryOptions" :can-act="canAct" @changed="load" />
  </div>
</template>
