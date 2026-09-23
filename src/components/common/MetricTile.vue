<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

/* A status card for a page's key figures: a tinted icon tile and the label on
   top, the value counting up into place, and a footer line — a hint, or a
   progress bar that fills in. A faint oversized icon drifts in the corner, and
   on hover a soft light sweeps across while the icon gives a small wiggle. */
const props = defineProps({
  label: { type: String, required: true },
  value: { type: Number, default: 0 },
  // how the (animated) number is shown, e.g. sar / num from useCurrency
  format: { type: Function, default: (v) => Math.round(v).toLocaleString() },
  icon: { type: [Object, Function], default: null },
  // primary | orange | success | brand | warning | danger
  tone: { type: String, default: 'primary' },
  hint: { type: String, default: '' },
  // 0–100: shows a bar under the value
  progress: { type: Number, default: null },
})

const TONE = {
  primary: 'var(--primary)',
  orange: 'var(--orange)',
  success: 'var(--success)',
  brand: 'var(--brand)',
  warning: 'var(--warning)',
  danger: 'var(--danger)',
}
const toneVar = computed(() => TONE[props.tone] ?? TONE.primary)

/* count-up: eases from the last shown value to the new one */
const shown = ref(0)
let raf = 0
const reduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
function animate(from, to) {
  cancelAnimationFrame(raf)
  if (reduced() || from === to) {
    shown.value = to
    return
  }
  const start = performance.now()
  const step = (now) => {
    const t = Math.min(1, (now - start) / 900)
    shown.value = from + (to - from) * (1 - Math.pow(1 - t, 3))
    if (t < 1) raf = requestAnimationFrame(step)
  }
  raf = requestAnimationFrame(step)
}
watch(() => props.value, (to) => animate(shown.value, Number(to) || 0))
onMounted(() => animate(0, Number(props.value) || 0))
onBeforeUnmount(() => cancelAnimationFrame(raf))

/* the bar grows in after the card appears */
const barReady = ref(false)
onMounted(() => requestAnimationFrame(() => (barReady.value = true)))
const barWidth = computed(() => `${barReady.value ? Math.max(0, Math.min(100, props.progress ?? 0)) : 0}%`)
</script>

<template>
  <div class="mtile group bg-card relative overflow-hidden rounded-2xl border p-4" :style="{ '--tone': toneVar }">
    <span class="mtile-sheen" aria-hidden="true" />
    <component :is="icon" v-if="icon" class="mtile-ghost pointer-events-none absolute -bottom-5 -end-4 size-24" :stroke-width="1.25" aria-hidden="true" />

    <div class="relative flex items-center gap-2.5">
      <span class="mtile-icon grid size-10 shrink-0 place-items-center rounded-xl">
        <component :is="icon" v-if="icon" class="size-5" />
      </span>
      <p class="text-muted-foreground min-w-0 truncate text-[13px] font-semibold">{{ label }}</p>
    </div>

    <p class="relative mt-3 text-[1.7rem] leading-none font-black tracking-tight tabular-nums">{{ format(shown) }}</p>

    <div v-if="progress !== null" class="relative mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
      <span class="mtile-bar absolute inset-y-0 start-0 rounded-full" :style="{ width: barWidth }" />
    </div>
    <p v-if="hint" class="text-muted-foreground relative mt-2 truncate text-xs">{{ hint }}</p>
  </div>
</template>

<style scoped>
.mtile { border-color: color-mix(in srgb, var(--border) 70%, transparent); transition: transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1), border-color 0.25s; }
.mtile:hover { transform: translateY(-2px); border-color: color-mix(in srgb, var(--tone) 35%, var(--border)); }

.mtile-icon {
  color: var(--tone);
  background: linear-gradient(135deg, color-mix(in srgb, var(--tone) 20%, var(--card)), color-mix(in srgb, var(--tone) 8%, var(--card)));
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--tone) 18%, transparent);
}
.mtile:hover .mtile-icon :deep(svg) { animation: mtile-wiggle 0.5s ease; }

/* faint oversized icon drifting in the corner */
.mtile-ghost { color: var(--tone); opacity: 0.07; animation: mtile-drift 7s ease-in-out infinite; }
.mtile:hover .mtile-ghost { opacity: 0.12; }

/* a soft light crossing the card on hover */
.mtile-sheen {
  position: absolute; inset-block: 0; width: 40%; inset-inline-start: -50%; pointer-events: none;
  background: linear-gradient(100deg, transparent, color-mix(in srgb, var(--tone) 10%, transparent), transparent);
}
.mtile:hover .mtile-sheen { animation: mtile-sheen 0.9s ease; }

.mtile-bar {
  background: linear-gradient(90deg, color-mix(in srgb, var(--tone) 70%, var(--card)), var(--tone));
  transition: width 1s cubic-bezier(0.2, 0.8, 0.2, 1) 0.15s;
}

@keyframes mtile-wiggle { 25% { rotate: -12deg; } 60% { rotate: 9deg; } 85% { rotate: -4deg; } }
@keyframes mtile-drift { 0%, 100% { transform: translate(0, 0) rotate(-10deg); } 50% { transform: translate(-6px, -5px) rotate(4deg); } }
@keyframes mtile-sheen { from { inset-inline-start: -50%; } to { inset-inline-start: 120%; } }
@media (prefers-reduced-motion: reduce) {
  .mtile, .mtile-bar { transition: none; }
  .mtile-ghost, .mtile:hover .mtile-sheen, .mtile:hover .mtile-icon :deep(svg) { animation: none; }
}
</style>
