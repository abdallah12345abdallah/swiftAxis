<script setup>
import MetricTile from '@/components/common/MetricTile.vue'
import { Package as MtPackage, Coins as MtCoins, Users as MtUsers, Gauge as MtGauge, Car as MtCar } from 'lucide-vue-next'
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouteTab } from '@/composables/useRouteTab'
import { Printer, BarChart3, Download, Trophy, CalendarDays } from 'lucide-vue-next'
import { Users as RpUsers, Car as RpCar, Scale as RpScale, TrendingDown as RpBelow, Award as RpAward, Sparkles as RpSparkles } from 'lucide-vue-next'
import { Progress } from '@/components/ui/progress'
import { useAuthStore } from '@/stores/auth'
import PageHeader from '@/components/common/PageHeader.vue'
import BrandLogo from '@/components/common/BrandLogo.vue'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Dropdown } from '@/components/ui/dropdown'
import { DateRangePicker } from '@/components/ui/datepicker'
import FilterBar from '@/components/common/FilterBar.vue'
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

const auth = useAuthStore()
// the last six months, shown by name; the report follows the picked month
const monthOptions = computed(() =>
  ['2026-07', '2026-06', '2026-05', '2026-04', '2026-03', '2026-02'].map((m) => ({ value: m, label: formatMonth(m + '-01'), icon: CalendarDays })),
)

async function generate() {
  loading.value = true
  report.value = await fetchReport({ month: month.value })
  loading.value = false
}
onMounted(generate)
watch(month, generate)

/* what the report highlights, and its totals */
const riderStatus = (r) => (r.orders === 0 ? 'inactive' : r.underperforming ? 'warning' : 'active')
const RIDER_BADGE = { active: 'success', warning: 'warning', inactive: 'secondary' }
const monthly = computed(() => {
  const r = report.value
  if (!r) return null
  const vehicles = r.vehicles ?? []
  return {
    topRider: r.comparison?.[0] ?? null,
    bestVehicle: [...vehicles].sort((a, b) => b.net - a.net)[0] ?? null,
    below: r.riders.filter((x) => x.underperforming).length,
    onTarget: r.riders.filter((x) => riderStatus(x) === 'active').length,
    riderTotals: { orders: r.riders.reduce((s, x) => s + x.orders, 0), goal: r.riders.reduce((s, x) => s + (x.goal || 0), 0), commission: r.riders.reduce((s, x) => s + x.commission, 0) },
    vehicleTotals: { revenue: vehicles.reduce((s, v) => s + v.revenue, 0), expenses: vehicles.reduce((s, v) => s + v.expenses, 0), net: vehicles.reduce((s, v) => s + v.net, 0) },
    margin: r.pnl.totalRevenue ? Math.round((r.pnl.net / r.pnl.totalRevenue) * 100) : 0,
  }
})
function exportMonthly() {
  if (!report.value) return
  exportCsv(
    `monthly-report-${month.value}`,
    [t('common.riderCode'), t('dashboard.table.rider'), t('dashboard.table.orders'), t('reports.monthly.goal'), t('dashboard.table.progress'), t('dashboard.table.commission')],
    report.value.riders.map((r) => [r.id, r.name, r.orders, r.goal, `${r.progress}%`, r.commission]),
  )
}

/* ── riders period report (#2) ──────────────────────────── */
const isoDay = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const from = ref(`${new Date().getFullYear()}-01-01`) // opens on the "this year" preset
const to = ref(isoDay(new Date()))

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

/* search by rider, plate or order number (a hit on an order number opens that
   rider's list with the number highlighted); vehicle, shift and activity in
   the tray. Cards, footer totals and the export follow what is shown. */
