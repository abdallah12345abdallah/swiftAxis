<script setup>
import MetricTile from '@/components/common/MetricTile.vue'
import { Banknote as MtBanknote, Landmark as MtLandmark, Wallet as MtWallet, Hourglass as MtHourglass, BookOpen as MtBookOpen, ArrowDownLeft as MtArrowDownLeft, ArrowUpRight as MtArrowUpRight, Scale as MtScale, PiggyBank as MtPiggyBank } from 'lucide-vue-next'
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import ActionMenu from '@/components/common/ActionMenu.vue'
import { useRouteTab } from '@/composables/useRouteTab'
import {
  Plus, Pencil, Download, Landmark, Banknote, Wallet, ArrowLeftRight, Star,
  ArrowDownLeft, ArrowUpRight, Link2,
} from 'lucide-vue-next'
import { useConfirm } from '@/composables/useConfirm'
import PageHeader from '@/components/common/PageHeader.vue'
import FilterBar from '@/components/common/FilterBar.vue'
import RiderCode from '@/components/common/RiderCode.vue'
import { Card } from '@/components/ui/card'
import { DataTable } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dropdown } from '@/components/ui/dropdown'
import { DateRangePicker } from '@/components/ui/datepicker'
import TreasuryDialog from '@/components/treasury/TreasuryDialog.vue'
import VoucherDialog from '@/components/treasury/VoucherDialog.vue'
import TransferDialog from '@/components/treasury/TransferDialog.vue'
import { useCurrency } from '@/composables/useCurrency'
import { useDate } from '@/lib/format'
import { exportCsv, todayStamp } from '@/lib/export'
import { useToast } from '@/composables/useToast'
import { TREASURY_KINDS } from '@/api/fixtures'
import {
  fetchTreasuries, fetchBalances, fetchMovements, fetchTransfers, fetchTreasuryStatement,
  fetchRiderTreasuryMap, setRiderTreasury,
} from '@/api/treasury'
import { fetchAccounts, fetchCostCenters } from '@/api/ledger'
import { fetchExpenseItems } from '@/api/catalogs'

const { t, locale } = useI18n()
const confirm = useConfirm()
const { sar, num } = useCurrency()
const { formatDate } = useDate()
const toast = useToast()

const tab = useRouteTab('treasuries')
const tabs = computed(() => [
  { value: 'treasuries', label: t('treasury.tabs.treasuries') },
  { value: 'payments', label: t('treasury.tabs.payments') },
  { value: 'receipts', label: t('treasury.tabs.receipts') },
  { value: 'transfers', label: t('treasury.tabs.transfers') },
  { value: 'statement', label: t('treasury.tabs.statement') },
  { value: 'settings', label: t('treasury.tabs.settings') },
])

const loading = ref(true)
const balances = ref({ cash: 0, bank: 0, custody: 0, pendingIn: 0, total: 0, treasuries: [] })
const treasuries = ref([])
const payments = ref([])
const receipts = ref([])
const transfers = ref([])
const riderMap = ref([])
const accounts = ref([])
const centers = ref([])
const expenseItems = ref([])

const treasuryDialog = ref(false)
const editingTreasury = ref(null)
const voucherDialog = ref(false)
const voucherMode = ref('payment')
const transferDialog = ref(false)

const loc = (map, k) => map[k]?.[locale.value] ?? map[k]?.ar ?? k
const kindIcon = (k) => (k === 'bank' ? Banknote : k === 'rider' ? Wallet : Landmark)

const treasuryOptions = computed(() => treasuries.value.filter((x) => x.active).map((x) => ({ value: x.id, label: x.name, hint: loc(TREASURY_KINDS, x.kind) })))
const nonRiderTreasuryOptions = computed(() => treasuryOptions.value.filter((o) => treasuries.value.find((x) => x.id === o.value)?.kind !== 'rider'))
const mainId = computed(() => treasuries.value.find((x) => x.isMain)?.id ?? '')
const accountOptions = computed(() =>
  accounts.value.filter((a) => !a.isGroup && a.active !== false && !['cash', 'bank', 'rider_wallets'].includes(a.id)).map((a) => ({ value: a.id, label: locale.value === 'ar' ? a.name : a.en, hint: a.code })),
)
const costCenterOptions = computed(() => centers.value.filter((c) => c.active).map((c) => ({ value: c.id, label: c.name })))
const expenseItemOptions = computed(() => expenseItems.value.filter((i) => i.active).map((i) => ({ value: i.id, label: locale.value === 'ar' ? i.name : i.en })))
const accName = (id) => {
  const a = accounts.value.find((x) => x.id === id)
  return a ? (locale.value === 'ar' ? a.name : a.en) : id ?? '—'
}
const ccName = (id) => centers.value.find((c) => c.id === id)?.name ?? '—'

