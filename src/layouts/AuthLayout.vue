<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  TrendingUp,
  Package,
  Wallet,
  Star,
  Bike,
  Coins,
  MapPin,
  Receipt,
} from 'lucide-vue-next'
import BrandLogo from '@/components/common/BrandLogo.vue'
import ThemeToggle from '@/components/common/ThemeToggle.vue'
import LangToggle from '@/components/common/LangToggle.vue'

const { t, locale } = useI18n()
const year = new Date().getFullYear()

const nf = computed(() =>
  new Intl.NumberFormat(locale.value === 'ar' ? 'ar-SA' : 'en-US'),
)

// Ambient drifting delivery icons (background eye-candy)
const particles = [
  { icon: Package, left: '8%', size: 26, dur: '16s', delay: '-2s' },
  { icon: Bike, left: '24%', size: 30, dur: '21s', delay: '-9s' },
  { icon: Coins, left: '40%', size: 22, dur: '14s', delay: '-5s' },
  { icon: MapPin, left: '57%', size: 24, dur: '18s', delay: '-13s' },
  { icon: Wallet, left: '73%', size: 28, dur: '23s', delay: '-7s' },
  { icon: Receipt, left: '88%', size: 22, dur: '15s', delay: '-3s' },
  { icon: Package, left: '48%', size: 18, dur: '19s', delay: '-16s' },
  { icon: Bike, left: '92%', size: 24, dur: '17s', delay: '-11s' },
]

// Live-counting commission total
const commission = ref(0)
const bars = ref([42, 68, 55, 90, 74, 61, 83])
let barTimer = 0
let commTimer = 0

