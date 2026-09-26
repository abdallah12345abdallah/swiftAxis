<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import ActionMenu from '@/components/common/ActionMenu.vue'
import { useRouteTab } from '@/composables/useRouteTab'
import { Pencil, Download, Lock, CheckCircle2, CalendarDays, Info } from 'lucide-vue-next'
import { useConfirm } from '@/composables/useConfirm'
import PageHeader from '@/components/common/PageHeader.vue'
import FilterBar from '@/components/common/FilterBar.vue'
import { CONTRACT_LIST } from '@/api/fixtures'
import { Card } from '@/components/ui/card'
import { DataTable } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dropdown } from '@/components/ui/dropdown'
import FormulaDialog from '@/components/commissions/FormulaDialog.vue'
import RiderCode from '@/components/common/RiderCode.vue'
import { useCurrency } from '@/composables/useCurrency'
import { exportCsv, todayStamp } from '@/lib/export'
import { useToast } from '@/composables/useToast'
import { fetchFormulas, fetchMonthlyReview, approveMonth, tiersOf } from '@/api/commissions'

const { t, locale } = useI18n()
const confirm = useConfirm()
const { sar, num } = useCurrency()
const toast = useToast()

const tab = useRouteTab('formulas')
const loading = ref(true)
const formulas = ref([])
const review = ref({ rows: [], total: 0, locked: false })
const month = ref('2026-07')

const formulaDialog = ref(false)
const editingFormula = ref(null)

const tabs = computed(() => [
  { value: 'formulas', label: t('commissions.tabs.formulas') },
  { value: 'monthly', label: t('commissions.tabs.monthly') },
])
// commissions are worked out and approved a whole month at a time, so the
// period control is a month picker (shown with the month's name)
const monthOptions = computed(() =>
  ['2026-07', '2026-06', '2026-05'].map((m) => {
    const [y, mo] = m.split('-').map(Number)
    const label = new Intl.DateTimeFormat(locale.value === 'ar' ? 'ar-u-ca-gregory-nu-latn' : 'en-US', { month: 'long', year: 'numeric' }).format(new Date(y, mo - 1, 1))
    return { value: m, label, icon: CalendarDays }
  }),
)

/* search by rider, filter by contract and by extra orders */
const reviewQuery = ref('')
const reviewFilters = ref({ contract: '', extra: '' })
const reviewFilterDefs = computed(() => [
  { key: 'contract', label: t('riders.filters.contract'), options: CONTRACT_LIST.map((c) => ({ value: c.id, label: c.company })) },
  { key: 'extra', label: t('commissions.monthly.extra'), options: [
    { value: 'with', label: t('commissions.monthly.withExtra') },
    { value: 'without', label: t('commissions.monthly.noExtra') },
  ] },
])
const reviewRows = computed(() => {
  const q = reviewQuery.value.trim().toLowerCase()
  const f = reviewFilters.value
  return review.value.rows.filter((r) => {
    if (q && !`${r.name} ${r.id}`.toLowerCase().includes(q)) return false
    if (f.contract && r.contract !== f.contract) return false
    if (f.extra === 'with' && !(r.extra > 0)) return false
    if (f.extra === 'without' && r.extra > 0) return false
    return true
  })
})
const isNarrowed = computed(() => reviewRows.value.length !== review.value.rows.length)

/* formulas: one per rider — search by rider, filter by status */
const formulaQuery = ref('')
const formulaFilters = ref({ status: 'active' })
const formulaFilterDefs = computed(() => [
  { key: 'status', label: t('common.status'), options: [
    { value: 'active', label: t('common.active') },
    { value: 'inactive', label: t('common.inactive') },
  ] },
])
const formulaRows = computed(() => {
  const q = formulaQuery.value.trim().toLowerCase()
  const f = formulaFilters.value
  return formulas.value.filter((r) => {
    if (q && !`${r.name} ${r.riderId}`.toLowerCase().includes(q)) return false
    if (f.status === 'active' && !r.active) return false
    if (f.status === 'inactive' && r.active) return false
    return true
  })
})
const shownTotal = computed(() => reviewRows.value.reduce((s, r) => s + r.total, 0))

async function loadFormulas() {
  formulas.value = await fetchFormulas()
}
async function loadReview() {
  loading.value = true
  review.value = await fetchMonthlyReview(month.value)
  loading.value = false
}
async function load() {
  loading.value = true
  await Promise.all([loadFormulas(), loadReview()])
  loading.value = false
}
onMounted(load)
watch(month, loadReview)

function openFormula(row) {
  editingFormula.value = row
  formulaDialog.value = true
}

async function doApprove() {
  await confirm({
    tone: 'success',
    icon: CheckCircle2,
    title: t('commissions.monthly.approveTitle'),
    message: t('commissions.monthly.approveHint'),
    details: [{ label: t('commissions.monthly.total'), value: sar(review.value.total) }],
    confirmText: t('commissions.monthly.approve'),
    onConfirm: async () => {
      try {
        await approveMonth(month.value)
      } catch {
        toast.error(t('commissions.monthly.locked'))
        return false
      }
      toast.success(t('commissions.monthly.approved'))
      await loadReview()
    },
  })
}

function exportReview() {
  exportCsv(
    `commissions-${month.value}`,
    [t('commissions.monthly.rider'), t('commissions.monthly.orders'), t('commissions.monthly.base'), t('commissions.monthly.extraAmount'), t('commissions.monthly.total')],
    reviewRows.value.map((r) => [r.name, r.orders, r.base, r.extraAmount, r.total]),
  )
}
</script>

