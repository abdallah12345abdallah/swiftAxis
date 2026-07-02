<script setup>
import { computed } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  type: { type: String, default: 'text' },
  placeholder: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  invalid: { type: Boolean, default: false },
  class: { type: null, default: '' },
})
const emit = defineEmits(['update:modelValue'])

const classes = computed(() =>
  cn(
    'h-11 w-full rounded-lg border bg-muted/50 px-3.5 text-sm outline-none transition placeholder:text-muted-foreground/60',
    'hover:bg-muted focus:border-primary focus:bg-background focus:ring-4 focus:ring-primary/15',
    'disabled:cursor-not-allowed disabled:opacity-60',
    props.invalid ? 'border-danger focus:border-danger focus:ring-danger/15' : 'border-transparent',
    props.class,
  ),
)
</script>

<template>
  <input
    :type="type"
    :value="modelValue"
    :placeholder="placeholder"
    :disabled="disabled"
    :class="classes"
    @input="emit('update:modelValue', $event.target.value)"
  />
</template>
