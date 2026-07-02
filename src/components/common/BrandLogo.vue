<script setup>
/**
 * SwiftAxis Logistics logo — clean SVG recreation of the brand mark.
 * A blue→orange swoosh "S/arrow" inside a ring, plus the SwiftAxis wordmark.
 * Theme-aware (uses brand tokens); swap for the official vector when supplied.
 */
import { computed, useId } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  markOnly: { type: Boolean, default: false },
  // wordmark text colour: 'auto' follows theme; 'light' forces white (navy bg)
  tone: { type: String, default: 'auto' },
  markSize: { type: Number, default: 36 },
})

const { t } = useI18n()
const uid = useId()

const wordClass = computed(() =>
  props.tone === 'light' ? 'text-white' : 'text-foreground',
)
</script>

<template>
  <div dir="ltr" class="flex items-center gap-2.5 select-none">
    <!-- Mark -->
    <svg
      :width="markSize"
      :height="markSize"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      class="shrink-0"
      role="img"
      aria-label="SwiftAxis"
    >
      <defs>
        <linearGradient :id="`sa-blue-${uid}`" x1="4" y1="8" x2="40" y2="42" gradientUnits="userSpaceOnUse">
          <stop stop-color="#2E8BFF" />
          <stop offset="1" stop-color="#1152C7" />
        </linearGradient>
        <linearGradient :id="`sa-orange-${uid}`" x1="10" y1="10" x2="42" y2="40" gradientUnits="userSpaceOnUse">
          <stop stop-color="#FFA53D" />
          <stop offset="1" stop-color="#F26A16" />
        </linearGradient>
      </defs>

      <!-- Blue swoosh ring -->
      <path
        d="M40 24c0 8.837-7.163 16-16 16S8 32.837 8 24 15.163 8 24 8c4.9 0 9.287 2.203 12.222 5.674"
        :stroke="`url(#sa-blue-${uid})`"
        stroke-width="6.5"
        stroke-linecap="round"
      />
      <!-- Orange arrow sweeping through -->
      <path
        d="M13 30c6-1.6 12.5-6.2 18.4-12.2l-1.9 8.1 8.2-1.4"
        :stroke="`url(#sa-orange-${uid})`"
        stroke-width="5"
        stroke-linecap="round"
        stroke-linejoin="round"
        fill="none"
      />
    </svg>

    <!-- Wordmark -->
    <div v-if="!markOnly" class="flex flex-col leading-none">
      <div class="flex items-baseline">
        <span :class="wordClass" class="text-lg font-extrabold tracking-tight">Swift</span>
        <span class="text-orange text-lg font-extrabold tracking-tight">Axis</span>
      </div>
      <span
        :class="props.tone === 'light' ? 'text-white/60' : 'text-muted-foreground'"
        class="mt-0.5 text-[9px] font-semibold tracking-[0.35em]"
        >{{ t('app.logistics') }}</span
      >
    </div>
  </div>
</template>
