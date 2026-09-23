<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight, Check, RefreshCw } from 'lucide-vue-next'
import { RTL_LOCALES } from '@/i18n'
import { cn } from '@/lib/utils'

/* SwiftAxis date-range picker.
   Trigger: an orange calendar chip, the preset's name (or "custom range") and
   the dates. Panel: presets down the side, one month with the range painted
   on it, editable from/to fields, cancel / apply. Nothing changes until
   "apply". Value: ['YYYY-MM-DD', 'YYYY-MM-DD'], or ['', ''] for "all days". */

const props = defineProps({
  modelValue: { type: Array, default: () => ['', ''] },
  // preset keys, in display order
  presets: { type: Array, default: () => ['all', 'today', 'yesterday', 'last7', 'thisWeek', 'thisMonth', 'last30', 'thisYear'] },
  weekStart: { type: Number, default: 0 }, // 0 = Sunday
  // a refresh button inside the box that re-asks the page for its data
  refresh: { type: Boolean, default: false },
  refreshing: { type: Boolean, default: false },
  class: { type: null, default: '' },
})
const emit = defineEmits(['update:modelValue', 'change', 'refresh'])

const { t, locale } = useI18n()
const isRtl = computed(() => RTL_LOCALES.includes(locale.value))
const intlLocale = computed(() => (locale.value === 'ar' ? 'ar-u-ca-gregory-nu-latn' : 'en-US'))

/* ── dates (local time, ISO strings) ─────────────────────────────── */
const pad = (n) => String(n).padStart(2, '0')
const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const fromISO = (s) => {
  if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return null
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
const today = () => {
  const n = new Date()
  return new Date(n.getFullYear(), n.getMonth(), n.getDate())
}

function presetRange(key) {
  const now = today()
  switch (key) {
    case 'all': return ['', '']
    case 'today': return [toISO(now), toISO(now)]
    case 'yesterday': { const y = addDays(now, -1); return [toISO(y), toISO(y)] }
    case 'last7': return [toISO(addDays(now, -6)), toISO(now)]
    case 'last30': return [toISO(addDays(now, -29)), toISO(now)]
    case 'thisWeek': {
      const back = (now.getDay() - props.weekStart + 7) % 7
      return [toISO(addDays(now, -back)), toISO(now)]
    }
    case 'thisMonth': return [toISO(new Date(now.getFullYear(), now.getMonth(), 1)), toISO(now)]
    case 'thisYear': return [toISO(new Date(now.getFullYear(), 0, 1)), toISO(now)]
    default: return ['', '']
  }
}
const presetOf = (a, b) => props.presets.find((k) => { const [x, y] = presetRange(k); return x === (a || '') && y === (b || '') }) ?? null

const fmtLong = (iso) => {
  const d = fromISO(iso)
  return d ? new Intl.DateTimeFormat(intlLocale.value, { day: 'numeric', month: 'long', year: 'numeric' }).format(d) : ''
}
const fmtField = (iso) => {
  const d = fromISO(iso)
  return d ? `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}` : ''
}
const parseField = (s) => {
  const m = String(s).trim().match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/)
  if (!m) return null
  const d = new Date(+m[3], +m[2] - 1, +m[1])
  return d.getDate() === +m[1] && d.getMonth() === +m[2] - 1 ? toISO(d) : null
}

/* ── trigger text ────────────────────────────────────────────────── */
const current = computed(() => [props.modelValue?.[0] ?? '', props.modelValue?.[1] ?? ''])
const currentPreset = computed(() => presetOf(current.value[0], current.value[1]))
const triggerTitle = computed(() => (currentPreset.value ? t(`drp.${currentPreset.value}`) : t('drp.custom')))
const triggerRange = computed(() => {
  const [a, b] = current.value
  if (!a && !b) return t('drp.allHint')
  if (a === b) return fmtLong(a)
  return `${fmtLong(a)} — ${fmtLong(b)}`
})

/* ── draft (what the panel edits until "apply") ──────────────────── */
const open = ref(false)
const start = ref('')
const end = ref('')
const hover = ref('')
const view = ref(today())
const slide = ref('next')
const fromText = ref('')
const toText = ref('')
const draftPreset = computed(() => (start.value && !end.value ? null : presetOf(start.value, end.value)))

