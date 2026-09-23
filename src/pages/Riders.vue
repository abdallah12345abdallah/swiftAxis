<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import ActionMenu from '@/components/common/ActionMenu.vue'
import {
  Plus, Download, Search, Pencil, Power, PowerOff, AlertTriangle,
  Users, UserCheck, TrendingDown, Package, Bike, Car,
} from 'lucide-vue-next'
import { useConfirm } from '@/composables/useConfirm'
import PageHeader from '@/components/common/PageHeader.vue'
import Avatar from '@/components/common/Avatar.vue'
import RiderCode from '@/components/common/RiderCode.vue'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dropdown } from '@/components/ui/dropdown'
import { Skeleton } from '@/components/ui/skeleton'
import RiderFormDialog from '@/components/riders/RiderFormDialog.vue'
import { useCurrency } from '@/composables/useCurrency'
import { WALLET_WARNING_THRESHOLD } from '@/lib/constants'
import { CITIES, VEHICLE_TYPES } from '@/api/fixtures'
import { fetchRiders, fetchContracts, toggleRiderActive } from '@/api/riders'
import { fetchVehicles } from '@/api/vehicles'

const { t, locale } = useI18n()
const confirm = useConfirm()
const { sar, num } = useCurrency()

const loading = ref(true)
const riders = ref([])
const contracts = ref([])
const vehicles = ref([])

// filters
const query = ref('')
const filterContract = ref('')
const filterStatus = ref('')
const filterCity = ref('')

// dialogs
const riderDialog = ref(false)
const editingRider = ref(null)

async function load() {
  loading.value = true
  ;[riders.value, contracts.value, vehicles.value] = await Promise.all([
    fetchRiders(),
    fetchContracts(),
    fetchVehicles(),
  ])
  loading.value = false
}
onMounted(load)

/* ── localized option lists ─────────────────────────────── */
const loc = (map, key) => map[key]?.[locale.value] ?? map[key]?.ar ?? key
const cityOptions = computed(() =>
  Object.keys(CITIES).map((k) => ({ value: k, label: loc(CITIES, k) })),
)
const contractOptions = computed(() =>
  contracts.value.map((c) => ({ value: c.id, label: c.company })),
)

const contractName = (id) => contracts.value.find((c) => c.id === id)?.company ?? id
const cityName = (k) => loc(CITIES, k)
const vehicleTypeName = (k) => loc(VEHICLE_TYPES, k)

/* ── filtering ──────────────────────────────────────────── */
const filtered = computed(() =>
  riders.value.filter((r) => {
    if (query.value) {
      const q = query.value.trim().toLowerCase()
      if (!r.name.toLowerCase().includes(q) && !String(r.nationalId).includes(q)) return false
    }
    if (filterContract.value && !(r.contracts ?? [r.contract]).includes(filterContract.value)) return false
    if (filterCity.value && r.city !== filterCity.value) return false
    if (filterStatus.value === 'active' && !r.active) return false
    if (filterStatus.value === 'inactive' && r.active) return false
    if (filterStatus.value === 'warning' && !r.underperforming) return false
    return true
  }),
)

/* ── stats ──────────────────────────────────────────────── */
const stats = computed(() => {
  const list = riders.value
  const active = list.filter((r) => r.active)
  const totalOrders = active.reduce((s, r) => s + r.orders, 0)
  return {
    total: list.length,
    active: active.length,
    under: list.filter((r) => r.underperforming).length,
    avg: active.length ? Math.round(totalOrders / active.length) : 0,
  }
})

const statusOptions = computed(() => [
  { value: 'active', label: t('dashboard.status.active') },
  { value: 'inactive', label: t('dashboard.status.inactive') },
  { value: 'warning', label: t('dashboard.status.warning') },
])

/* ── actions ────────────────────────────────────────────── */
function openAddRider() {
  editingRider.value = null
  riderDialog.value = true
}
function openEditRider(r) {
  editingRider.value = r
  riderDialog.value = true
}
async function toggleActive(r) {
  const off = r.active
  await confirm({
    tone: off ? 'danger' : 'success',
    icon: off ? PowerOff : Power,
    title: t(off ? 'confirm.riderDeactivate.title' : 'confirm.riderActivate.title'),
    message: t(off ? 'confirm.riderDeactivate.message' : 'confirm.riderActivate.message'),
    subject: `${r.name} · ${r.id}`,
    confirmText: t(off ? 'riders.actions.deactivate' : 'riders.actions.activate'),
    onConfirm: async () => {
      await toggleRiderActive(r.id)
      await load()
    },
  })
}

