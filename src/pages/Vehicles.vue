<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouteTab } from '@/composables/useRouteTab'
import { Plus, Pencil, Bike, Car, Download, ArrowLeftRight, Building2, Fuel, Clock, Tags, Camera } from 'lucide-vue-next'
import PageHeader from '@/components/common/PageHeader.vue'
import RiderCode from '@/components/common/RiderCode.vue'
import { Tabs } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { DataTable } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import VehicleDialog from '@/components/vehicles/VehicleDialog.vue'
import ExpenseDialog from '@/components/vehicles/ExpenseDialog.vue'
import ExpenseBreakdownChart from '@/components/vehicles/ExpenseBreakdownChart.vue'
import VehicleHandoverDialog from '@/components/vehicles/VehicleHandoverDialog.vue'
import ShiftDialog from '@/components/vehicles/ShiftDialog.vue'
import FuelLogDialog from '@/components/vehicles/FuelLogDialog.vue'
import ExpenseItemDialog from '@/components/vehicles/ExpenseItemDialog.vue'
import { Dropdown } from '@/components/ui/dropdown'
import { useCurrency } from '@/composables/useCurrency'
import { useDate } from '@/lib/format'
import { exportCsv, todayStamp } from '@/lib/export'
import { VEHICLE_TYPES, EXPENSE_TYPES, RIDERS, VEHICLE_STATUS } from '@/api/fixtures'
import {
  fetchVehicles, fetchExpenses, profitability, expenseBreakdown,
  fetchShifts, fetchHandovers, fetchFuelSheet,
} from '@/api/vehicles'
import { fetchExpenseItems } from '@/api/catalogs'
import { fetchAccounts } from '@/api/ledger'

const { t, locale } = useI18n()
const { sar, num } = useCurrency()
const { formatDate } = useDate()

const tab = useRouteTab('vehicles')
const loading = ref(true)
const vehicles = ref([])
const expenses = ref([])
const prof = ref([])
const shifts = ref([])
const handovers = ref([])
const fuel = ref({ rows: [], byVehicle: [], totals: { liters: 0, amount: 0, fills: 0 } })
const expenseItems = ref([])
const accounts = ref([])

const vehicleDialog = ref(false)
const expenseDialog = ref(false)
const handoverDialog = ref(false)
const shiftDialog = ref(false)
const fuelDialog = ref(false)
const itemDialog = ref(false)
const editingVehicle = ref(null)
const editingShift = ref(null)
const editingItem = ref(null)

const loc = (map, k) => map[k]?.[locale.value] ?? map[k]?.ar ?? k
const typeOptions = computed(() => Object.keys(VEHICLE_TYPES).map((k) => ({ value: k, label: loc(VEHICLE_TYPES, k) })))
const expenseTypeOptions = computed(() => expenseItems.value.filter((i) => i.active).map((i) => ({ value: i.id, label: locale.value === 'ar' ? i.name : i.en })))
const riderOptions = computed(() => RIDERS.map((r) => ({ value: r.id, label: r.name, hint: r.id })))
const vehicleOptions = computed(() => vehicles.value.map((v) => ({ value: v.id, label: `${v.plate} — ${v.ridersLabel}` })))
const shiftOptions = computed(() => shifts.value.filter((s) => s.active).map((s) => ({ value: s.id, label: locale.value === 'ar' ? s.name : s.en, hint: `${s.from}–${s.to}` })))
const expenseAccountOptions = computed(() => accounts.value.filter((a) => a.type === 'expense' && !a.isGroup && a.active !== false).map((a) => ({ value: a.id, label: locale.value === 'ar' ? a.name : a.en, hint: a.code })))
const accName = (id) => {
  const a = accounts.value.find((x) => x.id === id)
  return a ? (locale.value === 'ar' ? a.name : a.en) : id
}
const shiftName = (id) => {
  const s = shifts.value.find((x) => x.id === id)
  return s ? (locale.value === 'ar' ? s.name : s.en) : id
}

const statusVariant = (s) => (s === 'active' ? 'success' : s === 'maintenance' ? 'warning' : 'danger')

