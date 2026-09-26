import { mockDelay } from '@/services/http'
import { VEHICLES, VEHICLE_EXPENSES, RIDERS, COST_CENTERS, WORK_SHIFTS, VEHICLE_HANDOVERS, FUEL_LOGS, EXPENSE_ITEMS } from './fixtures'
import { postEntry } from './ledger'
import { fuelPurchases } from './purchases'
import { logAudit } from './audit'

/* Vehicles & expenses (EP-05) + handover, shifts and the fuel sheet (#5).
   A vehicle carries up to two riders (one per shift) and owns a dedicated
   cost center for its expenses. Riders are put on a vehicle only through
   delivery vouchers (تسليم) and taken off by receipt vouchers (استلام). */

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

/* No value and no riders here: riders come from delivery vouchers. */
function normalizeVehiclePayload(payload) {
  return {
    plate: payload.plate,
    type: payload.type,
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
  vSeq += 1
  const id = `v${vSeq}`
  // every vehicle gets its own cost center so its expenses can be traced
  const ccId = `cc-veh-${id}`
  COST_CENTERS.push({ id: ccId, code: `CC-4${String(vSeq).padStart(2, '0')}`, name: `مركبة ${fields.plate}`, budget: 0, active: true, vehicleId: id })
  const v = { id, ...fields, morningRiderId: null, eveningRiderId: null, costCenter: ccId }
  VEHICLES.push(v)
  logAudit({ action: 'create', entity: 'vehicles', detail: v.plate })
  return mockDelay(v)
}

export function updateVehicle(id, payload) {
  const v = VEHICLES.find((x) => x.id === id)
  if (!v) return Promise.reject(new Error('NOT_FOUND'))
  Object.assign(v, normalizeVehiclePayload(payload))
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
/** Create an expense and auto-post Dr expense account (from the item) / Cr Cash (US-018).
    A fuel fill-up credits the fuel stock instead of cash (`creditAccount`). */
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
      { account: payload.creditAccount || 'cash', costCenter: cc, debit: 0, credit: exp.amount },
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

/* ── Vehicle handover (#5) ───────────────────────────────
   Two separate vouchers:
   - delivery (تسليم): the company hands a vehicle to a rider for a shift. It
     stays open while the rider has the vehicle; the rider becomes the
     vehicle's rider for that shift.
   - receipt (استلام): always made from an open delivery voucher — vehicle,
     rider and shift come from it; the odometer reading is required and can't
     be below the delivery reading. It closes the delivery and frees the shift. */
const shiftKey = (shiftId) => (shiftId === 'evening' ? 'eveningRiderId' : shiftId === 'morning' ? 'morningRiderId' : null)
const handoverById = (id) => VEHICLE_HANDOVERS.find((h) => h.id === id)

function decorateHandover(h) {
  const v = VEHICLES.find((x) => x.id === h.vehicleId)
  const delivery = h.kind === 'receipt' ? handoverById(h.deliveryId) : null
  const receipt = h.kind === 'delivery' && h.receiptId ? handoverById(h.receiptId) : null
  return {
    ...h,
    plate: v?.plate ?? '—',
    model: v?.model ?? '',
    shiftName: shiftById(h.shiftId)?.name ?? h.shiftId,
    riderName: riderById(h.riderId)?.name ?? h.riderId,
    open: h.kind === 'delivery' && !h.receiptId,
    // delivery → its receipt; receipt → its delivery, and the km driven between them
    deliveryRef: delivery?.ref ?? null,
    deliveryDate: delivery?.date ?? null,
    deliveryOdometer: delivery?.odometer ?? null,
    receiptRef: receipt?.ref ?? null,
    receiptDate: receipt?.date ?? null,
    km: delivery ? Math.max(0, h.odometer - delivery.odometer) : receipt ? Math.max(0, receipt.odometer - h.odometer) : null,
  }
}

export function fetchHandovers({ kind, vehicleId, riderId, from, to, open } = {}) {
  const rows = VEHICLE_HANDOVERS.filter((h) => {
    if (kind && h.kind !== kind) return false
    if (vehicleId && h.vehicleId !== vehicleId) return false
    if (riderId && h.riderId !== riderId) return false
    if (open && !(h.kind === 'delivery' && !h.receiptId)) return false
    return inRange(h.date, from, to)
  })
    .map(decorateHandover)
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.time < b.time ? 1 : -1))
  return mockDelay(rows)
}

