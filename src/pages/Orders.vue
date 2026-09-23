<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import ActionMenu from '@/components/common/ActionMenu.vue'
import { useRouteTab } from '@/composables/useRouteTab'
import FilterBar from '@/components/common/FilterBar.vue'
import MetricTile from '@/components/common/MetricTile.vue'
import { Upload, Pencil, Download, Plus, Package, Banknote, HandCoins, Route } from 'lucide-vue-next'
import PageHeader from '@/components/common/PageHeader.vue'
import RiderCode from '@/components/common/RiderCode.vue'
import { Card } from '@/components/ui/card'
import { DataTable } from '@/components/ui/table'
import { DateRangePicker } from '@/components/ui/datepicker'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import OrderEntryForm from '@/components/orders/OrderEntryForm.vue'
import OrderEditDialog from '@/components/orders/OrderEditDialog.vue'
import ImportOrdersDialog from '@/components/orders/ImportOrdersDialog.vue'
import ManualOrderDialog from '@/components/orders/ManualOrderDialog.vue'
import { useAuthStore } from '@/stores/auth'
import { ROLES } from '@/lib/constants'
import { useCurrency } from '@/composables/useCurrency'
import { useDate } from '@/lib/format'
import { exportCsv, todayStamp } from '@/lib/export'
import { RIDERS } from '@/api/fixtures'
import { fetchOrders, fetchManualOrders } from '@/api/orders'

const { t } = useI18n()
const auth = useAuthStore()
const { sar, num } = useCurrency()
const { formatDate } = useDate()

const isRider = computed(() => auth.role === ROLES.RIDER)
const isSupervisor = computed(() => auth.role === ROLES.SUPERVISOR)
const isManager = computed(() => auth.role === ROLES.MANAGER)

const tab = useRouteTab('logs')
const tabs = computed(() => [
  { value: 'logs', label: t('orders.tabs.logs') },
  { value: 'manual', label: t('orders.tabs.manual') },
])

const loading = ref(true)
const logs = ref([])
const manual = ref([])
const filterRider = ref('')
// date range (all days by default) + the tray's filters; rider and dates go to
// the API, the rest narrow the loaded rows
const dateRange = ref(['', ''])
// volume / hours are typed minimums: 20 means 20 orders or more
const extra = reactive({ volume: '', hours: '', createdBy: '' })
const manualQuery = ref('')
const orderFilters = computed({
  get: () => ({ rider: filterRider.value, ...extra }),
  set: (v) => {
    filterRider.value = v.rider ?? ''
    for (const k of Object.keys(extra)) extra[k] = v[k] ?? ''
  },
})
const createdByOptions = computed(() => [...new Set(manual.value.map((m) => m.createdBy).filter(Boolean))].map((n) => ({ value: n, label: n })))
const filterDefs = computed(() => [
  { key: 'rider', label: t('orders.filterRider'), options: riderOptions.value },
  ...(tab.value === 'logs'
    ? [
        { key: 'volume', label: t('orders.filters.volumeMin'), type: 'number', min: 0 },
        { key: 'hours', label: t('orders.filters.hoursMin'), type: 'number', min: 0 },
      ]
    : [{ key: 'createdBy', label: t('orders.manual.createdBy'), options: createdByOptions.value }]),
])
const atLeast = (v, min) => min === '' || min === null || Number.isNaN(Number(min)) || v >= Number(min)
const filteredLogs = computed(() =>
  logs.value.filter((l) => {
    if (!atLeast(l.orders, extra.volume)) return false
    if (!atLeast(l.hours, extra.hours)) return false
    return true
  }),
)
const filteredManual = computed(() =>
  manual.value.filter((m) => {
    if (extra.createdBy && m.createdBy !== extra.createdBy) return false
    const q = manualQuery.value.trim().toLowerCase()
    if (!q) return true
    return [m.orderNo, m.riderName, m.riderId, m.createdBy].some((v) => String(v ?? '').toLowerCase().includes(q))
  }),
)

const editDialog = ref(false)
const importDialog = ref(false)
const manualDialog = ref(false)
const editing = ref(null)

const riderOptions = computed(() => [
  { value: '', label: t('orders.allRiders') },
  ...RIDERS.map((r) => ({ value: r.id, label: r.name, hint: r.id })),
])
const activeRiderOptions = computed(() => RIDERS.filter((r) => r.active).map((r) => ({ value: r.id, label: r.name, hint: r.id })))

async function load() {
  loading.value = true
  const rid = isRider.value ? auth.user?.riderId : filterRider.value || undefined
  const [from, to] = dateRange.value
  const q = { riderId: rid, from: from || undefined, to: to || undefined }
  ;[logs.value, manual.value] = await Promise.all([fetchOrders(q), isRider.value ? [] : fetchManualOrders(q)])
  loading.value = false
}
onMounted(load)
watch([filterRider, dateRange], load)

function openEdit(row) {
  editing.value = row
  editDialog.value = true
}

