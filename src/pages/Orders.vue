<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Upload, Pencil, Download } from 'lucide-vue-next'
import PageHeader from '@/components/common/PageHeader.vue'
import { Card } from '@/components/ui/card'
import { DataTable } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import OrderEntryForm from '@/components/orders/OrderEntryForm.vue'
import OrderEditDialog from '@/components/orders/OrderEditDialog.vue'
import ImportOrdersDialog from '@/components/orders/ImportOrdersDialog.vue'
import { useAuthStore } from '@/stores/auth'
import { ROLES } from '@/lib/constants'
import { useCurrency } from '@/composables/useCurrency'
import { useDate } from '@/lib/format'
import { exportCsv, todayStamp } from '@/lib/export'
import { RIDERS } from '@/api/fixtures'
import { fetchOrders } from '@/api/orders'

const { t } = useI18n()
const auth = useAuthStore()
const { sar, num } = useCurrency()
const { formatDate } = useDate()

const isRider = computed(() => auth.role === ROLES.RIDER)
const isSupervisor = computed(() => auth.role === ROLES.SUPERVISOR)
const isManager = computed(() => auth.role === ROLES.MANAGER)

const loading = ref(true)
const logs = ref([])
const filterRider = ref('')

const editDialog = ref(false)
const importDialog = ref(false)
const editing = ref(null)

const riderOptions = computed(() => [
  { value: '', label: t('orders.allRiders') },
  ...RIDERS.map((r) => ({ value: r.id, label: r.name })),
])

async function load() {
  loading.value = true
  const rid = isRider.value ? auth.user?.riderId : filterRider.value || undefined
  logs.value = await fetchOrders({ riderId: rid })
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

function exportLogs() {
  exportCsv(
    `orders-${todayStamp()}`,
    [t('orders.fields.date'), t('orders.filterRider'), t('orders.fields.orders'), t('orders.fields.cash'), t('orders.fields.hours')],
    logs.value.map((l) => [l.date, l.riderName, l.orders, l.cash, l.hours]),
  )
}
</script>

<template>
  <div>
    <PageHeader :title="t('orders.title')" :subtitle="t('orders.subtitle')">
      <template #actions>
        <Button v-if="!isRider" variant="outline" @click="exportLogs"><Download /> {{ t('common.export') }}</Button>
        <Button v-if="isManager" @click="importDialog = true"><Upload /> {{ t('orders.import') }}</Button>
      </template>
    </PageHeader>

    <!-- Rider view: entry form + own logs -->
    <div v-if="isRider" class="grid gap-6 lg:grid-cols-2">
      <OrderEntryForm :rider-id="auth.user?.riderId" @saved="load" />
      <Card class="overflow-hidden">
        <div class="border-b p-5 font-semibold">{{ t('orders.myLogs') }}</div>
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
        <Select v-model="filterRider" :options="riderOptions" class="w-auto min-w-[200px]" />
      </div>
      <Card class="overflow-hidden">
        <DataTable :loading="loading" :rows="logs" :empty="t('orders.empty')" :columns="columns" :page-size="12">
          <template #cell-date="{ row }">{{ formatDate(row.date) }}</template>
          <template #cell-orders="{ row }"><span class="tabular-nums">{{ num(row.orders) }}</span></template>
          <template #cell-cash="{ row }"><span class="tabular-nums">{{ sar(row.cash) }}</span></template>
          <template #cell-hours="{ row }"><span class="tabular-nums">{{ num(row.hours) }}</span></template>
          <template #cell-commission="{ row }"><span class="font-semibold tabular-nums">{{ sar(row.commission) }}</span></template>
          <template #cell-riderName="{ row }">
            <div class="flex items-center gap-2">
              {{ row.riderName }}
              <Badge v-if="row.editedBy" variant="secondary">{{ t('orders.editedBy', { name: row.editedBy.editor }) }}</Badge>
            </div>
          </template>
          <template #cell-actions="{ row }">
            <button type="button" class="hover:bg-accent text-muted-foreground hover:text-foreground inline-flex size-8 items-center justify-center rounded-lg" @click="openEdit(row)">
              <Pencil class="size-4" />
            </button>
          </template>
        </DataTable>
      </Card>
    </div>

    <OrderEditDialog v-model:open="editDialog" :log="editing" :by-supervisor="isSupervisor" @saved="load" />
    <ImportOrdersDialog v-model:open="importDialog" @saved="load" />
  </div>
</template>
