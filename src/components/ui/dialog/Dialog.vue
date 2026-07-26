<script setup>
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
})
const emit = defineEmits(['update:open'])

const SIZES = { sm: 'sm:max-w-sm', md: 'sm:max-w-lg', lg: 'sm:max-w-2xl' }
</script>

<template>
  <DialogRoot :open="open" @update:open="emit('update:open', $event)">
    <DialogPortal>
      <DialogOverlay class="modal-overlay bg-navy/50 fixed inset-0 z-50 backdrop-blur-sm" />

      <DialogContent
        class="modal-panel bg-card text-card-foreground fixed z-50 flex max-h-[calc(100dvh-2rem)] w-full flex-col overflow-hidden border shadow-2xl outline-none
               inset-x-0 bottom-0 rounded-t-2xl
               sm:bottom-auto sm:inset-x-auto sm:start-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl rtl:sm:translate-x-1/2
               sm:max-h-[calc(100dvh-4rem)]"
        :class="SIZES[size]"
      >
        <!-- header -->
        <div v-if="title || description || $slots.header" class="flex items-start justify-between gap-4 border-b p-5">
          <div class="min-w-0">
            <slot name="header">
              <DialogTitle class="text-lg font-bold tracking-tight">{{ title }}</DialogTitle>
              <DialogDescription v-if="description" class="text-muted-foreground mt-1 text-sm">
                {{ description }}
              </DialogDescription>
            </slot>
          </div>
          <DialogClose
            class="hover:bg-accent text-muted-foreground hover:text-foreground -me-1 -mt-1 inline-flex size-8 shrink-0 items-center justify-center rounded-full transition-colors"
          >
            <X class="size-4" />
          </DialogClose>
        </div>

        <!-- body (scrolls when content is taller than the viewport) -->
        <div class="overflow-y-auto p-5">
          <slot />
        </div>

        <!-- footer -->
        <div v-if="$slots.footer" class="bg-muted/30 flex shrink-0 items-center justify-end gap-2 border-t p-4">
          <slot name="footer" />
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