let hSeq = VEHICLE_HANDOVERS.length
const nextRef = (kind) => {
  const prefix = kind === 'delivery' ? 'VD' : 'VR'
  const n = VEHICLE_HANDOVERS.filter((h) => h.kind === kind).length + 1
  return `${prefix}-${new Date().getFullYear()}-${String(n).padStart(4, '0')}`
}
const conditionFields = (payload) => ({
  odometer: Number(payload.odometer) || 0,
  fuel: Math.max(0, Math.min(100, Number(payload.fuel) || 0)),
  condition: payload.condition || 'good',
  notes: payload.notes || '',
  photo: payload.photo ? { name: payload.photo.name, url: payload.photo.url } : null,
  by: payload.by || '',
})

/** Delivery voucher: the company hands the vehicle to a rider for a shift.
    The shift must be free (whoever is on it has to be received back first). */
export function createDelivery(payload) {
  const v = VEHICLES.find((x) => x.id === payload.vehicleId)
  if (!v) return Promise.reject(new Error('VEHICLE_REQUIRED'))
  if (!payload.shiftId || !shiftById(payload.shiftId)) return Promise.reject(new Error('SHIFT_REQUIRED'))
  if (!riderById(payload.riderId)) return Promise.reject(new Error('RIDER_REQUIRED'))
  const key = shiftKey(payload.shiftId)
  if ((key && v[key]) || VEHICLE_HANDOVERS.some((h) => h.kind === 'delivery' && !h.receiptId && h.vehicleId === v.id && h.shiftId === payload.shiftId)) {
    return Promise.reject(new Error('SHIFT_TAKEN'))
  }
  if (assignmentOf(payload.riderId)) return Promise.reject(new Error('RIDER_BUSY'))
  hSeq += 1
  const h = {
    id: `vh${hSeq}`,
    kind: 'delivery',
    ref: nextRef('delivery'),
    vehicleId: v.id,
    riderId: payload.riderId,
    shiftId: payload.shiftId,
    date: payload.date || todayISO(),
    time: payload.time || new Date().toTimeString().slice(0, 5),
    ...conditionFields(payload),
    receiptId: null,
  }
  VEHICLE_HANDOVERS.push(h)
  if (key) v[key] = h.riderId
  logAudit({ action: 'create', entity: 'vehicles', detail: `سند تسليم ${h.ref} — ${v.plate}` })
  return mockDelay(decorateHandover(h))
}

/** Receipt voucher, made from an open delivery voucher. */
export function createReceipt(payload) {
  const d = handoverById(payload.deliveryId)
  if (!d || d.kind !== 'delivery') return Promise.reject(new Error('DELIVERY_REQUIRED'))
  if (d.receiptId) return Promise.reject(new Error('ALREADY_RECEIVED'))
  if (payload.odometer === '' || payload.odometer == null) return Promise.reject(new Error('ODOMETER_REQUIRED'))
  const odometer = Number(payload.odometer) || 0
  if (odometer < d.odometer) return Promise.reject(new Error('ODOMETER_BELOW'))
  const date = payload.date || todayISO()
  if (date < d.date) return Promise.reject(new Error('DATE_BEFORE_DELIVERY'))
  hSeq += 1
  const h = {
    id: `vh${hSeq}`,
    kind: 'receipt',
    ref: nextRef('receipt'),
    deliveryId: d.id,
    vehicleId: d.vehicleId,
    riderId: d.riderId,
    shiftId: d.shiftId,
    date,
    time: payload.time || new Date().toTimeString().slice(0, 5),
    ...conditionFields(payload),
    odometer,
  }
  VEHICLE_HANDOVERS.push(h)
  d.receiptId = h.id
  const v = VEHICLES.find((x) => x.id === d.vehicleId)
  const key = shiftKey(d.shiftId)
  if (v && key && v[key] === d.riderId) v[key] = null
  logAudit({ action: 'create', entity: 'vehicles', detail: `سند استلام ${h.ref} من ${d.ref} — ${v?.plate ?? ''}` })
  return mockDelay(decorateHandover(h))
}

