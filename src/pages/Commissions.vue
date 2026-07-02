<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Pencil, Download, Lock, CheckCircle2 } from 'lucide-vue-next'
import PageHeader from '@/components/common/PageHeader.vue'
import { Tabs } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { DataTable } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Dialog } from '@/components/ui/dialog'
import FormulaDialog from '@/components/commissions/FormulaDialog.vue'
import { useCurrency } from '@/composables/useCurrency'
import { exportCsv, todayStamp } from '@/lib/export'
import { useToast } from '@/composables/useToast'
import { fetchFormulas, fetchMonthlyReview, approveMonth } from '@/api/commissions'

const { t } = useI18n()
const { sar, num } = useCurrency()
const toast = useToast()

const tab = ref('formulas')
const loading = ref(true)
const formulas = ref([])
const review = ref({ rows: [], total: 0, locked: false })
const month = ref('2026-07')

const formulaDialog = ref(false)
const editingFormula = ref(null)
const approveDialog = ref(false)
const approving = ref(false)

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
  if (approving.value) return
  approving.value = true
  try {
    await approveMonth(month.value)
    toast.success(t('commissions.monthly.approved'))
    approveDialog.value = false
    await loadReview()
  } catch (e) {
    toast.error(t('commissions.monthly.locked'))
  } finally {
    approving.value = false
  }
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
        <Button v-if="tab === 'monthly' && !review.locked" @click="approveDialog = true"><CheckCircle2 /> {{ t('commissions.monthly.approve') }}</Button>
      </template>
    </PageHeader>

    <div class="mb-6 flex flex-wrap items-center gap-3">
      <Tabs v-model="tab" :tabs="tabs" />
      <Select v-if="tab === 'monthly'" v-model="month" :options="monthOptions" class="ms-auto w-auto min-w-[140px]" />
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
          { key: 'perOrder', label: t('commissions.formula.perOrder'), align: 'end' },
          { key: 'riders', label: t('commissions.formula.riders'), align: 'end', hideBelow: 'sm' },
          { key: 'actions', label: t('common.actions'), align: 'end' },
        ]"
      >
        <template #cell-target="{ row }"><span class="tabular-nums">{{ num(row.formula.target) }}</span></template>
        <template #cell-base="{ row }"><span class="tabular-nums">{{ sar(row.formula.base) }}</span></template>
        <template #cell-perOrder="{ row }"><span class="tabular-nums">{{ sar(row.formula.perOrder) }}</span></template>
        <template #cell-riders="{ row }"><span class="tabular-nums">{{ num(row.riders) }}</span></template>
        <template #cell-actions="{ row }">
          <button type="button" class="hover:bg-accent text-muted-foreground hover:text-foreground inline-flex size-8 items-center justify-center rounded-lg" @click="openFormula(row)">
            <Pencil class="size-4" />
          </button>
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

    <Dialog v-model:open="approveDialog" :title="t('commissions.monthly.approveTitle')">
      <p class="text-muted-foreground text-sm">{{ t('commissions.monthly.approveHint') }}</p>
      <p class="mt-4 flex items-center justify-between rounded-xl bg-muted/40 px-4 py-3 font-semibold">
        <span>{{ t('commissions.monthly.total') }}</span>
        <span class="tabular-nums">{{ sar(review.total) }}</span>
      </p>
      <template #footer>
        <Button variant="ghost" @click="approveDialog = false">{{ t('common.cancel') }}</Button>
        <Button :disabled="approving" @click="doApprove">{{ t('commissions.monthly.approve') }}</Button>
      </template>
    </Dialog>
  </div>
</template>
