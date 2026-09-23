<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import { X, Bike, Car, Wallet, ExternalLink, Target, Package, Percent, Banknote } from 'lucide-vue-next'
import Avatar from '@/components/common/Avatar.vue'
import RiderCode from '@/components/common/RiderCode.vue'
import WeeklyChart from '@/components/charts/WeeklyChart.vue'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useCurrency } from '@/composables/useCurrency'
import { useDate } from '@/lib/format'
import { CONTRACTS, VEHICLE_TYPES, SHIFTS, VEHICLE_STATUS } from '@/api/fixtures'
import { fetchRiderDetail } from '@/api/riders'

/* Side panel (#9): opens next to the main sheet when a rider's name is
   clicked and shows their orders, performance chart, commission, target,
   salary and vehicle — without leaving the page. */
const props = defineProps({
  open: { type: Boolean, default: false },
  riderId: { type: String, default: '' },
})
const emit = defineEmits(['update:open'])

const { t, locale } = useI18n()
const { sar, num } = useCurrency()
const { formatDate } = useDate()

const loading = ref(false)
const detail = ref(null)
const loc = (map, k) => map[k]?.[locale.value] ?? map[k]?.ar ?? k

async function load() {
  if (!props.riderId) return
  loading.value = true
  try {
    detail.value = await fetchRiderDetail(props.riderId)
  } catch {
    detail.value = null
  } finally {
    loading.value = false
  }
}
watch(
  () => [props.open, props.riderId],
  ([open]) => {
    if (open) load()
  },
  { immediate: true },
)

const rider = computed(() => detail.value?.rider)
const breakdown = computed(() => detail.value?.breakdown)
const assignment = computed(() => detail.value?.assignment)
const chartLabels = computed(() => (detail.value?.logs ?? []).slice(-7).map((o) => formatDate(o.date, { day: 'numeric', month: 'short' })))
const chartOrders = computed(() => (detail.value?.logs ?? []).slice(-7).map((o) => o.orders))

