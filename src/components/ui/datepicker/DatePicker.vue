<script setup>
import { computed, nextTick, onBeforeUnmount, ref, useId, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-vue-next'
import { RTL_LOCALES } from '@/i18n'
import { cn } from '@/lib/utils'

/* SwiftAxis date picker — from scratch, no date library.
   Value is always an ISO 'YYYY-MM-DD' string (or a [start, end] pair in range
   mode), so it drops straight into what <input type="date"> was bound to.
   The grid is Gregorian in both locales; only the month/day names localise. */

defineOptions({ inheritAttrs: false })

const props = defineProps({
  // 'YYYY-MM-DD', or ['YYYY-MM-DD', 'YYYY-MM-DD'] when range
  modelValue: { type: [String, Array, null], default: '' },
  range: { type: Boolean, default: false },
  min: { type: String, default: '' },
  max: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  invalid: { type: Boolean, default: false },
  clearable: { type: Boolean, default: true },
  presets: { type: Boolean, default: true },
  weekStart: { type: Number, default: 0 }, // 0 = Sunday
  class: { type: null, default: '' },
  contentClass: { type: null, default: '' },
})
const emit = defineEmits(['update:modelValue', 'change'])

const { t, locale } = useI18n()
const isRtl = computed(() => RTL_LOCALES.includes(locale.value))
/* Gregorian + Latin digits: ar-SA alone would render Hijri, which wouldn't
   match the ISO value this component stores. */
const intlLocale = computed(() =>
  locale.value === 'ar' ? 'ar-u-ca-gregory-nu-latn' : 'en-US',
)

/* ── date helpers (local time — never Date.parse an ISO string) ────── */
const pad = (n) => String(n).padStart(2, '0')
const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const isISO = (s) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s)
const fromISO = (s) => {
  if (!isISO(s)) return null
  const [y, m, d] = s.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  return Number.isNaN(dt.getTime()) ? null : dt
}
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
const addMonths = (d, n) => new Date(d.getFullYear(), d.getMonth() + n, 1)
const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1)
const endOfMonth = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0)
const sameDay = (a, b) => a && b && toISO(a) === toISO(b)
const todayISO = () => toISO(new Date())

/* ── model ─────────────────────────────────────────────────────────── */
const selectedStart = computed(() =>
  props.range ? fromISO(props.modelValue?.[0]) : fromISO(props.modelValue),
)
const selectedEnd = computed(() => (props.range ? fromISO(props.modelValue?.[1]) : null))
const hasValue = computed(() =>
  props.range ? !!(props.modelValue?.[0] || props.modelValue?.[1]) : !!fromISO(props.modelValue),
)

