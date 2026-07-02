<script setup>
import { Sun, Moon } from 'lucide-vue-next'
import { useUiStore } from '@/stores/ui'

const ui = useUiStore()
</script>

<template>
  <button
    type="button"
    class="border-border bg-card/50 hover:bg-accent text-muted-foreground hover:text-foreground group relative inline-flex size-9 items-center justify-center overflow-hidden rounded-lg border transition-colors"
    :aria-label="ui.isDark ? 'Light mode' : 'Dark mode'"
    @click="ui.toggleTheme()"
  >
    <span class="relative block size-5">
      <Sun
        class="absolute inset-0 size-5 transition-all duration-300 ease-out"
        :class="ui.isDark ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'"
      />
      <Moon
        class="absolute inset-0 size-5 transition-all duration-300 ease-out"
        :class="ui.isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'"
      />
    </span>
  </button>
</template>