async function load() {
  loading.value = true
  ;[balances.value, treasuries.value, payments.value, receipts.value, transfers.value, riderMap.value, accounts.value, centers.value, expenseItems.value] = await Promise.all([
    fetchBalances(), fetchTreasuries(), fetchMovements({ type: 'payment' }), fetchMovements({ type: 'receipt' }), fetchTransfers(),
    fetchRiderTreasuryMap(), fetchAccounts(), fetchCostCenters(), fetchExpenseItems(),
  ])
  if (!statementId.value) statementId.value = mainId.value
  loading.value = false
}
onMounted(load)

/* statement */
const statementId = ref('')
const from = ref('')
const to = ref('')
const dateRange = computed({
  get: () => [from.value, to.value],
  set: ([a, b]) => {
    from.value = a || ''
    to.value = b || ''
  },
})
const statement = ref(null)
const statementLoading = ref(false)
async function loadStatement() {
  if (!statementId.value) return
  statementLoading.value = true
  statement.value = await fetchTreasuryStatement(statementId.value, { from: from.value || undefined, to: to.value || undefined })
  statementLoading.value = false
}
watch([tab, statementId, from, to], () => {
  if (tab.value === 'statement') loadStatement()
})

function openAddTreasury() {
  editingTreasury.value = null
  treasuryDialog.value = true
}
function openEditTreasury(row) {
  editingTreasury.value = treasuries.value.find((x) => x.id === row.id) ?? row
  treasuryDialog.value = true
}
function openVoucher(mode) {
  voucherMode.value = mode
  voucherDialog.value = true
}

async function linkRider(row, treasuryId) {
  if (!treasuryId || treasuryId === row.treasuryId) return
  const target = treasuries.value.find((x) => x.id === treasuryId)?.name ?? ''
  await confirm({
    tone: 'warning',
    icon: Link2,
    title: t('confirm.linkRider.title'),
    message: t('confirm.linkRider.message', { treasury: target }),
    subject: `${row.name} · ${row.riderId}`,
    confirmText: t('confirm.linkRider.action'),
    onConfirm: async () => {
      await setRiderTreasury(row.riderId, treasuryId)
      toast.success(t('treasury.settings.saved'))
      await load()
    },
  })
}

function exportStatement() {
  if (!statement.value) return
  exportCsv(
    `treasury-${statementId.value}-${todayStamp()}`,
    [t('common.date'), t('common.ref'), t('treasury.statement.type'), t('common.description'), t('treasury.statement.in'), t('treasury.statement.out'), t('treasury.balance')],
    statement.value.rows.map((m) => [m.date, m.ref, t(`treasury.types.${m.type}`), m.description, m.in, m.out, m.balance]),
  )
}

const statusVariant = { posted: 'success', pending: 'warning', rejected: 'danger' }
/* boxes & banks list: search by name / IBAN; type and status in the tray */
const boxQuery = ref('')
const boxFilters = ref({ kind: '', status: '' })
const boxFilterDefs = computed(() => [
  { key: 'kind', label: t('treasury.kind'), options: Object.keys(TREASURY_KINDS).map((k) => ({ value: k, label: loc(TREASURY_KINDS, k) })) },
  { key: 'status', label: t('common.status'), options: [{ value: 'active', label: t('common.active') }, { value: 'inactive', label: t('common.inactive') }] },
])
const shownBoxes = computed(() => {
  const q = boxQuery.value.trim().toLowerCase()
  const f = boxFilters.value
  return treasuries.value.filter((x) =>
    (!q || [x.name, x.iban].some((v) => String(v ?? '').toLowerCase().includes(q))) &&
    (!f.kind || x.kind === f.kind) &&
    (!f.status || (f.status === 'active') === !!x.active),
  )
})

/* statement: the box picker and the date range sit in the bar (a box is always
   picked, so it is not a clearable filter); search and money in / out narrow
   the lines, the running balance stays as computed */
