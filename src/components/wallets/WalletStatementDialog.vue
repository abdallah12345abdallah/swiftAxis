<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Download } from 'lucide-vue-next'
import { Dialog } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useCurrency } from '@/composables/useCurrency'
import { useDate } from '@/lib/format'
import { exportCsv, todayStamp } from '@/lib/export'
import { fetchStatement } from '@/api/wallets'

const props = defineProps({
  open: { type: Boolean, default: false },
  rider: { type: Object, default: null },
})
const emit = defineEmits(['update:open'])

const { t } = useI18n()
const { sar } = useCurrency()
const { formatDate } = useDate()
const rows = ref([])
const loading = ref(false)

watch(
  () => props.open,
  async (v) => {
    if (!v || !props.rider) return
    loading.value = true
    rows.value = await fetchStatement(props.rider.id)
    loading.value = false
  },
)

function exportStatement() {
  exportCsv(
    `wallet-${props.rider.id}-${todayStamp()}`,
    [t('common.date'), t('wallets.type'), t('common.amount'), t('wallets.runningBalance')],
    rows.value.map((m) => [m.date, m.type, m.amount, m.balance]),
  )
}
</script>

<template>
  <Dialog :open="open" size="lg" :title="t('wallets.statementTitle', { name: rider?.name })" @update:open="emit('update:open', $event)">
    <div class="mb-3 flex justify-end">
      <Button variant="outline" size="sm" @click="exportStatement"><Download /> {{ t('common.export') }}</Button>
    </div>
    <div class="max-h-[50vh] overflow-auto rounded-xl border">
      <table class="w-full text-sm">
        <thead class="bg-muted/50 text-muted-foreground sticky top-0">
          <tr>
            <th class="px-4 py-2 text-start font-medium">{{ t('common.date') }}</th>
            <th class="px-4 py-2 text-start font-medium">{{ t('wallets.type') }}</th>
            <th class="px-4 py-2 text-end font-medium">{{ t('common.amount') }}</th>
            <th class="px-4 py-2 text-end font-medium">{{ t('wallets.runningBalance') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="m in rows" :key="m.id" class="border-t">
            <td class="px-4 py-2 tabular-nums">{{ formatDate(m.date) }}</td>
            <td class="px-4 py-2">
              <Badge :variant="m.type === 'deposit' ? 'success' : 'secondary'">
                {{ m.type === 'deposit' ? t('wallets.deposit') : t('wallets.handoverType') }}
              </Badge>
              <span class="text-muted-foreground ms-2 text-xs">{{ m.label }}</span>
            </td>
            <td class="px-4 py-2 text-end tabular-nums" :class="m.type === 'deposit' ? 'text-success' : 'text-danger'">
              {{ m.type === 'deposit' ? '+' : '−' }}{{ sar(m.amount) }}
            </td>
            <td class="px-4 py-2 text-end font-semibold tabular-nums">{{ sar(m.balance) }}</td>
          </tr>
          <tr v-if="!loading && !rows.length"><td colspan="4" class="text-muted-foreground py-8 text-center">{{ t('wallets.empty') }}</td></tr>
        </tbody>
      </table>
    </div>
  </Dialog>
</template>