/* ── Fuel sheet (#5 / #6) ────────────────────────────────── */
function decorateFuel(f) {
  const v = VEHICLES.find((x) => x.id === f.vehicleId)
  return { ...f, plate: v?.plate ?? '—', model: v?.model ?? '', amount: f.amount ?? 0, costPerLiter: f.costPerLiter ?? 0 }
}

/** Fuel stock at moving average cost: every purchase re-averages the cost
    per liter; every fill-up takes liters out at that cost. Returns the current
    average, and what is left in stock. */
export function fuelCostState() {
  const events = [
    ...fuelPurchases().map((x) => ({ ...x, kind: 'in' })),
    ...FUEL_LOGS.map((f) => ({ date: f.date, liters: f.liters, value: f.amount ?? 0, kind: 'out' })),
  ].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : a.kind === 'in' ? -1 : 1))
  let liters = 0
  let value = 0
  let avg = 0
  for (const e of events) {
    if (e.kind === 'in') {
      liters += e.liters
      value += e.value
      if (liters > 0) avg = value / liters
    } else {
      liters -= e.liters
      value -= e.value
    }
  }
  return { avgCost: Math.round(avg * 10000) / 10000, stockLiters: Math.round(liters * 100) / 100, stockValue: Math.round(value * 100) / 100 }
}
export function fetchFuelCost() {
  return mockDelay(fuelCostState())
}

export function fetchFuelSheet({ vehicleId, from, to } = {}) {
  const rows = FUEL_LOGS.filter((f) => (!vehicleId || f.vehicleId === vehicleId) && inRange(f.date, from, to))
    .map(decorateFuel)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
  const byVehicle = VEHICLES.map((v) => {
    const mine = rows.filter((r) => r.vehicleId === v.id)
    const liters = mine.reduce((s, r) => s + r.liters, 0)
    const amount = mine.reduce((s, r) => s + r.amount, 0)
    return { id: v.id, plate: v.plate, model: v.model, tankCapacity: v.tankCapacity, fills: mine.length, liters, amount }
  }).filter((r) => r.fills || !vehicleId)
  return mockDelay({
    rows,
    byVehicle,
    totals: { liters: rows.reduce((s, r) => s + r.liters, 0), amount: rows.reduce((s, r) => s + r.amount, 0), fills: rows.length },
    cost: fuelCostState(),
  })
}

let fSeq = FUEL_LOGS.length
/** Log a fill-up: vehicle, liters and odometer — no rider and no typed amount.
    Its cost = liters × the fuel's moving average cost, booked as a fuel
    expense on the vehicle's cost center: Dr fuel expense / Cr fuel stock. */
export async function createFuelLog(payload) {
  if (!payload.vehicleId) return Promise.reject(new Error('VEHICLE_REQUIRED'))
  const liters = Number(payload.liters) || 0
  if (liters <= 0) return Promise.reject(new Error('INVALID_LITERS'))
  const date = payload.date || todayISO()
  const { avgCost } = fuelCostState()
  const amount = Math.round(liters * avgCost * 100) / 100
  const v = VEHICLES.find((x) => x.id === payload.vehicleId)
  const exp = amount > 0
    ? await createExpense({ vehicleId: payload.vehicleId, type: 'fuel', amount, date, invoiceNo: payload.invoiceNo || '—', note: `بنزين ${liters} لتر × ${avgCost}${payload.station ? ` — ${payload.station}` : ''}`, creditAccount: 'fuel_stock' })
    : null
  fSeq += 1
  const f = {
    id: `f${fSeq}`,
    vehicleId: payload.vehicleId,
    date,
    liters,
    costPerLiter: avgCost,
    amount,
    odometer: Number(payload.odometer) || 0,
    station: payload.station || '',
    invoiceNo: payload.invoiceNo || '',
    note: payload.note || '',
    expenseId: exp?.id ?? null,
  }
  FUEL_LOGS.push(f)
  logAudit({ action: 'create', entity: 'vehicles', detail: `تعبئة ${liters} لتر — ${v?.plate ?? ''}` })
  return mockDelay(decorateFuel(f))
}
