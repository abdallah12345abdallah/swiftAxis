<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps({
  // 'start' | 'end' — logical alignment (RTL-aware via inset-inline)
  align: { type: String, default: 'end' },
  contentClass: { type: null, default: '' },
})

const open = ref(false)
const root = ref(null)

function toggle() {
  open.value = !open.value
}
function close() {
  open.value = false
}
function onDocClick(e) {
  if (root.value && !root.value.contains(e.target)) close()
}
function onKey(e) {
  if (e.key === 'Escape') close()
}

onMounted(() => {
  document.addEventListener('click', onDocClick)
  document.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', onDocClick)
  document.removeEventListener('keydown', onKey)
})
</script>

<template>
  <div ref="root" class="relative inline-flex">
    <div @click="toggle">
      <slot name="trigger" :open="open" />
    </div>

    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 scale-95 -translate-y-1"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="open"
        :class="
          cn(
            'bg-popover text-popover-foreground absolute top-full z-50 mt-2 min-w-52 overflow-hidden rounded-xl border p-1.5 shadow-lg',
            props.align === 'end' ? 'end-0' : 'start-0',
            props.contentClass,
          )
        "
        @click="close"
      >
        <slot :close="close" />
      </div>
    </Transition>
  </div>
</template>
