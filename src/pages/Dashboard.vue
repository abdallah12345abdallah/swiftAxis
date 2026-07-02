<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  Package, Banknote, Users, TrendingUp, Wallet, Target, PartyPopper, ArrowDownLeft,
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { ROLES } from '@/lib/constants'
import { useCurrency } from '@/composables/useCurrency'
import { fetchManagerDashboard, fetchRiderDashboard } from '@/api/dashboard'

import PageHeader from '@/components/common/PageHeader.vue'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import KpiCard from '@/components/dashboard/KpiCard.vue'
import RiderPerformanceTable from '@/components/dashboard/RiderPerformanceTable.vue'
import AlertsPanel from '@/components/dashboard/AlertsPanel.vue'
import GoalRing from '@/components/dashboard/GoalRing.vue'
import LineTrendChart from '@/components/charts/LineTrendChart.vue'
import RiderBarChart from '@/components/charts/RiderBarChart.vue'
import WeeklyChart from '@/components/charts/WeeklyChart.vue'

const { t } = useI18n()
const auth = useAuthStore()
const { sar, num } = useCurrency()

const isRider = computed(() => auth.role === ROLES.RIDER)

const loading = ref(true)
const period = ref('month')
const data = ref(null)

const PERIODS = ['day', 'month', 'year']

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
  <div>
    <PageHeader
      :title="t('dashboard.welcome', { name: auth.user?.name })"
      :subtitle="isRider ? t('dashboard.subtitleRider') : t('dashboard.subtitleManager')"
    >
      <template #actions>
        <!-- Period segmented control (manager/team views) -->
        <div v-if="!isRider" class="bg-muted flex rounded-lg p-1">
          <button
            v-for="p in PERIODS"
            :key="p"
            type="button"
            class="rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
            :class="period === p ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'"
            @click="period = p"
          >
            {{ t(`common.${p}`) }}
          </button>
        </div>
      </template>
    </PageHeader>

    <!-- Loading skeletons -->
    <div v-if="loading" class="space-y-6">
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Skeleton v-for="i in 4" :key="i" class="h-28 rounded-2xl" />
      </div>
      <div class="grid gap-6 lg:grid-cols-3">
        <Skeleton class="h-80 rounded-2xl lg:col-span-2" />
        <Skeleton class="h-80 rounded-2xl" />
      </div>
    </div>

    <!-- ── Manager / Supervisor / Accountant view ────────────────── -->
    <div v-else-if="!isRider" class="space-y-6">
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard :label="t('dashboard.kpi.totalOrders')" :value="num(data.kpis.totalOrders.value)" :delta="data.kpis.totalOrders.delta" :icon="Package" accent="primary" />
        <KpiCard :label="t('dashboard.kpi.commissionsDue')" :value="sar(data.kpis.commissionsDue.value)" :delta="data.kpis.commissionsDue.delta" :icon="Banknote" accent="orange" />
        <KpiCard :label="t('dashboard.kpi.activeRiders')" :value="num(data.kpis.activeRiders.value)" :delta="data.kpis.activeRiders.delta" :icon="Users" accent="success" />
        <KpiCard :label="t('dashboard.kpi.avgOrders')" :value="num(data.kpis.avgOrders.value)" :delta="data.kpis.avgOrders.delta" :icon="TrendingUp" accent="primary" />
      </div>

      <div class="grid gap-6 lg:grid-cols-3">
        <Card class="lg:col-span-2">
          <CardHeader>
            <CardTitle>{{ t('dashboard.trendTitle') }}</CardTitle>
          </CardHeader>
          <CardContent>
            <LineTrendChart :labels="data.trend.labels" :orders="data.trend.orders" :commissions="data.trend.commissions" />
          </CardContent>
        </Card>
        <AlertsPanel :alerts="data.alerts" />
      </div>

      <RiderPerformanceTable :riders="data.riders" />

      <Card>
        <CardHeader>
          <CardTitle>{{ t('dashboard.compareTitle') }}</CardTitle>
        </CardHeader>
        <CardContent>
          <RiderBarChart :riders="data.comparison" />
        </CardContent>
      </Card>
    </div>

    <!-- ── Rider view (own data only, US-020) ────────────────────── -->
    <div v-else class="space-y-6">
      <div
        v-if="data.goalReached"
        class="bg-success/10 text-success flex items-center gap-2 rounded-xl border border-success/25 px-4 py-3 text-sm font-semibold"
      >
        <PartyPopper class="size-5" />
        {{ t('dashboard.goalReached') }}
      </div>

      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <KpiCard :label="t('dashboard.kpi.myOrders')" :value="num(data.kpis.myOrders.value)" :delta="data.kpis.myOrders.delta" :icon="Package" accent="primary" />
        <KpiCard :label="t('dashboard.kpi.myCommission')" :value="sar(data.kpis.myCommission.value)" :delta="data.kpis.myCommission.delta" :icon="Banknote" accent="orange" />
        <KpiCard :label="t('dashboard.kpi.walletBalance')" :value="sar(data.kpis.walletBalance.value)" :icon="Wallet" accent="success" />
      </div>

      <div class="grid gap-6 lg:grid-cols-3">
        <Card class="lg:col-span-2">
          <CardHeader>
            <CardTitle>{{ t('dashboard.weeklyTitle') }}</CardTitle>
          </CardHeader>
          <CardContent>
            <WeeklyChart :labels="data.week.labels" :orders="data.week.orders" :goal="data.week.dailyGoal" />
          </CardContent>
        </Card>

        <div class="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle class="flex items-center gap-2">
                <Target class="text-primary size-4" />
                {{ t('dashboard.kpi.goalProgress') }}
              </CardTitle>
            </CardHeader>
            <CardContent class="grid place-items-center pb-6">
              <GoalRing :value="data.kpis.goalProgress.value" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle class="flex items-center gap-2">
                <Wallet class="text-primary size-4" />
                {{ t('dashboard.kpi.walletBalance') }}
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
    </div>
  </div>
</template>
