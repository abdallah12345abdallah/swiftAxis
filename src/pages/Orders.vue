<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import ActionMenu from '@/components/common/ActionMenu.vue'
import { useRouteTab } from '@/composables/useRouteTab'
import { Upload, Pencil, Download, Plus, Package, Banknote, HandCoins, Route } from 'lucide-vue-next'
import PageHeader from '@/components/common/PageHeader.vue'
import RiderCode from '@/components/common/RiderCode.vue'
import { Card } from '@/components/ui/card'
import { Tabs } from '@/components/ui/tabs'
import { DataTable } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dropdown } from '@/components/ui/dropdown'
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
  ;[logs.value, manual.value] = await Promise.all([fetchOrders({ riderId: rid }), isRider.value ? [] : fetchManualOrders({ riderId: rid })])
  loading.value = false
}
onMounted(load)
watch(filterRider, load)

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
  count: manual.value.length,
  price: manual.value.reduce((s, m) => s + m.price, 0),
  collected: manual.value.reduce((s, m) => s + m.collected, 0),
  km: Math.round(manual.value.reduce((s, m) => s + m.km, 0) * 10) / 10,
}))

function exportLogs() {
  exportCsv(
    `orders-${todayStamp()}`,
    [t('orders.fields.date'), t('common.riderCode'), t('orders.filterRider'), t('orders.fields.orders'), t('orders.fields.cash'), t('orders.fields.hours')],
    logs.value.map((l) => [l.date, l.riderId, l.riderName, l.orders, l.cash, l.hours]),
  )
}
function exportManual() {
  exportCsv(
    `manual-orders-${todayStamp()}`,
    [t('orders.manual.orderNo'), t('orders.fields.date'), t('orders.manual.time'), t('common.riderCode'), t('orders.manual.rider'), t('orders.manual.km'), t('orders.manual.price'), t('orders.manual.collected'), t('orders.manual.createdBy')],
    manual.value.map((m) => [m.orderNo, m.date, m.time, m.riderId, m.riderName, m.km, m.price, m.collected, m.createdBy]),
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
      <div class="flex flex-wrap items-center gap-3">
        <Tabs v-model="tab" :tabs="tabs" />
        <Dropdown v-model="filterRider" :options="riderOptions" class="ms-auto w-auto min-w-[200px]" />
      </div>

      <!-- daily logs -->
      <Card v-if="tab === 'logs'" class="overflow-hidden">
        <DataTable :loading="loading" :rows="logs" :empty="t('orders.empty')" :columns="columns" :page-size="12">
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
          <Card class="flex items-center gap-3 p-4">
            <span class="bg-primary/10 text-primary grid size-11 place-items-center rounded-lg"><Package class="size-5" /></span>
            <div><p class="text-2xl font-bold tabular-nums">{{ num(manualStats.count) }}</p><p class="text-muted-foreground text-xs">{{ t('orders.manual.stats.count') }}</p></div>
          </Card>
          <Card class="flex items-center gap-3 p-4">
            <span class="bg-orange/10 text-orange grid size-11 place-items-center rounded-lg"><Banknote class="size-5" /></span>
            <div><p class="text-2xl font-bold tabular-nums">{{ sar(manualStats.price) }}</p><p class="text-muted-foreground text-xs">{{ t('orders.manual.stats.price') }}</p></div>
          </Card>
          <Card class="flex items-center gap-3 p-4">
            <span class="bg-success/10 text-success grid size-11 place-items-center rounded-lg"><HandCoins class="size-5" /></span>
            <div><p class="text-2xl font-bold tabular-nums">{{ sar(manualStats.collected) }}</p><p class="text-muted-foreground text-xs">{{ t('orders.manual.stats.collected') }}</p></div>
          </Card>
          <Card class="flex items-center gap-3 p-4">
            <span class="bg-muted text-muted-foreground grid size-11 place-items-center rounded-lg"><Route class="size-5" /></span>
            <div><p class="text-2xl font-bold tabular-nums">{{ num(manualStats.km, { decimals: 1 }) }}</p><p class="text-muted-foreground text-xs">{{ t('orders.manual.stats.km') }}</p></div>
          </Card>
        </div>

        <Card class="overflow-hidden">
          <DataTable :loading="loading" :rows="manual" :empty="t('orders.manual.empty')" :columns="manualColumns" :page-size="12">
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