const periodQuery = ref('')
const periodFilters = ref({ vehicle: '', shift: '', activity: '' })
const periodFilterDefs = computed(() => [
  { key: 'vehicle', label: t('reports.period.vehicle'), options: [...new Set((period.value?.rows ?? []).map((r) => r.plate).filter(Boolean))].map((p) => ({ value: p, label: p })) },
  { key: 'shift', label: t('reports.period.shift'), options: Object.keys(SHIFTS).map((k) => ({ value: k, label: shiftLabel(k) })) },
  { key: 'activity', label: t('reports.period.activity'), options: [{ value: 'with', label: t('reports.period.withOrders') }, { value: 'without', label: t('reports.period.withoutOrders') }] },
])
const pq = computed(() => periodQuery.value.trim().toLowerCase())
const orderHit = (row, n) => !!pq.value && String(n).toLowerCase().includes(pq.value)
const rowOrderHit = (row) => !!pq.value && (row.orderNos ?? []).some((n) => orderHit(row, n))
const shownPeriod = computed(() => {
  const q = pq.value
  const f = periodFilters.value
  return (period.value?.rows ?? []).filter((r) =>
    (!q || [r.name, r.id, r.plate].some((v) => String(v ?? '').toLowerCase().includes(q)) || rowOrderHit(r)) &&
    (!f.vehicle || r.plate === f.vehicle) &&
    (!f.shift || r.shift === f.shift) &&
    (!f.activity || (f.activity === 'with') === r.orders > 0),
  )
})
const periodTotals = computed(() => ({
  orders: shownPeriod.value.reduce((s, r) => s + r.orders, 0),
  commission: shownPeriod.value.reduce((s, r) => s + r.commission, 0),
  vehicleExpenses: shownPeriod.value.reduce((s, r) => s + r.vehicleExpenses, 0),
  riders: shownPeriod.value.filter((r) => r.orders > 0).length,
  days: shownPeriod.value.reduce((s, r) => s + r.days, 0),
}))
// the period in words ("all periods" when no dates are set) and the print reference
const periodLabel = computed(() => (from.value || to.value ? `${from.value ? formatDate(from.value) : '…'} — ${to.value ? formatDate(to.value) : '…'}` : t('drp.allHint')))
const periodRef = computed(() => (from.value || to.value ? `RP-${(from.value || '0').replace(/-/g, '')}-${(to.value || '0').replace(/-/g, '')}` : 'RP-ALL'))

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
    shownPeriod.value.map((r) => [r.id, r.name, r.plate ?? '—', shiftLabel(r.shift), r.days, r.orders, (r.orderNos ?? []).join(' | '), r.commission, r.vehicleExpenses]),
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
          <Button variant="outline" :disabled="!report" @click="exportMonthly"><Download /> {{ t('common.export') }}</Button>
          <Button :disabled="!report" @click="printReport"><Printer /> {{ t('reports.print') }}</Button>
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


    <!-- ── MONTHLY REPORT ─────────────────────────────────── -->
    <template v-if="tab === 'monthly'">
      <!-- month picker (the report reloads when it changes) -->
      <FilterBar class="no-print mb-4">
        <template #extra><Dropdown v-model="month" :options="monthOptions" class="h-11 w-auto min-w-[200px] rounded-xl" /></template>
      </FilterBar>

      <!-- comparison chart (screen only) -->
      <Card v-if="report" class="no-print mb-6">
        <CardHeader>
          <CardTitle class="flex items-center gap-2"><BarChart3 class="text-primary size-4" /> {{ t('reports.comparisonTitle') }}</CardTitle>
        </CardHeader>
        <CardContent><RiderBarChart :riders="report.comparison" /></CardContent>
      </Card>

      <!-- the printable report -->
      <div v-if="report" class="print-area bg-card overflow-hidden rounded-2xl border transition-opacity" :class="loading && 'opacity-60'">
        <!-- letterhead -->
        <div class="rpt-head flex flex-wrap items-start justify-between gap-4 border-b px-6 py-6 sm:px-8">
          <div>
            <BrandLogo :mark-size="40" />
            <h2 class="mt-3 text-xl font-black tracking-tight">{{ t('reports.monthlyTitle') }}</h2>
            <p class="text-primary mt-0.5 text-sm font-bold">{{ formatMonth(month + '-01') }}</p>
          </div>
          <dl class="grid grid-cols-[auto_auto] gap-x-4 gap-y-1 text-sm">
            <dt class="text-muted-foreground">{{ t('reports.refNo') }}</dt><dd class="font-bold tabular-nums" dir="ltr">{{ report.refNo }}</dd>
            <dt class="text-muted-foreground">{{ t('reports.monthly.issued') }}</dt><dd class="tabular-nums">{{ formatDate(new Date()) }}</dd>
            <dt class="text-muted-foreground">{{ t('reports.monthly.preparedBy') }}</dt><dd>{{ auth.user?.name }}</dd>
          </dl>
        </div>

        <div class="space-y-8 p-6 sm:p-8">
          <!-- summary -->
          <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <MetricTile :label="t('reports.summary.orders')" :value="report.summary.orders" :format="(v) => num(Math.round(v))" :icon="MtPackage" tone="brand" />
            <MetricTile :label="t('reports.summary.commissions')" :value="report.summary.commissions" :format="sar" :icon="MtCoins" tone="orange" />
            <MetricTile :label="t('reports.summary.activeRiders')" :value="report.summary.activeRiders" :format="(v) => num(Math.round(v))" :icon="MtUsers" tone="success" />
            <MetricTile :label="t('reports.summary.avgOrders')" :value="report.summary.avgOrders" :format="(v) => num(Math.round(v))" :icon="MtGauge" tone="primary" />
          </div>

          <!-- highlights -->
          <section>
            <h3 class="rpt-title"><RpSparkles class="size-4" /> {{ t('reports.monthly.highlights') }}</h3>
            <div class="grid gap-3 sm:grid-cols-3">
              <div class="rpt-hl" style="--tone: var(--orange)">
                <span class="rpt-hl-ic"><RpAward class="size-5" /></span>
                <div class="min-w-0">
                  <p class="text-muted-foreground text-xs font-semibold">{{ t('reports.monthly.topRider') }}</p>
                  <p class="truncate font-bold">{{ monthly.topRider?.name ?? '—' }}</p>
                  <p v-if="monthly.topRider" class="text-muted-foreground text-xs tabular-nums">{{ t('reports.monthly.ordersN', { n: num(monthly.topRider.orders) }) }}</p>
                </div>
              </div>
              <div class="rpt-hl" style="--tone: var(--success)">
                <span class="rpt-hl-ic"><RpCar class="size-5" /></span>
                <div class="min-w-0">
                  <p class="text-muted-foreground text-xs font-semibold">{{ t('reports.monthly.bestVehicle') }}</p>
                  <p class="truncate font-bold" dir="ltr">{{ monthly.bestVehicle?.plate ?? '—' }}</p>
                  <p v-if="monthly.bestVehicle" class="text-muted-foreground text-xs tabular-nums">{{ t('reports.monthly.netN', { v: sar(monthly.bestVehicle.net) }) }}</p>
                </div>
              </div>
              <div class="rpt-hl" style="--tone: var(--danger)">
                <span class="rpt-hl-ic"><RpBelow class="size-5" /></span>
                <div class="min-w-0">
                  <p class="text-muted-foreground text-xs font-semibold">{{ t('reports.monthly.belowTarget') }}</p>
                  <p class="font-bold tabular-nums">{{ num(monthly.below) }}</p>
                  <p class="text-muted-foreground text-xs">{{ t('reports.monthly.onTargetN', { n: num(monthly.onTarget) }) }}</p>
                </div>
              </div>
            </div>
          </section>

          <!-- riders -->
          <section>
            <h3 class="rpt-title"><RpUsers class="size-4" /> {{ t('reports.ridersTitle') }}</h3>
            <div class="soft-table overflow-x-auto"><table class="w-full text-sm">
              <thead>
                <tr>
                  <th class="px-4 text-start">{{ t('dashboard.table.rider') }}</th>
                  <th class="px-4 text-end">{{ t('dashboard.table.orders') }}</th>
                  <th class="hidden px-4 text-start sm:table-cell">{{ t('dashboard.table.progress') }}</th>
                  <th class="px-4 text-start">{{ t('common.status') }}</th>
                  <th class="px-4 text-end">{{ t('dashboard.table.commission') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="r in report.riders" :key="r.id">
                  <td class="px-4 py-2.5"><button type="button" class="hover:text-primary flex items-center gap-2 text-start font-medium hover:underline" @click="openPanel(r.id)">{{ r.name }} <RiderCode :code="r.id" /></button></td>
                  <td class="px-4 py-2.5 text-end tabular-nums">{{ num(r.orders) }} <span class="text-muted-foreground text-xs">/ {{ num(r.goal) }}</span></td>
                  <td class="hidden px-4 py-2.5 sm:table-cell">
                    <div class="flex items-center gap-2">
                      <Progress :value="Math.min(100, r.progress)" class="w-24" :indicator-class="r.progress >= 100 ? 'bg-success' : r.underperforming ? 'bg-danger' : 'bg-primary'" />
                      <span class="text-muted-foreground w-10 text-xs tabular-nums">{{ r.progress }}%</span>
                    </div>
                  </td>
                  <td class="px-4 py-2.5"><Badge :variant="RIDER_BADGE[riderStatus(r)]">{{ t(`dashboard.status.${riderStatus(r)}`) }}</Badge></td>
                  <td class="px-4 py-2.5 text-end font-semibold tabular-nums">{{ sar(r.commission) }}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td class="px-4 py-2.5">{{ t('common.total') }}</td>
                  <td class="px-4 py-2.5 text-end tabular-nums">{{ num(monthly.riderTotals.orders) }} <span class="text-muted-foreground text-xs font-medium">/ {{ num(monthly.riderTotals.goal) }}</span></td>
                  <td class="hidden sm:table-cell" />
                  <td />
                  <td class="px-4 py-2.5 text-end tabular-nums">{{ sar(monthly.riderTotals.commission) }}</td>
                </tr>
              </tfoot>
            </table></div>
          </section>

          <!-- vehicles -->
          <section>
            <h3 class="rpt-title"><RpCar class="size-4" /> {{ t('reports.vehiclesTitle') }}</h3>
            <div class="soft-table overflow-x-auto"><table class="w-full text-sm">
              <thead>
                <tr>
                  <th class="px-4 text-start">{{ t('vehicles.prof.vehicle') }}</th>
                  <th class="px-4 text-end">{{ t('vehicles.prof.revenue') }}</th>
                  <th class="px-4 text-end">{{ t('vehicles.prof.expenses') }}</th>
                  <th class="px-4 text-end">{{ t('vehicles.prof.net') }}</th>
                  <th class="hidden px-4 text-end sm:table-cell">{{ t('vehicles.prof.margin') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="v in report.vehicles" :key="v.id">
                  <td class="px-4 py-2.5 font-medium" dir="ltr">{{ v.plate }}</td>
                  <td class="px-4 py-2.5 text-end tabular-nums">{{ sar(v.revenue) }}</td>
                  <td class="text-muted-foreground px-4 py-2.5 text-end tabular-nums">{{ sar(v.expenses) }}</td>
                  <td class="px-4 py-2.5 text-end font-semibold tabular-nums" :class="v.net >= 0 ? 'text-success' : 'text-danger'">{{ sar(v.net) }}</td>
                  <td class="hidden px-4 py-2.5 text-end tabular-nums sm:table-cell">{{ v.margin ?? 0 }}%</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td class="px-4 py-2.5">{{ t('common.total') }}</td>
                  <td class="px-4 py-2.5 text-end tabular-nums">{{ sar(monthly.vehicleTotals.revenue) }}</td>
                  <td class="px-4 py-2.5 text-end tabular-nums">{{ sar(monthly.vehicleTotals.expenses) }}</td>
                  <td class="px-4 py-2.5 text-end tabular-nums" :class="monthly.vehicleTotals.net >= 0 ? 'text-success' : 'text-danger'">{{ sar(monthly.vehicleTotals.net) }}</td>
                  <td class="hidden sm:table-cell" />
                </tr>
              </tfoot>
            </table></div>
          </section>

          <!-- profit & loss -->
          <section>
            <h3 class="rpt-title"><RpScale class="size-4" /> {{ t('reports.pnlTitle') }}</h3>
            <div class="grid gap-3 sm:grid-cols-3">
              <div class="rpt-pnl" style="--tone: var(--success)">
                <p class="text-muted-foreground text-xs font-semibold">{{ t('ledger.pnl.totalRevenue') }}</p>
                <p class="mt-1 text-xl font-black tabular-nums">{{ sar(report.pnl.totalRevenue) }}</p>
              </div>
              <div class="rpt-pnl" style="--tone: var(--danger)">
                <p class="text-muted-foreground text-xs font-semibold">{{ t('ledger.pnl.totalExpense') }}</p>
                <p class="mt-1 text-xl font-black tabular-nums">{{ sar(report.pnl.totalExpense) }}</p>
              </div>
              <div class="rpt-pnl is-net" :style="{ '--tone': report.pnl.net >= 0 ? 'var(--success)' : 'var(--danger)' }">
                <p class="text-xs font-semibold opacity-80">{{ t('ledger.pnl.net') }}</p>
                <p class="mt-1 text-xl font-black tabular-nums">{{ sar(report.pnl.net) }}</p>
                <p class="mt-1 text-xs opacity-80">{{ t('reports.monthly.marginN', { v: monthly.margin }) }}</p>
              </div>
            </div>
          </section>

          <!-- signatures -->
          <div class="grid grid-cols-2 gap-8 pt-6">
            <div class="text-center">
              <p class="mb-8 text-sm font-semibold">{{ auth.user?.name }}</p>
              <div class="bg-foreground/30 mx-auto h-px w-44" />
              <p class="text-muted-foreground mt-1 text-xs">{{ t('reports.monthly.preparedBy') }}</p>
            </div>
            <div class="text-center">
              <p class="mb-8 text-sm">&nbsp;</p>
              <div class="bg-foreground/30 mx-auto h-px w-44" />
              <p class="text-muted-foreground mt-1 text-xs">{{ t('reports.monthly.approvedBy') }}</p>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- ── RIDERS PERIOD REPORT (#2) ─────────────────────── -->
    <template v-else-if="tab === 'period'">
      <FilterBar v-model:search="periodQuery" v-model="periodFilters" :filters="periodFilterDefs" :search-placeholder="t('reports.period.searchPh')" class="no-print mb-4">
        <template #extra><DateRangePicker v-model="dateRange" /></template>
      </FilterBar>

      <!-- 2. the period at a glance -->
      <div v-if="period" class="no-print mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricTile :label="t('reports.period.orders')" :value="periodTotals.orders" :format="(v) => num(Math.round(v))" :icon="MtPackage" tone="brand" />
        <MetricTile :label="t('reports.period.commission')" :value="periodTotals.commission" :format="sar" :icon="MtCoins" tone="orange" />
        <MetricTile :label="t('reports.period.vehicleExpenses')" :value="periodTotals.vehicleExpenses" :format="sar" :icon="MtCar" tone="danger" />
        <MetricTile :label="t('reports.period.activeRiders')" :value="periodTotals.riders" :format="(v) => num(Math.round(v))" :icon="MtUsers" tone="success"
          :hint="t('reports.period.workDays', { n: num(periodTotals.days) })" />
      </div>

      <div class="print-area">
        <!-- 5. printed header, like the monthly report -->
        <div class="print-only mb-6 flex items-start justify-between gap-4 border-b pb-5">
          <div>
            <BrandLogo :mark-size="40" />
            <h2 class="mt-3 text-xl font-bold">{{ t('reports.period.title') }}</h2>
            <p class="text-muted-foreground text-sm tabular-nums" dir="ltr">{{ periodLabel }}</p>
          </div>
          <div class="text-end text-sm">
            <p class="text-muted-foreground">{{ t('reports.refNo') }}</p>
            <p class="font-bold tabular-nums" dir="ltr">{{ periodRef }}</p>
            <p class="text-muted-foreground mt-2">{{ formatDate(new Date()) }}</p>
          </div>
        </div>
        <Card class="overflow-hidden">
          <div class="border-b px-5 py-4">
            <h3 class="font-semibold">{{ t('reports.period.title') }}</h3>
            <p class="text-muted-foreground text-xs tabular-nums" dir="ltr">{{ periodLabel }}</p>
          </div>
          <DataTable
            :loading="periodLoading"
            :rows="shownPeriod"
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
                <div v-if="expandedOrders.has(row.id) || rowOrderHit(row)" class="flex max-w-[22rem] flex-wrap gap-1">
                  <Badge v-for="n in row.orderNos" :key="n" :variant="orderHit(row, n) ? 'default' : 'secondary'" class="font-mono text-[11px]" :class="orderHit(row, n) && 'ring-primary/40 ring-2'"><span dir="ltr">{{ n }}</span></Badge>
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
              <span>{{ t('reports.period.orders') }}: {{ num(periodTotals.orders) }}</span>
              <span>{{ t('reports.period.commission') }}: {{ sar(periodTotals.commission) }}</span>
              <span>{{ t('reports.period.vehicleExpenses') }}: {{ sar(periodTotals.vehicleExpenses) }}</span>
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

<style scoped>
/* letterhead: a soft brand wash behind the logo and the report's details */
.rpt-head { background: linear-gradient(120deg, color-mix(in srgb, var(--primary) 9%, var(--card)), color-mix(in srgb, var(--brand) 6%, var(--card)) 70%); }
.rpt-title { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem; font-weight: 800; }
.rpt-title :deep(svg) { color: var(--primary); }
/* highlight cards: tinted icon + text */
.rpt-hl { display: flex; align-items: center; gap: 0.75rem; border-radius: 1rem; padding: 0.9rem 1rem; background: color-mix(in srgb, var(--tone) 7%, var(--card)); border: 1px solid color-mix(in srgb, var(--tone) 20%, var(--border)); }
.rpt-hl-ic { display: grid; place-items: center; flex: none; width: 2.5rem; height: 2.5rem; border-radius: 0.75rem; color: var(--tone); background: color-mix(in srgb, var(--tone) 16%, var(--card)); }
/* P&L blocks; the net one is solid in its colour */
.rpt-pnl { border-radius: 1rem; padding: 1rem 1.1rem; border: 1px solid color-mix(in srgb, var(--tone) 22%, var(--border)); border-inline-start: 4px solid var(--tone); background: var(--card); }
.rpt-pnl.is-net { background: var(--tone); color: white; border-color: var(--tone); }
@media print { .rpt-head { background: none; } }
</style>
