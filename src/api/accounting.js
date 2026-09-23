import { mockDelay } from '@/services/http'
import {
  CHART_OF_ACCOUNTS, COST_CENTERS, JOURNAL, FISCAL_YEARS, DOCUMENT_TYPES, ACCOUNTING_SETTINGS, CURRENCIES,
  CLOSED_MONTHS, ADMIN_UNITS, STATEMENT_ITEMS, FINANCIAL_RATIOS,
} from './fixtures'
import { postEntry, accountById, costCenterById, fiscalYearById, documentTypeById } from './ledger'
import { logAudit } from './audit'

/* General accounts module (EP-12): the settings / master-data screens and the
   reports of the partner's accounting menu, all computed from the same journal
   the rest of the app posts into. */

const round2 = (n) => Math.round(n * 100) / 100
const inRange = (d, from, to) => (!from || d >= from) && (!to || d <= to)
const live = () => JOURNAL.filter((e) => e.status !== 'voided')
const CREDIT_NATURE = new Set(['liability', 'equity', 'revenue'])
/** Balance presented in the account's natural sign (debit − credit, or credit − debit). */
export const natural = (account, debit, credit) => (CREDIT_NATURE.has(account?.type) ? credit - debit : debit - credit)
export const natureOf = (account) => (CREDIT_NATURE.has(account?.type) ? 'credit' : 'debit')

/* ── settings ────────────────────────────────────────────── */
export function fetchAccountingSettings() {
  return mockDelay({ ...ACCOUNTING_SETTINGS, numbering: { ...ACCOUNTING_SETTINGS.numbering } })
}
export function saveAccountingSettings(patch) {
  Object.assign(ACCOUNTING_SETTINGS, patch, { numbering: { ...ACCOUNTING_SETTINGS.numbering, ...(patch.numbering || {}) } })
  // document prefixes drive the numbering of new documents
  DOCUMENT_TYPES.forEach((d) => {
    if (ACCOUNTING_SETTINGS.numbering[d.id]) d.prefix = ACCOUNTING_SETTINGS.numbering[d.id]
  })
  logAudit({ action: 'update', entity: 'accounting', detail: 'إعدادات نظام الحسابات' })
  return mockDelay({ ...ACCOUNTING_SETTINGS })
}

/* ── currencies ──────────────────────────────────────────── */
export function fetchCurrencies() {
  return mockDelay(CURRENCIES.map((c) => ({ ...c })))
}
export function createCurrency(payload) {
  const code = String(payload.code || '').trim().toUpperCase()
  if (!/^[A-Z]{3}$/.test(code)) return Promise.reject(new Error('CODE_INVALID'))
  if (CURRENCIES.some((c) => c.code === code)) return Promise.reject(new Error('DUPLICATE'))
  const c = { id: code, code, name: payload.name?.trim() || code, en: payload.en?.trim() || code, symbol: payload.symbol?.trim() || code, rate: Number(payload.rate) || 1, isBase: false, active: payload.active ?? true }
  CURRENCIES.push(c)
  logAudit({ action: 'create', entity: 'accounting', detail: `عملة ${code}` })
  return mockDelay(c)
}
export function updateCurrency(id, payload) {
  const c = CURRENCIES.find((x) => x.id === id)
  if (!c) return Promise.reject(new Error('NOT_FOUND'))
  if (c.isBase && payload.active === false) return Promise.reject(new Error('BASE_LOCKED'))
  Object.assign(c, { name: payload.name?.trim() || c.name, en: payload.en?.trim() || c.en, symbol: payload.symbol?.trim() || c.symbol, rate: c.isBase ? 1 : Number(payload.rate) || c.rate, active: payload.active ?? c.active })
  logAudit({ action: 'update', entity: 'accounting', detail: `عملة ${c.code}` })
  return mockDelay(c)
}
export function setBaseCurrency(id) {
  const c = CURRENCIES.find((x) => x.id === id)
  if (!c) return Promise.reject(new Error('NOT_FOUND'))
  CURRENCIES.forEach((x) => (x.isBase = x.id === id))
  c.rate = 1
  c.active = true
  ACCOUNTING_SETTINGS.baseCurrency = c.code
  return mockDelay(c)
}