function countUp(target, duration) {
  let start = null
  function step(ts) {
    if (start === null) start = ts
    const p = Math.min((ts - start) / duration, 1)
    commission.value = Math.round(target * (1 - Math.pow(1 - p, 3)))
    if (p < 1) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}

onMounted(() => {
  countUp(48250, 1600)
  // keep it feeling live
  commTimer = window.setInterval(() => {
    commission.value += 25 + Math.floor(Math.random() * 120)
  }, 2600)
  barTimer = window.setInterval(() => {
    bars.value = bars.value.map(() => 30 + Math.floor(Math.random() * 70))
  }, 2400)
})
onUnmounted(() => {
  clearInterval(barTimer)
  clearInterval(commTimer)
})
</script>

<template>
  <div class="bg-background flex min-h-screen">
    <!-- ── Brand panel: live dashboard preview (lg+) ───────── -->
    <aside class="bg-navy relative hidden w-[42%] shrink-0 overflow-hidden lg:flex">
      <!-- ambient glows -->
      <div class="bg-primary/25 absolute -top-24 -start-20 size-[360px] rounded-full blur-[120px]" />
      <div class="bg-orange/20 absolute -bottom-28 -end-16 size-[380px] rounded-full blur-[130px]" />
      <!-- dot grid -->
      <div class="auth-grid absolute inset-0 opacity-[0.12]" />

      <!-- ambient drifting delivery icons -->
      <div class="pointer-events-none absolute inset-0 overflow-hidden">
        <component
          :is="p.icon"
          v-for="(p, i) in particles"
          :key="i"
          class="particle text-white"
          :style="{
            left: p.left,
            '--dur': p.dur,
            animationDelay: p.delay,
            width: p.size + 'px',
            height: p.size + 'px',
          }"
        />
      </div>

      <div class="relative z-10 flex w-full flex-col justify-between p-10 xl:p-12">
        <!-- top bar -->
        <div class="flex items-center">
          <BrandLogo tone="light" :mark-size="42" />
        </div>

        <!-- 3D delivery package (توصيل) -->
        <div class="scene float-slow pointer-events-none absolute end-8 top-24 xl:end-12">
          <div class="speed" aria-hidden="true"><span /><span /><span /></div>
          <div class="box">
            <div class="face fx-front" />
            <div class="face fx-back" />
            <div class="face fx-right" />
            <div class="face fx-left" />
            <div class="face fx-top" />
            <div class="face fx-bottom" />
          </div>
          <!-- ground shadow -->
          <div class="box-shadow" />
        </div>

        <!-- headline + preview -->
        <div class="max-w-md">
          <h2 class="auth-rise text-3xl font-extrabold leading-tight text-white xl:text-[2.6rem]">
            {{ t('login.showcaseTitle') }}
          </h2>
          <p class="auth-rise mt-4 text-[15px] leading-relaxed text-white/65" style="animation-delay: 0.1s">
            {{ t('login.showcaseSubtitle') }}
          </p>

          <!-- floating product preview -->
          <div class="preview auth-rise relative mt-12 mb-6" style="animation-delay: 0.22s">
            <!-- main glass dashboard card -->
            <div class="float-slow">
              <div class="tilt rounded-2xl border border-white/15 bg-white/10 p-5 shadow-2xl backdrop-blur-xl">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="from-primary to-orange grid size-8 place-items-center rounded-lg bg-gradient-to-br">
                      <Wallet class="size-4 text-white" />
                    </span>
                    <span class="text-sm font-semibold text-white/80">{{ t('login.preview.title') }}</span>
                  </div>
                  <span class="text-success flex items-center gap-0.5 text-xs font-semibold">
                    <TrendingUp class="size-3.5" />+12%
                  </span>
                </div>

                <!-- live commission total -->
                <p class="mt-4 text-xs text-white/50">{{ t('dashboard.kpi.commissionsDue') }}</p>
                <p class="mt-0.5 flex items-baseline gap-1.5 text-3xl font-extrabold text-white tabular-nums">
                  {{ nf.format(commission) }}
                  <span class="text-base font-bold text-white/50">{{ t('common.riyal') }}</span>
                </p>

                <!-- animated bar chart -->
                <div class="mt-5 flex h-24 items-end justify-between gap-2">
                  <div
                    v-for="(b, i) in bars"
                    :key="i"
                    class="bar from-primary/60 to-primary flex-1 rounded-t-md bg-gradient-to-t"
                    :style="{ height: `${b}%` }"
                  />
                </div>
              </div>
            </div>

            <!-- satellite chip: on-time -->
            <div class="float-fast absolute -top-6 end-2">
              <div class="rounded-xl border border-white/15 bg-white/10 px-3.5 py-2.5 shadow-xl backdrop-blur-xl">
                <p class="text-orange text-lg font-extrabold tabular-nums">98%</p>
                <p class="text-[10px] text-white/60">{{ t('login.stat.onTime') }}</p>
              </div>
            </div>

            <!-- satellite chip: top rider -->
            <div class="float-mid absolute -bottom-7 start-0">
              <div class="flex items-center gap-2.5 rounded-xl border border-white/15 bg-white/10 px-3 py-2.5 shadow-xl backdrop-blur-xl">
                <span class="from-primary to-orange grid size-9 place-items-center rounded-full bg-gradient-to-br text-sm font-bold text-white">م</span>
                <div>
                  <p class="flex items-center gap-1 text-xs font-semibold text-white">
                    <Star class="size-3 fill-orange text-orange" />
                    {{ t('login.preview.topRider') }}
                  </p>
                  <p class="text-[11px] text-white/55">محمد الغامدي</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- footer -->
        <p class="flex items-center gap-1.5 text-xs text-white/40">
          <Package class="size-3.5" />
          © {{ year }} SwiftAxis Logistics · {{ t('app.tagline') }}
        </p>
      </div>
    </aside>

    <!-- ── Form side ──────────────────────────────────────────── -->
    <main
      class="bg-background relative z-10 flex flex-1 items-center justify-center p-6 sm:p-10 lg:-ms-8 lg:rounded-s-[2.25rem] lg:shadow-[-24px_0_60px_-24px_rgba(0,0,0,0.45)]"
    >
      <div class="absolute top-5 flex items-center gap-1 end-5">
        <LangToggle />
        <ThemeToggle />
      </div>

      <div class="w-full max-w-md">
        <div class="mb-8 flex justify-center lg:hidden">
          <BrandLogo :mark-size="44" />
        </div>
        <RouterView />
      </div>
    </main>
  </div>
</template>

<style scoped>
.auth-grid {
  background-image: radial-gradient(white 1px, transparent 1px);
  background-size: 22px 22px;
}

/* live bars morph smoothly */
.bar {
  transition: height 0.8s cubic-bezier(0.22, 1, 0.36, 1);
  transform-origin: bottom;
}

/* 3D tilt on the main card */
.tilt {
  transform: perspective(1400px) rotateX(7deg) rotateY(-9deg);
  transform-style: preserve-3d;
}

