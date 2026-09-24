/* Roles, navigation and the role→access matrix (US-026).
   Defined once and consumed by both the sidebar and the router guard. */

export const ROLES = {
  MANAGER: 'manager',
  SUPERVISOR: 'supervisor',
  ACCOUNTANT: 'accountant',
  STOREKEEPER: 'storekeeper',
  RIDER: 'rider',
}

/** Roles that can be converted into another role from the users screen (#8).
    A supervisor account can be upgraded to a warehouse keeper. */
export const ROLE_CONVERSIONS = {
  [ROLES.SUPERVISOR]: ROLES.STOREKEEPER,
}

export const ALL_ROLES = Object.values(ROLES)

/** Navigation items. `roles` = who may see/access the route.
    `icon` is a lucide-vue-next component name resolved in the sidebar. */
export const NAV_ITEMS = [
  {
    key: 'dashboard',
    to: '/dashboard',
    icon: 'LayoutDashboard',
    roles: ALL_ROLES,
  },
  {
    key: 'riders',
    to: '/riders',
    icon: 'Users',
    roles: [ROLES.MANAGER, ROLES.SUPERVISOR],
    epic: 'EP-01',
  },
  {
    key: 'contracts',
    to: '/contracts',
    icon: 'FileSignature',
    roles: [ROLES.MANAGER, ROLES.SUPERVISOR],
    epic: 'EP-01',
  },
  {
    key: 'orders',
    to: '/orders',
    icon: 'ClipboardList',
    // the accountant only reaches the manual-orders screen (see subScreens.js)
    roles: [ROLES.MANAGER, ROLES.SUPERVISOR, ROLES.ACCOUNTANT, ROLES.RIDER],
    epic: 'EP-02',
  },
  {
    key: 'commissions',
    to: '/commissions',
    icon: 'Percent',
    roles: [ROLES.MANAGER, ROLES.ACCOUNTANT],
    epic: 'EP-03',
  },
  {
    key: 'wallets',
    to: '/wallets',
    icon: 'Wallet',
    // the rider only reaches their own wallet screen (see subScreens.js)
    roles: [ROLES.MANAGER, ROLES.SUPERVISOR, ROLES.ACCOUNTANT, ROLES.RIDER],
    epic: 'EP-04',
  },
  {
    key: 'vehicles',
    to: '/vehicles',
    icon: 'Car',
    roles: [ROLES.MANAGER, ROLES.ACCOUNTANT, ROLES.STOREKEEPER],
    epic: 'EP-05',
  },
  {
    key: 'treasury',
    to: '/treasury',
    icon: 'Landmark',
    roles: [ROLES.MANAGER, ROLES.ACCOUNTANT, ROLES.STOREKEEPER],
    epic: 'EP-10',
  },
  {
    key: 'sales',
    to: '/sales',
    icon: 'Receipt',
    roles: [ROLES.MANAGER, ROLES.ACCOUNTANT],
    epic: 'EP-11',
  },
  {
    key: 'reports',
    to: '/reports',
    icon: 'FileBarChart',
    roles: [ROLES.MANAGER, ROLES.SUPERVISOR, ROLES.ACCOUNTANT],
    epic: 'EP-06',
  },
  {
    key: 'ledger',
    to: '/ledger',
    icon: 'BookOpen',
    roles: [ROLES.MANAGER, ROLES.ACCOUNTANT],
    epic: 'EP-07',
  },
  {
    key: 'accounting',
    to: '/accounting',
    icon: 'Calculator',
    roles: [ROLES.MANAGER, ROLES.ACCOUNTANT],
    epic: 'EP-12',
  },
  {
    key: 'purchases',
    to: '/purchases',
    icon: 'ShoppingCart',
    roles: [ROLES.MANAGER, ROLES.ACCOUNTANT, ROLES.STOREKEEPER],
    epic: 'EP-09',
  },
  {
    key: 'users',
    to: '/users',
    icon: 'ShieldCheck',
    roles: [ROLES.MANAGER],
    epic: 'EP-08',
  },
  {
    key: 'settings',
    to: '/settings',
    icon: 'Settings',
    roles: [ROLES.MANAGER],
  },
]

/** Sidebar island groups: every nav item sits in one colored domain group.
    `tone` is a design token name used for the group's color bar. */
export const NAV_GROUPS = [
  { key: 'ops', tone: 'primary', items: ['dashboard', 'orders', 'riders', 'contracts', 'commissions'] },
  { key: 'money', tone: 'orange', items: ['wallets', 'treasury', 'sales', 'accounting', 'ledger', 'purchases'] },
  { key: 'fleet', tone: 'success', items: ['vehicles', 'reports'] },
  { key: 'admin', tone: 'muted', items: ['users', 'settings'] },
]

/** Wallet balance warning threshold in SAR (US-014). */
export const WALLET_WARNING_THRESHOLD = 700

/** Rider under-performance flag: below this ratio of the target (US-004). */
export const UNDERPERFORMANCE_RATIO = 0.7

/** VAT rate for purchases (EP-09 / US-028). */
export const VAT_RATE = 0.15