const stmtQuery = ref('')
const stmtFilters = ref({ direction: '' })
const stmtFilterDefs = computed(() => [
  { key: 'direction', label: t('treasury.statement.type'), options: [{ value: 'in', label: t('treasury.statement.in') }, { value: 'out', label: t('treasury.statement.out') }] },
])
const shownStatement = computed(() => {
  const q = stmtQuery.value.trim().toLowerCase()
  const d = stmtFilters.value.direction
  return (statement.value?.rows ?? []).filter((r) =>
    (!q || [r.ref, r.description, r.party].some((v) => String(v ?? '').toLowerCase().includes(q))) &&
    (!d || (d === 'in' ? r.in > 0 : r.out > 0)),
  )
})

/* receipts / payments / transfers: search, a date range and a filter tray.
   Each screen is its own page, so this state starts fresh on each one. */
const listQuery = ref('')
const listRange = ref(['', ''])
const listFilters = ref({ treasury: '', status: '', expenseItem: '', costCenter: '', from: '', to: '' })
const listStatusOptions = computed(() => ['posted', 'pending', 'rejected'].map((k) => ({ value: k, label: t(`treasury.statuses.${k}`) })))
const treasuryNameOptions = computed(() => treasuries.value.map((x) => ({ value: x.name, label: x.name })))
const listFilterDefs = computed(() => {
  if (tab.value === 'transfers') {
    return [
      { key: 'status', label: t('common.status'), options: listStatusOptions.value },
      { key: 'from', label: t('treasury.transfer.from'), options: treasuryNameOptions.value },
      { key: 'to', label: t('treasury.transfer.to'), options: treasuryNameOptions.value },
    ]
  }
  return [
    { key: 'treasury', label: t('treasury.voucher.treasury'), options: treasuryOptions.value },
    { key: 'status', label: t('common.status'), options: listStatusOptions.value },
    ...(tab.value === 'payments'
      ? [
          { key: 'expenseItem', label: t('treasury.voucher.expenseItem'), options: expenseItemOptions.value },
          { key: 'costCenter', label: t('treasury.voucher.costCenter'), options: costCenterOptions.value },
        ]
      : []),
  ]
})
const inListRange = (d) => {
  const [a, b] = listRange.value
  return (!a || d >= a) && (!b || d <= b)
}
const hasText = (q, ...vals) => !q || vals.some((v) => String(v ?? '').toLowerCase().includes(q))
const shownVouchers = computed(() => {
  const q = listQuery.value.trim().toLowerCase()
  const f = listFilters.value
  const rows = tab.value === 'payments' ? payments.value : receipts.value
  return rows.filter((r) =>
    inListRange(r.date) &&
    hasText(q, r.ref, r.party, r.description, r.riderId) &&
    (!f.treasury || r.treasuryId === f.treasury) &&
    (!f.status || r.status === f.status) &&
    (!f.expenseItem || r.expenseItem === f.expenseItem) &&
    (!f.costCenter || r.costCenter === f.costCenter),
  )
})
const shownTransfers = computed(() => {
  const q = listQuery.value.trim().toLowerCase()
  const f = listFilters.value
  return transfers.value.filter((r) =>
    inListRange(r.date) &&
    hasText(q, r.ref, r.description, r.riderName, r.riderId) &&
    (!f.status || r.status === f.status) &&
    (!f.from || r.from === f.from) &&
    (!f.to || r.to === f.to),
  )
})

const voucherColumns = (isPayment) => [
  { key: 'ref', label: t('common.ref'), sortable: true },
  { key: 'date', label: t('common.date'), sortable: true },
  { key: 'treasuryName', label: t('treasury.voucher.treasury'), hideBelow: 'md' },
  { key: 'party', label: isPayment ? t('treasury.voucher.party') : t('treasury.voucher.payer'), sortable: true },
  { key: 'description', label: t('common.description'), hideBelow: 'lg' },
  { key: 'account', label: isPayment ? t('treasury.voucher.expenseItem') : t('treasury.voucher.account'), hideBelow: 'xl' },
  { key: 'amount', label: t('common.amount'), align: 'end', sortable: true },
]
</script>

