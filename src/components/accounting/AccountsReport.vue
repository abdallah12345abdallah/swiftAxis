<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { Folder, FileText } from 'lucide-vue-next'
import ReportShell from '@/components/accounting/shared/ReportShell.vue'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useCurrency } from '@/composables/useCurrency'
import { exportCsv, todayStamp } from '@/lib/export'
import { accountsReport } from '@/api/accounting'

const { t, locale } = useI18n()
const { sar } = useCurrency()
const loading = ref(true)
const rows = ref([])
onMounted(async () => {
  rows.value = await accountsReport()
  loading.value = false
})
const name = (a) => (locale.value === 'ar' ? a.name : a.en)
const typeVariant = { asset: 'default', liability: 'warning', equity: 'accent', revenue: 'success', expense: 'danger' }
const exportRows = () => exportCsv(`chart-of-accounts-${todayStamp()}`, [t('accounting.common.code'), t('common.name'), t('accounting.reports.level'), t('accounting.common.type'), t('accounting.common.parent'), t('accounting.items.item'), t('ledger.balance')], rows.value.map((a) => [a.code, a.name, a.level, t(`accounting.types.${a.type}`), a.parentName ?? '', a.statementItemName ?? '', a.balance]))
</script>

<template>
  <ReportShell :title="t('accounting.screens.accountsReport')" @export="exportRows">
    <div v-if="loading" class="space-y-3 p-5"><Skeleton v-for="i in 8" :key="i" class="h-9 rounded-lg" /></div>
    <div v-else class="soft-table overflow-x-auto"><table class="w-full text-sm">
      <thead class="text-muted-foreground border-b"><tr>
        <th class="px-5 py-2.5 text-start font-medium">{{ t('journal.account') }}</th>
        <th class="hidden px-5 py-2.5 text-start font-medium md:table-cell">{{ t('accounting.common.type') }}</th>
        <th class="hidden px-5 py-2.5 text-start font-medium lg:table-cell">{{ t('accounting.items.item') }}</th>
        <th class="px-5 py-2.5 text-end font-medium">{{ t('ledger.balance') }}</th>
      </tr></thead>
      <tbody>
        <tr v-for="a in rows" :key="a.id" class="border-b last:border-0" :class="a.active === false && 'opacity-50'">
          <td class="px-5 py-2">
            <span class="inline-flex items-center gap-2" :style="{ paddingInlineStart: `${(a.level - 1) * 1.25}rem` }">
              <component :is="a.isGroup ? Folder : FileText" class="size-4" :class="a.isGroup ? 'text-orange' : 'text-muted-foreground'" />
              <span dir="ltr" class="font-mono text-xs">{{ a.code }}</span><span :class="a.isGroup ? 'font-bold' : ''">{{ name(a) }}</span>
            </span>
          </td>
          <td class="hidden px-5 py-2 md:table-cell"><Badge :variant="typeVariant[a.type]">{{ t(`accounting.types.${a.type}`) }}</Badge></td>
          <td class="text-muted-foreground hidden px-5 py-2 text-xs lg:table-cell">{{ a.statementItemName ?? '' }}</td>
          <td class="px-5 py-2 text-end tabular-nums" :class="a.isGroup ? 'font-semibold' : ''">{{ sar(a.balance, { decimals: 2 }) }}</td>
        </tr>
      </tbody>
    </table></div>
  </ReportShell>
</template>
