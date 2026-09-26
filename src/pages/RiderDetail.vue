<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ArrowLeft, Bike, Car, Wallet, AlertTriangle, Package, Coins, Banknote } from 'lucide-vue-next'
import Avatar from '@/components/common/Avatar.vue'
import RiderCode from '@/components/common/RiderCode.vue'
import StatCard from '@/components/dashboard/StatCard.vue'
import WeeklyChart from '@/components/charts/WeeklyChart.vue'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useCurrency } from '@/composables/useCurrency'
import { useDate } from '@/lib/format'
import { CONTRACTS, CITIES, VEHICLE_TYPES, SHIFTS, VEHICLE_STATUS } from '@/api/fixtures'
import { fetchRiderDetail } from '@/api/riders'

const route = useRoute()
const { t, locale } = useI18n()
const { sar, num } = useCurrency()
const { formatDate } = useDate()

const loading = ref(true)
const notFound = ref(false)
const detail = ref(null)

const loc = (map, k) => map[k]?.[locale.value] ?? map[k]?.ar ?? k

async function load() {
  loading.value = true
  notFound.value = false
  try {
    detail.value = await fetchRiderDetail(route.params.id)
  } catch {
    notFound.value = true
  } finally {
    loading.value = false
  }
}
onMounted(load)
watch(() => route.params.id, load)

const rider = computed(() => detail.value?.rider)
const breakdown = computed(() => detail.value?.breakdown)
const assignment = computed(() => detail.value?.assignment)

const chartLabels = computed(() => (detail.value?.logs ?? []).map((o) => formatDate(o.date)))
const chartOrders = computed(() => (detail.value?.logs ?? []).map((o) => o.orders))

function statusVariant(r) {
  if (!r.active) return 'secondary'
  if (r.underperforming) return 'warning'
  return 'success'
}
function statusLabel(r) {
  if (!r.active) return t('dashboard.status.inactive')
  if (r.underperforming) return t('dashboard.status.warning')
  return t('dashboard.status.active')
}
const vehicleStatusVariant = (s) => (s === 'active' ? 'success' : s === 'maintenance' ? 'warning' : 'danger')
</script>

