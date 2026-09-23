import { mockDelay } from '@/services/http'
import { WALLET_MOVEMENTS, RIDERS, RIDER_WITHDRAWALS, RIDER_DEBTS, RIDER_NOTICES, TREASURY_MOVEMENTS } from './fixtures'
import { WALLET_WARNING_THRESHOLD } from '@/lib/constants'
import { logAudit } from './audit'
import {
  treasuryOfRider, mainTreasury, treasuryById, createTransfer, settleTransfer,
  createPayment, createReceipt, recordCustodyReceipt,
} from './treasury'

/* Cash wallets, deposits approval, withdrawals & debts (EP-04 + #4b).
   rider.wallet = cash the rider currently holds (posted). A cash handover
   is a *pending deposit* until the accountant approves it; only then the
   wallet is debited and the custody → main treasury transfer is posted. */

const riderById = (id) => RIDERS.find((r) => r.id === id)
const todayISO = () => new Date().toISOString().slice(0, 10)
let seq = WALLET_MOVEMENTS.length
let wdSeq = RIDER_WITHDRAWALS.length
let dSeq = RIDER_DEBTS.length
let nSeq = RIDER_NOTICES.length

const year = () => new Date().getFullYear()
const nextNoticeRef = () => `DN-${year()}-${String(RIDER_NOTICES.filter((n) => n.ref.startsWith(`DN-${year()}`)).length + 1).padStart(4, '0')}`

const pendingOf = (riderId) => WALLET_MOVEMENTS.filter((m) => m.riderId === riderId && m.type === 'handover' && m.status === 'pending').reduce((s, m) => s + m.amount, 0)
const debtOf = (riderId) => RIDER_DEBTS.filter((d) => d.riderId === riderId).reduce((s, d) => s + d.remaining, 0)

/** Add collected cash to a rider's wallet (called from order entry). Internal — no mockDelay. */
export function creditWallet(riderId, amount, date, label) {
  const rider = riderById(riderId)
  const amt = Number(amount) || 0
  if (!rider || amt <= 0) return
  rider.wallet += amt
  seq += 1
  WALLET_MOVEMENTS.push({ id: `w${seq}`, riderId, date, type: 'deposit', status: 'posted', amount: amt, label: label || 'كاش أوردرات' })
  recordCustodyReceipt(riderId, amt, date, label || 'كاش أوردرات')
}

/** Riders with wallet balances + threshold flag (US-013/014). */
export function fetchWallets() {
  return mockDelay(
    RIDERS.map((r) => ({
      id: r.id,
      code: r.id,
      name: r.name,
      photo: r.photo,
      contract: r.contract,
      active: r.active,
      balance: r.wallet,
      pending: pendingOf(r.id),
      available: r.wallet - pendingOf(r.id),
      debt: debtOf(r.id),
      treasuryName: treasuryOfRider(r.id)?.name ?? '—',
      over: r.wallet > WALLET_WARNING_THRESHOLD,
    })),
  )
}

/** Full statement for a rider with running balance (US-015). Pending / rejected
    handovers are listed but don't move the balance. */
export function fetchStatement(riderId, { from, to, type } = {}) {
  const moves = WALLET_MOVEMENTS.filter((m) => m.riderId === riderId).sort((a, b) => (a.date < b.date ? -1 : 1))
  let running = 0
  const rows = moves.map((m) => {
    const counts = m.type === 'deposit' || m.status === 'approved'
    if (counts) running += m.type === 'deposit' ? m.amount : -m.amount
    return { ...m, balance: running }
  })
  const filtered = rows.filter((m) => {
    if (from && m.date < from) return false
    if (to && m.date > to) return false
    if (type && m.type !== type) return false
    return true
  })
  return mockDelay(filtered.reverse())
}

/* ── Cash handover → pending deposit (#4b) ───────────────── */

/** Record a cash handover. The bank / cash receipt image is mandatory. Creates
    a pending deposit plus a pending transfer custody box → main treasury. */
export async function recordHandover(riderId, { amount, date, note, receipt }) {
  const rider = riderById(riderId)
  if (!rider) return Promise.reject(new Error('NOT_FOUND'))
  const amt = Number(amount) || 0
  if (amt <= 0) return Promise.reject(new Error('INVALID_AMOUNT'))
  if (!receipt?.url) return Promise.reject(new Error('RECEIPT_REQUIRED'))
  if (amt > rider.wallet - pendingOf(riderId)) return Promise.reject(new Error('EXCEEDS_BALANCE'))
  const { transferId, ref } = await createTransfer({
    fromId: treasuryOfRider(riderId).id,
    toId: mainTreasury().id,
    date,
    amount: amt,
    description: `تسليم كاش — ${rider.name}`,
    status: 'pending',
    source: 'wallets',
    riderId,
  })
  seq += 1
  const m = {
    id: `w${seq}`, riderId, date, type: 'handover', status: 'pending', amount: amt,
    label: note || 'تسليم كاش', receipt: { name: receipt.name, url: receipt.url, isImage: receipt.isImage },
    transferId, transferRef: ref, decision: null, submittedAt: new Date().toISOString().slice(0, 16),
  }
  WALLET_MOVEMENTS.push(m)
  logAudit({ action: 'create', entity: 'wallets', detail: `تسليم كاش ${riderId} — ${amt}` })
  return mockDelay({ ...m, balance: rider.wallet, pending: pendingOf(riderId) })
}

