import { mockDelay } from '@/services/http'
import {
  RIDERS, ORDERS, WALLET_MOVEMENTS, SALES_INVOICES, VEHICLES, USERS, PURCHASES, CONTRACT_LIST, JOURNAL,
  FISCAL_YEARS, CLOSED_MONTHS, MANUAL_ORDERS,
} from './fixtures'
import { balanceOf, mainTreasury } from './treasury'

/* Live counts shown beside every link in the sidebar island. Each value is
   { value, kind } where kind ∈ count | money | alert | warn — the layout
   decides how to paint it. */
export function fetchNavBadges() {
  const today = new Date().toISOString().slice(0, 10)
  const latestDay = [...ORDERS].sort((a, b) => (a.date < b.date ? 1 : -1))[0]?.date ?? today
  const ordersToday = ORDERS.filter((o) => o.date === (ORDERS.some((o) => o.date === today) ? today : latestDay)).reduce((s, o) => s + o.orders, 0)
  const pendingDeposits = WALLET_MOVEMENTS.filter((m) => m.type === 'handover' && m.status === 'pending').length
  const unpaid = SALES_INVOICES.filter((i) => i.status !== 'paid').length
  const maintenance = VEHICLES.filter((v) => v.status !== 'active').length
  const fy = FISCAL_YEARS.find((y) => y.isDefault) ?? FISCAL_YEARS[FISCAL_YEARS.length - 1]
  const closed = (CLOSED_MONTHS[fy?.id] ?? []).length
  const activeRiders = RIDERS.filter((r) => r.active).length
  const inputVat = Math.round(PURCHASES.reduce((s, p) => s + p.vat, 0))
  return mockDelay({
    dashboard: { value: ordersToday, kind: 'count' },
    orders: { value: MANUAL_ORDERS.length, kind: 'count' },
    riders: { value: `${activeRiders}/${RIDERS.length}`, kind: 'count' },
    contracts: { value: CONTRACT_LIST.filter((c) => c.active).length, kind: 'count' },
    commissions: { value: RIDERS.filter((r) => r.active).reduce((s, r) => s + r.commission, 0), kind: 'money' },
    wallets: pendingDeposits ? { value: pendingDeposits, kind: 'alert' } : { value: 0, kind: 'count' },
    treasury: { value: balanceOf(mainTreasury().id), kind: 'money' },
    sales: unpaid ? { value: unpaid, kind: 'warn' } : { value: 0, kind: 'count' },
    accounting: { value: `${closed}/12`, kind: 'count' },
    ledger: { value: JOURNAL.filter((e) => e.status !== 'voided').length, kind: 'count' },
    purchases: { value: inputVat, kind: 'money' },
    vehicles: maintenance ? { value: maintenance, kind: 'warn' } : { value: VEHICLES.length, kind: 'count' },
    reports: null,
    users: { value: USERS.length, kind: 'count' },
    settings: null,
    live: { ordersToday, treasury: balanceOf(mainTreasury().id), pendingDeposits },
  }, 120)
}
