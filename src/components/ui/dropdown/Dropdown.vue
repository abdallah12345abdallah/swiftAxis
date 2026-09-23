<script setup>
import { computed, nextTick, onBeforeUnmount, ref, useId, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Check, ChevronDown, Search, X } from 'lucide-vue-next'
import { RTL_LOCALES } from '@/i18n'
import { cn } from '@/lib/utils'

/* SwiftAxis dropdown — a from-scratch listbox (no headless lib):
   RTL-aware, keyboard driven, and portalled to <body> so it never gets
   clipped by a dialog or an overflow-hidden card. */

defineOptions({ inheritAttrs: false })

const props = defineProps({
  modelValue: { type: [String, Number, Boolean, null], default: '' },
  // options: [{ value, label, icon?, hint?, disabled? }]
  options: { type: Array, default: () => [] },
  placeholder: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  invalid: { type: Boolean, default: false },
  // true/false forces the in-menu search on/off; null = auto (shown for long lists)
  searchable: { type: Boolean, default: null },
  clearable: { type: Boolean, default: false },
  class: { type: null, default: '' },
  contentClass: { type: null, default: '' },
})
const emit = defineEmits(['update:modelValue', 'change'])

const { t, locale } = useI18n()
const isRtl = computed(() => RTL_LOCALES.includes(locale.value))

const listId = useId()
const open = ref(false)
const term = ref('')
const activeIndex = ref(-1)
const placement = ref('bottom')
const panelStyle = ref({})

const triggerEl = ref(null)
const panelEl = ref(null)
const searchEl = ref(null)
const listEl = ref(null)

/* '' / null / undefined all mean "nothing picked", so an "all / none" option
   whose value is '' still matches a null model value. */
const isBlank = (v) => v === '' || v === null || v === undefined
const same = (a, b) => (isBlank(a) && isBlank(b) ? true : a === b)

const selected = computed(() => props.options.find((o) => same(o.value, props.modelValue)))
const selectedLabel = computed(() => selected.value?.label ?? '')
const canClear = computed(() => props.clearable && !props.disabled && !isBlank(props.modelValue))

const showSearch = computed(() => props.searchable ?? props.options.length > 7)
const filtered = computed(() => {
  const q = term.value.trim().toLowerCase()
  if (!q || !showSearch.value) return props.options
  return props.options.filter((o) => String(o.label).toLowerCase().includes(q))
})

/* ── positioning ─────────────────────────────────────────────────────
   position: fixed against the trigger rect — flips above when the space
   below runs out, and follows the trigger on scroll / resize. */
function place() {
  const el = triggerEl.value
  if (!el) return
  const r = el.getBoundingClientRect()
  const gap = 8
  const vw = window.innerWidth
  const vh = window.innerHeight
  const below = vh - r.bottom - gap
  const above = r.top - gap
  const flip = below < 240 && above > below
  placement.value = flip ? 'top' : 'bottom'

  const style = {
    position: 'fixed',
    minWidth: `${r.width}px`,
    '--dd-max': `${Math.max(176, (flip ? above : below) - 8)}px`,
  }
  if (flip) style.bottom = `${vh - r.top + gap}px`
  else style.top = `${r.bottom + gap}px`

  if (isRtl.value) {
    style.right = `${Math.max(8, vw - r.right)}px`
    style.maxWidth = `${Math.max(r.width, r.right - 8)}px`
  } else {
    style.left = `${Math.max(8, r.left)}px`
    style.maxWidth = `${Math.max(r.width, vw - r.left - 8)}px`
  }
  panelStyle.value = style
}

/* ── open / close ────────────────────────────────────────────────── */
async function openMenu() {
  if (props.disabled || open.value) return
  term.value = ''
  open.value = true
  const i = props.options.findIndex((o) => same(o.value, props.modelValue))
  activeIndex.value = i >= 0 ? i : firstEnabled(0, 1)
  place()
  bind()
  await nextTick()
  place()
  if (showSearch.value) searchEl.value?.focus()
  scrollActiveIntoView()
}

function closeMenu({ focusTrigger = true } = {}) {
  if (!open.value) return
  open.value = false
  activeIndex.value = -1
  term.value = ''
  unbind()
  if (focusTrigger) triggerEl.value?.focus()
}

function toggle() {
  open.value ? closeMenu() : openMenu()
}

function pick(option) {
  if (!option || option.disabled) return
  emit('update:modelValue', option.value)
  emit('change', option.value)
  closeMenu()
}

function clear() {
  emit('update:modelValue', '')
  emit('change', '')
  if (open.value) closeMenu()
}

