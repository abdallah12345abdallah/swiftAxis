import { mockDelay } from '@/services/http'
import { VEHICLES, VEHICLE_EXPENSES, RIDERS } from './fixtures'
import { postEntry } from './ledger'
import { logAudit } from './audit'

/* Vehicles & expenses (EP-05). */

const riderById = (id) => RIDERS.find((r) => r.id === id)

export function fetchVehicles() {
  return mockDelay(
    VEHICLES.map((v) => ({ ...v, riderName: riderById(v.riderId)?.name ?? '—' })),
  )
}

let vSeq = VEHICLES.length
export function createVehicle(payload) {
  vSeq += 1
  const v = { id: `v${vSeq}`, plate: payload.plate, type: payload.type, riderId: payload.riderId || null, costCenter: payload.costCenter || 'cc-fleet' }
  VEHICLES.push(v)
  logAudit({ action: 'create', entity: 'vehicles', detail: v.plate })
  return mockDelay(v)
}
export function updateVehicle(id, payload) {
  const v = VEHICLES.find((x) => x.id === id)
  if (!v) return Promise.reject(new Error('NOT_FOUND'))
  Object.assign(v, { plate: payload.plate, type: payload.type, riderId: payload.riderId || null, costCenter: payload.costCenter || v.costCenter })
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
    const rider = riderById(v.riderId)
    const revenue = rider ? rider.commission : 0
    const expenses = VEHICLE_EXPENSES.filter((e) => e.vehicleId === v.id && inRange(e.date, from, to)).reduce((s, e) => s + e.amount, 0)
    const net = revenue - expenses
    return { id: v.id, plate: v.plate, riderName: rider?.name ?? '—', revenue, expenses, net, margin: revenue ? Math.round((net / revenue) * 100) : 0 }
  })
  return mockDelay(rows)
}
