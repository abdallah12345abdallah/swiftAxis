import { mockDelay } from '@/services/http'
import { USERS } from './fixtures'
import { ROLE_CONVERSIONS } from '@/lib/constants'
import { logAudit } from './audit'

/* Users & permissions (EP-08). */

export function fetchUsers() {
  return mockDelay(USERS.map((u) => ({ ...u })))
}

let seq = USERS.length
export function createUser(payload) {
  seq += 1
  const u = { id: `u${seq}`, name: payload.name, role: payload.role, mobile: payload.mobile, active: true }
  USERS.push(u)
  logAudit({ action: 'create', entity: 'users', detail: u.name })
  return mockDelay(u)
}
export function updateUser(id, payload) {
  const u = USERS.find((x) => x.id === id)
  if (!u) return Promise.reject(new Error('NOT_FOUND'))
  Object.assign(u, { name: payload.name, role: payload.role, mobile: payload.mobile, active: payload.active ?? u.active })
  logAudit({ action: 'update', entity: 'users', detail: u.name })
  return mockDelay(u)
}
export function toggleUser(id) {
  const u = USERS.find((x) => x.id === id)
  if (!u) return Promise.reject(new Error('NOT_FOUND'))
  u.active = !u.active
  logAudit({ action: 'update', entity: 'users', detail: `${u.active ? 'تفعيل' : 'تعطيل'} ${u.name}` })
  return mockDelay(u)
}

/** Convert an account's role (#8): e.g. supervisor → warehouse keeper.
    Only the pairs in ROLE_CONVERSIONS are allowed; the previous role is kept
    so the change is visible in the audit log and reversible. */
export function convertRole(id, toRole) {
  const u = USERS.find((x) => x.id === id)
  if (!u) return Promise.reject(new Error('NOT_FOUND'))
  const target = toRole || ROLE_CONVERSIONS[u.role]
  if (!target || ROLE_CONVERSIONS[u.role] !== target) return Promise.reject(new Error('NOT_CONVERTIBLE'))
  const from = u.role
  u.previousRole = from
  u.role = target
  u.convertedAt = new Date().toISOString().slice(0, 10)
  logAudit({ action: 'update', entity: 'users', detail: `تحويل دور ${u.name}: ${from} → ${target}` })
  return mockDelay({ ...u })
}
