<script setup>
import MetricTile from '@/components/common/MetricTile.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { Fuel as MtFuel, Droplets as MtDroplets, Banknote as MtBanknote } from 'lucide-vue-next'
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import ActionMenu from '@/components/common/ActionMenu.vue'
import { useRouteTab } from '@/composables/useRouteTab'
import { useConfirm } from '@/composables/useConfirm'
import { Plus, Pencil, Bike, Car, Download, ArrowLeftRight, Building2, Fuel, Clock, Tags, Camera } from 'lucide-vue-next'
import {
  Sun, Moon, Timer, Truck, Receipt, Coins, Calculator, Trophy, Power, PowerOff, Gauge,
  Layers, BadgeCheck, ListChecks, StickyNote, Users,
} from 'lucide-vue-next'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import PageHeader from '@/components/common/PageHeader.vue'
import RiderCode from '@/components/common/RiderCode.vue'
import { Card } from '@/components/ui/card'
import { DataTable } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import VehicleDialog from '@/components/vehicles/VehicleDialog.vue'
import ExpenseDialog from '@/components/vehicles/ExpenseDialog.vue'
import ExpenseBreakdownChart from '@/components/vehicles/ExpenseBreakdownChart.vue'
import VehicleHandoverDialog from '@/components/vehicles/VehicleHandoverDialog.vue'
import ShiftDialog from '@/components/vehicles/ShiftDialog.vue'
import FuelLogDialog from '@/components/vehicles/FuelLogDialog.vue'
import ExpenseItemDialog from '@/components/vehicles/ExpenseItemDialog.vue'
import { Dropdown } from '@/components/ui/dropdown'
import FilterBar from '@/components/common/FilterBar.vue'
import { DateRangePicker } from '@/components/ui/datepicker'
import { useCurrency } from '@/composables/useCurrency'
import { useDate } from '@/lib/format'
import { exportCsv, todayStamp } from '@/lib/export'
import { VEHICLE_TYPES, EXPENSE_TYPES, RIDERS, VEHICLE_STATUS } from '@/api/fixtures'
import {
  fetchVehicles, fetchExpenses, profitability, expenseBreakdown,
  fetchShifts, fetchHandovers, fetchFuelSheet, updateShift,
} from '@/api/vehicles'
import { fetchExpenseItems, updateExpenseItem } from '@/api/catalogs'
import { fetchAccounts } from '@/api/ledger'

const { t, locale } = useI18n()
const { sar, num } = useCurrency()
const { formatDate } = useDate()

const tab = useRouteTab('vehicles')
const loading = ref(true)
const vehicles = ref([])
const expenses = ref([])
const prof = ref([])
const shifts = ref([])
const handovers = ref([])
const fuel = ref({ rows: [], byVehicle: [], totals: { liters: 0, amount: 0, fills: 0 } })
const expenseItems = ref([])
const accounts = ref([])

const vehicleDialog = ref(false)
const expenseDialog = ref(false)
const handoverDialog = ref(false)
const shiftDialog = ref(false)
const fuelDialog = ref(false)
const itemDialog = ref(false)
const editingVehicle = ref(null)
const editingShift = ref(null)
const editingItem = ref(null)

const loc = (map, k) => map[k]?.[locale.value] ?? map[k]?.ar ?? k
const typeOptions = computed(() => Object.keys(VEHICLE_TYPES).map((k) => ({ value: k, label: loc(VEHICLE_TYPES, k) })))
const expenseTypeOptions = computed(() => expenseItems.value.filter((i) => i.active).map((i) => ({ value: i.id, label: locale.value === 'ar' ? i.name : i.en })))
const riderOptions = computed(() => RIDERS.map((r) => ({ value: r.id, label: r.name, hint: r.id })))
const vehicleOptions = computed(() => vehicles.value.map((v) => ({ value: v.id, label: `${v.plate} — ${v.ridersLabel}` })))
const shiftOptions = computed(() => shifts.value.filter((s) => s.active).map((s) => ({ value: s.id, label: locale.value === 'ar' ? s.name : s.en, hint: `${s.from}–${s.to}` })))
const expenseAccountOptions = computed(() => accounts.value.filter((a) => a.type === 'expense' && !a.isGroup && a.active !== false).map((a) => ({ value: a.id, label: locale.value === 'ar' ? a.name : a.en, hint: a.code })))
const accName = (id) => {
  const a = accounts.value.find((x) => x.id === id)
  return a ? (locale.value === 'ar' ? a.name : a.en) : id
}
const shiftName = (id) => {
  const s = shifts.value.find((x) => x.id === id)
  return s ? (locale.value === 'ar' ? s.name : s.en) : id
}

const statusVariant = (s) => (s === 'active' ? 'success' : s === 'maintenance' ? 'warning' : 'danger')

const tabs = computed(() => [
  { value: 'vehicles', label: t('vehicles.tabs.vehicles') },
  { value: 'handover', label: t('vehicles.tabs.handover') },
  { value: 'shifts', label: t('vehicles.tabs.shifts') },
  { value: 'expenses', label: t('vehicles.tabs.expenses') },
  { value: 'fuel', label: t('vehicles.tabs.fuel') },
  { value: 'expenseItems', label: t('vehicles.tabs.expenseItems') },
  { value: 'profitability', label: t('vehicles.tabs.profitability') },
])

/* expense chart (#9) */
const granularity = ref('month')
const chartVehicle = ref('')
const breakdown = ref(null)
const granularityOptions = computed(() => [
  { value: 'day', label: t('vehicles.charts.granularity.day') },
  { value: 'month', label: t('vehicles.charts.granularity.month') },
  { value: 'year', label: t('vehicles.charts.granularity.year') },
])
const chartVehicleOptions = computed(() => [
  { value: '', label: t('vehicles.charts.allVehicles') },
  ...vehicles.value.map((v) => ({ value: v.id, label: v.plate })),
])

/* vehicles list: search by plate / model / chassis / riders; type, status and
   the assigned rider (either shift) in the tray */
const vehQuery = ref('')
const vehFilters = ref({ type: '', status: '', rider: '' })
const vehFilterDefs = computed(() => [
  { key: 'type', label: t('vehicles.type'), options: typeOptions.value },
  { key: 'status', label: t('vehicles.statusLabel'), options: Object.keys(VEHICLE_STATUS).map((k) => ({ value: k, label: loc(VEHICLE_STATUS, k) })) },
  { key: 'rider', label: t('vehicles.rider'), options: riderOptions.value },
])
const shownVehicles = computed(() => {
  const q = vehQuery.value.trim().toLowerCase()
  const f = vehFilters.value
  return vehicles.value.filter((v) =>
    (!q || [v.plate, v.model, v.chassis, v.ridersLabel].some((x) => String(x ?? '').toLowerCase().includes(q))) &&
    (!f.type || v.type === f.type) &&
    (!f.status || v.status === f.status) &&
    (!f.rider || v.morningRiderId === f.rider || v.eveningRiderId === f.rider),
  )
})

/* handovers: search by plate / riders / notes, date range; vehicle, shift,
   direction and condition in the tray */
const hoQuery = ref('')
const hoRange = ref(['', ''])
const hoFilters = ref({ vehicle: '', shift: '', direction: '', condition: '' })
const hoFilterDefs = computed(() => [
  { key: 'vehicle', label: t('vehicles.handover.vehicle'), options: vehicles.value.map((v) => ({ value: v.id, label: v.plate })) },
  { key: 'shift', label: t('vehicles.handover.shift'), options: shifts.value.map((x) => ({ value: x.id, label: locale.value === 'ar' ? x.name : x.en })) },
  { key: 'direction', label: t('vehicles.filters.direction'), options: ['riders', 'toCompany', 'fromCompany'].map((k) => ({ value: k, label: t(`vehicles.filters.dir_${k}`) })) },
  { key: 'condition', label: t('vehicles.handover.condition'), options: ['good', 'damaged'].map((k) => ({ value: k, label: t(`vehicles.handover.conditions.${k}`) })) },
])
const shownHandovers = computed(() => {
  const q = hoQuery.value.trim().toLowerCase()
  const [a, b] = hoRange.value
  const f = hoFilters.value
  const dirOf = (h) => (h.toType === 'company' ? 'toCompany' : h.fromType === 'company' ? 'fromCompany' : 'riders')
  return handovers.value.filter((h) =>
    (!q || [h.plate, h.fromName, h.toName, h.fromRiderId, h.toRiderId, h.notes].some((x) => String(x ?? '').toLowerCase().includes(q))) &&
    (!a || h.date >= a) && (!b || h.date <= b) &&
    (!f.vehicle || h.vehicleId === f.vehicle) &&
    (!f.shift || h.shiftId === f.shift) &&
    (!f.direction || dirOf(h) === f.direction) &&
    (!f.condition || h.condition === f.condition),
  )
})

/* expenses list: search, date range and vehicle (tray); the expense type is
   picked with the item pills above the list */
const expQuery = ref('')
const expRange = ref(['', ''])
const expFilters = ref({ vehicle: '', type: '' })
const expFilterDefs = computed(() => [
  { key: 'vehicle', label: t('vehicles.fields.vehicle'), options: vehicles.value.map((v) => ({ value: v.id, label: v.plate })) },
])
// everything but the type, so the pills and the share card can count per type
const expBase = computed(() => {
  const q = expQuery.value.trim().toLowerCase()
  const [a, b] = expRange.value
  const f = expFilters.value
  return expenses.value.filter((e) =>
    (!q || [e.plate, e.invoiceNo, e.note, loc(EXPENSE_TYPES, e.type)].some((v) => String(v ?? '').toLowerCase().includes(q))) &&
    (!a || e.date >= a) && (!b || e.date <= b) &&
    (!f.vehicle || e.vehicleId === f.vehicle),
  )
})
const shownExpenses = computed(() => expBase.value.filter((e) => !expFilters.value.type || e.type === expFilters.value.type))

