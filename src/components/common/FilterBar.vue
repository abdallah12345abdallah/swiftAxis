<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Search, SlidersHorizontal, FilterX } from 'lucide-vue-next'
import { Input } from '@/components/ui/input'
import { useMediaQuery } from '@/composables/useMediaQuery'
import BottomSheet from '@/components/ui/sheet/BottomSheet.vue'
import FilterFields from '@/components/common/FilterFields.vue'

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

/* Below sm the tray becomes a sheet: a row of chips has nowhere to go beside a
   search box on a phone. Same `open`, so the Filters button drives both. It
   starts open only as a tray — a sheet over the page on arrival would be
   startling, and its badge already says how many filters are on. */
const asSheet = useMediaQuery('(width < 40rem)')
const open = ref(activeCount.value > 0 && !asSheet.value)
watch(asSheet, () => (open.value = false))

function clearAll() {
  emit('update:modelValue', { ...props.modelValue, ...Object.fromEntries(props.filters.map((f) => [f.key, ''])) })
}
</script>

<template>
  <div class="space-y-2.5">
    <div class="flex flex-wrap items-center gap-2.5">
      <!-- on a phone the search takes the whole line: sharing it with the date
           range and the Filters button squeezes the field down to its icon -->
      <div v-if="search !== undefined" class="relative w-full sm:w-auto sm:min-w-[220px] sm:max-w-[45%] sm:flex-1">
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

    <!-- from sm up: the tray grows open under the bar, its filters stagger in -->
    <div v-if="filters.length && !asSheet" class="fb-tray" :class="open && 'is-open'" :aria-hidden="!open">
      <div class="min-h-0 overflow-hidden">
        <div class="bg-muted/40 border-border/70 flex flex-wrap items-center gap-2 rounded-2xl border p-2">
          <FilterFields :filters="filters" :model-value="modelValue" :tabindex="open ? 0 : -1" @update:model-value="emit('update:modelValue', $event)" />
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

    <!-- on a phone there is no room beside the bar for a tray of chips, so the
         same filters open as a sheet from the bottom edge, one to a line -->
    <BottomSheet v-if="filters.length && asSheet" v-model:open="open" :title="t('filters.title')">
      <div class="grid gap-2">
        <FilterFields :filters="filters" :model-value="modelValue" stacked @update:model-value="emit('update:modelValue', $event)" />
      </div>
      <template #footer>
        <button
          type="button"
          class="border-border text-foreground hover:bg-muted h-11 flex-1 rounded-xl border text-sm font-medium transition-colors disabled:opacity-45"
          :disabled="!activeCount"
          @click="clearAll"
        >
          <span class="inline-flex items-center justify-center gap-2"><FilterX class="size-4" /> {{ t('filters.clearAll') }}</span>
        </button>
        <button type="button" class="bg-primary text-primary-foreground hover:bg-primary/90 h-11 flex-1 rounded-xl text-sm font-bold transition-colors" @click="open = false">
          {{ t('common.close') }}
        </button>
      </template>
    </BottomSheet>
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