/* ── fiscal years & months ───────────────────────────────── */
const monthsOf = (fy) => {
  const out = []
  let [y, m] = fy.dateFrom.slice(0, 7).split('-').map(Number)
  const end = fy.dateTo.slice(0, 7)
  for (let i = 0; i < 24; i++) {
    const ym = `${y}-${String(m).padStart(2, '0')}`
    out.push(ym)
    if (ym === end) break
    m += 1
    if (m > 12) { m = 1; y += 1 }
  }
  return out
}
function decorateYear(y) {
  const entries = live().filter((e) => e.fiscalYear === y.id)
  return { ...y, months: monthsOf(y).length, closedMonths: (CLOSED_MONTHS[y.id] ?? []).length, entries: entries.length, total: entries.reduce((s, e) => s + e.lines.reduce((t, l) => t + l.debit, 0), 0) }
}
export function fetchFiscalYearsFull() {
  return mockDelay(FISCAL_YEARS.map(decorateYear))
}
export function createFiscalYear(payload) {
  const from = payload.dateFrom
  const to = payload.dateTo
  if (!from || !to || from >= to) return Promise.reject(new Error('RANGE_INVALID'))
  if (FISCAL_YEARS.some((y) => from <= y.dateTo && to >= y.dateFrom)) return Promise.reject(new Error('OVERLAP'))
  const year = Number(from.slice(0, 4))
  const y = { id: `fy${year}${FISCAL_YEARS.some((x) => x.id === `fy${year}`) ? '-' + (FISCAL_YEARS.length + 1) : ''}`, name: payload.name?.trim() || `السنة المالية ${year}`, en: payload.en?.trim() || `Fiscal year ${year}`, year, dateFrom: from, dateTo: to, isDefault: false, closed: false }
  FISCAL_YEARS.push(y)
  CLOSED_MONTHS[y.id] = []
  logAudit({ action: 'create', entity: 'accounting', detail: y.name })
  return mockDelay(decorateYear(y))
}
export function updateFiscalYear(id, payload) {
  const y = fiscalYearById(id)
  if (!y) return Promise.reject(new Error('NOT_FOUND'))
  if (y.closed) return Promise.reject(new Error('YEAR_CLOSED'))
  Object.assign(y, { name: payload.name?.trim() || y.name, en: payload.en?.trim() || y.en })
  return mockDelay(decorateYear(y))
}
export function setDefaultFiscalYear(id) {
  const y = fiscalYearById(id)
  if (!y || y.closed) return Promise.reject(new Error('NOT_FOUND'))
  FISCAL_YEARS.forEach((x) => (x.isDefault = x.id === id))
  ACCOUNTING_SETTINGS.defaultFiscalYear = id
  return mockDelay(decorateYear(y))
}

const AR_MONTHS = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
export function fetchMonths(fyId) {
  const fy = fiscalYearById(fyId)
  if (!fy) return Promise.reject(new Error('NOT_FOUND'))
  const closed = CLOSED_MONTHS[fyId] ?? []
  const list = monthsOf(fy)
  const rows = list.map((ym, i) => {
    const entries = live().filter((e) => e.fiscalYear === fyId && e.date.startsWith(ym))
    const isClosed = closed.includes(ym)
    const prevClosed = i === 0 || closed.includes(list[i - 1])
    const nextClosed = i < list.length - 1 && closed.includes(list[i + 1])
    return {
      ym,
      label: `${AR_MONTHS[Number(ym.slice(5)) - 1]} ${ym.slice(0, 4)}`,
      closed: isClosed,
      entries: entries.length,
      debit: entries.reduce((s, e) => s + e.lines.reduce((t, l) => t + l.debit, 0), 0),
      canClose: !isClosed && prevClosed && !fy.closed,
      canReopen: isClosed && !nextClosed && !fy.closed,
    }
  })
  return mockDelay({ year: decorateYear(fy), rows })
}
export function closeMonth(fyId, ym, { by = '' } = {}) {
  const fy = fiscalYearById(fyId)
  if (!fy) return Promise.reject(new Error('NOT_FOUND'))
  if (fy.closed) return Promise.reject(new Error('YEAR_CLOSED'))
  const list = monthsOf(fy)
  const i = list.indexOf(ym)
  if (i < 0) return Promise.reject(new Error('NOT_FOUND'))
  const closed = (CLOSED_MONTHS[fyId] ??= [])
  if (closed.includes(ym)) return Promise.reject(new Error('ALREADY_CLOSED'))
  if (i > 0 && !closed.includes(list[i - 1])) return Promise.reject(new Error('SEQUENCE'))
  closed.push(ym)
  logAudit({ action: 'update', entity: 'accounting', detail: `إغلاق شهر ${ym}`, user: by || undefined })
  return mockDelay({ ym, closed: true })
}
export function reopenMonth(fyId, ym, { by = '' } = {}) {
  const fy = fiscalYearById(fyId)
  if (!fy) return Promise.reject(new Error('NOT_FOUND'))
  if (fy.closed) return Promise.reject(new Error('YEAR_CLOSED'))
  const closed = CLOSED_MONTHS[fyId] ?? []
  const list = monthsOf(fy)
  const i = list.indexOf(ym)
  if (!closed.includes(ym)) return Promise.reject(new Error('NOT_CLOSED'))
  if (i < list.length - 1 && closed.includes(list[i + 1])) return Promise.reject(new Error('SEQUENCE'))
  CLOSED_MONTHS[fyId] = closed.filter((x) => x !== ym)
  logAudit({ action: 'update', entity: 'accounting', detail: `إعادة فتح شهر ${ym}`, user: by || undefined })
  return mockDelay({ ym, closed: false })
}

