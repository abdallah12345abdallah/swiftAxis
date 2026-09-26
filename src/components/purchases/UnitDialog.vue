<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { useToast } from '@/composables/useToast'
import { createUnit, updateUnit } from '@/api/catalogs'

/* Unit of measure: a short code (PCS, LTR …) plus Arabic and English names.
   The code is the key purchase items point at, so it can't change once saved. */
const props = defineProps({
  open: { type: Boolean, default: false },
  unit: { type: Object, default: null },
})
const emit = defineEmits(['update:open', 'saved'])

const { t } = useI18n()
const toast = useToast()
const isEdit = computed(() => !!props.unit)
const saving = ref(false)
const form = reactive({ code: '', name: '', en: '', active: true })
const errors = reactive({})

watch(
  () => props.open,
  (v) => {
    if (!v) return
    Object.assign(form, { code: props.unit?.code ?? '', name: props.unit?.name ?? '', en: props.unit?.en ?? '', active: props.unit?.active ?? true })
    Object.keys(errors).forEach((k) => delete errors[k])
  },
)

async function submit() {
  if (saving.value) return
  Object.keys(errors).forEach((k) => delete errors[k])
  if (!isEdit.value && !/^[A-Za-z0-9]{1,8}$/.test(form.code.trim())) errors.code = t('purchases.units.errCode')
  if (!form.name.trim()) errors.name = t('purchases.units.errName')
  if (Object.keys(errors).length) return
  saving.value = true
  try {
    isEdit.value ? await updateUnit(props.unit.code, { ...form }) : await createUnit({ ...form })
    toast.success(t('purchases.units.saved'))
    emit('saved')
    emit('update:open', false)
  } catch (e) {
    if (e.message === 'DUPLICATE_CODE') errors.code = t('purchases.units.errDuplicate')
    else toast.error(t('common.required'))
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <Dialog :open="open" :title="isEdit ? t('purchases.units.editTitle') : t('purchases.units.addTitle')" @update:open="emit('update:open', $event)">
    <form class="space-y-4" @submit.prevent="submit">
      <div class="space-y-1.5">
        <label class="text-sm font-medium">{{ t('purchases.units.code') }}</label>
        <Input v-model="form.code" dir="ltr" maxlength="8" class="uppercase" :placeholder="t('purchases.units.codePh')" :disabled="isEdit" :invalid="!!errors.code" />
        <p v-if="errors.code" class="text-danger text-xs">{{ errors.code }}</p>
        <p v-else class="text-muted-foreground text-xs">{{ t('purchases.units.codeHint') }}</p>
      </div>
      <div class="grid gap-4 sm:grid-cols-2">
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('purchases.units.name') }}</label>
          <Input v-model="form.name" :placeholder="t('purchases.units.namePh')" :invalid="!!errors.name" />
          <p v-if="errors.name" class="text-danger text-xs">{{ errors.name }}</p>
        </div>
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('purchases.units.en') }}</label>
          <Input v-model="form.en" dir="ltr" placeholder="Carton" />
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
