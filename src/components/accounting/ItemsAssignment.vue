<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { Card } from '@/components/ui/card'
import { DataTable } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dropdown } from '@/components/ui/dropdown'
import { useToast } from '@/composables/useToast'
import { useAccountingOptions } from '@/composables/useAccountingOptions'
import { fetchItemAssignments, assignStatementItem } from '@/api/accounting'

/* تخصيص بنود القوائم المالية — every postable account picks the statement item
   it reports under. Income accounts get income items, the rest balance items. */
const { t, locale } = useI18n()
const toast = useToast()
const opts = useAccountingOptions()
const loading = ref(true)
const rows = ref([])
const filter = ref('')

async function load() {
  loading.value = true
  ;[rows.value] = await Promise.all([fetchItemAssignments(), opts.loaded.value ? null : opts.load()])
  loading.value = false
}
onMounted(load)

const isIncome = (a) => a.type === 'revenue' || a.type === 'expense'
const optionsFor = (a) => [
  { value: '', label: t('accounting.common.none') },
  ...opts.items.value.filter((i) => i.statement === (isIncome(a) ? 'income' : 'balance')).map((i) => ({ value: i.id, label: `${i.code} — ${opts.name(i)}` })),
]
const filterOptions = computed(() => [{ value: '', label: t('common.all') }, { value: 'unassigned', label: t('accounting.assignment.unassigned') }, { value: 'income', label: t('accounting.items.income') }, { value: 'balance', label: t('accounting.items.balance') }])
const filtered = computed(() => rows.value.filter((a) => (filter.value === 'unassigned' ? !a.statementItem : filter.value === 'income' ? isIncome(a) : filter.value === 'balance' ? !isIncome(a) : true)))
const unassigned = computed(() => rows.value.filter((a) => !a.statementItem).length)

async function assign(a, itemId) {
  if ((a.statementItem || '') === (itemId || '')) return
  await assignStatementItem(a.id, itemId || null)
  toast.success(t('accounting.assignment.saved'))
  await load()
}
const typeVariant = { asset: 'default', liability: 'warning', equity: 'accent', revenue: 'success', expense: 'danger' }
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="flex items-center gap-3">
        <Dropdown v-model="filter" :options="filterOptions" class="w-auto min-w-[180px]" />
        <Badge v-if="unassigned" variant="warning">{{ t('accounting.assignment.unassignedCount', { n: unassigned }) }}</Badge>
      </div>
      <p class="text-muted-foreground max-w-lg text-xs">{{ t('accounting.assignment.hint') }}</p>
    </div>
    <Card class="overflow-hidden">
      <DataTable
        :loading="loading" :rows="filtered" :empty="t('common.noData')"
        :columns="[
          { key: 'code', label: t('accounting.common.code'), sortable: true },
          { key: 'name', label: t('journal.account'), sortable: true },
          { key: 'type', label: t('accounting.common.type'), hideBelow: 'md' },
          { key: 'statementItem', label: t('accounting.items.item') },
        ]"
      >
        <template #cell-code="{ row }"><span dir="ltr" class="font-mono text-xs font-semibold">{{ row.code }}</span></template>
        <template #cell-name="{ row }"><span class="font-medium">{{ locale === 'ar' ? row.name : row.en }}</span></template>
        <template #cell-type="{ row }"><Badge :variant="typeVariant[row.type] ?? 'secondary'">{{ t(`accounting.types.${row.type}`) }}</Badge></template>
        <template #cell-statementItem="{ row }">
          <Dropdown :model-value="row.statementItem" :options="optionsFor(row)" searchable class="w-auto min-w-[260px]" :invalid="!row.statementItem" @update:model-value="assign(row, $event)" />
        </template>
      </DataTable>
    </Card>
  </div>
</template>
