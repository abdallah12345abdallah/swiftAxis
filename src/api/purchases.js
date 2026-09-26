import { mockDelay } from '@/services/http'
import { SUPPLIERS, PURCHASES, VEHICLES, PURCHASE_ITEMS } from './fixtures'
import { VAT_RATE } from '@/lib/constants'
import { postEntry } from './ledger'
import { logAudit } from './audit'
import { unitByCode, unitCode } from './catalogs'

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

const r2 = (v) => Math.round((Number(v) || 0) * 100) / 100

/** Pre-tax / VAT / total of one line (qty × unit price). */
export function computeLine({ qty, unitPrice, inclVat, taxable }) {
  const amount = r2((Number(qty) || 0) * (Number(unitPrice) || 0))
  if (!taxable) return { preTax: amount, vat: 0, total: amount }
  if (inclVat) {
    const preTax = r2(amount / (1 + VAT_RATE))
    return { preTax, vat: r2(amount - preTax), total: amount }
  }
  const vat = r2(amount * VAT_RATE)
  return { preTax: amount, vat, total: r2(amount + vat) }
}

/** Invoice totals. With `lines` (multi-item invoice) each line is computed
    (taxable per line, "prices include VAT" for the whole invoice) and summed;
    without, the legacy single-item fields are used. */
export function computeTotals(payload) {
  if (!Array.isArray(payload.lines)) return computeLine(payload)
  return payload.lines.reduce(
    (t, l) => {
      const x = computeLine({ ...l, inclVat: payload.inclVat })
      return { preTax: r2(t.preTax + x.preTax), vat: r2(t.vat + x.vat), total: r2(t.total + x.total) }
    },
    { preTax: 0, vat: 0, total: 0 },
  )
}

/** The purchase's item lines — older single-item purchases get one derived
    from itemType / qty / unitPrice. */
export function linesOf(p) {
  const raw = p.lines?.length
    ? p.lines
    : [{ itemId: p.itemId ?? null, itemType: p.itemType, qty: p.qty, unitPrice: p.unitPrice, taxable: p.taxable, preTax: p.preTax, vat: p.vat, total: p.total }]
  return raw.map((l) => {
    const item = l.itemId ? PURCHASE_ITEMS.find((i) => i.id === l.itemId) : PURCHASE_ITEMS.find((i) => i.name === l.itemType)
    const code = unitCode(l.unit || item?.unit)
    const u = unitByCode(code)
    return { ...l, unit: code, unitName: u?.name ?? '', unitEn: u?.en ?? '' }
  })
}

const decorate = (p) => {
  const lines = linesOf(p)
  return {
    ...p,
    lines,
    itemsCount: lines.length,
    supplierName: supplierById(p.supplierId)?.name ?? '—',
    supplierTaxNo: p.supplierTaxNo || supplierById(p.supplierId)?.taxNo || '—',
    vehiclePlate: VEHICLES.find((v) => v.id === p.vehicleId)?.plate ?? null,
  }
}

export function fetchPurchases({ from, to, supplierId } = {}) {
  const rows = PURCHASES.filter((p) => {
    if (supplierId && p.supplierId !== supplierId) return false
    if (!inRange(p.date, from, to)) return false
    return true
  })
    .map(decorate)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
  return mockDelay(rows)
}

let pSeq = PURCHASES.length
/**
 * Register a purchase invoice. payload: header fields + `lines`:
 * [{ itemId?, itemType?, unit?, qty, unitPrice, taxable }] — an item from the
 * catalog (#6) or free text for one-offs. `inclVat` applies to every line.
 * (A payload without `lines` is read as one line, as before.)
 */
