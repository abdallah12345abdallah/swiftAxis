<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import ActionMenu from '@/components/common/ActionMenu.vue'
import { useRouteTab } from '@/composables/useRouteTab'
import { useRouter, useRoute } from 'vue-router'
import { Plus, Pencil, Power, PowerOff, Warehouse } from 'lucide-vue-next'
import { useConfirm } from '@/composables/useConfirm'
import FilterBar from '@/components/common/FilterBar.vue'
import PageHeader from '@/components/common/PageHeader.vue'
import Avatar from '@/components/common/Avatar.vue'
import { Card } from '@/components/ui/card'
import { DataTable } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import UserDialog from '@/components/users/UserDialog.vue'
import RolesPanel from '@/components/users/RolesPanel.vue'
import { ALL_ROLES, ROLE_CONVERSIONS } from '@/lib/constants'
import { useToast } from '@/composables/useToast'
import { useDate } from '@/lib/format'
import { fetchUsers, toggleUser, convertRole } from '@/api/users'
import { fetchAudit } from '@/api/audit'

const { t } = useI18n()
const confirm = useConfirm()
const { formatDate } = useDate()
const toast = useToast()
const router = useRouter()
const route = useRoute()

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
const auditFilters = computed({
  get: () => ({ action: auditAction.value }),
  set: (v) => (auditAction.value = v.action ?? ''),
})

const userDialog = ref(false)
const editingUser = ref(null)

const tabs = computed(() => [
  { value: 'users', label: t('users.tabs.users') },
  { value: 'roles', label: t('users.tabs.roles') },
  { value: 'audit', label: t('users.tabs.audit') },
])
const roleOptions = computed(() => ALL_ROLES.map((r) => ({ value: r, label: t(`roles.${r}`) })))

/* users list: search by name / email / mobile; role and status in the tray */
const userQuery = ref('')
// ?role= (from a role card on the roles screen) opens the list already filtered
const initialRole = ALL_ROLES.includes(String(route.query.role)) ? String(route.query.role) : ''
const userFilters = ref({ role: initialRole, status: '' })
const userFilterDefs = computed(() => [
  { key: 'role', label: t('users.role'), options: roleOptions.value },
  { key: 'status', label: t('common.status'), options: [{ value: 'active', label: t('common.active') }, { value: 'inactive', label: t('common.inactive') }] },
])
const shownUsers = computed(() => {
  const q = userQuery.value.trim().toLowerCase()
  const f = userFilters.value
  return users.value.filter((u) =>
    (!q || [u.name, u.email, u.mobile].some((x) => String(x ?? '').toLowerCase().includes(q))) &&
    (!f.role || u.role === f.role) &&
    (!f.status || (f.status === 'active') === (u.active !== false)),
  )
})
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

// roles screen → users screen, filtered to one role
const viewRoleUsers = (role) => router.push({ name: 'users', query: { role } })
const actionVariant = { login: 'success', logout: 'secondary', create: 'default', update: 'warning', delete: 'danger' }
</script>

<template>
  <div>
    <PageHeader :title="t('users.title')" :subtitle="t('users.subtitle')">
      <template #actions>
        <Button v-if="tab === 'users'" @click="openAdd"><Plus /> {{ t('users.add') }}</Button>
      </template>
    </PageHeader>


    <!-- Users -->
    <template v-if="tab === 'users'">
    <FilterBar v-model:search="userQuery" v-model="userFilters" :filters="userFilterDefs" :search-placeholder="t('users.searchPh')" class="mb-4" />
    <Card class="overflow-hidden">
      <DataTable
        :loading="loading" :rows="shownUsers" :empty="t('users.empty')"
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
    </template>

    <!-- Roles & access matrix -->
    <RolesPanel v-else-if="tab === 'roles'" :users="users" :loading="loading" @view-users="viewRoleUsers" />

    <!-- Audit log -->
    <template v-else>
      <FilterBar
        v-model:search="auditQuery"
        v-model="auditFilters"
        :search-placeholder="t('users.audit.search')"
        :filters="[{ key: 'action', label: t('users.audit.action'), options: actionOptions }]"
        class="mb-4"
      />
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
    </template>

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