/** Deposits awaiting (or already given) an accountant decision. */
export function fetchDeposits({ status = '' } = {}) {
  const rows = WALLET_MOVEMENTS.filter((m) => m.type === 'handover' && (!status || m.status === status))
    .map((m) => {
      const r = riderById(m.riderId)
      return { ...m, riderName: r?.name ?? m.riderId, riderCode: m.riderId, walletBalance: r?.wallet ?? 0, treasuryName: treasuryOfRider(m.riderId)?.name ?? '—' }
    })
    .sort((a, b) => (a.status === 'pending' && b.status !== 'pending' ? -1 : b.status === 'pending' && a.status !== 'pending' ? 1 : a.date < b.date ? 1 : -1))
  return mockDelay(rows)
}

/** Accountant approves / rejects a deposit with a dated note (#4b). */
export async function decideDeposit(id, { approve, note = '', by = '' }) {
  const m = WALLET_MOVEMENTS.find((x) => x.id === id && x.type === 'handover')
  if (!m) return Promise.reject(new Error('NOT_FOUND'))
  if (m.status !== 'pending') return Promise.reject(new Error('ALREADY_DECIDED'))
  const rider = riderById(m.riderId)
  m.status = approve ? 'approved' : 'rejected'
  m.decision = { approved: !!approve, by, at: new Date().toISOString().slice(0, 16), note }
  if (approve) rider.wallet -= m.amount
  await settleTransfer(m.transferId, !!approve)
  logAudit({ action: 'update', entity: 'wallets', detail: `${approve ? 'اعتماد' : 'رفض'} إيداع ${m.riderId} — ${m.amount}`, user: by || undefined, role: 'accountant' })
  return mockDelay({ ...m, balance: rider.wallet })
}

/* ── Withdrawals from rider balance (#4b) ────────────────── */

/** Withdrawal from a rider's balance → payment voucher is created automatically. */
export async function createWithdrawal(riderId, { amount, date, reason = '', treasuryId, by = '' }) {
  const rider = riderById(riderId)
  if (!rider) return Promise.reject(new Error('NOT_FOUND'))
  const amt = Number(amount) || 0
  if (amt <= 0) return Promise.reject(new Error('INVALID_AMOUNT'))
  const t = treasuryById(treasuryId) ?? mainTreasury()
  const voucher = await createPayment({
    treasuryId: t.id, date: date || todayISO(), amount: amt, party: rider.name,
    description: `سحب من الرصيد — ${reason || rider.name}`, account: 'riders_payable', riderId, source: 'withdrawal',
  })
  wdSeq += 1
  const wd = { id: `wd${wdSeq}`, riderId, date: date || todayISO(), amount: amt, reason, treasuryId: t.id, voucherRef: voucher.ref, by }
  RIDER_WITHDRAWALS.push(wd)
  nSeq += 1
  RIDER_NOTICES.push({ id: `n${nSeq}`, ref: nextNoticeRef(), riderId, type: 'debit', date: wd.date, amount: amt, note: `سحب من الرصيد — ${reason || ''}`.trim(), source: 'withdrawal', by })
  logAudit({ action: 'create', entity: 'wallets', detail: `سحب ${amt} — ${riderId}`, user: by || undefined })
  return mockDelay({ ...wd, voucher })
}

export function fetchWithdrawals({ riderId, from, to } = {}) {
  const rows = RIDER_WITHDRAWALS.filter((w) => (!riderId || w.riderId === riderId) && (!from || w.date >= from) && (!to || w.date <= to))
    .map((w) => ({ ...w, riderName: riderById(w.riderId)?.name ?? w.riderId, riderCode: w.riderId, treasuryName: treasuryById(w.treasuryId)?.name ?? '—' }))
    .sort((a, b) => (a.date < b.date ? 1 : -1))
  return mockDelay(rows)
}

/* ── Debts & notices (#4b) ───────────────────────────────── */

/** Convert un-deposited cash left in the wallet into a debt on the rider.
    Issues a debit notice and posts Dr rider receivables / Cr rider custody. */
