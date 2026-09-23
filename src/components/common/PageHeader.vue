<script setup>
defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
})
/* Pinned to the top of the sheet; turns into a frosted strip once the page
   scrolls (styles: .page-head in main.css). */
</script>

<template>
  <div class="page-head mb-6 flex flex-wrap items-end justify-between gap-4">
    <div class="min-w-0">
      <h1 class="page-head-title text-2xl font-bold tracking-tight">{{ title }}</h1>
      <p v-if="subtitle" class="page-head-sub text-muted-foreground text-sm">{{ subtitle }}</p>
    </div>
    <div class="flex items-center gap-2">
      <slot name="actions" />
    </div>
  </div>
</template>
