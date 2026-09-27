<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import {
  LayoutDashboard, Users, ClipboardList, Percent, Wallet, Car,
  FileBarChart, BookOpen, ShoppingCart, ShieldCheck, Settings, FileSignature,
  Landmark, Receipt, Calculator, ChevronDown,
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { NAV_ITEMS, NAV_GROUPS } from '@/lib/constants'
import { isSubActive, subLocation, allowedScreens, SUB_SCREENS } from '@/lib/subScreens'

/* The phone menu, as it reads inside the bottom sheet (see DashboardLayout).
   Each domain is one card of links separated by hairlines, the way a phone's
   own settings read — lighter and far denser than the rail's loose list, and
   the icon chips carry their group's colour so a domain is recognisable
   before the label is read.

   A module that owns screens opens them in place, threaded under its own
   icon, so the module you are looking at never leaves the screen. One is open
   at a time, and landing anywhere opens wherever you landed. */

const ICONS = {
  LayoutDashboard, Users, ClipboardList, Percent, Wallet, Car,
  FileBarChart, BookOpen, ShoppingCart, ShieldCheck, Settings, FileSignature,
  Landmark, Receipt, Calculator,
}

const { t } = useI18n()
const route = useRoute()
const auth = useAuthStore()

const allowed = computed(() => NAV_ITEMS.filter((item) => item.roles.includes(auth.role)))
const groups = computed(() =>
  NAV_GROUPS.map((g) => ({ ...g, items: g.items.map((k) => allowed.value.find((i) => i.key === k)).filter(Boolean) })).filter((g) => g.items.length),
)
const isModuleActive = (item) => route.path === item.to || route.path.startsWith(item.to + '/')
const screensOf = (key) => allowedScreens(key, auth.role)
const defaultTabOf = (key) => SUB_SCREENS[key]?.defaultTab
/* a screen's group heading shows once, above the first screen that carries it */
const startsGroup = (list, i) => list[i].group && (i === 0 || list[i - 1].group !== list[i].group)

const activeWithScreens = computed(() => allowed.value.find((i) => isModuleActive(i) && screensOf(i.key).length)?.key ?? null)
const openKey = ref(activeWithScreens.value)
const isOpen = (key) => openKey.value === key
const toggle = (key) => (openKey.value = openKey.value === key ? null : key)

watch(() => route.fullPath, () => (openKey.value = activeWithScreens.value))
</script>

<template>
  <nav class="nav-body min-h-0 flex-1 overflow-y-auto">
    <section v-for="g in groups" :key="g.key" :data-tone="g.tone" class="mb-4 last:mb-1">
      <p class="nav-group">
        <span class="tone-dot" /> {{ t(`nav.groups.${g.key}`) }}
      </p>

      <div class="nav-card">
        <template v-for="item in g.items" :key="item.key">
          <!-- a module that owns screens opens them just below -->
          <button
            v-if="screensOf(item.key).length"
            type="button"
            class="nav-link"
            :class="isModuleActive(item) && 'is-active'"
            :aria-expanded="isOpen(item.key)"
            @click="toggle(item.key)"
          >
            <span class="nav-ic"><component :is="ICONS[item.icon]" class="size-[18px]" /></span>
            <span class="nav-label">{{ t(`nav.${item.key}`) }}</span>
            <span class="nav-count">{{ screensOf(item.key).length }}</span>
            <ChevronDown class="nav-chev" :class="isOpen(item.key) && 'is-open'" />
          </button>

          <RouterLink v-else :to="item.to" class="nav-link" :class="isModuleActive(item) && 'is-active'">
            <span class="nav-ic"><component :is="ICONS[item.icon]" class="size-[18px]" /></span>
            <span class="nav-label">{{ t(`nav.${item.key}`) }}</span>
          </RouterLink>

          <!-- its screens, threaded under its icon -->
          <Transition name="nav-exp">
            <div v-if="isOpen(item.key)" class="nav-exp">
              <div class="min-h-0 overflow-hidden">
                <div class="nav-subs">
                  <template v-for="(sub, si) in screensOf(item.key)" :key="sub.key">
                    <p v-if="startsGroup(screensOf(item.key), si)" class="nav-subgroup">{{ t(sub.group) }}</p>
                    <RouterLink
                      :to="subLocation(sub, defaultTabOf(item.key))"
                      class="nav-sub"
                      :class="isSubActive(sub, route, defaultTabOf(item.key)) && 'is-active'"
                    >
                      <span class="nav-dot" />
                      <span class="min-w-0 flex-1 truncate">{{ t(sub.labelKey) }}</span>
                    </RouterLink>
                  </template>
                </div>
              </div>
            </div>
          </Transition>
        </template>
      </div>
    </section>
  </nav>
</template>

<style scoped>
/* the list scrolls with a swipe; no scrollbar is drawn */
.nav-body { scrollbar-width: none; }
.nav-body::-webkit-scrollbar { display: none; }

/* ── a domain, and its card of links ─────────────────────────────── */
.nav-group {
  display: flex; align-items: center; gap: 0.4rem;
  margin: 0 0 0.5rem; padding-inline: 0.35rem;
  font-size: 10.5px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase;
  color: color-mix(in oklch, white 50%, transparent);
}
.tone-dot {
  width: 0.375rem; height: 0.375rem; border-radius: 999px;
  background: var(--tone, var(--primary));
  box-shadow: 0 0 0 3px color-mix(in oklch, var(--tone, var(--primary)) 28%, transparent);
}
.nav-card {
  border-radius: 1rem; overflow: hidden;
  background: color-mix(in oklch, white 6%, transparent);
  box-shadow: inset 0 0 0 1px color-mix(in oklch, white 10%, transparent);
}

/* ── one module ──────────────────────────────────────────────────── */
.nav-link {
  display: flex; width: 100%; align-items: center; gap: 0.7rem;
  min-height: 3.25rem; padding-inline: 0.75rem;
  text-align: start; cursor: pointer;
  color: color-mix(in oklch, white 86%, transparent);
  transition: background-color 0.15s, color 0.15s;
}
.nav-link:hover { background: color-mix(in oklch, white 7%, transparent); color: white; }
/* a hairline between links, but never between a link and its own screens */
.nav-link + .nav-link, .nav-exp + .nav-link { box-shadow: inset 0 1px 0 color-mix(in oklch, white 9%, transparent); }
.nav-ic {
  display: grid; place-items: center; flex-shrink: 0;
  width: 2rem; height: 2rem; border-radius: 0.6rem;
  background: color-mix(in oklch, var(--tone, var(--primary)) 24%, transparent);
  color: color-mix(in oklch, white 92%, transparent);
  transition: background-color 0.15s;
}
.nav-label { min-width: 0; flex: 1; font-size: 14px; font-weight: 700; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.nav-count {
  flex-shrink: 0; font-size: 10.5px; font-weight: 800; font-variant-numeric: tabular-nums;
  color: color-mix(in oklch, white 42%, transparent);
}
.nav-chev { flex-shrink: 0; width: 1rem; height: 1rem; color: color-mix(in oklch, white 45%, transparent); transition: rotate 0.25s ease; }
.nav-chev.is-open { rotate: 180deg; }
/* the module you are in: the same orange pill the rail uses */
.nav-link.is-active {
  background: linear-gradient(90deg, var(--primary), color-mix(in oklch, var(--primary) 80%, white));
  color: white; font-weight: 800;
}
.nav-link.is-active .nav-ic { background: color-mix(in oklch, white 24%, transparent); color: white; }
.nav-link.is-active .nav-chev, .nav-link.is-active .nav-count { color: color-mix(in oklch, white 78%, transparent); }

/* ── its screens, threaded under its icon ────────────────────────── */
.nav-exp { display: grid; grid-template-rows: 1fr; }
.nav-subs { position: relative; padding-block: 0.35rem 0.5rem; background: color-mix(in oklch, black 22%, transparent); }
.nav-subs::before {
  content: ''; position: absolute; inset-block: 0.55rem; inset-inline-start: 1.75rem; width: 1px;
  background: color-mix(in oklch, white 15%, transparent);
}
.nav-sub {
  position: relative; display: flex; align-items: center; gap: 0.65rem;
  min-height: 2.6rem; padding-inline: 1.5rem 0.75rem;
  font-size: 13px; font-weight: 600;
  color: color-mix(in oklch, white 72%, transparent);
  transition: background-color 0.15s, color 0.15s;
}
.nav-sub:hover { background: color-mix(in oklch, white 6%, transparent); color: white; }
.nav-dot {
  width: 0.5rem; height: 0.5rem; border-radius: 999px; flex-shrink: 0;
  background: color-mix(in oklch, white 30%, transparent);
  /* the ring hides the thread behind the dot, so it reads as a node on it */
  box-shadow: 0 0 0 3px color-mix(in oklch, var(--navy) 92%, black);
  transition: background-color 0.15s, box-shadow 0.15s;
}
.nav-sub.is-active { color: color-mix(in oklch, var(--primary) 50%, white); font-weight: 800; }
.nav-sub.is-active .nav-dot { background: var(--primary); box-shadow: 0 0 0 3px color-mix(in oklch, var(--primary) 32%, transparent); }
.nav-subgroup {
  margin: 0.55rem 0 0.1rem; padding-inline: 1.5rem 0.75rem;
  font-size: 10px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase;
  color: color-mix(in oklch, white 38%, transparent);
}

.nav-exp-enter-active, .nav-exp-leave-active { transition: grid-template-rows 0.28s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.2s ease; }
.nav-exp-enter-from, .nav-exp-leave-to { grid-template-rows: 0fr; opacity: 0; }

/* the group's domain colour, carried by its dot and its icon chips */
[data-tone='primary'] { --tone: var(--primary); }
[data-tone='orange'] { --tone: var(--orange); }
[data-tone='success'] { --tone: var(--success); }
[data-tone='muted'] { --tone: color-mix(in oklch, white 45%, transparent); }

@media (prefers-reduced-motion: reduce) {
  .nav-link, .nav-sub, .nav-dot, .nav-ic, .nav-chev,
  .nav-exp-enter-active, .nav-exp-leave-active { transition: none !important; }
}
</style>
