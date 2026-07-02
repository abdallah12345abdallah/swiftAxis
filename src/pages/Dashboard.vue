<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  Wallet, Target, PartyPopper, ArrowDownLeft, LineChart, CalendarDays,
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { ROLES } from '@/lib/constants'
import { useCurrency } from '@/composables/useCurrency'
import { fetchManagerDashboard, fetchRiderDashboard } from '@/api/dashboard'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import StatCard from '@/components/dashboard/StatCard.vue'
import TopRiders from '@/components/dashboard/TopRiders.vue'
import RiderPerformanceTable from '@/components/dashboard/RiderPerformanceTable.vue'
import AlertsPanel from '@/components/dashboard/AlertsPanel.vue'
import GoalRing from '@/components/dashboard/GoalRing.vue'
import LineTrendChart from '@/components/charts/LineTrendChart.vue'
import WeeklyChart from '@/components/charts/WeeklyChart.vue'

const { t, locale } = useI18n()
const auth = useAuthStore()
const { sar, num } = useCurrency()

const isRider = computed(() => auth.role === ROLES.RIDER)

const loading = ref(true)
const period = ref('month')
const data = ref(null)

const PERIODS = ['day', 'month', 'year']

const dateStr = computed(() =>
  new Intl.DateTimeFormat(locale.value === 'ar' ? 'ar-SA-u-nu-latn' : 'en-US', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  }).format(new Date()),
)

async function load() {
  loading.value = true
  data.value = isRider.value
    ? await fetchRiderDashboard(auth.user?.riderId)
    : await fetchManagerDashboard(period.value)
  loading.value = false
}

onMounted(load)
watch(period, () => {
  if (!isRider.value) load()
})
watch(() => auth.role, load)
</script>

<template>
  <div class="space-y-6">
    <!-- ── Header ─────────────────────────────────────────── -->
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
          <CalendarDays class="size-3.5" /> {{ dateStr }}
        </p>
        <h1 class="mt-1 text-2xl font-bold tracking-tight">
          {{ t('dashboard.welcome', { name: auth.user?.name }) }}
        </h1>
        <p class="text-muted-foreground mt-0.5 text-sm">
          {{ isRider ? t('dashboard.subtitleRider') : t('dashboard.subtitleManager') }}
        </p>
      </div>

      <div v-if="!isRider" class="bg-muted flex rounded-lg p-1">
        <button
          v-for="p in PERIODS"
          :key="p"
          type="button"
          class="rounded-md px-4 py-1.5 text-sm font-medium transition-colors"
          :class="period === p ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'"
          @click="period = p"
        >
          {{ t(`common.${p}`) }}
        </button>
      </div>
    </div>

    <!-- ── Loading ────────────────────────────────────────── -->
    <div v-if="loading" class="space-y-6">
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Skeleton v-for="i in 4" :key="i" class="h-28 rounded-2xl" />
      </div>
      <div class="grid gap-6 lg:grid-cols-3">
        <Skeleton class="h-80 rounded-2xl lg:col-span-2" />
        <Skeleton class="h-80 rounded-2xl" />
      </div>
    </div>

    <!-- ── Manager / Supervisor / Accountant ──────────────── -->
    <template v-else-if="!isRider">
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard :index="0" :label="t('dashboard.kpi.totalOrders')" :value="num(data.kpis.totalOrders.value)" :delta="data.kpis.totalOrders.delta" accent="primary" />
        <StatCard :index="1" :label="t('dashboard.kpi.commissionsDue')" :value="sar(data.kpis.commissionsDue.value)" :delta="data.kpis.commissionsDue.delta" accent="orange" />
        <StatCard :index="2" :label="t('dashboard.kpi.activeRiders')" :value="num(data.kpis.activeRiders.value)" :delta="data.kpis.activeRiders.delta" accent="success" />
        <StatCard :index="3" :label="t('dashboard.kpi.avgOrders')" :value="num(data.kpis.avgOrders.value)" :delta="data.kpis.avgOrders.delta" accent="primary" />
      </div>

      <!-- focal chart + side panel -->
      <div class="grid gap-6 lg:grid-cols-3">
        <Card class="lg:col-span-2">
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <LineChart class="text-primary size-4" /> {{ t('dashboard.trendTitle') }}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <LineTrendChart :labels="data.trend.labels" :orders="data.trend.orders" :commissions="data.trend.commissions" />
          </CardContent>
        </Card>
        <AlertsPanel :alerts="data.alerts" />
      </div>

      <!-- leaderboard + table -->
      <div class="grid gap-6 lg:grid-cols-3">
        <TopRiders :riders="data.comparison" />
        <div class="lg:col-span-2">
          <RiderPerformanceTable :riders="data.riders" />
        </div>
      </div>
    </template>

    <!-- ── Rider (own data only, US-020) ──────────────────── -->
    <template v-else>
      <div
        v-if="data.goalReached"
        class="bg-success/10 text-success border-success/25 flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold"
      >
        <PartyPopper class="size-5" />
        {{ t('dashboard.goalReached') }}
      </div>

      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard :index="0" :label="t('dashboard.kpi.myOrders')" :value="num(data.kpis.myOrders.value)" :delta="data.kpis.myOrders.delta" accent="primary" />
        <StatCard :index="1" :label="t('dashboard.kpi.myCommission')" :value="sar(data.kpis.myCommission.value)" :delta="data.kpis.myCommission.delta" accent="orange" />
        <StatCard :index="2" :label="t('dashboard.kpi.walletBalance')" :value="sar(data.kpis.walletBalance.value)" accent="success" />
      </div>

      <div class="grid gap-6 lg:grid-cols-3">
        <Card class="lg:col-span-2">
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <LineChart class="text-primary size-4" /> {{ t('dashboard.weeklyTitle') }}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <WeeklyChart :labels="data.week.labels" :orders="data.week.orders" :goal="data.week.dailyGoal" />
          </CardContent>
        </Card>

        <div class="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle class="flex items-center gap-2">
                <Target class="text-primary size-4" /> {{ t('dashboard.kpi.goalProgress') }}
              </CardTitle>
            </CardHeader>
            <CardContent class="grid place-items-center pb-6">
              <GoalRing :value="data.kpis.goalProgress.value" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle class="flex items-center gap-2">
                <Wallet class="text-primary size-4" /> {{ t('dashboard.kpi.walletBalance') }}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p class="text-2xl font-bold tabular-nums">{{ sar(data.wallet.balance) }}</p>
              <div class="text-muted-foreground mt-2 flex items-center gap-2 text-sm">
                <ArrowDownLeft class="text-success size-4" />
                <span>{{ t('dashboard.lastMovement') }}: {{ sar(data.wallet.lastMovement.amount) }}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </template>
  </div>
</template>
