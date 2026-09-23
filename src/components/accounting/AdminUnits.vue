<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import ActionMenu from '@/components/common/ActionMenu.vue'
import { Plus, Pencil, Building2 } from 'lucide-vue-next'
import { Card } from '@/components/ui/card'
import { DataTable } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Dropdown } from '@/components/ui/dropdown'
import { Switch } from '@/components/ui/switch'
import { useCurrency } from '@/composables/useCurrency'
import { useToast } from '@/composables/useToast'
import { fetchAdminUnits, createAdminUnit, updateAdminUnit } from '@/api/accounting'

const { t, locale } = useI18n()
const { num } = useCurrency()
const toast = useToast()
const loading = ref(true)
const rows = ref([])
const dialog = ref(false)
const editing = ref(null)
const saving = ref(false)
const error = ref('')
const form = reactive({ code: '', name: '', en: '', parent: '', active: true })

async function load() {
  loading.value = true
  rows.value = await fetchAdminUnits()
  loading.value = false
}
onMounted(load)
const label = (u) => (locale.value === 'ar' ? u.name : u.en)
const parentOptions = computed(() => [{ value: '', label: t('accounting.common.root') }, ...rows.value.filter((u) => u.id !== editing.value?.id).map((u) => ({ value: u.id, label: `${u.code} — ${label(u)}` }))])

function open(u = null) {
  editing.value = u
  Object.assign(form, { code: u?.code ?? '', name: u?.name ?? '', en: u?.en ?? '', parent: u?.parent ?? '', active: u?.active ?? true })
  error.value = ''
  dialog.value = true
}
const ERR = { NAME_REQUIRED: 'common.required', DUPLICATE: 'accounting.units.errDuplicate', SELF_PARENT: 'accounting.units.errParent' }
async function save() {
  if (saving.value) return
  saving.value = true
  error.value = ''
  try {
    editing.value ? await updateAdminUnit(editing.value.id, { ...form }) : await createAdminUnit({ ...form })
    toast.success(t('common.saved'))
    dialog.value = false
    await load()
  } catch (e) {
    error.value = t(ERR[e.message] ?? 'journal.errGeneric')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <p class="text-muted-foreground text-sm">{{ t('accounting.units.hint') }}</p>
      <Button @click="open()"><Plus /> {{ t('accounting.units.add') }}</Button>
    </div>
    <Card class="overflow-hidden">
      <DataTable
        :loading="loading" :rows="rows" :empty="t('common.noData')"
        :columns="[
          { key: 'code', label: t('accounting.common.code'), sortable: true },
          { key: 'name', label: t('common.name'), sortable: true },
          { key: 'parentName', label: t('accounting.common.parent'), hideBelow: 'md' },
          { key: 'costCenters', label: t('ledger.tabs.costCenters'), align: 'end', hideBelow: 'sm' },
          { key: 'active', label: t('common.status') },
          { key: 'actions', label: t('common.actions'), align: 'end' },
        ]"
      >
        <template #cell-code="{ row }"><span dir="ltr" class="font-mono text-xs font-semibold">{{ row.code }}</span></template>
        <template #cell-name="{ row }"><span class="inline-flex items-center gap-2 font-medium"><Building2 class="text-muted-foreground size-4" /> {{ label(row) }}</span></template>
        <template #cell-parentName="{ row }"><span class="text-muted-foreground">{{ row.parentName ?? t('accounting.common.root') }}</span></template>
        <template #cell-costCenters="{ row }"><span class="tabular-nums">{{ num(row.costCenters) }}</span></template>
        <template #cell-active="{ row }"><Badge :variant="row.active ? 'success' : 'secondary'">{{ row.active ? t('common.active') : t('common.inactive') }}</Badge></template>
        <template #cell-actions="{ row }">
          <ActionMenu :items="[
                    { label: t('common.edit'), icon: Pencil, tone: 'blue', onSelect: () => open(row) },
                  ]" />
        </template>
      </DataTable>
    </Card>

    <Dialog v-model:open="dialog" :title="editing ? t('accounting.units.editTitle') : t('accounting.units.addTitle')">
      <form class="space-y-4" @submit.prevent="save">
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="space-y-1.5"><label class="text-sm font-medium">{{ t('accounting.common.code') }}</label><Input v-model="form.code" dir="ltr" placeholder="U-140" /></div>
          <div class="space-y-1.5"><label class="text-sm font-medium">{{ t('accounting.common.parent') }}</label><Dropdown v-model="form.parent" :options="parentOptions" /></div>
          <div class="space-y-1.5"><label class="text-sm font-medium">{{ t('common.name') }}</label><Input v-model="form.name" /></div>
          <div class="space-y-1.5"><label class="text-sm font-medium">{{ t('accounting.common.nameEn') }}</label><Input v-model="form.en" dir="ltr" /></div>
        </div>
        <div class="bg-muted/40 flex items-center justify-between rounded-lg px-4 py-3"><span class="text-sm font-medium">{{ t('common.status') }}</span><Switch v-model="form.active" /></div>
        <p v-if="error" class="text-danger text-xs">{{ error }}</p>
      </form>
      <template #footer>
        <Button variant="ghost" @click="dialog = false">{{ t('common.cancel') }}</Button>
        <Button :disabled="saving" @click="save">{{ t('common.save') }}</Button>
      </template>
    </Dialog>
  </div>
</template>
