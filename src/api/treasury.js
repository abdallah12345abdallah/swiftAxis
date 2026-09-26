import { mockDelay } from '@/services/http'
import { TREASURIES, TREASURY_MOVEMENTS, RIDER_TREASURY, RIDERS, EXPENSE_ITEMS, CITIES, SUPPLIERS, CONTRACT_LIST, CONTRACT_COST_CENTER, USERS, PURCHASES } from './fixtures'
import { ROLES } from '@/lib/constants'
import { postEntry } from './ledger'
import { logAudit } from './audit'

/* Treasuries & banks (#4). Every treasury maps to a GL account, so receipt /
   payment vouchers and transfers post balanced entries through the ledger.
   Transfers born from a rider cash handover stay `pending` until the
   accountant approves the deposit (wallets.decideDeposit). */

export const treasuryById = (id) => TREASURIES.find((t) => t.id === id)
export const mainTreasury = () => TREASURIES.find((t) => t.isMain) ?? TREASURIES[0]
/* Box permissions are per user: each box lists the users (`userIds`)
   allowed to work on it; a manager always has every box. A box without the
   field predates permissions and stays open to all. */
export const canUseTreasury = (t, user) => !!t && !!user && (user.role === ROLES.MANAGER || !Array.isArray(t.userIds) || t.userIds.includes(user.id))
/** Users that can be granted a box: active staff other than managers and riders. */
export const treasuryUsers = () => USERS.filter((u) => u.active && u.role !== ROLES.MANAGER && u.role !== ROLES.RIDER)
const cleanUsers = (ids) => (Array.isArray(ids) ? [...new Set(ids.filter((id) => treasuryUsers().some((u) => u.id === id)))] : [])

/* Voucher counterparty (سند قبض / صرف): a customer (contract company), a
   supplier or a chart account. Customers and suppliers post to their control
   accounts; an `account` party posts to the account picked on the voucher. */
export const PARTY_TYPES = ['customer', 'supplier', 'account']
const PARTY_ACCOUNT = { customer: 'receivables', supplier: 'suppliers' }
const partyName = (type, id) =>
  type === 'customer' ? CONTRACT_LIST.find((c) => c.id === id)?.company : type === 'supplier' ? SUPPLIERS.find((s) => s.id === id)?.name : null
/** Older rows carry no party type: infer it from the account they posted to. */
const inferPartyType = (m) => m.partyType ?? (m.account === 'receivables' ? 'customer' : m.account === 'suppliers' ? 'supplier' : 'account')

/** The custody box a rider's collected cash sits in (settings → rider link). */
export const treasuryOfRider = (riderId) =>
  treasuryById(RIDER_TREASURY[riderId]) ?? TREASURIES.find((t) => t.kind === 'rider') ?? mainTreasury()

const ACCOUNT_BY_KIND = { cash: 'cash', bank: 'bank', rider: 'rider_wallets' }
const IN_TYPES = new Set(['receipt', 'transfer_in'])
const signed = (m) => (IN_TYPES.has(m.type) ? m.amount : -m.amount)
const riderById = (id) => RIDERS.find((r) => r.id === id)

const year = () => new Date().getFullYear()
/** Next voucher reference per prefix: RV (receipt) / PV (payment) / TR (transfer). */
export function nextVoucherRef(prefix) {
  const n = new Set(TREASURY_MOVEMENTS.filter((m) => m.ref?.startsWith(`${prefix}-${year()}`)).map((m) => m.ref)).size + 1
  return `${prefix}-${year()}-${String(n).padStart(4, '0')}`
}

let seq = TREASURY_MOVEMENTS.length
let tfSeq = 1
function pushMovement(m) {
  seq += 1
  const row = { id: `tm${seq}`, status: 'posted', costCenter: null, riderId: null, ...m }
  TREASURY_MOVEMENTS.push(row)
  return row
}

/** Posted balance of a treasury (opening + posted movements). */
export function balanceOf(treasuryId) {
  const t = treasuryById(treasuryId)
  if (!t) return 0
  return TREASURY_MOVEMENTS.filter((m) => m.treasuryId === treasuryId && m.status === 'posted').reduce((s, m) => s + signed(m), t.opening)
}

