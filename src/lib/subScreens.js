import { ACCOUNTING_MENU } from './accountingMenu'

/* Sub-screens of each module, as the sidebar island shows them under the
   module. Every screen is its own page with its own address: the module's
   first screen lives at the module path (/orders), the others under it
   (/orders/manual). useRouteTab maps the address to the page's screen.
   entry: { key, labelKey, path, tab?, group? } — `group` is a labelKey used as
   a small heading line. */

const screenPath = (path, key, defaultTab) => (key === defaultTab ? path : `${path}/${key}`)
const tabs = (path, labelPrefix, keys, defaultTab) => ({
  path,
  defaultTab,
  items: keys.map((k) => ({ key: k, labelKey: `${labelPrefix}.${k}`, path: screenPath(path, k, defaultTab), tab: k })),
})

export const SUB_SCREENS = {
  orders: tabs('/orders', 'orders.tabs', ['logs', 'manual'], 'logs'),
  commissions: tabs('/commissions', 'commissions.tabs', ['formulas', 'monthly'], 'formulas'),
  wallets: tabs('/wallets', 'wallets.tabs', ['wallets', 'deposits', 'withdrawals', 'debts'], 'wallets'),
  treasury: tabs('/treasury', 'treasury.tabs', ['treasuries', 'payments', 'receipts', 'transfers', 'statement', 'settings'], 'treasuries'),
  sales: tabs('/sales', 'sales.tabs', ['invoices', 'vat'], 'invoices'),
  ledger: {
    path: '/ledger',
    defaultTab: 'journal',
    items: [
      { key: 'entry', labelKey: 'journal.title', path: '/ledger/entry' },
      ...['journal', 'trial', 'pnl', 'costCenters'].map((k) => ({ key: k, labelKey: `ledger.tabs.${k}`, path: screenPath('/ledger', k, 'journal'), tab: k })),
    ],
  },
  purchases: tabs('/purchases', 'purchases.tabs', ['purchases', 'suppliers', 'items', 'vat', 'byCenter'], 'purchases'),
  vehicles: tabs('/vehicles', 'vehicles.tabs', ['vehicles', 'handover', 'shifts', 'expenses', 'fuel', 'expenseItems', 'profitability'], 'vehicles'),
  reports: tabs('/reports', 'reports.tabs', ['monthly', 'period', 'best'], 'monthly'),
  users: tabs('/users', 'users.tabs', ['users', 'roles', 'audit'], 'users'),
  accounting: {
    path: '/accounting',
    items: ACCOUNTING_MENU.flatMap((section) =>
      section.groups.flatMap((g) =>
        g.screens.map((s) => ({
          key: s.key,
          labelKey: `accounting.screens.${s.key}`,
          path: s.to ?? `/accounting/${s.key}`,
          group: `accounting.groups.${g.key}`,
        })),
      ),
    ),
  },
}

const trim = (p) => (p.length > 1 ? p.replace(/\/+$/, '') : p)

/** Is this sub-screen the one currently open? */
export function isSubActive(sub, route) {
  return trim(route.path) === sub.path
}

/** Router location for a sub-screen. */
export function subLocation(sub) {
  return { path: sub.path }
}

/** Route pattern for a module whose screens are pages: 'orders/:tab(manual)?' */
export function screensRoute(key) {
  const m = SUB_SCREENS[key]
  const others = m.items.filter((i) => i.tab && i.tab !== m.defaultTab).map((i) => i.tab)
  return `${m.path.slice(1)}/:tab(${others.join('|')})?`
}

/** The screen (of a module with screen pages) the route is on, or null. */
export function currentScreen(route) {
  for (const m of Object.values(SUB_SCREENS)) {
    const hit = m.items.find((i) => i.tab && isSubActive(i, route))
    if (hit) return hit
  }
  return null
}