function syncFields() {
  fromText.value = fmtField(start.value)
  toText.value = fmtField(end.value)
}
function openPanel() {
  ;[start.value, end.value] = current.value
  hover.value = ''
  const anchor = fromISO(end.value) ?? fromISO(start.value) ?? today()
  view.value = new Date(anchor.getFullYear(), anchor.getMonth(), 1)
  syncFields()
  open.value = true
  nextTick(place)
}
function close() {
  open.value = false
}
function apply() {
  let a = start.value
  let b = end.value || start.value // a single picked day is a one-day range
  if (a && b && a > b) [a, b] = [b, a]
  emit('update:modelValue', [a || '', b || ''])
  emit('change', [a || '', b || ''])
  close()
}
function pickPreset(key) {
  ;[start.value, end.value] = presetRange(key)
  const anchor = fromISO(end.value) ?? today()
  goTo(new Date(anchor.getFullYear(), anchor.getMonth(), 1))
  syncFields()
}

/* ── calendar ────────────────────────────────────────────────────── */
const monthKey = computed(() => `${view.value.getFullYear()}-${view.value.getMonth()}`)
const monthLabel = computed(() => new Intl.DateTimeFormat(intlLocale.value, { month: 'long', year: 'numeric' }).format(view.value))
const weekdays = computed(() => {
  const fmt = new Intl.DateTimeFormat(intlLocale.value, { weekday: 'narrow' })
  return Array.from({ length: 7 }, (_, i) => fmt.format(new Date(2024, 0, 7 + ((i + props.weekStart) % 7))))
})
const cells = computed(() => {
  const first = view.value
  const lead = (first.getDay() - props.weekStart + 7) % 7
  const startDay = addDays(first, -lead)
  return Array.from({ length: 42 }, (_, i) => {
    const d = addDays(startDay, i)
    return { iso: toISO(d), day: d.getDate(), outside: d.getMonth() !== first.getMonth() }
  })
})
function goTo(d) {
  if (d.getTime() === view.value.getTime()) return
  slide.value = d > view.value ? 'next' : 'prev'
  view.value = d
}
const prevMonth = () => goTo(new Date(view.value.getFullYear(), view.value.getMonth() - 1, 1))
const nextMonth = () => goTo(new Date(view.value.getFullYear(), view.value.getMonth() + 1, 1))

// the range as painted: while picking the end, the hovered day previews it
const painted = computed(() => {
  const a = start.value
  const b = end.value || (a && hover.value ? hover.value : '')
  if (!a) return ['', '']
  if (!b) return [a, a]
  return a <= b ? [a, b] : [b, a]
})
function cellState(iso) {
  const [a, b] = painted.value
  const isStart = iso === a
  const isEnd = iso === b
  return {
    isEdge: isStart || isEnd,
    isStart,
    isEnd,
    single: isStart && isEnd,
    inRange: a && b && iso > a && iso < b,
    preview: !end.value && !!hover.value,
    isToday: iso === toISO(today()),
  }
}
function pickDay(iso) {
  if (!start.value || end.value) {
    start.value = iso
    end.value = ''
  } else if (iso < start.value) {
    end.value = start.value
    start.value = iso
  } else {
    end.value = iso
  }
  hover.value = ''
  syncFields()
}
const daysCount = computed(() => {
  const [a, b] = painted.value
  if (!a || !b) return 0
  return Math.round((fromISO(b) - fromISO(a)) / 86400000) + 1
})
function commitField(which) {
  const iso = parseField(which === 'from' ? fromText.value : toText.value)
  if (!iso) return syncFields()
  if (which === 'from') start.value = iso
  else end.value = iso
  if (start.value && end.value && start.value > end.value) [start.value, end.value] = [end.value, start.value]
  const d = fromISO(iso)
  goTo(new Date(d.getFullYear(), d.getMonth(), 1))
  syncFields()
}

/* ── placement: fixed, under the trigger, flush with its outer edge ── */
const triggerEl = ref(null)
const panelEl = ref(null)
const pos = ref({ top: 0, left: 0 })
function place() {
  const tr = triggerEl.value?.getBoundingClientRect()
  const pw = panelEl.value?.offsetWidth ?? 520
  const ph = panelEl.value?.offsetHeight ?? 440
  if (!tr) return
  let left = isRtl.value ? tr.left : tr.right - pw
  left = Math.max(8, Math.min(left, window.innerWidth - pw - 8))
  let top = tr.bottom + 8
  if (top + ph > window.innerHeight - 8 && tr.top - ph - 8 > 8) top = tr.top - ph - 8
  pos.value = { top, left }
}
function onDocDown(e) {
  if (panelEl.value?.contains(e.target) || triggerEl.value?.contains(e.target)) return
  close()
}
function onKey(e) {
  if (e.key === 'Escape') close()
}
watch(open, (v) => {
  if (v) {
    document.addEventListener('pointerdown', onDocDown, true)
    document.addEventListener('keydown', onKey)
    window.addEventListener('resize', place)
  } else {
    document.removeEventListener('pointerdown', onDocDown, true)
    document.removeEventListener('keydown', onKey)
    window.removeEventListener('resize', place)
  }
})
onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onDocDown, true)
  document.removeEventListener('keydown', onKey)
  window.removeEventListener('resize', place)
})

