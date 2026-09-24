<script setup>
import EmptyState from '@/components/common/EmptyState.vue'
import MetricTile from '@/components/common/MetricTile.vue'
import { TrendingUp as MtTrendingUp, TrendingDown as MtTrendingDown } from 'lucide-vue-next'
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import ActionMenu from '@/components/common/ActionMenu.vue'
import { useRouteTab } from '@/composables/useRouteTab'
import {
  Plus, Download, Pencil, BookOpen, Coins, PenLine, Ban, ChevronLeft,
  ArrowDownLeft, ArrowUpRight, AlertTriangle, Scale, ListTree, Check, Wallet, Percent,
} from 'lucide-vue-next'
import { Skeleton } from '@/components/ui/skeleton'
import PageHeader from '@/components/common/PageHeader.vue'
import { Card } from '@/components/ui/card'
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

const { t, te, locale } = useI18n()
const { sar, num } = useCurrency()
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
const accCode = (id) => accountById(id)?.code ?? ''
const sourceLabel = (s) => (te(`ledger.sources.${s}`) ? t(`ledger.sources.${s}`) : s)

/* journal: search by ref, serial, statement or account, then group by month */
const query = ref('')
const shownJournal = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return journal.value
  return journal.value.filter((e) =>
    [e.ref, String(e.serial ?? ''), e.description, ...e.lines.flatMap((l) => [accName(l.account), accCode(l.account), l.description])]
      .some((v) => v && String(v).toLowerCase().includes(q)),
  )
})
const journalGroups = computed(() => {
  const groups = []
  shownJournal.value.forEach((e) => {
    const key = e.date.slice(0, 7)
    let g = groups.at(-1)
    if (!g || g.key !== key) groups.push((g = { key, label: formatDate(`${key}-01`, { year: 'numeric', month: 'long' }), entries: [], total: 0 }))
    g.entries.push(e)
    if (!e.voided) g.total += e.total
  })
  return groups
})
/* trial balance: search + one account type at a time, grouped by type */
const TYPE_ORDER = ['asset', 'liability', 'equity', 'revenue', 'expense']
const trialType = ref('')
const trialDiff = computed(() => Math.round((trial.value.totalDebit - trial.value.totalCredit) * 100) / 100)
const searchedTrial = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return trial.value.rows
  return trial.value.rows.filter((r) => [r.code, r.name, r.en].some((v) => v && v.toLowerCase().includes(q)))
})
const trialTypes = computed(() => [
  { value: '', label: t('common.all'), count: searchedTrial.value.length },
  ...TYPE_ORDER.map((ty) => ({ value: ty, label: t(`accounting.types.${ty}`), count: searchedTrial.value.filter((r) => r.type === ty).length })).filter((x) => x.count),
])
const shownTrial = computed(() => searchedTrial.value.filter((r) => !trialType.value || r.type === trialType.value))
const trialGroups = computed(() =>
  TYPE_ORDER.map((type) => {
    const rows = shownTrial.value.filter((r) => r.type === type).sort((a, b) => a.code.localeCompare(b.code))
    return { type, rows, debit: rows.reduce((s, r) => s + r.debit, 0), credit: rows.reduce((s, r) => s + r.credit, 0) }
  }).filter((g) => g.rows.length),
)
const shownTrialTotals = computed(() => ({
  debit: shownTrial.value.reduce((s, r) => s + r.debit, 0),
  credit: shownTrial.value.reduce((s, r) => s + r.credit, 0),
}))
const maxBalance = computed(() => Math.max(1, ...shownTrial.value.map((r) => Math.abs(r.balance))))
const barWidth = (b) => Math.max(4, Math.round((Math.abs(b) / maxBalance.value) * 100))

