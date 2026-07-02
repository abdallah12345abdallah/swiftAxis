<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Plus, Trash2, Check } from 'lucide-vue-next'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useCurrency } from '@/composables/useCurrency'
import { useToast } from '@/composables/useToast'
import { postEntry } from '@/api/ledger'

const props = defineProps({
  open: { type: Boolean, default: false },
  accountOptions: { type: Array, default: () => [] },
  costCenterOptions: { type: Array, default: () => [] },
})
const emit = defineEmits(['update:open', 'saved'])

const { t } = useI18n()
const { sar } = useCurrency()
const toast = useToast()
const saving = ref(false)

const blankLine = () => ({ account: '', costCenter: '', debit: '', credit: '' })
const form = reactive({ date: new Date().toISOString().slice(0, 10), description: '', lines: [blankLine(), blankLine()] })

watch(
  () => props.open,
  (v) => {
    if (v) Object.assign(form, { date: new Date().toISOString().slice(0, 10), description: '', lines: [blankLine(), blankLine()] })
  },
)

const totalDebit = computed(() => form.lines.reduce((s, l) => s + (Number(l.debit) || 0), 0))
const totalCredit = computed(() => form.lines.reduce((s, l) => s + (Number(l.credit) || 0), 0))
const balanced = computed(() => totalDebit.value > 0 && Math.round((totalDebit.value - totalCredit.value) * 100) === 0)

function addLine() {
  form.lines.push(blankLine())
}
function removeLine(i) {
  if (form.lines.length > 2) form.lines.splice(i, 1)
}

async function submit() {
  if (saving.value || !balanced.value) return
  saving.value = true
  try {
    await postEntry({ date: form.date, description: form.description, source: 'manual', lines: form.lines })
    toast.success(t('ledger.entrySaved'))
    emit('saved')
    emit('update:open', false)
  } catch (e) {
    toast.error(t('ledger.unbalanced'))
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <Dialog :open="open" size="lg" :title="t('ledger.form.addTitle')" @update:open="emit('update:open', $event)">
    <form class="space-y-4" @submit.prevent="submit">
      <div class="grid gap-4 sm:grid-cols-2">
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('common.date') }}</label>
          <Input v-model="form.date" type="date" dir="ltr" />
        </div>
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('ledger.description') }}</label>
          <Input v-model="form.description" :placeholder="t('ledger.form.descriptionPh')" />
        </div>
      </div>

      <!-- lines -->
      <div class="space-y-2">
        <div class="text-muted-foreground grid grid-cols-[1fr_1fr_auto_auto_auto] gap-2 px-1 text-xs font-medium">
          <span>{{ t('ledger.account') }}</span>
          <span>{{ t('ledger.costCenter') }}</span>
          <span class="w-24">{{ t('ledger.debit') }}</span>
          <span class="w-24">{{ t('ledger.credit') }}</span>
          <span class="w-8" />
        </div>
        <div v-for="(l, i) in form.lines" :key="i" class="grid grid-cols-[1fr_1fr_auto_auto_auto] items-center gap-2">
          <Select v-model="l.account" :options="accountOptions" :placeholder="t('ledger.account')" />
          <Select v-model="l.costCenter" :options="costCenterOptions" :placeholder="t('ledger.costCenter')" />
          <Input v-model="l.debit" type="number" class="w-24" dir="ltr" placeholder="0" />
          <Input v-model="l.credit" type="number" class="w-24" dir="ltr" placeholder="0" />
          <button type="button" class="hover:bg-accent text-muted-foreground hover:text-danger grid size-8 place-items-center rounded-lg" @click="removeLine(i)">
            <Trash2 class="size-4" />
          </button>
        </div>
        <Button type="button" variant="ghost" size="sm" @click="addLine"><Plus /> {{ t('ledger.addLine') }}</Button>
      </div>

      <!-- totals -->
      <div class="bg-muted/40 flex items-center justify-between rounded-lg px-4 py-3 text-sm">
        <div class="flex gap-5">
          <span>{{ t('ledger.totalDebit') }}: <b class="tabular-nums">{{ sar(totalDebit) }}</b></span>
          <span>{{ t('ledger.totalCredit') }}: <b class="tabular-nums">{{ sar(totalCredit) }}</b></span>
        </div>
        <span
          class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold"
          :class="balanced ? 'bg-success/12 text-success' : 'bg-danger/12 text-danger'"
        >
          <Check v-if="balanced" class="size-3.5" />
          {{ balanced ? t('ledger.balanced') : t('ledger.unbalanced') }}
        </span>
      </div>
    </form>

    <template #footer>
      <Button variant="ghost" @click="emit('update:open', false)">{{ t('common.cancel') }}</Button>
      <Button :disabled="saving || !balanced" @click="submit">{{ t('ledger.form.save') }}</Button>
    </template>
  </Dialog>
</template>
