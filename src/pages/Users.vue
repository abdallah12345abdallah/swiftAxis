<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import ActionMenu from '@/components/common/ActionMenu.vue'
import { useRouteTab } from '@/composables/useRouteTab'
import { Plus, Pencil, Power, PowerOff, Check, Search, Warehouse } from 'lucide-vue-next'
import { useConfirm } from '@/composables/useConfirm'
import PageHeader from '@/components/common/PageHeader.vue'
import Avatar from '@/components/common/Avatar.vue'
import { Tabs } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { DataTable } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Dropdown } from '@/components/ui/dropdown'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import UserDialog from '@/components/users/UserDialog.vue'
import { NAV_ITEMS, ALL_ROLES, ROLE_CONVERSIONS } from '@/lib/constants'
import { useToast } from '@/composables/useToast'
import { useDate } from '@/lib/format'
import { fetchUsers, toggleUser, convertRole } from '@/api/users'
import { fetchAudit } from '@/api/audit'

const { t } = useI18n()
const confirm = useConfirm()
const { formatDate } = useDate()
const toast = useToast()

// role conversion (#8): supervisor → warehouse keeper
const convertDialog = ref(false)
const converting = ref(null)
const convertBusy = ref(false)
const conversionTarget = (u) => ROLE_CONVERSIONS[u.role]
function openConvert(u) {
  converting.value = u
  convertDialog.value = true
}
async function doConvert() {
  if (convertBusy.value || !converting.value) return
  convertBusy.value = true
  try {
    const u = await convertRole(converting.value.id)
    toast.success(t('users.convert.done', { role: t(`roles.${u.role}`) }))
    convertDialog.value = false
    await Promise.all([loadUsers(), loadAudit()])
  } finally {
    convertBusy.value = false
  }
}

const tab = useRouteTab('users')
const loading = ref(true)
const users = ref([])
const audit = ref([])
const auditQuery = ref('')
const auditAction = ref('')

const userDialog = ref(false)
const editingUser = ref(null)

const tabs = computed(() => [
  { value: 'users', label: t('users.tabs.users') },
  { value: 'roles', label: t('users.tabs.roles') },
  { value: 'audit', label: t('users.tabs.audit') },
])
const roleOptions = computed(() => ALL_ROLES.map((r) => ({ value: r, label: t(`roles.${r}`) })))
const actionOptions = computed(() => [
  { value: '', label: t('users.audit.allActions') },
  ...['login', 'logout', 'create', 'update', 'delete'].map((a) => ({ value: a, label: t(`users.actions.${a}`) })),
])

async function loadUsers() {
  users.value = await fetchUsers()
}
async function loadAudit() {
  audit.value = await fetchAudit({ query: auditQuery.value, action: auditAction.value })
}
async function load() {
  loading.value = true
  await Promise.all([loadUsers(), loadAudit()])
  loading.value = false
}
onMounted(load)
watch([auditQuery, auditAction], loadAudit)

function openAdd() {
  editingUser.value = null
  userDialog.value = true
}
function openEdit(u) {
  editingUser.value = u
  userDialog.value = true
}
async function toggle(u) {
  const off = u.active
  await confirm({
    tone: off ? 'danger' : 'success',
    icon: off ? PowerOff : Power,
    title: t(off ? 'confirm.userDeactivate.title' : 'confirm.userActivate.title'),
    message: t(off ? 'confirm.userDeactivate.message' : 'confirm.userActivate.message'),
    subject: u.name,
    confirmText: t(off ? 'riders.actions.deactivate' : 'riders.actions.activate'),
    onConfirm: async () => {
      await toggleUser(u.id)
      await loadUsers()
    },
  })
}

// Access matrix from the single source of truth (NAV_ITEMS)
const matrix = computed(() => NAV_ITEMS.map((i) => ({ key: i.key, roles: i.roles })))
const actionVariant = { login: 'success', logout: 'secondary', create: 'default', update: 'warning', delete: 'danger' }
</script>

