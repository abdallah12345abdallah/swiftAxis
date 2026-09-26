<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Check, ShieldCheck } from 'lucide-vue-next'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Dropdown } from '@/components/ui/dropdown'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { useToast } from '@/composables/useToast'
import { TREASURY_KINDS } from '@/api/fixtures'
import { cn } from '@/lib/utils'
import { createTreasury, updateTreasury, treasuryUsers } from '@/api/treasury'

const props = defineProps({
  open: { type: Boolean, default: false },
  treasury: { type: Object, default: null },
})
const emit = defineEmits(['update:open', 'saved'])

const { t, locale } = useI18n()
const toast = useToast()
const isEdit = computed(() => !!props.treasury)
const saving = ref(false)
const form = reactive({ name: '', kind: 'cash', iban: '', opening: '', active: true, userIds: [] })
const errors = reactive({})

/* which users may work on this box (vouchers, transfers), picked by name.
   Managers always can. */
const userChoices = computed(() => (props.open ? treasuryUsers() : []))
function toggleUser(id) {
  form.userIds = form.userIds.includes(id) ? form.userIds.filter((x) => x !== id) : [...form.userIds, id]
}

const kindOptions = computed(() => Object.keys(TREASURY_KINDS).map((k) => ({ value: k, label: TREASURY_KINDS[k][locale.value] ?? TREASURY_KINDS[k].ar })))

watch(
  () => props.open,
  (v) => {
    if (!v) return
    Object.assign(form, {
      name: props.treasury?.name ?? '',
      kind: props.treasury?.kind ?? 'cash',
      iban: props.treasury?.iban ?? '',
      opening: props.treasury?.opening ?? '',
      active: props.treasury?.active ?? true,
      // an older box without a list is open to everyone: show that as all ticked; a new box starts empty
      userIds: Array.isArray(props.treasury?.userIds) ? [...props.treasury.userIds] : props.treasury ? treasuryUsers().map((u) => u.id) : [],
    })
    delete errors.name
  },
)

async function submit() {
  if (saving.value) return
  if (!form.name.trim()) {
    errors.name = t('treasury.errName')
    return
  }
  saving.value = true
  try {
    isEdit.value ? await updateTreasury(props.treasury.id, { ...form }) : await createTreasury({ ...form })
    toast.success(t('treasury.saved'))
    emit('saved')
    emit('update:open', false)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <Dialog :open="open" :title="isEdit ? t('treasury.editTitle') : t('treasury.addTitle')" @update:open="emit('update:open', $event)">
    <form class="space-y-4" @submit.prevent="submit">
      <div class="space-y-1.5">
        <label class="text-sm font-medium">{{ t('treasury.name') }}</label>
        <Input v-model="form.name" :invalid="!!errors.name" />
        <p v-if="errors.name" class="text-danger text-xs">{{ errors.name }}</p>
      </div>
      <div class="grid gap-4 sm:grid-cols-2">
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('treasury.kind') }}</label>
          <Dropdown v-model="form.kind" :options="kindOptions" />
        </div>
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('treasury.opening') }}</label>
          <Input v-model="form.opening" type="number" dir="ltr" :disabled="isEdit" />
        </div>
      </div>
      <div v-if="form.kind === 'bank'" class="space-y-1.5">
        <label class="text-sm font-medium">{{ t('treasury.iban') }}</label>
        <Input v-model="form.iban" dir="ltr" placeholder="SA00 0000 0000 0000 0000 0000" />
      </div>
      <fieldset class="space-y-2">
        <legend class="flex items-center gap-1.5 text-sm font-medium"><ShieldCheck class="text-primary size-4" /> {{ t('treasury.access.title') }}</legend>
        <p class="text-muted-foreground text-xs">{{ t('treasury.access.hint') }}</p>
        <div class="flex flex-wrap gap-2">
          <span class="border-primary/30 bg-primary/10 text-primary inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium">
            <Check class="size-3.5" /> {{ t('treasury.access.managers') }} <span class="opacity-70">· {{ t('treasury.access.always') }}</span>
          </span>
          <button
            v-for="u in userChoices"
            :key="u.id"
            type="button"
            :aria-pressed="form.userIds.includes(u.id)"
            :class="cn(
              'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors motion-reduce:transition-none focus-visible:ring-primary/30 outline-none focus-visible:ring-4',
              form.userIds.includes(u.id) ? 'border-primary bg-primary text-primary-foreground' : 'bg-muted/40 text-muted-foreground hover:text-foreground border-transparent',
            )"
            @click="toggleUser(u.id)"
          >
            <Check v-if="form.userIds.includes(u.id)" class="size-3.5" />
            {{ u.name }} <span class="opacity-70">· {{ t(`roles.${u.role}`) }}</span>
          </button>
        </div>
      </fieldset>
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
