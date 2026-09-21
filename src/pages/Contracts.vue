<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { Plus, Pencil } from 'lucide-vue-next'
import PageHeader from '@/components/common/PageHeader.vue'
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

    <Card class="overflow-hidden">
      <div v-if="loading" class="space-y-3 p-5">
        <Skeleton v-for="i in 3" :key="i" class="h-12 rounded-lg" />
      </div>

      <div v-else-if="!contracts.length" class="text-muted-foreground py-16 text-center text-sm">
        {{ t('contracts.empty') }}
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
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
            <tr v-for="c in contracts" :key="c.id" class="hover:bg-muted/40 border-b transition-colors last:border-0">
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
                  <button
                    type="button"
                    class="hover:bg-accent text-muted-foreground hover:text-foreground inline-flex size-8 items-center justify-center rounded-lg transition-colors"
                    :title="t('riders.actions.edit')"
                    @click="openEditContract(c)"
                  >
                    <Pencil class="size-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>

    <ContractFormDialog
      v-model:open="contractDialog"
      :contract="editingContract"
      @saved="load"
    />
  </div>
</template>
