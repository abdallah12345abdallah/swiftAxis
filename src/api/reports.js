import { mockDelay } from '@/services/http'
import { RIDERS } from './fixtures'
import { UNDERPERFORMANCE_RATIO } from '@/lib/constants'
import { profitability } from './vehicles'
import { profitAndLoss } from './ledger'

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
