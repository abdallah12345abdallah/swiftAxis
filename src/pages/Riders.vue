<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  Plus, Download, Search, Pencil, Power, AlertTriangle,
  Users, UserCheck, TrendingDown, Package, Bike, Car,
} from 'lucide-vue-next'
import PageHeader from '@/components/common/PageHeader.vue'
import Avatar from '@/components/common/Avatar.vue'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import RiderFormDialog from '@/components/riders/RiderFormDialog.vue'
import ContractFormDialog from '@/components/riders/ContractFormDialog.vue'
import { useCurrency } from '@/composables/useCurrency'
import { WALLET_WARNING_THRESHOLD } from '@/lib/constants'
import { CITIES, VEHICLE_TYPES } from '@/api/fixtures'
import { fetchRiders, fetchContracts, toggleRiderActive } from '@/api/riders'

const { t, locale } = useI18n()
const { sar, num } = useCurrency()

const tab = ref('riders')
const loading = ref(true)
const riders = ref([])
const contracts = ref([])

// filters
const query = ref('')
const filterContract = ref('')
const filterStatus = ref('')
const filterCity = ref('')

// dialogs
const riderDialog = ref(false)
const editingRider = ref(null)
const contractDialog = ref(false)
const editingContract = ref(null)

async function load() {
  loading.value = true
  ;[riders.value, contracts.value] = await Promise.all([fetchRiders(), fetchContracts()])
  loading.value = false
}
onMounted(load)

