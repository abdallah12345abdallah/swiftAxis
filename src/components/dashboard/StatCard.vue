<script setup>
import { computed } from 'vue'

/* One figure in a stats strip: a large number in its accent colour over a
   soft, filled oversized icon, the label under it, and a short accent bar.
   Pages lay several of these side by side inside one panel (see .stat-strip).
   `delta` is still accepted from callers but no longer shown. */
const props = defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], required: true },
  delta: { type: Number, default: null },
  icon: { type: [Object, Function], default: null },
  // accent: 'primary' (blue) | 'orange' | 'success' | 'warning' | 'danger'
  accent: { type: String, default: 'primary' },
})

const ACCENT_VAR = {
  primary: 'var(--brand)',
  orange: 'var(--orange)',
  success: 'var(--success)',
  warning: 'var(--warning)',
  danger: 'var(--danger)',
}
const accentVar = computed(() => ACCENT_VAR[props.accent] ?? ACCENT_VAR.primary)
</script>

<template>
  <div class="stat group relative flex flex-col items-center justify-center px-3 py-6 text-center" :style="{ '--sc': accentVar }">
    <!-- oversized faint icon behind the figure -->
    <span class="stat-deco pointer-events-none absolute top-1/2 start-1/2 grid size-28 place-items-center" aria-hidden="true">
      <component :is="icon" v-if="icon" class="size-24" :stroke-width="1.25" />
    </span>

    <p class="stat-value relative text-3xl font-black tracking-tight tabular-nums sm:text-4xl">{{ value }}</p>
    <p class="text-foreground/80 relative mt-1 text-sm font-semibold">{{ label }}</p>
    <span class="stat-bar relative mt-2.5 h-1 rounded-full" />

  </div>
</template>

<style scoped>
/* the figure takes its accent, pulled slightly toward the text colour so
   light accents (amber) stay readable on both themes */
.stat-value { color: color-mix(in srgb, var(--sc) 82%, var(--foreground)); }
.stat-deco {
  translate: -50% -50%;
  color: color-mix(in srgb, var(--sc) 55%, transparent);
  opacity: 0.26;
  rotate: -12deg;
  transition: rotate 0.4s cubic-bezier(0.2, 0.8, 0.2, 1), scale 0.4s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.3s;
}
[dir='rtl'] .stat-deco { translate: 50% -50%; }
/* the icon reads as a soft filled shape: tinted fill, faint outline */
.stat-deco :deep(svg) { fill: color-mix(in srgb, var(--sc) 22%, transparent); }
.stat:hover .stat-deco { rotate: 0deg; scale: 1.08; opacity: 0.38; }
/* idle motion: the icon floats and sways slowly; each figure in a strip runs
   out of step with its neighbours */
.stat-deco :deep(svg) { animation: stat-float 6s ease-in-out infinite; }
.stat:nth-child(2) .stat-deco :deep(svg) { animation-delay: -1.5s; animation-duration: 6.8s; }
.stat:nth-child(3) .stat-deco :deep(svg) { animation-delay: -3s; animation-duration: 5.6s; }
.stat:nth-child(4) .stat-deco :deep(svg) { animation-delay: -4.5s; animation-duration: 7.2s; }
@keyframes stat-float {
  0%, 100% { transform: translateY(0) rotate(0deg) scale(1); }
  33% { transform: translateY(-6px) rotate(6deg) scale(1.04); }
  66% { transform: translateY(3px) rotate(-4deg) scale(0.98); }
}
.stat-bar { width: 2.5rem; background: color-mix(in srgb, var(--sc) 60%, transparent); transition: width 0.3s ease; }
.stat:hover .stat-bar { width: 4rem; }
@media (prefers-reduced-motion: reduce) { .stat-deco, .stat-bar { transition: none; } .stat-deco :deep(svg) { animation: none; } }
</style>