/* ── document / window listeners, live only while open ───────────── */
function onDocPointerDown(e) {
  if (panelEl.value?.contains(e.target) || triggerEl.value?.contains(e.target)) return
  closeMenu({ focusTrigger: false })
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

/* parent forms move focus along a field sequence (journal entry screen) */
defineExpose({ focus: () => triggerEl.value?.focus(), open: openMenu, close: closeMenu })

/* ── keyboard ────────────────────────────────────────────────────── */
function firstEnabled(from, step) {
  const list = filtered.value
  for (let i = from; i >= 0 && i < list.length; i += step) if (!list[i].disabled) return i
  return -1
}
function move(step) {
  const list = filtered.value
  if (!list.length) return
  let i = activeIndex.value
  for (let n = 0; n < list.length; n++) {
    i = (i + step + list.length) % list.length
    if (!list[i].disabled) break
  }
  activeIndex.value = i
  scrollActiveIntoView()
}
function scrollActiveIntoView() {
  nextTick(() => {
    listEl.value
      ?.querySelectorAll('[data-option]')
      [activeIndex.value]?.scrollIntoView({ block: 'nearest' })
  })
}

/* type-ahead for the short (searchless) lists */
let typeBuffer = ''
let typeTimer = null
function typeahead(char) {
  typeBuffer += char.toLowerCase()
  clearTimeout(typeTimer)
  typeTimer = setTimeout(() => (typeBuffer = ''), 600)
  const i = filtered.value.findIndex((o) => String(o.label).toLowerCase().startsWith(typeBuffer))
  if (i >= 0) {
    activeIndex.value = i
    scrollActiveIntoView()
  }
}

/* A surrounding Reka dialog traps focus by watching `focusout` on the document:
   without this, moving focus into the portalled search box would be undone. */
function onTriggerFocusOut(e) {
  if (open.value && panelEl.value?.contains(e.relatedTarget)) e.stopPropagation()
}

function onKeydown(e) {
  if (props.disabled) return
  const k = e.key

  if (!open.value) {
    if (k === 'Enter' || k === ' ' || k === 'ArrowDown' || k === 'ArrowUp') {
      e.preventDefault()
      openMenu()
    }
    return
  }

  if (k === 'Escape') {
    e.preventDefault()
    e.stopPropagation() // keep a surrounding dialog open
    closeMenu()
  } else if (k === 'Tab') {
    closeMenu({ focusTrigger: false })
  } else if (k === 'ArrowDown') {
    e.preventDefault()
    move(1)
  } else if (k === 'ArrowUp') {
    e.preventDefault()
    move(-1)
  } else if (k === 'Home') {
    e.preventDefault()
    activeIndex.value = firstEnabled(0, 1)
    scrollActiveIntoView()
  } else if (k === 'End') {
    e.preventDefault()
    activeIndex.value = firstEnabled(filtered.value.length - 1, -1)
    scrollActiveIntoView()
  } else if (k === 'Enter') {
    e.preventDefault()
    pick(filtered.value[activeIndex.value])
  } else if (!showSearch.value && k.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
    typeahead(k)
  }
}

watch(term, () => {
  activeIndex.value = firstEnabled(0, 1)
  listEl.value?.scrollTo?.({ top: 0 })
})

const triggerClasses = computed(() =>
  cn(
    'group relative flex h-11 w-full cursor-pointer items-center gap-2 overflow-hidden rounded-lg border bg-muted/50 ps-3.5 pe-3 text-sm outline-none transition-all duration-200',
    'hover:bg-muted focus-visible:border-primary focus-visible:bg-background',
    'disabled:pointer-events-none disabled:opacity-60',
    open.value && 'border-primary bg-background',
    selectedLabel.value ? 'text-foreground' : 'text-muted-foreground',
    props.invalid
      ? 'border-danger focus-visible:border-danger'
      : !open.value && 'border-border hover:border-primary/40',
    props.class,
  ),
)
</script>

<template>
  <button
    ref="triggerEl"
    v-bind="$attrs"
    type="button"
    role="combobox"
    aria-haspopup="listbox"
    :aria-expanded="open"
    :aria-controls="listId"
    :disabled="disabled"
    :class="triggerClasses"
    @click="toggle"
    @keydown="onKeydown"
    @focusout="onTriggerFocusOut"
  >
    <component :is="selected.icon" v-if="selected?.icon" class="size-4 shrink-0" />
    <span class="truncate text-start">{{ selectedLabel || placeholder }}</span>

    <span class="ms-auto flex shrink-0 items-center gap-0.5">
      <span
        v-if="canClear"
        class="hover:bg-accent hover:text-foreground text-muted-foreground inline-flex size-6 items-center justify-center rounded-full transition-colors"
        :aria-label="t('common.clear')"
        @click.stop="clear"
      >
        <X class="size-3.5" />
      </span>
      <ChevronDown
        class="text-muted-foreground size-4 transition-transform duration-300 ease-out"
        :class="open && 'rotate-180'"
      />
    </span>
  </button>

  <Teleport to="body">
    <Transition :name="placement === 'top' ? 'dd-up' : 'dd-down'">
      <!-- stop propagation so a surrounding Reka dialog treats this portalled
           panel as "inside": it neither dismisses itself nor steals focus back -->
      <div
        v-if="open"
        ref="panelEl"
        :style="panelStyle"
        :dir="isRtl ? 'rtl' : 'ltr'"
        :class="
          cn(
            /* pointer-events-auto: a modal dialog sets `pointer-events: none`
               on <body>, which this portalled panel would otherwise inherit */
            'bg-popover text-popover-foreground shadow-navy/10 pointer-events-auto z-[70] overflow-hidden rounded-xl border shadow-xl',
            placement === 'top' ? 'origin-bottom' : 'origin-top',
            props.contentClass,
          )
        "
        @pointerdown.stop
        @mousedown.stop
        @focusin.stop
        @focusout.stop
        @click.stop
      >
        <div v-if="showSearch" class="border-b p-1.5">
          <div class="relative">
            <Search
              class="text-muted-foreground pointer-events-none absolute start-2.5 top-1/2 size-3.5 -translate-y-1/2"
            />
            <input
              ref="searchEl"
              v-model="term"
              type="text"
              :placeholder="t('common.search')"
              class="bg-muted/50 focus:bg-background placeholder:text-muted-foreground/60 h-8 w-full rounded-md ps-8 pe-2 text-sm outline-none transition-colors"
              @keydown="onKeydown"
            />
          </div>
        </div>

        <div
          :id="listId"
          ref="listEl"
          role="listbox"
          class="thin-scroll overflow-y-auto overscroll-contain p-1.5"
          :style="{ maxHeight: 'min(20rem, var(--dd-max))' }"
        >
          <div
            v-for="(o, i) in filtered"
            :key="String(o.value)"
            data-option
            role="option"
            :aria-selected="same(o.value, modelValue)"
            :aria-disabled="!!o.disabled"
            class="dd-item relative flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors duration-150 select-none"
            :class="[
              o.disabled && 'pointer-events-none opacity-50',
              i === activeIndex && 'bg-accent text-accent-foreground',
              same(o.value, modelValue) && 'text-primary font-semibold',
            ]"
            :style="{ animationDelay: `${Math.min(i, 8) * 22}ms` }"
            @mousemove="activeIndex = i"
            @click="pick(o)"
          >
            <span
              v-if="same(o.value, modelValue)"
              class="bg-primary absolute inset-y-1.5 start-0 w-0.5 rounded-full"
            />
            <component :is="o.icon" v-if="o.icon" class="size-4 shrink-0" />
            <span class="min-w-0 flex-1 truncate">{{ o.label }}</span>
            <span v-if="o.hint" class="text-muted-foreground shrink-0 text-xs">{{ o.hint }}</span>
            <Check v-if="same(o.value, modelValue)" class="dd-check text-primary size-4 shrink-0" />
          </div>

          <p v-if="!filtered.length" class="text-muted-foreground px-3 py-6 text-center text-xs">
            {{ t('common.noData') }}
          </p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* ── panel: springy drop, mirrored when it flips above the trigger ── */
