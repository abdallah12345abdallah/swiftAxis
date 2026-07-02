import { defineStore } from 'pinia'

const KEY = 'swiftaxis.settings'

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    companyName: 'SwiftAxis Logistics',
    walletThreshold: 700,
    vatRate: 15,
    notifyWhatsapp: true,
    notifyLowPerformer: true,
  }),
  actions: {
    init() {
      try {
        const raw = localStorage.getItem(KEY)
        if (raw) Object.assign(this.$state, JSON.parse(raw))
      } catch {
        /* ignore */
      }
    },
    save(patch) {
      Object.assign(this.$state, patch)
      localStorage.setItem(KEY, JSON.stringify(this.$state))
    },
  },
})