/* floating loops (separate wrappers so they don't fight the tilt transform) */
.float-slow { animation: floaty 6s ease-in-out infinite; }
.float-mid { animation: floaty 5s ease-in-out infinite; animation-delay: 0.6s; }
.float-fast { animation: floaty 4.2s ease-in-out infinite; animation-delay: 1.1s; }
@keyframes floaty {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

/* ── Ambient drifting icons ──────────────────────────── */
.particle {
  position: absolute;
  bottom: -48px;
  opacity: 0;
  animation: drift var(--dur, 18s) linear infinite;
}
@keyframes drift {
  0% { transform: translateY(0) rotate(0deg); opacity: 0; }
  12% { opacity: 0.16; }
  88% { opacity: 0.16; }
  100% { transform: translateY(-104vh) rotate(45deg); opacity: 0; }
}

/* ── 3D delivery package ─────────────────────────────── */
.scene {
  width: 88px;
  height: 88px;
  perspective: 720px;
  z-index: 5;
}
.box {
  position: relative;
  width: 88px;
  height: 88px;
  transform-style: preserve-3d;
  animation: spin 16s linear infinite;
}
.face {
  position: absolute;
  inset: 0;
  border: 1px solid color-mix(in oklch, var(--color-orange) 55%, black);
  box-shadow: inset 0 0 22px rgba(0, 0, 0, 0.28);
}
.fx-front { transform: translateZ(44px); background: var(--color-orange); }
.fx-back { transform: rotateY(180deg) translateZ(44px); background: color-mix(in oklch, var(--color-orange) 88%, black); }
.fx-right { transform: rotateY(90deg) translateZ(44px); background: color-mix(in oklch, var(--color-orange) 82%, black); }
.fx-left { transform: rotateY(-90deg) translateZ(44px); background: color-mix(in oklch, var(--color-orange) 76%, black); }
.fx-top { transform: rotateX(90deg) translateZ(44px); background: color-mix(in oklch, var(--color-orange) 82%, white); }
.fx-bottom { transform: rotateX(-90deg) translateZ(44px); background: color-mix(in oklch, var(--color-orange) 55%, black); }

/* packing tape */
.fx-front::after,
.fx-back::after,
.fx-right::after,
.fx-left::after {
  content: '';
  position: absolute;
  inset-block: 0;
  inset-inline-start: 50%;
  width: 16px;
  transform: translateX(-50%);
  background: color-mix(in oklch, var(--color-orange) 62%, white);
  opacity: 0.55;
}
.fx-top::after {
  content: '';
  position: absolute;
  inset-inline: 0;
  top: 50%;
  height: 16px;
  transform: translateY(-50%);
  background: color-mix(in oklch, var(--color-orange) 68%, white);
  opacity: 0.6;
}

.box-shadow {
  position: absolute;
  inset-inline: 6px;
  bottom: -26px;
  height: 14px;
  border-radius: 9999px;
  background: radial-gradient(ellipse, rgba(0, 0, 0, 0.4), transparent 70%);
  filter: blur(3px);
  animation: shadow-pulse 6s ease-in-out infinite;
}

@keyframes spin {
  from { transform: rotateX(-22deg) rotateY(0deg); }
  to { transform: rotateX(-22deg) rotateY(360deg); }
}
@keyframes shadow-pulse {
  0%, 100% { transform: scale(1); opacity: 0.4; }
  50% { transform: scale(0.82); opacity: 0.25; }
}

/* motion speed lines */
.speed {
  position: absolute;
  inset-inline-end: 100%;
  top: 50%;
  display: flex;
  flex-direction: column;
  gap: 7px;
  margin-inline-end: 10px;
  transform: translateY(-50%);
}
.speed span {
  display: block;
  height: 2px;
  border-radius: 2px;
  background: linear-gradient(to var(--tw-dir, left), white, transparent);
  opacity: 0.5;
  animation: dash 1.3s ease-in-out infinite;
}
.speed span:nth-child(1) { width: 22px; }
.speed span:nth-child(2) { width: 34px; animation-delay: 0.2s; }
.speed span:nth-child(3) { width: 16px; animation-delay: 0.4s; }
@keyframes dash {
  0% { opacity: 0; transform: translateX(6px); }
  50% { opacity: 0.6; }
  100% { opacity: 0; transform: translateX(-8px); }
}

/* entrance */
.auth-rise {
  opacity: 0;
  animation: auth-rise 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}
@keyframes auth-rise {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (prefers-reduced-motion: reduce) {
  .float-slow, .float-mid, .float-fast, .auth-rise, .bar,
  .box, .box-shadow, .speed span, .particle { animation: none; transition: none; }
  .box { transform: rotateX(-22deg) rotateY(-32deg); }
}
</style>