/* fuel sheet: vehicle / rider / dates go to the API (the per-vehicle summary
   follows them); the search narrows the rows, and the cards count what is shown */
const fuelVehicle = ref('')
const fuelRider = ref('')
const fuelQuery = ref('')
const fuelRange = ref(['', ''])
const fuelFilters = computed({
  get: () => ({ vehicle: fuelVehicle.value, rider: fuelRider.value }),
  set: (v) => {
    fuelVehicle.value = v.vehicle ?? ''
    fuelRider.value = v.rider ?? ''
  },
})
const fuelFilterDefs = computed(() => [
  { key: 'vehicle', label: t('vehicles.fields.vehicle'), options: vehicles.value.map((v) => ({ value: v.id, label: v.plate })) },
  { key: 'rider', label: t('vehicles.fuel.rider'), options: riderOptions.value },
])
const shownFuel = computed(() => {
  const q = fuelQuery.value.trim().toLowerCase()
  return fuel.value.rows.filter((r) => !q || [r.station, r.plate, r.riderName, r.riderId].some((v) => String(v ?? '').toLowerCase().includes(q)))
})
const fuelTotals = computed(() => ({
  fills: shownFuel.value.length,
  liters: shownFuel.value.reduce((s, r) => s + r.liters, 0),
  amount: shownFuel.value.reduce((s, r) => s + r.amount, 0),
}))

/* ── shared helpers for the shifts / expenses / fuel / items tabs ── */
const confirm = useConfirm()
const share = (a, total) => (total > 0 ? Math.max(0, Math.round((a / total) * 1000) / 10) : 0)
const pct = (v) => `${num(v, { decimals: 1 })}%`
const initials = (name) => String(name ?? '').trim().split(/\s+/).slice(0, 2).map((w) => w[0] ?? '').join('')
const accCode = (id) => accounts.value.find((a) => a.id === id)?.code ?? ''
// one color per expense item, used by the pills, chips, bars and item cards
// (kept in step with the chart's TYPE_COLORS: fuel blue, maintenance orange …)
const TYPE_TONES = {
  fuel: 'var(--brand)', maintenance: 'var(--primary)', insurance: 'var(--success)', registration: 'color-mix(in srgb, var(--brand) 55%, var(--danger))',
  fines: 'var(--danger)', rent: 'var(--warning)', salaries: 'var(--orange)', other: 'var(--muted-foreground)',
}
const EXTRA_TONES = ['var(--brand)', 'var(--success)', 'var(--warning)', 'var(--danger)', 'color-mix(in srgb, var(--brand) 55%, var(--danger))', 'var(--primary)']
const typeTone = (k) => TYPE_TONES[k] ?? EXTRA_TONES[[...String(k)].reduce((s, c) => s + c.charCodeAt(0), 0) % EXTRA_TONES.length]

/* ── work shifts: status pills, and each shift drawn on a 24-hour track ── */
const toMin = (hm) => {
  const [h, m] = String(hm ?? '').split(':').map(Number)
  return (h || 0) * 60 + (m || 0)
}
function shiftSpan(s) {
  const start = toMin(s.from)
  let mins = toMin(s.to) - start
  if (mins <= 0) mins += 1440
  // a shift that runs past midnight is drawn as two pieces
  const parts = start + mins <= 1440 ? [[start, mins]] : [[start, 1440 - start], [0, start + mins - 1440]]
  return { start, mins, overnight: start + mins > 1440, segs: parts.map(([a, d]) => ({ start: (a / 1440) * 100, width: (d / 1440) * 100 })) }
}
const hoursText = (h) => {
  const r = Math.round(h * 10) / 10
  return t('vehicles.shifts.hoursN', { n: num(r, { decimals: Number.isInteger(r) ? 0 : 1 }) })
}
const shiftIcon = (s) => {
  const h = Math.floor(toMin(s.from) / 60)
  return h >= 5 && h < 14 ? Sun : Moon
}
const shiftQuery = ref('')
const shiftStatus = ref('')
const searchedShifts = computed(() => {
  const q = shiftQuery.value.trim().toLowerCase()
  return shifts.value.filter((s) => !q || [s.name, s.en, s.from, s.to].some((v) => String(v ?? '').toLowerCase().includes(q)))
})
const shiftPills = computed(() => [
  { value: '', label: t('common.all'), count: searchedShifts.value.length },
  { value: 'active', label: t('common.active'), count: searchedShifts.value.filter((s) => s.active).length, color: 'var(--success)' },
  { value: 'inactive', label: t('common.inactive'), count: searchedShifts.value.filter((s) => !s.active).length, color: 'var(--muted-foreground)' },
])
const shiftCards = computed(() =>
  searchedShifts.value
    .filter((s) => !shiftStatus.value || (shiftStatus.value === 'active') === !!s.active)
    .map((s) => {
      const key = `${s.id}RiderId`
      const riders = vehicles.value
        .filter((v) => v[key])
        .map((v) => ({ id: v[key], name: RIDERS.find((r) => r.id === v[key])?.name ?? v[key], plate: v.plate }))
      // handovers come newest first
      const last = handovers.value.find((h) => h.shiftId === s.id) ?? null
      return { ...s, span: shiftSpan(s), riders, last }
    }),
)
const shiftStats = computed(() => {
  const active = shifts.value.filter((s) => s.active)
  // hours of the day covered by at least one active shift (15-minute slots)
  const slots = new Set()
  active.forEach((s) => {
    const { start, mins } = shiftSpan(s)
    for (let m = 0; m < mins; m += 15) slots.add(Math.floor(((start + m) % 1440) / 15))
  })
  return {
    total: shifts.value.length,
    active: active.length,
    hours: slots.size / 4,
    staffed: vehicles.value.filter((v) => active.some((s) => v[`${s.id}RiderId`])).length,
    vehicles: vehicles.value.length,
    handovers: handovers.value.length,
  }
})
function toggleShift(s) {
  const off = !!s.active
  confirm({
    tone: off ? 'danger' : 'success',
    icon: off ? PowerOff : Power,
    title: t(off ? 'vehicles.shifts.confirmOff.title' : 'vehicles.shifts.confirmOn.title'),
    message: t(off ? 'vehicles.shifts.confirmOff.message' : 'vehicles.shifts.confirmOn.message'),
    subject: `${shiftName(s.id)} · ${s.from}–${s.to}`,
    confirmText: t(off ? 'vehicles.shifts.deactivate' : 'vehicles.shifts.activate'),
    onConfirm: async () => {
      await updateShift(s.id, { active: !off })
      shifts.value = await fetchShifts()
    },
  })
}

/* ── expenses: tiles, item pills, the share per item and per vehicle ── */
const expPills = computed(() => {
  const by = {}
  expBase.value.forEach((e) => {
    by[e.type] ??= { count: 0, amount: 0 }
    by[e.type].count += 1
    by[e.type].amount += e.amount
  })
  const sel = expFilters.value.type
  if (sel && !by[sel]) by[sel] = { count: 0, amount: 0 }
  return [
    { value: '', label: t('common.all'), count: expBase.value.length },
    ...Object.entries(by)
      .sort((a, b) => b[1].amount - a[1].amount)
      .map(([k, v]) => ({ value: k, label: loc(EXPENSE_TYPES, k), count: v.count, color: typeTone(k) })),
  ]
})
const expBaseTotal = computed(() => expBase.value.reduce((s, e) => s + e.amount, 0))
const expByItem = computed(() =>
  expPills.value
    .filter((p) => p.value && p.count)
    .map((p) => {
      const amount = expBase.value.filter((e) => e.type === p.value).reduce((s, e) => s + e.amount, 0)
      return { ...p, amount, pct: share(amount, expBaseTotal.value) }
    }),
)
const expByVehicle = computed(() => {
  const by = {}
  shownExpenses.value.forEach((e) => {
    by[e.vehicleId] ??= { id: e.vehicleId, plate: e.plate, amount: 0, count: 0 }
    by[e.vehicleId].amount += e.amount
    by[e.vehicleId].count += 1
  })
  const rows = Object.values(by).sort((a, b) => b.amount - a.amount).slice(0, 5)
  const max = Math.max(1, ...rows.map((r) => r.amount))
  return rows.map((r) => ({ ...r, width: Math.max(4, share(r.amount, max)) }))
})
const expStats = computed(() => {
  const rows = shownExpenses.value
  const amount = rows.reduce((s, e) => s + e.amount, 0)
  const byType = {}
  rows.forEach((e) => (byType[e.type] = (byType[e.type] ?? 0) + e.amount))
  const [topType, topAmount] = Object.entries(byType).sort((a, b) => b[1] - a[1])[0] ?? ['', 0]
  return {
    amount,
    count: rows.length,
    vehicles: new Set(rows.map((e) => e.vehicleId)).size,
    average: rows.length ? amount / rows.length : 0,
    largest: Math.max(0, ...rows.map((e) => e.amount)),
    topType,
    topAmount,
    topPct: share(topAmount, amount),
  }
})
const expRowShare = (a) => Math.max(3, share(a, Math.max(1, ...shownExpenses.value.map((e) => e.amount))))
const setExpType = (v) => (expFilters.value = { ...expFilters.value, type: expFilters.value.type === v ? '' : v })

