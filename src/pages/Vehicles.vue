<script setup>
import { ref, computed, onMounted } from 'vue'
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
import { useCurrency } from '@/composables/useCurrency'
import { useDate } from '@/lib/format'
import { exportCsv, todayStamp } from '@/lib/export'
import { VEHICLE_TYPES, EXPENSE_TYPES, RIDERS } from '@/api/fixtures'
import { fetchVehicles, fetchExpenses, profitability } from '@/api/vehicles'

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
const vehicleOptions = computed(() => vehicles.value.map((v) => ({ value: v.id, label: `${v.plate} — ${v.riderName}` })))

const tabs = computed(() => [
  { value: 'vehicles', label: t('vehicles.tabs.vehicles') },
  { value: 'expenses', label: t('vehicles.tabs.expenses') },
  { value: 'profitability', label: t('vehicles.tabs.profitability') },
])

async function load() {
  loading.value = true
  ;[vehicles.value, expenses.value, prof.value] = await Promise.all([fetchVehicles(), fetchExpenses(), profitability()])
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
          { key: 'riderName', label: t('vehicles.rider'), sortable: true },
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
        <template #cell-actions="{ row }">
          <button type="button" class="hover:bg-accent text-muted-foreground hover:text-foreground inline-flex size-8 items-center justify-center rounded-lg" @click="openEditVehicle(row)">
            <Pencil class="size-4" />
          </button>
        </template>
      </DataTable>
    </Card>

    <!-- Expenses -->
    <Card v-else-if="tab === 'expenses'" class="overflow-hidden">
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