<template>
  <div>
    <PageHeader :title="t('commissions.title')" :subtitle="t('commissions.subtitle')">
      <template #actions>
        <Button v-if="tab === 'monthly'" variant="outline" @click="exportReview"><Download /> {{ t('common.export') }}</Button>
        <Button v-if="tab === 'monthly' && !review.locked" @click="doApprove"><CheckCircle2 /> {{ t('commissions.monthly.approve') }}</Button>
      </template>
    </PageHeader>

    <FilterBar
      v-if="tab === 'monthly'"
      v-model:search="reviewQuery"
      v-model="reviewFilters"
      :filters="reviewFilterDefs"
      :search-placeholder="t('commissions.monthly.searchPh')"
      class="mb-4"
    >
      <template #extra><Dropdown v-model="month" :options="monthOptions" class="h-11 w-auto min-w-[170px] rounded-xl" /></template>
    </FilterBar>

    <FilterBar
      v-if="tab === 'formulas'"
      v-model:search="formulaQuery"
      v-model="formulaFilters"
      :filters="formulaFilterDefs"
      :search-placeholder="t('commissions.monthly.searchPh')"
      class="mb-4"
    />

    <!-- Formulas: the commission is the rider's, so each rider has their own -->
    <Card v-if="tab === 'formulas'" class="overflow-hidden">
      <p class="bg-primary/5 text-muted-foreground flex items-start gap-2 border-b px-5 py-2.5 text-xs">
        <Info class="text-primary mt-0.5 size-3.5 shrink-0" /> {{ t('commissions.formula.perRiderHint') }}
      </p>
      <DataTable
        :loading="loading"
        :rows="formulaRows"
        row-key="riderId"
        :empty="t('common.noData')"
        :columns="[
          { key: 'name', label: t('commissions.formula.rider'), sortable: true },
          { key: 'target', label: t('commissions.formula.target'), align: 'end' },
          { key: 'base', label: t('commissions.formula.base'), align: 'end' },
          { key: 'tiers', label: t('commissions.formula.tiers'), align: 'end' },
          { key: 'actions', label: t('common.actions'), align: 'end' },
        ]"
      >
        <template #cell-target="{ row }"><span class="tabular-nums">{{ num(row.formula.target) }}</span></template>
        <template #cell-base="{ row }"><span class="tabular-nums">{{ sar(row.formula.base) }}</span></template>
        <template #cell-tiers="{ row }">
          <div class="flex flex-wrap justify-end gap-1">
            <Badge v-for="(tier, i) in tiersOf(row.formula)" :key="i" variant="secondary" class="tabular-nums">
              {{ tier.upTo == null ? t('commissions.formula.tierUnlimited') : num(tier.upTo) }} · {{ sar(tier.perOrder) }}
            </Badge>
          </div>
        </template>
        <template #cell-name="{ row }">
          <span class="flex flex-wrap items-center gap-2">
            {{ row.name }} <RiderCode :code="row.riderId" />
            <Badge v-if="row.isDefault" variant="secondary">{{ t('commissions.formula.default') }}</Badge>
            <Badge v-if="!row.active" variant="secondary">{{ t('common.inactive') }}</Badge>
          </span>
        </template>
        <template #cell-actions="{ row }">
          <ActionMenu :items="[
                    { label: t('commissions.formula.editTitle'), icon: Pencil, tone: 'blue', onSelect: () => openFormula(row) },
                  ]" />
        </template>
      </DataTable>
    </Card>

    <!-- Monthly review -->
    <Card v-else class="overflow-hidden">
      <div v-if="review.locked" class="bg-muted/40 text-muted-foreground flex items-center gap-2 border-b px-5 py-2.5 text-sm">
        <Lock class="size-4" /> {{ t('commissions.monthly.locked') }}
      </div>
      <DataTable
        :loading="loading"
        :rows="reviewRows"
        :empty="t('commissions.monthly.empty')"
        :columns="[
          { key: 'name', label: t('commissions.monthly.rider'), sortable: true },
          { key: 'orders', label: t('commissions.monthly.orders'), align: 'end', sortable: true },
          { key: 'base', label: t('commissions.monthly.base'), align: 'end', hideBelow: 'sm' },
          { key: 'extra', label: t('commissions.monthly.extra'), align: 'end', hideBelow: 'md' },
          { key: 'extraAmount', label: t('commissions.monthly.extraAmount'), align: 'end', hideBelow: 'lg' },
          { key: 'total', label: t('commissions.monthly.total'), align: 'end', sortable: true },
        ]"
      >
        <template #cell-name="{ row }"><span class="flex items-center gap-2">{{ row.name }} <RiderCode :code="row.id" /></span></template>
        <template #cell-orders="{ row }"><span class="tabular-nums">{{ num(row.orders) }}</span></template>
        <template #cell-base="{ row }"><span class="tabular-nums">{{ sar(row.base) }}</span></template>
        <template #cell-extra="{ row }"><span class="tabular-nums">{{ num(row.extra) }}</span></template>
        <template #cell-extraAmount="{ row }"><span class="tabular-nums">{{ sar(row.extraAmount) }}</span></template>
        <template #cell-total="{ row }"><span class="font-semibold tabular-nums">{{ sar(row.total) }}</span></template>
      </DataTable>
      <div class="bg-muted/40 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t px-5 py-3 text-sm font-semibold">
        <span>{{ t('commissions.monthly.total') }}</span>
        <span class="flex items-center gap-3">
          <span v-if="isNarrowed" class="text-muted-foreground text-xs font-medium">{{ t('commissions.monthly.shown', { v: sar(shownTotal) }) }}</span>
          <span class="tabular-nums">{{ sar(review.total) }}</span>
        </span>
      </div>
    </Card>

    <FormulaDialog v-model:open="formulaDialog" :row="editingFormula" @saved="loadFormulas" />

  </div>
</template>
