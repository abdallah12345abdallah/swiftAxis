<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import ActionMenu from '@/components/common/ActionMenu.vue'
import { Plus, Pencil } from 'lucide-vue-next'
import { Card } from '@/components/ui/card'
import { DataTable } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs } from '@/components/ui/tabs'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Dropdown } from '@/components/ui/dropdown'
import { useCurrency } from '@/composables/useCurrency'
import { useToast } from '@/composables/useToast'
import { fetchStatementItems, createStatementItem, updateStatementItem } from '@/api/accounting'

const { t, locale } = useI18n()
const { num } = useCurrency()
const toast = useToast()
const loading = ref(true)
const rows = ref([])
const statement = ref('income')
const dialog = ref(false)
const editing = ref(null)
const saving = ref(false)
const error = ref('')
const form = reactive({ statement: 'income', section: 'revenue', code: '', name: '', en: '', order: 1 })

const SECTIONS = { income: ['revenue', 'cost', 'admin', 'other'], balance: ['current_assets', 'fixed_assets', 'current_liabilities', 'equity'] }
const tabs = computed(() => [{ value: 'income', label: t('accounting.items.income') }, { value: 'balance', label: t('accounting.items.balance') }])
const filtered = computed(() => rows.value.filter((i) => i.statement === statement.value))
const sectionOptions = computed(() => SECTIONS[form.statement].map((s) => ({ value: s, label: t(`accounting.sections.${s}`) })))

async function load() {
  loading.value = true
  rows.value = await fetchStatementItems()
  loading.value = false
}
onMounted(load)
function open(i = null) {
  editing.value = i
  Object.assign(form, { statement: i?.statement ?? statement.value, section: i?.section ?? SECTIONS[statement.value][0], code: i?.code ?? '', name: i?.name ?? '', en: i?.en ?? '', order: i?.order ?? rows.value.length + 1 })
  error.value = ''
  dialog.value = true
}
async function save() {
  if (saving.value) return
  saving.value = true
  error.value = ''
  try {
    editing.value ? await updateStatementItem(editing.value.id, { ...form }) : await createStatementItem({ ...form })
    toast.success(t('common.saved'))
    dialog.value = false
    await load()
  } catch (e) {
    error.value = t(e.message === 'DUPLICATE' ? 'accounting.items.errDuplicate' : 'common.required')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <Tabs v-model="statement" :tabs="tabs" />
      <Button @click="open()"><Plus /> {{ t('accounting.items.add') }}</Button>
    </div>
    <Card class="overflow-hidden">
      <DataTable
        :loading="loading" :rows="filtered" :empty="t('common.noData')"
        :columns="[
          { key: 'order', label: '#', align: 'end' },
          { key: 'code', label: t('accounting.common.code'), sortable: true },
          { key: 'name', label: t('common.name'), sortable: true },
          { key: 'section', label: t('accounting.common.section') },
          { key: 'accounts', label: t('accounting.items.linked'), align: 'end', hideBelow: 'md' },
          { key: 'actions', label: t('common.actions'), align: 'end' },
        ]"
      >
        <template #cell-order="{ row }"><span class="text-muted-foreground tabular-nums">{{ num(row.order) }}</span></template>
        <template #cell-code="{ row }"><span dir="ltr" class="font-mono text-xs font-semibold">{{ row.code }}</span></template>
        <template #cell-name="{ row }"><span class="font-medium">{{ locale === 'ar' ? row.name : row.en }}</span></template>
        <template #cell-section="{ row }"><Badge variant="secondary">{{ t(`accounting.sections.${row.section}`) }}</Badge></template>
        <template #cell-accounts="{ row }"><span class="tabular-nums" :title="row.accountNames.join('، ')">{{ num(row.accounts) }}</span></template>
        <template #cell-actions="{ row }">
          <ActionMenu :items="[
                    { label: t('common.edit'), icon: Pencil, tone: 'blue', onSelect: () => open(row) },
                  ]" />
        </template>
      </DataTable>
    </Card>

    <Dialog v-model:open="dialog" :title="editing ? t('accounting.items.editTitle') : t('accounting.items.addTitle')">
      <form class="space-y-4" @submit.prevent="save">
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="space-y-1.5"><label class="text-sm font-medium">{{ t('accounting.items.statement') }}</label><Dropdown v-model="form.statement" :options="tabs" :disabled="!!editing" @change="form.section = SECTIONS[form.statement][0]" /></div>
          <div class="space-y-1.5"><label class="text-sm font-medium">{{ t('accounting.common.section') }}</label><Dropdown v-model="form.section" :options="sectionOptions" /></div>
          <div class="space-y-1.5"><label class="text-sm font-medium">{{ t('accounting.common.code') }}</label><Input v-model="form.code" dir="ltr" /></div>
          <div class="space-y-1.5"><label class="text-sm font-medium">{{ t('accounting.common.order') }}</label><Input v-model="form.order" type="number" min="1" dir="ltr" /></div>
          <div class="space-y-1.5"><label class="text-sm font-medium">{{ t('common.name') }}</label><Input v-model="form.name" /></div>
          <div class="space-y-1.5"><label class="text-sm font-medium">{{ t('accounting.common.nameEn') }}</label><Input v-model="form.en" dir="ltr" /></div>
        </div>
        <p v-if="error" class="text-danger text-xs">{{ error }}</p>
      </form>
      <template #footer>
        <Button variant="ghost" @click="dialog = false">{{ t('common.cancel') }}</Button>
        <Button :disabled="saving" @click="save">{{ t('common.save') }}</Button>
      </template>
    </Dialog>
  </div>
</template>
