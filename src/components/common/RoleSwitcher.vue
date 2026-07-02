<script setup>
import { useI18n } from 'vue-i18n'
import { ChevronDown, UserCog, Check, ShieldCheck, Calculator, Bike } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { ALL_ROLES, ROLES } from '@/lib/constants'
import { cn } from '@/lib/utils'
import Dropdown from './Dropdown.vue'

const { t } = useI18n()
const auth = useAuthStore()

const ROLE_ICONS = {
  [ROLES.MANAGER]: ShieldCheck,
  [ROLES.SUPERVISOR]: UserCog,
  [ROLES.ACCOUNTANT]: Calculator,
  [ROLES.RIDER]: Bike,
}
</script>

<template>
  <Dropdown align="end" content-class="w-60">
    <template #trigger="{ open }">
      <button
        type="button"
        class="border-orange/40 bg-orange/10 text-orange hover:bg-orange/15 inline-flex h-9 items-center gap-1.5 rounded-lg border border-dashed px-2.5 text-xs font-semibold transition-colors"
        title="Dev role switcher"
      >
        <UserCog class="size-4" />
        <span class="hidden sm:inline">{{ t(`roles.${auth.role}`) }}</span>
        <ChevronDown class="size-3.5 transition-transform duration-200" :class="open && 'rotate-180'" />
      </button>
    </template>

    <p class="text-muted-foreground px-2.5 pt-1 pb-1.5 text-[11px] font-semibold tracking-wide uppercase">
      {{ t('common.switchRole') }}
    </p>

    <button
      v-for="r in ALL_ROLES"
      :key="r"
      type="button"
      :class="
        cn(
          'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors',
          auth.role === r ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-accent',
        )
      "
      @click="auth.switchRole(r)"
    >
      <component
        :is="ROLE_ICONS[r]"
        class="size-4 shrink-0"
        :class="auth.role === r ? 'text-primary' : 'text-muted-foreground'"
      />
      <span class="flex-1 text-start">{{ t(`roles.${r}`) }}</span>
      <Check v-if="auth.role === r" class="text-primary size-4 shrink-0" />
    </button>
  </Dropdown>
</template>
