import { mockDelay } from '@/services/http'
import {
  RIDERS,
  TRENDS,
  RIDER_WEEK,
  RIDER_WALLET,
} from './fixtures'
import { WALLET_WARNING_THRESHOLD, UNDERPERFORMANCE_RATIO } from '@/lib/constants'

function progressOf(r) {
  return r.goal > 0 ? Math.round((r.orders / r.goal) * 100) : 0
}

/** Manager dashboard (US-019 + US-022). */
export function fetchManagerDashboard(period = 'month') {
  const active = RIDERS.filter((r) => r.active)
  const totalOrders = active.reduce((s, r) => s + r.orders, 0)
  const commissionsDue = active.reduce((s, r) => s + r.commission, 0)
  const activeRiders = active.length
  const avgOrders = activeRiders ? Math.round(totalOrders / activeRiders) : 0

  const kpis = {
    totalOrders: { value: totalOrders, delta: 8 },
    commissionsDue: { value: commissionsDue, delta: 5 },
    activeRiders: { value: activeRiders, delta: 0 },
    avgOrders: { value: avgOrders, delta: 3 },
  }

  const riders = RIDERS.map((r) => {
    const progress = progressOf(r)
    return {
      ...r,
      progress,
      underperforming: r.active && progress < UNDERPERFORMANCE_RATIO * 100,
    }
  })

  const alerts = [
    ...riders
      .filter((r) => r.wallet > WALLET_WARNING_THRESHOLD)
      .map((r) => ({ type: 'wallet', name: r.name, amount: r.wallet })),
    ...riders
      .filter((r) => r.underperforming)
      .map((r) => ({ type: 'low', name: r.name })),
  ]

  const comparison = [...riders]
    .filter((r) => r.active)
    .sort((a, b) => b.orders - a.orders)

  return mockDelay({
    kpis,
    trend: TRENDS[period] ?? TRENDS.month,
    riders,
    alerts,
    comparison,
  })
}

/** Rider dashboard — only the signed-in rider's own data (US-020). */
export function fetchRiderDashboard(riderId) {
  const rider = RIDERS.find((r) => r.id === riderId) ?? RIDERS[0]
  const progress = progressOf(rider)
  const todayOrders = RIDER_WEEK.orders[RIDER_WEEK.orders.length - 2] // yesterday-ish sample

  return mockDelay({
    rider,
    kpis: {
      myOrders: { value: rider.orders, delta: 6 },
      myCommission: { value: rider.commission, delta: 4 },
      walletBalance: { value: RIDER_WALLET.balance },
      goalProgress: { value: progress },
    },
    week: RIDER_WEEK,
    wallet: RIDER_WALLET,
    todayOrders,
    goalReached: todayOrders >= RIDER_WEEK.dailyGoal,
  })
}
