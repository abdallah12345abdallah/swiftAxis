<script setup>
import { ref, computed, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { ChevronDown, Check, Search } from 'lucide-vue-next'
import {
  ComboboxRoot, ComboboxAnchor, ComboboxTrigger, ComboboxPortal, ComboboxContent,
  ComboboxInput, ComboboxViewport, ComboboxItem, ComboboxItemIndicator,
} from 'reka-ui'
import { RTL_LOCALES } from '@/i18n'
import { cn } from '@/lib/utils'

const props = defineProps({
  modelValue: { type: [String, Number, null], default: '' },
  // options: [{ value, label }]
  options: { type: Array, default: () => [] },
  placeholder: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  invalid: { type: Boolean, default: false },
  // true/false forces the in-menu search on/off; null = auto (shown for long lists)
  searchable: { type: Boolean, default: null },
  class: { type: null, default: '' },
})
const emit = defineEmits(['update:modelValue'])

const { t, locale } = useI18n()
const dir = computed(() => (RTL_LOCALES.includes(locale.value) ? 'rtl' : 'ltr'))

/* Reka forbids '' as an item value ('' means "cleared"), but our option lists
   use '' for "all / none" entries — bridge it with a sentinel. */
const EMPTY = ' empty'
const toItem = (v) => (v === '' ? EMPTY : v)
const hasEmptyOption = computed(() => props.options.some((o) => o.value === ''))
const internalValue = computed(() => {
  if (props.modelValue === '' || props.modelValue == null) {
    return hasEmptyOption.value ? EMPTY : undefined
  }
  return props.modelValue
})
function onUpdate(v) {
  emit('update:modelValue', v === EMPTY ? '' : v)
}

const selectedLabel = computed(
  () => props.options.find((o) => toItem(o.value) === internalValue.value)?.label ?? '',
)

/* in-menu search */
const term = ref('')
const searchEl = ref(null)
const showSearch = computed(() => props.searchable ?? props.options.length > 7)
const filtered = computed(() => {
  const q = term.value.trim().toLowerCase()
  if (!q || !showSearch.value) return props.options
  return props.options.filter((o) => String(o.label).toLowerCase().includes(q))
})
function onOpen(open) {
  if (!open) return
  term.value = ''
  if (showSearch.value) nextTick(() => searchEl.value?.$el?.focus())
}

const triggerClasses = computed(() =>
  cn(
    'group flex h-11 w-full cursor-pointer items-center gap-2 rounded-lg border bg-muted/50 ps-3.5 pe-3 text-sm outline-none transition',
    'hover:bg-muted focus:border-primary focus:bg-background focus:ring-4 focus:ring-primary/15',
    'data-[state=open]:border-primary data-[state=open]:bg-background data-[state=open]:ring-4 data-[state=open]:ring-primary/15',
    'disabled:cursor-not-allowed disabled:opacity-60',
    selectedLabel.value ? 'text-foreground' : 'text-muted-foreground',
    props.invalid ? 'border-danger focus:border-danger focus:ring-danger/15 data-[state=open]:border-danger data-[state=open]:ring-danger/15' : 'border-transparent',
    props.class,
  ),
)
</script>

<template>
  <ComboboxRoot
    :model-value="internalValue"
    :dir="dir"
    :disabled="disabled"
    ignore-filter
    @update:model-value="onUpdate"
    @update:open="onOpen"
  >
    <ComboboxAnchor as-child>
      <ComboboxTrigger :class="triggerClasses">
        <span class="truncate text-start">{{ selectedLabel || placeholder }}</span>
        <ChevronDown class="text-muted-foreground ms-auto size-4 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
      </ComboboxTrigger>
    </ComboboxAnchor>

    <ComboboxPortal>
      <ComboboxContent
        position="popper"
        :side-offset="6"
        class="bg-popover text-popover-foreground z-[60] min-w-[var(--reka-combobox-trigger-width)] overflow-hidden rounded-xl border shadow-lg
               data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-top-1"
      >
        <!-- search inside the menu -->
        <div v-if="showSearch" class="border-b p-1.5">
          <div class="relative">
            <Search class="text-muted-foreground pointer-events-none absolute top-1/2 size-3.5 -translate-y-1/2 start-2.5" />
            <ComboboxInput
              ref="searchEl"
              v-model="term"
              :placeholder="t('common.search')"
              class="bg-muted/50 focus:bg-background h-8 w-full rounded-md ps-8 pe-2 text-sm outline-none transition"
            />
          </div>
        </div>

        <ComboboxViewport class="max-h-[min(18rem,var(--reka-combobox-content-available-height))] p-1.5">
          <ComboboxItem
            v-for="o in filtered"
            :key="String(o.value)"
            :value="toItem(o.value)"
            class="data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
          >
            <span class="truncate">{{ o.label }}</span>
            <ComboboxItemIndicator class="text-primary ms-auto">
              <Check class="size-4" />
            </ComboboxItemIndicator>
          </ComboboxItem>

          <p v-if="!filtered.length" class="text-muted-foreground px-3 py-6 text-center text-xs">
            {{ t('common.noData') }}
          </p>
        </ComboboxViewport>
      </ComboboxContent>
    </ComboboxPortal>
  </ComboboxRoot>
</template>
