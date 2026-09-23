import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

/** A page's active tab, mirrored in the URL as `?tab=` so the sidebar island
    can link straight to a sub-screen. The default tab keeps a clean URL. */
export function useRouteTab(defaultTab) {
  const route = useRoute()
  const router = useRouter()
  const tab = ref(route.query.tab ? String(route.query.tab) : defaultTab)
  watch(
    () => route.query.tab,
    (v) => {
      const next = v ? String(v) : defaultTab
      if (next !== tab.value) tab.value = next
    },
  )
  watch(tab, (v) => {
    const current = route.query.tab ? String(route.query.tab) : defaultTab
    if (current === v) return
    router.replace({ query: { ...route.query, tab: v === defaultTab ? undefined : v } })
  })
  return tab
}
