<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import ActionMenu from '@/components/common/ActionMenu.vue'
import { useRouteTab } from '@/composables/useRouteTab'
import { Plus, Pencil, Download } from 'lucide-vue-next'
import PageHeader from '@/components/common/PageHeader.vue'
import FilterBar from '@/components/common/FilterBar.vue'
import { DateRangePicker } from '@/components/ui/datepicker'
import { Card } from '@/components/ui/card'
import { DataTable } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import PurchaseDialog from '@/components/purchases/PurchaseDialog.vue'
import SupplierDialog from '@/components/purchases/SupplierDialog.vue'
import PurchaseItemDialog from '@/components/purchases/PurchaseItemDialog.vue'
import { useCurrency } from '@/composables/useCurrency'
import { useDate } from '@/lib/format'
import { exportCsv, todayStamp } from '@/lib/export'
import { SUPPLIER_CATEGORIES } from '@/api/fixtures'
import {
  fetchSuppliers, fetchPurchases, vatReport, purchasesByCostCenter,
} from '@/api/purchases'
import { fetchCostCenters } from '@/api/ledger'
import { fetchVehicles } from '@/api/vehicles'
import { fetchPurchaseItems } from '@/api/catalogs'

const { t, locale } = useI18n()
const { sar, num } = useCurrency()
const { formatDate } = useDate()

const tab = useRouteTab('purchases')
const loading = ref(true)
const purchases = ref([])
const suppliers = ref([])
const vat = ref({ rows: [], totalVat: 0, totalPreTax: 0 })
const byCenter = ref([])
const centers = ref([])
const vehicles = ref([])
const items = ref([])

const itemDialog = ref(false)
const editingItem = ref(null)
const itemOptions = computed(() => items.value.filter((i) => i.active).map((i) => ({ value: i.id, label: i.name, hint: i.unit })))
function openAddItem() {
  editingItem.value = null
  itemDialog.value = true
}
function openEditItem(i) {
  editingItem.value = i
  itemDialog.value = true
}

const purchaseDialog = ref(false)
const supplierDialog = ref(false)
const editingSupplier = ref(null)

const loc = (map, k) => map[k]?.[locale.value] ?? map[k]?.ar ?? k
const categoryOptions = computed(() => Object.keys(SUPPLIER_CATEGORIES).map((k) => ({ value: k, label: loc(SUPPLIER_CATEGORIES, k) })))
const supplierOptions = computed(() => suppliers.value.filter((s) => s.active).map((s) => ({ value: s.id, label: s.name })))
const costCenterOptions = computed(() => centers.value.map((c) => ({ value: c.id, label: c.name })))
const vehicleOptions = computed(() => [
  { value: '', label: t('purchases.fields.noVehicle') },
  ...vehicles.value.map((v) => ({ value: v.id, label: v.plate, costCenter: v.costCenter })),
])

const tabs = computed(() => [
  { value: 'purchases', label: t('purchases.tabs.purchases') },
  { value: 'suppliers', label: t('purchases.tabs.suppliers') },
  { value: 'items', label: t('purchases.tabs.items') },
  { value: 'vat', label: t('purchases.tabs.vat') },
  { value: 'byCenter', label: t('purchases.tabs.byCenter') },
])

/* purchases: search by ref / supplier invoice / supplier / item, a date range,
   and supplier, vehicle, cost center and taxable in the tray */
const purQuery = ref('')
const purRange = ref(['', ''])
const purFilters = ref({ supplier: '', vehicle: '', costCenter: '', taxable: '' })
const purFilterDefs = computed(() => [
  { key: 'supplier', label: t('purchases.fields.supplier'), options: suppliers.value.map((x) => ({ value: x.id, label: x.name })) },
  { key: 'vehicle', label: t('purchases.fields.vehicle'), options: [{ value: 'none', label: t('purchases.fields.noVehicle') }, ...vehicles.value.map((v) => ({ value: v.id, label: v.plate }))] },
  { key: 'costCenter', label: t('purchases.filters.costCenter'), options: costCenterOptions.value },
  { key: 'taxable', label: t('purchases.filters.taxable'), options: [{ value: 'yes', label: t('purchases.filters.taxed') }, { value: 'no', label: t('purchases.filters.notTaxed') }] },
])
const shownPurchases = computed(() => {
  const q = purQuery.value.trim().toLowerCase()
  const [a, b] = purRange.value
  const f = purFilters.value
  return purchases.value.filter((p) =>
    (!q || [p.ref, p.invoiceNo, p.supplierName, p.itemType].some((v) => String(v ?? '').toLowerCase().includes(q))) &&
    (!a || p.date >= a) && (!b || p.date <= b) &&
    (!f.supplier || p.supplierId === f.supplier) &&
    (!f.vehicle || (f.vehicle === 'none' ? !p.vehicleId : p.vehicleId === f.vehicle)) &&
    (!f.costCenter || p.costCenter === f.costCenter) &&
    (!f.taxable || (f.taxable === 'yes') === !!p.taxable),
  )
})

