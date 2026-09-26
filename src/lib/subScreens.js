import { ACCOUNTING_MENU } from './accountingMenu'
import { ROLES } from './constants'

/* Sub-screens of each module, as the sidebar island shows them under the
   module. Every screen is its own page with its own address: the module's
   first screen lives at the module path (/orders), the others under it
   (/orders/manual). useRouteTab maps the address to the page's screen.
   entry: { key, labelKey, path, tab?, group?, roles? } — `group` is a labelKey
   used as a small heading line; `roles` narrows who sees that one screen
   (the module's NAV_ITEMS roles still apply; no `roles` = everyone the module
   allows). */

const screenPath = (path, key, defaultTab) => (key === defaultTab ? path : `${path}/${key}`)
const tabs = (path, labelPrefix, keys, defaultTab, roles = {}) => ({
  path,
  defaultTab,
  items: keys.map((k) => ({ key: k, labelKey: `${labelPrefix}.${k}`, path: screenPath(path, k, defaultTab), tab: k, ...(roles[k] && { roles: roles[k] }) })),
})

/* Per-screen access. Orders: the accountant sees the manual-orders screen only
   (all riders' records); the rider keeps the daily logs + their own manual
   orders. Wallets: a rider sees only their own wallet ("my wallet"); the
   staff screens list every rider's money. */
const { MANAGER, SUPERVISOR, ACCOUNTANT, RIDER } = ROLES
const WALLET_STAFF = [MANAGER, SUPERVISOR, ACCOUNTANT]

export const SUB_SCREENS = {
  orders: tabs('/orders', 'orders.tabs', ['logs', 'manual'], 'logs', { logs: [MANAGER, SUPERVISOR, RIDER] }),
  commissions: tabs('/commissions', 'commissions.tabs', ['formulas', 'monthly'], 'formulas'),
  wallets: tabs('/wallets', 'wallets.tabs', ['wallets', 'deposits', 'withdrawals', 'debts', 'mine'], 'wallets', {
    wallets: WALLET_STAFF, deposits: WALLET_STAFF, withdrawals: WALLET_STAFF, debts: WALLET_STAFF, mine: [RIDER],
  }),
  treasury: tabs('/treasury', 'treasury.tabs', ['treasuries', 'payments', 'receipts', 'transfers', 'statement', 'settings'], 'treasuries'),
  sales: tabs('/sales', 'sales.tabs', ['invoices', 'vat'], 'invoices'),
  ledger: {
    path: '/ledger',
    defaultTab: 'journal',
    items: [
      { key: 'entry', labelKey: 'journal.title', path: '/ledger/entry' },
      ...['journal', 'voided', 'trial', 'pnl', 'costCenters'].map((k) => ({ key: k, labelKey: `ledger.tabs.${k}`, path: screenPath('/ledger', k, 'journal'), tab: k })),
    ],
  },
  purchases: tabs('/purchases', 'purchases.tabs', ['purchases', 'suppliers', 'items', 'units', 'vat'], 'purchases'),
  vehicles: tabs('/vehicles', 'vehicles.tabs', ['vehicles', 'handover', 'receive', 'shifts', 'expenses', 'fuel', 'expenseItems', 'profitability'], 'vehicles'),
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

/** May this role open this sub-screen? */
export function screenAllowed(sub, role) {
  return !sub.roles || sub.roles.includes(role)
}

/** The screens of a module this role may open. */
export function allowedScreens(key, role) {
  return (SUB_SCREENS[key]?.items ?? []).filter((i) => screenAllowed(i, role))
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
