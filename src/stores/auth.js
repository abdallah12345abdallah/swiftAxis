import { defineStore } from 'pinia'
import { ROLES } from '@/lib/constants'

const STORAGE_KEY = 'swiftaxis.auth'

/** Demo accounts — one per role. Replaced by real backend auth later. */
export const DEMO_USERS = {
  [ROLES.MANAGER]: { name: 'أحمد العتيبي', role: ROLES.MANAGER, riderId: null },
  [ROLES.SUPERVISOR]: { name: 'خالد الشهري', role: ROLES.SUPERVISOR, riderId: null },
  [ROLES.ACCOUNTANT]: { name: 'سارة الدوسري', role: ROLES.ACCOUNTANT, riderId: null },
  [ROLES.RIDER]: { name: 'محمد الغامدي', role: ROLES.RIDER, riderId: 'R-001' },
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
