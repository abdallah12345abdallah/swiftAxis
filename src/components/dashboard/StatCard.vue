<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ArrowUpRight, ArrowDownRight } from 'lucide-vue-next'
import { Card } from '@/components/ui/card'

const props = defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], required: true },
  delta: { type: Number, default: null },
  // accent: 'primary' | 'orange' | 'success'
  accent: { type: String, default: 'primary' },
  index: { type: Number, default: 0 },
})

const { t } = useI18n()

const ACCENT_VAR = {
  primary: 'var(--primary)',
  orange: 'var(--orange)',
  success: 'var(--success)',
}
const accentVar = computed(() => ACCENT_VAR[props.accent] ?? ACCENT_VAR.primary)
const up = computed(() => (props.delta ?? 0) >= 0)
</script>

<template>
  <Card
    class="stat-card group relative overflow-hidden p-5"
    :style="{ animationDelay: `${index * 0.08}s`, '--sc': accentVar }"
  >
    <!-- soft accent glow -->
    <span class="stat-glow" />

    <div class="relative">
      <p class="text-muted-foreground text-sm font-medium">{{ label }}</p>
      <p class="mt-2 text-3xl font-extrabold tracking-tight tabular-nums">{{ value }}</p>

      <div v-if="delta !== null" class="mt-2 flex items-center gap-1 text-xs">
        <span
          class="inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-semibold"
          :class="up ? 'bg-success/12 text-success' : 'bg-danger/12 text-danger'"
        >
          <component :is="up ? ArrowUpRight : ArrowDownRight" class="size-3.5" />
          {{ Math.abs(delta) }}%
        </span>
        <span class="text-muted-foreground">{{ t('common.vsPrev') }}</span>
      </div>
    </div>
  </Card>
</template>

<style scoped>
.stat-glow {
  position: absolute;
  inset-block-start: -2.5rem;
  inset-inline-end: -2.5rem;
  width: 9rem;
  height: 9rem;
  border-radius: 9999px;
  background: radial-gradient(circle, color-mix(in oklch, var(--sc) 24%, transparent), transparent 70%);
  opacity: 0.65;
  transition: opacity 0.3s ease, transform 0.3s ease;
  pointer-events: none;
}
.stat-card:hover .stat-glow {
  opacity: 1;
  transform: scale(1.15);
}

.stat-card {
  opacity: 0;
  animation: card-in 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 28px -12px color-mix(in oklch, var(--foreground) 30%, transparent);
}
@keyframes card-in {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
@media (prefers-reduced-motion: reduce) {
  .stat-card { opacity: 1; animation: none; }
}
</style>
