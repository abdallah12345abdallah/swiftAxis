import { mockDelay } from '@/services/http'
import { CHART_OF_ACCOUNTS, COST_CENTERS, JOURNAL, DOCUMENT_TYPES, FISCAL_YEARS } from './fixtures'
import { logAudit } from './audit'

/* Fully-simulated double-entry ledger (EP-07). Other epics post auto entries
   here via postEntry(); everything must balance. The general journal screen
   uses saveJournalEntry() which adds the document-type / fiscal-year rules.
   Swap for Spring later. */

export const accountById = (id) => CHART_OF_ACCOUNTS.find((a) => a.id === id)
export const costCenterById = (id) => COST_CENTERS.find((c) => c.id === id)
export const documentTypeById = (id) => DOCUMENT_TYPES.find((d) => d.id === id)
export const fiscalYearById = (id) => FISCAL_YEARS.find((y) => y.id === id)
/** The fiscal year a date falls in (or the default one). */
export const fiscalYearFor = (date) => FISCAL_YEARS.find((y) => date >= y.dateFrom && date <= y.dateTo) ?? FISCAL_YEARS.find((y) => y.isDefault) ?? FISCAL_YEARS[FISCAL_YEARS.length - 1]

let jSeq = JOURNAL.length
let serialSeq = JOURNAL.reduce((m, e) => Math.max(m, e.serial || 0), 0)

/** Next sequential document number for a prefix, e.g. JV-2026-0005. */
export function nextRef(prefix = 'JV') {
  const year = new Date().getFullYear()
  const n = JOURNAL.filter((e) => e.ref?.startsWith(`${prefix}-${year}`)).length + 1
  return `${prefix}-${year}-${String(n).padStart(4, '0')}`
}

const sum = (lines, k) => lines.reduce((s, l) => s + (Number(l[k]) || 0), 0)
const cleanLines = (lines) =>
  lines
    .filter((l) => l.account && (Number(l.debit) || Number(l.credit)))
    .map((l, i) => ({
      serial: i + 1,
      account: l.account,
      costCenter: l.costCenter || null,
      debit: Number(l.debit) || 0,
      credit: Number(l.credit) || 0,
      description: l.description || '',
    }))
const isBalanced = (lines) => {
  const d = sum(lines, 'debit')
  return d > 0 && Math.round((d - sum(lines, 'credit')) * 100) === 0
}

/**
 * Post a journal entry (used by every module). Validates it balances
 * (Σdebit === Σcredit, > 0). Rejects with 'UNBALANCED' | 'EMPTY'.
 */
export function postEntry({ date, source = 'manual', description = '', lines = [], ref, docType = 'jv', fiscalYear, createdBy = '' }) {
  const clean = cleanLines(lines)
  if (clean.length < 2) return Promise.reject(new Error('EMPTY'))
  if (!isBalanced(clean)) return Promise.reject(new Error('UNBALANCED'))
  const d = date || new Date().toISOString().slice(0, 10)
  jSeq += 1
  serialSeq += 1
  const type = documentTypeById(docType) ?? DOCUMENT_TYPES[0]
  const entry = {
    id: `j${jSeq}`,
    serial: serialSeq,
    ref: ref || nextRef(type.prefix),
    docType: type.id,
    fiscalYear: fiscalYear || fiscalYearFor(d).id,
    date: d,
    source,
    description,
    createdBy,
    lines: clean,
  }
  JOURNAL.push(entry)
  logAudit({ action: 'create', entity: 'ledger', detail: `قيد ${entry.ref}` })
  return mockDelay(entry)
}

/* ── General journal screen ─────────────────────────────── */

export function fetchDocumentTypes() {
  return mockDelay(DOCUMENT_TYPES.map((d) => ({ ...d })))
}
export function fetchFiscalYears() {
  return mockDelay(FISCAL_YEARS.map((y) => ({ ...y })))
}

function decorateEntry(e) {
  return {
    ...e,
    total: sum(e.lines, 'debit'),
    docTypeName: documentTypeById(e.docType)?.name ?? e.docType,
    fiscalYearName: fiscalYearById(e.fiscalYear)?.name ?? e.fiscalYear,
    editable: e.source === 'manual' && !fiscalYearById(e.fiscalYear)?.closed,
    lines: e.lines.map((l, i) => ({
      ...l,
      serial: l.serial ?? i + 1,
      accountNumber: accountById(l.account)?.code ?? '',
      accountName: accountById(l.account)?.name ?? l.account,
      costCenterCode: costCenterById(l.costCenter)?.code ?? '',
      costCenterName: costCenterById(l.costCenter)?.name ?? '',
    })),
  }
}

export function fetchJournalEntry(id) {
  const e = JOURNAL.find((x) => x.id === id)
  return e ? mockDelay(decorateEntry(e)) : Promise.reject(new Error('NOT_FOUND'))
}