.dd-down-enter-active,
.dd-up-enter-active {
  transition:
    opacity 0.18s ease-out,
    transform 0.24s cubic-bezier(0.16, 1, 0.3, 1);
}
.dd-down-leave-active,
.dd-up-leave-active {
  transition:
    opacity 0.12s ease-in,
    transform 0.12s ease-in;
}
.dd-down-enter-from,
.dd-down-leave-to {
  opacity: 0;
  transform: translateY(-0.4rem) scale(0.97);
}
.dd-up-enter-from,
.dd-up-leave-to {
  opacity: 0;
  transform: translateY(0.4rem) scale(0.97);
}

/* ── items: staggered fade-in, driven by the inline animation-delay ── */
.dd-item {
  animation: dd-item-in 0.26s cubic-bezier(0.16, 1, 0.3, 1) backwards;
}
@keyframes dd-item-in {
  from {
    opacity: 0;
    transform: translateY(-0.25rem);
  }
}

.dd-check {
  animation: dd-check-in 0.22s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
}
@keyframes dd-check-in {
  from {
    opacity: 0;
    scale: 0.6;
  }
}

@media (prefers-reduced-motion: reduce) {
  .dd-item,
  .dd-check,
  .dd-down-enter-active,
  .dd-up-enter-active,
  .dd-down-leave-active,
  .dd-up-leave-active {
    animation: none;
    transition: none;
  }
}
</style>
