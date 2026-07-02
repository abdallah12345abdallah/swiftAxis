import { mockDelay } from '@/services/http'
import { SUPPLIERS, PURCHASES, COST_CENTERS } from './fixtures'
import { VAT_RATE } from '@/lib/constants'
import { postEntry } from './ledger'
import { logAudit } from './audit'

/* Purchases & VAT (EP-09). */

const supplierById = (id) => SUPPLIERS.find((s) => s.id === id)

/* ── Suppliers (US-031) ─────────────────────────────────── */
export function fetchSuppliers() {
  return mockDelay(
    SUPPLIERS.map((s) => ({ ...s, purchases: PURCHASES.filter((p) => p.supplierId === s.id).length })),
  )
}
/** ZATCA tax number: 15 digits, starts and ends with 3. */
export function validTaxNo(v) {
  return /^3\d{13}3$/.test(String(v || '').trim())
}
let sSeq = SUPPLIERS.length
export function createSupplier(payload) {
  if (!validTaxNo(payload.taxNo)) return Promise.reject(new Error('INVALID_TAX'))
  sSeq += 1
  const s = { id: `s${sSeq}`, name: payload.name, taxNo: payload.taxNo, mobile: payload.mobile, category: payload.category, active: true }
  SUPPLIERS.push(s)
  logAudit({ action: 'create', entity: 'suppliers', detail: s.name })
  return mockDelay(s)
}
export function updateSupplier(id, payload) {
  const s = supplierById(id)
  if (!s) return Promise.reject(new Error('NOT_FOUND'))
  if (!validTaxNo(payload.taxNo)) return Promise.reject(new Error('INVALID_TAX'))
  Object.assign(s, { name: payload.name, taxNo: payload.taxNo, mobile: payload.mobile, category: payload.category, active: payload.active ?? s.active })
  logAudit({ action: 'update', entity: 'suppliers', detail: s.name })
  return mockDelay(s)
}

/* ── Purchases (US-028/029) ─────────────────────────────── */
const inRange = (d, from, to) => (!from || d >= from) && (!to || d <= to)

/** Compute pre-tax / VAT / total from inputs. */
export function computeTotals({ qty, unitPrice, inclVat, taxable }) {
  const line = (Number(qty) || 0) * (Number(unitPrice) || 0)
  if (!taxable) return { preTax: line, vat: 0, total: line }
  if (inclVat) {
    const preTax = line / (1 + VAT_RATE)
    return { preTax: Math.round(preTax * 100) / 100, vat: Math.round((line - preTax) * 100) / 100, total: line }
  }
  const vat = Math.round(line * VAT_RATE * 100) / 100
  return { preTax: line, vat, total: line + vat }
}

export function fetchPurchases({ from, to, supplierId } = {}) {
  const rows = PURCHASES.filter((p) => {
    if (supplierId && p.supplierId !== supplierId) return false
    if (!inRange(p.date, from, to)) return false
    return true
  })
    .map((p) => ({ ...p, supplierName: supplierById(p.supplierId)?.name ?? '—' }))
    .sort((a, b) => (a.date < b.date ? 1 : -1))
  return mockDelay(rows)
}

let pSeq = PURCHASES.length
export async function createPurchase(payload) {
  const totals = computeTotals(payload)
  pSeq += 1
  const ref = `PO-${new Date().getFullYear()}-${String(pSeq).padStart(4, '0')}`
  const purchase = {
    id: `p${pSeq}`,
    supplierId: payload.supplierId,
    itemType: payload.itemType,
    qty: Number(payload.qty) || 0,
    unitPrice: Number(payload.unitPrice) || 0,
    date: payload.date,
    taxable: !!payload.taxable,
    costCenter: payload.costCenter,
    invoiceNo: payload.invoiceNo || '—',
    ref,
    ...totals,
  }
  PURCHASES.push(purchase)
  // Auto journal entry (US-029): 3 lines with VAT, 2 without.
  const lines = [{ account: 'supplies_expense', costCenter: purchase.costCenter, debit: purchase.preTax, credit: 0 }]
  if (purchase.vat > 0) lines.push({ account: 'input_vat', costCenter: purchase.costCenter, debit: purchase.vat, credit: 0 })
  lines.push({ account: 'suppliers', costCenter: purchase.costCenter, debit: 0, credit: purchase.total })
  await postEntry({ source: 'purchases', date: purchase.date, description: `مشتريات — ${purchase.ref}`, lines })
  logAudit({ action: 'create', entity: 'purchases', detail: purchase.ref })
  return mockDelay(purchase)
}

/** Input VAT report (US-030). */
export function vatReport({ from, to } = {}) {
  const rows = PURCHASES.filter((p) => inRange(p.date, from, to) && p.vat > 0).map((p) => ({
    ...p,
    supplierName: supplierById(p.supplierId)?.name ?? '—',
    taxNo: supplierById(p.supplierId)?.taxNo ?? '—',
  }))
  return mockDelay({ rows, totalVat: rows.reduce((s, r) => s + r.vat, 0), totalPreTax: rows.reduce((s, r) => s + r.preTax, 0) })
}

/** Purchases grouped by cost center vs budget (US-032). */
export function purchasesByCostCenter({ from, to } = {}) {
  const rows = COST_CENTERS.map((c) => {
    const spent = PURCHASES.filter((p) => p.costCenter === c.id && inRange(p.date, from, to)).reduce((s, p) => s + p.total, 0)
    return { id: c.id, name: c.name, budget: c.budget, spent, variance: c.budget - spent, over: spent > c.budget }
  })
  return mockDelay(rows)
}
