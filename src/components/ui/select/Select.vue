<script setup>
import { computed } from 'vue'
import { ChevronDown } from 'lucide-vue-next'
import { cn } from '@/lib/utils'

const props = defineProps({
  modelValue: { type: [String, Number, null], default: '' },
  // options: [{ value, label }]
  options: { type: Array, default: () => [] },
  placeholder: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  invalid: { type: Boolean, default: false },
  class: { type: null, default: '' },
})
const emit = defineEmits(['update:modelValue'])

const classes = computed(() =>
  cn(
    'h-11 w-full appearance-none rounded-lg border bg-muted/50 ps-3.5 pe-9 text-sm outline-none transition',
    'hover:bg-muted focus:border-primary focus:bg-background focus:ring-4 focus:ring-primary/15',
    'disabled:cursor-not-allowed disabled:opacity-60',
    props.modelValue === '' || props.modelValue == null ? 'text-muted-foreground' : 'text-foreground',
    props.invalid ? 'border-danger focus:border-danger focus:ring-danger/15' : 'border-transparent',
    props.class,
  ),
)
</script>

<template>
  <div class="relative">
    <select
      :value="modelValue"
      :disabled="disabled"
      :class="classes"
      @change="emit('update:modelValue', $event.target.value)"
    >
      <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
      <option v-for="o in options" :key="o.value" :value="o.value">{{ o.label }}</option>
    </select>
    <ChevronDown class="text-muted-foreground pointer-events-none absolute top-1/2 size-4 -translate-y-1/2 end-3" />
  </div>
</template>