function statusVariant(r) {
  if (!r.active) return 'secondary'
  if (r.underperforming) return 'warning'
  return 'success'
}
function statusLabel(r) {
  if (!r.active) return t('dashboard.status.inactive')
  if (r.underperforming) return t('dashboard.status.warning')
  return t('dashboard.status.active')
}
function barClass(r) {
  if (r.progress >= 100) return 'bg-success'
  if (r.underperforming) return 'bg-danger'
  return 'bg-primary'
}

/* ── export (US-005) ────────────────────────────────────── */
function exportCsv() {
  const headers = [
    t('common.riderCode'), t('riders.table.rider'), t('riders.form.nationalId'), t('riders.form.mobile'),
    t('riders.filters.city'), t('riders.table.contracts'), t('riders.table.vehicle'),
    t('riders.table.orders'), t('riders.table.commission'), t('riders.table.wallet'),
    t('riders.table.status'),
  ]
  const rows = filtered.value.map((r) => [
    r.id, r.name, r.nationalId, r.mobile, cityName(r.city),
    (r.contracts ?? [r.contract]).map(contractName).join(' | '),
    `${vehicleTypeName(r.vehicleType)} ${r.vehicle}`,
    r.orders, r.commission, r.wallet, statusLabel(r),
  ])
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const csv = [headers, ...rows].map((row) => row.map(esc).join(',')).join('\r\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `riders-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div>
    <PageHeader :title="t('riders.title')" :subtitle="t('riders.subtitle')">
      <template #actions>
        <Button variant="outline" @click="exportCsv">
          <Download /> {{ t('riders.actions.export') }}
        </Button>
        <Button @click="openAddRider">
          <Plus /> {{ t('riders.actions.add') }}
        </Button>
      </template>
    </PageHeader>
    <div class="space-y-6">
      <!-- stats -->
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card class="flex items-center gap-3 p-4">
          <span class="bg-primary/10 text-primary grid size-11 place-items-center rounded-lg"><Users class="size-5" /></span>
          <div>
            <p class="text-2xl font-bold tabular-nums">{{ num(stats.total) }}</p>
            <p class="text-muted-foreground text-xs">{{ t('riders.stats.total') }}</p>
          </div>
        </Card>
        <Card class="flex items-center gap-3 p-4">
          <span class="bg-success/10 text-success grid size-11 place-items-center rounded-lg"><UserCheck class="size-5" /></span>
          <div>
            <p class="text-2xl font-bold tabular-nums">{{ num(stats.active) }}</p>
            <p class="text-muted-foreground text-xs">{{ t('riders.stats.active') }}</p>
          </div>
        </Card>
        <Card class="flex items-center gap-3 p-4">
          <span class="bg-warning/15 text-warning-foreground grid size-11 place-items-center rounded-lg"><TrendingDown class="size-5" /></span>
          <div>
            <p class="text-2xl font-bold tabular-nums">{{ num(stats.under) }}</p>
            <p class="text-muted-foreground text-xs">{{ t('riders.stats.underperforming') }}</p>
          </div>
        </Card>
        <Card class="flex items-center gap-3 p-4">
          <span class="bg-orange/10 text-orange grid size-11 place-items-center rounded-lg"><Package class="size-5" /></span>
          <div>
            <p class="text-2xl font-bold tabular-nums">{{ num(stats.avg) }}</p>
            <p class="text-muted-foreground text-xs">{{ t('riders.stats.avgOrders') }}</p>
          </div>
        </Card>
      </div>

      <!-- filters -->
      <div class="flex flex-wrap items-center gap-3">
        <div class="relative min-w-[240px] flex-1">
          <Search class="text-muted-foreground pointer-events-none absolute top-1/2 size-4 -translate-y-1/2 start-3.5" />
          <Input v-model="query" :placeholder="t('riders.searchPlaceholder')" class="ps-10" />
        </div>
        <Dropdown v-model="filterContract" :options="contractOptions" :placeholder="t('riders.filters.contract')" class="w-auto min-w-[160px]" />
        <Dropdown v-model="filterCity" :options="cityOptions" :placeholder="t('riders.filters.city')" class="w-auto min-w-[140px]" />
        <Dropdown v-model="filterStatus" :options="statusOptions" :placeholder="t('riders.filters.status')" class="w-auto min-w-[140px]" />
      </div>

      <!-- table -->
      <Card class="overflow-hidden">
        <div v-if="loading" class="space-y-3 p-5">
          <Skeleton v-for="i in 6" :key="i" class="h-12 rounded-lg" />
        </div>

        <div v-else-if="!filtered.length" class="text-muted-foreground py-16 text-center text-sm">
          {{ t('riders.empty') }}
        </div>

        <div v-else class="overflow-x-auto">
          <div class="soft-table overflow-x-auto"><table class="w-full text-sm">
            <thead>
              <tr class="text-muted-foreground border-b">
                <th class="px-5 py-3 text-start font-medium">{{ t('riders.table.rider') }}</th>
                <th class="hidden px-5 py-3 text-start font-medium lg:table-cell">{{ t('riders.table.contracts') }}</th>
                <th class="hidden px-5 py-3 text-start font-medium md:table-cell">{{ t('riders.table.vehicle') }}</th>
                <th class="px-5 py-3 text-start font-medium">{{ t('riders.table.orders') }}</th>
                <th class="hidden px-5 py-3 text-start font-medium xl:table-cell">{{ t('riders.table.commission') }}</th>
                <th class="hidden px-5 py-3 text-start font-medium xl:table-cell">{{ t('riders.table.wallet') }}</th>
                <th class="px-5 py-3 text-start font-medium">{{ t('riders.table.status') }}</th>
                <th class="px-5 py-3 text-end font-medium">{{ t('riders.table.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="r in filtered"
                :key="r.id"
                class="hover:bg-muted/40 border-b transition-colors last:border-0"
              >
                <!-- rider -->
                <td class="px-5 py-3">
                  <div class="flex items-center gap-3">
                    <Avatar :initials="r.name.charAt(0)" :src="r.photo?.url" />
                    <div class="min-w-0">
                      <RouterLink :to="`/riders/${r.id}`" class="hover:text-primary block truncate font-medium hover:underline">{{ r.name }}</RouterLink>
                      <p class="text-muted-foreground flex items-center gap-1.5 text-xs tabular-nums">
                        <RiderCode :code="r.id" />
                        <span dir="ltr">{{ r.nationalId }}</span>
                      </p>
                    </div>
                  </div>
                </td>
                <!-- contracts -->
                <td class="hidden px-5 py-3 lg:table-cell">
                  <div class="flex flex-wrap gap-1">
                    <Badge v-for="cid in (r.contracts ?? [r.contract])" :key="cid" variant="secondary">
                      {{ contractName(cid) }}
                    </Badge>
                  </div>
                </td>
                <!-- vehicle -->
                <td class="text-muted-foreground hidden px-5 py-3 md:table-cell">
                  <div class="flex items-center gap-2">
                    <component :is="r.vehicleType === 'car' ? Car : Bike" class="size-4 shrink-0" />
                    <span dir="ltr">{{ r.vehicle }}</span>
                  </div>
                </td>
                <!-- orders + progress -->
                <td class="px-5 py-3">
                  <div class="flex items-center gap-2">
                    <span class="tabular-nums font-medium">{{ num(r.orders) }}</span>
                    <div class="hidden items-center gap-1.5 sm:flex">
                      <Progress :value="r.progress" :indicator-class="barClass(r)" class="w-16" />
                      <span class="text-muted-foreground w-9 text-xs tabular-nums">{{ r.progress }}%</span>
                    </div>
                  </div>
                </td>
                <!-- commission -->
                <td class="hidden px-5 py-3 font-semibold tabular-nums xl:table-cell">{{ sar(r.commission) }}</td>
                <!-- wallet -->
                <td class="hidden px-5 py-3 tabular-nums xl:table-cell" :class="r.wallet > WALLET_WARNING_THRESHOLD ? 'text-danger font-semibold' : ''">
                  {{ sar(r.wallet) }}
                </td>
                <!-- status -->
                <td class="px-5 py-3">
                  <div class="flex items-center gap-1.5">
                    <Badge :variant="statusVariant(r)">{{ statusLabel(r) }}</Badge>
                    <AlertTriangle v-if="r.underperforming" class="text-warning-foreground size-4" :title="t('riders.underTarget')" />
                  </div>
                </td>
                <!-- actions -->
                <td class="px-5 py-3 text-end">
                  <ActionMenu :items="[
                    { label: t('riders.actions.edit'), icon: Pencil, tone: 'blue', onSelect: () => openEditRider(r) },
                    { label: r.active ? t('riders.actions.deactivate') : t('riders.actions.activate'), icon: Power, tone: 'green', danger: r.active, onSelect: () => toggleActive(r) },
                  ]" />
                </td>
              </tr>
            </tbody>
          </table></div>
        </div>
      </Card>
    </div>

    <!-- dialogs -->
    <RiderFormDialog
      v-model:open="riderDialog"
      :rider="editingRider"
      :contract-options="contractOptions"
      :city-options="cityOptions"
      :vehicles="vehicles"
      @saved="load"
    />
  </div>
</template>
