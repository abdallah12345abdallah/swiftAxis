<script setup>
import EmptyState from '@/components/common/EmptyState.vue'
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import ActionMenu from '@/components/common/ActionMenu.vue'
import { Plus, Pencil } from 'lucide-vue-next'
import PageHeader from '@/components/common/PageHeader.vue'
import FilterBar from '@/components/common/FilterBar.vue'
import { DateRangePicker } from '@/components/ui/datepicker'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import ContractFormDialog from '@/components/contracts/ContractFormDialog.vue'
import { useCurrency } from '@/composables/useCurrency'
import { fetchContracts } from '@/api/riders'

const { t } = useI18n()
const { sar, num } = useCurrency()

const loading = ref(true)
const contracts = ref([])

/* search by company, a date range (contracts running at any point in it; an
   open-ended contract runs on), and status / term / linked riders in the tray */
const query = ref('')
const dateRange = ref(['', ''])
const filters = ref({ status: '', term: '', riders: '' })
const filterDefs = computed(() => [
  { key: 'status', label: t('contracts.status'), options: [
    { value: 'active', label: t('dashboard.status.active') },
    { value: 'inactive', label: t('dashboard.status.inactive') },
  ] },
  { key: 'term', label: t('contracts.filters.term'), options: [
    { value: 'ongoing', label: t('contracts.filters.termOngoing') },
    { value: 'fixed', label: t('contracts.filters.termFixed') },
  ] },
  { key: 'riders', label: t('contracts.ridersLinked'), options: [
    { value: 'with', label: t('contracts.filters.withRiders') },
    { value: 'without', label: t('contracts.filters.noRiders') },
  ] },
])
const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  const [from, to] = dateRange.value
  const f = filters.value
  return contracts.value.filter((c) => {
    if (q && !String(c.company).toLowerCase().includes(q)) return false
    if (to && c.start && c.start > to) return false
    if (from && c.end && c.end < from) return false
    if (f.status === 'active' && !c.active) return false
    if (f.status === 'inactive' && c.active) return false
    if (f.term === 'ongoing' && c.end) return false
    if (f.term === 'fixed' && !c.end) return false
    if (f.riders === 'with' && !c.riderCount) return false
    if (f.riders === 'without' && c.riderCount) return false
    return true
  })
})

const contractDialog = ref(false)
const editingContract = ref(null)

async function load() {
  loading.value = true
  contracts.value = await fetchContracts()
  loading.value = false
}
onMounted(load)

function openAddContract() {
  editingContract.value = null
  contractDialog.value = true
}
function openEditContract(c) {
  editingContract.value = c
  contractDialog.value = true
}
</script>

<template>
  <div>
    <PageHeader :title="t('contracts.title')" :subtitle="t('contracts.subtitle')">
      <template #actions>
        <Button @click="openAddContract">
          <Plus /> {{ t('contracts.add') }}
        </Button>
      </template>
    </PageHeader>

    <FilterBar v-model:search="query" v-model="filters" :filters="filterDefs" :search-placeholder="t('contracts.searchPh')" class="mb-4">
      <template #extra><DateRangePicker v-model="dateRange" /></template>
    </FilterBar>

    <Card class="overflow-hidden">
      <div v-if="loading" class="space-y-3 p-5">
        <Skeleton v-for="i in 3" :key="i" class="h-12 rounded-lg" />
      </div>

      <EmptyState v-else-if="!filtered.length" :title="contracts.length ? t('common.noData') : t('contracts.empty')" />

      <div v-else class="overflow-x-auto">
        <div class="soft-table overflow-x-auto"><table class="w-full text-sm">
          <thead>
            <tr class="text-muted-foreground border-b">
              <th class="px-5 py-3 text-start font-medium">{{ t('contracts.company') }}</th>
              <th class="hidden px-5 py-3 text-start font-medium sm:table-cell">{{ t('contracts.amount') }}</th>
              <th class="hidden px-5 py-3 text-start font-medium md:table-cell">{{ t('contracts.start') }}</th>
              <th class="hidden px-5 py-3 text-start font-medium md:table-cell">{{ t('contracts.end') }}</th>
              <th class="px-5 py-3 text-start font-medium">{{ t('contracts.ridersLinked') }}</th>
              <th class="px-5 py-3 text-start font-medium">{{ t('contracts.status') }}</th>
              <th class="px-5 py-3 text-end font-medium">{{ t('contracts.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in filtered" :key="c.id" class="hover:bg-muted/40 border-b transition-colors last:border-0">
              <td class="px-5 py-3 font-medium">{{ c.company }}</td>
              <td class="text-muted-foreground hidden px-5 py-3 tabular-nums sm:table-cell">{{ sar(c.amount) }}</td>
              <td class="text-muted-foreground hidden px-5 py-3 tabular-nums md:table-cell" dir="ltr">{{ c.start ?? '—' }}</td>
              <td class="text-muted-foreground hidden px-5 py-3 tabular-nums md:table-cell" dir="ltr">
                {{ c.end ?? t('contracts.ongoing') }}
              </td>
              <td class="px-5 py-3 tabular-nums">{{ num(c.riderCount) }}</td>
              <td class="px-5 py-3">
                <Badge :variant="c.active ? 'success' : 'secondary'">
                  {{ c.active ? t('dashboard.status.active') : t('dashboard.status.inactive') }}
                </Badge>
              </td>
              <td class="px-5 py-3">
                <div class="flex justify-end">
                  <ActionMenu :items="[{ label: t('riders.actions.edit'), icon: Pencil, tone: 'blue', onSelect: () => openEditContract(c) }]" />
                </div>
              </td>
            </tr>
          </tbody>
        </table></div>
      </div>
    </Card>

    <ContractFormDialog
      v-model:open="contractDialog"
      :contract="editingContract"
      @saved="load"
    />
  </div>
</template>