// the sliding highlight behind the active preset
const presetIndex = computed(() => props.presets.indexOf(draftPreset.value))
</script>

<template>
  <div
    ref="triggerEl"
    :class="cn('drp-box inline-flex h-11 items-center rounded-xl border bg-card transition-colors', open ? 'border-primary' : 'border-border hover:border-primary/40', props.class)"
  >
    <button
      type="button"
      class="drp-trigger group flex h-full min-w-0 flex-1 items-center gap-2.5 ps-1.5 pe-3 text-start text-sm"
      :aria-expanded="open"
      aria-haspopup="dialog"
      @click="open ? close() : openPanel()"
    >
      <span class="drp-chip grid size-8 shrink-0 place-items-center rounded-lg"><CalendarDays class="size-[18px]" /></span>
      <span class="text-foreground shrink-0 font-bold">{{ triggerTitle }}</span>
      <span class="text-muted-foreground hidden truncate text-xs tabular-nums sm:inline">{{ triggerRange }}</span>
      <ChevronDown class="text-muted-foreground ms-auto size-4 shrink-0 transition-transform duration-300" :class="open && 'rotate-180'" />
    </button>
    <template v-if="refresh">
      <span class="bg-border h-6 w-px shrink-0" aria-hidden="true" />
      <button
        type="button"
        class="drp-refresh text-muted-foreground hover:text-primary hover:bg-primary/10 mx-1.5 grid size-8 shrink-0 place-items-center rounded-lg transition-colors disabled:opacity-60"
        :disabled="refreshing"
        :title="t('drp.refresh')"
        :aria-label="t('drp.refresh')"
        @click="emit('refresh')"
      >
        <RefreshCw class="size-4" :class="refreshing && 'is-spinning'" />
      </button>
    </template>
  </div>

  <Teleport to="body">
    <Transition name="drp">
      <div
        v-if="open"
        ref="panelEl"
        role="dialog"
        :aria-label="t('drp.title')"
        :dir="isRtl ? 'rtl' : 'ltr'"
        class="drp-panel bg-card text-card-foreground fixed z-[60] flex w-[min(540px,calc(100vw-16px))] flex-col rounded-2xl border"
        :style="{ top: `${pos.top}px`, left: `${pos.left}px`, transformOrigin: isRtl ? 'top left' : 'top right' }"
      >
        <div class="flex min-h-0 flex-col sm:flex-row">
          <!-- presets -->
          <div class="drp-presets relative flex gap-1 overflow-x-auto border-b p-2 sm:w-44 sm:shrink-0 sm:flex-col sm:overflow-visible sm:border-b-0 sm:border-e sm:p-3">
            <span
              v-if="presetIndex >= 0"
              class="drp-glide bg-primary/12 pointer-events-none absolute hidden rounded-lg sm:block"
              :style="{ top: `calc(0.75rem + ${presetIndex} * 2.75rem)` }"
            />
            <button
              v-for="p in presets"
              :key="p"
              type="button"
              class="relative flex h-9 shrink-0 items-center justify-between gap-2 rounded-lg px-3 text-start text-[13.5px] whitespace-nowrap transition-colors sm:h-10"
              :class="draftPreset === p ? 'text-primary max-sm:bg-primary/12 font-bold' : 'text-foreground/80 hover:bg-muted font-medium'"
              @click="pickPreset(p)"
            >
              {{ t(`drp.${p}`) }}
              <Check v-if="draftPreset === p" class="drp-tick hidden size-3.5 sm:block" />
            </button>
          </div>

          <!-- calendar -->
          <div class="min-w-0 flex-1 p-3 sm:p-4">
            <div class="mb-2 flex items-center justify-between">
              <button type="button" class="hover:bg-muted text-muted-foreground grid size-8 place-items-center rounded-lg transition-colors" :aria-label="t('datepicker.prev')" @click="prevMonth">
                <component :is="isRtl ? ChevronRight : ChevronLeft" class="size-4" />
              </button>
              <Transition :name="`drp-title-${slide}`" mode="out-in">
                <span :key="monthKey" class="text-sm font-bold">{{ monthLabel }}</span>
              </Transition>
              <button type="button" class="hover:bg-muted text-muted-foreground grid size-8 place-items-center rounded-lg transition-colors" :aria-label="t('datepicker.next')" @click="nextMonth">
                <component :is="isRtl ? ChevronLeft : ChevronRight" class="size-4" />
              </button>
            </div>

            <div class="text-muted-foreground grid grid-cols-7 pb-1 text-center text-[11px] font-semibold">
              <span v-for="(w, i) in weekdays" :key="i" class="py-1">{{ w }}</span>
            </div>

            <div class="drp-grid-wrap overflow-hidden">
              <Transition :name="`drp-month-${isRtl ? (slide === 'next' ? 'prev' : 'next') : slide}`" mode="out-in">
                <div :key="monthKey" class="grid grid-cols-7 gap-y-1" @mouseleave="hover = ''">
                  <button
                    v-for="c in cells"
                    :key="c.iso"
                    type="button"
                    class="drp-day relative h-9 text-[13px] tabular-nums"
                    :class="[
                      c.outside && 'is-outside',
                      cellState(c.iso).inRange && 'in-range',
                      cellState(c.iso).isEdge && 'is-edge',
                      cellState(c.iso).isStart && 'is-start',
                      cellState(c.iso).isEnd && 'is-end',
                      cellState(c.iso).single && 'is-single',
                      cellState(c.iso).preview && 'is-preview',
                      cellState(c.iso).isToday && 'is-today',
                    ]"
                    @click="pickDay(c.iso)"
                    @mouseenter="hover = c.iso"
                  >
                    <span class="drp-num relative z-[1] grid size-full place-items-center">{{ c.day }}</span>
                  </button>
                </div>
              </Transition>
            </div>

            <div class="mt-3 grid grid-cols-2 gap-2">
              <label class="drp-field">
                <span>{{ t('drp.from') }}</span>
                <input v-model="fromText" dir="ltr" inputmode="numeric" placeholder="dd/mm/yyyy" @blur="commitField('from')" @keydown.enter.prevent="commitField('from')" />
              </label>
              <label class="drp-field">
                <span>{{ t('drp.to') }}</span>
                <input v-model="toText" dir="ltr" inputmode="numeric" placeholder="dd/mm/yyyy" @blur="commitField('to')" @keydown.enter.prevent="commitField('to')" />
              </label>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2 border-t px-3 py-3 sm:px-4">
          <Transition name="drp-fade" mode="out-in">
            <span :key="`${painted[0]}-${painted[1]}-${start && !end}`" class="text-muted-foreground text-xs">
              <template v-if="start && !end">{{ t('drp.pickEnd') }}</template>
              <template v-else-if="daysCount">{{ t('drp.days', { n: daysCount }) }}</template>
              <template v-else>{{ t('drp.allHint') }}</template>
            </span>
          </Transition>
          <button type="button" class="hover:bg-muted ms-auto h-9 rounded-lg px-4 text-sm font-medium transition-colors" @click="close">{{ t('common.cancel') }}</button>
          <button type="button" class="bg-primary text-primary-foreground hover:bg-primary/90 h-9 rounded-lg px-5 text-sm font-bold transition-colors" @click="apply">{{ t('drp.apply') }}</button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* trigger; everything clickable shows the hand cursor */