/* ── fuel: average price, tank fill per row, spend per vehicle ── */
const fuelAvgPrice = computed(() => (fuelTotals.value.liters ? fuelTotals.value.amount / fuelTotals.value.liters : 0))
const fuelVehicleCount = computed(() => new Set(shownFuel.value.map((r) => r.vehicleId)).size)
const tankOf = (vehicleId) => vehicles.value.find((v) => v.id === vehicleId)?.tankCapacity ?? 0
const tankFill = (r) => {
  const tank = tankOf(r.vehicleId)
  return tank ? Math.min(100, Math.round((r.liters / tank) * 100)) : null
}
const fuelBars = computed(() => {
  const rows = fuel.value.byVehicle.filter((r) => r.fills).sort((a, b) => b.amount - a.amount)
  const max = Math.max(1, ...rows.map((r) => r.amount))
  return rows.map((r) => ({ ...r, width: Math.max(4, share(r.amount, max)) }))
})
const fuelIdle = computed(() => fuel.value.byVehicle.filter((r) => !r.fills).length)

/* ── expense items: a catalog of cards with an on/off switch ── */
const itemQuery = ref('')
const itemStatus = ref('')
const itemFilters = ref({ account: '' })
const itemFilterDefs = computed(() => [
  {
    key: 'account',
    label: t('vehicles.expenseItems.account'),
    options: [...new Set(expenseItems.value.map((i) => i.account))].map((id) => ({ value: id, label: accName(id), hint: accCode(id) })),
  },
])
const itemRows = computed(() => {
  const rows = expenseItems.value.map((i) => {
    const mine = expenses.value.filter((e) => e.type === i.id)
    return { ...i, amount: mine.reduce((s, e) => s + e.amount, 0) }
  })
  const max = Math.max(1, ...rows.map((r) => r.amount))
  return rows.map((r) => ({ ...r, width: r.amount ? Math.max(4, share(r.amount, max)) : 0 }))
})
const searchedItems = computed(() => {
  const q = itemQuery.value.trim().toLowerCase()
  const acc = itemFilters.value.account
  return itemRows.value.filter((i) =>
    (!q || [i.name, i.en, i.id, accName(i.account), accCode(i.account)].some((v) => String(v ?? '').toLowerCase().includes(q))) &&
    (!acc || i.account === acc),
  )
})
const itemPills = computed(() => [
  { value: '', label: t('common.all'), count: searchedItems.value.length },
  { value: 'active', label: t('common.active'), count: searchedItems.value.filter((i) => i.active).length, color: 'var(--success)' },
  { value: 'inactive', label: t('common.inactive'), count: searchedItems.value.filter((i) => !i.active).length, color: 'var(--muted-foreground)' },
])
const shownItems = computed(() => searchedItems.value.filter((i) => !itemStatus.value || (itemStatus.value === 'active') === !!i.active))
const itemStats = computed(() => {
  const all = itemRows.value
  const active = all.filter((i) => i.active).length
  const used = all.filter((i) => i.usage > 0).length
  return { total: all.length, active, used, unused: all.length - used, amount: all.reduce((s, i) => s + i.amount, 0) }
})
function toggleItem(i) {
  const off = !!i.active
  confirm({
    tone: off ? 'danger' : 'success',
    icon: off ? PowerOff : Power,
    title: t(off ? 'vehicles.expenseItems.confirmOff.title' : 'vehicles.expenseItems.confirmOn.title'),
    message: t(off ? 'vehicles.expenseItems.confirmOff.message' : 'vehicles.expenseItems.confirmOn.message'),
    subject: locale.value === 'ar' ? i.name : i.en,
    confirmText: t(off ? 'vehicles.expenseItems.deactivate' : 'vehicles.expenseItems.activate'),
    onConfirm: async () => {
      await updateExpenseItem(i.id, { active: !off })
      expenseItems.value = await fetchExpenseItems()
    },
  })
}

async function loadBreakdown() {
  breakdown.value = await expenseBreakdown({ granularity: granularity.value, vehicleId: chartVehicle.value || undefined })
}
watch([granularity, chartVehicle], loadBreakdown)

async function loadFuel() {
  const [from, to] = fuelRange.value
  fuel.value = await fetchFuelSheet({ vehicleId: fuelVehicle.value || undefined, riderId: fuelRider.value || undefined, from: from || undefined, to: to || undefined })
}
watch([fuelVehicle, fuelRider, fuelRange], loadFuel)

async function load() {
  loading.value = true
  ;[vehicles.value, expenses.value, prof.value, shifts.value, handovers.value, expenseItems.value, accounts.value] = await Promise.all([
    fetchVehicles(), fetchExpenses(), profitability(), fetchShifts(), fetchHandovers(), fetchExpenseItems(), fetchAccounts(),
  ])
  await Promise.all([loadBreakdown(), loadFuel()])
  loading.value = false
}
onMounted(load)

function openAddVehicle() {
  editingVehicle.value = null
  vehicleDialog.value = true
}
function openEditVehicle(v) {
  editingVehicle.value = v
  vehicleDialog.value = true
}
function openAddShift() {
  editingShift.value = null
  shiftDialog.value = true
}
function openEditShift(s) {
  editingShift.value = s
  shiftDialog.value = true
}
function openAddItem() {
  editingItem.value = null
  itemDialog.value = true
}
function openEditItem(i) {
  editingItem.value = i
  itemDialog.value = true
}
function exportProf() {
  exportCsv(
    `vehicle-profitability-${todayStamp()}`,
    [t('vehicles.prof.vehicle'), t('vehicles.prof.revenue'), t('vehicles.prof.expenses'), t('vehicles.prof.net'), t('vehicles.prof.margin')],
    prof.value.map((r) => [r.plate, r.revenue, r.expenses, r.net, `${r.margin}%`]),
  )
}
function exportFuel() {
  exportCsv(
    `fuel-sheet-${todayStamp()}`,
    [t('common.date'), t('vehicles.fields.vehicle'), t('common.riderCode'), t('vehicles.fuel.rider'), t('vehicles.fuel.liters'), t('vehicles.fuel.amount'), t('vehicles.fuel.pricePerLiter'), t('vehicles.fuel.odometer'), t('vehicles.fuel.station')],
    shownFuel.value.map((r) => [r.date, r.plate, r.riderId ?? '', r.riderName, r.liters, r.amount, r.pricePerLiter, r.odometer, r.station]),
  )
}
</script>

