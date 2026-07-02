import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { NAV_ITEMS } from '@/lib/constants'

import DashboardLayout from '@/layouts/DashboardLayout.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'
import Login from '@/pages/Login.vue'
import Dashboard from '@/pages/Dashboard.vue'
import Riders from '@/pages/Riders.vue'
import Ledger from '@/pages/Ledger.vue'
import Orders from '@/pages/Orders.vue'
import Commissions from '@/pages/Commissions.vue'
import Wallets from '@/pages/Wallets.vue'
import Vehicles from '@/pages/Vehicles.vue'
import Purchases from '@/pages/Purchases.vue'
import Reports from '@/pages/Reports.vue'
import Users from '@/pages/Users.vue'
import Settings from '@/pages/Settings.vue'
import Profile from '@/pages/Profile.vue'
import Placeholder from '@/pages/Placeholder.vue'
import StyleGuide from '@/pages/StyleGuide.vue'

// Pages that have a real implementation (skip the placeholder for these).
const BUILT = new Set([
  'dashboard', 'riders', 'ledger', 'orders', 'commissions',
  'wallets', 'vehicles', 'purchases', 'reports', 'users', 'settings',
])

const rolesOf = (key) => NAV_ITEMS.find((i) => i.key === key)?.roles

// Placeholder pages for every epic not yet built.
const placeholderRoutes = NAV_ITEMS.filter((i) => !BUILT.has(i.key)).map((i) => ({
  path: i.to.slice(1),
  name: i.key,
  component: Placeholder,
  meta: { roles: i.roles, titleKey: `nav.${i.key}` },
}))

const ridersItem = NAV_ITEMS.find((i) => i.key === 'riders')

const routes = [
  {
    path: '/login',
    component: AuthLayout,
    children: [{ path: '', name: 'login', component: Login, meta: { public: true } }],
  },
  {
    path: '/',
    component: DashboardLayout,
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: '/dashboard' },
      { path: 'dashboard', name: 'dashboard', component: Dashboard },
      { path: 'riders', name: 'riders', component: Riders, meta: { roles: ridersItem.roles, titleKey: 'nav.riders' } },
      { path: 'ledger', name: 'ledger', component: Ledger, meta: { roles: rolesOf('ledger'), titleKey: 'nav.ledger' } },
      { path: 'orders', name: 'orders', component: Orders, meta: { roles: rolesOf('orders'), titleKey: 'nav.orders' } },
      { path: 'commissions', name: 'commissions', component: Commissions, meta: { roles: rolesOf('commissions'), titleKey: 'nav.commissions' } },
      { path: 'wallets', name: 'wallets', component: Wallets, meta: { roles: rolesOf('wallets'), titleKey: 'nav.wallets' } },
      { path: 'vehicles', name: 'vehicles', component: Vehicles, meta: { roles: rolesOf('vehicles'), titleKey: 'nav.vehicles' } },
      { path: 'purchases', name: 'purchases', component: Purchases, meta: { roles: rolesOf('purchases'), titleKey: 'nav.purchases' } },
      { path: 'reports', name: 'reports', component: Reports, meta: { roles: rolesOf('reports'), titleKey: 'nav.reports' } },
      { path: 'users', name: 'users', component: Users, meta: { roles: rolesOf('users'), titleKey: 'nav.users' } },
      { path: 'settings', name: 'settings', component: Settings, meta: { roles: rolesOf('settings'), titleKey: 'nav.settings' } },
      ...placeholderRoutes,
      { path: 'profile', name: 'profile', component: Profile, meta: { titleKey: 'common.profile' } },
      { path: 'dev/ui', name: 'styleguide', component: StyleGuide },
    ],
  },
  { path: '/:pathMatch(.*)*', redirect: '/dashboard' },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

router.beforeEach((to) => {
  const auth = useAuthStore()

  if (to.meta.public) {
    return auth.isAuthenticated ? { name: 'dashboard' } : true
  }
  if (!auth.isAuthenticated) {
    return { name: 'login' }
  }
  // Role gate: block routes the current role can't access.
  const roles = to.matched.find((r) => r.meta?.roles)?.meta.roles
  if (roles && !roles.includes(auth.role)) {
    return { name: 'dashboard' }
  }
  return true
})
