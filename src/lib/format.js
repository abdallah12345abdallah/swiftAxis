import { useI18n } from 'vue-i18n'

/** Locale-aware date formatting (mirrors useCurrency). */
export function useDate() {
  const { locale } = useI18n()
  const loc = () => (locale.value === 'ar' ? 'ar-SA-u-nu-latn' : 'en-US')

  function formatDate(value, opts) {
    if (!value) return '—'
    const d = typeof value === 'string' ? new Date(value) : value
    if (Number.isNaN(d.getTime())) return String(value)
    return new Intl.DateTimeFormat(loc(), opts ?? { year: 'numeric', month: 'short', day: 'numeric' }).format(d)
  }

  function formatMonth(value) {
    return formatDate(value, { year: 'numeric', month: 'long' })
  }

  return { formatDate, formatMonth }
}
