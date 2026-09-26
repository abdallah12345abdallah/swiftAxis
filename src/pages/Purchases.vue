<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import ActionMenu from '@/components/common/ActionMenu.vue'
import { useRouteTab } from '@/composables/useRouteTab'
import { Plus, Pencil, Download, Receipt, AlertTriangle } from 'lucide-vue-next'
import MetricTile from '@/components/common/MetricTile.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { Skeleton } from '@/components/ui/skeleton'
import PageHeader from '@/components/common/PageHeader.vue'
import FilterBar from '@/components/common/FilterBar.vue'
import { DateRangePicker } from '@/components/ui/datepicker'
import { Card } from '@/components/ui/card'
import { DataTable } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import PurchaseDialog from '@/components/purchases/PurchaseDialog.vue'
import SupplierDialog from '@/components/purchases/SupplierDialog.vue'
import PurchaseItemDialog from '@/components/purchases/PurchaseItemDialog.vue'
import UnitDialog from '@/components/purchases/UnitDialog.vue'
import { useCurrency } from '@/composables/useCurrency'
import { useDate } from '@/lib/format'
import { exportCsv, todayStamp } from '@/lib/export'
import { SUPPLIER_CATEGORIES } from '@/api/fixtures'
import {
  fetchSuppliers, fetchPurchases, vatReport,
} from '@/api/purchases'
import { fetchCostCenters } from '@/api/ledger'
import { fetchVehicles } from '@/api/vehicles'
import { fetchPurchaseItems, fetchUnits } from '@/api/catalogs'

const { t, locale } = useI18n()
const { sar, num } = useCurrency()
const { formatDate } = useDate()

const tab = useRouteTab('purchases')
const loading = ref(true)
const purchases = ref([])
const suppliers = ref([])
const vat = ref({ rows: [], totalVat: 0, totalPreTax: 0 })
const centers = ref([])
const vehicles = ref([])
const items = ref([])

const itemDialog = ref(false)
const editingItem = ref(null)
const unitName = (x) => (locale.value === 'ar' ? x.unitName : x.unitEn) || x.unitName || ''
const itemOptions = computed(() => items.value.filter((i) => i.active).map((i) => ({ value: i.id, label: i.name, hint: unitName(i), unit: i.unit })))
/* a purchase's items: the first one, and how many more */
const moreItems = (p) => Math.max(0, (p.lines?.length ?? 1) - 1)
const itemsTitle = (p) => (p.lines ?? []).map((l) => `${l.itemType} × ${num(l.qty)}${unitName(l) ? ` ${unitName(l)}` : ''}`).join(' · ')
function openAddItem() {
  editingItem.value = null
  itemDialog.value = true
}
function openEditItem(i) {
  editingItem.value = i
  itemDialog.value = true
}

/* units of measure: user-managed list the purchase items pick from */
const units = ref([])
const unitDialog = ref(false)
const editingUnit = ref(null)
const unitQuery = ref('')
const unitFilters = ref({ status: '' })
const unitFilterDefs = computed(() => [
  { key: 'status', label: t('common.status'), options: [
    { value: 'active', label: t('common.active') },
    { value: 'inactive', label: t('common.inactive') },
  ] },
])
const shownUnits = computed(() => {
  const q = unitQuery.value.trim().toLowerCase()
  const f = unitFilters.value
  return units.value.filter((u) =>
    (!q || [u.code, u.name, u.en].some((v) => String(v ?? '').toLowerCase().includes(q))) &&
    (!f.status || (f.status === 'active') === (u.active !== false)),
  )
})
function openAddUnit() {
  editingUnit.value = null
  unitDialog.value = true
}
function openEditUnit(u) {
  editingUnit.value = u
  unitDialog.value = true
}

const purchaseDialog = ref(false)
const supplierDialog = ref(false)
const editingSupplier = ref(null)