/* ── annual closing ──────────────────────────────────────── */
function yearCloseLines(fy) {
  const lines = []
  let net = 0
  postable().filter((a) => a.type === 'revenue' || a.type === 'expense').forEach((a) => {
    const { debit, credit } = sums(linesOf({ accounts: new Set([a.id]), from: fy.dateFrom, to: fy.dateTo }))
    const bal = natural(a, debit, credit)
    if (!bal) return
    if (a.type === 'revenue') { lines.push({ account: a.id, costCenter: null, debit: bal, credit: 0, description: 'إقفال إيرادات' }); net += bal }
    else { lines.push({ account: a.id, costCenter: null, debit: 0, credit: bal, description: 'إقفال مصروفات' }); net -= bal }
  })
  const re = ACCOUNTING_SETTINGS.retainedEarningsAccount || 'retained_earnings'
  if (net > 0) lines.push({ account: re, costCenter: null, debit: 0, credit: round2(net), description: 'صافي ربح السنة' })
  else if (net < 0) lines.push({ account: re, costCenter: null, debit: round2(-net), credit: 0, description: 'صافي خسارة السنة' })
  return { lines, net: round2(net) }
}
export function previewYearClose(fyId) {
  const fy = fiscalYearById(fyId)
  if (!fy) return Promise.reject(new Error('NOT_FOUND'))
  const months = monthsOf(fy)
  const closedMonths = CLOSED_MONTHS[fyId] ?? []
  const { lines, net } = yearCloseLines(fy)
  const revenue = lines.filter((l) => accountById(l.account)?.type === 'revenue').reduce((s, l) => s + l.debit, 0)
  const expenses = lines.filter((l) => accountById(l.account)?.type === 'expense').reduce((s, l) => s + l.credit, 0)
  return mockDelay({
    year: decorateYear(fy),
    allMonthsClosed: months.every((m) => closedMonths.includes(m)),
    openMonths: months.filter((m) => !closedMonths.includes(m)),
    revenue, expenses, net,
    lines: lines.map((l) => ({ ...l, accountName: accountById(l.account)?.name ?? l.account, accountCode: accountById(l.account)?.code ?? '' })),
    alreadyClosed: fy.closed,
    closingRef: fy.closingRef ?? null,
  })
}
export async function runYearClose(fyId, { by = '' } = {}) {
  const fy = fiscalYearById(fyId)
  if (!fy) return Promise.reject(new Error('NOT_FOUND'))
  if (fy.closed) return Promise.reject(new Error('YEAR_CLOSED'))
  const months = monthsOf(fy)
  if (!months.every((m) => (CLOSED_MONTHS[fyId] ?? []).includes(m))) return Promise.reject(new Error('MONTHS_OPEN'))
  const { lines } = yearCloseLines(fy)
  let ref = null
  if (lines.length >= 2) {
    const entry = await postEntry({ date: fy.dateTo, source: 'closing', docType: 'adj', fiscalYear: fy.id, description: `قيد الإقفال السنوي — ${fy.name}`, lines, createdBy: by })
    ref = entry.ref
  }
  Object.assign(fy, { closed: true, closingRef: ref, closedAt: new Date().toISOString().slice(0, 10), closedBy: by })
  if (fy.isDefault) {
    fy.isDefault = false
    const next = FISCAL_YEARS.find((y) => !y.closed)
    if (next) { next.isDefault = true; ACCOUNTING_SETTINGS.defaultFiscalYear = next.id }
  }
  logAudit({ action: 'update', entity: 'accounting', detail: `الإقفال السنوي ${fy.name}`, user: by || undefined })
  return mockDelay(decorateYear(fy))
}

/* ── administrative units ────────────────────────────────── */
export const unitById = (id) => ADMIN_UNITS.find((u) => u.id === id)
function decorateUnit(u) {
  return { ...u, parentName: unitById(u.parent)?.name ?? null, costCenters: COST_CENTERS.filter((c) => c.unitId === u.id).length }
}
export function fetchAdminUnits() {
  return mockDelay(ADMIN_UNITS.map(decorateUnit))
}
export function createAdminUnit(payload) {
  if (!payload.name?.trim()) return Promise.reject(new Error('NAME_REQUIRED'))
  const code = payload.code?.trim() || `U-${100 + ADMIN_UNITS.length * 10}`
  if (ADMIN_UNITS.some((u) => u.code === code)) return Promise.reject(new Error('DUPLICATE'))
  const u = { id: `u-${Date.now().toString(36)}`, code, name: payload.name.trim(), en: payload.en?.trim() || payload.name.trim(), parent: payload.parent || null, active: payload.active ?? true }
  ADMIN_UNITS.push(u)
  logAudit({ action: 'create', entity: 'accounting', detail: `وحدة إدارية ${u.name}` })
  return mockDelay(decorateUnit(u))
}
export function updateAdminUnit(id, payload) {
  const u = unitById(id)
  if (!u) return Promise.reject(new Error('NOT_FOUND'))
  if (payload.parent === id) return Promise.reject(new Error('SELF_PARENT'))
  Object.assign(u, { name: payload.name?.trim() || u.name, en: payload.en?.trim() || u.en, code: payload.code?.trim() || u.code, parent: payload.parent === undefined ? u.parent : payload.parent || null, active: payload.active ?? u.active })
  logAudit({ action: 'update', entity: 'accounting', detail: `وحدة إدارية ${u.name}` })
  return mockDelay(decorateUnit(u))
}

