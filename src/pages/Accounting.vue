<script setup>
import { ref, computed, watch, defineAsyncComponent } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { ChevronDown, ChevronUp, Settings2, FileBarChart, Menu as MenuIcon, X, ExternalLink } from 'lucide-vue-next'
import PageHeader from '@/components/common/PageHeader.vue'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { ACCOUNTING_MENU, ALL_SCREENS, DEFAULT_SCREEN } from '@/lib/accountingMenu'

/* General accounts area (EP-12): a sidebar tree mirroring the partner's menu
   (settings + reports) beside the selected screen. Screens are lazy-loaded
   from src/components/accounting by the name in the menu definition. */

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const modules = import.meta.glob('@/components/accounting/*.vue')
const screens = Object.fromEntries(
  Object.entries(modules).map(([path, loader]) => [path.split('/').pop().replace('.vue', ''), defineAsyncComponent({ loader, loadingComponent: Skeleton, delay: 100 })]),
)

const current = computed(() => ALL_SCREENS.find((s) => s.key === route.params.screen && s.component) ?? ALL_SCREENS.find((s) => s.key === DEFAULT_SCREEN))
watch(
  () => route.params.screen,
  (k) => {
    if (!k) router.replace(`/accounting/${DEFAULT_SCREEN}`)
  },
  { immediate: true },
)

/* open state: the active group's section and group start open */
const openSections = ref(new Set(ACCOUNTING_MENU.map((s) => s.key)))
const openGroups = ref(new Set([current.value?.group]))
watch(current, (c) => {
  if (c) openGroups.value = new Set([...openGroups.value, c.group])
})
const toggle = (set, key) => {
  const s = new Set(set.value)
  s.has(key) ? s.delete(key) : s.add(key)
  set.value = s
}
const ICONS = { settings: Settings2, reports: FileBarChart }
const mobileOpen = ref(false)
function go(screen) {
  mobileOpen.value = false
  if (screen.to) router.push(screen.to)
  else router.push(`/accounting/${screen.key}`)
}
</script>

<template>
  <div>
    <PageHeader :title="t('accounting.title')" :subtitle="t('accounting.subtitle')">
      <template #actions>
        <button type="button" class="hover:bg-accent inline-flex size-9 items-center justify-center rounded-lg border lg:hidden" @click="mobileOpen = !mobileOpen">
          <X v-if="mobileOpen" class="size-4" /><MenuIcon v-else class="size-4" />
        </button>
      </template>
    </PageHeader>

    <div class="grid gap-6 lg:grid-cols-[280px_1fr]">
      <!-- ── sidebar tree ─────────────────────────────────── -->
      <aside :class="cn('no-print lg:block', mobileOpen ? 'block' : 'hidden')">
        <Card class="bg-navy text-navy-foreground sticky top-24 overflow-hidden border-0 p-2">
          <div v-for="section in ACCOUNTING_MENU" :key="section.key" class="mb-1">
            <button
              type="button"
              class="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-bold transition-colors"
              :class="current?.section === section.key ? 'bg-success text-success-foreground' : 'hover:bg-white/10'"
              @click="toggle(openSections, section.key)"
            >
              <component :is="ICONS[section.key]" class="size-4 shrink-0" />
              <span class="flex-1 text-start">{{ t(`accounting.sections.${section.key}`) }}</span>
              <component :is="openSections.has(section.key) ? ChevronUp : ChevronDown" class="size-4 opacity-70" />
            </button>

            <div v-show="openSections.has(section.key)" class="mt-1 space-y-0.5">
              <div v-for="group in section.groups" :key="group.key">
                <button
                  type="button"
                  class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ps-6"
                  :class="current?.group === group.key ? 'text-success' : 'text-white/85 hover:bg-white/10'"
                  @click="toggle(openGroups, group.key)"
                >
                  <span class="flex-1 text-start">{{ t(`accounting.groups.${group.key}`) }}</span>
                  <component :is="openGroups.has(group.key) ? ChevronUp : ChevronDown" class="size-3.5 opacity-70" />
                </button>
                <div v-show="openGroups.has(group.key)" class="space-y-0.5 py-0.5">
                  <button
                    v-for="screen in group.screens"
                    :key="screen.key"
                    type="button"
                    class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ps-9"
                    :class="current?.key === screen.key ? 'bg-white/15 font-semibold text-white' : 'text-white/75 hover:bg-white/10 hover:text-white'"
                    @click="go(screen)"
                  >
                    <span class="flex-1 text-start">{{ t(`accounting.screens.${screen.key}`) }}</span>
                    <ExternalLink v-if="screen.to" class="size-3 opacity-60" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </aside>

      <!-- ── screen ──────────────────────────────────────── -->
      <div class="min-w-0">
        <p class="no-print text-muted-foreground mb-3 text-xs">
          {{ t(`accounting.sections.${current?.section}`) }} / {{ t(`accounting.groups.${current?.group}`) }} / <b class="text-foreground">{{ t(`accounting.screens.${current?.key}`) }}</b>
        </p>
        <component :is="screens[current.component]" v-if="current && screens[current.component]" :key="current.key" />
        <Card v-else class="text-muted-foreground p-10 text-center text-sm">{{ t('common.noData') }}</Card>
      </div>
    </div>
  </div>
</template>
