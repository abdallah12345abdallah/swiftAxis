<script setup>
import { useI18n } from 'vue-i18n'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useCurrency } from '@/composables/useCurrency'
import { CONTRACTS } from '@/api/fixtures'

const props = defineProps({
  riders: { type: Array, default: () => [] },
})

const { t, locale } = useI18n()
const { sar, num } = useCurrency()

function contractLabel(key) {
  const c = CONTRACTS[key]
  return c ? c[locale.value] ?? c.ar : key
}

function statusVariant(r) {
  if (!r.active) return 'secondary'
  if (r.underperforming) return 'warning'
  return 'success'
}
function statusLabel(r) {
  if (!r.active) return t('dashboard.status.inactive')
  if (r.underperforming) return t('dashboard.status.warning')
  return t('dashboard.status.active')
}
function barClass(r) {
  if (r.progress >= 100) return 'bg-success'
  if (r.underperforming) return 'bg-danger'
  return 'bg-primary'
}
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>{{ t('dashboard.ridersTitle') }}</CardTitle>
    </CardHeader>
    <CardContent class="px-0">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-muted-foreground border-b text-start">
              <th class="px-5 py-2.5 text-start font-medium">{{ t('dashboard.table.rider') }}</th>
              <th class="px-5 py-2.5 text-start font-medium">{{ t('dashboard.table.contract') }}</th>
              <th class="px-5 py-2.5 text-start font-medium">{{ t('dashboard.table.orders') }}</th>
              <th class="hidden px-5 py-2.5 text-start font-medium md:table-cell">
                {{ t('dashboard.table.progress') }}
              </th>
              <th class="px-5 py-2.5 text-start font-medium">{{ t('dashboard.table.commission') }}</th>
              <th class="px-5 py-2.5 text-start font-medium">{{ t('dashboard.table.status') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="r in riders"
              :key="r.id"
              class="hover:bg-muted/40 border-b transition-colors last:border-0"
            >
              <td class="px-5 py-3 font-medium">{{ r.name }}</td>
              <td class="text-muted-foreground px-5 py-3">{{ contractLabel(r.contract) }}</td>
              <td class="px-5 py-3 tabular-nums">{{ num(r.orders) }}</td>
              <td class="hidden px-5 py-3 md:table-cell">
                <div class="flex items-center gap-2">
                  <Progress :value="r.progress" :indicator-class="barClass(r)" class="w-28" />
                  <span class="text-muted-foreground w-10 text-xs tabular-nums">{{ r.progress }}%</span>
                </div>
              </td>
              <td class="px-5 py-3 font-semibold tabular-nums">{{ sar(r.commission) }}</td>
              <td class="px-5 py-3">
                <Badge :variant="statusVariant(r)">{{ statusLabel(r) }}</Badge>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </CardContent>
  </Card>
</template>
