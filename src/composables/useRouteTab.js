import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

/** The screen a page shows, taken from its address: /orders is the first
    screen, /orders/manual another (see screensRoute in lib/subScreens).
    Setting the ref navigates to that screen's page. Old ?tab= links are sent
    to the new address. */
export function useRouteTab(defaultTab) {
  const route = useRoute()
  const router = useRouter()
  const name = route.name
  const fromRoute = () => (route.params.tab ? String(route.params.tab) : defaultTab)
  const target = (v) => ({ name, params: { ...route.params, tab: v === defaultTab ? undefined : v } })

  const legacy = route.query.tab ? String(route.query.tab) : null
  const tab = ref(legacy ?? fromRoute())
  if (legacy) {
    const { tab: _drop, ...query } = route.query
    router.replace({ ...target(legacy), query })
  }

  watch(
    () => route.params.tab,
    () => {
      if (route.name !== name) return // leaving the page
      const next = fromRoute()
      if (next !== tab.value) tab.value = next
    },
  )
  watch(tab, (v) => {
    if (route.name !== name || fromRoute() === v) return
    router.push(target(v))
  })
  return tab
}