/* suppliers: search by name / tax no.; category and status in the tray */
const supQuery = ref('')
const supFilters = ref({ category: '', status: '' })
const statusFilterOptions = computed(() => [{ value: 'active', label: t('common.active') }, { value: 'inactive', label: t('common.inactive') }])
const supFilterDefs = computed(() => [
  { key: 'category', label: t('purchases.supplier.category'), options: categoryOptions.value },
  { key: 'status', label: t('common.status'), options: statusFilterOptions.value },
])
const shownSuppliers = computed(() => {
  const q = supQuery.value.trim().toLowerCase()
  const f = supFilters.value
  return suppliers.value.filter((x) =>
    (!q || [x.name, x.taxNo].some((v) => String(v ?? '').toLowerCase().includes(q))) &&
    (!f.category || x.category === f.category) &&
    (!f.status || (f.status === 'active') === (x.active !== false)),
  )
})

/* purchase items: search by name; category and status in the tray */
const itemQuery = ref('')
const itemFilters = ref({ category: '', status: '' })
const itemFilterDefs = computed(() => [
  { key: 'category', label: t('purchases.items.category'), options: [...new Set(items.value.map((i) => i.category).filter(Boolean))].map((c) => ({ value: c, label: loc(SUPPLIER_CATEGORIES, c) })) },
  { key: 'status', label: t('common.status'), options: statusFilterOptions.value },
])
const shownItems = computed(() => {
  const q = itemQuery.value.trim().toLowerCase()
  const f = itemFilters.value
  return items.value.filter((i) =>
    (!q || [i.name, i.en, i.unit].some((v) => String(v ?? '').toLowerCase().includes(q))) &&
    (!f.category || i.category === f.category) &&
    (!f.status || (f.status === 'active') === (i.active !== false)),
  )
})

async function load() {
  loading.value = true
  ;[purchases.value, suppliers.value, vat.value, byCenter.value, centers.value, vehicles.value, items.value] = await Promise.all([
    fetchPurchases(), fetchSuppliers(), vatReport(), purchasesByCostCenter(), fetchCostCenters(), fetchVehicles(), fetchPurchaseItems(),
  ])
  loading.value = false
}
onMounted(load)

function openEditSupplier(s) {
  editingSupplier.value = s
  supplierDialog.value = true
}
function openAddSupplier() {
  editingSupplier.value = null
  supplierDialog.value = true
}
function exportVat() {
  exportCsv(
    `input-vat-${todayStamp()}`,
    [t('purchases.vat.invoice'), t('purchases.fields.supplier'), t('purchases.vat.taxNo'), t('purchases.vat.preTax'), t('purchases.vat.amount')],
    vat.value.rows.map((r) => [r.invoiceNo, r.supplierName, r.taxNo, r.preTax, r.vat]),
  )
}
</script>

