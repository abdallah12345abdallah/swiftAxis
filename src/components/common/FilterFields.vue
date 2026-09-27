<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { X } from 'lucide-vue-next'
import { Dropdown } from '@/components/ui/dropdown'

/* The filter controls themselves, so the tray on a wide screen and the sheet
   on a phone show the same fields instead of two copies that drift apart.
   `stacked` is the sheet's shape: one full-width field per line, tall enough
   for a thumb. Without it they are chips that share a row. */
const props = defineProps({
  // [{ key, label, options: [{ value, label }], searchable? }]
  //   or a typed field: { key, label, type: 'number' | 'text' }
  filters: { type: Array, default: () => [] },
  // { [key]: value } — '' / null means "not filtering"
  modelValue: { type: Object, default: () => ({}) },
  stacked: { type: Boolean, default: false },
  tabindex: { type: Number, default: 0 },
})
const emit = defineEmits(['update:modelValue'])
const { t } = useI18n()

const isBlank = (v) => v === '' || v === null || v === undefined
const hasValue = (key) => !isBlank(props.modelValue[key])

function set(key, value) {
  emit('update:modelValue', { ...props.modelValue, [key]: value ?? '' })
}
// typed number fields keep digits only (Arabic-Indic digits are converted)
function onType(f, e) {
  let v = e.target.value
  if (f.type === 'number') {
    v = v.replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[^0-9.]/g, '')
    if (v !== e.target.value) e.target.value = v
  }
  set(f.key, v)
}

const fieldClass = computed(() => (props.stacked ? 'h-12 w-full' : 'h-10 w-auto min-w-[170px] flex-1 sm:flex-none'))
</script>

<template>
  <template v-for="(f, i) in filters" :key="f.key">
    <!-- typed field: the same box as a dropdown filter — its name, then the
         value typed inline, and a clear × once something is typed -->
    <label
      v-if="f.type"
      class="fb-chip fb-field focus-within:border-primary flex cursor-text items-center gap-1.5 rounded-lg border ps-3.5 pe-2 text-sm transition-colors"
      :class="[fieldClass, hasValue(f.key) ? 'border-primary/50 bg-primary/5' : 'bg-card border-border hover:border-primary/40']"
      :style="{ '--i': i }"
    >
      <span class="shrink-0" :class="hasValue(f.key) ? 'text-muted-foreground' : 'text-foreground/80'">{{ f.label }} :</span>
      <input
        :value="modelValue[f.key] ?? ''"
        type="text"
        :inputmode="f.type === 'number' ? 'numeric' : 'text'"
        placeholder="—"
        dir="ltr"
        :tabindex="tabindex"
        class="text-foreground placeholder:text-muted-foreground/50 min-w-0 flex-1 bg-transparent text-center font-bold tabular-nums outline-none"
        @input="onType(f, $event)"
      />
      <button
        v-if="hasValue(f.key)"
        type="button"
        class="text-muted-foreground hover:bg-accent hover:text-foreground grid size-6 shrink-0 cursor-pointer place-items-center rounded-full"
        :aria-label="t('common.clear')"
        @click.prevent="set(f.key, '')"
      >
        <X class="size-3.5" />
      </button>
    </label>

    <Dropdown
      v-else
      :model-value="modelValue[f.key] ?? ''"
      :options="f.options"
      :prefix="f.label"
      :placeholder="f.label"
      :searchable="f.searchable ?? null"
      clearable
      :class="['fb-chip', 'bg-card', fieldClass]"
      :style="{ '--i': i }"
      :tabindex="tabindex"
      @update:model-value="set(f.key, $event)"
    />
  </template>
</template>
