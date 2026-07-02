<script setup>
import { useI18n } from 'vue-i18n'
import { Wallet, TrendingDown, BellRing } from 'lucide-vue-next'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useCurrency } from '@/composables/useCurrency'

defineProps({
  alerts: { type: Array, default: () => [] },
})

const { t } = useI18n()
const { num } = useCurrency()
</script>

<template>
  <Card class="h-full">
    <CardHeader class="flex-row items-center justify-between">
      <CardTitle class="flex items-center gap-2">
        <BellRing class="text-orange size-4" />
        {{ t('dashboard.alertsTitle') }}
      </CardTitle>
      <span v-if="alerts.length" class="bg-danger/12 text-danger rounded-full px-2 py-0.5 text-xs font-bold">
        {{ alerts.length }}
      </span>
    </CardHeader>
    <CardContent class="space-y-2.5">
      <p v-if="!alerts.length" class="text-muted-foreground py-6 text-center text-sm">
        {{ t('dashboard.alerts.empty') }}
      </p>

      <div
        v-for="(a, i) in alerts"
        :key="i"
        class="flex items-start gap-3 rounded-xl border p-3"
        :class="a.type === 'wallet' ? 'border-danger/25 bg-danger/5' : 'border-warning/30 bg-warning/5'"
      >
        <div
          class="flex size-8 shrink-0 items-center justify-center rounded-lg"
          :class="a.type === 'wallet' ? 'bg-danger/12 text-danger' : 'bg-warning/15 text-warning-foreground'"
        >
          <Wallet v-if="a.type === 'wallet'" class="size-4" />
          <TrendingDown v-else class="size-4" />
        </div>
        <p class="text-sm leading-snug">
          <template v-if="a.type === 'wallet'">
            {{ t('dashboard.alerts.walletOver', { name: a.name, amount: num(a.amount) }) }}
          </template>
          <template v-else>
            {{ t('dashboard.alerts.lowPerformer', { name: a.name }) }}
          </template>
        </p>
      </div>
    </CardContent>
  </Card>
</template>
