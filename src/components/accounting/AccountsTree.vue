<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import ActionMenu from '@/components/common/ActionMenu.vue'
import { Plus, Pencil, ChevronDown, ChevronLeft, Folder, FileText } from 'lucide-vue-next'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Dropdown } from '@/components/ui/dropdown'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { useCurrency } from '@/composables/useCurrency'
import { useToast } from '@/composables/useToast'
import { useAccountingOptions } from '@/composables/useAccountingOptions'
import { fetchAccountTree, createAccount, updateAccount } from '@/api/accounting'

/* Chart of accounts as an expandable tree (شجرة الحسابات العامة). Groups get
   children; leaves take postings and map to a financial-statement item. */
const { t, locale } = useI18n()
const { sar } = useCurrency()
const toast = useToast()
const opts = useAccountingOptions()
const loading = ref(true)
const rows = ref([])
const collapsed = ref(new Set())
const dialog = ref(false)
const editing = ref(null)
const parent = ref(null)
const saving = ref(false)
const error = ref('')
const form = reactive({ code: '', name: '', en: '', type: 'asset', isGroup: false, statementItem: '', active: true })

async function load() {
  loading.value = true
  ;[rows.value] = await Promise.all([fetchAccountTree(), opts.loaded.value ? null : opts.load()])
  loading.value = false
}
onMounted(load)

const name = (a) => (locale.value === 'ar' ? a.name : a.en)
const isHidden = (a) => {
  let p = a.parent
  while (p) {
    if (collapsed.value.has(p)) return true
    p = rows.value.find((x) => x.id === p)?.parent ?? null
  }
  return false
}
const visible = computed(() => rows.value.filter((a) => !isHidden(a)))
function toggle(id) {
  const s = new Set(collapsed.value)
  s.has(id) ? s.delete(id) : s.add(id)
  collapsed.value = s
}
const typeOptions = computed(() => ['asset', 'liability', 'equity', 'revenue', 'expense'].map((k) => ({ value: k, label: t(`accounting.types.${k}`) })))
const itemOptions = computed(() => [{ value: '', label: t('accounting.common.none') }, ...opts.itemOptions.value])