const tabs = computed(() => [
  { value: 'vehicles', label: t('vehicles.tabs.vehicles') },
  { value: 'handover', label: t('vehicles.tabs.handover') },
  { value: 'shifts', label: t('vehicles.tabs.shifts') },
  { value: 'expenses', label: t('vehicles.tabs.expenses') },
  { value: 'fuel', label: t('vehicles.tabs.fuel') },
  { value: 'expenseItems', label: t('vehicles.tabs.expenseItems') },
  { value: 'profitability', label: t('vehicles.tabs.profitability') },
])

/* expense chart (#9) */
const granularity = ref('month')
const chartVehicle = ref('')
const breakdown = ref(null)
const granularityOptions = computed(() => [
  { value: 'day', label: t('vehicles.charts.granularity.day') },
  { value: 'month', label: t('vehicles.charts.granularity.month') },
  { value: 'year', label: t('vehicles.charts.granularity.year') },
])
const chartVehicleOptions = computed(() => [
  { value: '', label: t('vehicles.charts.allVehicles') },
  ...vehicles.value.map((v) => ({ value: v.id, label: v.plate })),
])

/* fuel filters */
const fuelVehicle = ref('')
const fuelRider = ref('')
const fuelRiderOptions = computed(() => [{ value: '', label: t('vehicles.fuel.allRiders') }, ...riderOptions.value])

async function loadBreakdown() {
  breakdown.value = await expenseBreakdown({ granularity: granularity.value, vehicleId: chartVehicle.value || undefined })
}
watch([granularity, chartVehicle], loadBreakdown)

async function loadFuel() {
  fuel.value = await fetchFuelSheet({ vehicleId: fuelVehicle.value || undefined, riderId: fuelRider.value || undefined })
}
watch([fuelVehicle, fuelRider], loadFuel)

async function load() {
  loading.value = true
  ;[vehicles.value, expenses.value, prof.value, shifts.value, handovers.value, expenseItems.value, accounts.value] = await Promise.all([
    fetchVehicles(), fetchExpenses(), profitability(), fetchShifts(), fetchHandovers(), fetchExpenseItems(), fetchAccounts(),
  ])
  await Promise.all([loadBreakdown(), loadFuel()])
  loading.value = false
}
onMounted(load)

function openAddVehicle() {
  editingVehicle.value = null
  vehicleDialog.value = true
}
function openEditVehicle(v) {
  editingVehicle.value = v
  vehicleDialog.value = true
}
function openAddShift() {
  editingShift.value = null
  shiftDialog.value = true
}
function openEditShift(s) {
  editingShift.value = s
  shiftDialog.value = true
}
function openAddItem() {
  editingItem.value = null
  itemDialog.value = true
}
function openEditItem(i) {
  editingItem.value = i
  itemDialog.value = true
}
function exportProf() {
  exportCsv(
    `vehicle-profitability-${todayStamp()}`,
    [t('vehicles.prof.vehicle'), t('vehicles.prof.revenue'), t('vehicles.prof.expenses'), t('vehicles.prof.net'), t('vehicles.prof.margin')],
    prof.value.map((r) => [r.plate, r.revenue, r.expenses, r.net, `${r.margin}%`]),
  )
}
function exportFuel() {
  exportCsv(
    `fuel-sheet-${todayStamp()}`,
    [t('common.date'), t('vehicles.fields.vehicle'), t('common.riderCode'), t('vehicles.fuel.rider'), t('vehicles.fuel.liters'), t('vehicles.fuel.amount'), t('vehicles.fuel.pricePerLiter'), t('vehicles.fuel.odometer'), t('vehicles.fuel.station')],
    fuel.value.rows.map((r) => [r.date, r.plate, r.riderId ?? '', r.riderName, r.liters, r.amount, r.pricePerLiter, r.odometer, r.station]),
  )
}
</script>