/* ── chart of accounts tree ──────────────────────────────── */
export const postable = () => CHART_OF_ACCOUNTS.filter((a) => !a.isGroup)
/** All leaf accounts under an account (the account itself when it is a leaf). */
export function leafIds(accountId) {
  const a = accountById(accountId)
  if (!a) return []
  if (!a.isGroup) return [a.id]
  return CHART_OF_ACCOUNTS.filter((x) => x.parent === a.id).flatMap((x) => leafIds(x.id))
}
function decorateAccount(a) {
  const leaves = new Set(leafIds(a.id))
  const { debit, credit } = sums(linesOf({ accounts: leaves }))
  return {
    ...a,
    parentName: accountById(a.parent)?.name ?? null,
    children: CHART_OF_ACCOUNTS.filter((x) => x.parent === a.id).length,
    statementItemName: STATEMENT_ITEMS.find((i) => i.id === a.statementItem)?.name ?? null,
    debit, credit,
    balance: natural(a, debit, credit),
    nature: natureOf(a),
    hasMovement: debit > 0 || credit > 0,
  }
}
/** Flat, depth-first list in tree order (parents before children). */
export function fetchAccountTree() {
  const out = []
  const walk = (parent) => {
    CHART_OF_ACCOUNTS.filter((a) => (a.parent ?? null) === parent).sort((x, y) => x.code.localeCompare(y.code)).forEach((a) => {
      out.push(decorateAccount(a))
      walk(a.id)
    })
  }
  walk(null)
  return mockDelay(out)
}
export function createAccount(payload) {
  const parent = payload.parent ? accountById(payload.parent) : null
  if (payload.parent && !parent) return Promise.reject(new Error('NOT_FOUND'))
  if (parent && !parent.isGroup) return Promise.reject(new Error('PARENT_NOT_GROUP'))
  const code = String(payload.code || '').trim()
  if (!code) return Promise.reject(new Error('CODE_REQUIRED'))
  if (CHART_OF_ACCOUNTS.some((a) => a.code === code)) return Promise.reject(new Error('DUPLICATE'))
  if (!payload.name?.trim()) return Promise.reject(new Error('NAME_REQUIRED'))
  const type = parent ? parent.type : payload.type
  if (!['asset', 'liability', 'equity', 'revenue', 'expense'].includes(type)) return Promise.reject(new Error('TYPE_REQUIRED'))
  const a = {
    id: `acc-${code}`, code, name: payload.name.trim(), en: payload.en?.trim() || payload.name.trim(), type,
    parent: parent?.id ?? null, level: parent ? parent.level + 1 : 1, isGroup: !!payload.isGroup, active: true,
    statementItem: payload.isGroup ? undefined : payload.statementItem || null,
  }
  CHART_OF_ACCOUNTS.push(a)
  logAudit({ action: 'create', entity: 'accounting', detail: `حساب ${a.code} ${a.name}` })
  return mockDelay(decorateAccount(a))
}
export function updateAccount(id, payload) {
  const a = accountById(id)
  if (!a) return Promise.reject(new Error('NOT_FOUND'))
  const code = String(payload.code ?? a.code).trim()
  if (code !== a.code && CHART_OF_ACCOUNTS.some((x) => x.code === code)) return Promise.reject(new Error('DUPLICATE'))
  if (payload.active === false && decorateAccount(a).hasMovement) return Promise.reject(new Error('HAS_MOVEMENT'))
  Object.assign(a, { code, name: payload.name?.trim() || a.name, en: payload.en?.trim() || a.en, active: payload.active ?? a.active, statementItem: a.isGroup ? undefined : payload.statementItem === undefined ? a.statementItem : payload.statementItem || null })
  logAudit({ action: 'update', entity: 'accounting', detail: `حساب ${a.code}` })
  return mockDelay(decorateAccount(a))
}

/* ── statement items ─────────────────────────────────────── */
export const itemById = (id) => STATEMENT_ITEMS.find((i) => i.id === id)
function decorateItem(i) {
  const accounts = postable().filter((a) => a.statementItem === i.id)
  return { ...i, accounts: accounts.length, accountNames: accounts.map((a) => a.name) }
}
export function fetchStatementItems() {
  return mockDelay([...STATEMENT_ITEMS].sort((a, b) => a.order - b.order).map(decorateItem))
}
export function createStatementItem(payload) {
  if (!payload.name?.trim()) return Promise.reject(new Error('NAME_REQUIRED'))
  const code = payload.code?.trim() || `${payload.statement === 'income' ? 'IS' : 'BS'}-${900 + STATEMENT_ITEMS.length}`
  if (STATEMENT_ITEMS.some((i) => i.code === code)) return Promise.reject(new Error('DUPLICATE'))
  const i = { id: `item-${Date.now().toString(36)}`, statement: payload.statement === 'income' ? 'income' : 'balance', section: payload.section || (payload.statement === 'income' ? 'other' : 'current_assets'), code, name: payload.name.trim(), en: payload.en?.trim() || payload.name.trim(), order: STATEMENT_ITEMS.length + 1 }
  STATEMENT_ITEMS.push(i)
  logAudit({ action: 'create', entity: 'accounting', detail: `بند ${i.name}` })
  return mockDelay(decorateItem(i))
}
export function updateStatementItem(id, payload) {
  const i = itemById(id)
  if (!i) return Promise.reject(new Error('NOT_FOUND'))
  Object.assign(i, { name: payload.name?.trim() || i.name, en: payload.en?.trim() || i.en, code: payload.code?.trim() || i.code, section: payload.section || i.section, order: Number(payload.order) || i.order })
  return mockDelay(decorateItem(i))
}
/** Allocation screen: every postable account with its item. */
export function fetchItemAssignments() {
  return mockDelay(postable().map((a) => ({ id: a.id, code: a.code, name: a.name, en: a.en, type: a.type, statementItem: a.statementItem ?? '', itemName: itemById(a.statementItem)?.name ?? null })))
}
export function assignStatementItem(accountId, itemId) {
  const a = accountById(accountId)
  if (!a || a.isGroup) return Promise.reject(new Error('NOT_FOUND'))
  if (itemId && !itemById(itemId)) return Promise.reject(new Error('NOT_FOUND'))
  a.statementItem = itemId || null
  logAudit({ action: 'update', entity: 'accounting', detail: `تخصيص ${a.code} → ${itemById(itemId)?.name ?? '—'}` })
  return mockDelay({ accountId, itemId: a.statementItem })
}

