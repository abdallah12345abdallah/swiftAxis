import { useI18n } from 'vue-i18n'

/** SAR currency + number formatting, locale-aware, tabular-friendly. */
export function useCurrency() {
  const { locale } = useI18n()

  const nf = (opts) =>
    new Intl.NumberFormat(locale.value === 'ar' ? 'ar-SA' : 'en-US', opts)

  /** Format a money amount, e.g. "1,250 ر.س" / "SAR 1,250". */
  function sar(value, { decimals = 0 } = {}) {
    const n = nf({ minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(
      Number(value ?? 0),
    )
    return locale.value === 'ar' ? `${n} ر.س` : `SAR ${n}`
  }

  /** Format a plain integer/number. */
  function num(value, { decimals = 0 } = {}) {
    return nf({ minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(
      Number(value ?? 0),
    )
  }

  /** Format a signed percentage delta, e.g. "+12%". */
  function percent(value, { decimals = 0 } = {}) {
    const sign = value > 0 ? '+' : ''
    return `${sign}${num(value, { decimals })}%`
  }

  return { sar, num, percent }
}
