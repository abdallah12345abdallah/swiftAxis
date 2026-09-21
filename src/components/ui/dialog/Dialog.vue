<script setup>
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { X } from 'lucide-vue-next'
import {
  DialogRoot, DialogPortal, DialogOverlay, DialogContent,
  DialogTitle, DialogDescription, DialogClose,
} from 'reka-ui'

const props = defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  size: { type: String, default: 'md' }, // sm | md | lg
  // optional lucide component shown in a tinted chip beside the title
  icon: { type: [Object, Function], default: null },
  // "Origin Morph": grow the panel out of the element that opened it.
  // Defaults to whatever had focus (the button just clicked); pass an element
  // or a selector to override, or morph=false to opt out.
  morph: { type: Boolean, default: true },
  origin: { type: [String, Object], default: null },
})
const emit = defineEmits(['update:open'])

const SIZES = { sm: 'sm:max-w-sm', md: 'sm:max-w-lg', lg: 'sm:max-w-2xl' }

/* ── scroll-aware chrome ─────────────────────────────────────────────
   The header and footer rules stay invisible until there is actually
   content hidden behind them, so a short form reads as one clean sheet
   and a long one gets the separation it needs. */
const bodyRef = ref(null)
const contentRef = ref(null)
const headStuck = ref(false)
const footStuck = ref(false)
let ro = null

function measure() {
  const el = bodyRef.value
  if (!el) {
    headStuck.value = false
    footStuck.value = false
    return
  }
  headStuck.value = el.scrollTop > 2
  footStuck.value = el.scrollHeight - el.clientHeight - el.scrollTop > 2
}

/* ── Origin Morph ────────────────────────────────────────────────────
   The View Transitions API animates between two DOM states, so the open/
   close switch has to happen *inside* its callback — hence the internal
   `innerOpen` that Reka binds to, driven by the `open` prop.
   No support, small screens (where the panel is a bottom sheet) or reduced
   motion all fall through to the CSS animations below. */
const MORPH = 'sa-modal-morph'
const innerOpen = ref(props.open)
let originEl = null
let running = null

const canMorph = () =>
  props.morph &&
  typeof document !== 'undefined' &&
  typeof document.startViewTransition === 'function' &&
  window.matchMedia('(min-width: 40rem)').matches &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches

function resolveOrigin() {
  if (props.origin) {
    const el = typeof props.origin === 'string' ? document.querySelector(props.origin) : props.origin
    return el instanceof HTMLElement ? el : null
  }
  const el = document.activeElement
  return el instanceof HTMLElement && el !== document.body ? el : null
}

const panelEl = () => document.querySelector('[data-sa-panel]')
const overlayEl = () => document.querySelector('[data-sa-overlay]')
const setName = (el, name) => {
  if (el) el.style.viewTransitionName = name
}
/* The morph already presented these, so their own keyframes must stay off for
   good — dropping the html.sa-morphing class would otherwise flip `animation`
   from none back to panel-in and play the whole spring a second time. */
const markMorphed = (el) => el?.setAttribute('data-morphed', '')

watch(
  () => props.open,
  (val) => {
    if (!canMorph()) {
      innerOpen.value = val
      return
    }

    // the element that carries the morph in the "before" snapshot
    const from = val ? (originEl = resolveOrigin()) : panelEl()
    if (!from) {
      innerOpen.value = val
      return
    }
    setName(from, MORPH)

    running?.skipTransition?.()
    document.documentElement.classList.add('sa-morphing')

    const vt = document.startViewTransition(async () => {
      setName(from, '')
      innerOpen.value = val
      await nextTick()
      await nextTick() // let Reka mount/unmount the portal before the snapshot

      // …and the element that carries it in the "after" snapshot. On close the
      // trigger may be gone (a saved row re-rendered) — then the panel simply
      // fades out instead of morphing back.
      let to = null
      if (val) {
        to = panelEl()
        markMorphed(to)
        markMorphed(overlayEl())
      } else if (originEl && document.contains(originEl)) {
        to = originEl
      }
      setName(to, MORPH)
    })
    running = vt

    vt.finished
      .catch(() => {})
      .finally(() => {
        document.documentElement.classList.remove('sa-morphing')
        setName(panelEl(), '')
        setName(originEl, '')
        if (!val) originEl = null
        running = null
      })
  },
)

