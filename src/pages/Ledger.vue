<script setup>
import EmptyState from '@/components/common/EmptyState.vue'
import MetricTile from '@/components/common/MetricTile.vue'
import { TrendingUp as MtTrendingUp, TrendingDown as MtTrendingDown } from 'lucide-vue-next'
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import ActionMenu from '@/components/common/ActionMenu.vue'
import { useRouteTab } from '@/composables/useRouteTab'
import { Plus, Download, Pencil, ExternalLink } from 'lucide-vue-next'
import PageHeader from '@/components/common/PageHeader.vue'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { DataTable } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { DateRangePicker } from '@/components/ui/datepicker'
import FilterBar from '@/components/common/FilterBar.vue'
import CostCenterDialog from '@/components/ledger/CostCenterDialog.vue'
import { useCurrency } from '@/composables/useCurrency'
import { useDate } from '@/lib/format'
import { exportCsv, todayStamp } from '@/lib/export'
import {
  fetchJournal, fetchAccounts, trialBalance, profitAndLoss,
  costCenterReport, fetchCostCenters, accountById,
} from '@/api/ledger'

const { t, locale } = useI18n()
const { sar } = useCurrency()
const { formatDate } = useDate()

const tab = useRouteTab('journal')
const loading = ref(true)

const journal = ref([])
const accounts = ref([])
const trial = ref({ rows: [], totalDebit: 0, totalCredit: 0 })
const pnl = ref({ revenue: [], expenses: [], totalRevenue: 0, totalExpense: 0, net: 0 })
const centers = ref([])
const ccReport = ref([])

const from = ref('')
const to = ref('')

/* one range control, two refs — the filters below stay as they were */
const dateRange = computed({
  get: () => [from.value, to.value],
  set: ([a, b]) => {
    from.value = a || ''
    to.value = b || ''
  },
})
const filterCenter = ref('')
const ledgerFilters = computed({
  get: () => ({ center: filterCenter.value }),
  set: (v) => (filterCenter.value = v.center ?? ''),
})

const ccDialog = ref(false)
const editingCenter = ref(null)

const accName = (id) => {
  const a = accountById(id)
  return a ? (locale.value === 'ar' ? a.name : a.en) : id
}
const ccName = (id) => centers.value.find((c) => c.id === id)?.name ?? '—'

const costCenterOptions = computed(() => centers.value.map((c) => ({ value: c.id, label: c.name })))
const centerFilterOptions = computed(() => [{ value: '', label: t('ledger.allCenters') }, ...costCenterOptions.value])

const tabs = computed(() => [
  { value: 'journal', label: t('ledger.tabs.journal') },
  { value: 'trial', label: t('ledger.tabs.trial') },
  { value: 'pnl', label: t('ledger.tabs.pnl') },
  { value: 'costCenters', label: t('ledger.tabs.costCenters') },
])

async function load() {
  loading.value = true
  const filters = { from: from.value || undefined, to: to.value || undefined, costCenter: filterCenter.value || undefined }
  ;[journal.value, accounts.value, trial.value, pnl.value, centers.value, ccReport.value] = await Promise.all([
    fetchJournal(filters),
    fetchAccounts(),
    trialBalance(filters),
    profitAndLoss(filters),
    fetchCostCenters(),
    costCenterReport(filters),
  ])
  loading.value = false
}
onMounted(load)
watch([from, to, filterCenter], load)

function openAddCenter() {
  editingCenter.value = null
  ccDialog.value = true
}
function openEditCenter(c) {
  editingCenter.value = c
  ccDialog.value = true
}

function exportTrial() {
  exportCsv(
    `trial-balance-${todayStamp()}`,
    [t('ledger.account'), t('ledger.debit'), t('ledger.credit'), t('ledger.balance')],
    trial.value.rows.map((r) => [locale.value === 'ar' ? r.name : r.en, r.debit, r.credit, r.balance]),
  )
}
</script>