/* profit & loss */
const pct = (v) => `${num(v, { decimals: 1 })}%`
const share = (a, total) => (total > 0 ? Math.max(0, Math.round((a / total) * 1000) / 10) : 0)
const margin = computed(() => (pnl.value.totalRevenue > 0 ? Math.round((pnl.value.net / pnl.value.totalRevenue) * 1000) / 10 : 0))
const byAmount = (rows) => [...rows].sort((a, b) => b.amount - a.amount)
const pnlSections = computed(() => [
  { key: 'revenue', title: t('ledger.pnl.revenue'), icon: MtTrendingUp, rows: byAmount(pnl.value.revenue), total: pnl.value.totalRevenue, totalLabel: t('ledger.pnl.totalRevenue') },
  { key: 'expense', title: t('ledger.pnl.expenses'), icon: MtTrendingDown, rows: byAmount(pnl.value.expenses), total: pnl.value.totalExpense, totalLabel: t('ledger.pnl.totalExpense') },
])
// each expense (top 4, the rest together) and the profit, as a share of revenue
const SPLIT_TONES = [100, 78, 58, 42, 28].map((p) => `color-mix(in srgb, var(--danger) ${p}%, var(--card))`)
const revenueSplit = computed(() => {
  const { totalRevenue, totalExpense, net } = pnl.value
  const base = Math.max(totalRevenue, totalExpense)
  if (base <= 0) return []
  const exp = byAmount(pnl.value.expenses).filter((r) => r.amount > 0)
  const top = exp.slice(0, 4).map((r) => ({ id: r.id, label: locale.value === 'ar' ? r.name : r.en, amount: r.amount }))
  const rest = exp.slice(4).reduce((s, r) => s + r.amount, 0)
  if (rest) top.push({ id: '_rest', label: t('ledger.pnl.otherExpenses'), amount: rest })
  const parts = top.map((p, i) => ({ ...p, color: SPLIT_TONES[i] }))
  if (net > 0) parts.push({ id: '_net', label: t('ledger.pnl.net'), amount: net, color: 'var(--success)' })
  return parts.map((p) => ({ ...p, pct: share(p.amount, base) }))
})