/* re-measure the chrome whenever the panel opens or its content resizes
   (declared here because it watches `innerOpen` from the block above) */
watch(innerOpen, async (open) => {
  ro?.disconnect()
  ro = null
  if (!open) return
  await nextTick()
  measure()
  if (contentRef.value && typeof ResizeObserver !== 'undefined') {
    ro = new ResizeObserver(measure)
    ro.observe(contentRef.value)
  }
})
onBeforeUnmount(() => ro?.disconnect())
</script>

<template>
  <DialogRoot :open="innerOpen" @update:open="emit('update:open', $event)">
    <DialogPortal>
      <DialogOverlay data-sa-overlay class="modal-overlay bg-navy/50 fixed inset-0 z-50 backdrop-blur-sm" />

      <DialogContent
        data-sa-panel
        class="modal-panel bg-card text-card-foreground fixed z-50 flex max-h-[calc(100dvh-2rem)] w-full flex-col overflow-hidden border shadow-2xl outline-none
               inset-x-0 bottom-0 rounded-t-2xl
               sm:bottom-auto sm:inset-x-auto sm:start-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl rtl:sm:translate-x-1/2
               sm:max-h-[calc(100dvh-4rem)]"
        :class="SIZES[size]"
      >
        <!-- header — rule appears only once content scrolls beneath it -->
        <div
          v-if="title || description || $slots.header"
          class="flex shrink-0 items-start gap-3.5 border-b px-5 pt-5 pb-4 transition-colors duration-200"
          :class="headStuck ? 'border-border' : 'border-transparent'"
        >
          <span
            v-if="icon"
            class="bg-primary/10 text-primary mt-0.5 grid size-10 shrink-0 place-items-center rounded-xl"
          >
            <component :is="icon" class="size-5" />
          </span>

          <div class="min-w-0 flex-1">
            <slot name="header">
              <DialogTitle class="text-lg leading-tight font-bold tracking-tight">{{ title }}</DialogTitle>
              <DialogDescription v-if="description" class="text-muted-foreground mt-1.5 text-[13px] leading-relaxed">
                {{ description }}
              </DialogDescription>
            </slot>
          </div>

          <DialogClose
            class="hover:bg-accent text-muted-foreground hover:text-foreground -me-1.5 -mt-1.5 inline-flex size-9 shrink-0 items-center justify-center rounded-full transition-all duration-200 hover:rotate-90"
          >
            <X class="size-4" />
          </DialogClose>
        </div>

        <!-- body (scrolls when content is taller than the viewport) -->
        <div ref="bodyRef" class="overflow-y-auto px-5 pt-4 pb-5" @scroll.passive="measure">
          <div ref="contentRef"><slot /></div>
        </div>

        <!-- footer — tinted only while content is still hidden below it;
             actions stretch to full width on phones -->
        <div
          v-if="$slots.footer || $slots['footer-start']"
          class="flex shrink-0 flex-wrap items-center gap-2 border-t px-5 py-4 transition-colors duration-200"
          :class="footStuck ? 'bg-muted/30 border-border' : 'border-transparent'"
        >
          <div v-if="$slots['footer-start']" class="text-muted-foreground min-w-0 text-xs">
            <slot name="footer-start" />
          </div>
          <div class="ms-auto flex flex-1 items-center justify-end gap-2 [&>button]:flex-1 sm:[&>button]:flex-none">
            <slot name="footer" />
          </div>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

