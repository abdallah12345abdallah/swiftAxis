<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import ActionMenu from '@/components/common/ActionMenu.vue'
import { useRouteTab } from '@/composables/useRouteTab'
import { Pencil, Download, Lock, CheckCircle2 } from 'lucide-vue-next'
import { useConfirm } from '@/composables/useConfirm'
import PageHeader from '@/components/common/PageHeader.vue'
import { Tabs } from '@/components/ui/tabs'
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

const { t } = useI18n()
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
const monthOptions = [
  { value: '2026-07', label: '2026-07' },
  { value: '2026-06', label: '2026-06' },
  { value: '2026-05', label: '2026-05' },
]

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
    review.value.rows.map((r) => [r.name, r.orders, r.base, r.extraAmount, r.total]),
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

    <div class="mb-6 flex flex-wrap items-center gap-3" :class="tab !== 'monthly' && 'lg:hidden'">
      <Tabs v-model="tab" :tabs="tabs" class="lg:hidden" />
      <Dropdown v-if="tab === 'monthly'" v-model="month" :options="monthOptions" class="ms-auto w-auto min-w-[140px]" />
    </div>

    <!-- Formulas -->
    <Card v-if="tab === 'formulas'" class="overflow-hidden">
      <DataTable
        :loading="loading"
        :rows="formulas"
        row-key="contract"
        :empty="t('common.noData')"
        :columns="[
          { key: 'company', label: t('commissions.formula.contract'), sortable: true },
          { key: 'target', label: t('commissions.formula.target'), align: 'end' },
          { key: 'base', label: t('commissions.formula.base'), align: 'end' },
          { key: 'tiers', label: t('commissions.formula.tiers'), align: 'end' },
          { key: 'riders', label: t('commissions.formula.riders'), align: 'end', hideBelow: 'sm' },
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
        <template #cell-riders="{ row }"><span class="tabular-nums">{{ num(row.riders) }}</span></template>
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
        :rows="review.rows"
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
      <div class="bg-muted/40 flex items-center justify-between border-t px-5 py-3 text-sm font-semibold">
        <span>{{ t('commissions.monthly.total') }}</span>
        <span class="tabular-nums">{{ sar(review.total) }}</span>
      </div>
    </Card>

    <FormulaDialog v-model:open="formulaDialog" :row="editingFormula" @saved="loadFormulas" />

  </div>
</template>
