import { mockDelay } from '@/services/http'
import { WALLET_MOVEMENTS, RIDERS } from './fixtures'
import { WALLET_WARNING_THRESHOLD } from '@/lib/constants'
import { postEntry } from './ledger'
import { logAudit } from './audit'

/* Cash wallets (EP-04). rider.wallet is the live balance; movements are history. */

const riderById = (id) => RIDERS.find((r) => r.id === id)
let seq = WALLET_MOVEMENTS.length

/** Add collected cash to a rider's wallet (called from order entry). Internal — no mockDelay. */
export function creditWallet(riderId, amount, date, label) {
  const rider = riderById(riderId)
  if (!rider) return
  rider.wallet += Number(amount) || 0
  seq += 1
  WALLET_MOVEMENTS.push({ id: `w${seq}`, riderId, date, type: 'deposit', amount: Number(amount) || 0, label: label || 'كاش أوردرات' })
}

/** Riders with wallet balances + threshold flag (US-013/014). */
export function fetchWallets() {
  return mockDelay(
    RIDERS.map((r) => ({
      id: r.id,
      name: r.name,
      contract: r.contract,
      active: r.active,
      balance: r.wallet,
      over: r.wallet > WALLET_WARNING_THRESHOLD,
    })),
  )
}

/** Full statement for a rider with running balance (US-015). */
export function fetchStatement(riderId, { from, to, type } = {}) {
  const moves = WALLET_MOVEMENTS.filter((m) => m.riderId === riderId).sort((a, b) => (a.date < b.date ? -1 : 1))
  let running = 0
  const rows = moves.map((m) => {
    running += m.type === 'deposit' ? m.amount : -m.amount
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

/** Record a cash handover: debit wallet, post Dr Cash / Cr Rider cash on hand (US-013). */
export async function recordHandover(riderId, { amount, date, note }) {
  const rider = riderById(riderId)
  if (!rider) return Promise.reject(new Error('NOT_FOUND'))
  const amt = Number(amount) || 0
  if (amt <= 0) return Promise.reject(new Error('INVALID_AMOUNT'))
  rider.wallet -= amt
  seq += 1
  WALLET_MOVEMENTS.push({ id: `w${seq}`, riderId, date, type: 'handover', amount: amt, label: note || 'تسليم كاش' })
  await postEntry({
    source: 'wallets',
    date,
    description: `تسليم كاش — ${rider.name}`,
    lines: [
      { account: 'cash', costCenter: null, debit: amt, credit: 0 },
      { account: 'rider_wallets', costCenter: null, debit: 0, credit: amt },
    ],
  })
  logAudit({ action: 'update', entity: 'wallets', detail: `تسليم كاش ${riderId}` })
  return mockDelay({ balance: rider.wallet })
}