const stats = computed(() => {
  const live = shownJournal.value.filter((e) => !e.voided)
  return {
    count: live.length,
    amount: live.reduce((s, e) => s + e.total, 0),
    manual: live.filter((e) => e.source === 'manual').length,
    voided: shownJournal.value.length - live.length,
  }
})

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
      <FilterBar
        v-model="ledgerFilters"
        :search="tab === 'journal' || tab === 'trial' ? query : undefined"
        :search-placeholder="tab === 'trial' ? t('ledger.trial.searchPh') : t('ledger.searchPh')"
        :filters="[{ key: 'center', label: t('ledger.cc.name'), options: centerFilterOptions }]"
        @update:search="query = $event"
      >
        <template #extra><DateRangePicker v-model="dateRange" /></template>
      </FilterBar>
    </div>

    <!-- Journal -->
    <div v-if="tab === 'journal'" class="space-y-6">
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricTile :label="t('ledger.stats.entries')" :value="stats.count" :format="num" :icon="BookOpen" tone="primary" />
        <MetricTile :label="t('ledger.stats.amount')" :value="stats.amount" :format="sar" :icon="Coins" tone="brand" />
        <MetricTile :label="t('ledger.stats.manual')" :value="stats.manual" :format="num" :icon="PenLine" tone="success" />
        <MetricTile :label="t('ledger.stats.voided')" :value="stats.voided" :format="num" :icon="Ban" tone="danger" />
      </div>

      <div v-if="loading" class="space-y-3">
        <Skeleton v-for="i in 3" :key="i" class="h-40 rounded-2xl" />
      </div>
      <Card v-else-if="!shownJournal.length"><EmptyState :title="t('ledger.empty')" /></Card>

      <!-- entries grouped by month, newest first -->
      <template v-else>
      <section v-for="g in journalGroups" :key="g.key" class="space-y-3">
        <header class="jl-month">
          <h3>{{ g.label }}</h3>
          <span class="jl-month-line" />
          <span class="jl-month-sum">{{ t('ledger.monthSummary', { n: num(g.entries.length), amount: sar(g.total) }) }}</span>
        </header>

        <RouterLink
          v-for="(e, i) in g.entries"
          :key="e.id"
          :to="`/ledger/entry/${e.id}`"
          class="jl-card"
          :class="e.voided && 'is-voided'"
          :style="{ '--d': `${Math.min(i, 8) * 40}ms` }"
        >
          <div class="jl-top">
            <!-- date tile -->
            <div class="jl-date">
              <b>{{ formatDate(e.date, { day: 'numeric' }) }}</b>
              <span>{{ formatDate(e.date, { month: 'short' }) }}</span>
            </div>

            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-center gap-2">
                <span class="jl-ref" dir="ltr">{{ e.ref }}</span>
                <span v-if="e.serial" class="text-muted-foreground text-xs tabular-nums">#{{ e.serial }}</span>
                <span class="jl-tag">{{ e.docTypeName }}</span>
                <span class="jl-tag" :class="e.source === 'manual' && 'is-manual'">{{ sourceLabel(e.source) }}</span>
                <Badge v-if="e.voided" variant="danger"><Ban class="size-3" /> {{ t('journal.voidedBadge') }}</Badge>
              </div>
              <p class="jl-desc">{{ e.description || '—' }}</p>
            </div>

            <div class="jl-amount">
              <b dir="ltr">{{ sar(e.total) }}</b>
              <span>{{ t('ledger.linesN', { n: num(e.lines.length) }) }}</span>
            </div>
            <span class="jl-go" :title="t('ledger.open')"><ChevronLeft class="size-4 ltr:rotate-180" /></span>
          </div>

          <!-- the lines: debit in blue, credit in orange -->
          <div class="jl-lines">
            <div v-for="(l, li) in e.lines" :key="li" class="jl-line">
              <i class="jl-side" :class="l.debit ? 'is-dr' : 'is-cr'" />
              <span class="min-w-0 truncate">
                <b class="jl-code" dir="ltr">{{ accCode(l.account) }}</b>
                {{ accName(l.account) }}
                <small v-if="l.description" class="text-muted-foreground ms-1">— {{ l.description }}</small>
              </span>
              <span class="text-muted-foreground truncate text-xs">{{ l.costCenter ? ccName(l.costCenter) : '' }}</span>
              <span class="jl-num is-dr" dir="ltr">{{ l.debit ? sar(l.debit) : '' }}</span>
              <span class="jl-num is-cr" dir="ltr">{{ l.credit ? sar(l.credit) : '' }}</span>
            </div>
          </div>
        </RouterLink>
      </section>
      </template>
    </div>

    <!-- Trial balance -->
    <div v-else-if="tab === 'trial'" class="space-y-6">
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricTile :label="t('ledger.totalDebit')" :value="trial.totalDebit" :format="sar" :icon="ArrowDownLeft" tone="brand" />
        <MetricTile :label="t('ledger.totalCredit')" :value="trial.totalCredit" :format="sar" :icon="ArrowUpRight" tone="orange" />
        <MetricTile
          :label="t('ledger.trial.difference')"
          :value="Math.abs(trialDiff)"
          :format="sar"
          :icon="trialDiff ? AlertTriangle : Scale"
          :tone="trialDiff ? 'danger' : 'success'"
          :hint="trialDiff ? t('ledger.trial.unbalanced') : t('ledger.trial.balanced')"
        />
        <MetricTile :label="t('ledger.trial.accounts')" :value="trial.rows.length" :format="num" :icon="ListTree" tone="primary" />
      </div>

      <!-- account type switch: all, or one type at a time -->
      <div class="tb-types" role="tablist">
        <button
          v-for="ty in trialTypes"
          :key="ty.value"
          type="button"
          role="tab"
          class="tb-type"
          :class="trialType === ty.value && 'is-on'"
          :aria-selected="trialType === ty.value"
          @click="trialType = ty.value"
        >
          <i v-if="ty.value" class="tb-dot" :class="`t-${ty.value}`" />
          {{ ty.label }}
          <span class="tb-count">{{ num(ty.count) }}</span>
        </button>
      </div>

      <div v-if="loading" class="space-y-2">
        <Skeleton v-for="i in 6" :key="i" class="h-12 rounded-xl" />
      </div>
      <Card v-else-if="!trialGroups.length"><EmptyState :title="t('ledger.empty')" /></Card>

      <div v-else class="soft-table overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr>
              <th class="w-28 px-4 text-start">{{ t('ledger.trial.code') }}</th>
              <th class="min-w-[220px] px-4 text-start">{{ t('ledger.account') }}</th>
              <th class="w-40 px-4 text-end">{{ t('ledger.debit') }}</th>
              <th class="w-40 px-4 text-end">{{ t('ledger.credit') }}</th>
              <th class="min-w-[220px] px-4 text-end">{{ t('ledger.balance') }}</th>
            </tr>
          </thead>
          <tbody v-for="g in trialGroups" :key="g.type">
            <!-- type heading with its subtotal -->
            <tr class="tb-group">
              <td colspan="2" class="px-3 pt-3 pb-1">
                <span class="tb-group-name"><i class="tb-dot" :class="`t-${g.type}`" />{{ t(`accounting.types.${g.type}`) }}</span>
              </td>
              <td class="px-4 pt-3 pb-1 text-end tabular-nums" dir="ltr">{{ sar(g.debit) }}</td>
              <td class="px-4 pt-3 pb-1 text-end tabular-nums" dir="ltr">{{ sar(g.credit) }}</td>
              <td class="px-4 pt-3 pb-1 text-end tabular-nums" dir="ltr">{{ sar(Math.abs(g.debit - g.credit)) }}</td>
            </tr>
            <tr v-for="r in g.rows" :key="r.id">
              <td class="px-4 py-3"><span class="tb-code" dir="ltr">{{ r.code }}</span></td>
              <td class="px-4 py-3 font-semibold">{{ locale === 'ar' ? r.name : r.en }}</td>
              <td class="px-4 py-3 text-end tabular-nums" :class="r.debit ? 'tb-dr' : 'text-muted-foreground'" dir="ltr">{{ r.debit ? sar(r.debit) : '—' }}</td>
              <td class="px-4 py-3 text-end tabular-nums" :class="r.credit ? 'tb-cr' : 'text-muted-foreground'" dir="ltr">{{ r.credit ? sar(r.credit) : '—' }}</td>
              <td class="px-4 py-3">
                <!-- balance: amount + its side, and a bar sized against the largest balance -->
                <div class="flex items-center justify-end gap-3">
                  <span class="tb-bar"><i :class="r.balance >= 0 ? 'is-dr' : 'is-cr'" :style="{ width: `${barWidth(r.balance)}%` }" /></span>
                  <span class="font-bold tabular-nums" dir="ltr">{{ sar(Math.abs(r.balance)) }}</span>
                  <span class="tb-side" :class="r.balance >= 0 ? 'is-dr' : 'is-cr'">{{ r.balance >= 0 ? t('ledger.debit') : t('ledger.credit') }}</span>
                </div>
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colspan="2" class="px-4 py-3.5">
                <span class="flex items-center gap-2">
                  {{ t('common.total') }}
                  <span class="tb-state" :class="trialDiff ? 'is-off' : 'is-ok'">
                    <component :is="trialDiff ? AlertTriangle : Check" class="size-3.5" />
                    {{ trialDiff ? t('ledger.trial.unbalanced') : t('ledger.trial.balanced') }}
                  </span>
                </span>
              </td>
              <td class="tb-dr px-4 py-3.5 text-end tabular-nums" dir="ltr">{{ sar(shownTrialTotals.debit) }}</td>
              <td class="tb-cr px-4 py-3.5 text-end tabular-nums" dir="ltr">{{ sar(shownTrialTotals.credit) }}</td>
              <td class="px-4 py-3.5 text-end tabular-nums" dir="ltr">{{ sar(Math.abs(shownTrialTotals.debit - shownTrialTotals.credit)) }}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>

    <!-- P&L -->
    <div v-else-if="tab === 'pnl'" class="space-y-6">
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricTile :label="t('ledger.pnl.totalRevenue')" :value="pnl.totalRevenue" :format="sar" :icon="MtTrendingUp" tone="success" />
        <MetricTile :label="t('ledger.pnl.totalExpense')" :value="pnl.totalExpense" :format="sar" :icon="MtTrendingDown" tone="danger" />
        <MetricTile
          :label="pnl.net >= 0 ? t('ledger.pnl.net') : t('ledger.pnl.loss')"
          :value="Math.abs(pnl.net)"
          :format="sar"
          :icon="Wallet"
          :tone="pnl.net >= 0 ? 'primary' : 'danger'"
        />
        <MetricTile :label="t('ledger.pnl.margin')" :value="margin" :format="pct" :icon="Percent" tone="brand" :progress="Math.max(0, Math.min(100, margin))" />
      </div>

      <div v-if="loading" class="grid gap-6 lg:grid-cols-3">
        <Skeleton class="h-96 rounded-2xl lg:col-span-2" />
        <Skeleton class="h-96 rounded-2xl" />
      </div>
      <Card v-else-if="!pnl.revenue.length && !pnl.expenses.length"><EmptyState :title="t('ledger.empty')" /></Card>

      <div v-else class="grid items-start gap-6 lg:grid-cols-3">
        <!-- the statement: revenue, less expenses, equals the result -->
        <Card class="pl-statement lg:col-span-2">
          <section v-for="sec in pnlSections" :key="sec.key" class="pl-sec" :class="`is-${sec.key}`">
            <header class="pl-head">
              <span class="pl-ic"><component :is="sec.icon" class="size-4" /></span>
              <h3>{{ sec.title }}</h3>
              <span class="pl-head-n">{{ t('ledger.pnl.accountsN', { n: num(sec.rows.length) }) }}</span>
            </header>
            <div v-for="r in sec.rows" :key="r.id" class="pl-row">
              <span class="pl-code" dir="ltr">{{ accCode(r.id) }}</span>
              <span class="min-w-0 truncate font-semibold">{{ locale === 'ar' ? r.name : r.en }}</span>
              <span class="pl-bar"><i :style="{ width: `${share(r.amount, sec.total)}%` }" /></span>
              <span class="pl-pct">{{ pct(share(r.amount, sec.total)) }}</span>
              <span class="pl-amt" dir="ltr">{{ sar(r.amount) }}</span>
            </div>
            <p v-if="!sec.rows.length" class="text-muted-foreground px-5 py-3 text-sm">{{ t('common.none') }}</p>
            <div class="pl-sub">
              <span>{{ sec.totalLabel }}</span>
              <b dir="ltr">{{ sar(sec.total) }}</b>
            </div>
          </section>

          <div class="pl-result" :class="pnl.net >= 0 ? 'is-profit' : 'is-loss'">
            <span class="pl-ic"><component :is="pnl.net >= 0 ? MtTrendingUp : MtTrendingDown" class="size-5" /></span>
            <div class="min-w-0 flex-1">
              <p class="pl-result-lab">{{ pnl.net >= 0 ? t('ledger.pnl.net') : t('ledger.pnl.loss') }}</p>
              <p class="pl-result-eq" dir="ltr">{{ sar(pnl.totalRevenue) }} − {{ sar(pnl.totalExpense) }}</p>
            </div>
            <b class="pl-result-num" dir="ltr">{{ sar(pnl.net) }}</b>
          </div>
        </Card>

        <!-- where each 100 riyals of revenue goes -->
        <Card class="p-5">
          <h3 class="font-bold">{{ t('ledger.pnl.splitTitle') }}</h3>
          <p class="text-muted-foreground mt-0.5 text-xs">{{ t('ledger.pnl.splitHint') }}</p>
          <div class="pl-stack">
            <i v-for="s in revenueSplit" :key="s.id" :style="{ width: `${s.pct}%`, background: s.color }" :title="`${s.label} · ${pct(s.pct)}`" />
          </div>
          <ul class="pl-legend">
            <li v-for="s in revenueSplit" :key="s.id">
              <i :style="{ background: s.color }" />
              <span class="min-w-0 flex-1 truncate">{{ s.label }}</span>
              <b>{{ pct(s.pct) }}</b>
            </li>
          </ul>
          <p v-if="pnl.net < 0" class="bg-danger/10 text-danger mt-4 flex items-start gap-2 rounded-xl px-3 py-2 text-xs font-semibold">
            <AlertTriangle class="mt-0.5 size-3.5 shrink-0" /> {{ t('ledger.pnl.lossHint', { amount: sar(Math.abs(pnl.net)) }) }}
          </p>
        </Card>
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

