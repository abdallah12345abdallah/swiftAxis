<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Trophy } from 'lucide-vue-next'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useCurrency } from '@/composables/useCurrency'

const props = defineProps({
  riders: { type: Array, default: () => [] },
})

const { t } = useI18n()
const { sar, num } = useCurrency()

const top = computed(() => props.riders.slice(0, 5))

const RANK = {
  0: 'bg-[#f5c518]/15 text-[#b8860b] ring-[#f5c518]/40',
  1: 'bg-muted-foreground/10 text-muted-foreground ring-muted-foreground/30',
  2: 'bg-orange/15 text-orange ring-orange/40',
}
</script>

<template>
  <Card class="h-full">
    <CardHeader>
      <CardTitle class="flex items-center gap-2">
        <Trophy class="text-orange size-4" /> {{ t('dashboard.topRidersTitle') }}
      </CardTitle>
    </CardHeader>
    <CardContent class="space-y-1">
      <div
        v-for="(r, i) in top"
        :key="r.id"
        class="hover:bg-muted/40 flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors"
      >
        <span
          class="grid size-8 shrink-0 place-items-center rounded-full text-sm font-bold ring-1"
          :class="RANK[i] ?? 'bg-muted text-muted-foreground ring-transparent'"
        >
          {{ i + 1 }}
        </span>
        <div class="min-w-0 flex-1">
          <div class="flex items-center justify-between gap-2">
            <p class="truncate text-sm font-semibold">{{ r.name }}</p>
            <p class="text-xs font-semibold tabular-nums">{{ sar(r.commission) }}</p>
          </div>
          <div class="mt-1.5 flex items-center gap-2">
            <Progress :value="r.progress" class="h-1.5 flex-1" :indicator-class="r.progress >= 100 ? 'bg-success' : 'bg-primary'" />
            <span class="text-muted-foreground w-14 text-end text-xs tabular-nums">{{ num(r.orders) }}</span>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
