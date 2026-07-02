<script setup>
defineProps({
  modelValue: { type: [String, Number], default: '' },
  // tabs: [{ value, label, icon? }]
  tabs: { type: Array, default: () => [] },
})
const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <div class="no-scrollbar overflow-x-auto">
    <div class="bg-muted inline-flex rounded-lg p-1">
      <button
        v-for="tb in tabs"
        :key="tb.value"
        type="button"
        class="inline-flex items-center gap-2 rounded-md px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-colors"
        :class="modelValue === tb.value ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'"
        @click="emit('update:modelValue', tb.value)"
      >
        <component :is="tb.icon" v-if="tb.icon" class="size-4" />
        {{ tb.label }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.no-scrollbar { scrollbar-width: none; }
.no-scrollbar::-webkit-scrollbar { display: none; }
</style>
