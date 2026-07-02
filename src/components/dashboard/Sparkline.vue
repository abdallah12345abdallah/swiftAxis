<script setup>
import { computed, useId } from 'vue'

const props = defineProps({
  values: { type: Array, default: () => [] },
  width: { type: Number, default: 260 },
  height: { type: Number, default: 60 },
  strokeWidth: { type: Number, default: 2.5 },
  area: { type: Boolean, default: true },
})

const uid = useId()

const paths = computed(() => {
  const v = props.values
  if (!v || v.length < 2) return { line: '', area: '' }
  const max = Math.max(...v)
  const min = Math.min(...v)
  const range = max - min || 1
  const pad = props.strokeWidth + 1
  const stepX = props.width / (v.length - 1)
  const pts = v.map((val, i) => {
    const x = i * stepX
    const y = props.height - pad - ((val - min) / range) * (props.height - pad * 2)
    return [x, y]
  })
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ')
  const area = `${line} L${props.width} ${props.height} L0 ${props.height} Z`
  return { line, area }
})
</script>

<template>
  <svg :viewBox="`0 0 ${width} ${height}`" preserveAspectRatio="none" class="w-full" :style="{ height: height + 'px' }">
    <defs>
      <linearGradient :id="`spark-${uid}`" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="currentColor" stop-opacity="0.35" />
        <stop offset="1" stop-color="currentColor" stop-opacity="0" />
      </linearGradient>
    </defs>
    <path v-if="area" :d="paths.area" :fill="`url(#spark-${uid})`" />
    <path :d="paths.line" fill="none" stroke="currentColor" :stroke-width="strokeWidth" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
</template>