<template>
  <div>
    <PageHeader :title="t('vehicles.title')" :subtitle="t('vehicles.subtitle')">
      <template #actions>
        <Button v-if="tab === 'vehicles'" @click="openAddVehicle"><Plus /> {{ t('vehicles.addVehicle') }}</Button>
        <Button v-else-if="tab === 'handover'" @click="handoverDialog = true"><ArrowLeftRight /> {{ t('vehicles.handover.add') }}</Button>
        <Button v-else-if="tab === 'shifts'" @click="openAddShift"><Plus /> {{ t('vehicles.shifts.add') }}</Button>
        <Button v-else-if="tab === 'expenses'" @click="expenseDialog = true"><Plus /> {{ t('vehicles.addExpense') }}</Button>
        <template v-else-if="tab === 'fuel'">
          <Button variant="outline" @click="exportFuel"><Download /> {{ t('common.export') }}</Button>
          <Button @click="fuelDialog = true"><Fuel /> {{ t('vehicles.fuel.add') }}</Button>
        </template>
        <Button v-else-if="tab === 'expenseItems'" @click="openAddItem"><Plus /> {{ t('vehicles.expenseItems.add') }}</Button>
        <Button v-else variant="outline" @click="exportProf"><Download /> {{ t('common.export') }}</Button>
      </template>
    </PageHeader>


    <!-- Vehicles -->
    <template v-if="tab === 'vehicles'">
    <FilterBar v-model:search="vehQuery" v-model="vehFilters" :filters="vehFilterDefs" :search-placeholder="t('vehicles.searchPh')" class="mb-4" />
    <Card class="overflow-hidden">
      <DataTable
        :loading="loading"
        :rows="shownVehicles"
        :empty="t('vehicles.empty')"
        :columns="[
          { key: 'plate', label: t('vehicles.plate'), sortable: true },
          { key: 'type', label: t('vehicles.type') },
          { key: 'identity', label: t('vehicles.identity'), hideBelow: 'lg' },
          { key: 'riders', label: t('vehicles.rider') },
          { key: 'value', label: t('vehicles.fields.value'), align: 'end', sortable: true, hideBelow: 'xl' },
          { key: 'status', label: t('vehicles.statusLabel') },
          { key: 'actions', label: t('common.actions'), align: 'end' },
        ]"
      >
        <template #cell-plate="{ row }">
          <span dir="ltr" class="font-medium">{{ row.plate }}</span>
          <p v-if="row.model" class="text-muted-foreground text-xs">{{ row.model }}</p>
        </template>
        <template #cell-type="{ row }">
          <span class="inline-flex items-center gap-1.5">
            <component :is="row.type === 'car' ? Car : Bike" class="text-muted-foreground size-4" />
            {{ loc(VEHICLE_TYPES, row.type) }}
          </span>
        </template>
        <template #cell-identity="{ row }">
          <div class="text-muted-foreground flex flex-wrap gap-x-3 gap-y-0.5 text-xs">
            <span v-if="row.color">{{ row.color }}</span>
            <span v-if="row.year" class="tabular-nums">{{ row.year }}</span>
            <span v-if="row.tankCapacity" class="tabular-nums">{{ row.tankCapacity }} L</span>
            <span v-if="row.chassis" dir="ltr" class="font-mono">{{ row.chassis }}</span>
          </div>
        </template>
        <template #cell-riders="{ row }">
          <div class="flex flex-wrap gap-1">
            <Badge v-if="row.morningRiderName" variant="secondary">{{ shiftName('morning') }} · {{ row.morningRiderName }} <RiderCode :code="row.morningRiderId" /></Badge>
            <Badge v-if="row.eveningRiderName" variant="secondary">{{ shiftName('evening') }} · {{ row.eveningRiderName }} <RiderCode :code="row.eveningRiderId" /></Badge>
            <span v-if="!row.morningRiderName && !row.eveningRiderName" class="text-muted-foreground">{{ t('vehicles.unassigned') }}</span>
          </div>
        </template>
        <template #cell-value="{ row }"><span class="tabular-nums">{{ sar(row.value) }}</span></template>
        <template #cell-status="{ row }">
          <Badge :variant="statusVariant(row.status)">{{ loc(VEHICLE_STATUS, row.status) }}</Badge>
        </template>
        <template #cell-actions="{ row }">
          <ActionMenu :items="[
                    { label: t('common.edit'), icon: Pencil, tone: 'blue', onSelect: () => openEditVehicle(row) },
                  ]" />
        </template>
      </DataTable>
    </Card>
    </template>

    <!-- Handover (#5) -->
    <template v-else-if="tab === 'handover'">
    <FilterBar v-model:search="hoQuery" v-model="hoFilters" :filters="hoFilterDefs" :search-placeholder="t('vehicles.filters.searchHandovers')" class="mb-4">
      <template #extra><DateRangePicker v-model="hoRange" /></template>
    </FilterBar>
    <Card class="overflow-hidden">
      <DataTable
        :loading="loading" :rows="shownHandovers" :empty="t('vehicles.handover.empty')" :page-size="12"
        :columns="[
          { key: 'date', label: t('common.date'), sortable: true },
          { key: 'plate', label: t('vehicles.handover.vehicle'), sortable: true },
          { key: 'shiftName', label: t('vehicles.handover.shift') },
          { key: 'fromName', label: t('vehicles.handover.from') },
          { key: 'toName', label: t('vehicles.handover.to') },
          { key: 'odometer', label: t('vehicles.handover.odometer'), align: 'end', hideBelow: 'lg' },
          { key: 'fuel', label: t('vehicles.handover.fuel'), hideBelow: 'md' },
          { key: 'condition', label: t('vehicles.handover.condition'), hideBelow: 'sm' },
          { key: 'by', label: t('vehicles.handover.by'), hideBelow: 'xl' },
        ]"
      >
        <template #cell-date="{ row }"><span class="tabular-nums">{{ formatDate(row.date) }}</span> <span class="text-muted-foreground text-xs tabular-nums" dir="ltr">{{ row.time }}</span></template>
        <template #cell-plate="{ row }"><span dir="ltr" class="font-medium">{{ row.plate }}</span><p v-if="row.model" class="text-muted-foreground text-xs">{{ row.model }}</p></template>
        <template #cell-shiftName="{ row }"><Badge variant="secondary">{{ shiftName(row.shiftId) }}</Badge></template>
        <template #cell-fromName="{ row }">
          <span v-if="row.fromType === 'company'" class="text-muted-foreground inline-flex items-center gap-1"><Building2 class="size-3.5" /> {{ t('vehicles.handover.company') }}</span>
          <span v-else class="flex items-center gap-1.5">{{ row.fromName }} <RiderCode :code="row.fromRiderId" /></span>
        </template>
        <template #cell-toName="{ row }">
          <span v-if="row.toType === 'company'" class="text-muted-foreground inline-flex items-center gap-1"><Building2 class="size-3.5" /> {{ t('vehicles.handover.company') }}</span>
          <span v-else class="flex items-center gap-1.5 font-medium">{{ row.toName }} <RiderCode :code="row.toRiderId" /></span>
        </template>
        <template #cell-odometer="{ row }"><span class="tabular-nums">{{ num(row.odometer) }}</span></template>
        <template #cell-fuel="{ row }">
          <div class="flex items-center gap-2"><Progress :value="row.fuel" class="w-16" :indicator-class="row.fuel < 25 ? 'bg-danger' : 'bg-primary'" /><span class="text-xs tabular-nums">{{ row.fuel }}%</span></div>
        </template>
        <template #cell-condition="{ row }">
          <Badge :variant="row.condition === 'good' ? 'success' : 'danger'">{{ t(`vehicles.handover.conditions.${row.condition}`) }}</Badge>
          <p v-if="row.notes" class="text-muted-foreground mt-0.5 max-w-[16rem] truncate text-xs" :title="row.notes">{{ row.notes }}</p>
        </template>
        <template #cell-by="{ row }"><span class="text-muted-foreground inline-flex items-center gap-1 text-xs">{{ row.by || '—' }} <Camera v-if="row.photo" class="size-3.5" /></span></template>
      </DataTable>
    </Card>
    </template>

    <!-- Shifts (#5) -->
    <div v-else-if="tab === 'shifts'" class="space-y-6">
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricTile :label="t('vehicles.shifts.stats.total')" :value="shiftStats.total" :format="(v) => num(Math.round(v))" :icon="Clock" tone="primary" :hint="t('vehicles.shifts.stats.activeN', { n: num(shiftStats.active) })" />
        <MetricTile
          :label="t('vehicles.shifts.stats.coverage')"
          :value="shiftStats.hours"
          :format="(v) => hoursText(Number.isInteger(shiftStats.hours) ? Math.round(v) : v)"
          :icon="Timer"
          tone="brand"
          :progress="share(shiftStats.hours, 24)"
          :hint="t('vehicles.shifts.stats.coverageHint')"
        />
        <MetricTile
          :label="t('vehicles.shifts.stats.staffed')"
          :value="shiftStats.staffed"
          :format="(v) => num(Math.round(v))"
          :icon="Truck"
          tone="success"
          :progress="share(shiftStats.staffed, shiftStats.vehicles)"
          :hint="t('vehicles.shifts.stats.staffedHint', { n: num(shiftStats.staffed), total: num(shiftStats.vehicles) })"
        />
        <MetricTile :label="t('vehicles.shifts.stats.handovers')" :value="shiftStats.handovers" :format="(v) => num(Math.round(v))" :icon="ArrowLeftRight" tone="orange" />
      </div>

      <FilterBar v-model:search="shiftQuery" :search-placeholder="t('vehicles.shifts.searchPh')" />

      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="vh-pills" role="tablist">
          <button
            v-for="p in shiftPills"
            :key="p.value"
            type="button"
            role="tab"
            class="vh-pill"
            :class="shiftStatus === p.value && 'is-on'"
            :aria-selected="shiftStatus === p.value"
            @click="shiftStatus = p.value"
          >
            <i v-if="p.color" class="vh-dot" :style="{ background: p.color }" />
            {{ p.label }}
            <span class="vh-count">{{ num(p.count) }}</span>
          </button>
        </div>
        <p class="text-muted-foreground flex items-start gap-1.5 text-xs"><Clock class="mt-px size-3.5 shrink-0" /> {{ t('vehicles.shifts.hint') }}</p>
      </div>

      <div v-if="loading" class="grid gap-4 lg:grid-cols-2">
        <Skeleton v-for="i in 2" :key="i" class="h-72 rounded-2xl" />
      </div>
      <Card v-else-if="!shiftCards.length"><EmptyState :title="t('vehicles.shifts.empty')" :icon="Clock" /></Card>

      <div v-else class="grid items-start gap-4 lg:grid-cols-2">
        <article v-for="(s, i) in shiftCards" :key="s.id" class="vs-card" :class="!s.active && 'is-off'" :style="{ '--d': `${Math.min(i, 8) * 50}ms` }">
          <header class="vs-head">
            <span class="vs-ic"><component :is="shiftIcon(s)" class="size-5" /></span>
            <div class="min-w-0 flex-1">
              <h3 class="vs-name truncate">{{ locale === 'ar' ? s.name : s.en }}</h3>
              <p class="text-muted-foreground truncate text-xs">{{ locale === 'ar' ? s.en : s.name }}</p>
            </div>
            <Badge :variant="s.active ? 'success' : 'secondary'">{{ s.active ? t('common.active') : t('common.inactive') }}</Badge>
            <Switch :model-value="!!s.active" :aria-label="s.active ? t('vehicles.shifts.deactivate') : t('vehicles.shifts.activate')" @update:model-value="toggleShift(s)" />
            <ActionMenu :items="[
              { label: t('common.edit'), icon: Pencil, tone: 'blue', onSelect: () => openEditShift(shifts.find((x) => x.id === s.id)) },
            ]" />
          </header>

          <!-- hours, then the window on a 24-hour day -->
          <div class="vs-time">
            <div class="vs-range" dir="ltr">
              <b>{{ s.from }}</b>
              <span class="vs-arrow" aria-hidden="true" />
              <b>{{ s.to }}</b>
            </div>
            <span class="vs-chip"><Timer class="size-3.5" /> {{ hoursText(s.span.mins / 60) }}</span>
            <span v-if="s.span.overnight" class="vs-chip is-night"><Moon class="size-3.5" /> {{ t('vehicles.shifts.overnight') }}</span>
          </div>
          <div class="vs-track" dir="ltr" aria-hidden="true">
            <span v-for="h in [6, 12, 18]" :key="h" class="vs-tick" :style="{ insetInlineStart: `${(h / 24) * 100}%` }" />
            <i v-for="(g, gi) in s.span.segs" :key="gi" class="vs-seg" :style="{ insetInlineStart: `${g.start}%`, width: `${g.width}%` }" />
          </div>
          <div class="vs-scale" dir="ltr" aria-hidden="true"><span>00</span><span>06</span><span>12</span><span>18</span><span>24</span></div>

          <div class="vs-stats">
            <div>
              <Truck class="size-4" />
              <b>{{ num(s.vehicles) }}</b>
              <span>{{ t('vehicles.shifts.vehicles') }}</span>
            </div>
            <div>
              <ArrowLeftRight class="size-4" />
              <b>{{ num(s.handovers) }}</b>
              <span>{{ t('vehicles.shifts.handovers') }}</span>
            </div>
            <div class="min-w-0">
              <Clock class="size-4" />
              <b v-if="s.last" class="truncate tabular-nums">{{ formatDate(s.last.date) }} <small dir="ltr">{{ s.last.time }}</small></b>
              <b v-else class="text-muted-foreground">—</b>
              <span>{{ s.last ? t('vehicles.shifts.lastHandover') : t('vehicles.shifts.noHandover') }}</span>
            </div>
          </div>

          <div class="vs-riders">
            <p class="vs-sub"><Users class="size-3.5" /> {{ t('vehicles.shifts.riders') }}</p>
            <div v-if="s.riders.length" class="flex flex-wrap gap-1.5">
              <span v-for="r in s.riders.slice(0, 6)" :key="r.id" class="vs-rider" :title="`${r.name} · ${r.id} · ${r.plate}`">
                <span class="vh-av">{{ initials(r.name) }}</span>
                <span class="max-w-[9rem] truncate">{{ r.name }}</span>
                <span class="vh-plate is-sm" dir="ltr">{{ r.plate }}</span>
              </span>
              <span v-if="s.riders.length > 6" class="vs-rider is-more">+{{ num(s.riders.length - 6) }}</span>
            </div>
            <p v-else class="text-muted-foreground text-xs">{{ t('vehicles.shifts.noRiders') }}</p>
          </div>
        </article>
      </div>
    </div>

    <!-- Expenses -->
    <div v-else-if="tab === 'expenses'" class="space-y-6">
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricTile :label="t('vehicles.exp.total')" :value="expStats.amount" :format="sar" :icon="MtBanknote" tone="primary" :hint="t('vehicles.exp.vehiclesN', { n: num(expStats.vehicles) })" />
        <MetricTile :label="t('vehicles.exp.count')" :value="expStats.count" :format="(v) => num(Math.round(v))" :icon="Receipt" tone="brand" :hint="t('vehicles.exp.largest', { amount: sar(expStats.largest) })" />
        <MetricTile :label="t('vehicles.exp.average')" :value="expStats.average" :format="sar" :icon="Calculator" tone="success" />
        <MetricTile
          :label="t('vehicles.exp.top')"
          :value="expStats.topAmount"
          :format="sar"
          :icon="Trophy"
          tone="orange"
          :progress="expStats.topPct"
          :hint="expStats.topType ? t('vehicles.exp.topHint', { name: loc(EXPENSE_TYPES, expStats.topType), pct: pct(expStats.topPct) }) : ''"
        />
      </div>

      <div class="space-y-3">
        <FilterBar v-model:search="expQuery" v-model="expFilters" :filters="expFilterDefs" :search-placeholder="t('vehicles.searchExpenses')">
          <template #extra><DateRangePicker v-model="expRange" /></template>
        </FilterBar>
        <!-- expense item switch: all, or one item at a time -->
        <div class="vh-pills" role="tablist">
          <button
            v-for="p in expPills"
            :key="p.value"
            type="button"
            role="tab"
            class="vh-pill"
            :class="expFilters.type === p.value && 'is-on'"
            :aria-selected="expFilters.type === p.value"
            @click="expFilters = { ...expFilters, type: p.value }"
          >
            <i v-if="p.color" class="vh-dot" :style="{ background: p.color }" />
            {{ p.label }}
            <span class="vh-count">{{ num(p.count) }}</span>
          </button>
        </div>
      </div>

      <div class="grid items-start gap-6 xl:grid-cols-3">
        <Card class="overflow-hidden xl:col-span-2">
          <DataTable
            :loading="loading"
            :rows="shownExpenses"
            :empty="t('vehicles.empty')"
            :page-size="10"
            :columns="[
              { key: 'date', label: t('vehicles.fields.date'), sortable: true },
              { key: 'plate', label: t('vehicles.fields.vehicle'), sortable: true },
              { key: 'type', label: t('vehicles.fields.type') },
              { key: 'invoiceNo', label: t('vehicles.fields.invoiceNo'), hideBelow: 'md' },
              { key: 'amount', label: t('vehicles.fields.amount'), align: 'end', sortable: true },
            ]"
          >
            <template #cell-date="{ row }">
              <div class="vh-date" :title="formatDate(row.date)">
                <b>{{ formatDate(row.date, { day: 'numeric' }) }}</b>
                <span>{{ formatDate(row.date, { month: 'short' }) }}</span>
              </div>
            </template>
            <template #cell-plate="{ row }"><span class="vh-plate" dir="ltr">{{ row.plate }}</span></template>
            <template #cell-type="{ row }">
              <span class="vx-type" :style="{ '--c': typeTone(row.type) }"><i class="vh-dot" />{{ loc(EXPENSE_TYPES, row.type) }}</span>
            </template>
            <template #cell-invoiceNo="{ row }">
              <span dir="ltr" class="vx-inv" :class="(!row.invoiceNo || row.invoiceNo === '—') && 'is-none'">{{ row.invoiceNo || '—' }}</span>
              <p v-if="row.note" class="text-muted-foreground mt-1 flex max-w-[16rem] items-center gap-1 text-xs" :title="row.note">
                <StickyNote class="size-3 shrink-0" /><span class="truncate">{{ row.note }}</span>
              </p>
            </template>
            <template #cell-amount="{ row }">
              <div class="vx-amt">
                <b dir="ltr">{{ sar(row.amount) }}</b>
                <span class="vx-amt-bar"><i :style="{ width: `${expRowShare(row.amount)}%`, background: typeTone(row.type) }" /></span>
              </div>
            </template>
          </DataTable>
        </Card>

        <div class="space-y-6">
          <!-- share of each expense item; a row filters the list -->
          <Card class="p-5">
            <h3 class="font-bold">{{ t('vehicles.exp.byItem') }}</h3>
            <p class="text-muted-foreground mt-0.5 text-xs">{{ t('vehicles.exp.byItemHint') }}</p>
            <div v-if="loading" class="mt-4 space-y-3"><Skeleton v-for="i in 4" :key="i" class="h-10 rounded-xl" /></div>
            <EmptyState v-else-if="!expByItem.length" compact :icon="Layers" />
            <template v-else>
              <div class="vx-stack">
                <i v-for="r in expByItem" :key="r.value" :style="{ width: `${r.pct}%`, background: r.color }" :title="`${r.label} · ${pct(r.pct)}`" />
              </div>
              <ul class="vx-items">
                <li v-for="r in expByItem" :key="r.value">
                  <button
                    type="button"
                    class="vx-item"
                    :class="{ 'is-on': expFilters.type === r.value, 'is-dim': expFilters.type && expFilters.type !== r.value }"
                    :style="{ '--c': r.color }"
                    :aria-pressed="expFilters.type === r.value"
                    @click="setExpType(r.value)"
                  >
                    <span class="vx-item-top">
                      <i class="vh-dot" />
                      <span class="min-w-0 flex-1 truncate font-semibold">{{ r.label }}</span>
                      <b dir="ltr">{{ sar(r.amount) }}</b>
                    </span>
                    <span class="vx-item-bottom">
                      <span class="vx-bar"><i :style="{ width: `${r.pct}%` }" /></span>
                      <span class="vx-item-meta">{{ t('vehicles.exp.recordsN', { n: num(r.count) }) }} · {{ pct(r.pct) }}</span>
                    </span>
                  </button>
                </li>
              </ul>
            </template>
          </Card>

          <!-- where the money went, per vehicle -->
          <Card class="p-5">
            <h3 class="flex items-center gap-2 font-bold"><Truck class="text-muted-foreground size-4" /> {{ t('vehicles.exp.byVehicle') }}</h3>
            <div v-if="loading" class="mt-4 space-y-3"><Skeleton v-for="i in 3" :key="i" class="h-8 rounded-xl" /></div>
            <EmptyState v-else-if="!expByVehicle.length" compact :icon="Truck" />
            <ul v-else class="vx-vehs">
              <li v-for="r in expByVehicle" :key="r.id">
                <span class="vh-plate" dir="ltr">{{ r.plate }}</span>
                <span class="vx-bar is-brand"><i :style="{ width: `${r.width}%` }" /></span>
                <b dir="ltr">{{ sar(r.amount) }}</b>
              </li>
            </ul>
          </Card>
        </div>
      </div>

      <Card>
        <div class="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
          <div>
            <h3 class="font-semibold">{{ t('vehicles.charts.title') }}</h3>
            <p class="text-muted-foreground text-xs">{{ t('vehicles.charts.subtitle') }}</p>
          </div>
          <div class="flex flex-wrap gap-2">
            <Dropdown v-model="chartVehicle" :options="chartVehicleOptions" class="w-auto min-w-[150px]" />
            <Dropdown v-model="granularity" :options="granularityOptions" class="w-auto min-w-[120px]" />
          </div>
        </div>
        <div class="p-4">
          <ExpenseBreakdownChart v-if="breakdown?.categories?.length" :breakdown="breakdown" />
          <EmptyState v-else compact :icon="Layers" />
        </div>
        <div v-if="breakdown?.totalsByType?.length" class="flex flex-wrap items-center gap-x-5 gap-y-2 border-t px-5 py-3 text-sm">
          <span class="text-muted-foreground">{{ t('vehicles.charts.byType') }}:</span>
          <span v-for="tt in breakdown.totalsByType" :key="tt.type" class="inline-flex items-center gap-1.5 tabular-nums" :style="{ '--c': typeTone(tt.type) }">
            <i class="vh-dot" /> {{ loc(EXPENSE_TYPES, tt.type) }} <b dir="ltr">{{ sar(tt.total) }}</b>
          </span>
        </div>
      </Card>
    </div>

    <!-- Fuel sheet (#5/#6) -->
    <div v-else-if="tab === 'fuel'" class="space-y-6">
      <div class="space-y-2">
        <FilterBar v-model:search="fuelQuery" v-model="fuelFilters" :filters="fuelFilterDefs" :search-placeholder="t('vehicles.fuel.searchPh')">
          <template #extra><DateRangePicker v-model="fuelRange" /></template>
        </FilterBar>
        <p class="text-muted-foreground text-xs">{{ t('vehicles.fuel.hint') }}</p>
      </div>
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricTile :label="t('vehicles.fuel.fills')" :value="fuelTotals.fills" :format="(v) => num(Math.round(v))" :icon="MtFuel" tone="brand" :hint="t('vehicles.exp.vehiclesN', { n: num(fuelVehicleCount) })" />
        <MetricTile :label="t('vehicles.fuel.liters')" :value="fuelTotals.liters" :format="(v) => num(v, { decimals: 1 })" :icon="MtDroplets" tone="primary" />
        <MetricTile :label="t('vehicles.fuel.amount')" :value="fuelTotals.amount" :format="sar" :icon="MtBanknote" tone="orange" />
        <MetricTile :label="t('vehicles.fuel.avgPrice')" :value="fuelAvgPrice" :format="(v) => sar(v, { decimals: 2 })" :icon="Gauge" tone="success" />
      </div>
      <div class="grid items-start gap-6 xl:grid-cols-3">
        <Card class="overflow-hidden xl:col-span-2">
          <DataTable
            :loading="loading" :rows="shownFuel" :empty="t('vehicles.fuel.empty')" :page-size="10"
            :columns="[
              { key: 'date', label: t('common.date'), sortable: true },
              { key: 'plate', label: t('vehicles.fields.vehicle'), sortable: true },
              { key: 'riderName', label: t('vehicles.fuel.rider'), hideBelow: 'md' },
              { key: 'liters', label: t('vehicles.fuel.liters'), align: 'end' },
              { key: 'amount', label: t('vehicles.fuel.amount'), align: 'end', sortable: true },
              { key: 'pricePerLiter', label: t('vehicles.fuel.pricePerLiter'), align: 'end', hideBelow: 'lg' },
              { key: 'odometer', label: t('vehicles.fuel.odometer'), align: 'end', hideBelow: 'xl' },
            ]"
          >
            <template #cell-date="{ row }">
              <div class="flex items-center gap-2.5">
                <div class="vh-date" :title="formatDate(row.date)">
                  <b>{{ formatDate(row.date, { day: 'numeric' }) }}</b>
                  <span>{{ formatDate(row.date, { month: 'short' }) }}</span>
                </div>
                <span v-if="row.station" class="text-muted-foreground max-w-[10rem] truncate text-xs" :title="row.station">{{ row.station }}</span>
              </div>
            </template>
            <template #cell-plate="{ row }">
              <span class="vh-plate" dir="ltr">{{ row.plate }}</span>
              <p v-if="row.model" class="text-muted-foreground mt-1 text-xs">{{ row.model }}</p>
            </template>
            <template #cell-riderName="{ row }">
              <span class="flex items-center gap-2">
                <span class="vh-av">{{ initials(row.riderName) }}</span>
                <span class="min-w-0 truncate">{{ row.riderName }}</span>
                <RiderCode :code="row.riderId" />
              </span>
            </template>
            <template #cell-liters="{ row }">
              <div class="vf-lit" :title="tankFill(row) !== null ? t('vehicles.fuel.tankShare', { pct: `${num(tankFill(row))}%` }) : ''">
                <span class="tabular-nums">{{ num(row.liters, { decimals: 1 }) }}</span>
                <span v-if="tankFill(row) !== null" class="vf-tank"><i :style="{ width: `${tankFill(row)}%` }" /></span>
              </div>
            </template>
            <template #cell-amount="{ row }"><span class="font-bold tabular-nums" dir="ltr">{{ sar(row.amount) }}</span></template>
            <template #cell-pricePerLiter="{ row }"><span class="text-muted-foreground tabular-nums" dir="ltr">{{ sar(row.pricePerLiter, { decimals: 2 }) }}</span></template>
            <template #cell-odometer="{ row }"><span class="vf-odo" dir="ltr">{{ num(row.odometer) }}</span></template>
          </DataTable>
        </Card>

        <!-- spend per vehicle, largest first -->
        <Card class="p-5">
          <h3 class="flex items-center gap-2 font-bold"><Truck class="text-muted-foreground size-4" /> {{ t('vehicles.fuel.byVehicle') }}</h3>
          <div v-if="loading" class="mt-4 space-y-3"><Skeleton v-for="i in 4" :key="i" class="h-14 rounded-xl" /></div>
          <EmptyState v-else-if="!fuelBars.length" :title="t('vehicles.fuel.empty')" compact :icon="Fuel" />
          <ul v-else class="vf-list">
            <li v-for="r in fuelBars" :key="r.id" class="vf-row">
              <div class="vf-row-top">
                <span class="vh-plate" dir="ltr">{{ r.plate }}</span>
                <span class="text-muted-foreground min-w-0 flex-1 truncate text-xs">{{ r.model }}</span>
                <b dir="ltr">{{ sar(r.amount) }}</b>
              </div>
              <span class="vf-bar"><i :style="{ width: `${r.width}%` }" /></span>
              <div class="vf-row-meta">
                <span>{{ t('vehicles.fuel.fillsN', { n: num(r.fills) }) }}</span>
                <span>{{ t('vehicles.fuel.liters') }} <b>{{ num(r.liters, { decimals: 1 }) }}</b></span>
                <span>{{ t('vehicles.fuel.pricePerLiter') }} <b dir="ltr">{{ sar(r.avgPrice, { decimals: 2 }) }}</b></span>
                <span v-if="r.tankCapacity">{{ t('vehicles.fuel.tank') }} <b>{{ num(r.tankCapacity) }}</b></span>
              </div>
            </li>
          </ul>
          <p v-if="!loading && fuelIdle" class="vf-idle">{{ t('vehicles.fuel.idleN', { n: num(fuelIdle) }) }}</p>
        </Card>
      </div>
    </div>

    <!-- Expense items (#6) -->
    <div v-else-if="tab === 'expenseItems'" class="space-y-6">
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricTile :label="t('vehicles.expenseItems.stats.total')" :value="itemStats.total" :format="(v) => num(Math.round(v))" :icon="Tags" tone="primary" />
        <MetricTile
          :label="t('vehicles.expenseItems.stats.active')"
          :value="itemStats.active"
          :format="(v) => num(Math.round(v))"
          :icon="BadgeCheck"
          tone="success"
          :progress="share(itemStats.active, itemStats.total)"
          :hint="t('vehicles.expenseItems.stats.activeHint', { n: num(itemStats.active), total: num(itemStats.total) })"
        />
        <MetricTile :label="t('vehicles.expenseItems.stats.used')" :value="itemStats.used" :format="(v) => num(Math.round(v))" :icon="ListChecks" tone="brand" :hint="t('vehicles.expenseItems.stats.unusedN', { n: num(itemStats.unused) })" />
        <MetricTile :label="t('vehicles.expenseItems.stats.amount')" :value="itemStats.amount" :format="sar" :icon="Coins" tone="orange" />
      </div>

      <FilterBar v-model:search="itemQuery" v-model="itemFilters" :filters="itemFilterDefs" :search-placeholder="t('vehicles.expenseItems.searchPh')" />

      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="vh-pills" role="tablist">
          <button
            v-for="p in itemPills"
            :key="p.value"
            type="button"
            role="tab"
            class="vh-pill"
            :class="itemStatus === p.value && 'is-on'"
            :aria-selected="itemStatus === p.value"
            @click="itemStatus = p.value"
          >
            <i v-if="p.color" class="vh-dot" :style="{ background: p.color }" />
            {{ p.label }}
            <span class="vh-count">{{ num(p.count) }}</span>
          </button>
        </div>
        <p class="text-muted-foreground flex items-start gap-1.5 text-xs"><Tags class="mt-px size-3.5 shrink-0" /> {{ t('vehicles.expenseItems.hint') }}</p>
      </div>

      <div v-if="loading" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Skeleton v-for="i in 6" :key="i" class="h-44 rounded-2xl" />
      </div>
      <Card v-else-if="!shownItems.length"><EmptyState :title="t('vehicles.expenseItems.empty')" :icon="Tags" /></Card>

      <div v-else class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <article
          v-for="(i, idx) in shownItems"
          :key="i.id"
          class="vi-card"
          :class="!i.active && 'is-off'"
          :style="{ '--c': typeTone(i.id), '--d': `${Math.min(idx, 8) * 40}ms` }"
        >
          <header class="vi-head">
            <span class="vi-ic">{{ initials(locale === 'ar' ? i.name : i.en).slice(0, 1) }}</span>
            <div class="min-w-0 flex-1">
              <h3 class="vi-name truncate">{{ locale === 'ar' ? i.name : i.en }}</h3>
              <p class="text-muted-foreground truncate text-xs">{{ locale === 'ar' ? i.en : i.name }}</p>
            </div>
            <Switch :model-value="!!i.active" :aria-label="i.active ? t('vehicles.expenseItems.deactivate') : t('vehicles.expenseItems.activate')" @update:model-value="toggleItem(i)" />
            <ActionMenu :items="[
              { label: t('common.edit'), icon: Pencil, tone: 'blue', onSelect: () => openEditItem(expenseItems.find((x) => x.id === i.id)) },
            ]" />
          </header>

          <div class="vi-meta">
            <span class="vi-code" dir="ltr">{{ i.id }}</span>
            <span class="vi-acc" :title="t('vehicles.expenseItems.account')">
              <b v-if="accCode(i.account)" dir="ltr">{{ accCode(i.account) }}</b>
              <span class="truncate">{{ accName(i.account) }}</span>
            </span>
            <Badge v-if="!i.active" variant="secondary">{{ t('common.inactive') }}</Badge>
          </div>

          <div class="vi-foot">
            <div class="flex items-end justify-between gap-2">
              <span class="vi-uses" :class="!i.usage && 'is-none'">{{ i.usage ? t('vehicles.expenseItems.usesN', { n: num(i.usage) }) : t('vehicles.expenseItems.unused') }}</span>
              <span class="vi-amt">
                <small>{{ t('vehicles.expenseItems.booked') }}</small>
                <b dir="ltr">{{ sar(i.amount) }}</b>
              </span>
            </div>
            <span class="vi-bar"><i :style="{ width: `${i.width}%` }" /></span>
          </div>
        </article>
      </div>
    </div>

    <!-- Profitability -->
    <Card v-else class="overflow-hidden">
      <DataTable
        :loading="loading"
        :rows="prof"
        :empty="t('vehicles.empty')"
        :columns="[
          { key: 'plate', label: t('vehicles.prof.vehicle'), sortable: true },
          { key: 'revenue', label: t('vehicles.prof.revenue'), align: 'end', sortable: true },
          { key: 'expenses', label: t('vehicles.prof.expenses'), align: 'end', sortable: true },
          { key: 'net', label: t('vehicles.prof.net'), align: 'end', sortable: true },
          { key: 'margin', label: t('vehicles.prof.margin'), align: 'end', sortable: true },
        ]"
      >
        <template #cell-plate="{ row }"><span dir="ltr" class="font-medium">{{ row.plate }}</span></template>
        <template #cell-revenue="{ row }"><span class="tabular-nums">{{ sar(row.revenue) }}</span></template>
        <template #cell-expenses="{ row }"><span class="tabular-nums">{{ sar(row.expenses) }}</span></template>
        <template #cell-net="{ row }"><span class="font-semibold tabular-nums" :class="row.net >= 0 ? 'text-success' : 'text-danger'">{{ sar(row.net) }}</span></template>
        <template #cell-margin="{ row }"><Badge :variant="row.margin >= 0 ? 'success' : 'danger'">{{ row.margin }}%</Badge></template>
      </DataTable>
    </Card>

    <VehicleDialog v-model:open="vehicleDialog" :vehicle="editingVehicle" :type-options="typeOptions" :rider-options="riderOptions" @saved="load" />
    <ExpenseDialog v-model:open="expenseDialog" :vehicle-options="vehicleOptions" :type-options="expenseTypeOptions" @saved="load" />
    <VehicleHandoverDialog v-model:open="handoverDialog" :vehicles="vehicles" :rider-options="riderOptions" :shift-options="shiftOptions" @saved="load" />
    <ShiftDialog v-model:open="shiftDialog" :shift="editingShift" @saved="load" />
    <FuelLogDialog v-model:open="fuelDialog" :vehicles="vehicles" :rider-options="riderOptions" @saved="load" />
    <ExpenseItemDialog v-model:open="itemDialog" :item="editingItem" :account-options="expenseAccountOptions" @saved="load" />
  </div>