/* ── localized option lists ─────────────────────────────── */
const loc = (map, key) => map[key]?.[locale.value] ?? map[key]?.ar ?? key
const cityOptions = computed(() =>
  Object.keys(CITIES).map((k) => ({ value: k, label: loc(CITIES, k) })),
)
const vehicleTypeOptions = computed(() =>
  Object.keys(VEHICLE_TYPES).map((k) => ({ value: k, label: loc(VEHICLE_TYPES, k) })),
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
function openAddContract() {
  editingContract.value = null
  contractDialog.value = true
}
function openEditContract(c) {
  editingContract.value = c
  contractDialog.value = true
}
async function toggleActive(r) {
  await toggleRiderActive(r.id)
  await load()
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
    t('riders.table.rider'), t('riders.form.nationalId'), t('riders.form.mobile'),
    t('riders.filters.city'), t('riders.table.contracts'), t('riders.table.vehicle'),
    t('riders.table.orders'), t('riders.table.commission'), t('riders.table.wallet'),
    t('riders.table.status'),
  ]
  const rows = filtered.value.map((r) => [
    r.name, r.nationalId, r.mobile, cityName(r.city),
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
        <Button v-if="tab === 'riders'" variant="outline" @click="exportCsv">
          <Download /> {{ t('riders.actions.export') }}
        </Button>
        <Button v-if="tab === 'riders'" @click="openAddRider">
          <Plus /> {{ t('riders.actions.add') }}
        </Button>
        <Button v-else @click="openAddContract">
          <Plus /> {{ t('riders.contract.add') }}
        </Button>
      </template>
    </PageHeader>

    <!-- tabs -->
    <div class="bg-muted mb-6 inline-flex rounded-lg p-1">
      <button
        v-for="tb in ['riders', 'contracts']"
        :key="tb"
        type="button"
        class="rounded-md px-4 py-1.5 text-sm font-medium transition-colors"
        :class="tab === tb ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'"
        @click="tab = tb"
      >
        {{ t(`riders.tabs.${tb}`) }}
      </button>
    </div>

    <!-- ── RIDERS TAB ───────────────────────────────────────── -->
    <div v-if="tab === 'riders'" class="space-y-6">
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
        <Select v-model="filterContract" :options="contractOptions" :placeholder="t('riders.filters.contract')" class="w-auto min-w-[160px]" />
        <Select v-model="filterCity" :options="cityOptions" :placeholder="t('riders.filters.city')" class="w-auto min-w-[140px]" />
        <Select v-model="filterStatus" :options="statusOptions" :placeholder="t('riders.filters.status')" class="w-auto min-w-[140px]" />
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
          <table class="w-full text-sm">
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
                    <Avatar :initials="r.name.charAt(0)" />
                    <div class="min-w-0">
                      <p class="truncate font-medium">{{ r.name }}</p>
                      <p class="text-muted-foreground text-xs tabular-nums" dir="ltr">{{ r.nationalId }}</p>
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
                <td class="px-5 py-3">
                  <div class="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      class="hover:bg-accent text-muted-foreground hover:text-foreground inline-flex size-8 items-center justify-center rounded-lg transition-colors"
                      :title="t('riders.actions.edit')"
                      @click="openEditRider(r)"
                    >
                      <Pencil class="size-4" />
                    </button>
                    <button
                      type="button"
                      class="hover:bg-accent inline-flex size-8 items-center justify-center rounded-lg transition-colors"
                      :class="r.active ? 'text-muted-foreground hover:text-danger' : 'text-muted-foreground hover:text-success'"
                      :title="r.active ? t('riders.actions.deactivate') : t('riders.actions.activate')"
                      @click="toggleActive(r)"
                    >
                      <Power class="size-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>

    <!-- ── CONTRACTS TAB ────────────────────────────────────── -->
    <div v-else class="space-y-6">
      <Card class="overflow-hidden">
        <div v-if="loading" class="space-y-3 p-5">
          <Skeleton v-for="i in 3" :key="i" class="h-12 rounded-lg" />
        </div>
        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-muted-foreground border-b">
                <th class="px-5 py-3 text-start font-medium">{{ t('riders.contract.company') }}</th>
                <th class="hidden px-5 py-3 text-start font-medium sm:table-cell">{{ t('riders.contract.city') }}</th>
                <th class="hidden px-5 py-3 text-start font-medium md:table-cell">{{ t('riders.contract.start') }}</th>
                <th class="hidden px-5 py-3 text-start font-medium md:table-cell">{{ t('riders.contract.end') }}</th>
                <th class="px-5 py-3 text-start font-medium">{{ t('riders.contract.ridersLinked') }}</th>
                <th class="px-5 py-3 text-start font-medium">{{ t('riders.contract.status') }}</th>
                <th class="px-5 py-3 text-end font-medium">{{ t('riders.contract.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="c in contracts" :key="c.id" class="hover:bg-muted/40 border-b transition-colors last:border-0">
                <td class="px-5 py-3 font-medium">{{ c.company }}</td>
                <td class="text-muted-foreground hidden px-5 py-3 sm:table-cell">{{ cityName(c.city) }}</td>
                <td class="text-muted-foreground hidden px-5 py-3 tabular-nums md:table-cell" dir="ltr">{{ c.start ?? '—' }}</td>
                <td class="text-muted-foreground hidden px-5 py-3 tabular-nums md:table-cell" dir="ltr">
                  {{ c.end ?? t('riders.contract.ongoing') }}
                </td>
                <td class="px-5 py-3 tabular-nums">{{ num(c.riderCount) }}</td>
                <td class="px-5 py-3">
                  <Badge :variant="c.active ? 'success' : 'secondary'">
                    {{ c.active ? t('dashboard.status.active') : t('dashboard.status.inactive') }}
                  </Badge>
                </td>
                <td class="px-5 py-3">
                  <div class="flex justify-end">
                    <button
                      type="button"
                      class="hover:bg-accent text-muted-foreground hover:text-foreground inline-flex size-8 items-center justify-center rounded-lg transition-colors"
                      :title="t('riders.actions.edit')"
                      @click="openEditContract(c)"
                    >
                      <Pencil class="size-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>

    <!-- dialogs -->
    <RiderFormDialog
      v-model:open="riderDialog"
      :rider="editingRider"
      :contract-options="contractOptions"
      :city-options="cityOptions"
      :vehicle-type-options="vehicleTypeOptions"
      @saved="load"
    />
    <ContractFormDialog
      v-model:open="contractDialog"
      :contract="editingContract"
      :city-options="cityOptions"
      @saved="load"
    />
  </div>
</template>
