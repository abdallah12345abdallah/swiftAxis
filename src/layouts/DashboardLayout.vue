<script setup>
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter, useRoute } from 'vue-router'
import {
  LayoutDashboard, Users, ClipboardList, Percent, Wallet, Car,
  FileBarChart, BookOpen, ShoppingCart, ShieldCheck, Settings, FileSignature,
  Landmark, Receipt, Calculator,
  LogOut, ChevronDown, UserCircle, Menu as MenuIcon, X, Languages, Check,
  UserCog, Bike, Warehouse,
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import { NAV_ITEMS, NAV_GROUPS, ROLES, ALL_ROLES } from '@/lib/constants'
import { SUB_SCREENS, isSubActive, subLocation, currentScreen } from '@/lib/subScreens'
import BrandLogo from '@/components/common/BrandLogo.vue'
import Menu from '@/components/common/Menu.vue'
import Avatar from '@/components/common/Avatar.vue'
import RiderCode from '@/components/common/RiderCode.vue'
import { ToastHost } from '@/components/ui/toast'

/* "Glass island" shell: a brand-gradient ground, a floating glass sidebar
   that keeps every link visible (grouped by domain) with the active module's
   sub-screens unfolding inside the island, the language switch beside the
   brand, and the account card with its menu at the foot. The page is a floating sheet whose content
   scrolls. Below lg the island is a drawer behind a slim bar. */

const ICONS = {
  LayoutDashboard, Users, ClipboardList, Percent, Wallet, Car,
  FileBarChart, BookOpen, ShoppingCart, ShieldCheck, Settings, FileSignature,
  Landmark, Receipt, Calculator,
}
const ROLE_ICONS = { [ROLES.MANAGER]: ShieldCheck, [ROLES.SUPERVISOR]: UserCog, [ROLES.ACCOUNTANT]: Calculator, [ROLES.STOREKEEPER]: Warehouse, [ROLES.RIDER]: Bike }

const { t } = useI18n()
const auth = useAuthStore()
const ui = useUiStore()
const router = useRouter()
const route = useRoute()

const allowed = computed(() => NAV_ITEMS.filter((item) => item.roles.includes(auth.role)))
const groups = computed(() =>
  NAV_GROUPS.map((g) => ({ ...g, items: g.items.map((k) => allowed.value.find((i) => i.key === k)).filter(Boolean) })).filter((g) => g.items.length),
)
const isModuleActive = (item) => route.path === item.to || route.path.startsWith(item.to + '/')
const subsOf = (key) => SUB_SCREENS[key]?.items ?? []

/* a module's screens are separate pages, listed under it on every screen size */
const hasScreens = (key) => subsOf(key).length > 0
const defaultTabOf = (key) => SUB_SCREENS[key]?.defaultTab

/* a module with screens is a toggle: clicking it opens or closes its list
   without leaving the page; navigating anywhere folds every list except the
   module you land in */
const expanded = ref(new Set())
const activeKey = computed(() => allowed.value.find(isModuleActive)?.key ?? null)
watch(() => route.fullPath, () => { expanded.value = new Set(activeKey.value ? [activeKey.value] : []) }, { immediate: true })
const isOpen = (key) => expanded.value.has(key)
function toggleModule(key) {
  const s = new Set(expanded.value)
  s.has(key) ? s.delete(key) : s.add(key)
  expanded.value = s
}

const pageTitle = computed(() => {
  const screen = currentScreen(route)
  if (screen) return t(screen.labelKey)
  return route.meta?.titleKey ? t(route.meta.titleKey) : t('nav.dashboard')
})

/* one page instance per screen (/orders and /orders/manual never share state);
   other routes keep their instance while only their params change */
const screenKey = computed(() => `${String(route.name)}:${route.params.tab ?? ''}`)

/* the sheet scrolls, not the window — reset it on navigation */
const drawer = ref(false)
const mainEl = ref(null)
watch(() => route.fullPath, () => {
  drawer.value = false
  mainEl.value?.scrollTo({ top: 0 })
})

/* staggered rise: for a moment after each navigation, whatever the page
   inserts (blocks, cards, table rows as their data lands) rises into place */
const rising = ref(false)
let riseTimer
watch(() => route.fullPath, () => {
  rising.value = true
  clearTimeout(riseTimer)
  riseTimer = setTimeout(() => (rising.value = false), 1800)
}, { immediate: true })
onBeforeUnmount(() => clearTimeout(riseTimer))

/* glass header: pins (frosted + compact, one state) as soon as a long page
   moves, and lets go only back at the very top. The header shrinking takes
   ~45px off the page, so it only pins with room to spare; with the browser's
   scroll anchoring off (see .sheet-main) the scroll position stays put. */
const compact = ref(false)
function onMainScroll(e) {
  const el = e.target
  if (!compact.value && el.scrollTop > 4 && el.scrollHeight - el.clientHeight >= 120) compact.value = true
  else if (compact.value && el.scrollTop <= 1) compact.value = false
}
watch(() => route.fullPath, () => { compact.value = false })

/* a click anywhere outside the island folds the lists opened by hand */
function onOutsideClick(e) {
  if (e.target.closest('aside.island')) return
  expanded.value = new Set(activeKey.value ? [activeKey.value] : [])
}
onMounted(() => document.addEventListener('click', onOutsideClick))
onBeforeUnmount(() => document.removeEventListener('click', onOutsideClick))

function logout() {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <div class="shell h-dvh overflow-hidden">
    <div class="grid h-full grid-rows-[auto_1fr] gap-3 p-3 lg:grid-cols-[296px_1fr] lg:grid-rows-1 lg:gap-4 lg:p-4">
      <!-- ── phone-only bar: brand + drawer button ─────────── -->
      <div class="no-print flex items-center justify-between rounded-xl px-1 lg:hidden">
        <BrandLogo :mark-size="28" tone="light" />
        <div class="flex items-center gap-2 text-white">
          <span class="max-w-[50vw] truncate text-sm font-semibold">{{ pageTitle }}</span>
          <button type="button" class="inline-flex size-9 items-center justify-center rounded-lg border border-white/20 bg-white/10" :aria-label="t('layout.menu')" @click="drawer = true"><MenuIcon class="size-5" /></button>
        </div>
      </div>

      <!-- ── glass island ─────────────────────────────────── -->
      <div v-if="drawer" class="fixed inset-0 z-40 bg-navy/60 backdrop-blur-sm lg:hidden" @click="drawer = false" />
      <aside
        class="island no-print fixed inset-y-3 z-50 flex w-[300px] flex-col rounded-2xl border border-white/15 p-3 text-white/90 shadow-2xl transition-transform duration-300 start-3 lg:sticky lg:inset-auto lg:top-4 lg:z-auto lg:h-[calc(100dvh-2rem)] lg:w-auto lg:translate-x-0"
        :class="drawer ? 'translate-x-0' : '-translate-x-[110%] rtl:translate-x-[110%] lg:translate-x-0 lg:rtl:translate-x-0'"
      >
        <!-- brand -->
        <div class="relative mb-4 flex items-center justify-center px-1 pt-2 pb-1">
          <RouterLink to="/dashboard"><BrandLogo :mark-size="44" word-size="text-2xl" tone="light" animate="loop" /></RouterLink>
          <button type="button" class="hover:bg-white/10 absolute end-0 top-1/2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-lg lg:hidden" :aria-label="t('layout.closeMenu')" @click="drawer = false"><X class="size-4" /></button>
        </div>

        <!-- groups: every link, always visible; the active module unfolds its screens -->
        <nav class="island-nav min-h-0 flex-1 space-y-2 overflow-y-auto">
          <div v-for="g in groups" :key="g.key" :data-tone="g.tone">
            <p class="mb-1 flex items-center gap-1.5 px-2 text-[11px] font-bold tracking-[.12em] text-white/55 uppercase"><span class="tone-dot size-1.5 rounded-full" /> {{ t(`nav.groups.${g.key}`) }}</p>
            <template v-for="item in g.items" :key="item.key">
              <!-- toggle (has screens) -->
              <button
                v-if="hasScreens(item.key)"
                type="button"
                class="island-link relative flex w-full cursor-pointer items-center gap-3 rounded-xl px-2.5 py-2 text-start text-[14.5px] font-semibold text-white/85 transition-colors hover:bg-white/10 hover:text-white"
                :class="[isModuleActive(item) && 'is-active', isOpen(item.key) && !isModuleActive(item) && 'is-open']"
                :aria-expanded="isOpen(item.key)"
                @click="toggleModule(item.key)"
              >
                <span class="ic grid size-8 shrink-0 place-items-center rounded-lg"><component :is="ICONS[item.icon]" class="size-[18px]" /></span>
                <span class="min-w-0 flex-1 truncate">{{ t(`nav.${item.key}`) }}</span>
                <ChevronDown class="chev size-4 shrink-0 transition-transform" :class="isOpen(item.key) && 'rotate-180'" />
              </button>
              <!-- plain link (no screens) -->
              <RouterLink
                v-else
                :to="item.to"
                class="island-link relative flex items-center gap-3 rounded-xl px-2.5 py-2 text-[14.5px] font-semibold text-white/85 transition-colors hover:bg-white/10 hover:text-white"
                :class="isModuleActive(item) && 'is-active'"
              >
                <span class="ic grid size-8 shrink-0 place-items-center rounded-lg"><component :is="ICONS[item.icon]" class="size-[18px]" /></span>
                <span class="min-w-0 flex-1 truncate">{{ t(`nav.${item.key}`) }}</span>
              </RouterLink>

              <!-- the module's screens, as an options panel -->
              <div v-if="hasScreens(item.key) && isOpen(item.key)" class="options mt-1 mb-2 rounded-xl p-1.5 ms-4">
                <template v-for="(sub, i) in subsOf(item.key)" :key="sub.key">
                  <p v-if="sub.group && (i === 0 || subsOf(item.key)[i - 1].group !== sub.group)" class="mt-2 mb-0.5 px-3 text-[11px] font-bold tracking-wide text-white/40 uppercase first:mt-0">{{ t(sub.group) }}</p>
                  <RouterLink
                    :to="subLocation(sub, defaultTabOf(item.key))"
                    class="sub-link flex items-center gap-2.5 rounded-lg px-3 py-2 text-[14px] font-medium text-white/75 transition-colors hover:bg-white/10 hover:text-white"
                    :class="isSubActive(sub, route, defaultTabOf(item.key)) && 'is-active'"
                  >
                    <span class="dot size-2 shrink-0 rounded-full" />
                    <span class="min-w-0 flex-1 truncate">{{ t(sub.labelKey) }}</span>
                  </RouterLink>
                </template>
              </div>
            </template>
          </div>
        </nav>

        <!-- account card + menu -->
        <Menu align="start" side="top" class="mt-3 w-full [&>div:first-child]:w-full" content-class="w-full p-2">
          <template #trigger="{ open }">
            <button type="button" class="account relative flex w-full cursor-pointer items-center gap-3 overflow-hidden rounded-xl border border-white/15 bg-white/10 px-3 py-2.5 text-start text-white transition-colors" :class="open ? 'is-open bg-white/20 ring-2 ring-orange/60' : 'hover:bg-white/15'">
              <span class="acct-sheen" aria-hidden="true" />
              <span class="acct-av relative shrink-0">
                <Avatar :initials="auth.initials" class="bg-orange relative size-10 text-sm text-white" />
                <span class="acct-dot" aria-hidden="true" />
              </span>
              <span class="min-w-0 flex-1">
                <span class="block truncate text-[14px] font-bold">{{ auth.user?.name }}</span>
                <span class="flex items-center gap-1.5 text-[11.5px] text-white/65">
                  <component :is="ROLE_ICONS[auth.role]" class="size-3.5" /> {{ t(`roles.${auth.role}`) }}
                  <RiderCode v-if="auth.user?.riderId" :code="auth.user.riderId" />
                </span>
              </span>
              <span class="grid size-7 shrink-0 place-items-center rounded-lg bg-white/12 text-white/80"><ChevronDown class="acct-chev size-4 transition-transform" :class="open ? 'rotate-180' : ''" /></span>
            </button>
          </template>

          <!-- menu header -->
          <div class="from-primary/12 mb-1 flex items-center gap-3 rounded-lg bg-gradient-to-br to-transparent p-3">
            <div class="from-brand to-orange grid size-11 shrink-0 place-items-center rounded-full bg-gradient-to-br text-base font-bold text-white">{{ auth.initials }}</div>
            <div class="min-w-0">
              <p class="truncate text-sm font-semibold">{{ auth.user?.name }}</p>
              <p class="text-muted-foreground flex items-center gap-1 text-xs"><component :is="ROLE_ICONS[auth.role]" class="size-3" /> {{ t(`roles.${auth.role}`) }}</p>
            </div>
          </div>
          <RouterLink to="/profile" class="menu-item"><UserCircle class="text-muted-foreground size-4" /> {{ t('common.profile') }}</RouterLink>
          <RouterLink v-if="auth.role === ROLES.MANAGER" to="/settings" class="menu-item"><Settings class="text-muted-foreground size-4" /> {{ t('nav.settings') }}</RouterLink>
          <!-- language: switches in place, the menu stays open -->
          <button type="button" class="menu-item w-full" @click.stop="ui.toggleLocale()">
            <Languages class="text-muted-foreground size-4" />
            <span class="flex-1 text-start">{{ t('layout.language') }}</span>
            <span class="bg-muted text-muted-foreground rounded-md px-1.5 py-0.5 text-[11px] font-bold">{{ ui.locale === 'ar' ? 'English' : 'العربية' }}</span>
          </button>

          <!-- demo role switcher -->
          <div class="bg-border/70 -mx-1 my-1.5 h-px" />
          <p class="text-muted-foreground px-2.5 pb-1 text-[11px] font-semibold tracking-wide">{{ t('layout.switchRole') }}</p>
          <button
            v-for="r in ALL_ROLES"
            :key="r"
            type="button"
            class="menu-item w-full"
            :class="auth.role === r ? 'bg-primary/10 text-primary font-medium' : ''"
            @click.stop="auth.switchRole(r)"
          >
            <component :is="ROLE_ICONS[r]" class="size-4" :class="auth.role === r ? 'text-primary' : 'text-muted-foreground'" />
            <span class="flex-1 text-start">{{ t(`roles.${r}`) }}</span>
            <Check v-if="auth.role === r" class="text-primary size-4" />
          </button>

          <div class="bg-border/70 -mx-1 my-1.5 h-px" />
          <button type="button" class="menu-item text-danger hover:!bg-danger/10 w-full" @click="logout"><LogOut class="size-4" /> {{ t('common.logout') }}</button>
        </Menu>
      </aside>

      <!-- ── floating sheet: the page, scrolling inside ───── -->
      <div class="relative min-h-0 min-w-0">
        <!-- a small stack of pages behind the sheet; it shifts when a new page is laid on top -->
        <span :key="'g2-' + route.path" class="sheet-ghost g2 hidden lg:block" aria-hidden="true" />
        <span :key="'g1-' + route.path" class="sheet-ghost g1 hidden lg:block" aria-hidden="true" />
        <div class="sheet bg-background text-foreground relative flex h-full min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl shadow-2xl">
          <main
            ref="mainEl"
            class="sheet-main min-h-0 flex-1 overflow-y-auto"
            :class="rising && 'page-rise'"
            :data-compact="compact || undefined"
            @scroll.passive="onMainScroll"
          >
            <!-- each screen of a module is its own page: switching screens mounts a
                 fresh page, so filters and state never carry over between them -->
            <RouterView v-slot="{ Component }">
              <component :is="Component" :key="screenKey" />
            </RouterView>
          </main>
        </div>
      </div>
    </div>

    <ToastHost />
  </div>
</template>

<style scoped>
/* the brand ground — navy into brand blue, every color a token */
.shell {
  background:
    radial-gradient(1200px 600px at 100% -10%, color-mix(in oklch, var(--brand) 55%, transparent), transparent 60%),
    radial-gradient(900px 500px at -10% 110%, color-mix(in oklch, var(--orange) 28%, transparent), transparent 60%),
    linear-gradient(160deg, var(--navy) 0%, color-mix(in oklch, var(--navy) 55%, var(--brand)) 100%);
}
.island {
  background:
    radial-gradient(110% 30% at 50% 100%, color-mix(in oklch, var(--orange) 14%, transparent), transparent 70%),
    linear-gradient(170deg, color-mix(in oklch, var(--navy) 70%, var(--brand)) 0%, var(--navy) 62%, color-mix(in oklch, var(--navy) 90%, var(--orange)) 100%);
  border-color: transparent;
  isolation: isolate; /* keeps the glow layer (z-index -1) inside the island */
}
/* a thin border with a bright light that travels around the island,
   plus a blurred copy underneath so the light glows */
@property --sweep { syntax: '<angle>'; inherits: false; initial-value: 0deg; }
.island::before,
.island::after {
  content: ''; position: absolute; inset: -1.5px; border-radius: inherit; pointer-events: none;
  background: conic-gradient(from var(--sweep),
    color-mix(in oklch, white 14%, transparent) 0deg,
    color-mix(in oklch, white 14%, transparent) 200deg,
    color-mix(in oklch, var(--orange) 30%, transparent) 250deg,
    color-mix(in oklch, var(--orange) 55%, transparent) 290deg,
    color-mix(in oklch, white 55%, transparent) 318deg,
    color-mix(in oklch, var(--brand) 45%, transparent) 335deg,
    color-mix(in oklch, white 14%, transparent) 360deg);
  animation: sweep 4s linear infinite;
}
.island::before {
  padding: 1.5px;
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor; mask-composite: exclude;
  z-index: 1;
}
.island::after {
  padding: 3px; filter: blur(8px); opacity: 0.4; z-index: -1;
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor; mask-composite: exclude;
}
@keyframes sweep { to { --sweep: 360deg; } }
/* reduced motion: keep the light but let it drift slowly */
@media (prefers-reduced-motion: reduce) { .island::before, .island::after { animation-duration: 16s; } }
/* the stack behind the sheet: two paler pages peeking out toward the outer
   edge and the bottom; they shuffle when a new page is laid on top */
.sheet-ghost { position: absolute; border-radius: 1rem; pointer-events: none; --out: 1; animation: ghost-shuffle 0.8s cubic-bezier(0.2, 0.8, 0.2, 1); }
[dir='rtl'] .sheet-ghost { --out: -1; }
.sheet-ghost.g1 { inset-block: 7px -7px; inset-inline: 7px -7px; background: color-mix(in srgb, var(--background) 55%, transparent); }
.sheet-ghost.g2 { inset-block: 14px -14px; inset-inline: 14px -14px; background: color-mix(in srgb, var(--background) 25%, transparent); animation-delay: 80ms; }
@keyframes ghost-shuffle { 40% { transform: translate(calc(var(--out) * 8px), 5px); } }
@media (prefers-reduced-motion: reduce) { .sheet-ghost { animation: none; } }
/* account card: a slow orange ring turns around the avatar, a green "online"
   dot breathes, a soft light sweeps across the card every few seconds, and
   on hover the card lifts a little while the arrow nudges */
.account { transition: background-color 0.2s, transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.25s; }
.account:hover { transform: translateY(-2px); box-shadow: 0 12px 24px -16px color-mix(in oklch, var(--orange) 70%, black); }
.acct-av::before {
  content: ''; position: absolute; inset: -3px; border-radius: 9999px;
  background: conic-gradient(from var(--acct-spin, 0deg), var(--orange), transparent 35%, color-mix(in oklch, var(--orange) 40%, white) 60%, transparent 80%, var(--orange));
  -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 2px));
  mask: radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 2px));
  animation: acct-spin 5s linear infinite;
}
@property --acct-spin { syntax: '<angle>'; inherits: false; initial-value: 0deg; }
@keyframes acct-spin { to { --acct-spin: 360deg; } }
.acct-dot {
  position: absolute; bottom: -1px; inset-inline-end: -1px; width: 11px; height: 11px; border-radius: 9999px;
  background: var(--success); box-shadow: 0 0 0 2px var(--navy);
}
.acct-dot::after { content: ''; position: absolute; inset: 0; border-radius: inherit; background: var(--success); animation: acct-pulse 2.2s ease-out infinite; }
@keyframes acct-pulse { from { transform: scale(1); opacity: 0.7; } to { transform: scale(2.4); opacity: 0; } }
.acct-sheen {
  position: absolute; inset-block: 0; width: 45%; inset-inline-start: -60%; pointer-events: none;
  background: linear-gradient(100deg, transparent, color-mix(in oklch, white 16%, transparent), transparent);
  animation: acct-sheen 6s ease-in-out infinite;
}
@keyframes acct-sheen { 0%, 70% { inset-inline-start: -60%; } 100% { inset-inline-start: 120%; } }
.account:hover .acct-chev:not(.rotate-180) { animation: acct-nudge 0.9s ease-in-out infinite; }
@keyframes acct-nudge { 0%, 100% { translate: 0 0; } 50% { translate: 0 2px; } }
@media (prefers-reduced-motion: reduce) {
  .acct-av::before, .acct-dot::after, .acct-sheen, .account:hover .acct-chev { animation: none; }
  .account:hover { transform: none; }
}
/* printing needs the natural page flow back */
@media print {
  .shell { height: auto; overflow: visible; }
  .sheet, .sheet main { overflow: visible; }
  .sheet-ghost { display: none !important; }
}
/* domain color as a dot in the group label, from the group's tone token */
[data-tone='primary'] { --tone: var(--primary); }
[data-tone='orange'] { --tone: var(--orange); }
[data-tone='success'] { --tone: var(--success); }
[data-tone='muted'] { --tone: color-mix(in oklch, white 45%, transparent); }
.tone-dot { background: var(--orange); box-shadow: 0 0 0 3px color-mix(in oklch, var(--orange) 28%, transparent); }
/* icon box on every module link; the selected module is a solid brand-blue
   pill with an orange marker on its start edge, the selected sub-screen a
   white pill — both unmistakable on the glass */
