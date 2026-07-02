<script setup>
import { useI18n } from 'vue-i18n'
import { ChevronDown, UserCog, Check } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { ALL_ROLES } from '@/lib/constants'
import Dropdown from './Dropdown.vue'

const { t } = useI18n()
const auth = useAuthStore()
</script>

<template>
  <Dropdown align="end">
    <template #trigger>
      <button
        type="button"
        class="border-orange/40 bg-orange/10 text-orange hover:bg-orange/15 inline-flex h-9 items-center gap-1.5 rounded-lg border border-dashed px-2.5 text-xs font-semibold transition-colors"
        title="Dev role switcher"
      >
        <UserCog class="size-4" />
        <span class="hidden sm:inline">{{ t(`roles.${auth.role}`) }}</span>
        <ChevronDown class="size-3.5" />
      </button>
    </template>

    <button
      v-for="r in ALL_ROLES"
      :key="r"
      type="button"
      class="hover:bg-accent flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-2 text-sm"
      @click="auth.switchRole(r)"
    >
      <span>{{ t(`roles.${r}`) }}</span>
      <Check v-if="auth.role === r" class="text-primary size-4" />
    </button>
  </Dropdown>
</template>
