<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouteTab } from '@/composables/useRouteTab'
import { FileText, Printer, BarChart3, Download, Trophy } from 'lucide-vue-next'
import PageHeader from '@/components/common/PageHeader.vue'
import BrandLogo from '@/components/common/BrandLogo.vue'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Tabs } from '@/components/ui/tabs'
import { Dropdown } from '@/components/ui/dropdown'
import { DatePicker } from '@/components/ui/datepicker'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/ui/table'
import RiderBarChart from '@/components/charts/RiderBarChart.vue'
import RiderCode from '@/components/common/RiderCode.vue'
import RiderSidePanel from '@/components/riders/RiderSidePanel.vue'
import { useCurrency } from '@/composables/useCurrency'
import { useDate } from '@/lib/format'
import { printReport, exportCsv, todayStamp } from '@/lib/export'
import { SHIFTS } from '@/api/fixtures'
import { fetchReport, fetchRidersPeriodReport, fetchBestRiders } from '@/api/reports'

const { t, locale } = useI18n()
const { sar, num } = useCurrency()
const { formatDate, formatMonth } = useDate()

const tab = useRouteTab('monthly')
const tabs = computed(() => [
  { value: 'monthly', label: t('reports.tabs.monthly') },
  { value: 'period', label: t('reports.tabs.period') },
  { value: 'best', label: t('reports.tabs.best') },
])

/* ── monthly report ─────────────────────────────────────── */
const month = ref('2026-07')
const loading = ref(false)
const report = ref(null)

const monthOptions = [
  { value: '2026-07', label: '2026-07' },
  { value: '2026-06', label: '2026-06' },
  { value: '2026-05', label: '2026-05' },
]

async function generate() {
  loading.value = true
  report.value = await fetchReport({ month: month.value })
  loading.value = false
}
onMounted(generate)

/* ── riders period report (#2) ──────────────────────────── */
const from = ref('2026-06-25')
const to = ref('2026-07-05')

/* one range control, two refs — the report queries stay as they were */
const dateRange = computed({
  get: () => [from.value, to.value],
  set: ([a, b]) => {
    from.value = a || ''
    to.value = b || ''
  },
})
const periodLoading = ref(false)
const period = ref(null)

async function loadPeriod() {
  periodLoading.value = true
  period.value = await fetchRidersPeriodReport({ from: from.value, to: to.value })
  periodLoading.value = false
}
watch([tab, from, to], () => {
  if (tab.value === 'period' && !periodLoading.value) loadPeriod()
})

const shiftLabel = (k) => (k ? SHIFTS[k]?.[locale.value] ?? SHIFTS[k]?.ar ?? k : '—')

/* rider side panel (#9) — opened from any rider name in the reports */
const panelOpen = ref(false)
const panelRider = ref('')
function openPanel(id) {
  panelRider.value = id
  panelOpen.value = true
}
/* order numbers per rider are collapsed until asked for */
const expandedOrders = ref(new Set())
function toggleOrders(id) {
  const s = new Set(expandedOrders.value)
  s.has(id) ? s.delete(id) : s.add(id)
  expandedOrders.value = s
}

function exportPeriod() {
  if (!period.value) return
  exportCsv(
    `riders-period-${todayStamp()}`,
    [t('common.riderCode'), t('reports.period.rider'), t('reports.period.vehicle'), t('reports.period.shift'), t('reports.period.days'), t('reports.period.orders'), t('reports.period.orderNos'), t('reports.period.commission'), t('reports.period.vehicleExpenses')],
    period.value.rows.map((r) => [r.id, r.name, r.plate ?? '—', shiftLabel(r.shift), r.days, r.orders, (r.orderNos ?? []).join(' | '), r.commission, r.vehicleExpenses]),
  )
}

/* ── best riders (#3) ───────────────────────────────────── */
const bestLoading = ref(false)
const best = ref([])

async function loadBest() {
  bestLoading.value = true
  best.value = await fetchBestRiders()
  bestLoading.value = false
}
watch(tab, (v) => {
  if (v === 'best' && !best.value.length) loadBest()
})

const RANK_CLASS = {
  1: 'bg-[#f5c518]/15 text-[#b8860b] ring-[#f5c518]/40',
  2: 'bg-muted-foreground/10 text-muted-foreground ring-muted-foreground/30',
  3: 'bg-orange/15 text-orange ring-orange/40',
}

function exportBest() {
  exportCsv(
    `best-riders-${todayStamp()}`,
    [t('reports.best.rank'), t('reports.period.rider'), t('reports.period.orders'), t('reports.best.extraAmount'), t('reports.best.achievedSalary')],
    best.value.map((r) => [r.rank, r.name, r.orders, r.extraAmount, r.total]),
  )
}
</script>