/* ── balances engine ─────────────────────────────────────── */
/** Flat journal lines (posted entries only) with their entry's header. */
export function linesOf({ from, to, accounts, costCenter, unit, docType, source } = {}) {
  const out = []
  live().forEach((e) => {
    if (!inRange(e.date, from, to)) return
    if (docType && e.docType !== docType) return
    if (source && e.source !== source) return
    e.lines.forEach((l, i) => {
      if (accounts && !accounts.has(l.account)) return
      if (costCenter && l.costCenter !== costCenter) return
      if (unit && costCenterById(l.costCenter)?.unitId !== unit) return
      out.push({ ...l, lineNo: i + 1, entryId: e.id, ref: e.ref, serial: e.serial, date: e.date, docType: e.docType, source: e.source, statement: e.description })
    })
  })
  return out.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : (a.serial || 0) - (b.serial || 0) || a.lineNo - b.lineNo))
}
export const sums = (lines) => ({ debit: round2(lines.reduce((s, l) => s + l.debit, 0)), credit: round2(lines.reduce((s, l) => s + l.credit, 0)) })

const dayBefore = (d) => {
  const x = new Date(d)
  x.setDate(x.getDate() - 1)
  return x.toISOString().slice(0, 10)
}

/** Account statement (leaf or group) with running balance in the natural sign. */
export function accountStatement(accountId, { from, to, costCenter } = {}) {
  const a = accountById(accountId)
  if (!a) return Promise.reject(new Error('NOT_FOUND'))
  const leaves = new Set(leafIds(a.id))
  const opening = from ? natural(a, ...Object.values(sums(linesOf({ to: dayBefore(from), accounts: leaves, costCenter })))) : 0
  let running = opening
  const rows = linesOf({ from, to, accounts: leaves, costCenter }).map((l) => {
    running = round2(running + natural(a, l.debit, l.credit))
    return {
      ...l,
      accountCode: accountById(l.account)?.code ?? '',
      accountName: accountById(l.account)?.name ?? l.account,
      costCenterCode: costCenterById(l.costCenter)?.code ?? '',
      costCenterName: costCenterById(l.costCenter)?.name ?? '',
      unitName: unitById(costCenterById(l.costCenter)?.unitId)?.name ?? '',
      docTypeName: documentTypeById(l.docType)?.name ?? l.docType,
      balance: running,
    }
  })
  const { debit, credit } = sums(rows)
  return mockDelay({ account: decorateAccount(a), opening, rows, totalDebit: debit, totalCredit: credit, closing: running, nature: natureOf(a) })
}

/** Group ("main") account statement: one row per direct child with opening / movement / closing. */
export function mainAccountStatement(accountId, { from, to } = {}) {
  const a = accountById(accountId)
  if (!a) return Promise.reject(new Error('NOT_FOUND'))
  const children = CHART_OF_ACCOUNTS.filter((x) => x.parent === a.id).sort((x, y) => x.code.localeCompare(y.code))
  const rows = (children.length ? children : [a]).map((c) => {
    const leaves = new Set(leafIds(c.id))
    const o = sums(linesOf({ to: from ? dayBefore(from) : undefined, accounts: leaves }))
    const m = sums(linesOf({ from, to, accounts: leaves }))
    const opening = from ? natural(c, o.debit, o.credit) : 0
    return { id: c.id, code: c.code, name: c.name, en: c.en, isGroup: c.isGroup, opening, debit: m.debit, credit: m.credit, closing: round2(opening + natural(c, m.debit, m.credit)) }
  })
  return mockDelay({
    account: decorateAccount(a),
    rows,
    totals: { opening: round2(rows.reduce((s, r) => s + r.opening, 0)), debit: round2(rows.reduce((s, r) => s + r.debit, 0)), credit: round2(rows.reduce((s, r) => s + r.credit, 0)), closing: round2(rows.reduce((s, r) => s + r.closing, 0)) },
  })
}

