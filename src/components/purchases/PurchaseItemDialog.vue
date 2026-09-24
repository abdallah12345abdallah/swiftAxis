<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Dropdown } from '@/components/ui/dropdown'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { useToast } from '@/composables/useToast'
import { createPurchaseItem, updatePurchaseItem, fetchUnits, unitCode } from '@/api/catalogs'

const props = defineProps({
  open: { type: Boolean, default: false },
  item: { type: Object, default: null },
  categoryOptions: { type: Array, default: () => [] },
})
const emit = defineEmits(['update:open', 'saved'])

const { t, locale } = useI18n()
const toast = useToast()
const isEdit = computed(() => !!props.item)
const saving = ref(false)
const form = reactive({ name: '', category: 'other', unit: '', active: true })
const errors = reactive({})

/* coded units of measure — the unit is picked, not typed */
const units = ref([])
const unitOptions = computed(() =>
  units.value
    .filter((u) => u.active !== false || u.code === form.unit)
    .map((u) => ({ value: u.code, label: `${u.code} — ${locale.value === 'ar' ? u.name : u.en}` })),
)

watch(
  () => props.open,
  (v) => {
    if (!v) return
    Object.assign(form, { name: props.item?.name ?? '', category: props.item?.category ?? 'other', unit: unitCode(props.item?.unit), active: props.item?.active ?? true })
    delete errors.name
    delete errors.unit
    fetchUnits().then((u) => (units.value = u))
  },
)

async function submit() {
  if (saving.value) return
  delete errors.name
  delete errors.unit
  if (!form.name.trim()) errors.name = t('purchases.items.errName')
  if (!form.unit) errors.unit = t('purchases.items.errUnit')
  if (errors.name || errors.unit) return
  saving.value = true
  try {
    isEdit.value ? await updatePurchaseItem(props.item.id, { ...form }) : await createPurchaseItem({ ...form })
    toast.success(t('purchases.items.saved'))
    emit('saved')
    emit('update:open', false)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <Dialog :open="open" :title="isEdit ? t('purchases.items.editTitle') : t('purchases.items.addTitle')" @update:open="emit('update:open', $event)">
    <form class="space-y-4" @submit.prevent="submit">
      <div class="space-y-1.5">
        <label class="text-sm font-medium">{{ t('purchases.items.name') }}</label>
        <Input v-model="form.name" :invalid="!!errors.name" />
        <p v-if="errors.name" class="text-danger text-xs">{{ errors.name }}</p>
      </div>
      <div class="grid gap-4 sm:grid-cols-2">
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('purchases.items.category') }}</label>
          <Dropdown v-model="form.category" :options="categoryOptions" />
        </div>
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('purchases.items.unit') }}</label>
          <Dropdown v-model="form.unit" :options="unitOptions" :placeholder="t('purchases.items.unitPick')" :invalid="!!errors.unit" searchable />
          <p v-if="errors.unit" class="text-danger text-xs">{{ errors.unit }}</p>
        </div>
      </div>
      <div class="bg-muted/40 flex items-center justify-between rounded-lg px-4 py-3">
        <span class="text-sm font-medium">{{ t('common.status') }}</span>
        <Switch v-model="form.active" />
      </div>
    </form>
    <template #footer>
      <Button variant="ghost" @click="emit('update:open', false)">{{ t('common.cancel') }}</Button>
      <Button :disabled="saving" @click="submit">{{ t('common.save') }}</Button>
    </template>
  </Dialog>
</template>
