import { mockDelay } from '@/services/http'
import { TREASURIES, TREASURY_MOVEMENTS, RIDER_TREASURY, RIDERS, EXPENSE_ITEMS, CITIES, SUPPLIERS, CONTRACT_LIST, CONTRACT_COST_CENTER } from './fixtures'
import { ROLES } from '@/lib/constants'
import { postEntry } from './ledger'
import { logAudit } from './audit'

/* Treasuries & banks (#4). Every treasury maps to a GL account, so receipt /
   payment vouchers and transfers post balanced entries through the ledger.
   Transfers born from a rider cash handover stay `pending` until the
   accountant approves the deposit (wallets.decideDeposit). */

export const treasuryById = (id) => TREASURIES.find((t) => t.id === id)
export const mainTreasury = () => TREASURIES.find((t) => t.isMain) ?? TREASURIES[0]
/* Box permissions. Auth is mocked per role, so each box lists the roles
   (`userRoles`) allowed to work on it; the manager always has every box.
   A box without the field predates permissions and stays open to all. */
export const canUseTreasury = (t, role) => !!t && (role === ROLES.MANAGER || !Array.isArray(t.userRoles) || t.userRoles.includes(role))
const cleanRoles = (roles) => (Array.isArray(roles) ? [...new Set(roles.filter((r) => r !== ROLES.MANAGER && Object.values(ROLES).includes(r)))] : [])

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
    userRoles: cleanRoles(payload.userRoles),
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
    userRoles: payload.userRoles !== undefined ? cleanRoles(payload.userRoles) : t.userRoles,
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

/** Payment voucher (سند صرف): money out. Dr expense / counter account, Cr treasury.
    With an expense item the account comes from the item, so the warehouse can
    charge any cost center (#6). Paying a supplier debits its payable and may
    carry the supplier's purchase invoice number; paying a customer debits
    its receivable. */
export async function createPayment({ treasuryId, date, amount, party = '', description = '', account = null, expenseItem = null, costCenter = null, riderId = null, source = 'treasury', partyType = null, partyId = null, invoiceNo = '' }) {
  const t = treasuryById(treasuryId)
  if (!t) return Promise.reject(new Error('NOT_FOUND'))
  const amt = Number(amount) || 0
  if (amt <= 0) return Promise.reject(new Error('INVALID_AMOUNT'))
  const item = expenseItem ? EXPENSE_ITEMS.find((i) => i.id === expenseItem) : null
  const p = resolveParty({ partyType, partyId, party, account: account || item?.account || 'general_expense', costCenter })
  if (p.error) return Promise.reject(new Error(p.error))
  const acc = p.account
  ;({ party, costCenter } = p)
  const ref = nextVoucherRef('PV')
  const row = pushMovement({
    ref, type: 'payment', treasuryId, date, amount: amt, party, partyType: p.partyType, partyId: p.partyId, invoiceNo: String(invoiceNo || '').trim(),
    description, account: acc, expenseItem: p.partyType === 'account' || !p.partyType ? item?.id ?? null : null, costCenter, riderId, source,
  })
  if (acc !== t.account) {
    await postEntry({
      source,
      date,
      description: `سند صرف ${ref} — ${description || party}${row.invoiceNo ? ` (فاتورة ${row.invoiceNo})` : ''}`,
      lines: [
        { account: acc, costCenter, debit: amt, credit: 0 },
        { account: t.account, costCenter, debit: 0, credit: amt },
      ],
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
