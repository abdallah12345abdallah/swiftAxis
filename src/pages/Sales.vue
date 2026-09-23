<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouteTab } from '@/composables/useRouteTab'
import { Plus, Download, CheckCircle2, FileSpreadsheet } from 'lucide-vue-next'
import PageHeader from '@/components/common/PageHeader.vue'
import { Tabs } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { DataTable } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { Dropdown } from '@/components/ui/dropdown'
import { DatePicker } from '@/components/ui/datepicker'
import SalesInvoiceDialog from '@/components/sales/SalesInvoiceDialog.vue'
import { useCurrency } from '@/composables/useCurrency'
import { useDate } from '@/lib/format'
import { exportCsv, todayStamp } from '@/lib/export'
import { useToast } from '@/composables/useToast'
import { fetchSalesInvoices, salesVatReport, markInvoicePaid } from '@/api/sales'
import { fetchContracts } from '@/api/riders'
import { fetchTreasuries } from '@/api/treasury'

const { t } = useI18n()
const { sar, num } = useCurrency()
const { formatDate, formatMonth } = useDate()
const toast = useToast()

const tab = useRouteTab('invoices')
const tabs = computed(() => [
  { value: 'invoices', label: t('sales.tabs.invoices') },
  { value: 'vat', label: t('sales.tabs.vat') },
])

const loading = ref(true)
const invoices = ref([])
const vat = ref({ rows: [], totalPreTax: 0, totalVat: 0, totalDue: 0 })
const contracts = ref([])
const treasuries = ref([])

const invoiceDialog = ref(false)
const paidDialog = ref(false)
const paying = ref(null)
const paidForm = reactive({ treasuryId: '', date: new Date().toISOString().slice(0, 10) })
const paidError = ref('')
const savingPaid = ref(false)

const contractOptions = computed(() => contracts.value.filter((c) => c.active).map((c) => ({ value: c.id, label: c.company })))
const treasuryOptions = computed(() => treasuries.value.filter((x) => x.active && x.kind !== 'rider').map((x) => ({ value: x.id, label: x.name })))

async function load() {
  loading.value = true
  ;[invoices.value, vat.value, contracts.value, treasuries.value] = await Promise.all([fetchSalesInvoices(), salesVatReport(), fetchContracts(), fetchTreasuries()])
  loading.value = false
}
onMounted(load)

const kpi = computed(() => ({
  count: invoices.value.length,
  preTax: invoices.value.reduce((s, i) => s + i.preTax, 0),
  vat: invoices.value.reduce((s, i) => s + i.vat, 0),
  due: invoices.value.filter((i) => i.status !== 'paid').reduce((s, i) => s + i.total, 0),
}))

function openPaid(inv) {
  paying.value = inv
  paidError.value = ''
  Object.assign(paidForm, { treasuryId: treasuries.value.find((x) => x.kind === 'bank' && x.active)?.id ?? treasuryOptions.value[0]?.value ?? '', date: new Date().toISOString().slice(0, 10) })
  paidDialog.value = true
}
async function confirmPaid() {
  if (savingPaid.value) return
  if (!paidForm.treasuryId) {
    paidError.value = t('sales.errTreasury')
    return
  }
  savingPaid.value = true
  try {
    await markInvoicePaid(paying.value.id, { ...paidForm })
    toast.success(t('sales.paidSaved'))
    paidDialog.value = false
    await load()
  } finally {
    savingPaid.value = false
  }
}

function exportVat() {
  exportCsv(
    `output-vat-${todayStamp()}`,
    [t('common.ref'), t('sales.contract'), t('sales.period'), t('sales.preTax'), t('sales.vat', { rate: 15 }), t('sales.total'), t('sales.status')],
    vat.value.rows.map((r) => [r.ref, r.company, r.period, r.preTax, r.vat, r.total, t(`sales.statuses.${r.status}`)]),
  )
}
</script>