function decorate(t) {
  const pending = TREASURY_MOVEMENTS.filter((m) => m.treasuryId === t.id && m.status === 'pending')
  return {
    ...t,
    balance: balanceOf(t.id),
    pendingIn: pending.filter((m) => IN_TYPES.has(m.type)).reduce((s, m) => s + m.amount, 0),
    pendingOut: pending.filter((m) => !IN_TYPES.has(m.type)).reduce((s, m) => s + m.amount, 0),
    riders: Object.values(RIDER_TREASURY).filter((id) => id === t.id).length,
    movements: TREASURY_MOVEMENTS.filter((m) => m.treasuryId === t.id).length,
    // named users with access (null = open to everyone)
    users: Array.isArray(t.userIds) ? t.userIds.map((id) => USERS.find((u) => u.id === id)).filter(Boolean).map(({ id, name, role }) => ({ id, name, role })) : null,
  }
}

/* ── Treasuries CRUD ─────────────────────────────────────── */
export function fetchTreasuries() {
  return mockDelay(TREASURIES.map(decorate))
}
export function createTreasury(payload) {
  if (!payload.name?.trim()) return Promise.reject(new Error('NAME_REQUIRED'))
  const kind = payload.kind || 'cash'
  const t = {
    id: `tr-${Date.now().toString(36)}`,
    name: payload.name.trim(),
    kind,
    account: ACCOUNT_BY_KIND[kind] || 'cash',
    iban: kind === 'bank' ? payload.iban || '' : undefined,
    opening: Number(payload.opening) || 0,
    active: payload.active ?? true,
    userIds: cleanUsers(payload.userIds),
  }
  TREASURIES.push(t)
  logAudit({ action: 'create', entity: 'treasury', detail: t.name })
  return mockDelay(decorate(t))
}
export function updateTreasury(id, payload) {
  const t = treasuryById(id)
  if (!t) return Promise.reject(new Error('NOT_FOUND'))
  const kind = payload.kind || t.kind
  Object.assign(t, {
    name: payload.name?.trim() || t.name,
    kind,
    account: ACCOUNT_BY_KIND[kind] || t.account,
    iban: kind === 'bank' ? payload.iban ?? t.iban : undefined,
    opening: payload.opening !== undefined ? Number(payload.opening) || 0 : t.opening,
    active: payload.active ?? t.active,
    userIds: payload.userIds !== undefined ? cleanUsers(payload.userIds) : t.userIds,
  })
  logAudit({ action: 'update', entity: 'treasury', detail: t.name })
  return mockDelay(decorate(t))
}

/* ── Vouchers ────────────────────────────────────────────── */

/** Resolve a voucher's counterparty: customer / supplier pin the control
    account and the party name; `account` keeps the given account. */
function resolveParty({ partyType, partyId, party, account, costCenter }) {
  if (!PARTY_TYPES.includes(partyType)) return { partyType: null, partyId: null, party, account, costCenter }
  if (partyType === 'account') return { partyType, partyId: null, party, account, costCenter }
  const name = partyName(partyType, partyId)
  if (!name) return { error: 'PARTY_REQUIRED' }
  return {
    partyType,
    partyId,
    party: name,
    account: PARTY_ACCOUNT[partyType],
    // a customer's contract carries its own cost center when none is picked
    costCenter: costCenter || (partyType === 'customer' ? CONTRACT_COST_CENTER[partyId] || null : null),
  }
}

/** Receipt voucher (سند قبض): money in. Dr treasury account / Cr counter account
    (the customer's receivable, the supplier's payable, or the picked account). */
export async function createReceipt({ treasuryId, date, amount, party = '', description = '', account = 'delivery_revenue', costCenter = null, riderId = null, source = 'treasury', status = 'posted', partyType = null, partyId = null }) {
  const t = treasuryById(treasuryId)
  if (!t) return Promise.reject(new Error('NOT_FOUND'))
  const amt = Number(amount) || 0
  if (amt <= 0) return Promise.reject(new Error('INVALID_AMOUNT'))
  const p = resolveParty({ partyType, partyId, party, account, costCenter })
  if (p.error) return Promise.reject(new Error(p.error))
  ;({ party, account, costCenter } = p)
  if (!account) return Promise.reject(new Error('ACCOUNT_REQUIRED'))
  const ref = nextVoucherRef('RV')
  const row = pushMovement({ ref, type: 'receipt', treasuryId, date, amount: amt, party, partyType: p.partyType, partyId: p.partyId, description, account, costCenter, riderId, source, status })
  if (status === 'posted' && account !== t.account) {
    await postEntry({
      source,
      date,
      description: `سند قبض ${ref} — ${description || party}`,
      lines: [
        { account: t.account, costCenter, debit: amt, credit: 0 },
        { account, costCenter, debit: 0, credit: amt },
      ],
    })
  }
  logAudit({ action: 'create', entity: 'treasury', detail: `سند قبض ${ref}` })
  return mockDelay(row)
}