export async function createPurchase(payload) {
  const supplierTaxNo = String(payload.supplierTaxNo || '').trim()
  if (supplierTaxNo && !validTaxNo(supplierTaxNo)) return Promise.reject(new Error('INVALID_TAX'))
  const inclVat = !!payload.inclVat
  const input = Array.isArray(payload.lines) ? payload.lines : [payload]
  const lines = input
    .map((l) => {
      const item = l.itemId ? PURCHASE_ITEMS.find((i) => i.id === l.itemId) : null
      const qty = Number(l.qty) || 0
      const unitPrice = Number(l.unitPrice) || 0
      const taxable = !!l.taxable
      return {
        itemId: item?.id ?? null,
        itemType: item?.name ?? String(l.itemType || '').trim(),
        unit: unitCode(item ? item.unit : l.unit),
        qty,
        unitPrice,
        taxable,
        ...computeLine({ qty, unitPrice, taxable, inclVat }),
      }
    })
    .filter((l) => l.itemType && l.qty > 0 && l.unitPrice > 0)
  if (!lines.length) return Promise.reject(new Error('NO_LINES'))
  const totals = computeTotals({ lines, inclVat })
  pSeq += 1
  const ref = `PO-${new Date().getFullYear()}-${String(pSeq).padStart(4, '0')}`
  // a purchase linked to a vehicle is charged to that vehicle's cost center (#10)
  const vehicle = payload.vehicleId ? VEHICLES.find((v) => v.id === payload.vehicleId) : null
  const first = lines[0]
  const purchase = {
    id: `p${pSeq}`,
    supplierId: payload.supplierId,
    supplierTaxNo: supplierTaxNo || supplierById(payload.supplierId)?.taxNo || '',
    // first item kept on the purchase for older readers (search, VAT report)
    itemId: first.itemId,
    itemType: first.itemType,
    qty: lines.length === 1 ? first.qty : undefined,
    unitPrice: lines.length === 1 ? first.unitPrice : undefined,
    date: payload.date,
    taxable: lines.some((l) => l.taxable),
    inclVat,
    vehicleId: vehicle?.id ?? null,
    costCenter: vehicle ? vehicle.costCenter : payload.costCenter,
    invoiceNo: payload.invoiceNo || '—',
    ref,
    lines,
    ...totals,
  }
  PURCHASES.push(purchase)
  // Auto journal entry (US-029): one line per item, input VAT, and the supplier.
  // Fuel is stocked (fuel_stock) and expensed per fill-up at its average cost.
  const cc = purchase.costCenter
  const entry = lines.map((l) => ({ account: isFuelLine(l) ? 'fuel_stock' : 'supplies_expense', costCenter: cc, debit: l.preTax, credit: 0, description: `${l.itemType} × ${l.qty}` }))
  if (purchase.vat > 0) entry.push({ account: 'input_vat', costCenter: cc, debit: purchase.vat, credit: 0, description: 'ضريبة مدخلات' })
  entry.push({ account: 'suppliers', costCenter: cc, debit: 0, credit: purchase.total, description: purchase.invoiceNo !== '—' ? `فاتورة ${purchase.invoiceNo}` : '' })
  await postEntry({ source: 'purchases', date: purchase.date, description: `مشتريات — ${purchase.ref}`, lines: entry })
  logAudit({ action: 'create', entity: 'purchases', detail: `${purchase.ref} (${lines.length})` })
  return mockDelay(decorate(purchase))
}

/* ── Fuel stock ────────────────────────────────────────────── */
/** Is this purchase line fuel? (an item in the 'fuel' category) */
export function isFuelLine(l) {
  const item = l.itemId ? PURCHASE_ITEMS.find((i) => i.id === l.itemId) : PURCHASE_ITEMS.find((i) => i.name === l.itemType)
  return item?.category === 'fuel'
}
/** Fuel bought: { date, liters, value (pre-tax) } per fuel line, oldest first.
    Older single-item purchases have no `lines`: the purchase is its own line. */
export function fuelPurchases() {
  return PURCHASES.flatMap((p) => (p.lines ?? [p]).filter(isFuelLine).map((l) => ({ date: p.date, liters: Number(l.qty) || 0, value: Number(l.preTax ?? (l.qty || 0) * (l.unitPrice || 0)) || 0 })))
    .filter((x) => x.liters > 0)
    .sort((x, y) => (x.date < y.date ? -1 : x.date > y.date ? 1 : 0))
}

/** Input VAT report (US-030). */
export function vatReport({ from, to } = {}) {
  const rows = PURCHASES.filter((p) => inRange(p.date, from, to) && p.vat > 0).map((p) => ({
    ...decorate(p),
    taxNo: p.supplierTaxNo || supplierById(p.supplierId)?.taxNo || '—',
  }))
  return mockDelay({ rows, totalVat: rows.reduce((s, r) => s + r.vat, 0), totalPreTax: rows.reduce((s, r) => s + r.preTax, 0) })
}
