<script setup>
import { CheckCircle2, XCircle, Info, X } from 'lucide-vue-next'
import { toastState, useToast } from '@/composables/useToast'

const { dismiss } = useToast()

const ICON = { success: CheckCircle2, error: XCircle, info: Info }
const TONE = {
  success: 'border-success/30 text-success',
  error: 'border-danger/30 text-danger',
  info: 'border-primary/30 text-primary',
}
</script>

<template>
  <Teleport to="body">
    <div class="pointer-events-none fixed bottom-4 z-[60] flex flex-col gap-2 end-4">
      <TransitionGroup name="toast">
        <div
          v-for="t in toastState.items"
          :key="t.id"
          class="bg-card text-card-foreground pointer-events-auto flex items-center gap-3 rounded-xl border px-4 py-3 shadow-lg"
          :class="TONE[t.type]"
        >
          <component :is="ICON[t.type]" class="size-5 shrink-0" />
          <p class="text-foreground text-sm font-medium">{{ t.message }}</p>
          <button type="button" class="hover:bg-accent text-muted-foreground ms-2 rounded-md p-1" @click="dismiss(t.id)">
            <X class="size-3.5" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(12px);
}
</style>