/* ── Purchase invoices a supplier payment settles ── */
const paidOnPurchase = (pur) =>
  TREASURY_MOVEMENTS.filter((m) => m.type === 'payment' && m.status !== 'rejected' && (m.purchaseId ? m.purchaseId === pur.id : m.partyId === pur.supplierId && m.invoiceNo && m.invoiceNo === pur.invoiceNo))
    .reduce((sum, m) => sum + m.amount, 0)

/** A supplier's purchase invoices that still have something to pay, oldest first. */
export function fetchOpenPurchaseInvoices(supplierId) {
  const rows = PURCHASES.filter((pur) => pur.supplierId === supplierId)
    .map((pur) => {
      const paid = paidOnPurchase(pur)
      return { id: pur.id, ref: pur.ref, invoiceNo: pur.invoiceNo, date: pur.date, total: pur.total, paid, remaining: Math.max(0, Math.round((pur.total - paid) * 100) / 100) }
    })
    .filter((r) => r.remaining > 0)
    .sort((x, y) => (x.date < y.date ? -1 : 1))
  return mockDelay(rows)
}

/** Payment voucher (سند صرف): money out, Cr treasury.
    - supplier: Dr the supplier's payable. A purchase invoice of that supplier
      must be picked (`purchaseId`) and the amount can't exceed what is left on it.
    - account (expenses): one or more expense lines `[{ expenseItem, amount,
      costCenter, note }]` — each debits its item's account on its own cost
      center (falls back to the voucher's), so the warehouse can charge any
      center (#6). Internal callers may still pass a plain `account` + `amount`.
    - customer: Dr the customer's receivable. */
export async function createPayment({ treasuryId, date, amount, party = '', description = '', account = null, expenseItem = null, lines = null, costCenter = null, riderId = null, source = 'treasury', partyType = null, partyId = null, invoiceNo = '', purchaseId = null }) {
  const t = treasuryById(treasuryId)
  if (!t) return Promise.reject(new Error('NOT_FOUND'))

  // expense lines (account payments from the voucher screen)
  const expLines = Array.isArray(lines)
    ? lines.map((l) => {
        const item = EXPENSE_ITEMS.find((i) => i.id === l.expenseItem)
        return { expenseItem: item?.id ?? null, account: item?.account ?? null, amount: Math.round((Number(l.amount) || 0) * 100) / 100, costCenter: l.costCenter || costCenter || null, note: String(l.note ?? '').trim() }
      })
    : null
  if (expLines) {
    if (!expLines.length) return Promise.reject(new Error('LINES_REQUIRED'))
    if (expLines.some((l) => !l.expenseItem)) return Promise.reject(new Error('ITEM_REQUIRED'))
    if (expLines.some((l) => l.amount <= 0)) return Promise.reject(new Error('INVALID_AMOUNT'))
  }
  const amt = expLines ? expLines.reduce((sum, l) => sum + l.amount, 0) : Number(amount) || 0
  if (amt <= 0) return Promise.reject(new Error('INVALID_AMOUNT'))

  const item = expLines ? EXPENSE_ITEMS.find((i) => i.id === expLines[0].expenseItem) : expenseItem ? EXPENSE_ITEMS.find((i) => i.id === expenseItem) : null
  const p = resolveParty({ partyType, partyId, party, account: expLines ? expLines[0].account : account || item?.account || 'general_expense', costCenter })
  if (p.error) return Promise.reject(new Error(p.error))
  const acc = p.account
  ;({ party, costCenter } = p)

  // a supplier payment settles one of that supplier's purchase invoices
  let purchase = null
  if (p.partyType === 'supplier' && source === 'treasury') {
    purchase = PURCHASES.find((x) => x.id === purchaseId && x.supplierId === p.partyId)
    if (!purchase) return Promise.reject(new Error('INVOICE_REQUIRED'))
    if (amt > purchase.total - paidOnPurchase(purchase) + 0.001) return Promise.reject(new Error('EXCEEDS_INVOICE'))
  }

  const ref = nextVoucherRef('PV')
  const row = pushMovement({
    ref, type: 'payment', treasuryId, date, amount: amt, party, partyType: p.partyType, partyId: p.partyId,
    purchaseId: purchase?.id ?? null, invoiceNo: purchase ? purchase.invoiceNo : String(invoiceNo || '').trim(),
    description, account: acc, expenseItem: p.partyType === 'account' || !p.partyType ? item?.id ?? null : null,
    ...(expLines && p.partyType === 'account' ? { lines: expLines } : {}),
    costCenter, riderId, source,
  })
  const debits = expLines && p.partyType === 'account'
    ? expLines.map((l) => ({ account: l.account, costCenter: l.costCenter, debit: l.amount, credit: 0, description: l.note }))
    : [{ account: acc, costCenter, debit: amt, credit: 0 }]
  if (debits.some((d) => d.account !== t.account)) {
    await postEntry({
      source,
      date,
      description: `سند صرف ${ref} — ${description || party}${row.invoiceNo ? ` (فاتورة ${row.invoiceNo})` : ''}`,
      lines: [...debits, { account: t.account, costCenter, debit: 0, credit: amt }],
    })
  }
  logAudit({ action: 'create', entity: 'treasury', detail: `سند صرف ${ref}` })
  return mockDelay(row)
}