const fmtDay = (d) =>
  new Intl.DateTimeFormat(intlLocale.value, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(d)

const triggerLabel = computed(() => {
  if (!hasValue.value) return ''
  if (!props.range) return fmtDay(selectedStart.value)
  const a = selectedStart.value ? fmtDay(selectedStart.value) : '…'
  const b = selectedEnd.value ? fmtDay(selectedEnd.value) : '…'
  return `${a} — ${b}`
})

const placeholderText = computed(
  () => props.placeholder || t(props.range ? 'datepicker.selectRange' : 'datepicker.selectDate'),
)

/* ── panel state ───────────────────────────────────────────────────── */
const panelId = useId()
const open = ref(false)
const view = ref('days') // days | months | years
const cursor = ref(startOfMonth(new Date())) // the month on screen
const focusDate = ref(null) // keyboard cursor
const hoverDate = ref(null) // range preview
const pendingStart = ref(null) // first half of a range being picked
const slide = ref('next') // month transition direction
const placement = ref('bottom')
const panelStyle = ref({})

const triggerEl = ref(null)
const panelEl = ref(null)

const minDate = computed(() => fromISO(props.min))
const maxDate = computed(() => fromISO(props.max))
function isDisabledDay(d) {
  if (minDate.value && d < minDate.value) return true
  if (maxDate.value && d > maxDate.value) return true
  return false
}

/* ── the 6×7 grid ──────────────────────────────────────────────────── */
const weekdays = computed(() => {
  const fmt = new Intl.DateTimeFormat(intlLocale.value, { weekday: 'short' })
  // 2024-01-07 is a Sunday — walk a known week to get localized short names
  return Array.from({ length: 7 }, (_, i) =>
    fmt.format(new Date(2024, 0, 7 + ((i + props.weekStart) % 7))),
  )
})

const days = computed(() => {
  const first = startOfMonth(cursor.value)
  const lead = (first.getDay() - props.weekStart + 7) % 7
  const start = addDays(first, -lead)
  const month = cursor.value.getMonth()
  return Array.from({ length: 42 }, (_, i) => {
    const d = addDays(start, i)
    return {
      date: d,
      iso: toISO(d),
      label: d.getDate(),
      outside: d.getMonth() !== month,
      disabled: isDisabledDay(d),
    }
  })
})

const monthNames = computed(() => {
  const fmt = new Intl.DateTimeFormat(intlLocale.value, { month: 'long' })
  return Array.from({ length: 12 }, (_, m) => fmt.format(new Date(2024, m, 1)))
})
const headerLabel = computed(() =>
  new Intl.DateTimeFormat(intlLocale.value, { month: 'long', year: 'numeric' }).format(cursor.value),
)
const yearsPage = computed(() => {
  const base = Math.floor(cursor.value.getFullYear() / 12) * 12
  return Array.from({ length: 12 }, (_, i) => base + i)
})

/* ── day state for styling ─────────────────────────────────────────── */
const rangeEdges = computed(() => {
  // while picking, preview against the hovered day
  if (props.range && pendingStart.value) {
    const other = hoverDate.value ?? pendingStart.value
    return pendingStart.value <= other
      ? { a: pendingStart.value, b: other }
      : { a: other, b: pendingStart.value }
  }
  return { a: selectedStart.value, b: selectedEnd.value }
})

function dayState(d) {
  const { a, b } = rangeEdges.value
  const isStart = sameDay(d, a)
  const isEnd = sameDay(d, b)
  const inRange = props.range && a && b && d > a && d < b
  return {
    selected: props.range ? isStart || isEnd : sameDay(d, selectedStart.value),
    isStart: props.range && isStart && !!b && !sameDay(a, b),
    isEnd: props.range && isEnd && !!a && !sameDay(a, b),
    inRange,
    today: sameDay(d, new Date()),
    focused: sameDay(d, focusDate.value),
  }
}

/* ── positioning (same anchoring rules as the Dropdown) ────────────── */
function place() {
  const el = triggerEl.value
  if (!el) return
  const r = el.getBoundingClientRect()
  const gap = 8
  const vw = window.innerWidth
  const vh = window.innerHeight
  const below = vh - r.bottom - gap
  const above = r.top - gap
  const flip = below < 380 && above > below
  placement.value = flip ? 'top' : 'bottom'

  const style = { position: 'fixed' }
  if (flip) style.bottom = `${vh - r.top + gap}px`
  else style.top = `${r.bottom + gap}px`

  if (isRtl.value) style.right = `${Math.max(8, Math.min(vw - r.right, vw - 320))}px`
  else style.left = `${Math.max(8, Math.min(r.left, vw - 320))}px`
  panelStyle.value = style
}

/* ── open / close ──────────────────────────────────────────────────── */
async function openPanel() {
  if (props.disabled || open.value) return
  open.value = true
  view.value = 'days'
  pendingStart.value = null
  hoverDate.value = null
  const anchor = selectedStart.value ?? fromISO(todayISO())
  cursor.value = startOfMonth(anchor)
  focusDate.value = anchor
  place()
  bind()
  await nextTick()
  place()
  panelEl.value?.focus()
}

function closePanel({ focusTrigger = true } = {}) {
  if (!open.value) return
  open.value = false
  pendingStart.value = null
  hoverDate.value = null
  unbind()
  if (focusTrigger) triggerEl.value?.focus()
}

function toggle() {
  open.value ? closePanel() : openPanel()
}

/* ── selection ─────────────────────────────────────────────────────── */
function commit(value) {
  emit('update:modelValue', value)
  emit('change', value)
}

function pick(day) {
  if (day.disabled) return
  const d = day.date
  focusDate.value = d
  if (day.outside) cursor.value = startOfMonth(d)

  if (!props.range) {
    commit(toISO(d))
    closePanel()
    return
  }
  if (!pendingStart.value) {
    // hold the first click internally — a half range would flash through the
    // page's filters before the second click lands
    pendingStart.value = d
    return
  }
  const a = pendingStart.value
  const [from, to] = a <= d ? [a, d] : [d, a]
  pendingStart.value = null
  commit([toISO(from), toISO(to)])
  closePanel()
}

function clear() {
  pendingStart.value = null
  commit(props.range ? ['', ''] : '')
  if (open.value) closePanel()
}

function goToday() {
  const d = new Date()
  cursor.value = startOfMonth(d)
  focusDate.value = d
  if (!isDisabledDay(d)) pick({ date: d, disabled: false, outside: false })
}

/* quick ranges — only meaningful for a range picker */
function applyPreset(key) {
  const now = new Date()
  let a = now
  let b = now
  if (key === 'last7') a = addDays(now, -6)
  else if (key === 'last30') a = addDays(now, -29)
  else if (key === 'thisMonth') {
    a = startOfMonth(now)
    b = endOfMonth(now)
  } else if (key === 'thisYear') {
    a = new Date(now.getFullYear(), 0, 1)
    b = new Date(now.getFullYear(), 11, 31)
  }
  pendingStart.value = null
  commit([toISO(a), toISO(b)])
  cursor.value = startOfMonth(b)
  closePanel()
}

/* ── navigation ────────────────────────────────────────────────────── */
function shiftMonth(n) {
  slide.value = n > 0 ? 'next' : 'prev'
  cursor.value = addMonths(cursor.value, n)
}
function shiftYear(n) {
  slide.value = n > 0 ? 'next' : 'prev'
  cursor.value = new Date(cursor.value.getFullYear() + n, cursor.value.getMonth(), 1)
}
function pickMonth(m) {
  cursor.value = new Date(cursor.value.getFullYear(), m, 1)
  view.value = 'days'
}
function pickYear(y) {
  cursor.value = new Date(y, cursor.value.getMonth(), 1)
  view.value = 'months'
}
const canPrev = computed(
  () => !minDate.value || startOfMonth(cursor.value) > startOfMonth(minDate.value),
)
const canNext = computed(
  () => !maxDate.value || endOfMonth(cursor.value) < startOfMonth(maxDate.value),
)

/* ── listeners while open ──────────────────────────────────────────── */
function onDocPointerDown(e) {
  if (panelEl.value?.contains(e.target) || triggerEl.value?.contains(e.target)) return
  closePanel({ focusTrigger: false })
}
function bind() {
  document.addEventListener('pointerdown', onDocPointerDown, true)
  window.addEventListener('scroll', place, true)
  window.addEventListener('resize', place)
}
function unbind() {
  document.removeEventListener('pointerdown', onDocPointerDown, true)
  window.removeEventListener('scroll', place, true)
  window.removeEventListener('resize', place)
}
onBeforeUnmount(unbind)

/* a modal dialog watches document focusout to pull focus back inside */
function onTriggerFocusOut(e) {
  if (open.value && panelEl.value?.contains(e.relatedTarget)) e.stopPropagation()
}

/* ── keyboard ──────────────────────────────────────────────────────── */
function moveFocus(days) {
  const base = focusDate.value ?? selectedStart.value ?? new Date()
  const next = addDays(base, days)
  focusDate.value = next
  if (next.getMonth() !== cursor.value.getMonth()) {
    slide.value = days > 0 ? 'next' : 'prev'
    cursor.value = startOfMonth(next)
  }
}

function onKeydown(e) {
  if (props.disabled) return
  const k = e.key

  if (!open.value) {
    if (k === 'Enter' || k === ' ' || k === 'ArrowDown') {
      e.preventDefault()
      openPanel()
    }
    return
  }

  if (k === 'Escape') {
    e.preventDefault()
    e.stopPropagation() // keep a surrounding dialog open
    closePanel()
    return
  }
  if (k === 'Tab') return

  // arrows follow reading direction
  const back = isRtl.value ? 1 : -1
  if (k === 'ArrowLeft') {
    e.preventDefault()
    moveFocus(back)
  } else if (k === 'ArrowRight') {
    e.preventDefault()
    moveFocus(-back)
  } else if (k === 'ArrowUp') {
    e.preventDefault()
    moveFocus(-7)
  } else if (k === 'ArrowDown') {
    e.preventDefault()
    moveFocus(7)
  } else if (k === 'Home') {
    e.preventDefault()
    moveFocus(-((focusDate.value.getDay() - props.weekStart + 7) % 7))
  } else if (k === 'End') {
    e.preventDefault()
    moveFocus(6 - ((focusDate.value.getDay() - props.weekStart + 7) % 7))
  } else if (k === 'PageUp') {
    e.preventDefault()
    e.shiftKey ? shiftYear(-1) : shiftMonth(-1)
  } else if (k === 'PageDown') {
    e.preventDefault()
    e.shiftKey ? shiftYear(1) : shiftMonth(1)
  } else if (k === 'Enter' || k === ' ') {
    e.preventDefault()
    const d = focusDate.value
    if (d) pick({ date: d, iso: toISO(d), outside: d.getMonth() !== cursor.value.getMonth(), disabled: isDisabledDay(d) })
  }
}

watch(
  () => props.modelValue,
  () => {
    if (!open.value) pendingStart.value = null
  },
)

const triggerClasses = computed(() =>
  cn(
    'group relative flex h-11 w-full cursor-pointer items-center gap-2 rounded-lg border bg-muted/50 ps-3.5 pe-3 text-sm outline-none transition-all duration-200',
    'hover:bg-muted focus-visible:border-primary focus-visible:bg-background focus-visible:ring-4 focus-visible:ring-primary/15',
    'disabled:pointer-events-none disabled:opacity-60',
    open.value && 'border-primary bg-background ring-4 ring-primary/15',
    hasValue.value ? 'text-foreground' : 'text-muted-foreground',
    props.invalid
      ? 'border-danger focus-visible:border-danger focus-visible:ring-danger/15'
      : !open.value && 'border-transparent',
    props.class,
  ),
)

const PRESETS = ['today', 'last7', 'last30', 'thisMonth']
</script>

<template>
  <button
    ref="triggerEl"
    v-bind="$attrs"
    type="button"
    :disabled="disabled"
    :class="triggerClasses"
    :aria-expanded="open"
    aria-haspopup="dialog"
    :aria-controls="panelId"
    @click="toggle"
    @keydown="onKeydown"
    @focusout="onTriggerFocusOut"
  >
    <Calendar class="text-muted-foreground size-4 shrink-0" />
    <span class="truncate text-start" :dir="isRtl ? 'rtl' : 'ltr'">
      {{ triggerLabel || placeholderText }}
    </span>
    <span
      v-if="clearable && hasValue && !disabled"
      class="hover:bg-accent hover:text-foreground text-muted-foreground ms-auto inline-flex size-6 shrink-0 items-center justify-center rounded-full transition-colors"
      :aria-label="t('common.clear')"
      @click.stop="clear"
    >
      <X class="size-3.5" />
    </span>
  </button>

  <Teleport to="body">
    <Transition :name="placement === 'top' ? 'dp-up' : 'dp-down'">
      <!-- stopped events keep a surrounding Reka dialog from dismissing itself
           or stealing focus; pointer-events-auto survives its body lock -->
      <div
        v-if="open"
        :id="panelId"
        ref="panelEl"
        tabindex="-1"
        role="dialog"
        :style="panelStyle"
        :dir="isRtl ? 'rtl' : 'ltr'"
        :class="
          cn(
            'bg-popover text-popover-foreground shadow-navy/10 pointer-events-auto z-[70] w-[19.5rem] rounded-xl border p-3 shadow-xl outline-none',
            placement === 'top' ? 'origin-bottom' : 'origin-top',
            props.contentClass,
          )
        "
        @pointerdown.stop
        @mousedown.stop
        @focusin.stop
        @focusout.stop
        @click.stop
        @keydown="onKeydown"
      >
        <!-- header -->
        <div class="mb-2 flex items-center gap-1">
          <button
            type="button"
            class="hover:bg-accent text-muted-foreground hover:text-foreground inline-flex size-8 items-center justify-center rounded-lg transition-colors disabled:opacity-40"
            :disabled="view === 'days' && !canPrev"
            :aria-label="t('datepicker.prev')"
            @click="view === 'days' ? shiftMonth(-1) : view === 'months' ? shiftYear(-1) : shiftYear(-12)"
          >
            <component :is="isRtl ? ChevronRight : ChevronLeft" class="size-4" />
          </button>

          <button
            type="button"
            class="hover:bg-accent flex-1 rounded-lg px-2 py-1.5 text-sm font-semibold transition-colors"
            @click="view = view === 'days' ? 'months' : view === 'months' ? 'years' : 'days'"
          >
            {{ view === 'days' ? headerLabel : view === 'months' ? cursor.getFullYear() : `${yearsPage[0]} – ${yearsPage[11]}` }}
          </button>

          <button
            type="button"
            class="hover:bg-accent text-muted-foreground hover:text-foreground inline-flex size-8 items-center justify-center rounded-lg transition-colors disabled:opacity-40"
            :disabled="view === 'days' && !canNext"
            :aria-label="t('datepicker.next')"
            @click="view === 'days' ? shiftMonth(1) : view === 'months' ? shiftYear(1) : shiftYear(12)"
          >
            <component :is="isRtl ? ChevronLeft : ChevronRight" class="size-4" />
          </button>
        </div>

        <!-- days -->
        <div v-if="view === 'days'">
          <div class="text-muted-foreground mb-1 grid grid-cols-7 gap-0.5 text-center text-[0.68rem] font-medium">
            <span v-for="w in weekdays" :key="w" class="py-1">{{ w }}</span>
          </div>

          <Transition :name="slide === 'next' ? 'dp-month-next' : 'dp-month-prev'" mode="out-in">
            <div :key="`${cursor.getFullYear()}-${cursor.getMonth()}`" class="grid grid-cols-7 gap-0.5">
              <button
                v-for="(d, i) in days"
                :key="d.iso"
                type="button"
                data-day
                :data-iso="d.iso"
                :disabled="d.disabled"
                :aria-current="dayState(d.date).today ? 'date' : undefined"
                :aria-selected="dayState(d.date).selected"
                class="dp-day relative h-9 rounded-lg text-sm transition-all duration-150 disabled:pointer-events-none disabled:opacity-30"
                :class="[
                  dayState(d.date).selected
                    ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                    : dayState(d.date).inRange
                      ? 'bg-primary/10 text-foreground rounded-none'
                      : 'hover:bg-accent',
                  d.outside && !dayState(d.date).selected && 'text-muted-foreground/50',
                  dayState(d.date).isStart && 'rounded-e-none',
                  dayState(d.date).isEnd && 'rounded-s-none',
                  dayState(d.date).focused && !dayState(d.date).selected && 'ring-primary/40 ring-2',
                ]"
                :style="{ animationDelay: `${Math.min(i, 20) * 8}ms` }"
                @click="pick(d)"
                @mouseenter="hoverDate = d.date"
                @mouseleave="hoverDate = null"
              >
                {{ d.label }}
                <span
                  v-if="dayState(d.date).today && !dayState(d.date).selected"
                  class="bg-primary absolute inset-x-0 bottom-1 mx-auto size-1 rounded-full"
                />
              </button>
            </div>
          </Transition>
        </div>

        <!-- months -->
        <div v-else-if="view === 'months'" class="grid grid-cols-3 gap-1.5">
          <button
            v-for="(m, i) in monthNames"
            :key="m"
            type="button"
            class="dp-cell hover:bg-accent rounded-lg py-2.5 text-sm transition-colors"
            :class="i === cursor.getMonth() && 'bg-primary text-primary-foreground font-semibold'"
            :style="{ animationDelay: `${i * 14}ms` }"
            @click="pickMonth(i)"
          >
            {{ m }}
          </button>
        </div>

        <!-- years -->
        <div v-else class="grid grid-cols-3 gap-1.5">
          <button
            v-for="(y, i) in yearsPage"
            :key="y"
            type="button"
            class="dp-cell hover:bg-accent rounded-lg py-2.5 text-sm transition-colors tabular-nums"
            :class="y === cursor.getFullYear() && 'bg-primary text-primary-foreground font-semibold'"
            :style="{ animationDelay: `${i * 14}ms` }"
            @click="pickYear(y)"
          >
            {{ y }}
          </button>
        </div>

        <!-- quick ranges -->
        <div v-if="range && presets" class="mt-3 flex flex-wrap gap-1.5 border-t pt-3">
          <button
            v-for="p in PRESETS"
            :key="p"
            type="button"
            class="border-input hover:bg-accent hover:border-primary/40 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors"
            @click="applyPreset(p)"
          >
            {{ t(`datepicker.${p}`) }}
          </button>
        </div>

        <!-- footer -->
        <div class="mt-3 flex items-center justify-between border-t pt-2.5">
          <button
            type="button"
            class="text-primary hover:bg-primary/10 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors"
            @click="range ? applyPreset('today') : goToday()"
          >
            {{ t('datepicker.today') }}
          </button>
          <button
            v-if="hasValue"
            type="button"
            class="text-muted-foreground hover:bg-accent hover:text-foreground rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors"
            @click="clear"
          >
            {{ t('common.clear') }}
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* ── panel: same springy drop as the dropdown ─────────────────────── */
.dp-down-enter-active,
.dp-up-enter-active {
  transition:
    opacity 0.18s ease-out,
    transform 0.24s cubic-bezier(0.16, 1, 0.3, 1);
}
.dp-down-leave-active,
.dp-up-leave-active {
  transition:
    opacity 0.12s ease-in,
    transform 0.12s ease-in;
}
.dp-down-enter-from,
.dp-down-leave-to {
  opacity: 0;
  transform: translateY(-0.4rem) scale(0.97);
}
.dp-up-enter-from,
.dp-up-leave-to {
  opacity: 0;
  transform: translateY(0.4rem) scale(0.97);
}

