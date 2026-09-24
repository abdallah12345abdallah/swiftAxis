<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  LayoutDashboard, Users, ClipboardList, Percent, Wallet, Car,
  FileBarChart, BookOpen, ShoppingCart, ShieldCheck, Settings, FileSignature,
  Landmark, Receipt, Calculator, UserCog, Bike, Warehouse,
  Check, Minus, Crosshair, ArrowUpLeft, ArrowUpRight, LayoutGrid, Gauge,
} from 'lucide-vue-next'
import MetricTile from '@/components/common/MetricTile.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import FilterBar from '@/components/common/FilterBar.vue'
import Avatar from '@/components/common/Avatar.vue'
import { Skeleton } from '@/components/ui/skeleton'
import { NAV_ITEMS, NAV_GROUPS, ROLES, ALL_ROLES } from '@/lib/constants'
import { useCurrency } from '@/composables/useCurrency'

/* The roles screen: key figures, one card per role (who holds it and how much
   of the app it opens), then the access matrix — modules as rows grouped by
   domain, roles as columns. Everything is read from NAV_ITEMS, the single
   source the sidebar and router guard also use; nothing here changes it. */
const props = defineProps({
  users: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})
const emit = defineEmits(['view-users'])
const { t, locale } = useI18n()
const { num } = useCurrency()
const pct = (v) => `${num(v)}%`

const NAV_ICONS = {
  LayoutDashboard, Users, ClipboardList, Percent, Wallet, Car,
  FileBarChart, BookOpen, ShoppingCart, ShieldCheck, Settings, FileSignature,
  Landmark, Receipt, Calculator,
}
const ROLE_ICONS = { [ROLES.MANAGER]: ShieldCheck, [ROLES.SUPERVISOR]: UserCog, [ROLES.ACCOUNTANT]: Calculator, [ROLES.STOREKEEPER]: Warehouse, [ROLES.RIDER]: Bike }
const ROLE_TONES = { [ROLES.MANAGER]: 'primary', [ROLES.SUPERVISOR]: 'brand', [ROLES.ACCOUNTANT]: 'success', [ROLES.STOREKEEPER]: 'warning', [ROLES.RIDER]: 'navy' }
const TONE_VAR = { primary: 'var(--primary)', brand: 'var(--brand)', success: 'var(--success)', warning: 'var(--warning)', navy: 'var(--navy)', muted: 'var(--muted-foreground)', orange: 'var(--orange)' }
const toneOf = (r) => TONE_VAR[ROLE_TONES[r]] ?? TONE_VAR.primary
const ArrowGo = computed(() => (locale.value === 'ar' ? ArrowUpLeft : ArrowUpRight))

const totalScreens = NAV_ITEMS.length
const allowedOf = (r) => NAV_ITEMS.filter((i) => i.roles.includes(r)).length

/* ── role cards ── */
const roleCards = computed(() =>
  ALL_ROLES.map((r) => {
    const members = props.users.filter((u) => u.role === r)
    const allowed = allowedOf(r)
    return {
      role: r,
      icon: ROLE_ICONS[r] ?? ShieldCheck,
      tone: toneOf(r),
      members,
      shown: members.slice(0, 4),
      extra: Math.max(0, members.length - 4),
      allowed,
      coverage: totalScreens ? Math.round((allowed / totalScreens) * 100) : 0,
      full: allowed === totalScreens,
    }
  }),
)

/* ── figures ── */
const stats = computed(() => {
  const granted = NAV_ITEMS.reduce((s, i) => s + i.roles.length, 0)
  const cells = totalScreens * ALL_ROLES.length
  return {
    roles: ALL_ROLES.length,
    full: roleCards.value.filter((c) => c.full).length,
    users: props.users.length,
    active: props.users.filter((u) => u.active !== false).length,
    screens: totalScreens,
    groups: NAV_GROUPS.length,
    granted,
    cells,
    coverage: cells ? Math.round((granted / cells) * 100) : 0,
  }
})

/* ── matrix ── */
const query = ref('')
const focusRole = ref('') // '' = all roles
const hoverRole = ref('')
const toggleFocus = (r) => (focusRole.value = focusRole.value === r ? '' : r)

const rolePills = computed(() => [
  { value: '', label: t('users.rolesTab.allRoles'), count: totalScreens },
  ...ALL_ROLES.map((r) => ({ value: r, label: t(`roles.${r}`), count: allowedOf(r), tone: toneOf(r) })),
])

