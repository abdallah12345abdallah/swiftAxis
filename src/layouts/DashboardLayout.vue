<script setup>
import { computed, ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter, useRoute } from 'vue-router'
import {
  LayoutDashboard, Users, ClipboardList, Percent, Wallet, Car,
  FileBarChart, BookOpen, ShoppingCart, ShieldCheck, Settings,
  Bell, LogOut, User, ChevronDown, UserCircle,
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { NAV_ITEMS, ROLES } from '@/lib/constants'
import BrandLogo from '@/components/common/BrandLogo.vue'
import ThemeToggle from '@/components/common/ThemeToggle.vue'
import LangToggle from '@/components/common/LangToggle.vue'
import RoleSwitcher from '@/components/common/RoleSwitcher.vue'
import Dropdown from '@/components/common/Dropdown.vue'
import Avatar from '@/components/common/Avatar.vue'
import { Badge } from '@/components/ui/badge'
import { ToastHost } from '@/components/ui/toast'

const ICONS = {
  LayoutDashboard, Users, ClipboardList, Percent, Wallet, Car,
  FileBarChart, BookOpen, ShoppingCart, ShieldCheck, Settings,
}

const { t, locale } = useI18n()
const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const navItems = computed(() => NAV_ITEMS.filter((item) => item.roles.includes(auth.role)))

// Sliding active-tab indicator
const navEl = ref(null)
const indicator = ref({ left: 0, width: 0, opacity: 0 })

function updateIndicator() {
  const c = navEl.value
  if (!c) return
  const active = c.querySelector('.router-link-active')
  if (!active) {
    indicator.value = { ...indicator.value, opacity: 0 }
    return
  }
  indicator.value = { left: active.offsetLeft, width: active.offsetWidth, opacity: 1 }
  // keep the active tab in view
  active.scrollIntoView({ block: 'nearest', inline: 'nearest' })
}

watch(() => route.fullPath, () => nextTick(updateIndicator))
watch(locale, () => nextTick(updateIndicator))
watch(() => navItems.value.length, () => nextTick(updateIndicator))
onMounted(() => {
  nextTick(updateIndicator)
  window.addEventListener('resize', updateIndicator)
})
onUnmounted(() => window.removeEventListener('resize', updateIndicator))

function logout() {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <div class="bg-background min-h-screen">
    <!-- ── Top navbar ─────────────────────────────────────── -->
    <header class="glass sticky top-0 z-40 border-b">
      <!-- row 1: brand + controls -->
      <div class="mx-auto flex h-16 max-w-[1600px] items-center gap-3 px-4 sm:px-6">
        <RouterLink to="/dashboard" class="shrink-0">
          <BrandLogo :mark-size="34" />
        </RouterLink>

        <div class="ms-auto flex shrink-0 items-center gap-1.5">
          <RoleSwitcher />
          <LangToggle />
          <ThemeToggle />

          <button
            type="button"
            class="border-border bg-card/50 hover:bg-accent text-muted-foreground relative inline-flex size-9 items-center justify-center rounded-lg border transition-colors"
            :aria-label="t('common.notifications')"
          >
            <Bell class="size-5" />
            <span class="bg-orange absolute top-2 size-2 rounded-full end-2" />
          </button>

          <!-- User menu -->
          <Dropdown align="end" content-class="w-72">
            <template #trigger="{ open }">
              <button type="button" class="border-border bg-card/50 hover:bg-accent flex h-9 items-center gap-2 rounded-lg border px-1.5 transition-colors">
                <span class="hidden text-end lg:block">
                  <span class="block text-xs font-semibold leading-tight">{{ auth.user?.name }}</span>
                  <span class="text-muted-foreground block text-[11px] leading-tight">{{ t(`roles.${auth.role}`) }}</span>
                </span>
                <Avatar :initials="auth.initials" class="size-6 text-xs" />
                <ChevronDown
                  class="text-muted-foreground size-4 shrink-0 transition-transform duration-200"
                  :class="open && 'rotate-180'"
                />
              </button>
            </template>

            <!-- header -->
            <div class="from-primary/10 flex items-center gap-3 rounded-lg bg-gradient-to-br to-transparent p-3">
              <div class="from-primary to-orange grid size-11 shrink-0 place-items-center rounded-full bg-gradient-to-br text-base font-bold text-white shadow-sm">
                {{ auth.initials }}
              </div>
              <div class="min-w-0">
                <p class="truncate text-sm font-semibold">{{ auth.user?.name }}</p>
                <Badge variant="default" class="mt-1">{{ t(`roles.${auth.role}`) }}</Badge>
              </div>
            </div>

            <div class="bg-border/70 -mx-1.5 my-1.5 h-px" />

            <!-- items -->
            <RouterLink to="/profile" class="menu-item">
              <UserCircle class="text-muted-foreground size-4" />
              {{ t('common.profile') }}
            </RouterLink>
            <RouterLink v-if="auth.role === ROLES.MANAGER" to="/settings" class="menu-item">
              <Settings class="text-muted-foreground size-4" />
              {{ t('nav.settings') }}
            </RouterLink>

            <div class="bg-border/70 -mx-1.5 my-1.5 h-px" />

            <button type="button" class="menu-item text-danger hover:!bg-danger/10 w-full" @click="logout">
              <LogOut class="size-4" />
              {{ t('common.logout') }}
            </button>
          </Dropdown>
        </div>
      </div>

      <!-- row 2: tab bar with sliding underline -->
      <div class="mx-auto max-w-[1600px] px-2 sm:px-4">
        <div class="no-scrollbar overflow-x-auto">
          <nav ref="navEl" class="relative flex items-center gap-1">
            <RouterLink
              v-for="item in navItems"
              :key="item.key"
              :to="item.to"
              class="nav-link text-muted-foreground hover:text-foreground relative flex items-center gap-2 whitespace-nowrap px-3 py-3 text-sm font-medium transition-colors"
            >
              <component :is="ICONS[item.icon]" class="size-4 shrink-0 opacity-80" />
              {{ t(`nav.${item.key}`) }}
            </RouterLink>

            <!-- sliding underline -->
            <span
              class="bg-primary pointer-events-none absolute bottom-0 left-0 h-px rounded-t-full transition-all duration-300 ease-out"
              :style="{
                transform: `translateX(${indicator.left}px)`,
                width: `${indicator.width}px`,
                opacity: indicator.opacity,
              }"
            />
          </nav>
        </div>
      </div>
    </header>

    <!-- ── Page ───────────────────────────────────────────── -->
    <main class="mx-auto max-w-[1600px] p-4 sm:p-6 lg:p-8">
      <RouterView />
    </main>

    <ToastHost />
  </div>
</template>

<style scoped>
.no-scrollbar {
  scrollbar-width: none;
}
.no-scrollbar::-webkit-scrollbar {
  display: none;
}

/* active tab — brand color + sliding underline */
.nav-link.router-link-active {
  color: var(--primary);
  font-weight: 600;
}
.nav-link.router-link-active :deep(svg) {
  color: var(--primary);
  opacity: 1;
}

/* user-menu items */
.menu-item {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  border-radius: var(--radius-md);
  padding: 0.5rem 0.625rem;
  font-size: 0.875rem;
  transition: background-color 0.15s ease;
}
.menu-item:hover {
  background: var(--accent);
}
</style>
