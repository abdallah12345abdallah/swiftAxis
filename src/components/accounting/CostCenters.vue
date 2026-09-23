<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { Plus, Pencil, Car } from 'lucide-vue-next'
import { Card } from '@/components/ui/card'
import { DataTable } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import CostCenterDialog from '@/components/ledger/CostCenterDialog.vue'
import { useCurrency } from '@/composables/useCurrency'
import { useAccountingOptions } from '@/composables/useAccountingOptions'
import { costCenterReport, fetchCostCenters } from '@/api/ledger'

const { t } = useI18n()
const { sar } = useCurrency()
const opts = useAccountingOptions()
const loading = ref(true)
const rows = ref([])
const raw = ref([])
const dialog = ref(false)
const editing = ref(null)

async function load() {
  loading.value = true
  ;[rows.value, raw.value] = await Promise.all([costCenterReport(), fetchCostCenters(), opts.loaded.value ? null : opts.load()])
  loading.value = false
}
onMounted(load)
const unitName = (id) => {
  const u = opts.units.value.find((x) => x.id === id)
  return u ? opts.name(u) : '—'
}
function open(row = null) {
  editing.value = row ? raw.value.find((c) => c.id === row.id) : null
  dialog.value = true
}
const columns = computed(() => [
  { key: 'code', label: t('accounting.common.code'), sortable: true },
  { key: 'name', label: t('ledger.cc.name'), sortable: true },
  { key: 'unitId', label: t('ledger.cc.unit'), hideBelow: 'md' },
  { key: 'budget', label: t('ledger.cc.budget'), align: 'end', hideBelow: 'lg' },
  { key: 'actual', label: t('ledger.cc.actual'), align: 'end', sortable: true },
  { key: 'active', label: t('common.status'), hideBelow: 'sm' },
  { key: 'actions', label: t('common.actions'), align: 'end' },
])
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <p class="text-muted-foreground text-sm">{{ t('accounting.costCenters.hint') }}</p>
      <Button @click="open()"><Plus /> {{ t('ledger.cc.add') }}</Button>
    </div>
    <Card class="overflow-hidden">
      <DataTable :loading="loading" :rows="rows" :empty="t('common.noData')" :columns="columns">
        <template #cell-code="{ row }"><span dir="ltr" class="font-mono text-xs font-semibold">{{ row.code ?? '—' }}</span></template>
        <template #cell-name="{ row }"><span class="inline-flex items-center gap-2 font-medium">{{ row.name }} <Car v-if="raw.find((c) => c.id === row.id)?.vehicleId" class="text-muted-foreground size-3.5" /></span></template>
        <template #cell-unitId="{ row }"><span class="text-muted-foreground">{{ unitName(row.unitId) }}</span></template>
        <template #cell-budget="{ row }"><span class="tabular-nums">{{ row.budget ? sar(row.budget) : '—' }}</span></template>
        <template #cell-actual="{ row }">
          <div class="flex items-center justify-end gap-2">
            <Progress v-if="row.budget" :value="(row.actual / row.budget) * 100" class="w-16" :indicator-class="row.over ? 'bg-danger' : 'bg-primary'" />
            <span class="tabular-nums">{{ sar(row.actual) }}</span>
          </div>
        </template>
        <template #cell-active="{ row }"><Badge :variant="raw.find((c) => c.id === row.id)?.active !== false ? 'success' : 'secondary'">{{ raw.find((c) => c.id === row.id)?.active !== false ? t('common.active') : t('common.inactive') }}</Badge></template>
        <template #cell-actions="{ row }">
          <button type="button" class="hover:bg-accent text-muted-foreground hover:text-foreground inline-flex size-8 items-center justify-center rounded-lg" @click="open(row)"><Pencil class="size-4" /></button>
        </template>
      </DataTable>
    </Card>
    <CostCenterDialog v-model:open="dialog" :center="editing" :unit-options="opts.unitOptions.value" @saved="load" />
  </div>
</template>
