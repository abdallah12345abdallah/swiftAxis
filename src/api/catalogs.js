import { mockDelay } from '@/services/http'
import { EXPENSE_ITEMS, EXPENSE_TYPES, PURCHASE_ITEMS, VEHICLE_EXPENSES, PURCHASES, TREASURY_MOVEMENTS } from './fixtures'
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

/* ── Purchase items ──────────────────────────────────────── */
export function fetchPurchaseItems() {
  return mockDelay(PURCHASE_ITEMS.map((i) => ({ ...i, usage: PURCHASES.filter((p) => p.itemId === i.id || p.itemType === i.name).length })))
}
let pSeq = PURCHASE_ITEMS.length
export function createPurchaseItem(payload) {
  if (!payload.name?.trim()) return Promise.reject(new Error('NAME_REQUIRED'))
  pSeq += 1
  const item = { id: `pi${pSeq}`, name: payload.name.trim(), category: payload.category || 'other', unit: payload.unit?.trim() || '', active: payload.active ?? true }
  PURCHASE_ITEMS.push(item)
  logAudit({ action: 'create', entity: 'catalog', detail: `بند مشتريات: ${item.name}` })
  return mockDelay(item)
}
export function updatePurchaseItem(id, payload) {
  const item = PURCHASE_ITEMS.find((i) => i.id === id)
  if (!item) return Promise.reject(new Error('NOT_FOUND'))
  Object.assign(item, { name: payload.name?.trim() || item.name, category: payload.category || item.category, unit: payload.unit?.trim() ?? item.unit, active: payload.active ?? item.active })
  logAudit({ action: 'update', entity: 'catalog', detail: `بند مشتريات: ${item.name}` })
  return mockDelay(item)
}
