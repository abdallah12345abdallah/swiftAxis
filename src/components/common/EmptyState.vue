<script setup>
import { useI18n } from 'vue-i18n'
import { Inbox } from 'lucide-vue-next'

/* "Nothing here" for tables and lists: a floating icon tile inside a slowly
   turning dashed ring with two soft sparkles, the message, and a short hint.
   `compact` is the smaller version for tables inside dialogs and panels. */
const props = defineProps({
  title: { type: String, default: '' },
  hint: { type: String, default: undefined }, // undefined = the generic hint, '' = none
  icon: { type: [Object, Function], default: () => Inbox },
  compact: { type: Boolean, default: false },
})
const { t } = useI18n()
</script>

<template>
  <div class="es flex flex-col items-center justify-center text-center" :class="compact ? 'gap-2 py-6' : 'gap-3 py-12'">
    <div class="es-art relative grid place-items-center" :class="compact ? 'size-16' : 'size-24'" aria-hidden="true">
      <span class="es-glow absolute inset-0 rounded-full" />
      <span class="es-ring absolute rounded-full border-2 border-dashed" :class="compact ? 'inset-1' : 'inset-1.5'" />
      <span class="es-spark es-spark-a absolute rounded-full" />
      <span class="es-spark es-spark-b absolute rounded-full" />
      <span class="es-tile bg-card relative grid place-items-center rounded-2xl" :class="compact ? 'size-9' : 'size-12'">
        <component :is="icon" :class="compact ? 'size-[18px]' : 'size-6'" :stroke-width="1.75" />
      </span>
    </div>
    <p class="text-foreground/85 font-semibold" :class="compact ? 'text-[13px]' : 'text-[15px]'">{{ title || t('common.noData') }}</p>
    <p v-if="!compact && props.hint !== ''" class="text-muted-foreground max-w-[42ch] text-xs leading-relaxed">{{ props.hint ?? t('common.emptyHint') }}</p>
    <slot />
  </div>
</template>

<style scoped>
.es { animation: es-in 0.45s cubic-bezier(0.2, 0.8, 0.2, 1) both; }
.es-glow { background: radial-gradient(circle, color-mix(in srgb, var(--primary) 16%, transparent), transparent 70%); }
.es-ring { border-color: color-mix(in srgb, var(--primary) 30%, transparent); animation: es-spin 14s linear infinite; }
.es-tile {
  color: var(--primary);
  box-shadow: 0 10px 22px -12px color-mix(in srgb, var(--primary) 55%, transparent), inset 0 0 0 1px color-mix(in srgb, var(--primary) 16%, transparent);
  animation: es-float 3.6s ease-in-out infinite;
}
.es-spark { background: var(--primary); animation: es-blink 2.4s ease-in-out infinite; }
.es-spark-a { width: 6px; height: 6px; top: 8%; inset-inline-end: 10%; }
.es-spark-b { width: 4px; height: 4px; bottom: 14%; inset-inline-start: 8%; background: var(--brand); animation-delay: 1.2s; }

@keyframes es-in { from { opacity: 0; transform: translateY(8px); } }
@keyframes es-spin { to { transform: rotate(360deg); } }
@keyframes es-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
@keyframes es-blink { 0%, 100% { opacity: 0.2; transform: scale(0.7); } 50% { opacity: 0.9; transform: scale(1); } }
@media (prefers-reduced-motion: reduce) {
  .es, .es-ring, .es-tile, .es-spark { animation: none; }
}
</style>
