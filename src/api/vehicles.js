import { mockDelay } from '@/services/http'
import { VEHICLES, VEHICLE_EXPENSES, RIDERS, COST_CENTERS } from './fixtures'
import { postEntry } from './ledger'
import { logAudit } from './audit'

/* Vehicles & expenses (EP-05). A vehicle carries up to two riders (one per
   shift) and owns a dedicated cost center for its expenses. */

const riderById = (id) => RIDERS.find((r) => r.id === id)

function decorate(v) {
  return {
    ...v,
    morningRiderName: riderById(v.morningRiderId)?.name ?? null,
    eveningRiderName: riderById(v.eveningRiderId)?.name ?? null,
    ridersLabel: [riderById(v.morningRiderId)?.name, riderById(v.eveningRiderId)?.name].filter(Boolean).join(' / ') || '—',
  }
}

export function fetchVehicles() {
  return mockDelay(VEHICLES.map(decorate))
}

/** The vehicle owning a cost center, if any (cc-veh-*). */
export function vehicleByCostCenter(ccId) {
  const cc = COST_CENTERS.find((c) => c.id === ccId)
  if (!cc?.vehicleId) return null
  return VEHICLES.find((v) => v.id === cc.vehicleId) ?? null
}

/** Which vehicle + shift a rider is assigned to. */
export function assignmentOf(riderId) {
  for (const v of VEHICLES) {
    if (v.morningRiderId === riderId) return { vehicle: v, shift: 'morning' }
    if (v.eveningRiderId === riderId) return { vehicle: v, shift: 'evening' }
  }
  return null
}

function normalizeVehiclePayload(payload) {
  return {
    plate: payload.plate,
    type: payload.type,
    morningRiderId: payload.morningRiderId || null,
    eveningRiderId: payload.eveningRiderId || null,
    value: Number(payload.value) || 0,
    status: payload.status || 'active',
    statusFrom: payload.status && payload.status !== 'active' ? payload.statusFrom || null : null,
    statusTo: payload.status && payload.status !== 'active' ? payload.statusTo || null : null,
  }
}

let vSeq = VEHICLES.length
export function createVehicle(payload) {
  const fields = normalizeVehiclePayload(payload)
  if (fields.morningRiderId && fields.morningRiderId === fields.eveningRiderId) return Promise.reject(new Error('SAME_RIDER'))
  vSeq += 1
  const id = `v${vSeq}`
  // every vehicle gets its own cost center so its expenses can be traced
  const ccId = `cc-veh-${id}`
  COST_CENTERS.push({ id: ccId, name: `مركبة ${fields.plate}`, budget: 0, active: true, vehicleId: id })
  const v = { id, ...fields, costCenter: ccId }
  VEHICLES.push(v)
  logAudit({ action: 'create', entity: 'vehicles', detail: v.plate })
  return mockDelay(v)
}

export function updateVehicle(id, payload) {
  const v = VEHICLES.find((x) => x.id === id)
  if (!v) return Promise.reject(new Error('NOT_FOUND'))
  const fields = normalizeVehiclePayload(payload)
  if (fields.morningRiderId && fields.morningRiderId === fields.eveningRiderId) return Promise.reject(new Error('SAME_RIDER'))
  Object.assign(v, fields)
  const cc = COST_CENTERS.find((c) => c.vehicleId === v.id)
  if (cc) cc.name = `مركبة ${v.plate}`
  logAudit({ action: 'update', entity: 'vehicles', detail: v.plate })
  return mockDelay(v)
}

const inRange = (d, from, to) => (!from || d >= from) && (!to || d <= to)

export function fetchExpenses({ vehicleId, from, to } = {}) {
  const rows = VEHICLE_EXPENSES.filter((e) => {
    if (vehicleId && e.vehicleId !== vehicleId) return false
    if (!inRange(e.date, from, to)) return false
    return true
  })
    .map((e) => ({ ...e, plate: VEHICLES.find((v) => v.id === e.vehicleId)?.plate ?? '—' }))
    .sort((a, b) => (a.date < b.date ? 1 : -1))
  return mockDelay(rows)
}

let eSeq = VEHICLE_EXPENSES.length
/** Create an expense and auto-post Dr Vehicle expense / Cr Cash (US-018). */
export async function createExpense(payload) {
  eSeq += 1
  const exp = {
    id: `ve${eSeq}`,
    vehicleId: payload.vehicleId,
    type: payload.type,
    amount: Number(payload.amount) || 0,
    date: payload.date,
    invoiceNo: payload.invoiceNo || '—',
    note: payload.note || '',
  }
  VEHICLE_EXPENSES.push(exp)
  const cc = VEHICLES.find((v) => v.id === exp.vehicleId)?.costCenter || 'cc-fleet'
  await postEntry({
    source: 'vehicles',
    date: exp.date,
    description: `مصروف سيارة — ${exp.invoiceNo}`,
    lines: [
      { account: 'vehicle_expense', costCenter: cc, debit: exp.amount, credit: 0 },
      { account: 'cash', costCenter: cc, debit: 0, credit: exp.amount },
    ],
  })
  logAudit({ action: 'create', entity: 'vehicles', detail: `مصروف ${exp.amount}` })
  return mockDelay(exp)
}

/** Per-vehicle profitability = rider commissions − expenses (US-017). */
export function profitability({ from, to } = {}) {
  const rows = VEHICLES.map((v) => {
    const riders = [riderById(v.morningRiderId), riderById(v.eveningRiderId)].filter(Boolean)
    const revenue = riders.reduce((s, r) => s + r.commission, 0)
    const expenses = VEHICLE_EXPENSES.filter((e) => e.vehicleId === v.id && inRange(e.date, from, to)).reduce((s, e) => s + e.amount, 0)
    const net = revenue - expenses
    return { id: v.id, plate: v.plate, riderName: riders.map((r) => r.name).join(' / ') || '—', revenue, expenses, net, margin: revenue ? Math.round((net / revenue) * 100) : 0 }
  })
  return mockDelay(rows)
}

const bucketOf = (date, granularity) =>
  granularity === 'day' ? date : granularity === 'year' ? date.slice(0, 4) : date.slice(0, 7)

/** Expense breakdown by type over day/month/year buckets (chart data). */
export function expenseBreakdown({ granularity = 'month', vehicleId } = {}) {
  const rows = VEHICLE_EXPENSES.filter((e) => !vehicleId || e.vehicleId === vehicleId)
  const buckets = [...new Set(rows.map((e) => bucketOf(e.date, granularity)))].sort()
  const types = [...new Set(rows.map((e) => e.type))]
  const series = types.map((type) => ({
    type,
    data: buckets.map((b) => rows.filter((e) => e.type === type && bucketOf(e.date, granularity) === b).reduce((s, e) => s + e.amount, 0)),
  }))
  const totalsByType = types
    .map((type) => ({ type, total: rows.filter((e) => e.type === type).reduce((s, e) => s + e.amount, 0) }))
    .sort((a, b) => b.total - a.total)
  return mockDelay({ categories: buckets, series, totalsByType })
}