async function postTransferEntry(from, to, amt, date, description, ref, source) {
  if (from.account === to.account) return null // same GL account → nets to zero
  return postEntry({
    source,
    date,
    description: `تحويل ${ref} — ${description || `${from.name} ← ${to.name}`}`,
    lines: [
      { account: to.account, costCenter: null, debit: amt, credit: 0 },
      { account: from.account, costCenter: null, debit: 0, credit: amt },
    ],
  })
}

/** Transfer between two treasuries. `pending` transfers hold until settled. */
export async function createTransfer({ fromId, toId, date, amount, description = '', status = 'posted', source = 'treasury', riderId = null }) {
  const from = treasuryById(fromId)
  const to = treasuryById(toId)
  if (!from || !to) return Promise.reject(new Error('NOT_FOUND'))
  if (from.id === to.id) return Promise.reject(new Error('SAME_TREASURY'))
  const amt = Number(amount) || 0
  if (amt <= 0) return Promise.reject(new Error('INVALID_AMOUNT'))
  const ref = nextVoucherRef('TR')
  tfSeq += 1
  const transferId = `tf${tfSeq}`
  pushMovement({ ref, type: 'transfer_out', treasuryId: from.id, date, amount: amt, party: to.name, description, transferId, status, source, riderId })
  pushMovement({ ref, type: 'transfer_in', treasuryId: to.id, date, amount: amt, party: from.name, description, transferId, status, source, riderId })
  if (status === 'posted') await postTransferEntry(from, to, amt, date, description, ref, source)
  logAudit({ action: 'create', entity: 'treasury', detail: `تحويل ${ref}` })
  return mockDelay({ transferId, ref })
}

/** Approve (post) or reject a pending transfer. Internal — used by wallets. */
export async function settleTransfer(transferId, approved) {
  const rows = TREASURY_MOVEMENTS.filter((m) => m.transferId === transferId)
  if (!rows.length) return null
  rows.forEach((m) => (m.status = approved ? 'posted' : 'rejected'))
  if (approved) {
    const out = rows.find((m) => m.type === 'transfer_out')
    const inn = rows.find((m) => m.type === 'transfer_in')
    await postTransferEntry(treasuryById(out.treasuryId), treasuryById(inn.treasuryId), out.amount, out.date, out.description, out.ref, out.source)
  }
  return rows
}

/** Cash a rider collected goes into their custody box (no ledger — the wallet
    is the ledger's view of it). Internal, sync. */
export function recordCustodyReceipt(riderId, amount, date, description) {
  const t = treasuryOfRider(riderId)
  const amt = Number(amount) || 0
  if (!t || amt <= 0) return null
  return pushMovement({ ref: nextVoucherRef('RV'), type: 'receipt', treasuryId: t.id, date, amount: amt, party: riderById(riderId)?.name ?? riderId, description, account: t.account, riderId, source: 'orders' })
}

/* ── Queries ─────────────────────────────────────────────── */
const inRange = (d, from, to) => (!from || d >= from) && (!to || d <= to)

function decorateMovement(m) {
  return { ...m, partyType: m.type === 'receipt' || m.type === 'payment' ? inferPartyType(m) : null, treasuryName: treasuryById(m.treasuryId)?.name ?? m.treasuryId, riderName:m.riderId ? riderById(m.riderId)?.name ?? null : null }
}