.drp-trigger, .drp-refresh, .drp-panel button { cursor: pointer; }
.drp-refresh:disabled { cursor: progress; }
/* refresh: a half turn on hover, a steady spin while the data reloads */
.drp-refresh svg { transition: transform 0.4s ease; }
.drp-refresh:hover:not(:disabled) svg { transform: rotate(180deg); }
.drp-refresh svg.is-spinning { animation: drp-spin 0.8s linear infinite; }
@keyframes drp-spin { to { transform: rotate(360deg); } }
.drp-chip { background: color-mix(in srgb, var(--primary) 12%, transparent); color: var(--primary); transition: transform 0.3s cubic-bezier(0.2, 0.9, 0.3, 1.4); }
.drp-box:hover .drp-chip { transform: rotate(-8deg) scale(1.06); }

/* panel: grows out of the trigger */
.drp-panel { box-shadow: 0 24px 48px -24px color-mix(in srgb, var(--navy) 45%, transparent); }
.drp-enter-active { transition: opacity 0.2s ease, transform 0.28s cubic-bezier(0.2, 0.9, 0.3, 1.15); }
.drp-leave-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.drp-enter-from, .drp-leave-to { opacity: 0; transform: translateY(-6px) scale(0.96); }

/* presets: a soft highlight glides to the active one */
.drp-presets { scrollbar-width: none; }
.drp-presets::-webkit-scrollbar { display: none; }
.drp-glide { inset-inline: 0.75rem; height: 2.5rem; transition: top 0.3s cubic-bezier(0.3, 1.2, 0.5, 1); }
.drp-tick { animation: drp-pop 0.3s cubic-bezier(0.2, 0.9, 0.3, 1.5); }

