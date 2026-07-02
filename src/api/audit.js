import { mockDelay } from '@/services/http'
import { AUDIT_LOG } from './fixtures'

/* Append-only audit trail (US-027). Entries can be read but never edited. */

let seq = AUDIT_LOG.length

/** Record an action. Called by other mock modules on create/update/delete. */
export function logAudit({ action, entity, detail = '', user = 'أحمد العتيبي', role = 'manager' }) {
  seq += 1
  AUDIT_LOG.unshift({
    id: `a${seq}`,
    at: new Date().toISOString().slice(0, 19),
    user,
    role,
    action,
    entity,
    detail,
    ip: '212.11.4.31',
  })
}

/** Read the log with optional filters. */
export function fetchAudit({ query = '', action = '', entity = '' } = {}) {
  const q = query.trim().toLowerCase()
  const rows = AUDIT_LOG.filter((e) => {
    if (action && e.action !== action) return false
    if (entity && e.entity !== entity) return false
    if (q && !`${e.user} ${e.detail} ${e.entity}`.toLowerCase().includes(q)) return false
    return true
  })
  return mockDelay(rows)
}