/* VAT report: search, date range and supplier filter, then totals and per-supplier shares */
const vatQuery = ref('')
const vatRange = ref(['', ''])
const vatFilters = ref({ supplier: '' })
const vatFilterDefs = computed(() => [
  { key: 'supplier', label: t('purchases.fields.supplier'), options: [{ value: '', label: t('common.all') }, ...[...new Set(vat.value.rows.map((r) => r.supplierName))].map((n) => ({ value: n, label: n }))] },
])
const hasTaxNo = (r) => r.taxNo && r.taxNo !== '—'
const rate = (r) => (r.preTax ? Math.round((r.vat / r.preTax) * 100) : 0)
const initials = (name = '') => name.replace(/^(شركة|مؤسسة)\s+/, '').trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('')
const vatRows = computed(() => {
  const q = vatQuery.value.trim().toLowerCase()
  const [from, to] = vatRange.value
  return vat.value.rows
    .filter((r) => (!from || r.date >= from) && (!to || r.date <= to))
    .filter((r) => !vatFilters.value.supplier || r.supplierName === vatFilters.value.supplier)
    .filter((r) => !q || [r.invoiceNo, r.supplierName, r.taxNo, r.itemType, r.ref, ...(r.lines ?? []).map((l) => l.itemType)].some((v) => v && String(v).toLowerCase().includes(q)))
    .sort((a, b) => (a.date < b.date ? 1 : -1))
})
const vatTotals = computed(() => ({
  vat: vatRows.value.reduce((s, r) => s + r.vat, 0),
  preTax: vatRows.value.reduce((s, r) => s + r.preTax, 0),
}))
const vatBySupplier = computed(() => {
  const m = new Map()
  vatRows.value.forEach((r) => m.set(r.supplierName, (m.get(r.supplierName) ?? 0) + r.vat))
  const total = vatTotals.value.vat || 1
  return [...m].map(([name, v]) => ({ name, vat: v, pct: Math.round((v / total) * 1000) / 10 })).sort((a, b) => b.vat - a.vat)
})

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
  { value: 'units', label: t('purchases.tabs.units') },
  { value: 'vat', label: t('purchases.tabs.vat') },
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
    (!q || [p.ref, p.invoiceNo, p.supplierName, p.itemType, ...(p.lines ?? []).map((l) => l.itemType)].some((v) => String(v ?? '').toLowerCase().includes(q))) &&
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
    (!q || [i.name, i.en, i.unit, i.unitName, i.unitEn].some((v) => String(v ?? '').toLowerCase().includes(q))) &&
    (!f.category || i.category === f.category) &&
    (!f.status || (f.status === 'active') === (i.active !== false)),
  )
})