const groupedRows = computed(() => {
  const q = query.value.trim().toLowerCase()
  const match = (i) => !q || t(`nav.${i.key}`).toLowerCase().includes(q) || i.key.includes(q)
  const byKey = Object.fromEntries(NAV_ITEMS.map((i) => [i.key, i]))
  const seen = new Set()
  const groups = NAV_GROUPS.map((g) => {
    g.items.forEach((k) => seen.add(k))
    return { key: g.key, tone: TONE_VAR[g.tone] ?? TONE_VAR.muted, items: g.items.map((k) => byKey[k]).filter((i) => i && match(i)) }
  })
  // any nav item not placed in a group still shows, in its own block
  const rest = NAV_ITEMS.filter((i) => !seen.has(i.key) && match(i))
  if (rest.length) groups.push({ key: '', tone: TONE_VAR.muted, items: rest })
  return groups.filter((g) => g.items.length)
})
const hasRows = computed(() => groupedRows.value.some((g) => g.items.length))

const colClass = (r) => ({
  'is-focus': focusRole.value === r,
  'is-dim': !!focusRole.value && focusRole.value !== r,
  'is-col-hover': hoverRole.value === r,
})
</script>

<template>
  <div class="space-y-6">
    <!-- key figures -->
    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricTile :label="t('users.rolesTab.stats.roles')" :value="stats.roles" :format="num" :icon="ShieldCheck" tone="primary" :hint="t('users.rolesTab.fullAccess', { n: num(stats.full) })" />
      <MetricTile :label="t('users.rolesTab.stats.users')" :value="stats.users" :format="num" :icon="Users" tone="brand" :hint="t('users.rolesTab.activeUsers', { n: num(stats.active) })" />
      <MetricTile :label="t('users.rolesTab.stats.screens')" :value="stats.screens" :format="num" :icon="LayoutGrid" tone="success" :hint="t('users.rolesTab.groups', { n: num(stats.groups) })" />
      <MetricTile
        :label="t('users.rolesTab.stats.coverage')" :value="stats.coverage" :format="pct" :icon="Gauge" tone="orange"
        :progress="stats.coverage" :hint="t('users.rolesTab.coverageHint', { granted: num(stats.granted), total: num(stats.cells) })"
      />
    </div>

    <!-- roles -->
    <section>
      <div class="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 class="text-base font-bold">{{ t('users.rolesTab.rolesTitle') }}</h2>
          <p class="text-muted-foreground text-xs">{{ t('users.rolesTab.rolesHint') }}</p>
        </div>
      </div>
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
        <article
          v-for="c in roleCards"
          :key="c.role"
          class="ur-card bg-card relative flex flex-col rounded-2xl border p-4"
          :class="focusRole === c.role && 'is-on'"
          :style="{ '--tone': c.tone }"
          @click="toggleFocus(c.role)"
        >
          <div class="flex items-start gap-3">
            <span class="ur-icon grid size-11 shrink-0 place-items-center rounded-xl"><component :is="c.icon" class="size-5" /></span>
            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-center gap-1.5">
                <h3 class="truncate text-[15px] font-bold">{{ t(`roles.${c.role}`) }}</h3>
                <span v-if="c.full" class="ur-full">{{ t('users.rolesTab.fullBadge') }}</span>
              </div>
              <p class="text-muted-foreground mt-0.5 line-clamp-2 text-xs leading-relaxed">{{ t(`users.rolesTab.desc.${c.role}`) }}</p>
            </div>
            <button
              type="button"
              class="ur-focus grid size-8 shrink-0 place-items-center rounded-lg"
              :aria-pressed="focusRole === c.role"
              :aria-label="t('users.rolesTab.focus')"
              :title="t('users.rolesTab.focus')"
              @click.stop="toggleFocus(c.role)"
            >
              <Crosshair class="size-4" />
            </button>
          </div>

          <!-- coverage -->
          <div class="mt-4">
            <div class="flex items-center justify-between text-xs">
              <span class="text-muted-foreground font-semibold">{{ t('users.rolesTab.access') }}</span>
              <span class="font-bold tabular-nums">{{ t('users.rolesTab.screensOf', { n: num(c.allowed), total: num(totalScreens) }) }}</span>
            </div>
            <div class="ur-bar mt-1.5"><i :style="{ width: `${c.coverage}%` }" /></div>
          </div>

          <!-- members -->
          <div class="ur-foot mt-4 flex items-center justify-between gap-2 border-t pt-3">
            <Skeleton v-if="loading" class="h-7 w-24 rounded-full" />
            <div v-else-if="c.members.length" class="flex min-w-0 items-center gap-2">
              <div class="flex items-center">
                <Avatar v-for="u in c.shown" :key="u.id" :initials="u.name.charAt(0)" :title="u.name" class="ur-av size-7 text-[11px]" />
                <span v-if="c.extra" class="ur-av ur-more grid size-7 place-items-center rounded-full text-[10.5px] font-bold tabular-nums">+{{ num(c.extra) }}</span>
              </div>
              <span class="text-muted-foreground truncate text-xs">{{ t('users.rolesTab.members') }} · <b class="text-foreground tabular-nums">{{ num(c.members.length) }}</b></span>
            </div>
            <span v-else class="text-muted-foreground text-xs">{{ t('users.rolesTab.noMembers') }}</span>
            <button
              v-if="!loading && c.members.length"
              type="button"
              class="ur-link inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold"
              @click.stop="emit('view-users', c.role)"
            >
              {{ t('users.rolesTab.viewUsers') }} <component :is="ArrowGo" class="size-3.5" />
            </button>
          </div>
        </article>
      </div>
    </section>

    <!-- access matrix -->
    <section class="space-y-3">
      <div>
        <h2 class="text-base font-bold">{{ t('users.rolesTab.matrixTitle') }}</h2>
        <p class="text-muted-foreground text-xs">{{ t('users.matrix.hint') }}</p>
      </div>

      <FilterBar v-model:search="query" :search-placeholder="t('users.rolesTab.searchPh')" />

      <div class="ur-pills" role="tablist">
        <button
          v-for="p in rolePills"
          :key="p.value || 'all'"
          type="button"
          role="tab"
          class="ur-pill"
          :class="focusRole === p.value && 'is-on'"
          :aria-selected="focusRole === p.value"
          @click="focusRole = p.value"
        >
          <i v-if="p.value" class="ur-dot" :style="{ background: p.tone }" />
          {{ p.label }}
          <span class="ur-count">{{ num(p.count) }}</span>
        </button>
        <span class="ur-legend text-muted-foreground ms-auto hidden items-center gap-3 text-xs sm:inline-flex">
          <span class="inline-flex items-center gap-1.5"><span class="ur-yes is-sm"><Check class="size-3" :stroke-width="3" /></span>{{ t('users.rolesTab.allowed') }}</span>
          <span class="inline-flex items-center gap-1.5"><span class="ur-no is-sm"><Minus class="size-3" /></span>{{ t('users.rolesTab.denied') }}</span>
        </span>
      </div>

      <div v-if="!hasRows" class="bg-card rounded-2xl border"><EmptyState :title="t('users.rolesTab.noMatch')" /></div>

      <div v-else class="soft-table ur-mx" @mouseleave="hoverRole = ''">
        <table class="w-full text-sm">
          <thead>
            <tr>
              <th class="ur-corner px-4 text-start font-medium">{{ t('users.matrix.page') }}</th>
              <th
                v-for="r in ALL_ROLES"
                :key="r"
                class="ur-th px-3 text-center font-medium"
                :class="colClass(r)"
                :style="{ '--tone': toneOf(r) }"
                @mouseenter="hoverRole = r"
              >
                <button type="button" class="ur-th-btn" :aria-pressed="focusRole === r" @click="toggleFocus(r)">
                  <component :is="ROLE_ICONS[r] ?? ShieldCheck" class="size-4" />
                  <span>{{ t(`roles.${r}`) }}</span>
                </button>
              </th>
            </tr>
          </thead>
          <tbody v-for="g in groupedRows" :key="g.key || 'rest'">
            <tr v-if="g.key" class="ur-group">
              <td :colspan="ALL_ROLES.length + 1">
                <span class="ur-group-name"><i class="ur-dot" :style="{ background: g.tone }" />{{ t(`nav.groups.${g.key}`) }}</span>
              </td>
            </tr>
            <tr v-for="m in g.items" :key="m.key">
              <td class="ur-mod px-4 py-2.5">
                <div class="flex items-center gap-2.5">
                  <span class="ur-mod-icon grid size-8 shrink-0 place-items-center rounded-lg" :style="{ '--tone': g.tone }">
                    <component :is="NAV_ICONS[m.icon] ?? LayoutGrid" class="size-4" />
                  </span>
                  <span class="min-w-0 truncate font-semibold">{{ t(`nav.${m.key}`) }}</span>
                  <span class="ur-mod-n ms-auto tabular-nums" :title="t('users.rolesTab.rolesAllowed')">{{ num(m.roles.length) }}/{{ num(ALL_ROLES.length) }}</span>
                </div>
              </td>
              <td
                v-for="r in ALL_ROLES"
                :key="r"
                class="ur-cell px-3 py-2.5 text-center"
                :class="colClass(r)"
                :style="{ '--tone': toneOf(r) }"
                @mouseenter="hoverRole = r"
              >
                <span v-if="m.roles.includes(r)" class="ur-yes" :aria-label="t('users.rolesTab.allowed')"><Check class="size-3.5" :stroke-width="3" /></span>
                <span v-else class="ur-no" :aria-label="t('users.rolesTab.denied')"><Minus class="size-3.5" /></span>
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td class="ur-mod px-4 py-2.5 text-xs">{{ t('users.rolesTab.total') }}</td>
              <td v-for="r in ALL_ROLES" :key="r" class="ur-cell px-3 py-2.5 text-center text-xs tabular-nums" :class="colClass(r)" :style="{ '--tone': toneOf(r) }">
                {{ num(allowedOf(r)) }}/{{ num(totalScreens) }}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* ── role cards ── */