function openAdd(p = null) {
  editing.value = null
  parent.value = p
  const codeHint = p ? `${p.code.slice(0, p.level === 1 ? 1 : 2)}` : ''
  Object.assign(form, { code: codeHint, name: '', en: '', type: p?.type ?? 'asset', isGroup: !p || p.level < 2, statementItem: '', active: true })
  error.value = ''
  dialog.value = true
}
function openEdit(a) {
  editing.value = a
  parent.value = rows.value.find((x) => x.id === a.parent) ?? null
  Object.assign(form, { code: a.code, name: a.name, en: a.en, type: a.type, isGroup: a.isGroup, statementItem: a.statementItem ?? '', active: a.active !== false })
  error.value = ''
  dialog.value = true
}
const ERR = { DUPLICATE: 'accounting.accounts.errDuplicate', CODE_REQUIRED: 'common.required', NAME_REQUIRED: 'common.required', PARENT_NOT_GROUP: 'accounting.accounts.errParent', HAS_MOVEMENT: 'accounting.accounts.errMovement', TYPE_REQUIRED: 'common.required' }
async function save() {
  if (saving.value) return
  saving.value = true
  error.value = ''
  try {
    editing.value ? await updateAccount(editing.value.id, { ...form }) : await createAccount({ ...form, parent: parent.value?.id ?? null })
    toast.success(t('common.saved'))
    dialog.value = false
    await load()
  } catch (e) {
    error.value = t(ERR[e.message] ?? 'journal.errGeneric')
  } finally {
    saving.value = false
  }
}
const typeVariant = { asset: 'default', liability: 'warning', equity: 'accent', revenue: 'success', expense: 'danger' }
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <p class="text-muted-foreground text-sm">{{ t('accounting.accounts.hint') }}</p>
      <Button @click="openAdd(null)"><Plus /> {{ t('accounting.accounts.addRoot') }}</Button>
    </div>

    <Card class="overflow-hidden">
      <div v-if="loading" class="space-y-3 p-5"><Skeleton v-for="i in 8" :key="i" class="h-10 rounded-lg" /></div>
      <div v-else class="overflow-x-auto">
        <div class="soft-table overflow-x-auto"><table class="w-full text-sm">
          <thead>
            <tr class="text-muted-foreground border-b">
              <th class="px-5 py-3 text-start font-medium">{{ t('journal.account') }}</th>
              <th class="hidden px-5 py-3 text-start font-medium md:table-cell">{{ t('accounting.common.type') }}</th>
              <th class="hidden px-5 py-3 text-start font-medium lg:table-cell">{{ t('accounting.items.item') }}</th>
              <th class="px-5 py-3 text-end font-medium">{{ t('ledger.balance') }}</th>
              <th class="px-5 py-3 text-end font-medium">{{ t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="a in visible" :key="a.id" class="hover:bg-muted/40 border-b transition-colors last:border-0" :class="a.active === false && 'opacity-50'">
              <td class="px-5 py-2.5">
                <div class="flex items-center gap-2" :style="{ paddingInlineStart: `${(a.level - 1) * 1.5}rem` }">
                  <button v-if="a.isGroup" type="button" class="hover:bg-accent text-muted-foreground grid size-6 place-items-center rounded-md" @click="toggle(a.id)">
                    <component :is="collapsed.has(a.id) ? ChevronLeft : ChevronDown" class="size-4 rtl:rotate-0" />
                  </button>
                  <span v-else class="size-6" />
                  <component :is="a.isGroup ? Folder : FileText" class="size-4 shrink-0" :class="a.isGroup ? 'text-orange' : 'text-muted-foreground'" />
                  <span dir="ltr" class="font-mono text-xs font-semibold tabular-nums">{{ a.code }}</span>
                  <span :class="a.isGroup ? 'font-bold' : 'font-medium'">{{ name(a) }}</span>
                  <Badge v-if="a.isGroup" variant="secondary" class="text-[10px]">L{{ a.level }} · {{ a.children }}</Badge>
                </div>
              </td>
              <td class="hidden px-5 py-2.5 md:table-cell"><Badge :variant="typeVariant[a.type] ?? 'secondary'">{{ t(`accounting.types.${a.type}`) }}</Badge></td>
              <td class="text-muted-foreground hidden px-5 py-2.5 text-xs lg:table-cell">{{ a.isGroup ? '' : a.statementItemName ?? '—' }}</td>
              <td class="px-5 py-2.5 text-end tabular-nums" :class="a.isGroup ? 'font-semibold' : ''">{{ a.hasMovement || a.isGroup ? sar(a.balance, { decimals: 2 }) : '—' }}<span class="text-muted-foreground ms-1 text-[10px]">{{ a.nature === 'credit' ? t('accounting.common.creditNature') : t('accounting.common.debitNature') }}</span></td>
              <td class="px-5 py-2.5">
                <div class="flex justify-end">
                  <ActionMenu :items="[
                    { label: t('accounting.accounts.addChild'), icon: Plus, tone: 'green', show: a.isGroup, onSelect: () => openAdd(a) },
                    { label: t('common.edit'), icon: Pencil, tone: 'blue', onSelect: () => openEdit(a) },
                  ]" />
                </div>
              </td>
            </tr>
          </tbody>
        </table></div>
      </div>
    </Card>

    <Dialog v-model:open="dialog" :title="editing ? t('accounting.accounts.editTitle') : t('accounting.accounts.addTitle')" :description="parent ? `${t('accounting.common.parent')}: ${parent.code} — ${name(parent)}` : t('accounting.common.root')">
      <form class="space-y-4" @submit.prevent="save">
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="space-y-1.5"><label class="text-sm font-medium">{{ t('accounting.common.code') }}</label><Input v-model="form.code" dir="ltr" /></div>
          <div v-if="!parent" class="space-y-1.5"><label class="text-sm font-medium">{{ t('accounting.common.type') }}</label><Dropdown v-model="form.type" :options="typeOptions" :disabled="!!editing" /></div>
          <div class="space-y-1.5"><label class="text-sm font-medium">{{ t('common.name') }}</label><Input v-model="form.name" /></div>
          <div class="space-y-1.5"><label class="text-sm font-medium">{{ t('accounting.common.nameEn') }}</label><Input v-model="form.en" dir="ltr" /></div>
        </div>
        <div v-if="!editing" class="bg-muted/40 flex items-center justify-between rounded-lg px-4 py-3">
          <span class="text-sm font-medium">{{ t('accounting.accounts.isGroup') }}</span><Switch v-model="form.isGroup" />
        </div>
        <div v-if="!form.isGroup" class="space-y-1.5"><label class="text-sm font-medium">{{ t('accounting.items.item') }}</label><Dropdown v-model="form.statementItem" :options="itemOptions" searchable /></div>
        <div v-if="editing" class="bg-muted/40 flex items-center justify-between rounded-lg px-4 py-3"><span class="text-sm font-medium">{{ t('common.status') }}</span><Switch v-model="form.active" /></div>
        <p v-if="error" class="text-danger text-xs">{{ error }}</p>
      </form>
      <template #footer>
        <Button variant="ghost" @click="dialog = false">{{ t('common.cancel') }}</Button>
        <Button :disabled="saving" @click="save">{{ t('common.save') }}</Button>
      </template>
    </Dialog>
  </div>
</template>
