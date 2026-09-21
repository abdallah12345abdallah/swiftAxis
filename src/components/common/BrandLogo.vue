<script setup>
/**
 * SwiftAxis logo — clean SVG recreation of the brand mark.
 * A blue→orange swoosh "S/arrow" inside a ring, plus the SwiftAxis wordmark.
 *
 * Motion ("Route Draw"): the ring strokes itself clockwise like a route being
 * plotted, the arrow cuts through it, then the wordmark lifts in. At rest the
 * mark is fully drawn, so it reads correctly with motion disabled.
 * Theme-aware (uses brand tokens); swap for the official vector when supplied.
 */
import { computed, nextTick, onMounted, ref, useId } from 'vue'

const props = defineProps({
  markOnly: { type: Boolean, default: false },
  // wordmark text colour: 'auto' follows theme; 'light' forces white (navy bg)
  tone: { type: String, default: 'auto' },
  markSize: { type: Number, default: 36 },
  // when the draw plays: 'mount' | 'hover' | 'both' | 'none'
  animate: { type: String, default: 'mount' },
})

const uid = useId()
const root = ref(null)
const playing = ref(false)

/** Restart the animation: drop the class, let it land in the DOM, force a
    reflow, then re-add — otherwise the browser never replays it. */
async function play() {
  playing.value = false
  await nextTick()
  void root.value?.offsetWidth
  playing.value = true
}

onMounted(() => {
  if (props.animate === 'mount' || props.animate === 'both') playing.value = true
})

function onEnter() {
  if (props.animate === 'hover' || props.animate === 'both') play()
}

defineExpose({ play })

const wordClass = computed(() => (props.tone === 'light' ? 'text-white' : 'text-foreground'))
</script>

<template>
  <div
    ref="root"
    dir="ltr"
    class="brand flex items-center gap-2.5 select-none"
    :class="playing && 'is-playing'"
    @mouseenter="onEnter"
  >
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
        class="ring"
        pathLength="1"
        d="M40 24c0 8.837-7.163 16-16 16S8 32.837 8 24 15.163 8 24 8c4.9 0 9.287 2.203 12.222 5.674"
        :stroke="`url(#sa-blue-${uid})`"
        stroke-width="6.5"
        stroke-linecap="round"
      />
      <!-- Orange arrow sweeping through -->
      <path
        class="arrow"
        pathLength="1"
        d="M13 30c6-1.6 12.5-6.2 18.4-12.2l-1.9 8.1 8.2-1.4"
        :stroke="`url(#sa-orange-${uid})`"
        stroke-width="5"
        stroke-linecap="round"
        stroke-linejoin="round"
        fill="none"
      />
    </svg>

    <!-- Wordmark -->
    <div v-if="!markOnly" class="flex items-baseline leading-none">
      <span :class="wordClass" class="word word-swift text-lg font-extrabold tracking-tight">Swift</span>
      <span class="word word-axis text-orange text-lg font-extrabold tracking-tight">Axis</span>
    </div>
  </div>
</template>

<style scoped>
/* dasharray 1 against path-length 1 = one dash covering the whole path, so the
   resting state is a solid stroke; the keyframes start it fully offset. */
.ring,
.arrow {
  stroke-dasharray: 1;
}

.brand.is-playing .ring {
  animation: sa-draw 0.72s cubic-bezier(0.65, 0, 0.35, 1) backwards;
}
.brand.is-playing .arrow {
  animation: sa-draw 0.46s cubic-bezier(0.34, 1.3, 0.64, 1) 0.5s backwards;
}
@keyframes sa-draw {
  from {
    stroke-dashoffset: 1;
  }
  to {
    stroke-dashoffset: 0;
  }
}

.brand.is-playing .word {
  animation: sa-rise 0.5s cubic-bezier(0.16, 1, 0.3, 1) backwards;
}
.brand.is-playing .word-swift {
  animation-delay: 0.62s;
}
.brand.is-playing .word-axis {
  animation-delay: 0.72s;
}
@keyframes sa-rise {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .brand.is-playing .ring,
  .brand.is-playing .arrow,
  .brand.is-playing .word {
    animation: none;
  }
}
</style>
