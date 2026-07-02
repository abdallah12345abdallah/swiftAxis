<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { User, Lock } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth'
import { ALL_ROLES } from '@/lib/constants'

const { t } = useI18n()
const router = useRouter()
const auth = useAuthStore()

const username = ref('')
const password = ref('')
const selectedRole = ref('manager')

function signIn() {
  auth.loginAs(selectedRole.value)
  router.push('/dashboard')
}
</script>

<template>
  <div>
    <div class="mb-6 text-center">
      <h1 class="text-xl font-bold">{{ t('login.title') }}</h1>
      <p class="text-muted-foreground mt-1 text-sm">{{ t('login.subtitle') }}</p>
    </div>

    <form class="space-y-4" @submit.prevent="signIn">
      <div class="space-y-1.5">
        <label class="text-sm font-medium">{{ t('login.username') }}</label>
        <div class="relative">
          <User class="text-muted-foreground pointer-events-none absolute top-1/2 size-4 -translate-y-1/2 start-3" />
          <input
            v-model="username"
            type="text"
            autocomplete="username"
            class="border-input focus:ring-ring/40 h-10 w-full rounded-lg border bg-transparent ps-9 pe-3 text-sm outline-none focus:ring-2"
            placeholder="admin"
          />
        </div>
      </div>

      <div class="space-y-1.5">
        <label class="text-sm font-medium">{{ t('login.password') }}</label>
        <div class="relative">
          <Lock class="text-muted-foreground pointer-events-none absolute top-1/2 size-4 -translate-y-1/2 start-3" />
          <input
            v-model="password"
            type="password"
            autocomplete="current-password"
            class="border-input focus:ring-ring/40 h-10 w-full rounded-lg border bg-transparent ps-9 pe-3 text-sm outline-none focus:ring-2"
            placeholder="••••••••"
          />
        </div>
      </div>

      <!-- Demo role selection -->
      <div class="space-y-2 pt-1">
        <p class="text-muted-foreground text-xs">{{ t('login.demoHint') }}</p>
        <div class="grid grid-cols-2 gap-2">
          <button
            v-for="r in ALL_ROLES"
            :key="r"
            type="button"
            class="rounded-lg border px-3 py-2 text-sm font-medium transition-colors"
            :class="
              selectedRole === r
                ? 'border-primary bg-primary/10 text-primary'
                : 'hover:bg-accent border-input'
            "
            @click="selectedRole = r"
          >
            {{ t(`roles.${r}`) }}
          </button>
        </div>
      </div>

      <Button type="submit" class="w-full" size="lg">{{ t('login.submit') }}</Button>
    </form>
  </div>
</template>