async function load() {
  loading.value = true
  ;[purchases.value, suppliers.value, vat.value, centers.value, vehicles.value, items.value, units.value] = await Promise.all([
    fetchPurchases(), fetchSuppliers(), vatReport(), fetchCostCenters(), fetchVehicles(), fetchPurchaseItems(), fetchUnits(),
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
    vatRows.value.map((r) => [r.invoiceNo, r.supplierName, r.taxNo, r.preTax, r.vat]),
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
        <Button v-else-if="tab === 'units'" @click="openAddUnit"><Plus /> {{ t('purchases.units.add') }}</Button>
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
          { key: 'itemType', label: t('purchases.lines.items'), hideBelow: 'md' },
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
        <template #cell-itemType="{ row }">
          <span class="inline-flex max-w-[16rem] items-center gap-1.5" :title="itemsTitle(row)">
            <span class="truncate">{{ row.lines?.[0]?.itemType ?? row.itemType }}</span>
            <span v-if="moreItems(row)" class="pu-more">{{ t('purchases.lines.more', { n: num(moreItems(row)) }) }}</span>
          </span>
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
        <template #cell-unit="{ row }">
          <span v-if="row.unit" class="inline-flex items-center gap-1.5"><span class="pu-unit" dir="ltr">{{ row.unit }}</span>{{ unitName(row) }}</span>
          <span v-else class="text-muted-foreground">—</span>
        </template>
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

    <!-- Units of measure -->
    <template v-else-if="tab === 'units'">
    <FilterBar v-model:search="unitQuery" v-model="unitFilters" :filters="unitFilterDefs" :search-placeholder="t('purchases.units.searchPh')" class="mb-4" />
    <Card class="overflow-hidden">
      <DataTable
        :loading="loading" :rows="shownUnits" row-key="code" :empty="t('purchases.empty')"
        :columns="[
          { key: 'code', label: t('purchases.units.code'), sortable: true },
          { key: 'name', label: t('purchases.units.name'), sortable: true },
          { key: 'en', label: t('purchases.units.en'), hideBelow: 'sm' },
          { key: 'usage', label: t('purchases.units.usage'), align: 'end', hideBelow: 'md' },
          { key: 'active', label: t('common.status') },
          { key: 'actions', label: t('common.actions'), align: 'end' },
        ]"
      >
        <template #cell-code="{ row }"><span class="pu-unit" dir="ltr">{{ row.code }}</span></template>
        <template #cell-name="{ row }"><span class="font-medium">{{ row.name }}</span></template>
        <template #cell-en="{ row }"><span dir="ltr" class="text-muted-foreground">{{ row.en }}</span></template>
        <template #cell-usage="{ row }"><span class="tabular-nums">{{ num(row.usage) }}</span></template>
        <template #cell-active="{ row }"><Badge :variant="row.active !== false ? 'success' : 'secondary'">{{ row.active !== false ? t('common.active') : t('common.inactive') }}</Badge></template>
        <template #cell-actions="{ row }">
          <ActionMenu :items="[
                    { label: t('common.edit'), icon: Pencil, tone: 'blue', onSelect: () => openEditUnit(row) },
                  ]" />
        </template>
      </DataTable>
    </Card>
    </template>

    <!-- VAT report -->
    <div v-else-if="tab === 'vat'" class="space-y-6">
      <FilterBar v-model:search="vatQuery" v-model="vatFilters" :filters="vatFilterDefs" :search-placeholder="t('purchases.vat.searchPh')">
        <template #extra><DateRangePicker v-model="vatRange" /></template>
      </FilterBar>

      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricTile :label="t('purchases.vat.total')" :value="vatTotals.vat" :format="sar" :icon="Receipt" tone="orange" />
      </div>

      <div v-if="loading" class="grid gap-6 lg:grid-cols-3">
        <Skeleton class="h-80 rounded-2xl lg:col-span-2" />
        <Skeleton class="h-80 rounded-2xl" />
      </div>
      <Card v-else-if="!vatRows.length"><EmptyState :title="t('purchases.empty')" /></Card>

      <div v-else class="grid items-start gap-6 lg:grid-cols-3">
        <div class="soft-table overflow-x-auto lg:col-span-2">
          <table class="w-full text-sm">
            <thead>
              <tr>
                <th class="px-4 text-start">{{ t('purchases.vat.invoice') }}</th>
                <th class="min-w-[180px] px-4 text-start">{{ t('purchases.fields.supplier') }}</th>
                <th class="px-4 text-start">{{ t('purchases.vat.taxNo') }}</th>
                <th class="px-4 text-end">{{ t('purchases.vat.preTax') }}</th>
                <th class="px-4 text-end">{{ t('purchases.vat.amount') }}</th>
                <th class="px-4 text-end">{{ t('purchases.fields.total') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in vatRows" :key="r.id">
                <td class="px-4 py-3">
                  <span class="vt-inv" dir="ltr">{{ r.invoiceNo }}</span>
                  <span class="text-muted-foreground mt-1 block text-xs tabular-nums">{{ formatDate(r.date) }}</span>
                </td>
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2.5">
                    <span class="vt-av">{{ initials(r.supplierName) }}</span>
                    <div class="min-w-0">
                      <p class="truncate font-semibold">{{ r.supplierName }}</p>
                      <p class="text-muted-foreground truncate text-xs" :title="itemsTitle(r)">{{ r.itemType }}<template v-if="moreItems(r)"> · {{ t('purchases.lines.more', { n: num(moreItems(r)) }) }}</template></p>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-3">
                  <span v-if="hasTaxNo(r)" class="vt-tax" dir="ltr">{{ r.taxNo }}</span>
                  <span v-else class="vt-missing"><AlertTriangle class="size-3" /> {{ t('purchases.vat.noTaxNo') }}</span>
                </td>
                <td class="px-4 py-3 text-end tabular-nums" dir="ltr">{{ sar(r.preTax) }}</td>
                <td class="px-4 py-3 text-end">
                  <span class="inline-flex items-center gap-1.5">
                    <span class="vt-rate">{{ num(rate(r)) }}%</span>
                    <b class="text-orange tabular-nums" dir="ltr">{{ sar(r.vat) }}</b>
                  </span>
                </td>
                <td class="px-4 py-3 text-end font-bold tabular-nums" dir="ltr">{{ sar(r.total ?? r.preTax + r.vat) }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" class="px-4 py-3.5">{{ t('common.total') }}</td>
                <td class="px-4 py-3.5 text-end tabular-nums" dir="ltr">{{ sar(vatTotals.preTax) }}</td>
                <td class="text-orange px-4 py-3.5 text-end tabular-nums" dir="ltr">{{ sar(vatTotals.vat) }}</td>
                <td class="px-4 py-3.5 text-end tabular-nums" dir="ltr">{{ sar(vatTotals.preTax + vatTotals.vat) }}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <!-- input VAT per supplier -->
        <Card class="p-5">
          <h3 class="font-bold">{{ t('purchases.vat.bySupplier') }}</h3>
          <p class="text-muted-foreground mt-0.5 text-xs">{{ t('purchases.vat.bySupplierHint') }}</p>
          <ul class="mt-4 space-y-3.5">
            <li v-for="s in vatBySupplier" :key="s.name">
              <div class="flex items-center justify-between gap-3 text-sm">
                <span class="min-w-0 truncate font-semibold">{{ s.name }}</span>
                <b class="text-orange shrink-0 tabular-nums" dir="ltr">{{ sar(s.vat) }}</b>
              </div>
              <div class="mt-1.5 flex items-center gap-2">
                <span class="vt-bar"><i :style="{ width: `${s.pct}%` }" /></span>
                <span class="text-muted-foreground w-12 shrink-0 text-end text-[11px] font-bold tabular-nums">{{ num(s.pct, { decimals: 1 }) }}%</span>
              </div>
            </li>
          </ul>
        </Card>
      </div>
    </div>

    <PurchaseDialog v-model:open="purchaseDialog" :supplier-options="supplierOptions" :cost-center-options="costCenterOptions" :vehicle-options="vehicleOptions" :suppliers="suppliers" :item-options="itemOptions" @saved="load" />
    <PurchaseItemDialog v-model:open="itemDialog" :item="editingItem" :category-options="categoryOptions" @saved="load" />
    <UnitDialog v-model:open="unitDialog" :unit="editingUnit" @saved="load" />
    <SupplierDialog v-model:open="supplierDialog" :supplier="editingSupplier" :category-options="categoryOptions" @saved="load" />
  </div>
</template>

<style scoped>
/* purchases list: "+N" more items, coded unit chip */
.pu-more { flex: none; padding: 0.05rem 0.45rem; border-radius: 9999px; font-size: 10.5px; font-weight: 800; color: var(--primary); background: color-mix(in srgb, var(--primary) 10%, transparent); font-variant-numeric: tabular-nums; }
.pu-unit { font: 700 11px ui-monospace, 'IBM Plex Mono', monospace; padding: 0.05rem 0.4rem; border-radius: 0.35rem; background: var(--muted); color: var(--muted-foreground); }

/* VAT report */
.vt-inv { font: 700 12.5px ui-monospace, 'IBM Plex Mono', monospace; padding: 0.1rem 0.5rem; border-radius: 0.4rem; background: var(--muted); }
.vt-av {
  display: grid; place-items: center; width: 2.1rem; height: 2.1rem; flex: none; border-radius: 0.7rem;
  font-size: 12px; font-weight: 800; color: var(--brand); background: color-mix(in srgb, var(--brand) 12%, var(--card));
}
.vt-tax { font: 600 12px ui-monospace, 'IBM Plex Mono', monospace; color: var(--muted-foreground); letter-spacing: 0.02em; }
.vt-missing {
  display: inline-flex; align-items: center; gap: 0.3rem; padding: 0.1rem 0.55rem; border-radius: 9999px; white-space: nowrap;
  font-size: 11px; font-weight: 800; color: var(--warning-foreground); background: color-mix(in srgb, var(--warning) 18%, transparent);
}
.vt-rate { font-size: 10.5px; font-weight: 800; padding: 0.05rem 0.4rem; border-radius: 0.35rem; color: var(--primary); background: color-mix(in srgb, var(--primary) 10%, transparent); }
.vt-bar { flex: 1; height: 0.45rem; border-radius: 9999px; background: var(--muted); overflow: hidden; }
.vt-bar i { display: block; height: 100%; border-radius: 9999px; background: linear-gradient(90deg, color-mix(in srgb, var(--primary) 65%, var(--card)), var(--primary)); transition: width 0.6s cubic-bezier(0.2, 0.8, 0.2, 1); }
@media (prefers-reduced-motion: reduce) { .vt-bar i { transition: none; } }
</style>