<template>
  <div>
    <PageHeader :title="t('sales.title')" :subtitle="t('sales.subtitle')">
      <template #actions>
        <Button v-if="tab === 'invoices'" @click="invoiceDialog = true"><Plus /> {{ t('sales.add') }}</Button>
        <Button v-else variant="outline" @click="exportVat"><Download /> {{ t('common.export') }}</Button>
      </template>
    </PageHeader>

    <div class="mb-6"><Tabs v-model="tab" :tabs="tabs" /></div>

    <div class="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Card class="p-5"><p class="text-muted-foreground text-sm">{{ t('sales.kpi.count') }}</p><p class="mt-1 text-2xl font-bold tabular-nums">{{ num(kpi.count) }}</p></Card>
      <Card class="p-5"><p class="text-muted-foreground text-sm">{{ t('sales.kpi.preTax') }}</p><p class="mt-1 text-2xl font-bold tabular-nums">{{ sar(kpi.preTax) }}</p></Card>
      <Card class="p-5"><p class="text-muted-foreground text-sm">{{ t('sales.kpi.vat') }}</p><p class="text-orange mt-1 text-2xl font-bold tabular-nums">{{ sar(kpi.vat) }}</p></Card>
      <Card class="p-5"><p class="text-muted-foreground text-sm">{{ t('sales.kpi.due') }}</p><p class="text-danger mt-1 text-2xl font-bold tabular-nums">{{ sar(kpi.due) }}</p></Card>
    </div>

    <!-- invoices -->
    <Card v-if="tab === 'invoices'" class="overflow-hidden">
      <DataTable
        :loading="loading" :rows="invoices" :empty="t('sales.empty')" :page-size="12"
        :columns="[
          { key: 'ref', label: t('common.ref'), sortable: true },
          { key: 'company', label: t('sales.contract'), sortable: true },
          { key: 'period', label: t('sales.period'), sortable: true },
          { key: 'date', label: t('sales.date'), hideBelow: 'md' },
          { key: 'orders', label: t('sales.orders'), align: 'end', hideBelow: 'lg' },
          { key: 'preTax', label: t('sales.preTax'), align: 'end', hideBelow: 'lg' },
          { key: 'vat', label: t('sales.vat', { rate: 15 }), align: 'end', hideBelow: 'sm' },
          { key: 'total', label: t('sales.total'), align: 'end', sortable: true },
          { key: 'status', label: t('sales.status') },
          { key: 'actions', label: t('common.actions'), align: 'end' },
        ]"
      >
        <template #cell-ref="{ row }">
          <span dir="ltr" class="font-medium tabular-nums">{{ row.ref }}</span>
          <p v-if="row.sheet" class="text-muted-foreground flex items-center gap-1 text-xs"><FileSpreadsheet class="size-3" /> {{ row.sheet }}</p>
        </template>
        <template #cell-period="{ row }"><span class="tabular-nums">{{ formatMonth(row.period + '-01') }}</span></template>
        <template #cell-date="{ row }"><span class="tabular-nums">{{ formatDate(row.date) }}</span></template>
        <template #cell-orders="{ row }"><span class="tabular-nums">{{ num(row.orders) }} × {{ sar(row.unitPrice) }}</span></template>
        <template #cell-preTax="{ row }"><span class="tabular-nums">{{ sar(row.preTax, { decimals: 2 }) }}</span></template>
        <template #cell-vat="{ row }"><span class="text-orange tabular-nums">{{ sar(row.vat, { decimals: 2 }) }}</span></template>
        <template #cell-total="{ row }"><span class="font-semibold tabular-nums">{{ sar(row.total, { decimals: 2 }) }}</span></template>
        <template #cell-status="{ row }">
          <Badge :variant="row.status === 'paid' ? 'success' : 'warning'">{{ t(`sales.statuses.${row.status}`) }}</Badge>
          <p v-if="row.receiptRef" class="text-muted-foreground mt-0.5 text-xs tabular-nums" dir="ltr">{{ row.receiptRef }}</p>
        </template>
        <template #cell-actions="{ row }">
          <Button v-if="row.status !== 'paid'" size="sm" variant="outline" @click="openPaid(row)"><CheckCircle2 /> {{ t('sales.markPaid') }}</Button>
          <span v-else class="text-muted-foreground text-xs tabular-nums">{{ formatDate(row.paidAt) }}</span>
        </template>
      </DataTable>
    </Card>

    <!-- output VAT -->
    <Card v-else class="overflow-hidden">
      <DataTable
        :loading="loading" :rows="vat.rows" :empty="t('sales.empty')"
        :columns="[
          { key: 'ref', label: t('common.ref'), sortable: true },
          { key: 'company', label: t('sales.contract'), sortable: true },
          { key: 'period', label: t('sales.period') },
          { key: 'preTax', label: t('sales.preTax'), align: 'end' },
          { key: 'vat', label: t('sales.vat', { rate: 15 }), align: 'end', sortable: true },
          { key: 'status', label: t('sales.status') },
        ]"
      >
        <template #cell-ref="{ row }"><span dir="ltr" class="tabular-nums">{{ row.ref }}</span></template>
        <template #cell-period="{ row }"><span class="tabular-nums">{{ formatMonth(row.period + '-01') }}</span></template>
        <template #cell-preTax="{ row }"><span class="tabular-nums">{{ sar(row.preTax, { decimals: 2 }) }}</span></template>
        <template #cell-vat="{ row }"><span class="text-orange font-semibold tabular-nums">{{ sar(row.vat, { decimals: 2 }) }}</span></template>
        <template #cell-status="{ row }"><Badge :variant="row.status === 'paid' ? 'success' : 'warning'">{{ t(`sales.statuses.${row.status}`) }}</Badge></template>
      </DataTable>
      <div class="bg-muted/40 flex flex-wrap items-center justify-between gap-3 border-t px-5 py-3 text-sm font-semibold">
        <span>{{ t('sales.kpi.vat') }}</span>
        <span class="text-orange tabular-nums">{{ sar(vat.totalVat, { decimals: 2 }) }}</span>
      </div>
    </Card>

    <SalesInvoiceDialog v-model:open="invoiceDialog" :contract-options="contractOptions" @saved="load" />

    <Dialog v-model:open="paidDialog" :title="t('sales.paidTitle')" :description="paying ? `${paying.ref} — ${paying.company}` : ''">
      <div class="space-y-4">
        <p class="bg-muted/40 flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold">
          <span>{{ t('sales.total') }}</span><span class="tabular-nums">{{ sar(paying?.total ?? 0, { decimals: 2 }) }}</span>
        </p>
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('sales.paidInto') }}</label>
          <Dropdown v-model="paidForm.treasuryId" :options="treasuryOptions" :invalid="!!paidError" />
          <p v-if="paidError" class="text-danger text-xs">{{ paidError }}</p>
        </div>
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('sales.paidDate') }}</label>
          <DatePicker v-model="paidForm.date" :clearable="false" />
        </div>
      </div>
      <template #footer>
        <Button variant="ghost" @click="paidDialog = false">{{ t('common.cancel') }}</Button>
        <Button :disabled="savingPaid" @click="confirmPaid">{{ t('common.confirm') }}</Button>
      </template>
    </Dialog>
  </div>
</template>