<template>
  <div>
    <PageHeader :title="t('treasury.title')" :subtitle="t('treasury.subtitle')">
      <template #actions>
        <Button v-if="tab === 'treasuries'" @click="openAddTreasury"><Plus /> {{ t('treasury.add') }}</Button>
        <Button v-else-if="tab === 'payments'" @click="openVoucher('payment')"><Plus /> {{ t('treasury.voucher.newPayment') }}</Button>
        <Button v-else-if="tab === 'receipts'" @click="openVoucher('receipt')"><Plus /> {{ t('treasury.voucher.newReceipt') }}</Button>
        <Button v-else-if="tab === 'transfers'" @click="transferDialog = true"><ArrowLeftRight /> {{ t('treasury.transfer.new') }}</Button>
        <Button v-else-if="tab === 'statement'" variant="outline" :disabled="!statement" @click="exportStatement"><Download /> {{ t('common.export') }}</Button>
      </template>
    </PageHeader>


    <!-- ── Treasuries & balances ───────────────────────────── -->
    <template v-if="tab === 'treasuries'">
      <div class="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricTile :label="t('treasury.kpi.cash')" :value="balances.cash" :format="sar" :icon="MtBanknote" tone="success" />
        <MetricTile :label="t('treasury.kpi.bank')" :value="balances.bank" :format="sar" :icon="MtLandmark" tone="brand" />
        <MetricTile :label="t('treasury.kpi.custody')" :value="balances.custody" :format="sar" :icon="MtWallet" tone="orange" />
        <MetricTile :label="t('treasury.kpi.pending')" :value="balances.pendingIn" :format="sar" :icon="MtHourglass" tone="warning" />
        <MetricTile :label="t('treasury.kpi.total')" :value="balances.total" :format="sar" :icon="MtPiggyBank" tone="primary" />
      </div>

      <FilterBar v-model:search="boxQuery" v-model="boxFilters" :filters="boxFilterDefs" :search-placeholder="t('treasury.searchBoxes')" class="mb-4" />
      <Card class="overflow-hidden">
        <DataTable
          :loading="loading"
          :rows="shownBoxes"
          :empty="t('common.noData')"
          :columns="[
            { key: 'name', label: t('treasury.name'), sortable: true },
            { key: 'kind', label: t('treasury.kind') },
            { key: 'riders', label: t('treasury.riders'), align: 'end', hideBelow: 'md' },
            { key: 'pendingIn', label: t('treasury.pendingIn'), align: 'end', hideBelow: 'lg' },
            { key: 'balance', label: t('treasury.balance'), align: 'end', sortable: true },
            { key: 'active', label: t('common.status'), hideBelow: 'sm' },
            { key: 'actions', label: t('common.actions'), align: 'end' },
          ]"
        >
          <template #cell-name="{ row }">
            <div class="flex items-center gap-3">
              <span class="bg-primary/10 text-primary grid size-9 shrink-0 place-items-center rounded-lg"><component :is="kindIcon(row.kind)" class="size-4" /></span>
              <div class="min-w-0">
                <p class="flex items-center gap-1.5 font-medium">{{ row.name }} <Star v-if="row.isMain" class="text-orange size-3.5" :title="t('treasury.main')" /></p>
                <p v-if="row.iban" class="text-muted-foreground text-xs tabular-nums" dir="ltr">{{ row.iban }}</p>
              </div>
            </div>
          </template>
          <template #cell-kind="{ row }"><Badge variant="secondary">{{ loc(TREASURY_KINDS, row.kind) }}</Badge></template>
          <template #cell-riders="{ row }"><span class="tabular-nums">{{ row.riders ? num(row.riders) : '—' }}</span></template>
          <template #cell-pendingIn="{ row }"><span class="tabular-nums" :class="row.pendingIn ? 'text-warning-foreground' : 'text-muted-foreground'">{{ row.pendingIn ? sar(row.pendingIn) : '—' }}</span></template>
          <template #cell-balance="{ row }"><span class="font-semibold tabular-nums" :class="row.balance < 0 ? 'text-danger' : ''">{{ sar(row.balance) }}</span></template>
          <template #cell-active="{ row }"><Badge :variant="row.active ? 'success' : 'secondary'">{{ row.active ? t('common.active') : t('common.inactive') }}</Badge></template>
          <template #cell-actions="{ row }">
            <ActionMenu :items="[
                      { label: t('common.edit'), icon: Pencil, tone: 'blue', onSelect: () => openEditTreasury(row) },
                    ]" />
          </template>
        </DataTable>
      </Card>
    </template>

    <!-- ── Payment / receipt vouchers ──────────────────────── -->
    <template v-else-if="tab === 'payments' || tab === 'receipts'">
    <FilterBar v-model:search="listQuery" v-model="listFilters" :filters="listFilterDefs" :search-placeholder="t('treasury.searchVouchers')" class="mb-4">
      <template #extra><DateRangePicker v-model="listRange" /></template>
    </FilterBar>
    <Card class="overflow-hidden">
      <DataTable :loading="loading" :rows="shownVouchers" :empty="t('treasury.voucher.empty')" :columns="voucherColumns(tab === 'payments')" :page-size="12">
        <template #cell-ref="{ row }">
          <span dir="ltr" class="font-medium tabular-nums">{{ row.ref }}</span>
          <Badge v-if="row.status !== 'posted'" :variant="statusVariant[row.status]" class="ms-1">{{ t(`treasury.statuses.${row.status}`) }}</Badge>
        </template>
        <template #cell-date="{ row }"><span class="tabular-nums">{{ formatDate(row.date) }}</span></template>
        <template #cell-party="{ row }"><span class="flex items-center gap-2">{{ row.party || '—' }} <RiderCode v-if="row.riderId" :code="row.riderId" /></span></template>
        <template #cell-description="{ row }"><span class="text-muted-foreground">{{ row.description || '—' }}</span></template>
        <template #cell-account="{ row }">
          <template v-if="tab === 'payments'">
            <Badge v-if="row.expenseItem" variant="secondary">{{ expenseItemOptions.find((i) => i.value === row.expenseItem)?.label ?? row.expenseItem }}</Badge>
            <span v-else class="text-muted-foreground text-xs">{{ accName(row.account) }}</span>
            <span v-if="row.costCenter" class="text-muted-foreground ms-1 text-xs">· {{ ccName(row.costCenter) }}</span>
          </template>
          <span v-else class="text-muted-foreground text-xs">{{ accName(row.account) }}</span>
        </template>
        <template #cell-amount="{ row }">
          <span class="inline-flex items-center gap-1 font-semibold tabular-nums" :class="tab === 'payments' ? 'text-danger' : 'text-success'">
            <component :is="tab === 'payments' ? ArrowUpRight : ArrowDownLeft" class="size-3.5" /> {{ sar(row.amount) }}
          </span>
        </template>
      </DataTable>
    </Card>
    </template>

    <!-- ── Transfers ───────────────────────────────────────── -->
    <template v-else-if="tab === 'transfers'">
    <FilterBar v-model:search="listQuery" v-model="listFilters" :filters="listFilterDefs" :search-placeholder="t('treasury.searchTransfers')" class="mb-4">
      <template #extra><DateRangePicker v-model="listRange" /></template>
    </FilterBar>
    <Card class="overflow-hidden">
      <DataTable
        :loading="loading" :rows="shownTransfers" row-key="transferId" :empty="t('treasury.transfer.empty')" :page-size="12"
        :columns="[
          { key: 'ref', label: t('common.ref'), sortable: true },
          { key: 'date', label: t('common.date'), sortable: true },
          { key: 'from', label: t('treasury.transfer.from') },
          { key: 'to', label: t('treasury.transfer.to') },
          { key: 'description', label: t('common.description'), hideBelow: 'lg' },
          { key: 'status', label: t('common.status') },
          { key: 'amount', label: t('common.amount'), align: 'end', sortable: true },
        ]"
      >
        <template #cell-ref="{ row }"><span dir="ltr" class="font-medium tabular-nums">{{ row.ref }}</span></template>
        <template #cell-date="{ row }"><span class="tabular-nums">{{ formatDate(row.date) }}</span></template>
        <template #cell-description="{ row }"><span class="text-muted-foreground flex items-center gap-2">{{ row.description || '—' }} <RiderCode v-if="row.riderId" :code="row.riderId" /></span></template>
        <template #cell-status="{ row }"><Badge :variant="statusVariant[row.status] ?? 'secondary'">{{ t(`treasury.statuses.${row.status}`) }}</Badge></template>
        <template #cell-amount="{ row }"><span class="font-semibold tabular-nums">{{ sar(row.amount) }}</span></template>
      </DataTable>
    </Card>
    </template>

    <!-- ── Statement ───────────────────────────────────────── -->
    <template v-else-if="tab === 'statement'">
      <FilterBar v-model:search="stmtQuery" v-model="stmtFilters" :filters="stmtFilterDefs" :search-placeholder="t('treasury.searchStatement')" class="mb-4">
        <template #extra>
          <Dropdown v-model="statementId" :options="treasuryOptions" :placeholder="t('treasury.statement.pick')" class="h-11 w-auto min-w-[220px] rounded-xl" />
          <DateRangePicker v-model="dateRange" />
        </template>
      </FilterBar>
      <div v-if="statement" class="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricTile :label="t('treasury.statement.opening')" :value="statement.openingBalance" :format="sar" :icon="MtBookOpen" tone="brand" />
        <MetricTile :label="t('treasury.statement.in')" :value="statement.totalIn" :format="sar" :icon="MtArrowDownLeft" tone="success" />
        <MetricTile :label="t('treasury.statement.out')" :value="statement.totalOut" :format="sar" :icon="MtArrowUpRight" tone="danger" />
        <MetricTile :label="t('treasury.statement.closing')" :value="statement.closingBalance" :format="sar" :icon="MtScale" tone="primary" />
      </div>
      <Card class="overflow-hidden">
        <DataTable
          :loading="statementLoading" :rows="shownStatement" :empty="t('treasury.statement.empty')" :page-size="15"
          :columns="[
            { key: 'date', label: t('common.date'), sortable: true },
            { key: 'ref', label: t('common.ref') },
            { key: 'type', label: t('treasury.statement.type') },
            { key: 'description', label: t('common.description'), hideBelow: 'md' },
            { key: 'in', label: t('treasury.statement.in'), align: 'end' },
            { key: 'out', label: t('treasury.statement.out'), align: 'end' },
            { key: 'balance', label: t('treasury.balance'), align: 'end' },
          ]"
        >
          <template #cell-date="{ row }"><span class="tabular-nums">{{ formatDate(row.date) }}</span></template>
          <template #cell-ref="{ row }"><span dir="ltr" class="tabular-nums">{{ row.ref }}</span></template>
          <template #cell-type="{ row }"><Badge :variant="row.in ? 'success' : 'danger'">{{ t(`treasury.types.${row.type}`) }}</Badge></template>
          <template #cell-description="{ row }"><span class="text-muted-foreground">{{ row.description || row.party || '—' }}</span></template>
          <template #cell-in="{ row }"><span class="text-success tabular-nums">{{ row.in ? sar(row.in) : '' }}</span></template>
          <template #cell-out="{ row }"><span class="text-danger tabular-nums">{{ row.out ? sar(row.out) : '' }}</span></template>
          <template #cell-balance="{ row }"><span class="font-semibold tabular-nums">{{ sar(row.balance) }}</span></template>
        </DataTable>
      </Card>
    </template>

    <!-- ── Rider ↔ treasury links ──────────────────────────── -->
    <Card v-else class="overflow-hidden">
      <div class="text-muted-foreground flex items-start gap-2 border-b p-5 text-sm"><Link2 class="mt-0.5 size-4 shrink-0" /> {{ t('treasury.settings.hint') }}</div>
      <DataTable
        :loading="loading" :rows="riderMap" row-key="riderId" :empty="t('common.noData')"
        :columns="[
          { key: 'name', label: t('treasury.settings.rider'), sortable: true },
          { key: 'cityName', label: t('treasury.settings.city'), hideBelow: 'sm' },
          { key: 'treasuryId', label: t('treasury.settings.treasury') },
        ]"
      >
        <template #cell-name="{ row }"><span class="flex items-center gap-2 font-medium">{{ row.name }} <RiderCode :code="row.riderId" /><Badge v-if="!row.active" variant="secondary">{{ t('common.inactive') }}</Badge></span></template>
        <template #cell-treasuryId="{ row }">
          <div class="flex items-center gap-2">
            <Dropdown :model-value="row.treasuryId" :options="treasuryOptions" class="w-auto min-w-[240px]" @update:model-value="linkRider(row, $event)" />
            <span v-if="!row.linked" class="text-muted-foreground text-xs">{{ t('treasury.settings.unlinked') }}</span>
          </div>
        </template>
      </DataTable>
    </Card>

    <TreasuryDialog v-model:open="treasuryDialog" :treasury="editingTreasury" @saved="load" />
    <VoucherDialog v-model:open="voucherDialog" :mode="voucherMode" :treasury-options="nonRiderTreasuryOptions" :account-options="accountOptions" :expense-item-options="expenseItemOptions" :cost-center-options="costCenterOptions" :default-treasury="mainId" @saved="load" />
    <TransferDialog v-model:open="transferDialog" :treasury-options="treasuryOptions" @saved="load" />
  </div>
</template>
