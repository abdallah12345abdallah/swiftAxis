<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Search, CornerDownLeft } from 'lucide-vue-next'
import { cn } from '@/lib/utils'

/* Keyboard-first picker for journal lines (account / cost center).
   Type a few digits or letters → matching options open under the field
   (codes that start with what you typed rank first); ↑ / ↓ move, Enter picks
   and asks the page to move on (`next`), Tab picks and leaves, Esc closes (or,
   when already closed, asks the page to clear the line with `escape`).
   Enter on a field that already holds a value moves on without reopening.
   Arabic-Indic digits are understood. The list floats above the page, so a
   scrolling table never clips it. */

const props = defineProps({
  modelValue: { type: String, default: '' },
  // [{ value, code, label, hint? }]
  options: { type: Array, default: () => [] },
  placeholder: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  size: { type: String, default: 'md' }, // md | sm
  class: { type: null, default: '' },
})
const emit = defineEmits(['update:modelValue', 'next', 'escape', 'enter-empty', 'keydown'])
const { t } = useI18n()

const inputEl = ref(null)
const listEl = ref(null)
const focused = ref(false)
const open = ref(false)
const query = ref('')
const active = ref(0)
const pos = ref({ top: 0, left: 0, width: 0, up: false })

const selected = computed(() => props.options.find((o) => o.value === props.modelValue) ?? null)
const display = computed(() => (selected.value ? `${selected.value.code ? selected.value.code + ' — ' : ''}${selected.value.label}` : ''))

// what the input shows: the choice at rest, the typed text while editing
const text = computed({
  get: () => (focused.value ? query.value : display.value),
  set: (v) => (query.value = v),
})

const norm = (s) =>
  String(s ?? '')
    .replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d))
    .replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d))
    .toLowerCase()
    .trim()
const q = computed(() => {
  const v = norm(query.value)
  return v && v !== norm(display.value) ? v : ''
})
const filtered = computed(() => {
  const s = q.value
  if (!s) return props.options.slice(0, 60)
  return props.options
    .map((o) => {
      const code = norm(o.code)
      const label = norm(o.label)
      const score = code.startsWith(s) ? 0 : label.startsWith(s) ? 1 : code.includes(s) ? 2 : label.includes(s) ? 3 : norm(o.hint).includes(s) ? 4 : -1
      return { o, score }
    })
    .filter((x) => x.score >= 0)
    .sort((a, b) => a.score - b.score || String(a.o.code).localeCompare(String(b.o.code), undefined, { numeric: true }))
    .slice(0, 60)
    .map((x) => x.o)
})

// split a text around what was typed, to highlight it in the list
function parts(txt) {
  const s = q.value
  const src = String(txt ?? '')
  if (!s) return [{ t: src, hit: false }]
  const i = norm(src).indexOf(s)
  if (i < 0) return [{ t: src, hit: false }]
  return [{ t: src.slice(0, i), hit: false }, { t: src.slice(i, i + s.length), hit: true }, { t: src.slice(i + s.length), hit: false }]
}

function place() {
  const r = inputEl.value?.getBoundingClientRect()
  if (!r) return
  const below = window.innerHeight - r.bottom
  const up = below < 280 && r.top > below
  const width = Math.min(Math.max(r.width, 300), window.innerWidth - 16)
  // line the list up with the field's start edge (the right one in Arabic), inside the screen
  const rtl = getComputedStyle(inputEl.value).direction === 'rtl'
  const left = Math.max(8, Math.min(rtl ? r.right - width : r.left, window.innerWidth - width - 8))
  pos.value = { top: up ? r.top - 6 : r.bottom + 6, left, width, up }
}
function openList() {
  if (props.disabled) return
  open.value = true
  active.value = Math.max(0, filtered.value.findIndex((o) => o.value === props.modelValue))
  nextTick(() => {
    place()
    scrollActive()
  })
}
function close() {
  open.value = false
}
function scrollActive() {
  nextTick(() => listEl.value?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' }))
}
function pick(o) {
  emit('update:modelValue', o.value)
  query.value = `${o.code ? o.code + ' — ' : ''}${o.label}`
  close()
}

function onInput(e) {
  query.value = e.target.value
  active.value = 0
  if (!open.value) openList()
  else nextTick(place)
}
function onFocus() {
  focused.value = true
  query.value = display.value
  nextTick(() => inputEl.value?.select())
}
function onBlur() {
  focused.value = false
  // cleared on purpose → clear the value; anything else unpicked reverts
  if (!norm(query.value) && props.modelValue) emit('update:modelValue', '')
  close()
}
function onKeydown(e) {
  emit('keydown', e)
  if (e.defaultPrevented) return
  // with a modifier held the key belongs to the page (Ctrl+Enter, Ctrl+S, Alt+↑ …)
  if (e.ctrlKey || e.metaKey || e.altKey) return
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    if (!open.value) return openList()
    active.value = Math.min(active.value + 1, filtered.value.length - 1)
    scrollActive()
  } else if (e.key === 'ArrowUp') {
    if (!open.value) return
    e.preventDefault()
    active.value = Math.max(active.value - 1, 0)
    scrollActive()
  } else if (e.key === 'Enter') {
    e.preventDefault()
    if (e.isComposing) return // an input method is still composing
    if (open.value && filtered.value.length) {
      // keyboard pick: choose, then move on once the choice has landed
      pick(filtered.value[active.value] ?? filtered.value[0])
      nextTick(() => emit('next'))
    } else if (q.value) {
      // typed something that matches nothing: stay and show it
      openList()
    } else if (props.modelValue) {
      close()
      emit('next')
    } else {
      emit('enter-empty')
    }
  } else if (e.key === 'Tab') {
    if (open.value && q.value && filtered.value.length) pick(filtered.value[active.value] ?? filtered.value[0])
  } else if (e.key === 'Escape') {
    if (open.value) {
      e.preventDefault()
      query.value = display.value
      close()
    } else emit('escape')
  }
}

