<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { useToast } from '@/composables/useToast'
import { createSupplier, updateSupplier } from '@/api/purchases'

const props = defineProps({
  open: { type: Boolean, default: false },
  supplier: { type: Object, default: null },
  categoryOptions: { type: Array, default: () => [] },
})
const emit = defineEmits(['update:open', 'saved'])

const { t } = useI18n()
const toast = useToast()
const isEdit = computed(() => !!props.supplier)
const saving = ref(false)
const form = reactive({ name: '', taxNo: '', mobile: '', category: 'parts', active: true })
const errors = reactive({})

watch(
  () => props.open,
  (v) => {
    if (!v) return
    Object.assign(form, {
      name: props.supplier?.name ?? '', taxNo: props.supplier?.taxNo ?? '', mobile: props.supplier?.mobile ?? '',
      category: props.supplier?.category ?? 'parts', active: props.supplier?.active ?? true,
    })
    Object.keys(errors).forEach((k) => delete errors[k])
  },
)

async function submit() {
  if (saving.value) return
  Object.keys(errors).forEach((k) => delete errors[k])
  if (!form.name.trim()) errors.name = t('purchases.supplier.errName')
  if (!/^3\d{13}3$/.test(form.taxNo.trim())) errors.taxNo = t('purchases.supplier.errTax')
  if (Object.keys(errors).length) return
  saving.value = true
  try {
    isEdit.value ? await updateSupplier(props.supplier.id, { ...form }) : await createSupplier({ ...form })
    toast.success(t('purchases.saved'))
    emit('saved')
    emit('update:open', false)
  } catch (e) {
    if (e.message === 'INVALID_TAX') errors.taxNo = t('purchases.supplier.errTax')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <Dialog :open="open" :title="t('purchases.supplierTitle')" @update:open="emit('update:open', $event)">
    <form class="space-y-4" @submit.prevent="submit">
      <div class="space-y-1.5">
        <label class="text-sm font-medium">{{ t('purchases.supplier.name') }}</label>
        <Input v-model="form.name" :invalid="!!errors.name" />
        <p v-if="errors.name" class="text-danger text-xs">{{ errors.name }}</p>
      </div>
      <div class="space-y-1.5">
        <label class="text-sm font-medium">{{ t('purchases.supplier.taxNo') }}</label>
        <Input v-model="form.taxNo" dir="ltr" inputmode="numeric" placeholder="3XXXXXXXXXXXXX3" :invalid="!!errors.taxNo" />
        <p v-if="errors.taxNo" class="text-danger text-xs">{{ errors.taxNo }}</p>
      </div>
      <div class="grid gap-4 sm:grid-cols-2">
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('purchases.supplier.mobile') }}</label>
          <Input v-model="form.mobile" dir="ltr" inputmode="tel" />
        </div>
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('purchases.supplier.category') }}</label>
          <Select v-model="form.category" :options="categoryOptions" />
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
