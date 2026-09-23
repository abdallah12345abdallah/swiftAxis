import { mockDelay } from '@/services/http'
import { ORDERS, RIDERS, MANUAL_ORDERS } from './fixtures'
import { formulaFor, computeCommission } from './commissions'
import { creditWallet } from './wallets'
import { logAudit } from './audit'

/* Daily order logging (EP-02) + manual single-order entry (#3). */

const riderById = (id) => RIDERS.find((r) => r.id === id)
const todayISO = () => new Date().toISOString().slice(0, 10)

function decorate(o) {
  const rider = riderById(o.riderId)
  const preview = rider ? computeCommission(o.orders, formulaFor(rider)) : null
  return { ...o, riderName: rider?.name ?? o.riderId, riderCode: o.riderId, commission: preview?.total ?? 0 }
}

/** List order logs, optionally filtered. */
export function fetchOrders({ riderId, from, to } = {}) {
  const rows = ORDERS.filter((o) => {
    if (riderId && o.riderId !== riderId) return false
    if (from && o.date < from) return false
    if (to && o.date > to) return false
    return true
  })
    .map(decorate)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
  return mockDelay(rows)
}

/** Live commission preview for a rider + order count (US-006). */
export function previewCommission(riderId, orders) {
  const rider = riderById(riderId)
  return computeCommission(Number(orders) || 0, rider ? formulaFor(rider) : null)
}

let seq = ORDERS.length

/** Create a daily log. Rejects future dates (US-006). */
export function createOrder(payload) {
  if (payload.date > todayISO()) return Promise.reject(new Error('FUTURE_DATE'))
  seq += 1
  const o = {
    id: `o${seq}`,
    riderId: payload.riderId,
    date: payload.date,
    orders: Number(payload.orders) || 0,
    cash: Number(payload.cash) || 0,
    hours: Number(payload.hours) || 0,
    notes: payload.notes || '',
    editedBy: null,
  }
  ORDERS.push(o)
  if (o.cash) creditWallet(o.riderId, o.cash, o.date, 'كاش أوردرات')
  logAudit({ action: 'create', entity: 'orders', detail: `تسجيل أوردرات ${o.riderId} ليوم ${o.date}` })
  return mockDelay(decorate(o))
}

/**
 * Edit a log. Rider: same-day only. Supervisor: within 3 days, requires reason,
 * records who/when (US-008). Rejects OUT_OF_WINDOW / REASON_REQUIRED.
 */
export function updateOrder(id, payload, { bySupervisor = false, editor = '', reason = '' } = {}) {
  const o = ORDERS.find((x) => x.id === id)
  if (!o) return Promise.reject(new Error('NOT_FOUND'))
  const ageDays = Math.floor((new Date(todayISO()) - new Date(o.date)) / 86400000)
  const limit = bySupervisor ? 3 : 0
  if (ageDays > limit) return Promise.reject(new Error('OUT_OF_WINDOW'))
  if (bySupervisor && !reason.trim()) return Promise.reject(new Error('REASON_REQUIRED'))
  Object.assign(o, {
    orders: Number(payload.orders) || 0,
    cash: Number(payload.cash) || 0,
    hours: Number(payload.hours) || 0,
    notes: payload.notes || '',
    editedBy: bySupervisor ? { editor, reason, at: new Date().toISOString().slice(0, 16) } : o.editedBy,
  })
  logAudit({ action: 'update', entity: 'orders', detail: `تعديل ${o.id}${reason ? ' — ' + reason : ''}`, user: editor || undefined, role: bySupervisor ? 'supervisor' : 'rider' })
  return mockDelay(decorate(o))
}

/** Bulk import reviewed rows (US-009). */
export function importOrders(rows) {
  const created = []
  rows.forEach((r) => {
    seq += 1
    const o = { id: `o${seq}`, riderId: r.riderId, date: r.date, orders: r.orders, cash: r.cash, hours: r.hours ?? 0, notes: 'استيراد', editedBy: null }
    ORDERS.push(o)
    if (o.cash) creditWallet(o.riderId, o.cash, o.date, 'استيراد كاش')
    created.push(o)
  })
  logAudit({ action: 'create', entity: 'orders', detail: `استيراد ${created.length} سجل` })
  return mockDelay(created)
}

/** Mock parse of an uploaded Hunger Station report → rows to review (US-009). */
export function parseImport() {
  const sample = [
    { riderId: 'R-001', date: todayISO(), orders: 24, cash: 690, conflict: false },
    { riderId: 'R-002', date: todayISO(), orders: 26, cash: 730, conflict: true },
    { riderId: 'R-005', date: todayISO(), orders: 19, cash: 540, conflict: false },
  ]
  return mockDelay(sample, 600)
}

/* ── Manual orders (#3) ──────────────────────────────────── */

function decorateManual(m) {
  const rider = riderById(m.riderId)
  return { ...m, riderName: rider?.name ?? m.riderId, riderCode: m.riderId, uncollected: Math.max(0, m.price - m.collected) }
}

export function fetchManualOrders({ riderId, from, to } = {}) {
  const rows = MANUAL_ORDERS.filter((m) => {
    if (riderId && m.riderId !== riderId) return false
    if (from && m.date < from) return false
    if (to && m.date > to) return false
    return true
  })
    .map(decorateManual)
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.time < b.time ? 1 : -1))
  return mockDelay(rows)
}

let mSeq = MANUAL_ORDERS.length
/** Enter one order by hand. It rolls up into the rider's daily log for that
    date (orders +1, cash += collected) and credits the wallet. */
export function createManualOrder(payload) {
  const orderNo = String(payload.orderNo || '').trim()
  if (!orderNo) return Promise.reject(new Error('ORDER_NO_REQUIRED'))
  if (MANUAL_ORDERS.some((m) => m.orderNo.toLowerCase() === orderNo.toLowerCase())) return Promise.reject(new Error('DUPLICATE_ORDER'))
  if (!riderById(payload.riderId)) return Promise.reject(new Error('RIDER_REQUIRED'))
  const date = payload.date || todayISO()
  if (date > todayISO()) return Promise.reject(new Error('FUTURE_DATE'))
  const price = Number(payload.price) || 0
  const collected = Number(payload.collected) || 0
  if (collected > price) return Promise.reject(new Error('COLLECTED_EXCEEDS_PRICE'))
  mSeq += 1
  const m = {
    id: `mo${mSeq}`, orderNo, riderId: payload.riderId, date,
    time: payload.time || new Date().toTimeString().slice(0, 5),
    km: Number(payload.km) || 0, price, collected, createdBy: payload.by || '',
  }
  MANUAL_ORDERS.push(m)
  // roll up into the daily log
  let log = ORDERS.find((o) => o.riderId === m.riderId && o.date === m.date)
  if (!log) {
    seq += 1
    log = { id: `o${seq}`, riderId: m.riderId, date: m.date, orders: 0, cash: 0, hours: 0, notes: 'أوردرات يدوية', editedBy: null }
    ORDERS.push(log)
  }
  log.orders += 1
  log.cash += collected
  if (collected) creditWallet(m.riderId, collected, m.date, `أوردر ${orderNo}`)
  logAudit({ action: 'create', entity: 'orders', detail: `أوردر يدوي ${orderNo} — ${m.riderId}`, user: payload.by || undefined })
  return mockDelay(decorateManual(m))
}

/** Order numbers a rider handled in a range (period report, #9). Internal. */
export function orderNosFor(riderId, from, to) {
  return MANUAL_ORDERS.filter((m) => m.riderId === riderId && (!from || m.date >= from) && (!to || m.date <= to)).map((m) => m.orderNo)
}