/** Month-by-month movement of one account over a fiscal year. */
export function monthlySummary(accountId, fyId) {
  const a = accountById(accountId)
  const fy = fiscalYearById(fyId)
  if (!a || !fy) return Promise.reject(new Error('NOT_FOUND'))
  const leaves = new Set(leafIds(a.id))
  let running = natural(a, ...Object.values(sums(linesOf({ to: dayBefore(fy.dateFrom), accounts: leaves }))))
  const opening = running
  const rows = monthsOf(fy).map((ym) => {
    const m = sums(linesOf({ from: `${ym}-01`, to: `${ym}-31`, accounts: leaves }))
    const o = running
    running = round2(running + natural(a, m.debit, m.credit))
    return { ym, label: `${AR_MONTHS[Number(ym.slice(5)) - 1]} ${ym.slice(0, 4)}`, opening: o, debit: m.debit, credit: m.credit, closing: running, closed: (CLOSED_MONTHS[fyId] ?? []).includes(ym) }
  })
  return mockDelay({ account: decorateAccount(a), year: fy, opening, rows, closing: running, totalDebit: round2(rows.reduce((s, r) => s + r.debit, 0)), totalCredit: round2(rows.reduce((s, r) => s + r.credit, 0)) })
}

/** Balances per cost center (expense side actual + full debit/credit) in a range. */
export function costCenterBalances({ from, to, unit } = {}) {
  const rows = COST_CENTERS.filter((c) => !unit || c.unitId === unit).map((c) => {
    const lines = linesOf({ from, to, costCenter: c.id })
    const { debit, credit } = sums(lines)
    const expenses = round2(lines.filter((l) => accountById(l.account)?.type === 'expense').reduce((s, l) => s + l.debit - l.credit, 0))
    const revenue = round2(lines.filter((l) => accountById(l.account)?.type === 'revenue').reduce((s, l) => s + l.credit - l.debit, 0))
    return { id: c.id, code: c.code, name: c.name, unitName: unitById(c.unitId)?.name ?? '—', budget: c.budget, entries: new Set(lines.map((l) => l.entryId)).size, debit, credit, expenses, revenue, net: round2(revenue - expenses), over: c.budget > 0 && expenses > c.budget }
  })
  return mockDelay({ rows, totals: { debit: round2(rows.reduce((s, r) => s + r.debit, 0)), credit: round2(rows.reduce((s, r) => s + r.credit, 0)), expenses: round2(rows.reduce((s, r) => s + r.expenses, 0)), revenue: round2(rows.reduce((s, r) => s + r.revenue, 0)) } })
}

/** Balances per administrative unit (its cost centers rolled up). */
export async function unitBalances({ from, to } = {}) {
  const { rows: cc } = await costCenterBalances({ from, to })
  const rows = ADMIN_UNITS.map((u) => {
    const mine = cc.filter((c) => COST_CENTERS.find((x) => x.id === c.id)?.unitId === u.id)
    const agg = (k) => round2(mine.reduce((s, c) => s + c[k], 0))
    return { id: u.id, code: u.code, name: u.name, parentName: unitById(u.parent)?.name ?? null, costCenters: mine.length, debit: agg('debit'), credit: agg('credit'), expenses: agg('expenses'), revenue: agg('revenue'), net: agg('net') }
  })
  return { rows, totals: { expenses: round2(rows.reduce((s, r) => s + r.expenses, 0)), revenue: round2(rows.reduce((s, r) => s + r.revenue, 0)), net: round2(rows.reduce((s, r) => s + r.net, 0)) } }
}

/** Trial balance at a tree level: opening / movement / closing, debit and credit columns. */
export function trialBalanceByLevel({ level = 3, from, to, onlyMovement = true } = {}) {
  const accounts = CHART_OF_ACCOUNTS.filter((a) => (level >= 3 ? !a.isGroup : a.level === level)).sort((x, y) => x.code.localeCompare(y.code))
  const rows = accounts.map((a) => {
    const leaves = new Set(leafIds(a.id))
    const o = from ? sums(linesOf({ to: dayBefore(from), accounts: leaves })) : { debit: 0, credit: 0 }
    const m = sums(linesOf({ from, to, accounts: leaves }))
    const openNet = round2(o.debit - o.credit)
    const closeNet = round2(openNet + m.debit - m.credit)
    return {
      id: a.id, code: a.code, name: a.name, en: a.en, type: a.type, level: a.level,
      openingDebit: openNet > 0 ? openNet : 0, openingCredit: openNet < 0 ? -openNet : 0,
      debit: m.debit, credit: m.credit,
      closingDebit: closeNet > 0 ? closeNet : 0, closingCredit: closeNet < 0 ? -closeNet : 0,
    }
  }).filter((r) => !onlyMovement || r.openingDebit || r.openingCredit || r.debit || r.credit)
  const tot = (k) => round2(rows.reduce((s, r) => s + r[k], 0))
  return mockDelay({ rows, totals: { openingDebit: tot('openingDebit'), openingCredit: tot('openingCredit'), debit: tot('debit'), credit: tot('credit'), closingDebit: tot('closingDebit'), closingCredit: tot('closingCredit') } })
}

