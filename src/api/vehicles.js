import { mockDelay } from '@/services/http'
import { VEHICLES, VEHICLE_EXPENSES, RIDERS, COST_CENTERS, WORK_SHIFTS, VEHICLE_HANDOVERS, FUEL_LOGS, EXPENSE_ITEMS } from './fixtures'
import { postEntry } from './ledger'
import { logAudit } from './audit'

/* Vehicles & expenses (EP-05) + handover, shifts and the fuel sheet (#5).
   A vehicle carries up to two riders (one per shift) and owns a dedicated
   cost center for its expenses. */

const riderById = (id) => RIDERS.find((r) => r.id === id)
const todayISO = () => new Date().toISOString().slice(0, 10)

function decorate(v) {
  return {
    ...v,
    morningRiderName: riderById(v.morningRiderId)?.name ?? null,
    eveningRiderName: riderById(v.eveningRiderId)?.name ?? null,
    ridersLabel: [riderById(v.morningRiderId)?.name, riderById(v.eveningRiderId)?.name].filter(Boolean).join(' / ') || '—',
    label: [v.plate, v.model].filter(Boolean).join(' · '),
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
    // identity (#5)
    chassis: payload.chassis?.trim() || '',
    color: payload.color?.trim() || '',
    model: payload.model?.trim() || '',
    year: Number(payload.year) || null,
    tankCapacity: Number(payload.tankCapacity) || null,
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
  COST_CENTERS.push({ id: ccId, code: `CC-4${String(vSeq).padStart(2, '0')}`, name: `مركبة ${fields.plate}`, budget: 0, active: true, vehicleId: id })
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

export function fetchExpenses({ vehicleId, from, to, type } = {}) {
  const rows = VEHICLE_EXPENSES.filter((e) => {
    if (vehicleId && e.vehicleId !== vehicleId) return false
    if (type && e.type !== type) return false
    if (!inRange(e.date, from, to)) return false
    return true
  })
    .map((e) => ({ ...e, plate: VEHICLES.find((v) => v.id === e.vehicleId)?.plate ?? '—' }))
    .sort((a, b) => (a.date < b.date ? 1 : -1))
  return mockDelay(rows)
}

let eSeq = VEHICLE_EXPENSES.length
/** Create an expense and auto-post Dr expense account (from the item) / Cr Cash (US-018). */
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
  const account = EXPENSE_ITEMS.find((i) => i.id === exp.type)?.account || 'vehicle_expense'
  await postEntry({
    source: 'vehicles',
    date: exp.date,
    description: `مصروف سيارة — ${exp.invoiceNo}`,
    lines: [
      { account, costCenter: cc, debit: exp.amount, credit: 0 },
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

/* ── Work shifts (#5) ────────────────────────────────────── */
export const shiftById = (id) => WORK_SHIFTS.find((s) => s.id === id)

export function fetchShifts() {
  return mockDelay(WORK_SHIFTS.map((s) => ({ ...s, vehicles: VEHICLES.filter((v) => v[`${s.id}RiderId`]).length, handovers: VEHICLE_HANDOVERS.filter((h) => h.shiftId === s.id).length })))
}
export function createShift(payload) {
  if (!payload.name?.trim()) return Promise.reject(new Error('NAME_REQUIRED'))
  const id = `shift-${WORK_SHIFTS.length + 1}`
  const s = { id, name: payload.name.trim(), en: payload.en?.trim() || payload.name.trim(), from: payload.from || '00:00', to: payload.to || '00:00', active: payload.active ?? true }
  WORK_SHIFTS.push(s)
  logAudit({ action: 'create', entity: 'shifts', detail: s.name })
  return mockDelay(s)
}
export function updateShift(id, payload) {
  const s = shiftById(id)
  if (!s) return Promise.reject(new Error('NOT_FOUND'))
  Object.assign(s, { name: payload.name?.trim() || s.name, en: payload.en?.trim() || s.en, from: payload.from || s.from, to: payload.to || s.to, active: payload.active ?? s.active })
  logAudit({ action: 'update', entity: 'shifts', detail: s.name })
  return mockDelay(s)
}

/* ── Vehicle handover (#5) ───────────────────────────────── */
function decorateHandover(h) {
  const v = VEHICLES.find((x) => x.id === h.vehicleId)
  return {
    ...h,
    plate: v?.plate ?? '—',
    model: v?.model ?? '',
    shiftName: shiftById(h.shiftId)?.name ?? h.shiftId,
    fromName: h.fromType === 'company' ? null : riderById(h.fromRiderId)?.name ?? h.fromRiderId,
    toName: h.toType === 'company' ? null : riderById(h.toRiderId)?.name ?? h.toRiderId,
  }
}

export function fetchHandovers({ vehicleId, riderId, from, to } = {}) {
  const rows = VEHICLE_HANDOVERS.filter((h) => {
    if (vehicleId && h.vehicleId !== vehicleId) return false
    if (riderId && h.fromRiderId !== riderId && h.toRiderId !== riderId) return false
    return inRange(h.date, from, to)
  })
    .map(decorateHandover)
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.time < b.time ? 1 : -1))
  return mockDelay(rows)
}

let hSeq = VEHICLE_HANDOVERS.length
/** Document a handover. The receiving rider becomes the vehicle's rider for
    that shift (or the shift is freed when it goes back to the company). */
export function createHandover(payload) {
  const v = VEHICLES.find((x) => x.id === payload.vehicleId)
  if (!v) return Promise.reject(new Error('VEHICLE_REQUIRED'))
  if (!payload.shiftId || !shiftById(payload.shiftId)) return Promise.reject(new Error('SHIFT_REQUIRED'))
  const fromType = payload.fromType || 'rider'
  const toType = payload.toType || 'rider'
  if (fromType === 'rider' && !payload.fromRiderId) return Promise.reject(new Error('FROM_REQUIRED'))
  if (toType === 'rider' && !payload.toRiderId) return Promise.reject(new Error('TO_REQUIRED'))
  if (fromType === 'company' && toType === 'company') return Promise.reject(new Error('SAME_PARTY'))
  if (fromType === 'rider' && toType === 'rider' && payload.fromRiderId === payload.toRiderId) return Promise.reject(new Error('SAME_PARTY'))
  hSeq += 1
  const h = {
    id: `vh${hSeq}`,
    vehicleId: v.id,
    date: payload.date || todayISO(),
    time: payload.time || new Date().toTimeString().slice(0, 5),
    shiftId: payload.shiftId,
    fromType,
    fromRiderId: fromType === 'rider' ? payload.fromRiderId : null,
    toType,
    toRiderId: toType === 'rider' ? payload.toRiderId : null,
    odometer: Number(payload.odometer) || 0,
    fuel: Math.max(0, Math.min(100, Number(payload.fuel) || 0)),
    condition: payload.condition || 'good',
    notes: payload.notes || '',
    photo: payload.photo ? { name: payload.photo.name, url: payload.photo.url } : null,
    by: payload.by || '',
  }
  VEHICLE_HANDOVERS.push(h)
  // keep the vehicle's shift assignment in step with the paperwork
  const key = h.shiftId === 'evening' ? 'eveningRiderId' : h.shiftId === 'morning' ? 'morningRiderId' : null
  if (key) v[key] = toType === 'rider' ? h.toRiderId : null
  logAudit({ action: 'create', entity: 'vehicles', detail: `تسليم/استلام ${v.plate}` })
  return mockDelay(decorateHandover(h))
}

/* ── Fuel sheet (#5 / #6) ────────────────────────────────── */
function decorateFuel(f) {
  const v = VEHICLES.find((x) => x.id === f.vehicleId)
  return { ...f, plate: v?.plate ?? '—', model: v?.model ?? '', riderName: riderById(f.riderId)?.name ?? '—', pricePerLiter: f.liters ? Math.round((f.amount / f.liters) * 100) / 100 : 0 }
}

export function fetchFuelSheet({ vehicleId, riderId, from, to } = {}) {
  const rows = FUEL_LOGS.filter((f) => (!vehicleId || f.vehicleId === vehicleId) && (!riderId || f.riderId === riderId) && inRange(f.date, from, to))
    .map(decorateFuel)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
  const byVehicle = VEHICLES.map((v) => {
    const mine = rows.filter((r) => r.vehicleId === v.id)
    const liters = mine.reduce((s, r) => s + r.liters, 0)
    const amount = mine.reduce((s, r) => s + r.amount, 0)
    return { id: v.id, plate: v.plate, model: v.model, tankCapacity: v.tankCapacity, fills: mine.length, liters, amount, avgPrice: liters ? Math.round((amount / liters) * 100) / 100 : 0 }
  }).filter((r) => r.fills || !vehicleId)
  return mockDelay({
    rows,
    byVehicle,
    totals: { liters: rows.reduce((s, r) => s + r.liters, 0), amount: rows.reduce((s, r) => s + r.amount, 0), fills: rows.length },
  })
}

let fSeq = FUEL_LOGS.length
/** Log a fill-up. Also books a `fuel` expense on the vehicle's cost center. */
export async function createFuelLog(payload) {
  if (!payload.vehicleId) return Promise.reject(new Error('VEHICLE_REQUIRED'))
  const amt = Number(payload.amount) || 0
  if (amt <= 0) return Promise.reject(new Error('INVALID_AMOUNT'))
  const exp = await createExpense({ vehicleId: payload.vehicleId, type: 'fuel', amount: amt, date: payload.date || todayISO(), invoiceNo: payload.invoiceNo || '—', note: payload.station ? `بنزين — ${payload.station}` : 'بنزين' })
  fSeq += 1
  const f = {
    id: `f${fSeq}`,
    vehicleId: payload.vehicleId,
    riderId: payload.riderId || null,
    date: payload.date || todayISO(),
    liters: Number(payload.liters) || 0,
    amount: amt,
    odometer: Number(payload.odometer) || 0,
    station: payload.station || '',
    note: payload.note || '',
    expenseId: exp.id,
  }
  FUEL_LOGS.push(f)
  return mockDelay(decorateFuel(f))
}
