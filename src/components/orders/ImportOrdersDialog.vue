<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { AlertTriangle } from 'lucide-vue-next'
import { Dialog } from '@/components/ui/dialog'
import { FileDrop } from '@/components/ui/file-drop'
import { Button } from '@/components/ui/button'
import { useCurrency } from '@/composables/useCurrency'
import { useToast } from '@/composables/useToast'
import { parseImport, importOrders } from '@/api/orders'

const props = defineProps({ open: { type: Boolean, default: false } })
const emit = defineEmits(['update:open', 'saved'])

const { t } = useI18n()
const { num, sar } = useCurrency()
const toast = useToast()

const file = ref(null)
const rows = ref([])
const parsing = ref(false)
const saving = ref(false)

watch(
  () => props.open,
  (v) => {
    if (!v) return
    file.value = null
    rows.value = []
  },
)

watch(file, async (f) => {
  if (!f) return
  parsing.value = true
  rows.value = await parseImport()
  parsing.value = false
})

async function confirm() {
  if (saving.value || !rows.value.length) return
  saving.value = true
  try {
    const created = await importOrders(rows.value)
    toast.success(t('orders.imported', { n: created.length }))
    emit('saved')
    emit('update:open', false)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <Dialog :open="open" size="lg" :title="t('orders.importTitle')" @update:open="emit('update:open', $event)">
    <div class="space-y-4">
      <FileDrop v-model="file" :hint="t('orders.importHint')" />

      <div v-if="parsing" class="text-muted-foreground py-6 text-center text-sm">…</div>

      <div v-else-if="rows.length">
        <p class="text-muted-foreground mb-2 text-sm font-medium">{{ t('orders.review') }}</p>
        <div class="overflow-hidden rounded-xl border">
          <table class="w-full text-sm">
            <thead class="bg-muted/50 text-muted-foreground">
              <tr>
                <th class="px-4 py-2 text-start font-medium">{{ t('orders.filterRider') }}</th>
                <th class="px-4 py-2 text-start font-medium">{{ t('orders.fields.orders') }}</th>
                <th class="px-4 py-2 text-start font-medium">{{ t('orders.fields.cash') }}</th>
                <th class="px-4 py-2" />
              </tr>
            </thead>
            <tbody>
              <tr v-for="(r, i) in rows" :key="i" class="border-t" :class="r.conflict ? 'bg-warning/5' : ''">
                <td class="px-4 py-2 font-medium" dir="ltr">{{ r.riderId }}</td>
                <td class="px-4 py-2 tabular-nums">{{ num(r.orders) }}</td>
                <td class="px-4 py-2 tabular-nums">{{ sar(r.cash) }}</td>
                <td class="px-4 py-2">
                  <span v-if="r.conflict" class="text-warning-foreground inline-flex items-center gap-1 text-xs">
                    <AlertTriangle class="size-3.5" /> {{ t('orders.conflict') }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <template #footer>
      <Button variant="ghost" @click="emit('update:open', false)">{{ t('common.cancel') }}</Button>
      <Button :disabled="saving || !rows.length" @click="confirm">{{ t('orders.confirmImport') }}</Button>
    </template>
  </Dialog>
</template>
