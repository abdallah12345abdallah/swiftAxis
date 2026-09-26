import { mockDelay } from '@/services/http'
import {
  RIDER_FORMULAS, FORMULA_HISTORY,
  COMMISSION_RUNS, CONTRACT_COST_CENTER, RIDERS, CONTRACT_LIST,
} from './fixtures'
import { postEntry } from './ledger'
import { logAudit } from './audit'

/* Flexible commission engine (EP-03). The commission is the rider's: every
   rider has their own formula; a rider without one uses the default. */

const DEFAULT_FORMULA = { target: 480, base: 2000, tiers: [{ upTo: null, perOrder: 5 }] }

/** The formula a rider is paid by (their own → default). */
export function formulaFor(rider) {
  return RIDER_FORMULAS[rider.id] || DEFAULT_FORMULA
}

/** Tiers of a formula, tolerating the legacy single-rate `{ perOrder }` shape. */
export function tiersOf(formula) {
  if (Array.isArray(formula.tiers) && formula.tiers.length) return formula.tiers
  return [{ upTo: null, perOrder: Number(formula.perOrder) || 0 }]
}

/** Compute a commission breakdown. Pure — reused by the orders live preview.
    Tiers bracket the absolute order count above target; upTo:null = unbounded. */
export function computeCommission(orders, formula) {
  const f = formula || DEFAULT_FORMULA
  const tiers = tiersOf(f)
  const extra = Math.max(0, orders - f.target)
  const tierBreakdown = []
  let remaining = extra
  let floor = f.target
  let extraAmount = 0
  for (const tier of tiers) {
    if (remaining <= 0) break
    const cap = tier.upTo == null ? Infinity : Math.max(0, tier.upTo - floor)
    const count = Math.min(remaining, cap)
    if (count > 0) {
      const amount = count * tier.perOrder
      tierBreakdown.push({ from: floor + 1, upTo: tier.upTo, count, perOrder: tier.perOrder, amount })
      extraAmount += amount
      remaining -= count
    }
    if (tier.upTo != null) floor = Math.max(floor, tier.upTo)
  }
  return { base: f.base, target: f.target, perOrder: tiers[0].perOrder, tiers, extra, extraAmount, total: f.base + extraAmount, tierBreakdown }
}

/** One row per rider with the formula they are paid by. */
export function fetchFormulas() {
  return mockDelay(
    RIDERS.map((r) => ({
      riderId: r.id,
      name: r.name,
      active: r.active,
      contract: r.contract,
      company: CONTRACT_LIST.find((c) => c.id === r.contract)?.company ?? '—',
      formula: formulaFor(r),
      isDefault: !RIDER_FORMULAS[r.id],
    })),
  )
}

/** Update one rider's formula, keeping history (US-010). */
export function updateFormula(riderId, formula) {
  const rider = RIDERS.find((r) => r.id === riderId)
  if (!rider) return Promise.reject(new Error('NOT_FOUND'))
  const before = { ...formulaFor(rider) }
  const tiers = tiersOf(formula)
    .map((tier) => ({ upTo: tier.upTo === null || tier.upTo === '' ? null : Number(tier.upTo) || 0, perOrder: Number(tier.perOrder) || 0 }))
    .sort((a, b) => (a.upTo == null ? Infinity : a.upTo) - (b.upTo == null ? Infinity : b.upTo))
  if (tiers.length) tiers[tiers.length - 1].upTo = null
  RIDER_FORMULAS[riderId] = {
    target: Number(formula.target) || 0,
    base: Number(formula.base) || 0,
    tiers,
  }
  FORMULA_HISTORY.unshift({ riderId, at: new Date().toISOString().slice(0, 10), before, after: { ...RIDER_FORMULAS[riderId] } })
  logAudit({ action: 'update', entity: 'commissions', detail: `تعديل معادلة عمولة ${rider.name} (${riderId})` })
  return mockDelay(RIDER_FORMULAS[riderId])
}

export function fetchFormulaHistory() {
  return mockDelay(FORMULA_HISTORY)
}

const isLocked = (month) => COMMISSION_RUNS.some((r) => r.month === month)

/** Monthly per-rider commission detail (US-011). */
export function fetchMonthlyReview(month) {
  const rows = RIDERS.filter((r) => r.active).map((r) => {
    const b = computeCommission(r.orders, formulaFor(r))
    return { id: r.id, name: r.name, contract: r.contract, orders: r.orders, ...b }
  })
  return mockDelay({
    month,
    locked: isLocked(month),
    rows,
    total: rows.reduce((s, r) => s + r.total, 0),
  })
}

/** Approve + post the month: Dr commissions expense / Cr riders payable, then lock (US-012). */
export async function approveMonth(month) {
  if (isLocked(month)) return Promise.reject(new Error('LOCKED'))
  const byContract = {}
  RIDERS.filter((r) => r.active).forEach((r) => {
    const { total } = computeCommission(r.orders, formulaFor(r))
    byContract[r.contract] = (byContract[r.contract] || 0) + total
  })
  const lines = []
  Object.entries(byContract).forEach(([contract, amount]) => {
    const cc = CONTRACT_COST_CENTER[contract] || null
    lines.push({ account: 'commissions_expense', costCenter: cc, debit: amount, credit: 0 })
    lines.push({ account: 'riders_payable', costCenter: cc, debit: 0, credit: amount })
  })
  const entry = await postEntry({ source: 'commissions', description: `عمولات ${month}`, lines })
  COMMISSION_RUNS.push({ month, lockedAt: new Date().toISOString().slice(0, 10), ref: entry.ref })
  logAudit({ action: 'update', entity: 'commissions', detail: `اعتماد عمولات ${month}` })
  return { month, ref: entry.ref }
}
