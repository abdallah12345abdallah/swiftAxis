<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Plus, Pencil, Bike, Car, Download } from 'lucide-vue-next'
import PageHeader from '@/components/common/PageHeader.vue'
import { Tabs } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { DataTable } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import VehicleDialog from '@/components/vehicles/VehicleDialog.vue'
import ExpenseDialog from '@/components/vehicles/ExpenseDialog.vue'
import ExpenseBreakdownChart from '@/components/vehicles/ExpenseBreakdownChart.vue'
import { Select } from '@/components/ui/select'
import { useCurrency } from '@/composables/useCurrency'
import { useDate } from '@/lib/format'
import { exportCsv, todayStamp } from '@/lib/export'
import { VEHICLE_TYPES, EXPENSE_TYPES, RIDERS, SHIFTS, VEHICLE_STATUS } from '@/api/fixtures'
import { fetchVehicles, fetchExpenses, profitability, expenseBreakdown } from '@/api/vehicles'

const { t, locale } = useI18n()
const { sar, num } = useCurrency()
const { formatDate } = useDate()

const tab = ref('vehicles')
const loading = ref(true)
const vehicles = ref([])
const expenses = ref([])
const prof = ref([])

const vehicleDialog = ref(false)
const expenseDialog = ref(false)
const editingVehicle = ref(null)

const loc = (map, k) => map[k]?.[locale.value] ?? map[k]?.ar ?? k
const typeOptions = computed(() => Object.keys(VEHICLE_TYPES).map((k) => ({ value: k, label: loc(VEHICLE_TYPES, k) })))
const expenseTypeOptions = computed(() => Object.keys(EXPENSE_TYPES).map((k) => ({ value: k, label: loc(EXPENSE_TYPES, k) })))
const riderOptions = computed(() => RIDERS.map((r) => ({ value: r.id, label: r.name })))
const vehicleOptions = computed(() => vehicles.value.map((v) => ({ value: v.id, label: `${v.plate} — ${v.ridersLabel}` })))

const statusVariant = (s) => (s === 'active' ? 'success' : s === 'maintenance' ? 'warning' : 'danger')

const tabs = computed(() => [
  { value: 'vehicles', label: t('vehicles.tabs.vehicles') },
  { value: 'expenses', label: t('vehicles.tabs.expenses') },
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

async function loadBreakdown() {
  breakdown.value = await expenseBreakdown({ granularity: granularity.value, vehicleId: chartVehicle.value || undefined })
}
watch([granularity, chartVehicle], loadBreakdown)

async function load() {
  loading.value = true
  ;[vehicles.value, expenses.value, prof.value] = await Promise.all([fetchVehicles(), fetchExpenses(), profitability()])
  await loadBreakdown()
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
function exportProf() {
  exportCsv(
    `vehicle-profitability-${todayStamp()}`,
    [t('vehicles.prof.vehicle'), t('vehicles.prof.revenue'), t('vehicles.prof.expenses'), t('vehicles.prof.net'), t('vehicles.prof.margin')],
    prof.value.map((r) => [r.plate, r.revenue, r.expenses, r.net, `${r.margin}%`]),
  )
}
</script>

<template>
  <div>
    <PageHeader :title="t('vehicles.title')" :subtitle="t('vehicles.subtitle')">
      <template #actions>
        <Button v-if="tab === 'vehicles'" @click="openAddVehicle"><Plus /> {{ t('vehicles.addVehicle') }}</Button>
        <Button v-else-if="tab === 'expenses'" @click="expenseDialog = true"><Plus /> {{ t('vehicles.addExpense') }}</Button>
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
          { key: 'riders', label: t('vehicles.rider') },
          { key: 'value', label: t('vehicles.fields.value'), align: 'end', sortable: true, hideBelow: 'md' },
          { key: 'status', label: t('vehicles.statusLabel') },
          { key: 'actions', label: t('common.actions'), align: 'end' },
        ]"
      >
        <template #cell-plate="{ row }"><span dir="ltr" class="font-medium">{{ row.plate }}</span></template>
        <template #cell-type="{ row }">
          <span class="inline-flex items-center gap-1.5">
            <component :is="row.type === 'car' ? Car : Bike" class="text-muted-foreground size-4" />
            {{ loc(VEHICLE_TYPES, row.type) }}
          </span>
        </template>
        <template #cell-riders="{ row }">
          <div class="flex flex-wrap gap-1">
            <Badge v-if="row.morningRiderName" variant="secondary">{{ loc(SHIFTS, 'morning') }} · {{ row.morningRiderName }}</Badge>
            <Badge v-if="row.eveningRiderName" variant="secondary">{{ loc(SHIFTS, 'evening') }} · {{ row.eveningRiderName }}</Badge>
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

    <!-- Expenses -->
    <div v-else-if="tab === 'expenses'" class="space-y-6">
      <!-- breakdown chart (#9) -->
      <Card>
        <div class="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
          <div>
            <h3 class="font-semibold">{{ t('vehicles.charts.title') }}</h3>
            <p class="text-muted-foreground text-xs">{{ t('vehicles.charts.subtitle') }}</p>
          </div>
          <div class="flex flex-wrap gap-2">
            <Select v-model="chartVehicle" :options="chartVehicleOptions" class="w-auto min-w-[150px]" />
            <Select v-model="granularity" :options="granularityOptions" class="w-auto min-w-[120px]" />
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
  </div>
</template>
