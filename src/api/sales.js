import { mockDelay } from '@/services/http'
import { SALES_INVOICES, CONTRACT_LIST, CONTRACT_COST_CENTER } from './fixtures'
import { VAT_RATE } from '@/lib/constants'
import { postEntry } from './ledger'
import { createReceipt } from './treasury'
import { logAudit } from './audit'

/* Sales invoices (#7). A partner sheet (Hunger Station …) is registered as a
   sales invoice; VAT is added automatically at VAT_RATE and the invoice posts
   Dr receivables / Cr delivery revenue + output VAT. */

const round2 = (n) => Math.round(n * 100) / 100
const contractById = (id) => CONTRACT_LIST.find((c) => c.id === id)
const inRange = (d, from, to) => (!from || d >= from) && (!to || d <= to)

/** Totals from order count × unit price; VAT is always added on top. */
export function computeSalesTotals({ orders, unitPrice, extra = 0 }) {
  const preTax = round2((Number(orders) || 0) * (Number(unitPrice) || 0) + (Number(extra) || 0))
  const vat = round2(preTax * VAT_RATE)
  return { preTax, vat, total: round2(preTax + vat), vatRate: VAT_RATE }
}

function decorate(i) {
  return { ...i, company: contractById(i.contract)?.company ?? i.contract }
}

export function fetchSalesInvoices({ contract, from, to, status } = {}) {
  const rows = SALES_INVOICES.filter((i) => (!contract || i.contract === contract) && (!status || i.status === status) && inRange(i.date, from, to))
    .map(decorate)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
  return mockDelay(rows)
}

let seq = SALES_INVOICES.length
const nextRef = () => `SI-${new Date().getFullYear()}-${String(seq).padStart(4, '0')}`

/** Register a sheet as a sales invoice and post it. */
export async function createSalesInvoice({ contract, period, date, orders, unitPrice, extra = 0, sheet = null, notes = '' }) {
  if (!contractById(contract)) return Promise.reject(new Error('CONTRACT_REQUIRED'))
  const totals = computeSalesTotals({ orders, unitPrice, extra })
  if (totals.preTax <= 0) return Promise.reject(new Error('INVALID_AMOUNT'))
  if (SALES_INVOICES.some((i) => i.contract === contract && i.period === period)) return Promise.reject(new Error('DUPLICATE_PERIOD'))
  seq += 1
  const ref = nextRef()
  const cc = CONTRACT_COST_CENTER[contract] || null
  const entry = await postEntry({
    source: 'sales',
    date,
    description: `فاتورة مبيعات ${ref} — ${contractById(contract).company} (${period})`,
    lines: [
      { account: 'receivables', costCenter: cc, debit: totals.total, credit: 0 },
      { account: 'delivery_revenue', costCenter: cc, debit: 0, credit: totals.preTax },
      { account: 'output_vat', costCenter: cc, debit: 0, credit: totals.vat },
    ],
  })
  const inv = {
    id: `si${seq}`, ref, contract, period, date,
    orders: Number(orders) || 0, unitPrice: Number(unitPrice) || 0, extra: Number(extra) || 0,
    ...totals, sheet: sheet?.name ?? null, notes, status: 'issued', journalRef: entry.ref,
  }
  SALES_INVOICES.push(inv)
  logAudit({ action: 'create', entity: 'sales', detail: ref })
  return mockDelay(decorate(inv))
}

/** Record the client's payment: receipt voucher into the chosen treasury. */
export async function markInvoicePaid(id, { treasuryId, date }) {
  const inv = SALES_INVOICES.find((i) => i.id === id)
  if (!inv) return Promise.reject(new Error('NOT_FOUND'))
  if (inv.status === 'paid') return Promise.reject(new Error('ALREADY_PAID'))
  const voucher = await createReceipt({
    treasuryId, date, amount: inv.total, party: contractById(inv.contract)?.company ?? inv.contract,
    description: `سداد فاتورة ${inv.ref}`, account: 'receivables', costCenter: CONTRACT_COST_CENTER[inv.contract] || null, source: 'sales',
  })
  inv.status = 'paid'
  inv.paidAt = date
  inv.receiptRef = voucher.ref
  logAudit({ action: 'update', entity: 'sales', detail: `سداد ${inv.ref}` })
  return mockDelay(decorate(inv))
}

/** Mock parse of an uploaded partner sheet → prefilled invoice fields. */
export function parseSalesSheet(file) {
  const name = (file?.name || '').toLowerCase()
  const contract = name.includes('jahez') || name.includes('jz') ? 'jahez' : 'hunger'
  const now = new Date()
  const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  return mockDelay({ contract, period, orders: 3410, unitPrice: 12, rows: 3410, riders: 7 }, 600)
}

/** Output VAT report (mirror of the purchases input VAT report). */
export function salesVatReport({ from, to } = {}) {
  const rows = SALES_INVOICES.filter((i) => inRange(i.date, from, to)).map(decorate)
  return mockDelay({
    rows,
    totalPreTax: rows.reduce((s, r) => s + r.preTax, 0),
    totalVat: rows.reduce((s, r) => s + r.vat, 0),
    totalDue: rows.filter((r) => r.status !== 'paid').reduce((s, r) => s + r.total, 0),
  })
}
