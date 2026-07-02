import { defineStore } from 'pinia'
import { applyLocale, getStoredLocale } from '@/i18n'

const THEME_KEY = 'swiftaxis.theme'

function storedTheme() {
  const t = localStorage.getItem(THEME_KEY)
  if (t === 'light' || t === 'dark') return t
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export const useUiStore = defineStore('ui', {
  state: () => ({
    theme: 'light',
    locale: 'ar',
    sidebarCollapsed: false,
  }),
  getters: {
    isDark: (s) => s.theme === 'dark',
  },
  actions: {
    init() {
      this.theme = storedTheme()
      this.applyTheme()
      this.locale = getStoredLocale()
      applyLocale(this.locale)
    },
    applyTheme() {
      document.documentElement.classList.toggle('dark', this.theme === 'dark')
    },
    toggleTheme() {
      this.theme = this.theme === 'dark' ? 'light' : 'dark'
      localStorage.setItem(THEME_KEY, this.theme)
      this.applyTheme()
    },
    setLocale(locale) {
      this.locale = locale
      applyLocale(locale)
    },
    toggleLocale() {
      this.setLocale(this.locale === 'ar' ? 'en' : 'ar')
    },
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed
    },
  },
})
