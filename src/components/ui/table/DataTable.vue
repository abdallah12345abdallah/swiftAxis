<script setup>
import { ref, computed } from 'vue'
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-vue-next'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

const props = defineProps({
  // columns: [{ key, label, align?: 'start'|'end'|'center', hideBelow?: 'sm'|'md'|'lg'|'xl', sortable?, class? }]
  columns: { type: Array, default: () => [] },
  rows: { type: Array, default: () => [] },
  rowKey: { type: String, default: 'id' },
  loading: { type: Boolean, default: false },
  empty: { type: String, default: '' },
  pageSize: { type: Number, default: 0 }, // 0 = no pagination
})

const sortKey = ref('')
const sortDir = ref('asc')
const page = ref(1)

function toggleSort(col) {
  if (!col.sortable) return
  if (sortKey.value === col.key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = col.key
    sortDir.value = 'asc'
  }
  page.value = 1
}

const sorted = computed(() => {
  if (!sortKey.value) return props.rows
  const dir = sortDir.value === 'asc' ? 1 : -1
  return [...props.rows].sort((a, b) => {
    const av = a[sortKey.value]
    const bv = b[sortKey.value]
    if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir
    return String(av ?? '').localeCompare(String(bv ?? ''), undefined, { numeric: true }) * dir
  })
})

const totalPages = computed(() => (props.pageSize ? Math.max(1, Math.ceil(sorted.value.length / props.pageSize)) : 1))
const paged = computed(() => {
  if (!props.pageSize) return sorted.value
  const start = (page.value - 1) * props.pageSize
  return sorted.value.slice(start, start + props.pageSize)
})

const hideClass = (c) =>
  ({ sm: 'hidden sm:table-cell', md: 'hidden md:table-cell', lg: 'hidden lg:table-cell', xl: 'hidden xl:table-cell' })[c?.hideBelow] ?? ''
const alignClass = (c) => ({ end: 'text-end', center: 'text-center' })[c?.align] ?? 'text-start'
</script>

<template>
  <div>
    <div v-if="loading" class="space-y-3 p-5">
      <Skeleton v-for="i in 6" :key="i" class="h-11 rounded-lg" />
    </div>

    <div v-else-if="!rows.length" class="text-muted-foreground py-16 text-center text-sm">
      {{ empty }}
    </div>

    <div v-else class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="text-muted-foreground border-b">
            <th
              v-for="c in columns"
              :key="c.key"
              class="px-5 py-3 font-medium"
              :class="[hideClass(c), alignClass(c), c.sortable ? 'cursor-pointer select-none' : '']"
              @click="toggleSort(c)"
            >
              <span class="inline-flex items-center gap-1" :class="c.align === 'end' ? 'flex-row-reverse' : ''">
                {{ c.label }}
                <template v-if="c.sortable">
                  <ChevronUp v-if="sortKey === c.key && sortDir === 'asc'" class="size-3.5" />
                  <ChevronDown v-else-if="sortKey === c.key" class="size-3.5" />
                  <ChevronsUpDown v-else class="size-3.5 opacity-40" />
                </template>
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in paged"
            :key="row[rowKey]"
            class="hover:bg-muted/40 border-b transition-colors last:border-0"
          >
            <td v-for="c in columns" :key="c.key" class="px-5 py-3" :class="[hideClass(c), alignClass(c), c.class]">
              <slot :name="`cell-${c.key}`" :row="row" :value="row[c.key]">{{ row[c.key] }}</slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- pagination -->
    <div v-if="pageSize && totalPages > 1 && !loading" class="flex items-center justify-between gap-2 px-5 py-3">
      <button
        type="button"
        class="hover:bg-accent rounded-lg border px-3 py-1.5 text-sm disabled:opacity-50"
        :disabled="page === 1"
        @click="page--"
      >
        ‹
      </button>
      <span class="text-muted-foreground text-xs tabular-nums">{{ page }} / {{ totalPages }}</span>
      <button
        type="button"
        class="hover:bg-accent rounded-lg border px-3 py-1.5 text-sm disabled:opacity-50"
        :disabled="page === totalPages"
        @click="page++"
      >
        ›
      </button>
    </div>
  </div>
</template>
