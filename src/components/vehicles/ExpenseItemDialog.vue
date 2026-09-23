<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Dropdown } from '@/components/ui/dropdown'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { useToast } from '@/composables/useToast'
import { createExpenseItem, updateExpenseItem } from '@/api/catalogs'

const props = defineProps({
  open: { type: Boolean, default: false },
  item: { type: Object, default: null },
  accountOptions: { type: Array, default: () => [] }, // expense accounts
})
const emit = defineEmits(['update:open', 'saved'])

const { t } = useI18n()
const toast = useToast()
const isEdit = computed(() => !!props.item)
const saving = ref(false)
const form = reactive({ name: '', en: '', account: 'general_expense', active: true })
const errors = reactive({})

watch(
  () => props.open,
  (v) => {
    if (!v) return
    Object.assign(form, { name: props.item?.name ?? '', en: props.item?.en ?? '', account: props.item?.account ?? 'general_expense', active: props.item?.active ?? true })
    delete errors.name
  },
)

async function submit() {
  if (saving.value) return
  if (!form.name.trim()) {
    errors.name = t('vehicles.expenseItems.errName')
    return
  }
  saving.value = true
  try {
    isEdit.value ? await updateExpenseItem(props.item.id, { ...form }) : await createExpenseItem({ ...form })
    toast.success(t('vehicles.expenseItems.saved'))
    emit('saved')
    emit('update:open', false)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <Dialog :open="open" :title="isEdit ? t('vehicles.expenseItems.editTitle') : t('vehicles.expenseItems.addTitle')" @update:open="emit('update:open', $event)">
    <form class="space-y-4" @submit.prevent="submit">
      <div class="grid gap-4 sm:grid-cols-2">
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('vehicles.expenseItems.name') }}</label>
          <Input v-model="form.name" :invalid="!!errors.name" />
          <p v-if="errors.name" class="text-danger text-xs">{{ errors.name }}</p>
        </div>
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('vehicles.expenseItems.nameEn') }}</label>
          <Input v-model="form.en" dir="ltr" />
        </div>
      </div>
      <div class="space-y-1.5">
        <label class="text-sm font-medium">{{ t('vehicles.expenseItems.account') }}</label>
        <Dropdown v-model="form.account" :options="accountOptions" />
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