/* month slides in the direction of travel; the title cross-fades */
.drp-month-next-enter-active, .drp-month-next-leave-active,
.drp-month-prev-enter-active, .drp-month-prev-leave-active { transition: opacity 0.18s ease, transform 0.22s cubic-bezier(0.2, 0.8, 0.2, 1); }
.drp-month-next-enter-from, .drp-month-prev-leave-to { opacity: 0; transform: translateX(24px); }
.drp-month-next-leave-to, .drp-month-prev-enter-from { opacity: 0; transform: translateX(-24px); }
.drp-title-next-enter-active, .drp-title-prev-enter-active, .drp-title-next-leave-active, .drp-title-prev-leave-active { transition: opacity 0.15s, transform 0.15s; }
.drp-title-next-enter-from, .drp-title-prev-enter-from { opacity: 0; transform: translateY(4px); }
.drp-title-next-leave-to, .drp-title-prev-leave-to { opacity: 0; transform: translateY(-4px); }
.drp-fade-enter-active, .drp-fade-leave-active { transition: opacity 0.15s; }
.drp-fade-enter-from, .drp-fade-leave-to { opacity: 0; }

/* days */
.drp-day { color: var(--foreground); cursor: pointer; }
.drp-day .drp-num { border-radius: 0.6rem; transition: background-color 0.15s, color 0.15s, transform 0.2s; }
.drp-day:hover:not(.is-edge) .drp-num { background: var(--muted); }
.drp-day.is-outside { color: color-mix(in srgb, var(--muted-foreground) 55%, transparent); }
.drp-day.is-today:not(.is-edge) .drp-num { box-shadow: inset 0 0 0 1.5px color-mix(in srgb, var(--primary) 55%, transparent); font-weight: 700; }
/* the band between the two ends */
.drp-day.in-range::before,
.drp-day.is-start:not(.is-single)::before,
.drp-day.is-end:not(.is-single)::before {
  content: ''; position: absolute; inset-block: 0; inset-inline: -0.5px; /* overlap a hair so no seams show */
  background: color-mix(in srgb, var(--primary) 12%, transparent);
  animation: drp-band 0.25s ease both;
}
/* the band rounds off where a week row begins or ends */
.drp-day:nth-child(7n + 1)::before { border-start-start-radius: 0.6rem; border-end-start-radius: 0.6rem; }
.drp-day:nth-child(7n)::before { border-start-end-radius: 0.6rem; border-end-end-radius: 0.6rem; }
.drp-day.is-start:not(.is-single)::before { inset-inline-start: 50%; }
.drp-day.is-end:not(.is-single)::before { inset-inline-end: 50%; }
.drp-day.in-range { color: color-mix(in srgb, var(--primary) 80%, var(--foreground)); font-weight: 600; }
.drp-day.is-preview.in-range::before { background: color-mix(in srgb, var(--primary) 7%, transparent); }
/* the ends: solid orange tiles that pop in */
.drp-day.is-edge .drp-num { background: var(--primary); color: var(--primary-foreground); font-weight: 800; box-shadow: 0 6px 14px -8px var(--primary); animation: drp-pop 0.3s cubic-bezier(0.2, 0.9, 0.3, 1.5); }
.drp-day.is-preview.is-end:not(.is-start) .drp-num { background: color-mix(in srgb, var(--primary) 55%, var(--card)); box-shadow: none; animation: none; }

/* from / to fields */
.drp-field { display: grid; gap: 0.25rem; }
.drp-field > span { font-size: 11px; font-weight: 600; color: var(--muted-foreground); }
.drp-field > input {
  height: 2.5rem; width: 100%; border-radius: 0.6rem; border: 1px solid var(--border); background: var(--card);
  padding-inline: 0.75rem; font-size: 13px; font-variant-numeric: tabular-nums; outline: none; transition: border-color 0.15s;
  text-align: center;
}
.drp-field > input:focus { border-color: var(--primary); }

@keyframes drp-pop { from { transform: scale(0.6); } }
@keyframes drp-band { from { opacity: 0; } }
@media (prefers-reduced-motion: reduce) {
  .drp-enter-active, .drp-leave-active, [class*='drp-month'], [class*='drp-title'] { transition: none !important; }
  .drp-day .drp-num, .drp-day::before, .drp-tick, .drp-glide { animation: none !important; transition: none !important; }
}
</style>
