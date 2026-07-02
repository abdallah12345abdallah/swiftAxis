import { mockDelay } from '@/services/http'
import { RIDERS, CONTRACT_LIST } from './fixtures'
import { UNDERPERFORMANCE_RATIO } from '@/lib/constants'

/* In-memory CRUD over the demo fixtures. Mutations persist for the session
   (module-level arrays), so navigating away and back keeps changes. Swap these
   for real Spring endpoints later — the page code won't change. */

function progressOf(r) {
  return r.goal > 0 ? Math.round((r.orders / r.goal) * 100) : 0
}

/** Decorate a raw rider with derived fields the UI needs. */
function decorate(r) {
  const progress = progressOf(r)
  return {
    ...r,
    progress,
    underperforming: r.active && progress < UNDERPERFORMANCE_RATIO * 100,
  }
}

/** US-004 — list riders (decorated). */
export function fetchRiders() {
  return mockDelay(RIDERS.map(decorate))
}

/** US-002 — contracts with linked-rider counts. */
export function fetchContracts() {
  return mockDelay(
    CONTRACT_LIST.map((c) => ({
      ...c,
      riderCount: RIDERS.filter((r) => (r.contracts ?? [r.contract]).includes(c.id)).length,
    })),
  )
}

function nextRiderId() {
  const max = RIDERS.reduce((m, r) => {
    const n = parseInt(String(r.id).replace(/\D/g, ''), 10)
    return Number.isNaN(n) ? m : Math.max(m, n)
  }, 0)
  return `R-${String(max + 1).padStart(3, '0')}`
}

/** US-001 — create a rider. Rejects a duplicate national ID. */
export function createRider(payload) {
  const dup = RIDERS.some((r) => r.nationalId === payload.nationalId)
  if (dup) return Promise.reject(new Error('DUPLICATE_ID'))

  const contracts = payload.contracts?.length ? payload.contracts : []
  const rider = {
    id: nextRiderId(),
    name: payload.name,
    nationalId: payload.nationalId,
    mobile: payload.mobile,
    city: payload.city,
    contract: contracts[0] ?? null,
    contracts,
    vehicleType: payload.vehicleType,
    vehicle: payload.vehicle,
    orders: 0,
    goal: 480,
    commission: 0,
    wallet: 0,
    active: payload.active ?? true,
  }
  RIDERS.push(rider)
  return mockDelay(decorate(rider))
}

/** US-003 — edit a rider. National ID is immutable and history is untouched. */
export function updateRider(id, payload) {
  const rider = RIDERS.find((r) => r.id === id)
  if (!rider) return Promise.reject(new Error('NOT_FOUND'))

  const contracts = payload.contracts?.length ? payload.contracts : rider.contracts
  Object.assign(rider, {
    name: payload.name,
    mobile: payload.mobile,
    city: payload.city,
    contracts,
    contract: contracts[0] ?? rider.contract,
    vehicleType: payload.vehicleType,
    vehicle: payload.vehicle,
    active: payload.active ?? rider.active,
    // nationalId intentionally NOT updated
  })
  return mockDelay(decorate(rider))
}

/** US-001 — enable/disable a rider account. */
export function toggleRiderActive(id) {
  const rider = RIDERS.find((r) => r.id === id)
  if (!rider) return Promise.reject(new Error('NOT_FOUND'))
  rider.active = !rider.active
  return mockDelay(decorate(rider))
}

/* ── Contracts (US-002) ─────────────────────────────────── */

/** Create a contract. */
export function createContract(payload) {
  const contract = {
    id: `ct-${CONTRACT_LIST.length + 1}`,
    company: payload.company,
    city: payload.city,
    start: payload.start || null,
    end: payload.end || null,
    active: payload.active ?? true,
  }
  CONTRACT_LIST.push(contract)
  return mockDelay(contract)
}

/** Edit a contract. */
export function updateContract(id, payload) {
  const contract = CONTRACT_LIST.find((c) => c.id === id)
  if (!contract) return Promise.reject(new Error('NOT_FOUND'))
  Object.assign(contract, {
    company: payload.company,
    city: payload.city,
    start: payload.start || null,
    end: payload.end || null,
    active: payload.active ?? contract.active,
  })
  return mockDelay(contract)
}
