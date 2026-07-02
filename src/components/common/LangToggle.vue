<script setup>
import { Languages } from 'lucide-vue-next'
import { useUiStore } from '@/stores/ui'

const ui = useUiStore()
</script>

<template>
  <button
    type="button"
    class="hover:bg-accent hover:text-accent-foreground text-muted-foreground inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm font-semibold transition-colors"
    aria-label="Toggle language"
    @click="ui.toggleLocale()"
  >
    <Languages class="size-4" />
    {{ ui.locale === 'ar' ? 'EN' : 'ع' }}
  </button>
</template>