<template>
  <div>
    <PageHeader :title="t('vehicles.title')" :subtitle="t('vehicles.subtitle')">
      <template #actions>
        <Button v-if="tab === 'vehicles'" @click="openAddVehicle"><Plus /> {{ t('vehicles.addVehicle') }}</Button>
        <Button v-else-if="tab === 'handover'" @click="handoverDialog = true"><ArrowLeftRight /> {{ t('vehicles.handover.add') }}</Button>
        <Button v-else-if="tab === 'shifts'" @click="openAddShift"><Plus /> {{ t('vehicles.shifts.add') }}</Button>
        <Button v-else-if="tab === 'expenses'" @click="expenseDialog = true"><Plus /> {{ t('vehicles.addExpense') }}</Button>
        <template v-else-if="tab === 'fuel'">
          <Button variant="outline" @click="exportFuel"><Download /> {{ t('common.export') }}</Button>
          <Button @click="fuelDialog = true"><Fuel /> {{ t('vehicles.fuel.add') }}</Button>
        </template>
        <Button v-else-if="tab === 'expenseItems'" @click="openAddItem"><Plus /> {{ t('vehicles.expenseItems.add') }}</Button>
        <Button v-else variant="outline" @click="exportProf"><Download /> {{ t('common.export') }}</Button>
      </template>
    </PageHeader>

    <div class="mb-6"><Tabs v-model="tab" :tabs="tabs" /></div>

    <!-- Vehicles -->
    <Card v-if="tab === 'vehicles'" class="overflow-hidden">
      <DataTable
        :loading="loading"
        :rows="vehicles"
        :empty="t('vehicles.empty')"
        :columns="[
          { key: 'plate', label: t('vehicles.plate'), sortable: true },
          { key: 'type', label: t('vehicles.type') },
          { key: 'identity', label: t('vehicles.identity'), hideBelow: 'lg' },
          { key: 'riders', label: t('vehicles.rider') },
          { key: 'value', label: t('vehicles.fields.value'), align: 'end', sortable: true, hideBelow: 'xl' },
          { key: 'status', label: t('vehicles.statusLabel') },
          { key: 'actions', label: t('common.actions'), align: 'end' },
        ]"
      >
        <template #cell-plate="{ row }">
          <span dir="ltr" class="font-medium">{{ row.plate }}</span>
          <p v-if="row.model" class="text-muted-foreground text-xs">{{ row.model }}</p>
        </template>
        <template #cell-type="{ row }">
          <span class="inline-flex items-center gap-1.5">
            <component :is="row.type === 'car' ? Car : Bike" class="text-muted-foreground size-4" />
            {{ loc(VEHICLE_TYPES, row.type) }}
          </span>
        </template>
        <template #cell-identity="{ row }">
          <div class="text-muted-foreground flex flex-wrap gap-x-3 gap-y-0.5 text-xs">
            <span v-if="row.color">{{ row.color }}</span>
            <span v-if="row.year" class="tabular-nums">{{ row.year }}</span>
            <span v-if="row.tankCapacity" class="tabular-nums">{{ row.tankCapacity }} L</span>
            <span v-if="row.chassis" dir="ltr" class="font-mono">{{ row.chassis }}</span>
          </div>
        </template>
        <template #cell-riders="{ row }">
          <div class="flex flex-wrap gap-1">
            <Badge v-if="row.morningRiderName" variant="secondary">{{ shiftName('morning') }} · {{ row.morningRiderName }} <RiderCode :code="row.morningRiderId" /></Badge>
            <Badge v-if="row.eveningRiderName" variant="secondary">{{ shiftName('evening') }} · {{ row.eveningRiderName }} <RiderCode :code="row.eveningRiderId" /></Badge>
            <span v-if="!row.morningRiderName && !row.eveningRiderName" class="text-muted-foreground">{{ t('vehicles.unassigned') }}</span>
          </div>
        </template>
        <template #cell-value="{ row }"><span class="tabular-nums">{{ sar(row.value) }}</span></template>
        <template #cell-status="{ row }">
          <Badge :variant="statusVariant(row.status)">{{ loc(VEHICLE_STATUS, row.status) }}</Badge>
        </template>
        <template #cell-actions="{ row }">
          <button type="button" class="hover:bg-accent text-muted-foreground hover:text-foreground inline-flex size-8 items-center justify-center rounded-lg" @click="openEditVehicle(row)">
            <Pencil class="size-4" />
          </button>
        </template>
      </DataTable>
    </Card>

    <!-- Handover (#5) -->
    <Card v-else-if="tab === 'handover'" class="overflow-hidden">
      <DataTable
        :loading="loading" :rows="handovers" :empty="t('vehicles.handover.empty')" :page-size="12"
        :columns="[
          { key: 'date', label: t('common.date'), sortable: true },
          { key: 'plate', label: t('vehicles.handover.vehicle'), sortable: true },
          { key: 'shiftName', label: t('vehicles.handover.shift') },
          { key: 'fromName', label: t('vehicles.handover.from') },
          { key: 'toName', label: t('vehicles.handover.to') },
          { key: 'odometer', label: t('vehicles.handover.odometer'), align: 'end', hideBelow: 'lg' },
          { key: 'fuel', label: t('vehicles.handover.fuel'), hideBelow: 'md' },
          { key: 'condition', label: t('vehicles.handover.condition'), hideBelow: 'sm' },
          { key: 'by', label: t('vehicles.handover.by'), hideBelow: 'xl' },
        ]"
      >
        <template #cell-date="{ row }"><span class="tabular-nums">{{ formatDate(row.date) }}</span> <span class="text-muted-foreground text-xs tabular-nums" dir="ltr">{{ row.time }}</span></template>
        <template #cell-plate="{ row }"><span dir="ltr" class="font-medium">{{ row.plate }}</span><p v-if="row.model" class="text-muted-foreground text-xs">{{ row.model }}</p></template>
        <template #cell-shiftName="{ row }"><Badge variant="secondary">{{ shiftName(row.shiftId) }}</Badge></template>
        <template #cell-fromName="{ row }">
          <span v-if="row.fromType === 'company'" class="text-muted-foreground inline-flex items-center gap-1"><Building2 class="size-3.5" /> {{ t('vehicles.handover.company') }}</span>
          <span v-else class="flex items-center gap-1.5">{{ row.fromName }} <RiderCode :code="row.fromRiderId" /></span>
        </template>
        <template #cell-toName="{ row }">
          <span v-if="row.toType === 'company'" class="text-muted-foreground inline-flex items-center gap-1"><Building2 class="size-3.5" /> {{ t('vehicles.handover.company') }}</span>
          <span v-else class="flex items-center gap-1.5 font-medium">{{ row.toName }} <RiderCode :code="row.toRiderId" /></span>
        </template>
        <template #cell-odometer="{ row }"><span class="tabular-nums">{{ num(row.odometer) }}</span></template>
        <template #cell-fuel="{ row }">
          <div class="flex items-center gap-2"><Progress :value="row.fuel" class="w-16" :indicator-class="row.fuel < 25 ? 'bg-danger' : 'bg-primary'" /><span class="text-xs tabular-nums">{{ row.fuel }}%</span></div>
        </template>
        <template #cell-condition="{ row }">
          <Badge :variant="row.condition === 'good' ? 'success' : 'danger'">{{ t(`vehicles.handover.conditions.${row.condition}`) }}</Badge>
          <p v-if="row.notes" class="text-muted-foreground mt-0.5 max-w-[16rem] truncate text-xs" :title="row.notes">{{ row.notes }}</p>
        </template>
        <template #cell-by="{ row }"><span class="text-muted-foreground inline-flex items-center gap-1 text-xs">{{ row.by || '—' }} <Camera v-if="row.photo" class="size-3.5" /></span></template>
      </DataTable>
    </Card>

    <!-- Shifts (#5) -->
    <Card v-else-if="tab === 'shifts'" class="overflow-hidden">
      <div class="text-muted-foreground flex items-start gap-2 border-b p-5 text-sm"><Clock class="mt-0.5 size-4 shrink-0" /> {{ t('vehicles.shifts.hint') }}</div>
      <DataTable
        :loading="loading" :rows="shifts" :empty="t('common.noData')"
        :columns="[
          { key: 'name', label: t('vehicles.shifts.name'), sortable: true },
          { key: 'hours', label: t('common.time') },
          { key: 'vehicles', label: t('vehicles.shifts.vehicles'), align: 'end', hideBelow: 'sm' },
          { key: 'handovers', label: t('vehicles.shifts.handovers'), align: 'end', hideBelow: 'md' },
          { key: 'active', label: t('common.status') },
          { key: 'actions', label: t('common.actions'), align: 'end' },
        ]"
      >
        <template #cell-name="{ row }"><span class="font-medium">{{ locale === 'ar' ? row.name : row.en }}</span> <span class="text-muted-foreground text-xs">{{ locale === 'ar' ? row.en : row.name }}</span></template>
        <template #cell-hours="{ row }"><span dir="ltr" class="tabular-nums">{{ row.from }} – {{ row.to }}</span></template>
        <template #cell-vehicles="{ row }"><span class="tabular-nums">{{ num(row.vehicles) }}</span></template>
        <template #cell-handovers="{ row }"><span class="tabular-nums">{{ num(row.handovers) }}</span></template>
        <template #cell-active="{ row }"><Badge :variant="row.active ? 'success' : 'secondary'">{{ row.active ? t('common.active') : t('common.inactive') }}</Badge></template>
        <template #cell-actions="{ row }">
          <button type="button" class="hover:bg-accent text-muted-foreground hover:text-foreground inline-flex size-8 items-center justify-center rounded-lg" @click="openEditShift(row)"><Pencil class="size-4" /></button>
        </template>
      </DataTable>
    </Card>

    <!-- Expenses -->
    <div v-else-if="tab === 'expenses'" class="space-y-6">
      <Card>
        <div class="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
          <div>
            <h3 class="font-semibold">{{ t('vehicles.charts.title') }}</h3>
            <p class="text-muted-foreground text-xs">{{ t('vehicles.charts.subtitle') }}</p>
          </div>
          <div class="flex flex-wrap gap-2">
            <Dropdown v-model="chartVehicle" :options="chartVehicleOptions" class="w-auto min-w-[150px]" />
            <Dropdown v-model="granularity" :options="granularityOptions" class="w-auto min-w-[120px]" />
          </div>
        </div>
        <div class="p-4">
          <ExpenseBreakdownChart v-if="breakdown?.categories?.length" :breakdown="breakdown" />
          <p v-else class="text-muted-foreground py-12 text-center text-sm">{{ t('common.noData') }}</p>
        </div>
        <div v-if="breakdown?.totalsByType?.length" class="flex flex-wrap gap-4 border-t px-5 py-3 text-sm">
          <span class="text-muted-foreground">{{ t('vehicles.charts.byType') }}:</span>
          <span v-for="tt in breakdown.totalsByType" :key="tt.type" class="tabular-nums">
            {{ loc(EXPENSE_TYPES, tt.type) }} <b>{{ sar(tt.total) }}</b>
          </span>
        </div>
      </Card>

      <Card class="overflow-hidden">
        <DataTable
          :loading="loading"
          :rows="expenses"
          :empty="t('vehicles.empty')"
          :columns="[
            { key: 'date', label: t('vehicles.fields.date'), sortable: true },
            { key: 'plate', label: t('vehicles.fields.vehicle'), sortable: true },
            { key: 'type', label: t('vehicles.fields.type') },
            { key: 'invoiceNo', label: t('vehicles.fields.invoiceNo'), hideBelow: 'md' },
            { key: 'amount', label: t('vehicles.fields.amount'), align: 'end', sortable: true },
          ]"
        >
          <template #cell-date="{ row }">{{ formatDate(row.date) }}</template>
          <template #cell-plate="{ row }"><span dir="ltr">{{ row.plate }}</span></template>
          <template #cell-type="{ row }"><Badge variant="secondary">{{ loc(EXPENSE_TYPES, row.type) }}</Badge></template>
          <template #cell-invoiceNo="{ row }"><span dir="ltr" class="text-muted-foreground">{{ row.invoiceNo }}</span></template>
          <template #cell-amount="{ row }"><span class="font-semibold tabular-nums">{{ sar(row.amount) }}</span></template>
        </DataTable>
      </Card>
    </div>

    <!-- Fuel sheet (#5/#6) -->
    <div v-else-if="tab === 'fuel'" class="space-y-6">
      <div class="flex flex-wrap items-center gap-3">
        <Dropdown v-model="fuelVehicle" :options="chartVehicleOptions" class="w-auto min-w-[160px]" />
        <Dropdown v-model="fuelRider" :options="fuelRiderOptions" class="w-auto min-w-[180px]" />
        <p class="text-muted-foreground ms-auto text-xs">{{ t('vehicles.fuel.hint') }}</p>
      </div>
      <div class="grid gap-4 sm:grid-cols-3">
        <Card class="p-5"><p class="text-muted-foreground text-sm">{{ t('vehicles.fuel.fills') }}</p><p class="mt-1 text-2xl font-bold tabular-nums">{{ num(fuel.totals.fills) }}</p></Card>
        <Card class="p-5"><p class="text-muted-foreground text-sm">{{ t('vehicles.fuel.liters') }}</p><p class="mt-1 text-2xl font-bold tabular-nums">{{ num(fuel.totals.liters, { decimals: 1 }) }}</p></Card>
        <Card class="p-5"><p class="text-muted-foreground text-sm">{{ t('vehicles.fuel.amount') }}</p><p class="text-orange mt-1 text-2xl font-bold tabular-nums">{{ sar(fuel.totals.amount) }}</p></Card>
      </div>
      <div class="grid gap-6 xl:grid-cols-3">
        <Card class="overflow-hidden xl:col-span-2">
          <DataTable
            :loading="loading" :rows="fuel.rows" :empty="t('vehicles.fuel.empty')" :page-size="10"
            :columns="[
              { key: 'date', label: t('common.date'), sortable: true },
              { key: 'plate', label: t('vehicles.fields.vehicle'), sortable: true },
              { key: 'riderName', label: t('vehicles.fuel.rider'), hideBelow: 'md' },
              { key: 'liters', label: t('vehicles.fuel.liters'), align: 'end' },
              { key: 'amount', label: t('vehicles.fuel.amount'), align: 'end', sortable: true },
              { key: 'pricePerLiter', label: t('vehicles.fuel.pricePerLiter'), align: 'end', hideBelow: 'lg' },
              { key: 'odometer', label: t('vehicles.fuel.odometer'), align: 'end', hideBelow: 'xl' },
            ]"
          >
            <template #cell-date="{ row }"><span class="tabular-nums">{{ formatDate(row.date) }}</span><p v-if="row.station" class="text-muted-foreground text-xs">{{ row.station }}</p></template>
            <template #cell-plate="{ row }"><span dir="ltr" class="font-medium">{{ row.plate }}</span></template>
            <template #cell-riderName="{ row }"><span class="flex items-center gap-1.5">{{ row.riderName }} <RiderCode :code="row.riderId" /></span></template>
            <template #cell-liters="{ row }"><span class="tabular-nums">{{ num(row.liters, { decimals: 1 }) }}</span></template>
            <template #cell-amount="{ row }"><span class="font-semibold tabular-nums">{{ sar(row.amount) }}</span></template>
            <template #cell-pricePerLiter="{ row }"><span class="text-muted-foreground tabular-nums">{{ sar(row.pricePerLiter, { decimals: 2 }) }}</span></template>
            <template #cell-odometer="{ row }"><span class="tabular-nums">{{ num(row.odometer) }}</span></template>
          </DataTable>
        </Card>
        <Card class="overflow-hidden">
          <div class="border-b px-5 py-4 font-semibold">{{ t('vehicles.fuel.byVehicle') }}</div>
          <DataTable
            :loading="loading" :rows="fuel.byVehicle" :empty="t('common.noData')"
            :columns="[
              { key: 'plate', label: t('vehicles.fields.vehicle') },
              { key: 'liters', label: t('vehicles.fuel.liters'), align: 'end' },
              { key: 'amount', label: t('vehicles.fuel.amount'), align: 'end' },
            ]"
          >
            <template #cell-plate="{ row }"><span dir="ltr" class="font-medium">{{ row.plate }}</span><p class="text-muted-foreground text-xs">{{ num(row.fills) }} × · {{ row.tankCapacity ? `${row.tankCapacity} L` : '' }}</p></template>
            <template #cell-liters="{ row }"><span class="tabular-nums">{{ num(row.liters, { decimals: 1 }) }}</span></template>
            <template #cell-amount="{ row }"><span class="font-semibold tabular-nums">{{ sar(row.amount) }}</span></template>
          </DataTable>
        </Card>
      </div>
    </div>

    <!-- Expense items (#6) -->
    <Card v-else-if="tab === 'expenseItems'" class="overflow-hidden">
      <div class="text-muted-foreground flex items-start gap-2 border-b p-5 text-sm"><Tags class="mt-0.5 size-4 shrink-0" /> {{ t('vehicles.expenseItems.hint') }}</div>
      <DataTable
        :loading="loading" :rows="expenseItems" :empty="t('common.noData')"
        :columns="[
          { key: 'name', label: t('vehicles.expenseItems.name'), sortable: true },
          { key: 'account', label: t('vehicles.expenseItems.account'), hideBelow: 'md' },
          { key: 'usage', label: t('vehicles.expenseItems.usage'), align: 'end', hideBelow: 'sm' },
          { key: 'active', label: t('common.status') },
          { key: 'actions', label: t('common.actions'), align: 'end' },
        ]"
      >
        <template #cell-name="{ row }"><span class="font-medium">{{ locale === 'ar' ? row.name : row.en }}</span> <span class="text-muted-foreground text-xs">{{ locale === 'ar' ? row.en : row.name }}</span></template>
        <template #cell-account="{ row }"><Badge variant="secondary">{{ accName(row.account) }}</Badge></template>
        <template #cell-usage="{ row }"><span class="tabular-nums">{{ num(row.usage) }}</span></template>
        <template #cell-active="{ row }"><Badge :variant="row.active ? 'success' : 'secondary'">{{ row.active ? t('common.active') : t('common.inactive') }}</Badge></template>
        <template #cell-actions="{ row }">
          <button type="button" class="hover:bg-accent text-muted-foreground hover:text-foreground inline-flex size-8 items-center justify-center rounded-lg" @click="openEditItem(row)"><Pencil class="size-4" /></button>
        </template>
      </DataTable>
    </Card>

    <!-- Profitability -->
    <Card v-else class="overflow-hidden">
      <DataTable
        :loading="loading"
        :rows="prof"
        :empty="t('vehicles.empty')"
        :columns="[
          { key: 'plate', label: t('vehicles.prof.vehicle'), sortable: true },
          { key: 'revenue', label: t('vehicles.prof.revenue'), align: 'end', sortable: true },
          { key: 'expenses', label: t('vehicles.prof.expenses'), align: 'end', sortable: true },
          { key: 'net', label: t('vehicles.prof.net'), align: 'end', sortable: true },
          { key: 'margin', label: t('vehicles.prof.margin'), align: 'end', sortable: true },
        ]"
      >
        <template #cell-plate="{ row }"><span dir="ltr" class="font-medium">{{ row.plate }}</span></template>
        <template #cell-revenue="{ row }"><span class="tabular-nums">{{ sar(row.revenue) }}</span></template>
        <template #cell-expenses="{ row }"><span class="tabular-nums">{{ sar(row.expenses) }}</span></template>
        <template #cell-net="{ row }"><span class="font-semibold tabular-nums" :class="row.net >= 0 ? 'text-success' : 'text-danger'">{{ sar(row.net) }}</span></template>
        <template #cell-margin="{ row }"><Badge :variant="row.margin >= 0 ? 'success' : 'danger'">{{ row.margin }}%</Badge></template>
      </DataTable>
    </Card>

    <VehicleDialog v-model:open="vehicleDialog" :vehicle="editingVehicle" :type-options="typeOptions" :rider-options="riderOptions" @saved="load" />
    <ExpenseDialog v-model:open="expenseDialog" :vehicle-options="vehicleOptions" :type-options="expenseTypeOptions" @saved="load" />
    <VehicleHandoverDialog v-model:open="handoverDialog" :vehicles="vehicles" :rider-options="riderOptions" :shift-options="shiftOptions" @saved="load" />
    <ShiftDialog v-model:open="shiftDialog" :shift="editingShift" @saved="load" />
    <FuelLogDialog v-model:open="fuelDialog" :vehicles="vehicles" :rider-options="riderOptions" @saved="load" />
    <ExpenseItemDialog v-model:open="itemDialog" :item="editingItem" :account-options="expenseAccountOptions" @saved="load" />
  </div>
</template>
