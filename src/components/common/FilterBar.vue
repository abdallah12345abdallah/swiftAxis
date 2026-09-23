<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Search, SlidersHorizontal, FilterX, X } from 'lucide-vue-next'
import { Input } from '@/components/ui/input'
import { Dropdown } from '@/components/ui/dropdown'

/* Page filter bar: the search box stays in view; every other filter lives in
   a tray under it that the "Filters" button opens. The button carries a badge
   with the number of active filters, each active filter reads "name : value"
   with its own clear ×, and one button clears them all.

   <FilterBar v-model:search="query" :search-placeholder="…"
              v-model="values" :filters="[{ key, label, options }]">
     <template #extra>…date range…</template>
   </FilterBar>
   Leave `search` unbound for a bar without a search box. */

const props = defineProps({
  search: { type: String, default: undefined },
  searchPlaceholder: { type: String, default: '' },
  // [{ key, label, options: [{ value, label }], searchable? }]
  //   or a typed field: { key, label, type: 'number' | 'text', min? }
  filters: { type: Array, default: () => [] },
  // { [key]: value } — '' / null means "not filtering"
  modelValue: { type: Object, default: () => ({}) },
})
const emit = defineEmits(['update:search', 'update:modelValue'])
const { t } = useI18n()

const isBlank = (v) => v === '' || v === null || v === undefined
const activeCount = computed(() => props.filters.filter((f) => !isBlank(props.modelValue[f.key])).length)
const open = ref(activeCount.value > 0)

function set(key, value) {
  emit('update:modelValue', { ...props.modelValue, [key]: value ?? '' })
}
const hasValue = (key) => !isBlank(props.modelValue[key])
// typed number fields keep digits only (Arabic-Indic digits are converted)
function onType(f, e) {
  let v = e.target.value
  if (f.type === 'number') {
    v = v.replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[^0-9.]/g, '')
    if (v !== e.target.value) e.target.value = v
  }
  set(f.key, v)
}
function clearAll() {
  emit('update:modelValue', { ...props.modelValue, ...Object.fromEntries(props.filters.map((f) => [f.key, ''])) })
}
</script>