<template>
  <div>
    <PageHeader :title="t('reports.title')" :subtitle="t('reports.subtitle')">
      <template #actions>
        <template v-if="tab === 'monthly'">
          <Dropdown v-model="month" :options="monthOptions" class="w-auto min-w-[140px]" />
          <Button variant="outline" @click="generate"><FileText /> {{ t('reports.generate') }}</Button>
          <Button v-if="report" @click="printReport"><Printer /> {{ t('reports.print') }}</Button>
        </template>
        <template v-else-if="tab === 'period'">
          <Button variant="outline" @click="exportPeriod"><Download /> {{ t('common.export') }}</Button>
          <Button v-if="period" @click="printReport"><Printer /> {{ t('reports.print') }}</Button>
        </template>
        <template v-else>
          <Button variant="outline" @click="exportBest"><Download /> {{ t('common.export') }}</Button>
        </template>
      </template>
    </PageHeader>

    <!-- on desktop the sidebar lists these screens; the tabs are for phones -->
    <div class="mb-6 lg:hidden"><Tabs v-model="tab" :tabs="tabs" /></div>

    <!-- ── MONTHLY (existing report) ─────────────────────── -->
    <template v-if="tab === 'monthly'">
      <!-- comparison chart (screen only) -->
      <Card v-if="report" class="no-print mb-6">
        <CardHeader>
          <CardTitle class="flex items-center gap-2"><BarChart3 class="text-primary size-4" /> {{ t('reports.comparisonTitle') }}</CardTitle>
        </CardHeader>
        <CardContent><RiderBarChart :riders="report.comparison" /></CardContent>
      </Card>

      <!-- print-ready report -->
      <div v-if="report" class="print-area bg-card rounded-2xl border p-6 sm:p-8">
        <!-- header -->
        <div class="mb-6 flex items-start justify-between gap-4 border-b pb-5">
          <div>
            <BrandLogo :mark-size="40" />
            <h2 class="mt-3 text-xl font-bold">{{ t('reports.monthlyTitle') }}</h2>
            <p class="text-muted-foreground text-sm">{{ formatMonth(month + '-01') }}</p>
          </div>
          <div class="text-end text-sm">
            <p class="text-muted-foreground">{{ t('reports.refNo') }}</p>
            <p class="font-bold tabular-nums" dir="ltr">{{ report.refNo }}</p>
            <p class="text-muted-foreground mt-2">{{ formatDate(new Date()) }}</p>
          </div>
        </div>

        <!-- summary -->
        <div class="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div class="bg-muted/40 rounded-xl p-4"><p class="text-muted-foreground text-xs">{{ t('reports.summary.orders') }}</p><p class="mt-1 text-xl font-bold tabular-nums">{{ num(report.summary.orders) }}</p></div>
          <div class="bg-muted/40 rounded-xl p-4"><p class="text-muted-foreground text-xs">{{ t('reports.summary.commissions') }}</p><p class="mt-1 text-xl font-bold tabular-nums">{{ sar(report.summary.commissions) }}</p></div>
          <div class="bg-muted/40 rounded-xl p-4"><p class="text-muted-foreground text-xs">{{ t('reports.summary.activeRiders') }}</p><p class="mt-1 text-xl font-bold tabular-nums">{{ num(report.summary.activeRiders) }}</p></div>
          <div class="bg-muted/40 rounded-xl p-4"><p class="text-muted-foreground text-xs">{{ t('reports.summary.avgOrders') }}</p><p class="mt-1 text-xl font-bold tabular-nums">{{ num(report.summary.avgOrders) }}</p></div>
        </div>

        <!-- riders -->
        <h3 class="mb-2 font-semibold">{{ t('reports.ridersTitle') }}</h3>
        <div class="soft-table overflow-x-auto"><table class="mb-6 w-full text-sm">
          <thead class="text-muted-foreground border-b">
            <tr>
              <th class="py-2 text-start font-medium">{{ t('dashboard.table.rider') }}</th>
              <th class="py-2 text-end font-medium">{{ t('dashboard.table.orders') }}</th>
              <th class="py-2 text-end font-medium">{{ t('dashboard.table.progress') }}</th>
              <th class="py-2 text-end font-medium">{{ t('dashboard.table.commission') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in report.riders" :key="r.id" class="border-b last:border-0">
              <td class="py-2"><button type="button" class="hover:text-primary flex items-center gap-2 text-start hover:underline" @click="openPanel(r.id)">{{ r.name }} <RiderCode :code="r.id" /></button></td>
              <td class="py-2 text-end tabular-nums">{{ num(r.orders) }}</td>
              <td class="py-2 text-end tabular-nums">{{ r.progress }}%</td>
              <td class="py-2 text-end font-semibold tabular-nums">{{ sar(r.commission) }}</td>
            </tr>
          </tbody>
        </table></div>

        <!-- vehicles -->
        <h3 class="mb-2 font-semibold">{{ t('reports.vehiclesTitle') }}</h3>
        <div class="soft-table overflow-x-auto"><table class="mb-6 w-full text-sm">
          <thead class="text-muted-foreground border-b">
            <tr>
              <th class="py-2 text-start font-medium">{{ t('vehicles.prof.vehicle') }}</th>
              <th class="py-2 text-end font-medium">{{ t('vehicles.prof.revenue') }}</th>
              <th class="py-2 text-end font-medium">{{ t('vehicles.prof.expenses') }}</th>
              <th class="py-2 text-end font-medium">{{ t('vehicles.prof.net') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="v in report.vehicles" :key="v.id" class="border-b last:border-0">
              <td class="py-2" dir="ltr">{{ v.plate }}</td>
              <td class="py-2 text-end tabular-nums">{{ sar(v.revenue) }}</td>
              <td class="py-2 text-end tabular-nums">{{ sar(v.expenses) }}</td>
              <td class="py-2 text-end font-semibold tabular-nums">{{ sar(v.net) }}</td>
            </tr>
          </tbody>
        </table></div>

        <!-- P&L -->
        <h3 class="mb-2 font-semibold">{{ t('reports.pnlTitle') }}</h3>
        <div class="mb-8 flex flex-wrap gap-6 text-sm">
          <span>{{ t('ledger.pnl.totalRevenue') }}: <b class="tabular-nums">{{ sar(report.pnl.totalRevenue) }}</b></span>
          <span>{{ t('ledger.pnl.totalExpense') }}: <b class="tabular-nums">{{ sar(report.pnl.totalExpense) }}</b></span>
          <span>{{ t('ledger.pnl.net') }}: <b class="tabular-nums">{{ sar(report.pnl.net) }}</b></span>
        </div>

        <!-- signature -->
        <div class="mt-10 flex justify-end">
          <div class="text-center">
            <div class="h-px w-48 bg-foreground/40" />
            <p class="text-muted-foreground mt-1 text-xs">{{ t('reports.signature') }}</p>
          </div>
        </div>
      </div>
    </template>

    <!-- ── RIDERS PERIOD REPORT (#2) ─────────────────────── -->
    <template v-else-if="tab === 'period'">
      <div class="no-print mb-4 flex flex-wrap items-end gap-3">
        <div class="space-y-1.5">
          <label class="text-muted-foreground text-xs font-medium">{{ t('reports.period.range') }}</label>
          <DatePicker v-model="dateRange" range class="w-auto min-w-[240px]" />
        </div>
      </div>

      <div class="print-area">
        <Card class="overflow-hidden">
          <div class="border-b px-5 py-4">
            <h3 class="font-semibold">{{ t('reports.period.title') }}</h3>
            <p class="text-muted-foreground text-xs tabular-nums" dir="ltr">{{ formatDate(from) }} — {{ formatDate(to) }}</p>
          </div>
          <DataTable
            :loading="periodLoading"
            :rows="period?.rows ?? []"
            :empty="t('common.noData')"
            :columns="[
              { key: 'name', label: t('reports.period.rider'), sortable: true },
              { key: 'plate', label: t('reports.period.vehicle') },
              { key: 'shift', label: t('reports.period.shift') },
              { key: 'days', label: t('reports.period.days'), align: 'end', hideBelow: 'md' },
              { key: 'orders', label: t('reports.period.orders'), align: 'end', sortable: true },
              { key: 'orderNos', label: t('reports.period.orderNos'), hideBelow: 'lg' },
              { key: 'commission', label: t('reports.period.commission'), align: 'end', sortable: true },
              { key: 'vehicleExpenses', label: t('reports.period.vehicleExpenses'), align: 'end', sortable: true },
            ]"
          >
            <template #cell-name="{ row }">
              <button type="button" class="hover:text-primary flex items-center gap-2 text-start font-medium hover:underline" @click="openPanel(row.id)">{{ row.name }} <RiderCode :code="row.id" /></button>
            </template>
            <template #cell-orderNos="{ row }">
              <template v-if="row.orderNos?.length">
                <div v-if="expandedOrders.has(row.id)" class="flex max-w-[22rem] flex-wrap gap-1">
                  <Badge v-for="n in row.orderNos" :key="n" variant="secondary" class="font-mono text-[11px]"><span dir="ltr">{{ n }}</span></Badge>
                  <button type="button" class="text-primary text-xs hover:underline" @click="toggleOrders(row.id)">{{ t('common.hide') }}</button>
                </div>
                <button v-else type="button" class="text-primary text-xs hover:underline" @click="toggleOrders(row.id)">{{ t('reports.period.showOrders', { n: row.orderNos.length }) }}</button>
              </template>
              <span v-else class="text-muted-foreground text-xs">{{ t('reports.period.noOrderNos') }}</span>
            </template>
            <template #cell-plate="{ row }"><span dir="ltr">{{ row.plate ?? '—' }}</span></template>
            <template #cell-shift="{ row }">
              <Badge v-if="row.shift" variant="secondary">{{ shiftLabel(row.shift) }}</Badge>
              <span v-else class="text-muted-foreground">—</span>
            </template>
            <template #cell-days="{ row }"><span class="tabular-nums">{{ num(row.days) }}</span></template>
            <template #cell-orders="{ row }"><span class="font-medium tabular-nums">{{ num(row.orders) }}</span></template>
            <template #cell-commission="{ row }"><span class="font-semibold tabular-nums">{{ sar(row.commission) }}</span></template>
            <template #cell-vehicleExpenses="{ row }">
              <span class="tabular-nums">{{ sar(row.vehicleExpenses) }}</span>
              <span v-if="row.sharedVehicle" class="text-muted-foreground ms-1 text-xs">*</span>
            </template>
          </DataTable>
          <div v-if="period" class="bg-muted/40 flex flex-wrap items-center justify-between gap-3 border-t px-5 py-3 text-sm font-semibold">
            <span>{{ t('common.total') }}</span>
            <div class="flex flex-wrap gap-6 tabular-nums">
              <span>{{ t('reports.period.orders') }}: {{ num(period.totals.orders) }}</span>
              <span>{{ t('reports.period.commission') }}: {{ sar(period.totals.commission) }}</span>
              <span>{{ t('reports.period.vehicleExpenses') }}: {{ sar(period.totals.vehicleExpenses) }}</span>
            </div>
          </div>
        </Card>
        <p class="text-muted-foreground mt-2 text-xs">* {{ t('reports.period.sharedNote') }}</p>
      </div>
    </template>

    <!-- ── BEST RIDERS (#3) ──────────────────────────────── -->
    <template v-else>
      <Card class="no-print mb-6">
        <CardHeader>
          <CardTitle class="flex items-center gap-2"><Trophy class="text-orange size-4" /> {{ t('reports.best.title') }}</CardTitle>
        </CardHeader>
        <CardContent><RiderBarChart :riders="best" /></CardContent>
      </Card>

      <Card class="overflow-hidden">
        <DataTable
          :loading="bestLoading"
          :rows="best"
          :empty="t('common.noData')"
          :columns="[
            { key: 'rank', label: t('reports.best.rank') },
            { key: 'name', label: t('reports.period.rider'), sortable: true },
            { key: 'orders', label: t('reports.period.orders'), align: 'end', sortable: true },
            { key: 'extraAmount', label: t('reports.best.extraAmount'), align: 'end', sortable: true },
            { key: 'total', label: t('reports.best.achievedSalary'), align: 'end', sortable: true },
          ]"
        >
          <template #cell-rank="{ row }">
            <span class="grid size-8 place-items-center rounded-full text-sm font-bold ring-1" :class="RANK_CLASS[row.rank] ?? 'bg-muted text-muted-foreground ring-transparent'">
              {{ row.rank }}
            </span>
          </template>
          <template #cell-name="{ row }">
            <button type="button" class="hover:text-primary flex items-center gap-2 text-start font-medium hover:underline" @click="openPanel(row.id)">{{ row.name }} <RiderCode :code="row.id" /></button>
          </template>
          <template #cell-orders="{ row }"><span class="font-medium tabular-nums">{{ num(row.orders) }}</span></template>
          <template #cell-extraAmount="{ row }"><span class="tabular-nums">{{ sar(row.extraAmount) }}</span></template>
          <template #cell-total="{ row }"><span class="font-semibold tabular-nums">{{ sar(row.total) }}</span></template>
        </DataTable>
      </Card>
    </template>

    <RiderSidePanel v-model:open="panelOpen" :rider-id="panelRider" />
  </div>
</template>
