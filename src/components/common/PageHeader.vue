<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { currentScreen } from '@/lib/subScreens'

const props = defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
})
/* Pinned to the top of the sheet; turns into a frosted strip once the page
   scrolls (styles: .page-head in main.css). On a module's screen page the
   screen's own name is the title and the module name sits small above it. */
const { t } = useI18n()
const route = useRoute()
const screen = computed(() => currentScreen(route))
const heading = computed(() => (screen.value ? t(screen.value.labelKey) : props.title))
</script>

<template>
  <div class="page-head mb-6 flex flex-wrap items-end justify-between gap-4">
    <div class="min-w-0">
      <p v-if="screen" class="page-head-sub text-primary text-xs font-bold tracking-wide">{{ title }}</p>
      <h1 class="page-head-title text-2xl font-bold tracking-tight">{{ heading }}</h1>
      <p v-if="subtitle" class="page-head-sub text-muted-foreground text-sm">{{ subtitle }}</p>
    </div>
    <div class="flex items-center gap-2">
      <slot name="actions" />
    </div>
  </div>
</template>