const columns = computed(() => [
  { key: 'date', label: t('orders.fields.date'), sortable: true },
  ...(!isRider.value ? [{ key: 'riderName', label: t('orders.filterRider'), sortable: true }] : []),
  { key: 'orders', label: t('orders.fields.orders'), align: 'end', sortable: true },
  { key: 'cash', label: t('orders.fields.cash'), align: 'end', sortable: true, hideBelow: 'sm' },
  { key: 'hours', label: t('orders.fields.hours'), align: 'end', hideBelow: 'md' },
  { key: 'commission', label: t('dashboard.table.commission'), align: 'end', sortable: true, hideBelow: 'lg' },
  ...(isManager.value || isSupervisor.value ? [{ key: 'actions', label: t('common.actions'), align: 'end' }] : []),
])

const manualColumns = computed(() => [
  { key: 'orderNo', label: t('orders.manual.orderNo'), sortable: true },
  { key: 'date', label: t('orders.fields.date'), sortable: true },
  { key: 'riderName', label: t('orders.manual.rider'), sortable: true },
  { key: 'km', label: t('orders.manual.km'), align: 'end', hideBelow: 'md' },
  { key: 'price', label: t('orders.manual.price'), align: 'end', sortable: true },
  { key: 'collected', label: t('orders.manual.collected'), align: 'end', sortable: true },
  { key: 'createdBy', label: t('orders.manual.createdBy'), hideBelow: 'lg' },
])

const manualStats = computed(() => ({
  count: filteredManual.value.length,
  price: filteredManual.value.reduce((s, m) => s + m.price, 0),
  collected: filteredManual.value.reduce((s, m) => s + m.collected, 0),
  km: Math.round(filteredManual.value.reduce((s, m) => s + m.km, 0) * 10) / 10,
  get avgPrice() { return this.count ? this.price / this.count : 0 },
  get avgKm() { return this.count ? this.km / this.count : 0 },
  get rate() { return this.price ? Math.round((this.collected / this.price) * 100) : 0 },
}))

function exportLogs() {
  exportCsv(
    `orders-${todayStamp()}`,
    [t('orders.fields.date'), t('common.riderCode'), t('orders.filterRider'), t('orders.fields.orders'), t('orders.fields.cash'), t('orders.fields.hours')],
    (isRider.value ? logs.value : filteredLogs.value).map((l) => [l.date, l.riderId, l.riderName, l.orders, l.cash, l.hours]),
  )
}
function exportManual() {
  exportCsv(
    `manual-orders-${todayStamp()}`,
    [t('orders.manual.orderNo'), t('orders.fields.date'), t('orders.manual.time'), t('common.riderCode'), t('orders.manual.rider'), t('orders.manual.km'), t('orders.manual.price'), t('orders.manual.collected'), t('orders.manual.createdBy')],
    filteredManual.value.map((m) => [m.orderNo, m.date, m.time, m.riderId, m.riderName, m.km, m.price, m.collected, m.createdBy]),
  )
}
</script>