</template>

<style scoped>
/* ── shared: pills, plate chip, avatar, date tile ── */
.vh-pills { display: flex; flex-wrap: wrap; gap: 0.4rem; }
.vh-pill {
  display: inline-flex; align-items: center; gap: 0.45rem; height: 2.25rem; padding-inline: 0.9rem 0.6rem; border-radius: 9999px; cursor: pointer;
  font-size: 13px; font-weight: 700; color: var(--muted-foreground); background: var(--card); border: 1px solid var(--border);
  transition: border-color 0.15s, color 0.15s, background-color 0.15s;
}
.vh-pill:hover { border-color: color-mix(in srgb, var(--primary) 40%, var(--border)); color: var(--foreground); }
.vh-pill:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
.vh-pill.is-on { background: var(--primary); border-color: var(--primary); color: var(--primary-foreground); }
.vh-count {
  display: inline-grid; place-items: center; min-width: 1.5rem; height: 1.5rem; padding-inline: 0.35rem; border-radius: 9999px;
  font-size: 11px; font-weight: 800; background: var(--muted); color: var(--foreground); font-variant-numeric: tabular-nums;
}
.vh-pill.is-on .vh-count { background: color-mix(in srgb, var(--primary-foreground) 25%, transparent); color: inherit; }
.vh-dot { display: inline-block; width: 0.55rem; height: 0.55rem; border-radius: 0.2rem; flex: none; background: var(--c, var(--muted-foreground)); }
.vh-pill.is-on .vh-dot { outline: 2px solid color-mix(in srgb, var(--primary-foreground) 70%, transparent); }