<style scoped>
/* month divider: name, a hairline, then the count and total of that month */
.jl-month { display: flex; align-items: center; gap: 0.75rem; padding-inline: 0.25rem; }
.jl-month h3 { font-size: 0.95rem; font-weight: 800; white-space: nowrap; }
.jl-month-line { flex: 1; height: 1px; background: var(--border); }
.jl-month-sum { font-size: 12px; font-weight: 700; color: var(--muted-foreground); white-space: nowrap; font-variant-numeric: tabular-nums; }

/* entry card: the whole card opens the entry */
.jl-card {
  display: block; border-radius: 1.25rem; border: 1px solid var(--border); background: var(--card); overflow: hidden;
  animation: jl-rise 0.45s cubic-bezier(0.2, 0.8, 0.2, 1) both; animation-delay: var(--d, 0ms);
  transition: border-color 0.2s, transform 0.2s;
}
.jl-card:hover { border-color: color-mix(in srgb, var(--primary) 45%, var(--border)); transform: translateY(-2px); }
.jl-card:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
@keyframes jl-rise { from { opacity: 0; transform: translateY(8px); } }
.jl-card.is-voided { opacity: 0.65; }
.jl-card.is-voided .jl-amount b { text-decoration: line-through; }

.jl-top { display: flex; align-items: center; gap: 1rem; padding: 1rem 1.25rem; }
.jl-date {
  display: grid; place-items: center; width: 3.4rem; height: 3.4rem; flex: none; border-radius: 1rem; line-height: 1.1;
  background: color-mix(in srgb, var(--primary) 10%, var(--card)); color: var(--primary);
}
.jl-date b { font-size: 1.25rem; font-weight: 900; font-variant-numeric: tabular-nums; }
.jl-date span { font-size: 10.5px; font-weight: 800; }
.jl-ref { font: 800 0.95rem ui-monospace, 'IBM Plex Mono', monospace; transition: color 0.2s; }
.jl-card:hover .jl-ref { color: var(--primary); }
.jl-tag { display: inline-flex; align-items: center; padding: 0.05rem 0.55rem; border-radius: 9999px; font-size: 11px; font-weight: 700; background: var(--muted); color: var(--muted-foreground); }
.jl-tag.is-manual { background: color-mix(in srgb, var(--success) 12%, transparent); color: var(--success); }
.jl-desc { margin-top: 0.2rem; font-size: 13px; color: var(--muted-foreground); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.jl-amount { display: grid; justify-items: end; flex: none; }
.jl-amount b { font-size: 1.15rem; font-weight: 900; font-variant-numeric: tabular-nums; }
.jl-amount span { font-size: 11px; font-weight: 700; color: var(--muted-foreground); }
.jl-go {
  display: grid; place-items: center; width: 2rem; height: 2rem; flex: none; border-radius: 0.65rem; color: var(--muted-foreground);
  background: var(--muted); transition: background-color 0.2s, color 0.2s, transform 0.2s;
}
.jl-card:hover .jl-go { background: var(--primary); color: var(--primary-foreground); transform: translateX(-3px); }
:global([dir='ltr']) .jl-card:hover .jl-go { transform: translateX(3px); }

/* lines: a quiet inset list under the header */
.jl-lines { margin: 0 1.25rem 1rem; padding: 0.35rem 0; border-radius: 0.9rem; background: color-mix(in srgb, var(--muted) 55%, transparent); }
.jl-line {
  display: grid; grid-template-columns: 0.4rem minmax(0, 1.6fr) minmax(0, 1fr) 8.5rem 8.5rem; gap: 0.75rem; align-items: center;
  padding: 0.4rem 0.9rem; font-size: 13px;
}
.jl-line + .jl-line { border-top: 1px dashed var(--border); }
.jl-side { width: 0.4rem; height: 0.4rem; border-radius: 9999px; }
.jl-side.is-dr { background: var(--brand); }
.jl-side.is-cr { background: var(--primary); }
.jl-code { font: 700 11.5px ui-monospace, 'IBM Plex Mono', monospace; color: var(--muted-foreground); margin-inline-end: 0.3rem; }
.jl-num { text-align: end; font-weight: 800; font-variant-numeric: tabular-nums; }
.jl-num.is-dr { color: var(--brand); }
.jl-num.is-cr { color: var(--primary); }

@media (max-width: 48rem) {
  .jl-top { flex-wrap: wrap; }
  .jl-amount { justify-items: start; }
  .jl-go { display: none; }
  .jl-line { grid-template-columns: 0.4rem minmax(0, 1fr) 6.5rem 6.5rem; }
  .jl-line > :nth-child(3) { display: none; }
}
@media (prefers-reduced-motion: reduce) { .jl-card { animation: none; transition: none; } }

/* ── trial balance ── */
.tb-types { display: flex; flex-wrap: wrap; gap: 0.4rem; }
.tb-type {
  display: inline-flex; align-items: center; gap: 0.45rem; height: 2.25rem; padding: 0 0.6rem 0 0.9rem; border-radius: 9999px; cursor: pointer;
  font-size: 13px; font-weight: 700; color: var(--muted-foreground); background: var(--card); border: 1px solid var(--border);
  transition: border-color 0.15s, color 0.15s, background-color 0.15s;
}
.tb-type:hover { border-color: color-mix(in srgb, var(--primary) 40%, var(--border)); color: var(--foreground); }
.tb-type.is-on { background: var(--primary); border-color: var(--primary); color: var(--primary-foreground); }
.tb-count { display: inline-grid; place-items: center; min-width: 1.5rem; height: 1.5rem; padding: 0 0.35rem; border-radius: 9999px; font-size: 11px; font-weight: 800; background: var(--muted); color: var(--foreground); font-variant-numeric: tabular-nums; }
.tb-type.is-on .tb-count { background: color-mix(in srgb, white 25%, transparent); color: inherit; }
.tb-dot { width: 0.55rem; height: 0.55rem; border-radius: 0.2rem; flex: none; background: var(--muted-foreground); }
.tb-dot.t-asset { background: var(--brand); }
.tb-dot.t-liability { background: var(--warning); }
.tb-dot.t-equity { background: var(--navy); }
.tb-dot.t-revenue { background: var(--success); }
.tb-dot.t-expense { background: var(--danger); }
.tb-type.is-on .tb-dot { outline: 2px solid color-mix(in srgb, white 70%, transparent); }

/* type heading rows sit on the well itself, not on a white strip */
.soft-table tbody tr.tb-group > td { background: transparent !important; box-shadow: none !important; font-size: 12px; font-weight: 800; color: var(--muted-foreground); }
.soft-table tbody tr.tb-group > td:first-child::before { display: none; }
.tb-group-name { display: inline-flex; align-items: center; gap: 0.5rem; font-size: 13px; color: var(--foreground); }
.tb-code { font: 700 12px ui-monospace, 'IBM Plex Mono', monospace; color: var(--muted-foreground); background: var(--muted); padding: 0.1rem 0.5rem; border-radius: 0.4rem; }
.tb-dr { color: var(--brand); font-weight: 700; }
.tb-cr { color: var(--primary); font-weight: 700; }
.tb-bar { width: 5rem; height: 0.4rem; border-radius: 9999px; background: var(--muted); overflow: hidden; display: flex; justify-content: flex-end; }
.tb-bar i { display: block; height: 100%; border-radius: 9999px; transition: width 0.5s cubic-bezier(0.2, 0.8, 0.2, 1); }
.tb-bar i.is-dr { background: var(--brand); }
.tb-bar i.is-cr { background: var(--primary); }
.tb-side { font-size: 10.5px; font-weight: 800; padding: 0.05rem 0.45rem; border-radius: 0.35rem; min-width: 2.6rem; text-align: center; }
.tb-side.is-dr { color: var(--brand); background: color-mix(in srgb, var(--brand) 12%, transparent); }
.tb-side.is-cr { color: var(--primary); background: color-mix(in srgb, var(--primary) 12%, transparent); }
.tb-state { display: inline-flex; align-items: center; gap: 0.3rem; padding: 0.1rem 0.6rem; border-radius: 9999px; font-size: 11px; font-weight: 800; }
.tb-state.is-ok { background: var(--success); color: white; }
.tb-state.is-off { background: color-mix(in srgb, var(--danger) 14%, transparent); color: var(--danger); }
@media (prefers-reduced-motion: reduce) { .tb-bar i { transition: none; } }

/* ── profit & loss statement ── */
.pl-statement { overflow: hidden; }
.pl-sec { --tone: var(--success); }
.pl-sec.is-expense { --tone: var(--danger); border-top: 1px solid var(--border); }
.pl-head { display: flex; align-items: center; gap: 0.6rem; padding: 1rem 1.25rem 0.5rem; }
.pl-head h3 { font-weight: 800; }
.pl-head-n { margin-inline-start: auto; font-size: 11.5px; font-weight: 700; color: var(--muted-foreground); }
.pl-ic { display: grid; place-items: center; width: 2rem; height: 2rem; border-radius: 0.65rem; flex: none; color: var(--tone); background: color-mix(in srgb, var(--tone) 12%, var(--card)); }
.pl-row {
  display: grid; grid-template-columns: 3.5rem minmax(0, 1fr) 7rem 3.5rem 9rem; gap: 0.75rem; align-items: center;
  margin-inline: 0.75rem; padding: 0.55rem 0.5rem; border-radius: 0.7rem; font-size: 13.5px; transition: background-color 0.15s;
}
.pl-row:hover { background: color-mix(in srgb, var(--tone) 6%, transparent); }
.pl-code { font: 700 11.5px ui-monospace, 'IBM Plex Mono', monospace; color: var(--muted-foreground); }
.pl-bar { height: 0.4rem; border-radius: 9999px; background: var(--muted); overflow: hidden; }
.pl-bar i { display: block; height: 100%; border-radius: 9999px; background: var(--tone); transition: width 0.6s cubic-bezier(0.2, 0.8, 0.2, 1); }
.pl-pct { font-size: 11.5px; font-weight: 700; color: var(--muted-foreground); text-align: end; font-variant-numeric: tabular-nums; }
.pl-amt { text-align: end; font-weight: 800; font-variant-numeric: tabular-nums; }
.pl-sub {
  display: flex; align-items: center; justify-content: space-between; margin: 0.4rem 1.25rem 1rem; padding: 0.6rem 0.85rem; border-radius: 0.8rem;
  font-size: 13px; font-weight: 800; color: var(--tone); background: color-mix(in srgb, var(--tone) 8%, var(--card));
}
.pl-sub b { font-size: 1rem; font-weight: 900; font-variant-numeric: tabular-nums; }
.pl-result { --tone: var(--success); display: flex; align-items: center; gap: 0.9rem; padding: 1.1rem 1.25rem; color: white; background: var(--tone); }
.pl-result.is-loss { --tone: var(--danger); }
.pl-result .pl-ic { width: 2.6rem; height: 2.6rem; color: white; background: color-mix(in srgb, white 20%, transparent); }
.pl-result-lab { font-weight: 800; }
.pl-result-eq { font-size: 12px; opacity: 0.8; font-variant-numeric: tabular-nums; text-align: start; }
.pl-result-num { font-size: 1.6rem; font-weight: 900; font-variant-numeric: tabular-nums; }

/* where the revenue goes */
.pl-stack { display: flex; gap: 3px; height: 0.9rem; margin-top: 1.1rem; border-radius: 9999px; overflow: hidden; background: var(--muted); }
.pl-stack i { display: block; height: 100%; transition: width 0.6s cubic-bezier(0.2, 0.8, 0.2, 1); }
.pl-legend { display: grid; gap: 0.2rem; margin-top: 1rem; }
.pl-legend li { display: flex; align-items: center; gap: 0.6rem; padding: 0.4rem 0.2rem; font-size: 13px; }
.pl-legend li + li { border-top: 1px dashed var(--border); }
.pl-legend i { width: 0.65rem; height: 0.65rem; border-radius: 0.2rem; flex: none; }
.pl-legend b { font-variant-numeric: tabular-nums; }
@media (max-width: 40rem) {
  .pl-row { grid-template-columns: minmax(0, 1fr) 7rem; }
  .pl-row .pl-code, .pl-row .pl-bar, .pl-row .pl-pct { display: none; }
}
@media (prefers-reduced-motion: reduce) { .pl-bar i, .pl-stack i { transition: none; } }
</style>