export async function convertToDebt(riderId, { amount, date, note = '', by = '' }) {
  const rider = riderById(riderId)
  if (!rider) return Promise.reject(new Error('NOT_FOUND'))
  const amt = Number(amount) || 0
  if (amt <= 0) return Promise.reject(new Error('INVALID_AMOUNT'))
  if (amt > rider.wallet - pendingOf(riderId)) return Promise.reject(new Error('EXCEEDS_BALANCE'))
  const d = date || todayISO()
  rider.wallet -= amt
  seq += 1
  WALLET_MOVEMENTS.push({ id: `w${seq}`, riderId, date: d, type: 'handover', status: 'approved', amount: amt, label: `تحويل إلى مديونية — ${note || ''}`.trim(), receipt: null, decision: { approved: true, by, at: new Date().toISOString().slice(0, 16), note }, converted: true })
  // custody box gives the cash up; the rider now owes it
  await createPayment({ treasuryId: treasuryOfRider(riderId).id, date: d, amount: amt, party: rider.name, description: `تحويل المتبقي إلى مديونية — ${rider.name}`, account: 'rider_receivables', riderId, source: 'debt' })
  const ref = nextNoticeRef()
  dSeq += 1
  const debt = { id: `d${dSeq}`, riderId, date: d, amount: amt, remaining: amt, note, noticeRef: ref, by }
  RIDER_DEBTS.push(debt)
  nSeq += 1
  RIDER_NOTICES.push({ id: `n${nSeq}`, ref, riderId, type: 'debit', date: d, amount: amt, note: note || 'تحويل المتبقي من الإيداع إلى مديونية', source: 'debt', by })
  logAudit({ action: 'create', entity: 'wallets', detail: `مديونية ${amt} — ${riderId}`, user: by || undefined, role: 'accountant' })
  return mockDelay({ debt, balance: rider.wallet })
}

/** Manual debit / credit notice. A debit adds to the rider's debt; a credit
    settles the oldest open debts first. */
export async function createNotice(riderId, { type = 'debit', amount, date, note = '', by = '', treasuryId = null }) {
  const rider = riderById(riderId)
  if (!rider) return Promise.reject(new Error('NOT_FOUND'))
  const amt = Number(amount) || 0
  if (amt <= 0) return Promise.reject(new Error('INVALID_AMOUNT'))
  const d = date || todayISO()
  const ref = nextNoticeRef()
  if (type === 'debit') {
    dSeq += 1
    RIDER_DEBTS.push({ id: `d${dSeq}`, riderId, date: d, amount: amt, remaining: amt, note, noticeRef: ref, by })
  } else {
    let left = amt
    RIDER_DEBTS.filter((x) => x.riderId === riderId && x.remaining > 0).sort((a, b) => (a.date < b.date ? -1 : 1)).forEach((x) => {
      const take = Math.min(left, x.remaining)
      x.remaining -= take
      left -= take
    })
    if (treasuryId) {
      // the rider paid the debt back in cash → receipt into the treasury
      await createReceipt({ treasuryId, date: d, amount: amt, party: rider.name, description: `سداد مديونية — ${rider.name}`, account: 'rider_receivables', riderId, source: 'debt' })
    }
  }
  nSeq += 1
  const n = { id: `n${nSeq}`, ref, riderId, type, date: d, amount: amt, note, source: 'manual', by }
  RIDER_NOTICES.push(n)
  logAudit({ action: 'create', entity: 'wallets', detail: `إشعار ${type === 'debit' ? 'خصم' : 'إضافة'} ${amt} — ${riderId}`, user: by || undefined })
  return mockDelay(n)
}

/** Debts overview: one row per rider. */
export function fetchDebtsOverview() {
  return mockDelay(
    RIDERS.map((r) => {
      const notices = RIDER_NOTICES.filter((n) => n.riderId === r.id)
      return {
        id: r.id, code: r.id, name: r.name, photo: r.photo, active: r.active,
        wallet: r.wallet, pending: pendingOf(r.id), debt: debtOf(r.id),
        debts: RIDER_DEBTS.filter((d) => d.riderId === r.id).length,
        notices: notices.length,
        lastNotice: notices.sort((a, b) => (a.date < b.date ? 1 : -1))[0] ?? null,
        withdrawals: RIDER_WITHDRAWALS.filter((w) => w.riderId === r.id).reduce((s, w) => s + w.amount, 0),
      }
    }),
  )
}

/** Everything about one rider's money: debts, notices, withdrawals, deposits
    and their custody-box movements (#4b "زر يفتح تفاصيل المديونيات"). */
export function fetchRiderDebts(riderId) {
  const rider = riderById(riderId)
  if (!rider) return Promise.reject(new Error('NOT_FOUND'))
  const byDateDesc = (a, b) => (a.date < b.date ? 1 : -1)
  const treasury = treasuryOfRider(riderId)
  return mockDelay({
    rider: { ...rider, code: rider.id, pending: pendingOf(riderId), debt: debtOf(riderId), treasuryName: treasury?.name ?? '—' },
    debts: RIDER_DEBTS.filter((d) => d.riderId === riderId).sort(byDateDesc),
    notices: RIDER_NOTICES.filter((n) => n.riderId === riderId).sort(byDateDesc),
    withdrawals: RIDER_WITHDRAWALS.filter((w) => w.riderId === riderId).map((w) => ({ ...w, treasuryName: treasuryById(w.treasuryId)?.name ?? '—' })).sort(byDateDesc),
    deposits: WALLET_MOVEMENTS.filter((m) => m.riderId === riderId && m.type === 'handover').sort(byDateDesc),
    treasuryMovements: TREASURY_MOVEMENTS.filter((m) => m.riderId === riderId)
      .map((m) => ({ ...m, treasuryName: treasuryById(m.treasuryId)?.name ?? m.treasuryId }))
      .sort(byDateDesc),
  })
}