/* a licence-plate chip: mono, hairline frame, a blue band on its start edge */
.vh-plate {
  display: inline-flex; align-items: center; height: 1.6rem; padding-inline: 0.55rem 0.5rem; border-radius: 0.45rem; white-space: nowrap;
  font: 800 12px ui-monospace, 'IBM Plex Mono', monospace; letter-spacing: 0.04em; color: var(--foreground);
  background: var(--card); border: 1px solid color-mix(in srgb, var(--foreground) 22%, var(--border));
  border-inline-start: 3px solid var(--brand);
}
.vh-plate.is-sm { height: 1.3rem; font-size: 10.5px; padding-inline: 0.45rem 0.4rem; }
.vh-av {
  display: inline-grid; place-items: center; width: 1.75rem; height: 1.75rem; flex: none; border-radius: 9999px;
  font-size: 11px; font-weight: 800; color: var(--primary); background: color-mix(in srgb, var(--primary) 12%, var(--card));
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--primary) 20%, transparent);
}
.vh-date {
  display: grid; place-items: center; width: 2.6rem; height: 2.6rem; flex: none; border-radius: 0.8rem; line-height: 1.1;
  background: color-mix(in srgb, var(--primary) 9%, var(--card)); color: var(--primary);
}
.vh-date b { font-size: 1rem; font-weight: 900; font-variant-numeric: tabular-nums; }
.vh-date span { font-size: 10px; font-weight: 800; }

