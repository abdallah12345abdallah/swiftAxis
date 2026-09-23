<script setup>
import EmptyState from '@/components/common/EmptyState.vue'
import { ref, computed, useSlots } from 'vue'
import { useI18n } from 'vue-i18n'
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronsLeft } from 'lucide-vue-next'
import { useCurrency } from '@/composables/useCurrency'
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

/* "Soft well" table: rows float as rounded white strips on a tinted well.
   A #expand slot makes rows expandable — clicking a row turns it navy and
   opens the slot's content underneath (clicks on buttons/links inside the
   row are ignored). */
const { t } = useI18n()
const { num } = useCurrency()
const slots = useSlots()
const expandable = computed(() => !!slots.expand)
const openKey = ref(null)
function onRowClick(row, e) {
  if (!expandable.value) return
  if (e.target.closest('button, a, input, select, textarea, [role=menu]')) return
  openKey.value = openKey.value === row[props.rowKey] ? null : row[props.rowKey]
}

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

// up to 5 page numbers, kept around the current page
const pageWindow = computed(() => {
  const n = totalPages.value
  const size = Math.min(5, n)
  const start = Math.min(Math.max(1, page.value - 2), n - size + 1)
  return Array.from({ length: size }, (_, i) => start + i)
})
const rangeFrom = computed(() => (page.value - 1) * props.pageSize + 1)
const rangeTo = computed(() => Math.min(page.value * props.pageSize, sorted.value.length))
function go(p) {
  page.value = Math.min(Math.max(1, p), totalPages.value)
}

const hideClass = (c) =>
  ({ sm: 'hidden sm:table-cell', md: 'hidden md:table-cell', lg: 'hidden lg:table-cell', xl: 'hidden xl:table-cell' })[c?.hideBelow] ?? ''
const alignClass = (c) => ({ end: 'text-end', center: 'text-center' })[c?.align] ?? 'text-start'
</script>

<template>
  <div class="soft-host">
    <div v-if="loading" class="space-y-2 p-3">
      <Skeleton v-for="i in 6" :key="i" class="h-12 rounded-xl" />
    </div>

    <div v-else-if="!rows.length" class="soft-table">
      <EmptyState :title="empty" />
    </div>

    <div v-else class="soft-table">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr>
              <th
                v-for="c in columns"
                :key="c.key"
                class="px-4 font-bold"
                :class="[hideClass(c), alignClass(c), c.sortable ? 'cursor-pointer select-none hover:text-foreground' : '']"
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
            <template v-for="row in paged" :key="row[rowKey]">
              <tr
                :class="[expandable && 'cursor-pointer', openKey === row[rowKey] && 'is-open']"
                @click="onRowClick(row, $event)"
              >
                <td v-for="c in columns" :key="c.key" class="px-4 py-3" :class="[hideClass(c), alignClass(c), c.class]">
                  <slot :name="`cell-${c.key}`" :row="row" :value="row[c.key]">{{ row[c.key] }}</slot>
                </td>
              </tr>
              <tr v-if="expandable && openKey === row[rowKey]" class="is-expansion">
                <td :colspan="columns.length" class="px-4 pt-1 pb-4">
                  <slot name="expand" :row="row" />
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <!-- pagination: range on the start side, first/prev · pages · next/last on the end side -->
      <div v-if="pageSize && totalPages > 1" class="flex flex-wrap items-center justify-between gap-3 px-2 pt-2 pb-1.5">
        <span class="text-muted-foreground text-xs tabular-nums">{{ t('common.showing', { from: num(rangeFrom), to: num(rangeTo), total: num(sorted.length) }) }}</span>
        <div class="flex items-center gap-1.5">
          <button type="button" class="pager-btn" :disabled="page === 1" :aria-label="t('common.firstPage')" @click="go(1)"><ChevronsLeft class="size-4 rtl:rotate-180" /></button>
          <button type="button" class="pager-btn" :disabled="page === 1" :aria-label="t('common.prevPage')" @click="go(page - 1)"><ChevronLeft class="size-4 rtl:rotate-180" /></button>
          <button
            v-for="p in pageWindow"
            :key="p"
            type="button"
            class="pager-btn tabular-nums"
            :class="p === page && 'is-current'"
            :aria-current="p === page ? 'page' : undefined"
            @click="go(p)"
          >{{ num(p) }}</button>
          <button type="button" class="pager-btn" :disabled="page === totalPages" :aria-label="t('common.nextPage')" @click="go(page + 1)"><ChevronLeft class="size-4 ltr:rotate-180" /></button>
          <button type="button" class="pager-btn" :disabled="page === totalPages" :aria-label="t('common.lastPage')" @click="go(totalPages)"><ChevronsLeft class="size-4 ltr:rotate-180" /></button>
        </div>
      </div>
    </div>
  </div>
</template>
