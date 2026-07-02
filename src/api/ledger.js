import { mockDelay } from '@/services/http'
import { CHART_OF_ACCOUNTS, COST_CENTERS, JOURNAL } from './fixtures'
import { logAudit } from './audit'

/* Fully-simulated double-entry ledger (EP-07). Other epics post auto entries
   here via postEntry(); everything must balance. Swap for Spring later. */

export const accountById = (id) => CHART_OF_ACCOUNTS.find((a) => a.id === id)
export const costCenterById = (id) => COST_CENTERS.find((c) => c.id === id)

let jSeq = JOURNAL.length

/** Next sequential reference, e.g. JV-2026-0004. */
export function nextRef(prefix = 'JV') {
  const year = new Date().getFullYear()
  const n = JOURNAL.filter((e) => e.ref?.startsWith(`${prefix}-${year}`)).length + 1
  return `${prefix}-${year}-${String(n).padStart(4, '0')}`
}

const sum = (lines, k) => lines.reduce((s, l) => s + (Number(l[k]) || 0), 0)

/**
 * Post a journal entry. Validates it balances (Σdebit === Σcredit, > 0).
 * @returns the created entry, or rejects with 'UNBALANCED' | 'EMPTY'.
 */
export function postEntry({ date, source = 'manual', description = '', lines = [], ref }) {
  const clean = lines.filter((l) => l.account && (Number(l.debit) || Number(l.credit)))
  if (clean.length < 2) return Promise.reject(new Error('EMPTY'))
  const totalDebit = sum(clean, 'debit')
  const totalCredit = sum(clean, 'credit')
  if (totalDebit <= 0 || Math.round((totalDebit - totalCredit) * 100) !== 0) {
    return Promise.reject(new Error('UNBALANCED'))
  }
  jSeq += 1
  const entry = {
    id: `j${jSeq}`,
    ref: ref || nextRef(),
    date: date || new Date().toISOString().slice(0, 10),
    source,
    description,
    lines: clean.map((l) => ({
      account: l.account,
      costCenter: l.costCenter || null,
      debit: Number(l.debit) || 0,
      credit: Number(l.credit) || 0,
    })),
  }
  JOURNAL.push(entry)
  logAudit({ action: 'create', entity: 'ledger', detail: `قيد ${entry.ref}` })
  return mockDelay(entry)
}

const inRange = (date, from, to) => (!from || date >= from) && (!to || date <= to)

function filteredEntries({ from, to, costCenter, source } = {}) {
  return JOURNAL.filter((e) => {
    if (!inRange(e.date, from, to)) return false
    if (source && e.source !== source) return false
    if (costCenter && !e.lines.some((l) => l.costCenter === costCenter)) return false
    return true
  })
}

/** Journal entries (newest first) decorated with totals. */
export function fetchJournal(filters = {}) {
  const rows = filteredEntries(filters)
    .map((e) => ({ ...e, total: sum(e.lines, 'debit') }))
    .sort((a, b) => (a.date < b.date ? 1 : -1))
  return mockDelay(rows)
}

export function fetchAccounts() {
  return mockDelay(CHART_OF_ACCOUNTS)
}

/** Trial balance: per-account debit/credit totals + net balance. */
export function trialBalance(filters = {}) {
  const entries = filteredEntries(filters)
  const rows = CHART_OF_ACCOUNTS.map((a) => {
    let debit = 0
    let credit = 0
    entries.forEach((e) =>
      e.lines.forEach((l) => {
        if (l.account !== a.id) return
        if (filters.costCenter && l.costCenter !== filters.costCenter) return
        debit += l.debit
        credit += l.credit
      }),
    )
    return { id: a.id, code: a.code, name: a.name, en: a.en, type: a.type, debit, credit, balance: debit - credit }
  }).filter((r) => r.debit || r.credit)
  return mockDelay({
    rows,
    totalDebit: rows.reduce((s, r) => s + r.debit, 0),
    totalCredit: rows.reduce((s, r) => s + r.credit, 0),
  })
}

/** Profit & loss: revenue vs expenses. */
export function profitAndLoss(filters = {}) {
  const entries = filteredEntries(filters)
  const acc = (type) =>
    CHART_OF_ACCOUNTS.filter((a) => a.type === type).map((a) => {
      let amount = 0
      entries.forEach((e) =>
        e.lines.forEach((l) => {
          if (l.account !== a.id) return
          if (filters.costCenter && l.costCenter !== filters.costCenter) return
          amount += type === 'revenue' ? l.credit - l.debit : l.debit - l.credit
        }),
      )
      return { id: a.id, name: a.name, en: a.en, amount }
    }).filter((r) => r.amount)
  const revenue = acc('revenue')
  const expenses = acc('expense')
  const totalRevenue = revenue.reduce((s, r) => s + r.amount, 0)
  const totalExpense = expenses.reduce((s, r) => s + r.amount, 0)
  return mockDelay({ revenue, expenses, totalRevenue, totalExpense, net: totalRevenue - totalExpense })
}

/** Per-cost-center actual expense vs budget. */
export function costCenterReport(filters = {}) {
  const entries = filteredEntries({ from: filters.from, to: filters.to })
  const rows = COST_CENTERS.map((c) => {
    let actual = 0
    entries.forEach((e) =>
      e.lines.forEach((l) => {
        if (l.costCenter !== c.id) return
        const a = accountById(l.account)
        if (a?.type === 'expense') actual += l.debit - l.credit
      }),
    )
    return { id: c.id, name: c.name, budget: c.budget, actual, variance: c.budget - actual, over: actual > c.budget }
  })
  return mockDelay(rows)
}

export function fetchCostCenters() {
  return mockDelay(COST_CENTERS.map((c) => ({ ...c })))
}
export function createCostCenter(payload) {
  const c = { id: `cc-${COST_CENTERS.length + 1}`, name: payload.name, budget: Number(payload.budget) || 0, active: true }
  COST_CENTERS.push(c)
  logAudit({ action: 'create', entity: 'costCenter', detail: c.name })
  return mockDelay(c)
}
export function updateCostCenter(id, payload) {
  const c = costCenterById(id)
  if (!c) return Promise.reject(new Error('NOT_FOUND'))
  Object.assign(c, { name: payload.name, budget: Number(payload.budget) || 0, active: payload.active ?? c.active })
  logAudit({ action: 'update', entity: 'costCenter', detail: c.name })
  return mockDelay(c)
}
