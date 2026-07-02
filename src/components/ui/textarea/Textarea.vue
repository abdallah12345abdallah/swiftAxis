<script setup>
import { computed } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  placeholder: { type: String, default: '' },
  rows: { type: Number, default: 3 },
  disabled: { type: Boolean, default: false },
  invalid: { type: Boolean, default: false },
  class: { type: null, default: '' },
})
const emit = defineEmits(['update:modelValue'])

const classes = computed(() =>
  cn(
    'w-full rounded-lg border bg-muted/50 px-3.5 py-2.5 text-sm outline-none transition placeholder:text-muted-foreground/60',
    'hover:bg-muted focus:border-primary focus:bg-background focus:ring-4 focus:ring-primary/15',
    'disabled:cursor-not-allowed disabled:opacity-60 resize-y',
    props.invalid ? 'border-danger focus:border-danger focus:ring-danger/15' : 'border-transparent',
    props.class,
  ),
)
</script>

<template>
  <textarea
    :value="modelValue"
    :placeholder="placeholder"
    :rows="rows"
    :disabled="disabled"
    :class="classes"
    @input="emit('update:modelValue', $event.target.value)"
  />
</template>