<template>
  <div>
    <div class="mb-4">
      <Button variant="ghost" size="sm" as="RouterLink" to="/riders">
        <ArrowLeft class="size-4 rtl:rotate-180" /> {{ t('riderDetail.back') }}
      </Button>
    </div>

    <!-- loading -->
    <div v-if="loading" class="space-y-4">
      <Skeleton class="h-20 rounded-2xl" />
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Skeleton v-for="i in 4" :key="i" class="h-28 rounded-2xl" />
      </div>
      <Skeleton class="h-72 rounded-2xl" />
    </div>

    <!-- not found -->
    <Card v-else-if="notFound" class="py-16 text-center">
      <p class="text-muted-foreground">{{ t('riderDetail.notFound') }}</p>
    </Card>

    <div v-else-if="rider" class="space-y-6">
      <!-- header -->
      <Card class="p-5">
        <div class="flex flex-wrap items-center gap-4">
          <Avatar :initials="rider.name.charAt(0)" :src="rider.photo?.url" class="size-14 text-lg" />
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-2">
              <h1 class="text-xl font-bold">{{ rider.name }}</h1>
              <RiderCode :code="rider.id" class="text-xs" />
              <Badge :variant="statusVariant(rider)">{{ statusLabel(rider) }}</Badge>
              <AlertTriangle v-if="rider.underperforming" class="text-warning-foreground size-4" />
            </div>
            <p class="text-muted-foreground mt-1 text-sm">
              <span dir="ltr" class="tabular-nums">{{ rider.nationalId }}</span>
              · <span dir="ltr" class="tabular-nums">{{ rider.mobile }}</span>
              · {{ loc(CITIES, rider.city) }}
            </p>
          </div>
          <div class="flex flex-wrap gap-1">
            <Badge v-for="cid in (rider.contracts ?? [rider.contract])" :key="cid" variant="secondary">
              {{ loc(CONTRACTS, cid) }}
            </Badge>
          </div>
        </div>
      </Card>

      <!-- stats -->
      <div class="grid gap-4 xl:grid-cols-4">
        <div class="stat-strip grid sm:grid-cols-3 xl:col-span-3">
          <StatCard :icon="Package" :label="t('riderDetail.orders')" :value="num(rider.orders)" />
          <StatCard :icon="Coins" :label="t('riderDetail.commission')" :value="sar(breakdown.total)" accent="orange" />
          <StatCard :icon="Banknote" :label="t('riderDetail.baseSalary')" :value="sar(breakdown.base)" accent="success" />
        </div>
        <Card class="p-5">
          <p class="text-muted-foreground text-sm font-medium">{{ t('riderDetail.target') }}</p>
          <p class="mt-2 text-3xl font-extrabold tracking-tight tabular-nums">
            {{ num(rider.orders) }} <span class="text-muted-foreground text-base font-medium">/ {{ num(breakdown.target) }}</span>
          </p>
          <div class="mt-3 flex items-center gap-2">
            <Progress :value="rider.progress" :indicator-class="rider.progress >= 100 ? 'bg-success' : rider.underperforming ? 'bg-danger' : 'bg-primary'" class="flex-1" />
            <span class="text-muted-foreground text-xs tabular-nums">{{ rider.progress }}%</span>
          </div>
        </Card>
      </div>

      <div class="grid gap-6 xl:grid-cols-3">
        <!-- daily orders chart -->
        <Card class="xl:col-span-2">
          <CardHeader>
            <CardTitle>{{ t('riderDetail.chartTitle') }}</CardTitle>
          </CardHeader>
          <CardContent>
            <WeeklyChart v-if="chartOrders.length" :labels="chartLabels" :orders="chartOrders" />
            <p v-else class="text-muted-foreground py-12 text-center text-sm">{{ t('common.noData') }}</p>
          </CardContent>
        </Card>

        <!-- vehicle + wallet -->
        <div class="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{{ t('riderDetail.vehicleTitle') }}</CardTitle>
            </CardHeader>
            <CardContent>
              <div v-if="assignment" class="space-y-3 text-sm">
                <div class="flex items-center gap-2 font-medium">
                  <component :is="assignment.vehicle.type === 'car' ? Car : Bike" class="text-muted-foreground size-4" />
                  <span dir="ltr">{{ assignment.vehicle.plate }}</span>
                  <span class="text-muted-foreground">— {{ assignment.vehicle.model || loc(VEHICLE_TYPES, assignment.vehicle.type) }}</span>
                </div>
                <div v-if="assignment.vehicle.chassis || assignment.vehicle.color || assignment.vehicle.year" class="text-muted-foreground grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                  <span v-if="assignment.vehicle.color">{{ t('vehicles.fields.color') }}: <b class="text-foreground">{{ assignment.vehicle.color }}</b></span>
                  <span v-if="assignment.vehicle.year">{{ t('vehicles.fields.year') }}: <b class="text-foreground tabular-nums">{{ assignment.vehicle.year }}</b></span>
                  <span v-if="assignment.vehicle.tankCapacity">{{ t('vehicles.fields.tankCapacity') }}: <b class="text-foreground tabular-nums">{{ assignment.vehicle.tankCapacity }}</b></span>
                  <span v-if="assignment.vehicle.chassis" class="col-span-2">{{ t('vehicles.fields.chassis') }}: <b class="text-foreground" dir="ltr">{{ assignment.vehicle.chassis }}</b></span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-muted-foreground">{{ t('riderDetail.shift') }}</span>
                  <Badge variant="secondary">{{ loc(SHIFTS, assignment.shift) }}</Badge>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-muted-foreground">{{ t('vehicles.statusLabel') }}</span>
                  <Badge :variant="vehicleStatusVariant(assignment.vehicle.status)">{{ loc(VEHICLE_STATUS, assignment.vehicle.status) }}</Badge>
                </div>
                <p v-if="assignment.vehicle.status !== 'active' && assignment.vehicle.statusFrom" class="text-muted-foreground text-xs">
                  {{ t('vehicles.statusFrom') }} <span dir="ltr" class="tabular-nums">{{ formatDate(assignment.vehicle.statusFrom) }}</span>
                  <template v-if="assignment.vehicle.statusTo">
                    — {{ t('vehicles.statusTo') }} <span dir="ltr" class="tabular-nums">{{ formatDate(assignment.vehicle.statusTo) }}</span>
                  </template>
                </p>
              </div>
              <p v-else class="text-muted-foreground text-sm">{{ t('riderDetail.noVehicle') }}</p>
            </CardContent>
          </Card>

          <Card class="p-5">
            <div class="flex items-center gap-3">
              <span class="bg-primary/10 text-primary grid size-11 place-items-center rounded-lg"><Wallet class="size-5" /></span>
              <div>
                <p class="text-2xl font-bold tabular-nums">{{ sar(rider.wallet) }}</p>
                <p class="text-muted-foreground text-xs">{{ t('wallets.balance') }}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  </div>
</template>
