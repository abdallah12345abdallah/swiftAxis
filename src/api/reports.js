import { mockDelay } from '@/services/http'
import { RIDERS, ORDERS, VEHICLE_EXPENSES } from './fixtures'
import { UNDERPERFORMANCE_RATIO } from '@/lib/constants'
import { profitability, assignmentOf } from './vehicles'
import { profitAndLoss } from './ledger'
import { formulaFor, computeCommission } from './commissions'
import { orderNosFor } from './orders'

/* Reports (EP-06). Aggregates existing data into a report payload. */

let seq = 0

export async function fetchReport({ month = '2026-07' } = {}) {
  const active = RIDERS.filter((r) => r.active)
  const orders = active.reduce((s, r) => s + r.orders, 0)
  const commissions = active.reduce((s, r) => s + r.commission, 0)
  const riders = RIDERS.map((r) => {
    const progress = r.goal ? Math.round((r.orders / r.goal) * 100) : 0
    return { id: r.id, name: r.name, orders: r.orders, goal: r.goal, commission: r.commission, progress, underperforming: r.active && progress < UNDERPERFORMANCE_RATIO * 100 }
  })
  const [vehicles, pnl] = await Promise.all([profitability(), profitAndLoss()])
  seq += 1
  return mockDelay({
    month,
    refNo: `RPT-${new Date().getFullYear()}-${String(seq).padStart(3, '0')}`,
    summary: { orders, commissions, activeRiders: active.length, avgOrders: active.length ? Math.round(orders / active.length) : 0 },
    riders,
    comparison: [...riders].filter((r) => r.orders > 0).sort((a, b) => b.orders - a.orders),
    vehicles,
    pnl,
  })
}

const inRange = (d, from, to) => (!from || d >= from) && (!to || d <= to)

/** Riders period report (#2): per rider — orders in range, commission, vehicle,
    shift and the vehicle's expenses in the same range. */
export function fetchRidersPeriodReport({ from, to } = {}) {
  const rows = RIDERS.filter((r) => r.active).map((r) => {
    const logs = ORDERS.filter((o) => o.riderId === r.id && inRange(o.date, from, to))
    const orders = logs.reduce((s, o) => s + o.orders, 0)
    const breakdown = computeCommission(orders, formulaFor(r))
    const assignment = assignmentOf(r.id)
    const vehicle = assignment?.vehicle ?? null
    const vehicleExpenses = vehicle
      ? VEHICLE_EXPENSES.filter((e) => e.vehicleId === vehicle.id && inRange(e.date, from, to)).reduce((s, e) => s + e.amount, 0)
      : 0
    return {
      id: r.id,
      code: r.id,
      name: r.name,
      orderNos: orderNosFor(r.id, from, to),
      plate: vehicle?.plate ?? null,
      shift: assignment?.shift ?? null,
      sharedVehicle: !!(vehicle?.morningRiderId && vehicle?.eveningRiderId),
      days: logs.length,
      orders,
      commission: breakdown.total,
      vehicleExpenses,
    }
  })
  return mockDelay({
    from,
    to,
    rows,
    totals: {
      orders: rows.reduce((s, r) => s + r.orders, 0),
      commission: rows.reduce((s, r) => s + r.commission, 0),
      vehicleExpenses: rows.reduce((s, r) => s + r.vehicleExpenses, 0),
    },
  })
}

/** Best riders report (#3): ranked by monthly orders with commission and achieved salary. */
export function fetchBestRiders() {
  const rows = RIDERS.filter((r) => r.active && r.orders > 0)
    .map((r) => {
      const b = computeCommission(r.orders, formulaFor(r))
      return { id: r.id, code: r.id, name: r.name, orders: r.orders, goal: r.goal, extraAmount: b.extraAmount, total: b.total }
    })
    .sort((a, b) => b.orders - a.orders)
    .map((r, i) => ({ ...r, rank: i + 1 }))
  return mockDelay(rows)
}