const close = () => emit('update:open', false)
function onKey(e) {
  if (e.key === 'Escape' && props.open) close()
}
onMounted(() => document.addEventListener('keydown', onKey))
onBeforeUnmount(() => document.removeEventListener('keydown', onKey))

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
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      leave-active-class="transition-opacity duration-150"
      leave-to-class="opacity-0"
    >
      <div v-if="open" class="bg-navy/40 fixed inset-0 z-40 backdrop-blur-[2px]" @click="close" />
    </Transition>

    <Transition
      enter-active-class="transition-transform duration-300 ease-out"
      enter-from-class="translate-x-full rtl:-translate-x-full"
      leave-active-class="transition-transform duration-200 ease-in"
      leave-to-class="translate-x-full rtl:-translate-x-full"
    >
      <aside
        v-if="open"
        class="bg-card text-card-foreground fixed inset-y-0 z-50 flex w-full max-w-md flex-col border-s shadow-2xl end-0"
        role="dialog"
        aria-modal="true"
      >
        <!-- header -->
        <div class="flex items-center gap-3 border-b px-5 py-4">
          <h2 class="flex-1 text-base font-bold">{{ t('riderPanel.title') }}</h2>
          <Button v-if="rider" variant="outline" size="sm" as="RouterLink" :to="`/riders/${rider.id}`" @click="close">
            <ExternalLink /> {{ t('riderPanel.openFull') }}
          </Button>
          <button type="button" class="hover:bg-accent text-muted-foreground inline-flex size-9 items-center justify-center rounded-lg" :aria-label="t('common.close')" @click="close">
            <X class="size-4" />
          </button>
        </div>

        <div class="flex-1 space-y-5 overflow-y-auto p-5">
          <div v-if="loading || !rider" class="space-y-4">
            <Skeleton class="h-16 rounded-2xl" />
            <div class="grid grid-cols-2 gap-3"><Skeleton v-for="i in 4" :key="i" class="h-20 rounded-xl" /></div>
            <Skeleton class="h-56 rounded-2xl" />
          </div>

          <template v-else>
            <!-- identity -->
            <div class="flex items-center gap-3">
              <Avatar :initials="rider.name.charAt(0)" :src="rider.photo?.url" class="size-14 text-lg" />
              <div class="min-w-0 flex-1">
                <div class="flex flex-wrap items-center gap-2">
                  <p class="truncate text-lg font-bold">{{ rider.name }}</p>
                  <RiderCode :code="rider.id" />
                </div>
                <div class="mt-1 flex flex-wrap items-center gap-1.5">
                  <Badge :variant="statusVariant(rider)">{{ statusLabel(rider) }}</Badge>
                  <Badge v-for="cid in rider.contracts ?? [rider.contract]" :key="cid" variant="secondary">{{ loc(CONTRACTS, cid) }}</Badge>
                </div>
              </div>
            </div>

            <!-- numbers -->
            <div class="grid grid-cols-2 gap-3">
              <div class="bg-muted/40 rounded-xl p-3">
                <p class="text-muted-foreground flex items-center gap-1.5 text-xs"><Package class="size-3.5" /> {{ t('riderPanel.orders') }}</p>
                <p class="mt-1 text-2xl font-bold tabular-nums">{{ num(rider.orders) }}</p>
              </div>
              <div class="bg-muted/40 rounded-xl p-3">
                <p class="text-muted-foreground flex items-center gap-1.5 text-xs"><Target class="size-3.5" /> {{ t('riderPanel.target') }}</p>
                <p class="mt-1 text-2xl font-bold tabular-nums">{{ num(breakdown.target) }}</p>
                <div class="mt-2 flex items-center gap-2">
                  <Progress :value="rider.progress" class="h-1.5 flex-1" :indicator-class="rider.progress >= 100 ? 'bg-success' : rider.underperforming ? 'bg-danger' : 'bg-primary'" />
                  <span class="text-muted-foreground text-[11px] tabular-nums">{{ rider.progress }}%</span>
                </div>
              </div>
              <div class="bg-orange/8 rounded-xl p-3">
                <p class="text-muted-foreground flex items-center gap-1.5 text-xs"><Percent class="size-3.5" /> {{ t('riderPanel.commission') }}</p>
                <p class="text-orange mt-1 text-xl font-bold tabular-nums">{{ sar(breakdown.extraAmount) }}</p>
              </div>
              <div class="bg-success/8 rounded-xl p-3">
                <p class="text-muted-foreground flex items-center gap-1.5 text-xs"><Banknote class="size-3.5" /> {{ t('riderPanel.salary') }}</p>
                <p class="mt-1 text-xl font-bold tabular-nums">{{ sar(breakdown.base) }}</p>
                <p class="text-muted-foreground mt-0.5 text-[11px]">{{ t('riderPanel.expected') }}: <b class="tabular-nums">{{ sar(breakdown.total) }}</b></p>
              </div>
            </div>

            <!-- chart -->
            <div class="rounded-2xl border p-3">
              <p class="mb-1 text-sm font-semibold">{{ t('riderPanel.chart') }}</p>
              <WeeklyChart v-if="chartOrders.length" :labels="chartLabels" :orders="chartOrders" :goal="Math.round(breakdown.target / 26)" />
              <p v-else class="text-muted-foreground py-8 text-center text-sm">{{ t('common.noData') }}</p>
            </div>

            <!-- vehicle -->
            <div class="rounded-2xl border p-4">
              <p class="mb-3 text-sm font-semibold">{{ t('riderPanel.vehicle') }}</p>
              <div v-if="assignment" class="space-y-2 text-sm">
                <div class="flex items-center gap-2 font-medium">
                  <component :is="assignment.vehicle.type === 'car' ? Car : Bike" class="text-muted-foreground size-4" />
                  <span dir="ltr">{{ assignment.vehicle.plate }}</span>
                  <span class="text-muted-foreground">— {{ assignment.vehicle.model || loc(VEHICLE_TYPES, assignment.vehicle.type) }}</span>
                </div>
                <div class="text-muted-foreground grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                  <span>{{ t('riderDetail.shift') }}: <b class="text-foreground">{{ loc(SHIFTS, assignment.shift) }}</b></span>
                  <span v-if="assignment.vehicle.year">{{ t('vehicles.fields.year') }}: <b class="text-foreground tabular-nums">{{ assignment.vehicle.year }}</b></span>
                  <span v-if="assignment.vehicle.color">{{ t('vehicles.fields.color') }}: <b class="text-foreground">{{ assignment.vehicle.color }}</b></span>
                  <span>{{ t('vehicles.statusLabel') }}: <Badge :variant="vehicleStatusVariant(assignment.vehicle.status)" class="ms-1">{{ loc(VEHICLE_STATUS, assignment.vehicle.status) }}</Badge></span>
                </div>
              </div>
              <p v-else class="text-muted-foreground text-sm">{{ t('riderDetail.noVehicle') }}</p>
            </div>

            <!-- wallet -->
            <div class="flex items-center gap-3 rounded-2xl border p-4">
              <span class="bg-primary/10 text-primary grid size-10 place-items-center rounded-lg"><Wallet class="size-5" /></span>
              <div>
                <p class="text-xl font-bold tabular-nums">{{ sar(rider.wallet) }}</p>
                <p class="text-muted-foreground text-xs">{{ t('riderPanel.wallet') }}</p>
              </div>
            </div>
          </template>
        </div>
      </aside>
    </Transition>
  </Teleport>
</template>