.island-link .ic { background: color-mix(in oklch, white 10%, transparent); color: color-mix(in oklch, white 85%, transparent); transition: background-color 0.15s; }
.island-link:hover .ic { background: color-mix(in oklch, white 18%, transparent); color: white; }
.island-link.is-active { background: linear-gradient(90deg, var(--orange), color-mix(in oklch, var(--orange) 80%, white)); color: white; font-weight: 800; box-shadow: 0 10px 24px -12px color-mix(in oklch, var(--orange) 85%, black); }
.island-link.is-active .ic { background: color-mix(in oklch, white 22%, transparent); color: white; }
.island-link.is-active::before { content: ''; position: absolute; inset-inline-start: 0; top: 22%; bottom: 22%; width: 4px; border-radius: 0 4px 4px 0; background: white; }
[dir='rtl'] .island-link.is-active::before { border-radius: 4px 0 0 4px; }
/* a toggle that is open but not the current module */
.island-link.is-open { background: color-mix(in oklch, white 10%, transparent); color: white; }
/* the options panel: a darker well inside the island; each option has a dot,
   the active one turns orange while the parent pill keeps its blue */
.options { background: color-mix(in oklch, black 22%, transparent); }
.sub-link .dot { background: color-mix(in oklch, white 30%, transparent); transition: background-color 0.15s, box-shadow 0.15s; }
.sub-link:hover .dot { background: color-mix(in oklch, white 60%, transparent); }
.sub-link.is-active { color: color-mix(in oklch, var(--orange) 45%, white); font-weight: 700; background: color-mix(in oklch, white 10%, transparent); }
.sub-link.is-active .dot { background: color-mix(in oklch, var(--orange) 45%, white); box-shadow: 0 0 0 3px color-mix(in oklch, var(--orange) 35%, transparent); }
.chev { color: color-mix(in oklch, white 55%, transparent); }
.island-link.is-active .chev { color: white; }
/* the list scrolls with the wheel or a swipe; no scrollbar is drawn */
.island-nav { scrollbar-width: none; }
.island-nav::-webkit-scrollbar { display: none; }
/* language switch beside the brand */
.menu-item { display: flex; align-items: center; gap: 0.625rem; border-radius: var(--radius-md); padding: 0.5rem 0.625rem; font-size: 0.875rem; transition: background-color 0.15s ease; }
.menu-item:hover { background: var(--accent); }
</style>