<style scoped>
/* ── overlay: soft fade ─────────────────────────────────── */
.modal-overlay[data-state='open'] {
  animation: overlay-in 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
.modal-overlay[data-state='closed'] {
  animation: overlay-out 0.2s ease-in forwards;
}
@keyframes overlay-in {
  from { opacity: 0; }
}
@keyframes overlay-out {
  to { opacity: 0; }
}

/* ── panel: mobile = bottom sheet slide, desktop = springy rise with blur-to-sharp ──
   Tailwind v4 centers via the standalone `translate` property, so the keyframes
   must animate `translate`/`scale` (not `transform`) or the two would stack. */
.modal-panel[data-state='open'] {
  animation: sheet-in 0.45s cubic-bezier(0.16, 1, 0.3, 1);
}
.modal-panel[data-state='closed'] {
  animation: sheet-out 0.22s ease-in forwards;
}
@keyframes sheet-in {
  from { opacity: 0; translate: 0 100%; }
}
@keyframes sheet-out {
  to { opacity: 0; translate: 0 100%; }
}

@media (min-width: 40rem) {
  .modal-panel[data-state='open'] {
    animation: panel-in 0.45s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .modal-panel[data-state='closed'] {
    animation: panel-out 0.2s ease-in forwards;
  }
}
@keyframes panel-in {
  from { opacity: 0; translate: var(--modal-x, -50%) -42%; scale: 0.94; filter: blur(6px); }
  to { opacity: 1; translate: var(--modal-x, -50%) -50%; scale: 1; filter: blur(0); }
}
@keyframes panel-out {
  from { opacity: 1; translate: var(--modal-x, -50%) -50%; scale: 1; }
  to { opacity: 0; translate: var(--modal-x, -50%) -46%; scale: 0.97; filter: blur(4px); }
}
[dir='rtl'] .modal-panel {
  --modal-x: 50%;
}

@media (prefers-reduced-motion: reduce) {
  .modal-overlay[data-state='open'],
  .modal-overlay[data-state='closed'],
  .modal-panel[data-state='open'],
  .modal-panel[data-state='closed'] {
    animation: none;
  }
}
</style>

<style>
/* ── Origin Morph ───────────────────────────────────────────────────────
   Global on purpose: ::view-transition-* pseudo-elements hang off the
   document root, so a scoped attribute selector would never match them. */

/* while a morph runs, the fallback keyframes must not fight it — and Reka
   only unmounts the panel synchronously when no exit animation is pending */
html.sa-morphing .modal-panel,
html.sa-morphing .modal-overlay,
.modal-panel[data-morphed],
.modal-overlay[data-morphed] {
  animation: none !important;
}

::view-transition-group(sa-modal-morph) {
  animation-duration: 0.42s;
  animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
}
/* cover instead of the default stretch, so neither snapshot squashes
   while the group box travels from the button's rect to the panel's.

   mix-blend-mode is the important one: the UA defaults these to
   plus-lighter, which only looks right while the two opacities sum to 1.
   Custom timings break that pairing, and the snapshots add together into a
   bright flash — so blend normally and let the new one dissolve over the old. */
::view-transition-old(sa-modal-morph),
::view-transition-new(sa-modal-morph) {
  height: 100%;
  overflow: clip;
  object-fit: cover;
  mix-blend-mode: normal;
}
/* the new snapshot dissolves in on top while the old stays opaque beneath it,
   so the morphing box is never partly see-through */
::view-transition-old(sa-modal-morph) {
  animation: sa-morph-out 0.18s linear 0.22s forwards;
}
::view-transition-new(sa-modal-morph) {
  animation: sa-morph-in 0.22s linear both;
}
@keyframes sa-morph-out {
  to { opacity: 0; }
}
@keyframes sa-morph-in {
  from { opacity: 0; }
}

@media (prefers-reduced-motion: reduce) {
  ::view-transition-group(sa-modal-morph),
  ::view-transition-old(sa-modal-morph),
  ::view-transition-new(sa-modal-morph) {
    animation: none;
  }
}
</style>