<template>
  <div>
    <PageHeader :title="t('orders.title')" :subtitle="t('orders.subtitle')">
      <template #actions>
        <template v-if="!isRider && tab === 'logs'">
          <Button variant="outline" @click="exportLogs"><Download /> {{ t('common.export') }}</Button>
          <Button v-if="isManager" @click="importDialog = true"><Upload /> {{ t('orders.import') }}</Button>
        </template>
        <template v-else-if="!isRider">
          <Button variant="outline" @click="exportManual"><Download /> {{ t('common.export') }}</Button>
          <Button @click="manualDialog = true"><Plus /> {{ t('orders.manual.add') }}</Button>
        </template>
      </template>
    </PageHeader>

    <!-- Rider view: entry form + own logs -->
    <div v-if="isRider" class="grid gap-6 lg:grid-cols-2">
      <OrderEntryForm :rider-id="auth.user?.riderId" @saved="load" />
      <Card class="overflow-hidden">
        <div class="flex items-center justify-between border-b p-5 font-semibold">
          {{ t('orders.myLogs') }}
          <RiderCode :code="auth.user?.riderId" />
        </div>
        <DataTable
          :loading="loading"
          :rows="logs"
          :empty="t('orders.empty')"
          :columns="[
            { key: 'date', label: t('orders.fields.date'), sortable: true },
            { key: 'orders', label: t('orders.fields.orders'), align: 'end' },
            { key: 'cash', label: t('orders.fields.cash'), align: 'end' },
            { key: 'commission', label: t('dashboard.table.commission'), align: 'end' },
          ]"
        >
          <template #cell-date="{ row }">{{ formatDate(row.date) }}</template>
          <template #cell-orders="{ row }"><span class="tabular-nums">{{ num(row.orders) }}</span></template>
          <template #cell-cash="{ row }"><span class="tabular-nums">{{ sar(row.cash) }}</span></template>
          <template #cell-commission="{ row }"><span class="font-semibold tabular-nums">{{ sar(row.commission) }}</span></template>
        </DataTable>
      </Card>
    </div>

    <!-- Manager/Supervisor view -->
    <div v-else class="space-y-4">
      <FilterBar
        v-model="orderFilters"
        :filters="filterDefs"
        :search="tab === 'manual' ? manualQuery : undefined"
        :search-placeholder="t('orders.manual.searchPh')"
        @update:search="manualQuery = $event"
      >
        <template #extra><DateRangePicker v-model="dateRange" /></template>
      </FilterBar>

      <!-- daily logs -->
      <Card v-if="tab === 'logs'" class="overflow-hidden">
        <DataTable :loading="loading" :rows="filteredLogs" :empty="t('orders.empty')" :columns="columns" :page-size="12">
          <template #cell-date="{ row }">{{ formatDate(row.date) }}</template>
          <template #cell-orders="{ row }"><span class="tabular-nums">{{ num(row.orders) }}</span></template>
          <template #cell-cash="{ row }"><span class="tabular-nums">{{ sar(row.cash) }}</span></template>
          <template #cell-hours="{ row }"><span class="tabular-nums">{{ num(row.hours) }}</span></template>
          <template #cell-commission="{ row }"><span class="font-semibold tabular-nums">{{ sar(row.commission) }}</span></template>
          <template #cell-riderName="{ row }">
            <div class="flex flex-wrap items-center gap-2">
              {{ row.riderName }}
              <RiderCode :code="row.riderId" />
              <Badge v-if="row.editedBy" variant="secondary">{{ t('orders.editedBy', { name: row.editedBy.editor }) }}</Badge>
            </div>
          </template>
          <template #cell-actions="{ row }">
            <ActionMenu :items="[
                      { label: t('orders.editTitle'), icon: Pencil, tone: 'blue', onSelect: () => openEdit(row) },
                    ]" />
          </template>
        </DataTable>
      </Card>

      <!-- manual orders (#3) -->
      <template v-else>
        <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricTile :label="t('orders.manual.stats.count')" :value="manualStats.count" :format="(v) => num(Math.round(v))" :icon="Package" tone="brand"
            :hint="t('orders.manual.stats.avgPrice', { v: sar(manualStats.avgPrice) })" />
          <MetricTile :label="t('orders.manual.stats.price')" :value="manualStats.price" :format="(v) => sar(Math.round(v))" :icon="Banknote" tone="orange"
            :hint="t('orders.manual.stats.perOrder')" />
          <MetricTile :label="t('orders.manual.stats.collected')" :value="manualStats.collected" :format="(v) => sar(Math.round(v))" :icon="HandCoins" tone="success"
            :progress="manualStats.rate" :hint="t('orders.manual.stats.rate', { v: manualStats.rate })" />
          <MetricTile :label="t('orders.manual.stats.km')" :value="manualStats.km" :format="(v) => num(v, { decimals: 1 })" :icon="Route" tone="primary"
            :hint="t('orders.manual.stats.avgKm', { v: num(manualStats.avgKm, { decimals: 1 }) })" />
        </div>

        <Card class="overflow-hidden">
          <DataTable :loading="loading" :rows="filteredManual" :empty="t('orders.manual.empty')" :columns="manualColumns" :page-size="12">
            <template #cell-orderNo="{ row }"><span dir="ltr" class="font-medium">{{ row.orderNo }}</span></template>
            <template #cell-date="{ row }">
              <span class="tabular-nums">{{ formatDate(row.date) }}</span>
              <span class="text-muted-foreground ms-1.5 text-xs tabular-nums" dir="ltr">{{ row.time }}</span>
            </template>
            <template #cell-riderName="{ row }">
              <span class="flex items-center gap-2">{{ row.riderName }} <RiderCode :code="row.riderId" /></span>
            </template>
            <template #cell-km="{ row }"><span class="tabular-nums">{{ num(row.km, { decimals: 1 }) }}</span></template>
            <template #cell-price="{ row }"><span class="tabular-nums">{{ sar(row.price) }}</span></template>
            <template #cell-collected="{ row }">
              <span class="font-semibold tabular-nums">{{ sar(row.collected) }}</span>
              <Badge v-if="row.uncollected" variant="warning" class="ms-1.5">{{ t('orders.manual.uncollected') }} {{ sar(row.uncollected) }}</Badge>
            </template>
            <template #cell-createdBy="{ row }"><span class="text-muted-foreground">{{ row.createdBy || '—' }}</span></template>
          </DataTable>
        </Card>
      </template>
    </div>

    <OrderEditDialog v-model:open="editDialog" :log="editing" :by-supervisor="isSupervisor" @saved="load" />
    <ImportOrdersDialog v-model:open="importDialog" @saved="load" />
    <ManualOrderDialog v-model:open="manualDialog" :rider-options="activeRiderOptions" @saved="load" />
  </div>
</template>
