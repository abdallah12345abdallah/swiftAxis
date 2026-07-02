<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import {
  LayoutDashboard, Users, ClipboardList, Percent, Wallet, Car,
  FileBarChart, BookOpen, ShoppingCart, ShieldCheck, Settings,
  Menu, Bell, Search, LogOut, User, PanelLeftClose, PanelLeftOpen,
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import { NAV_ITEMS } from '@/lib/constants'
import BrandLogo from '@/components/common/BrandLogo.vue'
import ThemeToggle from '@/components/common/ThemeToggle.vue'
import LangToggle from '@/components/common/LangToggle.vue'
import RoleSwitcher from '@/components/common/RoleSwitcher.vue'
import Dropdown from '@/components/common/Dropdown.vue'
import Avatar from '@/components/common/Avatar.vue'

const ICONS = {
  LayoutDashboard, Users, ClipboardList, Percent, Wallet, Car,
  FileBarChart, BookOpen, ShoppingCart, ShieldCheck, Settings,
}

const { t } = useI18n()
const auth = useAuthStore()
const ui = useUiStore()
const router = useRouter()

const navItems = computed(() => NAV_ITEMS.filter((item) => item.roles.includes(auth.role)))
const collapsed = computed(() => ui.sidebarCollapsed)

function logout() {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <div class="bg-background flex min-h-screen">
    <!-- Sidebar -->
    <aside
      class="bg-sidebar text-sidebar-foreground sticky top-0 hidden h-screen shrink-0 flex-col border-e transition-[width] duration-300 md:flex"
      :class="collapsed ? 'w-[76px]' : 'w-64'"
    >
      <div class="flex h-16 items-center px-4" :class="collapsed ? 'justify-center' : ''">
        <BrandLogo :mark-only="collapsed" tone="light" :mark-size="collapsed ? 34 : 34" />
      </div>

      <nav class="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        <RouterLink
          v-for="item in navItems"
          :key="item.key"
          :to="item.to"
          class="group text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors"
          active-class="!bg-sidebar-primary !text-sidebar-primary-foreground shadow-sm"
          :title="collapsed ? t(`nav.${item.key}`) : ''"
        >
          <component :is="ICONS[item.icon]" class="size-5 shrink-0" />
          <span v-if="!collapsed" class="truncate">{{ t(`nav.${item.key}`) }}</span>
        </RouterLink>
      </nav>

      <div class="border-sidebar-border border-t p-3">
        <button
          type="button"
          class="text-sidebar-foreground/70 hover:bg-sidebar-accent flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors"
          @click="ui.toggleSidebar()"
        >
          <component :is="collapsed ? PanelLeftOpen : PanelLeftClose" class="size-5 shrink-0" />
          <span v-if="!collapsed">{{ t('common.collapse') }}</span>
        </button>
      </div>
    </aside>

    <!-- Main column -->
    <div class="flex min-w-0 flex-1 flex-col">
      <!-- Topbar -->
      <header
        class="glass sticky top-0 z-30 flex h-16 items-center gap-3 border-b px-4 sm:px-6"
      >
        <button
          type="button"
          class="hover:bg-accent inline-flex size-9 items-center justify-center rounded-lg md:hidden"
          @click="ui.toggleSidebar()"
        >
          <Menu class="size-5" />
        </button>

        <!-- Search -->
        <div class="relative hidden max-w-sm flex-1 sm:block">
          <Search class="text-muted-foreground pointer-events-none absolute top-1/2 size-4 -translate-y-1/2 start-3" />
          <input
            type="text"
            :placeholder="t('common.search')"
            class="bg-muted/60 focus:ring-ring/40 h-9 w-full rounded-lg border-0 ps-9 pe-3 text-sm outline-none focus:ring-2"
          />
        </div>

        <div class="ms-auto flex items-center gap-1.5">
          <RoleSwitcher />
          <LangToggle />
          <ThemeToggle />

          <button
            type="button"
            class="hover:bg-accent text-muted-foreground relative inline-flex size-9 items-center justify-center rounded-lg"
            :aria-label="t('common.notifications')"
          >
            <Bell class="size-5" />
            <span class="bg-orange absolute top-2 size-2 rounded-full end-2" />
          </button>

          <!-- User menu -->
          <Dropdown align="end">
            <template #trigger>
              <button type="button" class="hover:bg-accent flex items-center gap-2 rounded-lg p-1 ps-2">
                <span class="hidden text-end sm:block">
                  <span class="block text-sm font-semibold leading-tight">{{ auth.user?.name }}</span>
                  <span class="text-muted-foreground block text-xs">{{ t(`roles.${auth.role}`) }}</span>
                </span>
                <Avatar :initials="auth.initials" />
              </button>
            </template>

            <div class="border-b px-2.5 py-2">
              <p class="text-sm font-semibold">{{ auth.user?.name }}</p>
              <p class="text-muted-foreground text-xs">{{ t(`roles.${auth.role}`) }}</p>
            </div>
            <RouterLink to="/profile" class="hover:bg-accent mt-1 flex items-center gap-2 rounded-md px-2.5 py-2 text-sm">
              <User class="size-4" /> {{ t('common.profile') }}
            </RouterLink>
            <button
              type="button"
              class="hover:bg-accent text-danger flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-sm"
              @click="logout"
            >
              <LogOut class="size-4" /> {{ t('common.logout') }}
            </button>
          </Dropdown>
        </div>
      </header>

      <!-- Page -->
      <main class="flex-1 p-4 sm:p-6 lg:p-8">
        <RouterView />
      </main>
    </div>
  </div>
</template>
