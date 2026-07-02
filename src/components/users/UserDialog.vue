<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { useToast } from '@/composables/useToast'
import { createUser, updateUser } from '@/api/users'

const props = defineProps({
  open: { type: Boolean, default: false },
  user: { type: Object, default: null },
  roleOptions: { type: Array, default: () => [] },
})
const emit = defineEmits(['update:open', 'saved'])

const { t } = useI18n()
const toast = useToast()
const isEdit = computed(() => !!props.user)
const saving = ref(false)
const form = reactive({ name: '', role: 'supervisor', mobile: '', active: true })
const errors = reactive({})

watch(
  () => props.open,
  (v) => {
    if (!v) return
    Object.assign(form, { name: props.user?.name ?? '', role: props.user?.role ?? 'supervisor', mobile: props.user?.mobile ?? '', active: props.user?.active ?? true })
    delete errors.name
  },
)

async function submit() {
  if (saving.value) return
  if (!form.name.trim()) {
    errors.name = t('users.errName')
    return
  }
  saving.value = true
  try {
    isEdit.value ? await updateUser(props.user.id, { ...form }) : await createUser({ ...form })
    toast.success(t('users.saved'))
    emit('saved')
    emit('update:open', false)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <Dialog :open="open" :title="t('users.userTitle')" @update:open="emit('update:open', $event)">
    <form class="space-y-4" @submit.prevent="submit">
      <div class="space-y-1.5">
        <label class="text-sm font-medium">{{ t('users.name') }}</label>
        <Input v-model="form.name" :invalid="!!errors.name" />
        <p v-if="errors.name" class="text-danger text-xs">{{ errors.name }}</p>
      </div>
      <div class="grid gap-4 sm:grid-cols-2">
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('users.role') }}</label>
          <Select v-model="form.role" :options="roleOptions" />
        </div>
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('users.mobile') }}</label>
          <Input v-model="form.mobile" dir="ltr" inputmode="tel" />
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
