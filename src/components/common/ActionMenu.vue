<script setup>
import { computed, nextTick, onBeforeUnmount, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { MoreVertical } from 'lucide-vue-next'
import { RTL_LOCALES } from '@/i18n'

/* The row actions menu used in every table's actions column: a ⋮ button that
   opens a classic list — a tinted icon per action, a divider before the
   destructive ones, destructive in red. Portalled to <body> so no table or
   card clips it; flips upward near the bottom of the screen.

   items: [{ label, icon, tone?: 'blue'|'orange'|'green'|'red'|'muted',
             onSelect, danger?, show? (default true), disabled? }] */
const props = defineProps({
  items: { type: Array, default: () => [] },
  label: { type: String, default: '' },
})

const { t, locale } = useI18n()
const isRtl = computed(() => RTL_LOCALES.includes(locale.value))
const visible = computed(() => props.items.filter((i) => i.show !== false))
const safe = computed(() => visible.value.filter((i) => !i.danger))
const danger = computed(() => visible.value.filter((i) => i.danger))

const open = ref(false)
const btn = ref(null)
const panel = ref(null)
const style = ref({})

function place() {
  const el = btn.value
  if (!el) return
  const r = el.getBoundingClientRect()
  const h = panel.value?.offsetHeight ?? 200
  const below = window.innerHeight - r.bottom
  const s = { position: 'fixed' }
  if (below < h + 16 && r.top > below) s.bottom = `${window.innerHeight - r.top + 6}px`
  else s.top = `${r.bottom + 6}px`
  // align the menu's end edge with the button's end edge
  if (isRtl.value) s.left = `${Math.max(8, r.left)}px`
  else s.right = `${Math.max(8, window.innerWidth - r.right)}px`
  style.value = s
}
function onDoc(e) {
  if (panel.value?.contains(e.target) || btn.value?.contains(e.target)) return
  close()
}
function onKey(e) {
  if (e.key === 'Escape') close()
}
async function toggle() {
  if (open.value) return close()
  open.value = true
  await nextTick()
  place()
  document.addEventListener('pointerdown', onDoc, true)
  document.addEventListener('keydown', onKey)
  window.addEventListener('scroll', close, true)
  window.addEventListener('resize', close)
}
function close() {
  open.value = false
  document.removeEventListener('pointerdown', onDoc, true)
  document.removeEventListener('keydown', onKey)
  window.removeEventListener('scroll', close, true)
  window.removeEventListener('resize', close)
}
onBeforeUnmount(close)
function pick(item) {
  if (item.disabled) return
  close()
  item.onSelect?.()
}
const TONES = {
  blue: 'bg-primary/12 text-primary',
  orange: 'bg-orange/12 text-orange',
  green: 'bg-success/12 text-success',
  red: 'bg-danger/12 text-danger',
  muted: 'bg-muted text-muted-foreground',
}
</script>

<template>
  <span v-if="!visible.length" class="text-muted-foreground text-xs">—</span>
  <button
    v-else
    ref="btn"
    type="button"
    class="inline-flex size-8 cursor-pointer items-center justify-center rounded-lg border transition-colors"
    :class="open ? 'bg-navy text-white border-navy' : 'bg-card text-muted-foreground hover:bg-accent hover:text-foreground'"
    :aria-label="label || t('common.actions')"
    :aria-expanded="open"
    @click.stop="toggle"
  >
    <MoreVertical class="size-4" />
  </button>

  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-120 ease-out"
      enter-from-class="opacity-0 scale-95"
      leave-active-class="transition duration-90 ease-in"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="open"
        ref="panel"
        role="menu"
        class="bg-popover text-popover-foreground z-[70] min-w-48 rounded-xl border p-1.5 text-start shadow-xl"
        :style="style"
        @click.stop
      >
        <button
          v-for="(item, i) in safe"
          :key="'s' + i"
          type="button"
          role="menuitem"
          class="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-start text-sm transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="item.disabled"
          @click="pick(item)"
        >
          <span class="grid size-7 shrink-0 place-items-center rounded-lg" :class="TONES[item.tone || 'blue']"><component :is="item.icon" class="size-4" /></span>
          <span class="flex-1">{{ item.label }}</span>
        </button>
        <div v-if="safe.length && danger.length" class="bg-border my-1 h-px" />
        <button
          v-for="(item, i) in danger"
          :key="'d' + i"
          type="button"
          role="menuitem"
          class="text-danger hover:bg-danger/10 flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-start text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="item.disabled"
          @click="pick(item)"
        >
          <span class="bg-danger/12 text-danger grid size-7 shrink-0 place-items-center rounded-lg"><component :is="item.icon" class="size-4" /></span>
          <span class="flex-1">{{ item.label }}</span>
        </button>
      </div>
    </Transition>
  </Teleport>
</template>