/* ── month change: the grid slides the way you navigated ──────────── */
.dp-month-next-enter-active,
.dp-month-prev-enter-active {
  transition:
    opacity 0.18s ease-out,
    transform 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}
.dp-month-next-leave-active,
.dp-month-prev-leave-active {
  transition:
    opacity 0.1s ease-in,
    transform 0.1s ease-in;
}
.dp-month-next-enter-from {
  opacity: 0;
  transform: translateX(12%);
}
.dp-month-next-leave-to {
  opacity: 0;
  transform: translateX(-8%);
}
.dp-month-prev-enter-from {
  opacity: 0;
  transform: translateX(-12%);
}
.dp-month-prev-leave-to {
  opacity: 0;
  transform: translateX(8%);
}
[dir='rtl'] .dp-month-next-enter-from {
  transform: translateX(-12%);
}
[dir='rtl'] .dp-month-next-leave-to {
  transform: translateX(8%);
}
[dir='rtl'] .dp-month-prev-enter-from {
  transform: translateX(12%);
}
[dir='rtl'] .dp-month-prev-leave-to {
  transform: translateX(-8%);
}

/* ── cells: staggered fade-in, selected day pops ──────────────────── */
.dp-day,
.dp-cell {
  animation: dp-cell-in 0.22s cubic-bezier(0.16, 1, 0.3, 1) backwards;
}
@keyframes dp-cell-in {
  from {
    opacity: 0;
    transform: translateY(-0.15rem) scale(0.94);
  }
}
.dp-day:not(:disabled):hover {
  scale: 1.06;
}
.dp-day[aria-selected='true'] {
  animation: dp-pop 0.24s cubic-bezier(0.34, 1.56, 0.64, 1);
}
@keyframes dp-pop {
  from {
    scale: 0.82;
  }
}

@media (prefers-reduced-motion: reduce) {
  .dp-day,
  .dp-cell,
  .dp-down-enter-active,
  .dp-up-enter-active,
  .dp-down-leave-active,
  .dp-up-leave-active,
  .dp-month-next-enter-active,
  .dp-month-prev-enter-active,
  .dp-month-next-leave-active,
  .dp-month-prev-leave-active {
    animation: none;
    transition: none;
  }
  .dp-day:not(:disabled):hover {
    scale: 1;
  }
}
</style>