<template>
  <div>
    <PageHeader :title="t('users.title')" :subtitle="t('users.subtitle')">
      <template #actions>
        <Button v-if="tab === 'users'" @click="openAdd"><Plus /> {{ t('users.add') }}</Button>
      </template>
    </PageHeader>

    <!-- on desktop the sidebar lists these screens; the tabs are for phones -->
    <div class="mb-6 lg:hidden"><Tabs v-model="tab" :tabs="tabs" /></div>

    <!-- Users -->
    <Card v-if="tab === 'users'" class="overflow-hidden">
      <DataTable
        :loading="loading" :rows="users" :empty="t('users.empty')"
        :columns="[
          { key: 'name', label: t('users.name'), sortable: true },
          { key: 'role', label: t('users.role'), sortable: true },
          { key: 'mobile', label: t('users.mobile'), hideBelow: 'sm' },
          { key: 'active', label: t('common.status') },
          { key: 'actions', label: t('common.actions'), align: 'end' },
        ]"
      >
        <template #cell-name="{ row }">
          <div class="flex items-center gap-3">
            <Avatar :initials="row.name.charAt(0)" />
            <span class="font-medium">{{ row.name }}</span>
          </div>
        </template>
        <template #cell-role="{ row }">
          <Badge>{{ t(`roles.${row.role}`) }}</Badge>
          <p v-if="row.previousRole" class="text-muted-foreground mt-0.5 text-xs">{{ t('users.convert.converted', { role: t(`roles.${row.previousRole}`) }) }}</p>
        </template>
        <template #cell-mobile="{ row }"><span dir="ltr" class="text-muted-foreground tabular-nums">{{ row.mobile }}</span></template>
        <template #cell-active="{ row }"><Badge :variant="row.active ? 'success' : 'secondary'">{{ row.active ? t('common.active') : t('common.inactive') }}</Badge></template>
        <template #cell-actions="{ row }">
          <ActionMenu :items="[
                    { label: t('common.edit'), icon: Pencil, tone: 'blue', onSelect: () => openEdit(row) },
                    { label: t('users.convert.action'), icon: Warehouse, tone: 'orange', show: !!conversionTarget(row), onSelect: () => openConvert(row) },
                    { label: row.active ? t('riders.actions.deactivate') : t('riders.actions.activate'), icon: Power, danger: row.active, tone: 'green', onSelect: () => toggle(row) },
                  ]" />
        </template>
      </DataTable>
    </Card>

    <!-- Roles & access matrix -->
    <Card v-else-if="tab === 'roles'" class="overflow-hidden">
      <div class="text-muted-foreground border-b p-5 text-sm">{{ t('users.matrix.hint') }}</div>
      <div class="overflow-x-auto">
        <div class="soft-table overflow-x-auto"><table class="w-full text-sm">
          <thead>
            <tr class="text-muted-foreground border-b">
              <th class="px-5 py-3 text-start font-medium">{{ t('users.matrix.page') }}</th>
              <th v-for="r in ALL_ROLES" :key="r" class="px-5 py-3 text-center font-medium">{{ t(`roles.${r}`) }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="m in matrix" :key="m.key" class="border-b last:border-0">
              <td class="px-5 py-3 font-medium">{{ t(`nav.${m.key}`) }}</td>
              <td v-for="r in ALL_ROLES" :key="r" class="px-5 py-3 text-center">
                <Check v-if="m.roles.includes(r)" class="text-success mx-auto size-4" />
                <span v-else class="text-muted-foreground/40">—</span>
              </td>
            </tr>
          </tbody>
        </table></div>
      </div>
    </Card>

    <!-- Audit log -->
    <Card v-else class="overflow-hidden">
      <div class="flex flex-wrap items-center gap-3 border-b p-4">
        <div class="relative min-w-[200px] flex-1">
          <Search class="text-muted-foreground pointer-events-none absolute top-1/2 size-4 -translate-y-1/2 start-3.5" />
          <Input v-model="auditQuery" :placeholder="t('users.audit.search')" class="ps-10" />
        </div>
        <Dropdown v-model="auditAction" :options="actionOptions" class="w-auto min-w-[150px]" />
        <span class="text-muted-foreground text-xs">{{ t('users.audit.immutable') }}</span>
      </div>
      <DataTable
        :loading="loading" :rows="audit" :empty="t('users.empty')" :page-size="12"
        :columns="[
          { key: 'at', label: t('users.audit.time'), sortable: true },
          { key: 'user', label: t('users.audit.user'), sortable: true },
          { key: 'action', label: t('users.audit.action') },
          { key: 'entity', label: t('users.audit.entity'), hideBelow: 'sm' },
          { key: 'detail', label: t('users.audit.detail'), hideBelow: 'md' },
          { key: 'ip', label: t('users.audit.ip'), hideBelow: 'lg' },
        ]"
      >
        <template #cell-at="{ row }"><span class="tabular-nums" dir="ltr">{{ row.at.replace('T', ' ') }}</span></template>
        <template #cell-action="{ row }"><Badge :variant="actionVariant[row.action] || 'secondary'">{{ t(`users.actions.${row.action}`) }}</Badge></template>
        <template #cell-ip="{ row }"><span dir="ltr" class="text-muted-foreground tabular-nums">{{ row.ip }}</span></template>
      </DataTable>
    </Card>

    <UserDialog v-model:open="userDialog" :user="editingUser" :role-options="roleOptions" @saved="loadUsers" />

    <Dialog v-model:open="convertDialog" :title="t('users.convert.title')" :icon="Warehouse">
      <p v-if="converting" class="text-muted-foreground text-sm leading-relaxed">
        {{ t('users.convert.hint', { name: converting.name, from: t(`roles.${converting.role}`), to: t(`roles.${conversionTarget(converting)}`) }) }}
      </p>
      <template #footer>
        <Button variant="ghost" @click="convertDialog = false">{{ t('common.cancel') }}</Button>
        <Button :disabled="convertBusy" @click="doConvert">{{ t('users.convert.confirm') }}</Button>
      </template>
    </Dialog>
  </div>
</template>
