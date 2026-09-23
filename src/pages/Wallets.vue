<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouteTab } from '@/composables/useRouteTab'
import {
  Search, HandCoins, FileText, AlertTriangle, Plus, ClipboardCheck, Landmark,
  Eye, ListChecks, FileWarning, ExternalLink,
} from 'lucide-vue-next'
import PageHeader from '@/components/common/PageHeader.vue'
import Avatar from '@/components/common/Avatar.vue'
import RiderCode from '@/components/common/RiderCode.vue'
import { Card } from '@/components/ui/card'
import { Tabs } from '@/components/ui/tabs'
import { DataTable } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dropdown } from '@/components/ui/dropdown'
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
const depositStatus = ref('pending')
const depositStatusOptions = computed(() => [
  { value: 'pending', label: t('wallets.deposits.pendingOnly') },
  { value: '', label: t('wallets.deposits.all') },
])

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
    fetchWallets(), fetchDeposits({ status: depositStatus.value }), fetchWithdrawals(), fetchDebtsOverview(), fetchTreasuries(),
  ])
  loading.value = false
}
onMounted(load)
async function reloadDeposits() {
  deposits.value = await fetchDeposits({ status: depositStatus.value })
}

const filtered = computed(() =>
  wallets.value.filter((w) => !query.value || `${w.name} ${w.id}`.toLowerCase().includes(query.value.trim().toLowerCase())),
)
const overCount = computed(() => wallets.value.filter((w) => w.over).length)
const totalCash = computed(() => wallets.value.reduce((s, w) => s + w.balance, 0))
const totalPending = computed(() => wallets.value.reduce((s, w) => s + w.pending, 0))
const pendingCount = computed(() => deposits.value.filter((d) => d.status === 'pending').length)
const totalDebt = computed(() => debts.value.reduce((s, d) => s + d.debt, 0))
const ridersWithDebt = computed(() => debts.value.filter((d) => d.debt > 0).length)
const totalWithdrawals = computed(() => withdrawals.value.reduce((s, w) => s + w.amount, 0))

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

    <div class="mb-6"><Tabs v-model="tab" :tabs="tabs" /></div>

    <!-- ── Wallets ─────────────────────────────────────────── -->
    <template v-if="tab === 'wallets'">
      <div class="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card class="p-5"><p class="text-muted-foreground text-sm">{{ t('wallets.balance') }}</p><p class="mt-1 text-2xl font-bold tabular-nums">{{ sar(totalCash) }}</p></Card>
        <Card class="p-5"><p class="text-muted-foreground text-sm">{{ t('wallets.pending') }}</p><p class="text-warning-foreground mt-1 text-2xl font-bold tabular-nums">{{ sar(totalPending) }}</p></Card>
        <Card class="p-5"><p class="text-muted-foreground text-sm">{{ t('wallets.over') }}</p><p class="text-danger mt-1 text-2xl font-bold tabular-nums">{{ overCount }}</p></Card>
        <Card class="p-5"><p class="text-muted-foreground text-sm">{{ t('common.target') }}</p><p class="mt-1 text-2xl font-bold tabular-nums">{{ sar(WALLET_WARNING_THRESHOLD) }}</p></Card>
      </div>

      <div class="mb-4 max-w-xs">
        <div class="relative">
          <Search class="text-muted-foreground pointer-events-none absolute top-1/2 size-4 -translate-y-1/2 start-3.5" />
          <Input v-model="query" :placeholder="t('wallets.searchPlaceholder')" class="ps-10" />
        </div>
      </div>

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
          <template #cell-actions="{ row }">
            <div class="flex items-center justify-end gap-1">
              <button type="button" class="hover:bg-accent text-muted-foreground hover:text-foreground inline-flex size-8 items-center justify-center rounded-lg" :title="t('wallets.statement')" @click="openStatement(row)">
                <FileText class="size-4" />
              </button>
              <button type="button" class="hover:bg-accent text-muted-foreground hover:text-primary inline-flex size-8 items-center justify-center rounded-lg" :title="t('wallets.handover')" @click="openHandover(row)">
                <HandCoins class="size-4" />
              </button>
            </div>
          </template>
        </DataTable>
      </Card>
    </template>

    <!-- ── Deposit approvals (#4b) ─────────────────────────── -->
    <template v-else-if="tab === 'deposits'">
      <div class="mb-4 flex flex-wrap items-center gap-3">
        <Badge v-if="pendingCount" variant="warning"><ClipboardCheck class="size-3.5" /> {{ pendingCount }} {{ t('wallets.pending') }}</Badge>
        <Dropdown v-model="depositStatus" :options="depositStatusOptions" class="ms-auto w-auto min-w-[170px]" @change="reloadDeposits" />
      </div>
      <Card class="overflow-hidden">
        <DataTable
          :loading="loading"
          :rows="deposits"
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
            <Button v-if="row.status === 'pending' && canAct" size="sm" variant="outline" @click="openDecision(row)"><ListChecks /> {{ t('common.review') }}</Button>
            <span v-else-if="row.transferRef" class="text-muted-foreground text-xs tabular-nums" dir="ltr">{{ row.transferRef }}</span>
          </template>
        </DataTable>
      </Card>
    </template>

    <!-- ── Withdrawals (#4b) ───────────────────────────────── -->
    <template v-else-if="tab === 'withdrawals'">
      <div class="mb-6 grid gap-4 sm:grid-cols-2">
        <Card class="p-5"><p class="text-muted-foreground text-sm">{{ t('wallets.withdrawals.total') }}</p><p class="mt-1 text-2xl font-bold tabular-nums">{{ sar(totalWithdrawals) }}</p></Card>
        <Card class="p-5"><p class="text-muted-foreground text-sm">{{ t('wallets.withdrawals.count') }}</p><p class="mt-1 text-2xl font-bold tabular-nums">{{ num(withdrawals.length) }}</p></Card>
      </div>
      <Card class="overflow-hidden">
        <DataTable
          :loading="loading"
          :rows="withdrawals"
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
        <Card class="p-5"><p class="text-muted-foreground text-sm">{{ t('wallets.debts.kpi.total') }}</p><p class="text-danger mt-1 text-2xl font-bold tabular-nums">{{ sar(totalDebt) }}</p></Card>
        <Card class="p-5"><p class="text-muted-foreground text-sm">{{ t('wallets.debts.kpi.riders') }}</p><p class="mt-1 text-2xl font-bold tabular-nums">{{ num(ridersWithDebt) }}</p></Card>
        <Card class="p-5"><p class="text-muted-foreground text-sm">{{ t('wallets.debts.kpi.pending') }}</p><p class="text-warning-foreground mt-1 text-2xl font-bold tabular-nums">{{ sar(totalPending) }}</p></Card>
      </div>
      <Card class="overflow-hidden">
        <DataTable
          :loading="loading"
          :rows="debts"
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
            <div class="flex items-center justify-end gap-1">
              <Button size="sm" variant="outline" @click="openDebts(row)"><ExternalLink /> {{ t('common.details') }}</Button>
              <template v-if="canAct">
                <button type="button" class="hover:bg-accent text-muted-foreground hover:text-foreground inline-flex size-8 items-center justify-center rounded-lg" :title="t('wallets.debts.notice')" @click="openDebtAction(row, 'notice')"><FileWarning class="size-4" /></button>
                <button type="button" class="hover:bg-accent text-muted-foreground hover:text-danger inline-flex size-8 items-center justify-center rounded-lg disabled:opacity-40" :title="t('wallets.debts.convert')" :disabled="row.wallet - row.pending <= 0" @click="openDebtAction(row, 'convert')"><HandCoins class="size-4" /></button>
              </template>
            </div>
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