<template>
  <div>
    <PageHeader :title="t('purchases.title')" :subtitle="t('purchases.subtitle')">
      <template #actions>
        <Button v-if="tab === 'purchases'" @click="purchaseDialog = true"><Plus /> {{ t('purchases.addPurchase') }}</Button>
        <Button v-else-if="tab === 'suppliers'" @click="openAddSupplier"><Plus /> {{ t('purchases.addSupplier') }}</Button>
        <Button v-else-if="tab === 'items'" @click="openAddItem"><Plus /> {{ t('purchases.items.add') }}</Button>
        <Button v-else-if="tab === 'vat'" variant="outline" @click="exportVat"><Download /> {{ t('common.export') }}</Button>
      </template>
    </PageHeader>


    <!-- Purchases -->
    <template v-if="tab === 'purchases'">
    <FilterBar v-model:search="purQuery" v-model="purFilters" :filters="purFilterDefs" :search-placeholder="t('purchases.searchPh')" class="mb-4">
      <template #extra><DateRangePicker v-model="purRange" /></template>
    </FilterBar>
    <Card class="overflow-hidden">
      <DataTable
        :loading="loading" :rows="shownPurchases" :empty="t('purchases.empty')" :page-size="12"
        :columns="[
          { key: 'ref', label: t('ledger.ref'), sortable: true },
          { key: 'date', label: t('purchases.fields.date'), sortable: true },
          { key: 'supplierName', label: t('purchases.fields.supplier'), sortable: true },
          { key: 'supplierTaxNo', label: t('purchases.fields.supplierTaxNo'), hideBelow: 'xl' },
          { key: 'vehiclePlate', label: t('purchases.fields.vehicle'), hideBelow: 'lg' },
          { key: 'itemType', label: t('purchases.fields.itemType'), hideBelow: 'md' },
          { key: 'preTax', label: t('purchases.fields.preTax'), align: 'end', hideBelow: 'lg' },
          { key: 'vat', label: t('purchases.fields.vat'), align: 'end', hideBelow: 'sm' },
          { key: 'total', label: t('purchases.fields.total'), align: 'end', sortable: true },
        ]"
      >
        <template #cell-ref="{ row }"><span dir="ltr" class="font-medium">{{ row.ref }}</span></template>
        <template #cell-date="{ row }">{{ formatDate(row.date) }}</template>
        <template #cell-supplierTaxNo="{ row }"><span dir="ltr" class="text-muted-foreground tabular-nums">{{ row.supplierTaxNo }}</span></template>
        <template #cell-vehiclePlate="{ row }">
          <span v-if="row.vehiclePlate" dir="ltr">{{ row.vehiclePlate }}</span>
          <span v-else class="text-muted-foreground">—</span>
        </template>
        <template #cell-preTax="{ row }"><span class="tabular-nums">{{ sar(row.preTax) }}</span></template>
        <template #cell-vat="{ row }"><span class="text-orange tabular-nums">{{ sar(row.vat) }}</span></template>
        <template #cell-total="{ row }"><span class="font-semibold tabular-nums">{{ sar(row.total) }}</span></template>
      </DataTable>
    </Card>
    </template>

    <!-- Suppliers -->
    <template v-else-if="tab === 'suppliers'">
    <FilterBar v-model:search="supQuery" v-model="supFilters" :filters="supFilterDefs" :search-placeholder="t('purchases.searchSuppliers')" class="mb-4" />
    <Card class="overflow-hidden">
      <DataTable
        :loading="loading" :rows="shownSuppliers" :empty="t('purchases.empty')"
        :columns="[
          { key: 'name', label: t('purchases.supplier.name'), sortable: true },
          { key: 'taxNo', label: t('purchases.supplier.taxNo'), hideBelow: 'md' },
          { key: 'category', label: t('purchases.supplier.category') },
          { key: 'purchases', label: t('purchases.supplier.purchases'), align: 'end', hideBelow: 'sm' },
          { key: 'active', label: t('common.status') },
          { key: 'actions', label: t('common.actions'), align: 'end' },
        ]"
      >
        <template #cell-taxNo="{ row }"><span dir="ltr" class="text-muted-foreground tabular-nums">{{ row.taxNo }}</span></template>
        <template #cell-category="{ row }"><Badge variant="secondary">{{ loc(SUPPLIER_CATEGORIES, row.category) }}</Badge></template>
        <template #cell-purchases="{ row }"><span class="tabular-nums">{{ num(row.purchases) }}</span></template>
        <template #cell-active="{ row }"><Badge :variant="row.active ? 'success' : 'secondary'">{{ row.active ? t('common.active') : t('common.inactive') }}</Badge></template>
        <template #cell-actions="{ row }">
          <ActionMenu :items="[
                    { label: t('common.edit'), icon: Pencil, tone: 'blue', onSelect: () => openEditSupplier(row) },
                  ]" />
        </template>
      </DataTable>
    </Card>
    </template>

    <!-- Purchase items (#6) -->
    <template v-else-if="tab === 'items'">
    <FilterBar v-model:search="itemQuery" v-model="itemFilters" :filters="itemFilterDefs" :search-placeholder="t('purchases.searchItems')" class="mb-4" />
    <Card class="overflow-hidden">
      <DataTable
        :loading="loading" :rows="shownItems" :empty="t('purchases.empty')"
        :columns="[
          { key: 'name', label: t('purchases.items.name'), sortable: true },
          { key: 'category', label: t('purchases.items.category') },
          { key: 'unit', label: t('purchases.items.unit'), hideBelow: 'sm' },
          { key: 'usage', label: t('purchases.items.usage'), align: 'end', hideBelow: 'md' },
          { key: 'active', label: t('common.status') },
          { key: 'actions', label: t('common.actions'), align: 'end' },
        ]"
      >
        <template #cell-name="{ row }"><span class="font-medium">{{ row.name }}</span></template>
        <template #cell-category="{ row }"><Badge variant="secondary">{{ loc(SUPPLIER_CATEGORIES, row.category) }}</Badge></template>
        <template #cell-unit="{ row }"><span class="text-muted-foreground">{{ row.unit || '—' }}</span></template>
        <template #cell-usage="{ row }"><span class="tabular-nums">{{ num(row.usage) }}</span></template>
        <template #cell-active="{ row }"><Badge :variant="row.active ? 'success' : 'secondary'">{{ row.active ? t('common.active') : t('common.inactive') }}</Badge></template>
        <template #cell-actions="{ row }">
          <ActionMenu :items="[
                    { label: t('common.edit'), icon: Pencil, tone: 'blue', onSelect: () => openEditItem(row) },
                  ]" />
        </template>
      </DataTable>
    </Card>
    </template>

    <!-- VAT report -->
    <Card v-else-if="tab === 'vat'" class="overflow-hidden">
      <DataTable
        :loading="loading" :rows="vat.rows" :empty="t('purchases.empty')"
        :columns="[
          { key: 'invoiceNo', label: t('purchases.vat.invoice'), sortable: true },
          { key: 'supplierName', label: t('purchases.fields.supplier'), sortable: true },
          { key: 'taxNo', label: t('purchases.vat.taxNo'), hideBelow: 'md' },
          { key: 'preTax', label: t('purchases.vat.preTax'), align: 'end' },
          { key: 'vat', label: t('purchases.vat.amount'), align: 'end', sortable: true },
        ]"
      >
        <template #cell-invoiceNo="{ row }"><span dir="ltr">{{ row.invoiceNo }}</span></template>
        <template #cell-taxNo="{ row }"><span dir="ltr" class="text-muted-foreground tabular-nums">{{ row.taxNo }}</span></template>
        <template #cell-preTax="{ row }"><span class="tabular-nums">{{ sar(row.preTax) }}</span></template>
        <template #cell-vat="{ row }"><span class="text-orange font-semibold tabular-nums">{{ sar(row.vat) }}</span></template>
      </DataTable>
      <div class="bg-muted/40 flex items-center justify-between border-t px-5 py-3 text-sm font-semibold">
        <span>{{ t('purchases.vat.total') }}</span>
        <span class="text-orange tabular-nums">{{ sar(vat.totalVat) }}</span>
      </div>
    </Card>

    <!-- By cost center -->
    <Card v-else class="overflow-hidden">
      <DataTable
        :loading="loading" :rows="byCenter" :empty="t('common.noData')"
        :columns="[
          { key: 'name', label: t('purchases.center.name'), sortable: true },
          { key: 'budget', label: t('purchases.center.budget'), align: 'end' },
          { key: 'spent', label: t('purchases.center.spent'), align: 'end', sortable: true },
          { key: 'variance', label: t('purchases.center.variance'), align: 'end' },
        ]"
      >
        <template #cell-budget="{ row }"><span class="tabular-nums">{{ sar(row.budget) }}</span></template>
        <template #cell-spent="{ row }">
          <div class="flex items-center justify-end gap-2">
            <Progress :value="row.budget ? (row.spent / row.budget) * 100 : 0" class="w-20" :indicator-class="row.over ? 'bg-danger' : 'bg-primary'" />
            <span class="tabular-nums">{{ sar(row.spent) }}</span>
          </div>
        </template>
        <template #cell-variance="{ row }"><span class="font-semibold tabular-nums" :class="row.over ? 'text-danger' : 'text-success'">{{ sar(row.variance) }}</span></template>
      </DataTable>
    </Card>

    <PurchaseDialog v-model:open="purchaseDialog" :supplier-options="supplierOptions" :cost-center-options="costCenterOptions" :vehicle-options="vehicleOptions" :suppliers="suppliers" :item-options="itemOptions" @saved="load" />
    <PurchaseItemDialog v-model:open="itemDialog" :item="editingItem" :category-options="categoryOptions" @saved="load" />
    <SupplierDialog v-model:open="supplierDialog" :supplier="editingSupplier" :category-options="categoryOptions" @saved="load" />
  </div>
</template>
