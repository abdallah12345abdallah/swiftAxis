import { createI18n } from 'vue-i18n'
import ar from './locales/ar.json'
import en from './locales/en.json'

const STORAGE_KEY = 'swiftaxis.locale'

export const SUPPORTED_LOCALES = ['ar', 'en']
export const RTL_LOCALES = ['ar']

export function getStoredLocale() {
  const stored = localStorage.getItem(STORAGE_KEY)
  return SUPPORTED_LOCALES.includes(stored) ? stored : 'ar'
}

export const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: getStoredLocale(),
  fallbackLocale: 'en',
  messages: { ar, en },
})

/** Apply a locale everywhere: i18n, <html dir/lang>, and persistence. */
export function applyLocale(locale) {
  if (!SUPPORTED_LOCALES.includes(locale)) locale = 'ar'
  i18n.global.locale.value = locale
  const dir = RTL_LOCALES.includes(locale) ? 'rtl' : 'ltr'
  document.documentElement.setAttribute('lang', locale)
  document.documentElement.setAttribute('dir', dir)
  localStorage.setItem(STORAGE_KEY, locale)
}
