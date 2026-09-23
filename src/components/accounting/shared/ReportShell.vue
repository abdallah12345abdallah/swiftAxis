<script setup>
import { useI18n } from 'vue-i18n'
import { Printer, Download } from 'lucide-vue-next'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import BrandLogo from '@/components/common/BrandLogo.vue'
import { useDate } from '@/lib/format'
import { printReport } from '@/lib/export'

/* Frame shared by every accounting report: title, filter bar, print / export
   actions, and a print header inside the .print-area. */
const props = defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  period: { type: String, default: '' },
  exportable: { type: Boolean, default: true },
})
const emit = defineEmits(['export'])
const { t } = useI18n()
const { formatDate } = useDate()
</script>

<template>
  <div class="space-y-4">
    <div class="no-print flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 class="text-lg font-bold">{{ title }}</h2>
        <p v-if="subtitle" class="text-muted-foreground text-sm">{{ subtitle }}</p>
      </div>
      <div class="flex items-center gap-2">
        <slot name="actions" />
        <Button v-if="exportable" variant="outline" size="sm" @click="emit('export')"><Download /> {{ t('common.export') }}</Button>
        <Button variant="outline" size="sm" @click="printReport"><Printer /> {{ t('common.print') }}</Button>
      </div>
    </div>

    <div v-if="$slots.filters" class="no-print flex flex-wrap items-end gap-3">
      <slot name="filters" />
    </div>

    <Card class="print-area overflow-hidden">
      <div class="hidden items-start justify-between border-b p-5 print:flex">
        <div>
          <BrandLogo :mark-size="36" />
          <h2 class="mt-2 text-lg font-bold">{{ title }}</h2>
          <p v-if="period" class="text-muted-foreground text-xs">{{ period }}</p>
        </div>
        <p class="text-muted-foreground text-xs">{{ formatDate(new Date()) }}</p>
      </div>
      <slot />
    </Card>
  </div>
</template>
