import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { NAV_ITEMS } from '@/lib/constants'

import DashboardLayout from '@/layouts/DashboardLayout.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'
import Login from '@/pages/Login.vue'
import Dashboard from '@/pages/Dashboard.vue'
import Placeholder from '@/pages/Placeholder.vue'
import StyleGuide from '@/pages/StyleGuide.vue'

// Placeholder pages for every epic except the (real) dashboard.
const placeholderRoutes = NAV_ITEMS.filter((i) => i.key !== 'dashboard').map((i) => ({
  path: i.to.slice(1),
  name: i.key,
  component: Placeholder,
  meta: { roles: i.roles, titleKey: `nav.${i.key}` },
}))

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
      ...placeholderRoutes,
      { path: 'profile', name: 'profile', component: Placeholder, meta: { titleKey: 'common.profile' } },
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