<template>
  <div>
    <PageHeader :title="t('ledger.title')" :subtitle="t('ledger.subtitle')">
      <template #actions>
        <Button v-if="tab === 'journal'" as="RouterLink" to="/ledger/entry"><Plus /> {{ t('ledger.newEntry') }}</Button>
        <Button v-else-if="tab === 'trial'" variant="outline" @click="exportTrial"><Download /> {{ t('common.export') }}</Button>
        <Button v-else-if="tab === 'costCenters'" @click="openAddCenter"><Plus /> {{ t('ledger.cc.add') }}</Button>
      </template>
    </PageHeader>

    <div class="mb-6 space-y-3">
      <FilterBar v-model="ledgerFilters" :filters="[{ key: 'center', label: t('ledger.cc.name'), options: centerFilterOptions }]">
        <template #extra><DateRangePicker v-model="dateRange" /></template>
      </FilterBar>
    </div>

    <!-- Journal -->
    <div v-if="tab === 'journal'" class="space-y-4">
      <Card v-if="!loading && !journal.length"><EmptyState :title="t('ledger.empty')" /></Card>
      <Card v-for="e in journal" :key="e.id" class="p-5">
        <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div class="flex items-center gap-2">
            <RouterLink :to="`/ledger/entry/${e.id}`" class="hover:text-primary inline-flex items-center gap-1 font-bold tabular-nums hover:underline" dir="ltr">
              {{ e.ref }} <ExternalLink class="size-3.5" />
            </RouterLink>
            <Badge variant="secondary">{{ e.source }}</Badge>
            <Badge v-if="e.voided" variant="danger">{{ t('journal.voidedBadge') }}</Badge>
            <span v-if="e.serial" class="text-muted-foreground text-xs tabular-nums">#{{ e.serial }}</span>
          </div>
          <span class="text-muted-foreground text-sm tabular-nums">{{ formatDate(e.date) }}</span>
        </div>
        <p v-if="e.description" class="text-muted-foreground mb-3 text-sm">{{ e.description }}</p>
        <div class="soft-table overflow-x-auto"><table class="w-full text-sm">
          <tbody>
            <tr v-for="(l, i) in e.lines" :key="i" class="border-t first:border-0">
              <td class="py-2">{{ accName(l.account) }}<span v-if="l.description" class="text-muted-foreground ms-2 text-xs">{{ l.description }}</span></td>
              <td class="text-muted-foreground py-2 text-xs">{{ ccName(l.costCenter) }}</td>
              <td class="py-2 text-end tabular-nums">{{ l.debit ? sar(l.debit) : '' }}</td>
              <td class="py-2 text-end tabular-nums">{{ l.credit ? sar(l.credit) : '' }}</td>
            </tr>
          </tbody>
        </table></div>
      </Card>
    </div>

    <!-- Trial balance -->
    <Card v-else-if="tab === 'trial'" class="overflow-hidden">
      <DataTable
        :loading="loading"
        :rows="trial.rows"
        :empty="t('ledger.empty')"
        :columns="[
          { key: 'name', label: t('ledger.account'), sortable: true },
          { key: 'debit', label: t('ledger.debit'), align: 'end', sortable: true },
          { key: 'credit', label: t('ledger.credit'), align: 'end', sortable: true },
          { key: 'balance', label: t('ledger.balance'), align: 'end', sortable: true },
        ]"
      >
        <template #cell-name="{ row }">{{ locale === 'ar' ? row.name : row.en }}</template>
        <template #cell-debit="{ row }"><span class="tabular-nums">{{ row.debit ? sar(row.debit) : '—' }}</span></template>
        <template #cell-credit="{ row }"><span class="tabular-nums">{{ row.credit ? sar(row.credit) : '—' }}</span></template>
        <template #cell-balance="{ row }"><span class="font-semibold tabular-nums">{{ sar(row.balance) }}</span></template>
      </DataTable>
      <div class="bg-muted/40 flex items-center justify-between border-t px-5 py-3 text-sm font-semibold">
        <span>{{ t('common.total') }}</span>
        <span class="flex gap-8 tabular-nums">
          <span>{{ sar(trial.totalDebit) }}</span>
          <span>{{ sar(trial.totalCredit) }}</span>
        </span>
      </div>
    </Card>

    <!-- P&L -->
    <div v-else-if="tab === 'pnl'" class="grid gap-6 lg:grid-cols-3">
      <Card class="lg:col-span-2">
        <CardHeader><CardTitle>{{ t('ledger.tabs.pnl') }}</CardTitle></CardHeader>
        <CardContent class="space-y-4">
          <div>
            <p class="text-muted-foreground mb-2 text-xs font-semibold uppercase">{{ t('ledger.pnl.revenue') }}</p>
            <div v-for="r in pnl.revenue" :key="r.id" class="flex justify-between py-1 text-sm">
              <span>{{ locale === 'ar' ? r.name : r.en }}</span><span class="tabular-nums">{{ sar(r.amount) }}</span>
            </div>
            <p v-if="!pnl.revenue.length" class="text-muted-foreground text-sm">{{ t('common.none') }}</p>
          </div>
          <div>
            <p class="text-muted-foreground mb-2 text-xs font-semibold uppercase">{{ t('ledger.pnl.expenses') }}</p>
            <div v-for="r in pnl.expenses" :key="r.id" class="flex justify-between py-1 text-sm">
              <span>{{ locale === 'ar' ? r.name : r.en }}</span><span class="tabular-nums">{{ sar(r.amount) }}</span>
            </div>
          </div>
        </CardContent>
      </Card>
      <div class="space-y-4">
        <MetricTile :label="t('ledger.pnl.totalRevenue')" :value="pnl.totalRevenue" :format="sar" :icon="MtTrendingUp" tone="success" />
        <MetricTile :label="t('ledger.pnl.totalExpense')" :value="pnl.totalExpense" :format="sar" :icon="MtTrendingDown" tone="danger" />
        <Card class="bg-navy p-5 text-white"><p class="text-sm text-white/70">{{ t('ledger.pnl.net') }}</p><p class="mt-1 text-3xl font-extrabold tabular-nums">{{ sar(pnl.net) }}</p></Card>
      </div>
    </div>

    <!-- Cost centers -->
    <Card v-else class="overflow-hidden">
      <DataTable
        :loading="loading"
        :rows="ccReport"
        :empty="t('common.noData')"
        :columns="[
          { key: 'name', label: t('ledger.cc.name'), sortable: true },
          { key: 'budget', label: t('ledger.cc.budget'), align: 'end', sortable: true },
          { key: 'actual', label: t('ledger.cc.actual'), align: 'end', sortable: true },
          { key: 'variance', label: t('ledger.cc.variance'), align: 'end', sortable: true },
          { key: 'actions', label: t('common.actions'), align: 'end' },
        ]"
      >
        <template #cell-budget="{ row }"><span class="tabular-nums">{{ sar(row.budget) }}</span></template>
        <template #cell-actual="{ row }">
          <div class="flex items-center justify-end gap-2">
            <Progress :value="row.budget ? (row.actual / row.budget) * 100 : 0" class="w-20" :indicator-class="row.over ? 'bg-danger' : 'bg-primary'" />
            <span class="tabular-nums">{{ sar(row.actual) }}</span>
          </div>
        </template>
        <template #cell-variance="{ row }">
          <span class="font-semibold tabular-nums" :class="row.over ? 'text-danger' : 'text-success'">{{ sar(row.variance) }}</span>
        </template>
        <template #cell-actions="{ row }">
          <ActionMenu :items="[
                    { label: t('common.edit'), icon: Pencil, tone: 'blue', onSelect: () => openEditCenter(centers.find((c) => c.id === row.id)) },
                  ]" />
        </template>
      </DataTable>
    </Card>

    <CostCenterDialog v-model:open="ccDialog" :center="editingCenter" @saved="load" />
  </div>
</template>
