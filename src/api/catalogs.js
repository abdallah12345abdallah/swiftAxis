import { mockDelay } from '@/services/http'
import { EXPENSE_ITEMS, EXPENSE_TYPES, PURCHASE_ITEMS, VEHICLE_EXPENSES, PURCHASES, TREASURY_MOVEMENTS, UNITS } from './fixtures'
import { logAudit } from './audit'

/* Catalogs (#6): expense items and purchase items are defined by the user
   instead of being hard-coded. EXPENSE_TYPES (the legacy map read by charts
   and badges) is kept in sync with EXPENSE_ITEMS. */

const slug = (name) => name.trim().toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '') || `item-${Date.now()}`

/* ── Expense items ───────────────────────────────────────── */
export function fetchExpenseItems() {
  return mockDelay(
    EXPENSE_ITEMS.map((i) => ({
      ...i,
      usage: VEHICLE_EXPENSES.filter((e) => e.type === i.id).length + TREASURY_MOVEMENTS.filter((m) => m.expenseItem === i.id).length,
    })),
  )
}
export function createExpenseItem(payload) {
  if (!payload.name?.trim()) return Promise.reject(new Error('NAME_REQUIRED'))
  let id = slug(payload.name)
  while (EXPENSE_ITEMS.some((i) => i.id === id)) id = `${id}-${EXPENSE_ITEMS.length + 1}`
  const item = { id, name: payload.name.trim(), en: payload.en?.trim() || payload.name.trim(), account: payload.account || 'general_expense', active: payload.active ?? true }
  EXPENSE_ITEMS.push(item)
  EXPENSE_TYPES[id] = { ar: item.name, en: item.en }
  logAudit({ action: 'create', entity: 'catalog', detail: `بند مصروف: ${item.name}` })
  return mockDelay(item)
}
export function updateExpenseItem(id, payload) {
  const item = EXPENSE_ITEMS.find((i) => i.id === id)
  if (!item) return Promise.reject(new Error('NOT_FOUND'))
  Object.assign(item, { name: payload.name?.trim() || item.name, en: payload.en?.trim() || item.en, account: payload.account || item.account, active: payload.active ?? item.active })
  EXPENSE_TYPES[id] = { ar: item.name, en: item.en }
  logAudit({ action: 'update', entity: 'catalog', detail: `بند مصروف: ${item.name}` })
  return mockDelay(item)
}

/* ── Units of measure ────────────────────────────────────── */
export const unitByCode = (code) => UNITS.find((u) => u.code === code)
/** A unit code from a code or a legacy free-text unit ('قطعة', 'liter' …); '' if unknown. */
export function unitCode(v) {
  const s = String(v ?? '').trim()
  if (!s) return ''
  const low = s.toLowerCase()
  return UNITS.find((u) => u.code.toLowerCase() === low || u.name === s || u.en.toLowerCase() === low)?.code ?? ''
}
export function fetchUnits() {
  return mockDelay(UNITS.map((u) => ({ ...u, usage: PURCHASE_ITEMS.filter((i) => i.unit === u.code).length })))
}
export function createUnit(payload) {
  const code = String(payload.code ?? '').trim().toUpperCase()
  if (!code || !payload.name?.trim()) return Promise.reject(new Error('REQUIRED'))
  if (unitByCode(code)) return Promise.reject(new Error('DUPLICATE_CODE'))
  const unit = { code, name: payload.name.trim(), en: payload.en?.trim() || payload.name.trim(), active: payload.active ?? true }
  UNITS.push(unit)
  logAudit({ action: 'create', entity: 'catalog', detail: `وحدة: ${unit.code} — ${unit.name}` })
  return mockDelay(unit)
}
export function updateUnit(code, payload) {
  const unit = unitByCode(code)
  if (!unit) return Promise.reject(new Error('NOT_FOUND'))
  Object.assign(unit, { name: payload.name?.trim() || unit.name, en: payload.en?.trim() || unit.en, active: payload.active ?? unit.active })
  logAudit({ action: 'update', entity: 'catalog', detail: `وحدة: ${unit.code} — ${unit.name}` })
  return mockDelay(unit)
}

/* ── Purchase items ──────────────────────────────────────── */
const usedIn = (p, i) => (p.lines ? p.lines.some((l) => l.itemId === i.id || l.itemType === i.name) : p.itemId === i.id || p.itemType === i.name)
export function fetchPurchaseItems() {
  return mockDelay(
    PURCHASE_ITEMS.map((i) => {
      const code = unitCode(i.unit)
      const u = unitByCode(code)
      return { ...i, unit: code, unitName: u?.name ?? '', unitEn: u?.en ?? '', usage: PURCHASES.filter((p) => usedIn(p, i)).length }
    }),
  )
}
let pSeq = PURCHASE_ITEMS.length
export function createPurchaseItem(payload) {
  if (!payload.name?.trim()) return Promise.reject(new Error('NAME_REQUIRED'))
  pSeq += 1
  const item = { id: `pi${pSeq}`, name: payload.name.trim(), category: payload.category || 'other', unit: unitCode(payload.unit), active: payload.active ?? true }
  PURCHASE_ITEMS.push(item)
  logAudit({ action: 'create', entity: 'catalog', detail: `بند مشتريات: ${item.name}` })
  return mockDelay(item)
}
export function updatePurchaseItem(id, payload) {
  const item = PURCHASE_ITEMS.find((i) => i.id === id)
  if (!item) return Promise.reject(new Error('NOT_FOUND'))
  Object.assign(item, { name: payload.name?.trim() || item.name, category: payload.category || item.category, unit: payload.unit !== undefined ? unitCode(payload.unit) : item.unit, active: payload.active ?? item.active })
  logAudit({ action: 'update', entity: 'catalog', detail: `بند مشتريات: ${item.name}` })
  return mockDelay(item)
}