/** Validation shared by save/duplicate. Returns an error code or null. */
export function validateJournalEntry({ date, docType, fiscalYear, lines }) {
  if (!fiscalYear || !fiscalYearById(fiscalYear)) return 'FISCAL_YEAR_REQUIRED'
  if (!docType || !documentTypeById(docType)) return 'DOC_TYPE_REQUIRED'
  const fy = fiscalYearById(fiscalYear)
  if (fy.closed) return 'YEAR_CLOSED'
  if (!date || date < fy.dateFrom || date > fy.dateTo) return 'DATE_OUT_OF_YEAR'
  const clean = cleanLines(lines || [])
  if (!clean.length) return 'EMPTY'
  if (clean.some((l) => l.debit < 0 || l.credit < 0)) return 'NEGATIVE'
  if (clean.some((l) => l.debit && l.credit)) return 'BOTH_SIDES'
  if (!isBalanced(clean)) return 'UNBALANCED'
  return null
}

/**
 * Save (create or update) a general journal entry from the screen.
 * payload: { id?, date, description, docType, fiscalYear, lines[], createdBy }
 */
export async function saveJournalEntry(payload) {
  const err = validateJournalEntry(payload)
  if (err) return Promise.reject(new Error(err))
  if (payload.id) {
    const e = JOURNAL.find((x) => x.id === payload.id)
    if (!e) return Promise.reject(new Error('NOT_FOUND'))
    if (!decorateEntry(e).editable) return Promise.reject(new Error('NOT_EDITABLE'))
    const typeChanged = e.docType !== payload.docType
    Object.assign(e, {
      date: payload.date,
      description: payload.description || '',
      docType: payload.docType,
      ref: typeChanged ? nextRef(documentTypeById(payload.docType).prefix) : e.ref,
      fiscalYear: payload.fiscalYear,
      lines: cleanLines(payload.lines),
      modifiedAt: new Date().toISOString().slice(0, 16),
      modifiedBy: payload.createdBy || '',
    })
    logAudit({ action: 'update', entity: 'ledger', detail: `تعديل قيد ${e.ref}` })
    return mockDelay(decorateEntry(e))
  }
  const entry = await postEntry({ ...payload, source: 'manual' })
  return decorateEntry(entry)
}

/** "إظهار": find an entry by serial and/or document number within a fiscal year. */
export function findJournalEntry({ serial, docNo, fiscalYear }) {
  if (!fiscalYear) return Promise.reject(new Error('FISCAL_YEAR_REQUIRED'))
  const s = Number(serial) || null
  const d = String(docNo || '').trim().toLowerCase()
  if (!s && !d) return Promise.reject(new Error('CRITERIA_REQUIRED'))
  const e = JOURNAL.find((x) => x.fiscalYear === fiscalYear && (!s || x.serial === s) && (!d || x.ref.toLowerCase() === d))
  return e ? mockDelay(decorateEntry(e)) : Promise.reject(new Error('NOT_FOUND'))
}

/** "تكرار": copy an entry (id/serial cleared) as a new saved document. */
export async function duplicateJournalEntry(id, { createdBy = '' } = {}) {
  const e = JOURNAL.find((x) => x.id === id)
  if (!e) return Promise.reject(new Error('NOT_FOUND'))
  return saveJournalEntry({ date: e.date, description: e.description, docType: e.docType, fiscalYear: e.fiscalYear, lines: e.lines.map((l) => ({ ...l })), createdBy })
}

/* ── Queries ─────────────────────────────────────────────── */
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
    .map(decorateEntry)
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : (b.serial || 0) - (a.serial || 0)))
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
    return { id: c.id, code: c.code, name: c.name, budget: c.budget, actual, variance: c.budget - actual, over: c.budget > 0 && actual > c.budget }
  })
  return mockDelay(rows)
}

export function fetchCostCenters() {
  return mockDelay(COST_CENTERS.map((c) => ({ ...c })))
}
export function createCostCenter(payload) {
  const n = COST_CENTERS.length + 1
  const c = { id: `cc-${n}`, code: payload.code?.trim() || `CC-${String(n).padStart(3, '0')}`, name: payload.name, budget: Number(payload.budget) || 0, active: true }
  COST_CENTERS.push(c)
  logAudit({ action: 'create', entity: 'costCenter', detail: c.name })
  return mockDelay(c)
}
export function updateCostCenter(id, payload) {
  const c = costCenterById(id)
  if (!c) return Promise.reject(new Error('NOT_FOUND'))
  Object.assign(c, { name: payload.name, code: payload.code?.trim() || c.code, budget: Number(payload.budget) || 0, active: payload.active ?? c.active })
  logAudit({ action: 'update', entity: 'costCenter', detail: c.name })
  return mockDelay(c)
}