/* ── final statements ────────────────────────────────────── */
const INCOME_SECTIONS = ['revenue', 'cost', 'admin', 'other']
export function incomeStatement({ from, to, byItems = false } = {}) {
  const accounts = postable().filter((a) => a.type === 'revenue' || a.type === 'expense')
  const perAccount = accounts.map((a) => {
    const { debit, credit } = sums(linesOf({ from, to, accounts: new Set([a.id]) }))
    return { id: a.id, code: a.code, name: a.name, en: a.en, type: a.type, statementItem: a.statementItem ?? null, amount: natural(a, debit, credit) }
  }).filter((r) => r.amount)
  const revenue = round2(perAccount.filter((r) => r.type === 'revenue').reduce((s, r) => s + r.amount, 0))
  const expenses = round2(perAccount.filter((r) => r.type === 'expense').reduce((s, r) => s + r.amount, 0))
  let groups
  if (byItems) {
    groups = INCOME_SECTIONS.map((section) => {
      const items = STATEMENT_ITEMS.filter((i) => i.statement === 'income' && i.section === section).sort((a, b) => a.order - b.order).map((i) => {
        const rows = perAccount.filter((r) => r.statementItem === i.id)
        return { id: i.id, code: i.code, name: i.name, en: i.en, amount: round2(rows.reduce((s, r) => s + (r.type === 'revenue' ? r.amount : -r.amount), 0)), accounts: rows }
      })
      return { section, items, total: round2(items.reduce((s, i) => s + i.amount, 0)) }
    })
    const unassigned = perAccount.filter((r) => !r.statementItem)
    if (unassigned.length) groups.push({ section: 'unassigned', items: [{ id: 'unassigned', code: '—', name: 'حسابات غير مخصصة لبند', en: 'Unassigned accounts', amount: round2(unassigned.reduce((s, r) => s + (r.type === 'revenue' ? r.amount : -r.amount), 0)), accounts: unassigned }], total: 0 })
  } else {
    groups = [
      { section: 'revenue', items: perAccount.filter((r) => r.type === 'revenue'), total: revenue },
      { section: 'expenses', items: perAccount.filter((r) => r.type === 'expense'), total: expenses },
    ]
  }
  const gross = round2(revenue - (byItems ? (groups.find((g) => g.section === 'cost')?.total ?? 0) * -1 : 0))
  return mockDelay({ from, to, byItems, groups, revenue, expenses, gross, net: round2(revenue - expenses) })
}

const BALANCE_SECTIONS = { assets: ['current_assets', 'fixed_assets'], liabilities: ['current_liabilities'], equity: ['equity'] }
export function balanceSheet({ asOf, byItems = false } = {}) {
  const accounts = postable().filter((a) => ['asset', 'liability', 'equity'].includes(a.type))
  const perAccount = accounts.map((a) => {
    const { debit, credit } = sums(linesOf({ to: asOf, accounts: new Set([a.id]) }))
    return { id: a.id, code: a.code, name: a.name, en: a.en, type: a.type, statementItem: a.statementItem ?? null, amount: natural(a, debit, credit) }
  }).filter((r) => r.amount)
  // period profit not yet closed to retained earnings sits under equity
  const pl = postable().filter((a) => a.type === 'revenue' || a.type === 'expense').reduce((s, a) => {
    const { debit, credit } = sums(linesOf({ to: asOf, accounts: new Set([a.id]) }))
    return s + natural(a, debit, credit) * (a.type === 'revenue' ? 1 : -1)
  }, 0)
  const total = (type) => round2(perAccount.filter((r) => r.type === type).reduce((s, r) => s + r.amount, 0))
  const assets = total('asset')
  const liabilities = total('liability')
  const equity = round2(total('equity') + pl)
  let sides
  if (byItems) {
    const itemRows = (sections) => sections.flatMap((section) => STATEMENT_ITEMS.filter((i) => i.statement === 'balance' && i.section === section).sort((a, b) => a.order - b.order).map((i) => {
      const rows = perAccount.filter((r) => r.statementItem === i.id)
      return { id: i.id, code: i.code, name: i.name, en: i.en, section, amount: round2(rows.reduce((s, r) => s + r.amount, 0)), accounts: rows }
    }))
    sides = { assets: itemRows(BALANCE_SECTIONS.assets), liabilities: itemRows(BALANCE_SECTIONS.liabilities), equity: itemRows(BALANCE_SECTIONS.equity) }
    const unassigned = perAccount.filter((r) => !r.statementItem)
    unassigned.forEach((r) => sides[r.type === 'asset' ? 'assets' : r.type === 'liability' ? 'liabilities' : 'equity'].push({ id: `un-${r.id}`, code: r.code, name: r.name, en: r.en, section: 'unassigned', amount: r.amount, accounts: [r] }))
  } else {
    sides = { assets: perAccount.filter((r) => r.type === 'asset'), liabilities: perAccount.filter((r) => r.type === 'liability'), equity: perAccount.filter((r) => r.type === 'equity') }
  }
  sides.equity.push({ id: 'period_profit', code: '—', name: 'أرباح (خسائر) الفترة غير المقفلة', en: 'Unclosed period profit (loss)', section: 'equity', amount: round2(pl), accounts: [] })
  return mockDelay({ asOf, byItems, sides, assets, liabilities, equity, balanced: Math.round((assets - liabilities - equity) * 100) === 0 })
}