/* ── work shifts ── */
.vs-card {
  display: grid; gap: 1rem; padding: 1.1rem 1.25rem 1.25rem; border-radius: 1.25rem; border: 1px solid var(--border); background: var(--card);
  animation: vh-rise 0.45s cubic-bezier(0.2, 0.8, 0.2, 1) both; animation-delay: var(--d, 0ms); transition: border-color 0.2s;
}
.vs-card:hover { border-color: color-mix(in srgb, var(--primary) 40%, var(--border)); }
.vs-card.is-off { background: color-mix(in srgb, var(--muted) 45%, var(--card)); }
.vs-card.is-off .vs-ic, .vs-card.is-off .vs-seg { filter: grayscale(1); opacity: 0.55; }
.vs-head { display: flex; align-items: center; gap: 0.75rem; }
.vs-ic {
  display: grid; place-items: center; width: 2.6rem; height: 2.6rem; flex: none; border-radius: 0.9rem;
  color: var(--primary); background: color-mix(in srgb, var(--primary) 12%, var(--card));
}
.vs-name { font-size: 1.05rem; font-weight: 800; }
.vs-time { display: flex; flex-wrap: wrap; align-items: center; gap: 0.6rem; }
.vs-range { display: flex; align-items: center; gap: 0.6rem; margin-inline-end: auto; }
.vs-range b { font-size: 1.5rem; font-weight: 900; letter-spacing: -0.02em; font-variant-numeric: tabular-nums; }
.vs-arrow { position: relative; width: 2.5rem; height: 2px; border-radius: 2px; background: color-mix(in srgb, var(--primary) 45%, var(--border)); }
.vs-arrow::after { content: ''; position: absolute; inset-inline-end: -1px; top: 50%; width: 0.4rem; height: 0.4rem; border-radius: 9999px; background: var(--primary); transform: translateY(-50%); }
.vs-chip {
  display: inline-flex; align-items: center; gap: 0.3rem; height: 1.6rem; padding-inline: 0.6rem; border-radius: 9999px;
  font-size: 11.5px; font-weight: 700; color: var(--brand); background: color-mix(in srgb, var(--brand) 10%, var(--card));
}
.vs-chip.is-night { color: var(--foreground); background: color-mix(in srgb, var(--navy) 10%, var(--card)); }
.vs-track { position: relative; height: 0.7rem; border-radius: 9999px; background: var(--muted); overflow: hidden; }
.vs-seg {
  position: absolute; inset-block: 0; border-radius: 9999px;
  background: linear-gradient(90deg, color-mix(in srgb, var(--primary) 65%, var(--card)), var(--primary));
}
.vs-tick { position: absolute; inset-block: 0; width: 1px; background: color-mix(in srgb, var(--foreground) 12%, transparent); }
.vs-scale { display: flex; justify-content: space-between; margin-top: -0.6rem; font-size: 10.5px; font-weight: 700; color: var(--muted-foreground); font-variant-numeric: tabular-nums; }
.vs-stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0.5rem; }
.vs-stats > div {
  display: grid; grid-template-columns: auto minmax(0, 1fr); align-items: center; column-gap: 0.45rem; row-gap: 0.1rem;
  padding: 0.6rem 0.7rem; border-radius: 0.9rem; background: color-mix(in srgb, var(--muted) 55%, transparent);
}
.vs-stats svg { grid-row: span 2; color: var(--muted-foreground); }
.vs-stats b { font-size: 0.95rem; font-weight: 800; font-variant-numeric: tabular-nums; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.vs-stats b small { font-size: 11px; font-weight: 700; color: var(--muted-foreground); }
.vs-stats span { font-size: 11px; font-weight: 600; color: var(--muted-foreground); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.vs-riders { display: grid; gap: 0.5rem; padding-top: 0.9rem; border-top: 1px dashed var(--border); }
.vs-sub { display: flex; align-items: center; gap: 0.35rem; font-size: 12px; font-weight: 700; color: var(--muted-foreground); }
.vs-rider {
  display: inline-flex; align-items: center; gap: 0.4rem; height: 2.1rem; padding-inline: 0.2rem 0.3rem; border-radius: 9999px;
  font-size: 12.5px; font-weight: 600; border: 1px solid var(--border); background: var(--card);
}
.vs-rider .vh-av { width: 1.6rem; height: 1.6rem; font-size: 10.5px; }
.vs-rider.is-more { padding-inline: 0.7rem; color: var(--muted-foreground); font-weight: 800; font-variant-numeric: tabular-nums; }
@media (max-width: 30rem) { .vs-stats { grid-template-columns: minmax(0, 1fr); } }

/* ── expenses ── */
.vx-type {
  display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.15rem 0.6rem; border-radius: 9999px; white-space: nowrap;
  font-size: 12px; font-weight: 700; color: var(--foreground); background: color-mix(in srgb, var(--c) 10%, var(--card));
  border: 1px solid color-mix(in srgb, var(--c) 22%, transparent);
}
.vx-inv { font: 700 12px ui-monospace, 'IBM Plex Mono', monospace; color: var(--foreground); }
.vx-inv.is-none { color: var(--muted-foreground); }
.vx-amt { display: inline-grid; justify-items: end; gap: 0.3rem; }
.vx-amt b { font-weight: 800; font-variant-numeric: tabular-nums; }
.vx-amt-bar { display: flex; justify-content: flex-end; width: 4.5rem; height: 0.25rem; border-radius: 9999px; background: var(--muted); overflow: hidden; }
.vx-amt-bar i { display: block; height: 100%; border-radius: 9999px; transition: width 0.5s cubic-bezier(0.2, 0.8, 0.2, 1); }

.vx-stack { display: flex; gap: 3px; height: 0.8rem; margin-top: 1rem; border-radius: 9999px; overflow: hidden; background: var(--muted); }
.vx-stack i { display: block; height: 100%; transition: width 0.6s cubic-bezier(0.2, 0.8, 0.2, 1); }
.vx-items { display: grid; gap: 0.15rem; margin-top: 0.9rem; }
.vx-item {
  display: grid; gap: 0.4rem; width: 100%; padding: 0.55rem 0.6rem; border-radius: 0.8rem; text-align: start; cursor: pointer;
  border: 1px solid transparent; transition: background-color 0.15s, border-color 0.15s, opacity 0.15s;
}
.vx-item:hover { background: color-mix(in srgb, var(--c) 7%, transparent); }
.vx-item:focus-visible { outline: 2px solid var(--primary); outline-offset: 1px; }
.vx-item.is-on { background: color-mix(in srgb, var(--c) 10%, var(--card)); border-color: color-mix(in srgb, var(--c) 35%, transparent); }
.vx-item.is-dim { opacity: 0.55; }
.vx-item-top { display: flex; align-items: center; gap: 0.55rem; font-size: 13px; }
.vx-item-top b { font-weight: 800; font-variant-numeric: tabular-nums; }
.vx-item-bottom { display: flex; align-items: center; gap: 0.6rem; }
.vx-item-meta { flex: none; font-size: 11px; font-weight: 700; color: var(--muted-foreground); font-variant-numeric: tabular-nums; }
.vx-bar { flex: 1; height: 0.4rem; border-radius: 9999px; background: var(--muted); overflow: hidden; }
.vx-bar i { display: block; height: 100%; border-radius: 9999px; background: var(--c, var(--primary)); transition: width 0.6s cubic-bezier(0.2, 0.8, 0.2, 1); }
.vx-bar.is-brand i { background: var(--brand); }
.vx-vehs { display: grid; gap: 0.7rem; margin-top: 1rem; }
.vx-vehs li { display: grid; grid-template-columns: 7rem minmax(0, 1fr) auto; align-items: center; gap: 0.75rem; font-size: 13px; }
.vx-vehs b { font-weight: 800; font-variant-numeric: tabular-nums; }

/* ── fuel ── */
.vf-lit { display: inline-grid; justify-items: end; gap: 0.3rem; }
.vf-tank { display: flex; width: 3.5rem; height: 0.3rem; border-radius: 9999px; background: var(--muted); overflow: hidden; }
.vf-tank i { display: block; height: 100%; border-radius: 9999px; background: var(--brand); transition: width 0.5s cubic-bezier(0.2, 0.8, 0.2, 1); }
.vf-odo { font: 700 12px ui-monospace, 'IBM Plex Mono', monospace; color: var(--muted-foreground); }
.vf-list { display: grid; gap: 0.35rem; margin-top: 1rem; }
.vf-row { display: grid; gap: 0.45rem; padding: 0.65rem 0.6rem; border-radius: 0.9rem; transition: background-color 0.15s; }
.vf-row:hover { background: color-mix(in srgb, var(--primary) 5%, transparent); }
.vf-row + .vf-row { border-top: 1px dashed var(--border); }
.vf-row-top { display: flex; align-items: center; gap: 0.6rem; }
.vf-row-top b { font-weight: 800; font-variant-numeric: tabular-nums; }
.vf-bar { display: block; height: 0.4rem; border-radius: 9999px; background: var(--muted); overflow: hidden; }
.vf-bar i { display: block; height: 100%; border-radius: 9999px; background: linear-gradient(90deg, color-mix(in srgb, var(--primary) 65%, var(--card)), var(--primary)); transition: width 0.6s cubic-bezier(0.2, 0.8, 0.2, 1); }
.vf-row-meta { display: flex; flex-wrap: wrap; gap: 0.3rem 0.9rem; font-size: 11px; font-weight: 600; color: var(--muted-foreground); }
.vf-row-meta b { color: var(--foreground); font-weight: 800; font-variant-numeric: tabular-nums; }
.vf-idle { margin-top: 0.75rem; padding: 0.5rem 0.75rem; border-radius: 0.75rem; font-size: 12px; font-weight: 600; color: var(--muted-foreground); background: color-mix(in srgb, var(--muted) 60%, transparent); }

/* ── expense items ── */
.vi-card {
  display: grid; gap: 0.9rem; align-content: start; padding: 1rem 1.1rem 1.1rem; border-radius: 1.25rem; border: 1px solid var(--border); background: var(--card);
  animation: vh-rise 0.45s cubic-bezier(0.2, 0.8, 0.2, 1) both; animation-delay: var(--d, 0ms); transition: border-color 0.2s;
}
.vi-card:hover { border-color: color-mix(in srgb, var(--c) 45%, var(--border)); }
.vi-card.is-off { background: color-mix(in srgb, var(--muted) 45%, var(--card)); }
.vi-card.is-off .vi-ic, .vi-card.is-off .vi-bar i { filter: grayscale(1); opacity: 0.55; }
.vi-head { display: flex; align-items: center; gap: 0.7rem; }
.vi-ic {
  display: grid; place-items: center; width: 2.5rem; height: 2.5rem; flex: none; border-radius: 0.85rem;
  font-size: 1.05rem; font-weight: 900; color: var(--c); background: color-mix(in srgb, var(--c) 12%, var(--card));
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--c) 20%, transparent);
}
.vi-name { font-weight: 800; }
.vi-meta { display: flex; flex-wrap: wrap; align-items: center; gap: 0.4rem; }
.vi-code { font: 700 11.5px ui-monospace, 'IBM Plex Mono', monospace; color: var(--muted-foreground); background: var(--muted); padding: 0.1rem 0.5rem; border-radius: 0.4rem; }
.vi-acc {
  display: inline-flex; align-items: center; gap: 0.35rem; min-width: 0; max-width: 100%; padding: 0.1rem 0.55rem; border-radius: 9999px;
  font-size: 12px; font-weight: 600; border: 1px solid var(--border);
}
.vi-acc b { font: 700 11px ui-monospace, 'IBM Plex Mono', monospace; color: var(--brand); }
.vi-foot { display: grid; gap: 0.45rem; padding-top: 0.8rem; border-top: 1px dashed var(--border); }
.vi-uses { font-size: 12px; font-weight: 700; color: var(--foreground); font-variant-numeric: tabular-nums; }
.vi-uses.is-none { color: var(--muted-foreground); font-weight: 600; }
.vi-amt { display: grid; justify-items: end; line-height: 1.2; }
.vi-amt small { font-size: 10.5px; font-weight: 600; color: var(--muted-foreground); }
.vi-amt b { font-weight: 900; font-variant-numeric: tabular-nums; }
.vi-bar { display: block; height: 0.35rem; border-radius: 9999px; background: var(--muted); overflow: hidden; }
.vi-bar i { display: block; height: 100%; border-radius: 9999px; background: var(--c); transition: width 0.6s cubic-bezier(0.2, 0.8, 0.2, 1); }

@keyframes vh-rise { from { opacity: 0; transform: translateY(8px); } }
@media (prefers-reduced-motion: reduce) {
  .vs-card, .vi-card { animation: none; transition: none; }
  .vx-amt-bar i, .vx-stack i, .vx-bar i, .vf-tank i, .vf-bar i, .vi-bar i, .vx-item, .vf-row, .vh-pill { transition: none; }
}
</style>
