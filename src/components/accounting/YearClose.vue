<script setup>
import EmptyState from '@/components/common/EmptyState.vue'
import MetricTile from '@/components/common/MetricTile.vue'
import { TrendingUp as MtTrendingUp, TrendingDown as MtTrendingDown, Scale as MtScale } from 'lucide-vue-next'
import { ref, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Lock, AlertTriangle, CheckCircle2 } from 'lucide-vue-next'
import { useConfirm } from '@/composables/useConfirm'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dropdown } from '@/components/ui/dropdown'
import { Skeleton } from '@/components/ui/skeleton'
import { useCurrency } from '@/composables/useCurrency'
import { useToast } from '@/composables/useToast'
import { useAuthStore } from '@/stores/auth'
import { useAccountingOptions } from '@/composables/useAccountingOptions'
import { previewYearClose, runYearClose } from '@/api/accounting'

const { t, locale } = useI18n()
const ask = useConfirm()
const { sar } = useCurrency()
const toast = useToast()
const auth = useAuthStore()
const opts = useAccountingOptions()
const year = ref('')
const loading = ref(true)
const preview = ref(null)

async function load() {
  if (!year.value) return
  loading.value = true
  preview.value = await previewYearClose(year.value)
  loading.value = false
}
onMounted(async () => {
  await opts.load()
  year.value = opts.defaultYear.value
  await load()
})
watch(year, load)

async function run() {
  await ask({
    tone: 'danger',
    icon: Lock,
    title: t('accounting.yearClose.run'),
    message: t('accounting.yearClose.confirmHint', { name: preview.value ? (locale.value === 'ar' ? preview.value.year.name : preview.value.year.en) : '' }),
    confirmText: t('accounting.yearClose.run'),
    onConfirm: async () => {
      try {
        const y = await runYearClose(year.value, { by: auth.user?.name })
        toast.success(t('accounting.yearClose.done', { ref: y.closingRef ?? '—' }))
      } catch (e) {
        toast.error(e.message === 'MONTHS_OPEN' ? t('accounting.yearClose.errMonths') : t('journal.errGeneric'))
        return false
      }
      await opts.load()
      await load()
    },
  })
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div class="space-y-1.5">
        <label class="text-muted-foreground text-xs font-medium">{{ t('accounting.common.year') }}</label>
        <Dropdown v-model="year" :options="opts.yearOptions.value" class="w-auto min-w-[220px]" />
      </div>
      <Button v-if="preview && !preview.alreadyClosed" :disabled="!preview.allMonthsClosed" @click="run"><Lock /> {{ t('accounting.yearClose.run') }}</Button>
    </div>

    <div v-if="loading || !preview" class="space-y-4"><Skeleton class="h-24 rounded-2xl" /><Skeleton class="h-56 rounded-2xl" /></div>
    <template v-else>
      <div v-if="preview.alreadyClosed" class="bg-muted/60 text-muted-foreground flex items-center gap-2 rounded-xl px-4 py-3 text-sm">
        <CheckCircle2 class="text-success size-4" /> {{ t('accounting.yearClose.already', { ref: preview.closingRef ?? '—' }) }}
      </div>
      <div v-else-if="!preview.allMonthsClosed" class="bg-warning/12 text-warning-foreground flex items-start gap-2 rounded-xl px-4 py-3 text-sm">
        <AlertTriangle class="mt-0.5 size-4 shrink-0" />
        <span>{{ t('accounting.yearClose.openMonths', { n: preview.openMonths.length }) }} <span class="tabular-nums" dir="ltr">{{ preview.openMonths.join(', ') }}</span></span>
      </div>

      <div class="grid gap-4 sm:grid-cols-3">
        <MetricTile :label="t('accounting.common.revenue')" :value="preview.revenue" :format="sar" :icon="MtTrendingUp" tone="success" />
        <MetricTile :label="t('accounting.common.expenses')" :value="preview.expenses" :format="sar" :icon="MtTrendingDown" tone="danger" />
        <MetricTile :label="t('accounting.common.netProfit')" :value="preview.net" :format="sar" :icon="MtScale" :tone="preview.net >= 0 ? 'success' : 'danger'" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{{ t('accounting.yearClose.entryPreview') }}</CardTitle>
          <p class="text-muted-foreground text-xs">{{ t('accounting.yearClose.hint') }}</p>
        </CardHeader>
        <CardContent>
          <div class="soft-table overflow-x-auto"><table class="w-full text-sm">
            <thead class="text-muted-foreground border-b"><tr>
              <th class="px-5 py-2 text-start font-medium">{{ t('journal.account') }}</th>
              <th class="px-5 py-2 text-start font-medium">{{ t('common.description') }}</th>
              <th class="px-5 py-2 text-end font-medium">{{ t('ledger.debit') }}</th>
              <th class="px-5 py-2 text-end font-medium">{{ t('ledger.credit') }}</th>
            </tr></thead>
            <tbody>
              <tr v-for="(l, i) in preview.lines" :key="i" class="border-b last:border-0">
                <td class="px-5 py-2"><span dir="ltr" class="tabular-nums">{{ l.accountCode }}</span> — {{ l.accountName }}</td>
                <td class="text-muted-foreground px-5 py-2">{{ l.description }}</td>
                <td class="px-5 py-2 text-end tabular-nums">{{ l.debit ? sar(l.debit, { decimals: 2 }) : '' }}</td>
                <td class="px-5 py-2 text-end tabular-nums">{{ l.credit ? sar(l.credit, { decimals: 2 }) : '' }}</td>
              </tr>
              <tr v-if="!preview.lines.length"><td colspan="4"><EmptyState compact :title="t('common.noData')" /></td></tr>
            </tbody>
          </table></div>
        </CardContent>
      </Card>
    </template>

  </div>
</template>