<template>
  <div class="space-y-2.5">
    <div class="flex flex-wrap items-center gap-2.5">
      <div v-if="search !== undefined" class="relative min-w-[220px] flex-1 sm:max-w-[45%]">
        <Search class="text-muted-foreground pointer-events-none absolute top-1/2 size-4 -translate-y-1/2 start-3.5" />
        <Input :model-value="search" :placeholder="searchPlaceholder" class="border-border hover:border-primary/40 ps-10" @update:model-value="emit('update:search', $event)" />
      </div>
      <!-- date range + filters: right beside the search when there is one,
           otherwise gathered at the far end of the bar -->
      <div class="flex flex-wrap items-center gap-2.5" :class="search === undefined && 'ms-auto'">
      <slot name="extra" />
      <button
        v-if="filters.length"
        type="button"
        class="fb-toggle relative inline-flex h-11 shrink-0 cursor-pointer items-center gap-2 rounded-xl border px-4 text-sm font-semibold transition-colors"
        :class="open ? 'border-primary text-primary bg-primary/8' : 'border-border bg-card hover:border-primary/40'"
        :aria-expanded="open"
        @click="open = !open"
      >
        <SlidersHorizontal class="fb-icon size-4" :class="open && 'is-open'" />
        {{ t('filters.title') }}
        <Transition name="fb-badge">
          <span v-if="activeCount" :key="activeCount" class="fb-badge bg-primary text-primary-foreground ring-background absolute -top-2 -end-2 grid size-5 place-items-center rounded-full text-[11px] font-bold tabular-nums ring-2">{{ activeCount }}</span>
        </Transition>
      </button>
      </div>
      <slot name="actions" />
    </div>

    <!-- the tray: grows open, its filters stagger in -->
    <div v-if="filters.length" class="fb-tray" :class="open && 'is-open'" :aria-hidden="!open">
      <div class="min-h-0 overflow-hidden">
        <div class="bg-muted/40 border-border/70 flex flex-wrap items-center gap-2 rounded-2xl border p-2">
          <template v-for="(f, i) in filters" :key="f.key">
          <!-- typed field: the same box as a dropdown filter — its name, then the
               value typed inline, and a clear × once something is typed -->
          <label
            v-if="f.type"
            class="fb-chip fb-field focus-within:border-primary flex h-10 w-auto min-w-[170px] flex-1 cursor-text items-center gap-1.5 rounded-lg border ps-3.5 pe-2 text-sm transition-colors sm:flex-none"
            :class="hasValue(f.key) ? 'border-primary/50 bg-primary/5' : 'bg-card border-border hover:border-primary/40'"
            :style="{ '--i': i }"
          >
            <span class="shrink-0" :class="hasValue(f.key) ? 'text-muted-foreground' : 'text-foreground/80'">{{ f.label }} :</span>
            <input
              :value="modelValue[f.key] ?? ''"
              type="text"
              :inputmode="f.type === 'number' ? 'numeric' : 'text'"
              placeholder="—"
              dir="ltr"
              :tabindex="open ? 0 : -1"
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
            class="fb-chip bg-card h-10 w-auto min-w-[170px] flex-1 sm:flex-none"
            :style="{ '--i': i }"
            :tabindex="open ? 0 : -1"
            @update:model-value="set(f.key, $event)"
          />
          </template>
          <Transition name="fb-clear">
            <button
              v-if="activeCount"
              type="button"
              class="fb-clear bg-primary text-primary-foreground hover:bg-primary/90 ms-auto grid size-10 shrink-0 cursor-pointer place-items-center rounded-xl transition-colors"
              :title="t('filters.clearAll')"
              :aria-label="t('filters.clearAll')"
              @click="clearAll"
            >
              <FilterX class="size-[18px]" />
            </button>
          </Transition>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fb-icon { transition: transform 0.35s cubic-bezier(0.2, 0.9, 0.3, 1.3); }
.fb-icon.is-open { transform: rotate(90deg); }

.fb-badge-enter-active { animation: fb-pop 0.35s cubic-bezier(0.2, 0.9, 0.3, 1.5); }
.fb-badge-leave-active { transition: opacity 0.15s, transform 0.15s; position: absolute; }
.fb-badge-leave-to { opacity: 0; transform: scale(0.5); }

/* height animates through grid rows, so the content needs no fixed size */
.fb-tray { display: grid; grid-template-rows: 0fr; opacity: 0; transition: grid-template-rows 0.32s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.2s ease, margin 0.32s; margin-top: -0.625rem; visibility: hidden; }
.fb-tray.is-open { grid-template-rows: 1fr; opacity: 1; margin-top: 0; visibility: visible; }
.fb-tray.is-open :deep(.fb-chip) { animation: fb-chip-in 0.35s cubic-bezier(0.2, 0.8, 0.2, 1) backwards; animation-delay: calc(var(--i) * 45ms + 60ms); }

.fb-clear-enter-active { animation: fb-pop 0.3s cubic-bezier(0.2, 0.9, 0.3, 1.4); }
.fb-clear-leave-active { transition: opacity 0.15s, transform 0.15s; }
.fb-clear-leave-to { opacity: 0; transform: scale(0.7); }
.fb-clear:hover svg { animation: fb-shake 0.4s ease; }

@keyframes fb-pop { from { transform: scale(0.4); opacity: 0; } }
@keyframes fb-chip-in { from { opacity: 0; transform: translateY(-6px); } }
@keyframes fb-shake { 25% { rotate: -12deg; } 75% { rotate: 12deg; } }
@media (prefers-reduced-motion: reduce) {
  .fb-tray, .fb-icon { transition: none; }
  .fb-tray.is-open :deep(.fb-chip), .fb-badge-enter-active, .fb-clear-enter-active, .fb-clear:hover svg { animation: none; }
}
</style>