export function fetchMovements({ treasuryId, type, from, to, status, riderId } = {}) {
  const rows = TREASURY_MOVEMENTS.filter((m) => {
    if (treasuryId && m.treasuryId !== treasuryId) return false
    if (type && m.type !== type) return false
    if (status && m.status !== status) return false
    if (riderId && m.riderId !== riderId) return false
    return inRange(m.date, from, to)
  })
    .map(decorateMovement)
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.id.localeCompare(a.id, undefined, { numeric: true })))
  return mockDelay(rows)
}

/** Statement with running balance (posted movements only, oldest first → returned newest first). */
export function fetchTreasuryStatement(treasuryId, { from, to } = {}) {
  const t = treasuryById(treasuryId)
  if (!t) return Promise.reject(new Error('NOT_FOUND'))
  const all = TREASURY_MOVEMENTS.filter((m) => m.treasuryId === treasuryId && m.status === 'posted')
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : a.id.localeCompare(b.id, undefined, { numeric: true })))
  let running = t.opening
  const rows = all.map((m) => {
    running += signed(m)
    return { ...decorateMovement(m), in: IN_TYPES.has(m.type) ? m.amount : 0, out: IN_TYPES.has(m.type) ? 0 : m.amount, balance: running }
  })
  const filtered = rows.filter((m) => inRange(m.date, from, to))
  const openingBalance = filtered.length ? filtered[0].balance - signed(filtered[0]) : running
  return mockDelay({
    treasury: decorate(t),
    openingBalance,
    closingBalance: filtered.length ? filtered[filtered.length - 1].balance : openingBalance,
    totalIn: filtered.reduce((s, m) => s + m.in, 0),
    totalOut: filtered.reduce((s, m) => s + m.out, 0),
    rows: [...filtered].reverse(),
  })
}

/** Transfers as single rows (out + in pair collapsed). */
export function fetchTransfers({ from, to, status } = {}) {
  const byId = new Map()
  TREASURY_MOVEMENTS.filter((m) => m.transferId).forEach((m) => {
    const row = byId.get(m.transferId) ?? { transferId: m.transferId, ref: m.ref, date: m.date, amount: m.amount, description: m.description, status: m.status, source: m.source, riderId: m.riderId }
    if (m.type === 'transfer_out') row.from = treasuryById(m.treasuryId)?.name ?? m.treasuryId
    if (m.type === 'transfer_in') row.to = treasuryById(m.treasuryId)?.name ?? m.treasuryId
    byId.set(m.transferId, row)
  })
  const rows = [...byId.values()]
    .filter((r) => inRange(r.date, from, to) && (!status || r.status === status))
    .map((r) => ({ ...r, riderName: r.riderId ? riderById(r.riderId)?.name ?? null : null }))
    .sort((a, b) => (a.date < b.date ? 1 : -1))
  return mockDelay(rows)
}

/** Balances overview: totals by kind + per treasury. */
export function fetchBalances() {
  const list = TREASURIES.filter((t) => t.active).map(decorate)
  const sum = (kind) => list.filter((t) => t.kind === kind).reduce((s, t) => s + t.balance, 0)
  return mockDelay({
    cash: sum('cash'),
    bank: sum('bank'),
    custody: sum('rider'),
    pendingIn: list.reduce((s, t) => s + t.pendingIn, 0),
    total: list.reduce((s, t) => s + t.balance, 0),
    treasuries: list,
  })
}

/* ── Rider ↔ treasury settings ───────────────────────────── */
export function fetchRiderTreasuryMap() {
  return mockDelay(
    RIDERS.map((r) => {
      const t = treasuryOfRider(r.id)
      return { riderId: r.id, name: r.name, city: r.city, cityName: CITIES[r.city]?.ar ?? r.city, active: r.active, treasuryId: t?.id ?? '', treasuryName: t?.name ?? '—', linked: !!RIDER_TREASURY[r.id] }
    }),
  )
}
export function setRiderTreasury(riderId, treasuryId) {
  if (!riderById(riderId) || !treasuryById(treasuryId)) return Promise.reject(new Error('NOT_FOUND'))
  RIDER_TREASURY[riderId] = treasuryId
  logAudit({ action: 'update', entity: 'treasury', detail: `ربط ${riderId} بخزنة ${treasuryById(treasuryId).name}` })
  return mockDelay({ riderId, treasuryId })
}