function onScroll() {
  if (open.value) place()
}
watch(open, (v) => {
  if (v) {
    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', onScroll)
  } else {
    window.removeEventListener('scroll', onScroll, true)
    window.removeEventListener('resize', onScroll)
  }
})
onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll, true)
  window.removeEventListener('resize', onScroll)
})

defineExpose({ focus: () => inputEl.value?.focus() })
</script>

<template>
  <div :class="cn('qp relative', props.class)">
    <Search class="text-muted-foreground pointer-events-none absolute top-1/2 -translate-y-1/2" :class="size === 'sm' ? 'size-3.5 start-2.5' : 'size-4 start-3'" />
    <input
      ref="inputEl"
      :value="text"
      :placeholder="placeholder"
      :disabled="disabled"
      type="text"
      autocomplete="off"
      spellcheck="false"
      role="combobox"
      :aria-expanded="open"
      class="qp-input w-full rounded-lg border bg-card text-sm outline-none transition-colors"
      :class="[size === 'sm' ? 'h-9 ps-8 pe-2' : 'h-11 ps-9 pe-3', selected && !focused && 'font-semibold']"
      @input="onInput"
      @focus="onFocus"
      @blur="onBlur"
      @keydown="onKeydown"
    />

    <Teleport to="body">
      <Transition name="qp-pop">
        <div
          v-if="open"
          class="qp-panel bg-popover text-popover-foreground fixed z-[70] overflow-hidden rounded-xl border"
          :style="{ top: `${pos.top}px`, left: `${pos.left}px`, width: `${pos.width}px`, transform: pos.up ? 'translateY(-100%)' : 'none' }"
          @mousedown.prevent
        >
          <div ref="listEl" role="listbox" class="thin-scroll max-h-64 overflow-y-auto p-1">
            <button
              v-for="(o, i) in filtered"
              :key="o.value"
              type="button"
              role="option"
              tabindex="-1"
              :aria-selected="o.value === modelValue"
              :data-active="i === active"
              class="qp-opt flex w-full cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 text-start text-sm"
              @mouseenter="active = i"
              @click="pick(o)"
            >
              <span v-if="o.code" dir="ltr" class="qp-code shrink-0 font-mono text-xs font-bold tabular-nums">
                <template v-for="(p, k) in parts(o.code)" :key="k"><mark v-if="p.hit">{{ p.t }}</mark><template v-else>{{ p.t }}</template></template>
              </span>
              <span class="min-w-0 flex-1 truncate">
                <template v-for="(p, k) in parts(o.label)" :key="k"><mark v-if="p.hit">{{ p.t }}</mark><template v-else>{{ p.t }}</template></template>
              </span>
              <span v-if="o.hint" class="text-muted-foreground shrink-0 text-[11px]">{{ o.hint }}</span>
              <CornerDownLeft v-if="i === active" class="text-primary size-3.5 shrink-0" />
            </button>
            <p v-if="!filtered.length" class="text-muted-foreground px-3 py-5 text-center text-xs">{{ t('journal.kb.noMatch') }}</p>
          </div>
          <div class="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 border-t px-3 py-1.5 text-[11px]">
            <span><kbd>↑</kbd><kbd>↓</kbd> {{ t('journal.kb.move') }}</span>
            <span><kbd>Enter</kbd> {{ t('journal.kb.pick') }}</span>
            <span><kbd>Esc</kbd> {{ t('journal.kb.close') }}</span>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.qp-input { border-color: var(--border); }
.qp-input:hover { border-color: color-mix(in srgb, var(--primary) 40%, var(--border)); }
.qp-input:focus { border-color: var(--primary); background: var(--card); }
.qp-panel { box-shadow: 0 18px 40px -18px color-mix(in srgb, var(--navy) 45%, transparent); }
.qp-opt[data-active='true'] { background: color-mix(in srgb, var(--primary) 10%, transparent); box-shadow: inset 3px 0 0 var(--primary); }
[dir='rtl'] .qp-opt[data-active='true'] { box-shadow: inset -3px 0 0 var(--primary); }
.qp-code { color: color-mix(in srgb, var(--brand) 85%, var(--foreground)); }
mark { background: color-mix(in srgb, var(--primary) 22%, transparent); color: inherit; border-radius: 3px; padding-inline: 1px; }
kbd { display: inline-block; min-width: 1.25rem; margin-inline-end: 2px; padding: 0 4px; border: 1px solid var(--border); border-bottom-width: 2px; border-radius: 4px; background: var(--card); font-family: inherit; font-size: 10px; text-align: center; }
.qp-pop-enter-active { transition: opacity 0.14s ease, translate 0.14s ease; }
.qp-pop-leave-active { transition: opacity 0.1s ease; }
.qp-pop-enter-from { opacity: 0; translate: 0 -4px; }
.qp-pop-leave-to { opacity: 0; }
</style>
