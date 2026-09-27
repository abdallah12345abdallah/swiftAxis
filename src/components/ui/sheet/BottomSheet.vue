<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { cn } from '@/lib/utils'

/* The bottom sheet the phone layouts share: a scrim, a grabber that can be
   dragged down to dismiss, and a panel rising from the bottom edge clear of
   the home bar. It only draws a sheet — the caller decides when a sheet is the
   right shape, since every one of them is a popover or a tray on a wider
   screen. */
const props = defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: '' },
  class: { type: null, default: '' },
})
const emit = defineEmits(['update:open'])
const { t } = useI18n()
const close = () => emit('update:open', false)

/* drag: the panel follows the finger, and a long enough pull dismisses it.
   Anything shorter springs back. */
const dragY = ref(0)
let dragFrom = null
function onGrab(e) {
  dragFrom = e.clientY
  dragY.value = 0
  e.currentTarget.setPointerCapture?.(e.pointerId)
}
function onGrabMove(e) {
  if (dragFrom === null) return
  dragY.value = Math.max(0, e.clientY - dragFrom)
}
function onGrabEnd() {
  if (dragFrom === null) return
  const dy = dragY.value
  dragFrom = null
  dragY.value = 0
  if (dy > 110) close()
}
/* while a drag is in progress the panel must track the finger, not animate */
const panelStyle = computed(() => (dragY.value ? { transform: `translateY(${dragY.value}px)`, transition: 'none' } : {}))

function onKey(e) {
  if (e.key === 'Escape' && props.open) close()
}
onMounted(() => document.addEventListener('keydown', onKey))
onBeforeUnmount(() => document.removeEventListener('keydown', onKey))
</script>

<template>
  <Teleport to="body">
    <Transition name="sheet-fade">
      <div v-if="open" class="bg-navy/50 fixed inset-0 z-[59] backdrop-blur-sm" @click="close" />
    </Transition>

    <Transition name="sheet-rise">
      <div
        v-if="open"
        role="dialog"
        :aria-label="title || undefined"
        :class="cn('sheet-panel bg-card text-card-foreground fixed inset-x-0 bottom-0 z-[60] flex max-h-[92dvh] flex-col rounded-t-3xl border-t', props.class)"
        :style="panelStyle"
      >
        <button
          type="button"
          class="sheet-grab flex w-full shrink-0 cursor-grab touch-none items-center justify-center pt-2.5 pb-1"
          :aria-label="t('common.close')"
          @pointerdown="onGrab"
          @pointermove="onGrabMove"
          @pointerup="onGrabEnd"
          @pointercancel="onGrabEnd"
        >
          <span class="bg-border block h-1 w-10 rounded-full" />
        </button>

        <p v-if="title" class="shrink-0 px-4 pt-1 pb-2 text-[15px] font-bold">{{ title }}</p>

        <div class="min-h-0 flex-1 overflow-y-auto px-4 pt-1 pb-3"><slot /></div>

        <div v-if="$slots.footer" class="flex shrink-0 items-center gap-2 border-t px-4 py-3">
          <slot name="footer" />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.sheet-panel {
  padding-bottom: env(safe-area-inset-bottom, 0px);
  box-shadow: 0 -18px 40px -16px color-mix(in srgb, var(--navy) 55%, transparent);
}
.sheet-grab span { transition: background-color 0.15s; }
.sheet-grab:active span { background: var(--muted-foreground); }

/* the rise animates `translate`, never `transform`, so a drag (which sets an
   inline transform) cannot fight the transition */
.sheet-rise-enter-active { transition: opacity 0.25s ease, translate 0.32s cubic-bezier(0.2, 0.9, 0.3, 1.05); }
.sheet-rise-leave-active { transition: opacity 0.18s ease, translate 0.2s ease; }
.sheet-rise-enter-from, .sheet-rise-leave-to { opacity: 0; translate: 0 100%; }
.sheet-fade-enter-active, .sheet-fade-leave-active { transition: opacity 0.2s ease; }
.sheet-fade-enter-from, .sheet-fade-leave-to { opacity: 0; }

@media (prefers-reduced-motion: reduce) {
  .sheet-rise-enter-active, .sheet-rise-leave-active,
  .sheet-fade-enter-active, .sheet-fade-leave-active { transition: none !important; }
}
</style>
