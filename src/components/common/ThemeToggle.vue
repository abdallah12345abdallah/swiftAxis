<script setup>
import { Sun, Moon } from 'lucide-vue-next'
import { useUiStore } from '@/stores/ui'

const ui = useUiStore()
</script>

<template>
  <button
    type="button"
    class="hover:bg-accent hover:text-accent-foreground text-muted-foreground inline-flex size-9 items-center justify-center rounded-lg transition-colors"
    :aria-label="ui.isDark ? 'Light mode' : 'Dark mode'"
    @click="ui.toggleTheme()"
  >
    <Moon v-if="!ui.isDark" class="size-5" />
    <Sun v-else class="size-5" />
  </button>
</template>
