<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { FileText, Printer, BarChart3 } from 'lucide-vue-next'
import PageHeader from '@/components/common/PageHeader.vue'
import BrandLogo from '@/components/common/BrandLogo.vue'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import RiderBarChart from '@/components/charts/RiderBarChart.vue'
import { useCurrency } from '@/composables/useCurrency'
import { useDate } from '@/lib/format'
import { printReport } from '@/lib/export'
import { fetchReport } from '@/api/reports'

const { t, locale } = useI18n()
const { sar, num } = useCurrency()
const { formatDate, formatMonth } = useDate()

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
</script>

<template>
  <div>
    <PageHeader :title="t('reports.title')" :subtitle="t('reports.subtitle')">
      <template #actions>
        <Select v-model="month" :options="monthOptions" class="w-auto min-w-[140px]" />
        <Button variant="outline" @click="generate"><FileText /> {{ t('reports.generate') }}</Button>
        <Button v-if="report" @click="printReport"><Printer /> {{ t('reports.print') }}</Button>
      </template>
    </PageHeader>

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
      <table class="mb-6 w-full text-sm">
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
            <td class="py-2">{{ r.name }}</td>
            <td class="py-2 text-end tabular-nums">{{ num(r.orders) }}</td>
            <td class="py-2 text-end tabular-nums">{{ r.progress }}%</td>
            <td class="py-2 text-end font-semibold tabular-nums">{{ sar(r.commission) }}</td>
          </tr>
        </tbody>
      </table>

      <!-- vehicles -->
      <h3 class="mb-2 font-semibold">{{ t('reports.vehiclesTitle') }}</h3>
      <table class="mb-6 w-full text-sm">
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
      </table>

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
  </div>
</template>
