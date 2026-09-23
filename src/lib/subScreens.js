import { ACCOUNTING_MENU } from './accountingMenu'

/* Sub-screens of each module, as the sidebar island shows them under the active
   module and in search results. Tabbed pages expose their tabs via `?tab=`
   (useRouteTab); the accounting area has real routes per screen.
   entry: { key, labelKey, path, tab?, group? } — `group` is a labelKey used as a
   small heading line. */

const tabs = (path, labelPrefix, keys, defaultTab) => ({
  path,
  defaultTab,
  items: keys.map((k) => ({ key: k, labelKey: `${labelPrefix}.${k}`, path, tab: k })),
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
      ...['journal', 'trial', 'pnl', 'costCenters'].map((k) => ({ key: k, labelKey: `ledger.tabs.${k}`, path: '/ledger', tab: k })),
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

/** Is this sub-screen the one currently open? */
export function isSubActive(sub, route, defaultTab) {
  if (route.path !== sub.path) return false
  if (!sub.tab) return true
  return (route.query.tab ? String(route.query.tab) : defaultTab) === sub.tab
}

/** Router location for a sub-screen (clean URL for the default tab). */
export function subLocation(sub, defaultTab) {
  if (!sub.tab || sub.tab === defaultTab) return { path: sub.path }
  return { path: sub.path, query: { tab: sub.tab } }
}
