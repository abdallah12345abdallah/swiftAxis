<script setup>
import { watch, onUnmounted } from 'vue'
import { X } from 'lucide-vue-next'

const props = defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  size: { type: String, default: 'md' }, // sm | md | lg
})
const emit = defineEmits(['update:open'])

const SIZES = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' }

function close() {
  emit('update:open', false)
}
function onKey(e) {
  if (e.key === 'Escape') close()
}

watch(
  () => props.open,
  (v) => {
    if (typeof document === 'undefined') return
    document.documentElement.style.overflow = v ? 'hidden' : ''
    if (v) window.addEventListener('keydown', onKey)
    else window.removeEventListener('keydown', onKey)
  },
)
onUnmounted(() => {
  window.removeEventListener('keydown', onKey)
  if (typeof document !== 'undefined') document.documentElement.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <Transition name="dialog">
      <div v-if="open" class="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
        <!-- backdrop -->
        <div class="absolute inset-0 bg-navy/50 backdrop-blur-sm" @click="close" />

        <!-- panel -->
        <div
          class="dialog-panel bg-card text-card-foreground relative z-10 w-full rounded-2xl border shadow-2xl"
          :class="SIZES[size]"
          role="dialog"
          aria-modal="true"
        >
          <div v-if="title || $slots.header" class="flex items-start justify-between gap-4 border-b p-5">
            <div class="min-w-0">
              <slot name="header">
                <h2 class="text-lg font-bold tracking-tight">{{ title }}</h2>
                <p v-if="description" class="text-muted-foreground mt-1 text-sm">{{ description }}</p>
              </slot>
            </div>
            <button
              type="button"
              class="hover:bg-accent text-muted-foreground -me-1 -mt-1 inline-flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors"
              @click="close"
            >
              <X class="size-4" />
            </button>
          </div>

          <div class="p-5">
            <slot />
          </div>

          <div v-if="$slots.footer" class="bg-muted/30 flex items-center justify-end gap-2 rounded-b-2xl border-t p-4">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.dialog-enter-active,
.dialog-leave-active {
  transition: opacity 0.2s ease;
}
.dialog-enter-active .dialog-panel,
.dialog-leave-active .dialog-panel {
  transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.25s ease;
}
.dialog-enter-from,
.dialog-leave-to {
  opacity: 0;
}
.dialog-enter-from .dialog-panel,
.dialog-leave-to .dialog-panel {
  opacity: 0;
  transform: translateY(16px) scale(0.97);
}

@media (prefers-reduced-motion: reduce) {
  .dialog-enter-active .dialog-panel,
  .dialog-leave-active .dialog-panel {
    transition: none;
  }
}
</style>
