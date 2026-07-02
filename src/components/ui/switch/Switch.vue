<script setup>
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue'])

function toggle() {
  if (!props.disabled) emit('update:modelValue', !props.modelValue)
}
</script>

<template>
  <button
    type="button"
    role="switch"
    :aria-checked="modelValue"
    :disabled="disabled"
    class="focus-visible:ring-primary/40 relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors outline-none focus-visible:ring-4 disabled:opacity-60"
    :class="modelValue ? 'bg-primary' : 'bg-muted-foreground/30'"
    @click="toggle"
  >
    <span
      class="bg-background inline-block size-5 rounded-full shadow-sm transition-transform"
      :class="modelValue ? 'translate-x-[1.375rem] rtl:-translate-x-[1.375rem]' : 'translate-x-0.5 rtl:-translate-x-0.5'"
    />
  </button>
</template>
