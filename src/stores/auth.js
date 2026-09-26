import { defineStore } from 'pinia'
import { ROLES } from '@/lib/constants'

const STORAGE_KEY = 'swiftaxis.auth'

/** Demo accounts — one per role, each tied to a USERS row (`id`) so per-user
    permissions (treasury boxes) apply. Replaced by real backend auth later. */
export const DEMO_USERS = {
  [ROLES.MANAGER]: { id: 'u1', name: 'أحمد العتيبي', role: ROLES.MANAGER, riderId: null },
  [ROLES.SUPERVISOR]: { id: 'u2', name: 'خالد الشهري', role: ROLES.SUPERVISOR, riderId: null },
  [ROLES.ACCOUNTANT]: { id: 'u3', name: 'سارة الدوسري', role: ROLES.ACCOUNTANT, riderId: null },
  [ROLES.STOREKEEPER]: { id: 'u5', name: 'فيصل الجهني', role: ROLES.STOREKEEPER, riderId: null },
  [ROLES.RIDER]: { id: 'u4', name: 'محمد الغامدي', role: ROLES.RIDER, riderId: 'R-001' },
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
  }),
  getters: {
    isAuthenticated: (s) => !!s.user,
    role: (s) => s.user?.role ?? null,
    initials: (s) => (s.user?.name ? s.user.name.trim().charAt(0) : '?'),
  },
  actions: {
    init() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (raw) this.user = JSON.parse(raw)
        // sessions saved before users had ids: take the demo account's id
        if (this.user && !this.user.id) this.user.id = DEMO_USERS[this.user.role]?.id ?? null
      } catch {
        this.user = null
      }
    },
    /** Mock login: pick a role, load its demo user. */
    loginAs(role) {
      const demo = DEMO_USERS[role]
      if (!demo) return false
      this.user = { ...demo }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.user))
      return true
    },
    /** Dev helper: switch active role without re-authenticating. */
    switchRole(role) {
      return this.loginAs(role)
    },
    logout() {
      this.user = null
      localStorage.removeItem(STORAGE_KEY)
    },
  },
})