.ur-card {
  cursor: pointer;
  border-color: color-mix(in srgb, var(--border) 70%, transparent);
  transition: border-color 0.2s, background-color 0.2s, transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.ur-card:hover { transform: translateY(-2px); border-color: color-mix(in srgb, var(--tone) 40%, var(--border)); }
.ur-card.is-on { border-color: var(--tone); background: color-mix(in srgb, var(--tone) 5%, var(--card)); }
.ur-icon {
  color: var(--tone);
  background: linear-gradient(135deg, color-mix(in srgb, var(--tone) 20%, var(--card)), color-mix(in srgb, var(--tone) 8%, var(--card)));
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--tone) 18%, transparent);
}
.ur-full {
  font-size: 10.5px; font-weight: 800; padding: 0.05rem 0.5rem; border-radius: 9999px;
  color: var(--tone); background: color-mix(in srgb, var(--tone) 12%, var(--card));
}
.ur-focus { color: var(--muted-foreground); border: 1px solid transparent; transition: color 0.15s, border-color 0.15s, background-color 0.15s; }
.ur-focus:hover { color: var(--tone); border-color: color-mix(in srgb, var(--tone) 35%, var(--border)); }
.ur-card.is-on .ur-focus { color: var(--tone); background: color-mix(in srgb, var(--tone) 12%, var(--card)); border-color: color-mix(in srgb, var(--tone) 30%, transparent); }
.ur-bar { height: 0.4rem; border-radius: 9999px; background: var(--muted); overflow: hidden; }
.ur-bar i {
  display: block; height: 100%; border-radius: 9999px;
  background: linear-gradient(90deg, color-mix(in srgb, var(--tone) 65%, var(--card)), var(--tone));
  transition: width 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.ur-foot { border-color: color-mix(in srgb, var(--border) 70%, transparent); }
.ur-av { box-shadow: 0 0 0 2px var(--card); }
.ur-av + .ur-av { margin-inline-start: -0.5rem; }
.ur-more { background: var(--muted); color: var(--foreground); }
.ur-link { color: var(--tone); transition: background-color 0.15s; }
.ur-link:hover { background: color-mix(in srgb, var(--tone) 10%, var(--card)); }

/* ── role pills (same language as the ledger's type switch) ── */
.ur-pills { display: flex; flex-wrap: wrap; align-items: center; gap: 0.4rem; }
.ur-pill {
  display: inline-flex; align-items: center; gap: 0.45rem; height: 2.25rem; padding-inline: 0.9rem 0.6rem; border-radius: 9999px; cursor: pointer;
  font-size: 13px; font-weight: 700; color: var(--muted-foreground); background: var(--card); border: 1px solid var(--border);
  transition: border-color 0.15s, color 0.15s, background-color 0.15s;
}
.ur-pill:hover { border-color: color-mix(in srgb, var(--primary) 40%, var(--border)); color: var(--foreground); }
.ur-pill.is-on { background: var(--primary); border-color: var(--primary); color: var(--primary-foreground); }
.ur-count { display: inline-grid; place-items: center; min-width: 1.5rem; height: 1.5rem; padding: 0 0.35rem; border-radius: 9999px; font-size: 11px; font-weight: 800; background: var(--muted); color: var(--foreground); font-variant-numeric: tabular-nums; }
.ur-pill.is-on .ur-count { background: color-mix(in srgb, white 25%, transparent); color: inherit; }
.ur-dot { display: inline-block; width: 0.55rem; height: 0.55rem; border-radius: 0.2rem; flex: none; }
.ur-pill.is-on .ur-dot { outline: 2px solid color-mix(in srgb, white 70%, transparent); }

/* ── matrix ── */
/* the whole matrix shows at once — no inner scroll (only sideways on narrow screens) */
.ur-mx { overflow-x: auto; }
@media (min-width: 64rem) { .ur-mx { overflow: visible; } }
.ur-mx table { min-width: 44rem; }
.ur-mx thead th { position: sticky; top: 0; z-index: 2; background: color-mix(in srgb, var(--brand) 4%, var(--muted)); padding-block: 0.6rem; }
.ur-mx thead th.ur-corner { inset-inline-start: 0; z-index: 3; }
.ur-th-btn {
  display: inline-flex; flex-direction: column; align-items: center; gap: 0.25rem; cursor: pointer;
  padding: 0.3rem 0.5rem; border-radius: 0.6rem; color: var(--muted-foreground); font-weight: 700; font-size: 12px;
  transition: color 0.15s, background-color 0.15s;
}
.ur-th-btn :deep(svg) { color: var(--tone); }
.ur-th.is-col-hover .ur-th-btn, .ur-th-btn:hover { color: var(--foreground); background: color-mix(in srgb, var(--tone) 10%, transparent); }
.ur-th.is-focus .ur-th-btn { color: var(--tone); background: color-mix(in srgb, var(--tone) 14%, var(--card)); }
.ur-th.is-dim { opacity: 0.55; }

/* first column stays put while the roles scroll sideways */
.ur-mx td.ur-mod { position: sticky; inset-inline-start: 0; z-index: 1; min-width: 14rem; }
.ur-mod-icon { color: var(--tone); background: color-mix(in srgb, var(--tone) 12%, var(--card)); }
.ur-mod-n { font-size: 11px; font-weight: 800; color: var(--muted-foreground); background: var(--muted); padding: 0.05rem 0.45rem; border-radius: 0.4rem; }

/* group heading rows sit on the well itself */
.soft-table tbody tr.ur-group > td { background: transparent !important; box-shadow: none !important; padding: 0.7rem 0.75rem 0.1rem; }
.soft-table tbody tr.ur-group > td:first-child::before { display: none; }
.ur-group-name { position: sticky; inset-inline-start: 0.75rem; display: inline-flex; align-items: center; gap: 0.5rem; font-size: 12px; font-weight: 800; color: var(--muted-foreground); }

/* column states: hover (crosshair with the row hover), focus, dimmed */
.soft-table tbody td.ur-cell.is-col-hover { background: color-mix(in srgb, var(--tone) 6%, var(--card)); }
.soft-table tbody tr:hover > td.ur-cell.is-col-hover { background: color-mix(in srgb, var(--tone) 13%, var(--card)); }
.soft-table tbody td.ur-cell.is-focus,
.soft-table tfoot td.ur-cell.is-focus { background: color-mix(in srgb, var(--tone) 9%, var(--card)); }
.ur-cell.is-dim .ur-yes, .ur-cell.is-dim .ur-no { opacity: 0.4; }
.soft-table tfoot td.ur-cell.is-focus { color: var(--tone); }

.ur-yes, .ur-no { display: inline-grid; place-items: center; width: 1.75rem; height: 1.75rem; border-radius: 0.55rem; transition: opacity 0.15s, transform 0.2s; }
.ur-yes { color: var(--success); background: color-mix(in srgb, var(--success) 14%, var(--card)); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--success) 22%, transparent); }
.ur-cell.is-focus .ur-yes { color: var(--primary-foreground); background: var(--primary); box-shadow: none; }
.ur-no { color: color-mix(in srgb, var(--muted-foreground) 55%, transparent); }
.ur-yes.is-sm, .ur-no.is-sm { width: 1.25rem; height: 1.25rem; border-radius: 0.4rem; }
.ur-no.is-sm { background: var(--muted); }
.soft-table tbody tr:hover .ur-yes { transform: scale(1.06); }

@media (prefers-reduced-motion: reduce) {
  .ur-card, .ur-bar i, .ur-yes, .ur-no, .ur-focus, .ur-pill, .ur-th-btn { transition: none; }
  .ur-card:hover { transform: none; }
  .soft-table tbody tr:hover .ur-yes { transform: none; }
}
</style>