/* ── financial analysis ──────────────────────────────────── */
export const AGGREGATES = ['assets', 'current_assets', 'cash', 'liabilities', 'current_liabilities', 'equity', 'revenue', 'expenses', 'net_profit']
async function aggregates({ from, to }) {
  const bs = await balanceSheet({ asOf: to })
  const is = await incomeStatement({ from, to })
  const sumLeaves = (ids) => round2([...new Set(ids.flatMap(leafIds))].reduce((s, id) => {
    const a = accountById(id)
    const { debit, credit } = sums(linesOf({ to, accounts: new Set([id]) }))
    return s + natural(a, debit, credit)
  }, 0))
  return {
    assets: bs.assets, current_assets: sumLeaves(['current_assets']), cash: sumLeaves(['cash', 'bank']),
    liabilities: bs.liabilities, current_liabilities: sumLeaves(['current_liabilities']), equity: bs.equity,
    revenue: is.revenue, expenses: is.expenses, net_profit: is.net,
  }
}
export async function financialRatios({ from, to } = {}) {
  const agg = await aggregates({ from, to })
  const rows = FINANCIAL_RATIOS.map((r) => {
    const num = agg[r.numerator] ?? 0
    const den = agg[r.denominator] ?? 0
    const raw = den ? num / den : null
    const value = raw === null ? null : r.format === 'percent' ? round2(raw * 100) : round2(raw)
    const ok = value === null ? null : r.id === 'expense_ratio' || r.id === 'debt_to_equity' ? value <= r.target : value >= r.target
    return { ...r, numeratorValue: num, denominatorValue: den, value, ok }
  })
  return { aggregates: agg, rows }
}
export function fetchRatios() {
  return mockDelay(FINANCIAL_RATIOS.map((r) => ({ ...r })))
}
export function createRatio(payload) {
  if (!payload.name?.trim()) return Promise.reject(new Error('NAME_REQUIRED'))
  if (!AGGREGATES.includes(payload.numerator) || !AGGREGATES.includes(payload.denominator)) return Promise.reject(new Error('AGGREGATE_INVALID'))
  const r = { id: `ratio-${Date.now().toString(36)}`, name: payload.name.trim(), en: payload.en?.trim() || payload.name.trim(), numerator: payload.numerator, denominator: payload.denominator, format: payload.format === 'percent' ? 'percent' : 'ratio', target: Number(payload.target) || 0, enabled: payload.enabled ?? true }
  FINANCIAL_RATIOS.push(r)
  return mockDelay(r)
}
export function updateRatio(id, payload) {
  const r = FINANCIAL_RATIOS.find((x) => x.id === id)
  if (!r) return Promise.reject(new Error('NOT_FOUND'))
  Object.assign(r, { name: payload.name?.trim() || r.name, en: payload.en?.trim() || r.en, numerator: payload.numerator || r.numerator, denominator: payload.denominator || r.denominator, format: payload.format || r.format, target: payload.target !== undefined ? Number(payload.target) || 0 : r.target, enabled: payload.enabled ?? r.enabled })
  return mockDelay(r)
}

/* ── journal reports ─────────────────────────────────────── */
function decorateForReport(e) {
  return {
    ...e,
    status: e.status ?? 'posted',
    total: round2(e.lines.reduce((s, l) => s + l.debit, 0)),
    docTypeName: documentTypeById(e.docType)?.name ?? e.docType,
    lines: e.lines.map((l, i) => ({ ...l, lineNo: i + 1, accountCode: accountById(l.account)?.code ?? '', accountName: accountById(l.account)?.name ?? l.account, costCenterName: costCenterById(l.costCenter)?.name ?? '' })),
  }
}
export function journalDetailed({ from, to, docType, source } = {}) {
  const rows = live().filter((e) => inRange(e.date, from, to) && (!docType || e.docType === docType) && (!source || e.source === source)).map(decorateForReport).sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : (a.serial || 0) - (b.serial || 0)))
  return mockDelay({ rows, totals: { entries: rows.length, lines: rows.reduce((s, e) => s + e.lines.length, 0), debit: round2(rows.reduce((s, e) => s + e.total, 0)) } })
}
export function journalChanged({ from, to } = {}) {
  const rows = JOURNAL.filter((e) => inRange(e.date, from, to) && (e.status === 'voided' || e.modifiedAt)).map((e) => ({ ...decorateForReport(e), change: e.status === 'voided' ? 'voided' : 'modified', changedAt: e.status === 'voided' ? e.voidedAt : e.modifiedAt, changedBy: e.status === 'voided' ? e.voidedBy : e.modifiedBy, reason: e.voidReason ?? '' })).sort((a, b) => ((a.changedAt ?? '') < (b.changedAt ?? '') ? 1 : -1))
  return mockDelay(rows)
}

/* ── master-data reports ─────────────────────────────────── */
export async function costCentersReport() {
  const { rows } = await costCenterBalances({})
  return rows.map((r) => ({ ...r, active: costCenterById(r.id)?.active ?? true, vehicleId: costCenterById(r.id)?.vehicleId ?? null }))
}
export async function adminUnitsReport() {
  const { rows } = await unitBalances({})
  return rows.map((r) => ({ ...r, active: unitById(r.id)?.active ?? true }))
}
export function accountsReport() {
  return fetchAccountTree()
}
export function itemsReport() {
  return fetchStatementItems()
}
