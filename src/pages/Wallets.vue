<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { Search, HandCoins, FileText, AlertTriangle } from 'lucide-vue-next'
import PageHeader from '@/components/common/PageHeader.vue'
import Avatar from '@/components/common/Avatar.vue'
import { Card } from '@/components/ui/card'
import { DataTable } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import HandoverDialog from '@/components/wallets/HandoverDialog.vue'
import WalletStatementDialog from '@/components/wallets/WalletStatementDialog.vue'
import { useCurrency } from '@/composables/useCurrency'
import { WALLET_WARNING_THRESHOLD } from '@/lib/constants'
import { fetchWallets } from '@/api/wallets'

const { t } = useI18n()
const { sar } = useCurrency()

const loading = ref(true)
const wallets = ref([])
const query = ref('')
const handoverDialog = ref(false)
const statementDialog = ref(false)
const selected = ref(null)

async function load() {
  loading.value = true
  wallets.value = await fetchWallets()
  loading.value = false
}
onMounted(load)

const filtered = computed(() =>
  wallets.value.filter((w) => !query.value || w.name.toLowerCase().includes(query.value.trim().toLowerCase())),
)
const overCount = computed(() => wallets.value.filter((w) => w.over).length)
const totalCash = computed(() => wallets.value.reduce((s, w) => s + w.balance, 0))

function openHandover(w) {
  selected.value = w
  handoverDialog.value = true
}
function openStatement(w) {
  selected.value = w
  statementDialog.value = true
}
</script>

<template>
  <div>
    <PageHeader :title="t('wallets.title')" :subtitle="t('wallets.subtitle')" />

    <div class="mb-6 grid gap-4 sm:grid-cols-3">
      <Card class="p-5"><p class="text-muted-foreground text-sm">{{ t('wallets.balance') }}</p><p class="mt-1 text-2xl font-bold tabular-nums">{{ sar(totalCash) }}</p></Card>
      <Card class="p-5"><p class="text-muted-foreground text-sm">{{ t('wallets.over') }}</p><p class="text-danger mt-1 text-2xl font-bold tabular-nums">{{ overCount }}</p></Card>
      <Card class="p-5"><p class="text-muted-foreground text-sm">{{ t('common.target') }}</p><p class="mt-1 text-2xl font-bold tabular-nums">{{ sar(WALLET_WARNING_THRESHOLD) }}</p></Card>
    </div>

    <div class="mb-4 max-w-xs">
      <div class="relative">
        <Search class="text-muted-foreground pointer-events-none absolute top-1/2 size-4 -translate-y-1/2 start-3.5" />
        <Input v-model="query" :placeholder="t('wallets.searchPlaceholder')" class="ps-10" />
      </div>
    </div>

    <Card class="overflow-hidden">
      <DataTable
        :loading="loading"
        :rows="filtered"
        :empty="t('common.noData')"
        :columns="[
          { key: 'name', label: t('dashboard.table.rider'), sortable: true },
          { key: 'balance', label: t('wallets.balance'), align: 'end', sortable: true },
          { key: 'actions', label: t('common.actions'), align: 'end' },
        ]"
      >
        <template #cell-name="{ row }">
          <div class="flex items-center gap-3">
            <Avatar :initials="row.name.charAt(0)" />
            <span class="font-medium">{{ row.name }}</span>
          </div>
        </template>
        <template #cell-balance="{ row }">
          <span class="inline-flex items-center gap-1.5 font-semibold tabular-nums" :class="row.over ? 'text-danger' : ''">
            <AlertTriangle v-if="row.over" class="size-4" />
            {{ sar(row.balance) }}
          </span>
        </template>
        <template #cell-actions="{ row }">
          <div class="flex items-center justify-end gap-1">
            <button type="button" class="hover:bg-accent text-muted-foreground hover:text-foreground inline-flex size-8 items-center justify-center rounded-lg" :title="t('wallets.statement')" @click="openStatement(row)">
              <FileText class="size-4" />
            </button>
            <button type="button" class="hover:bg-accent text-muted-foreground hover:text-primary inline-flex size-8 items-center justify-center rounded-lg" :title="t('wallets.handover')" @click="openHandover(row)">
              <HandCoins class="size-4" />
            </button>
          </div>
        </template>
      </DataTable>
    </Card>

    <HandoverDialog v-model:open="handoverDialog" :rider="selected" @saved="load" />
    <WalletStatementDialog v-model:open="statementDialog" :rider="selected" />
  </div>
</template>
