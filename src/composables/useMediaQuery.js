import { computed, getCurrentInstance, onBeforeUnmount, ref } from 'vue'

/* Reactive `window.matchMedia`: a ref that is true while the query matches.
   Use it only for the few things CSS cannot do on its own — everything that
   can be a media query or a Tailwind breakpoint belongs in the stylesheet. */
export function useMediaQuery(query) {
  const matches = ref(false)
  if (typeof window === 'undefined' || !window.matchMedia) return matches

  const mql = window.matchMedia(query)
  matches.value = mql.matches
  const onChange = (e) => (matches.value = e.matches)
  mql.addEventListener('change', onChange)
  if (getCurrentInstance()) onBeforeUnmount(() => mql.removeEventListener('change', onChange))

  return matches
}

/* A chart's height, in the spirit of the fluid scale in main.css: it keeps its
   designed height on a wide screen and gives some back as the screen narrows,
   so the plot stays in proportion with its card instead of turning square on a
   phone. ApexCharts wants a number, so this one cannot live in CSS. */
export function useChartHeight(base) {
  const wide = useMediaQuery('(min-width: 80rem)') // the sheet is roomy again
  const phone = useMediaQuery('(max-width: 39.98rem)')
  return computed(() => {
    if (wide.value) return base
    return Math.round(base * (phone.value ? 0.78 : 0.88))
  })
}
