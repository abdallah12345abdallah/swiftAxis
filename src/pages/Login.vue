<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import {
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  ShieldCheck,
  UserCog,
  Calculator,
  Bike,
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth'
import { ALL_ROLES } from '@/lib/constants'

const { t } = useI18n()
const router = useRouter()
const auth = useAuthStore()

const username = ref('admin')
const password = ref('')
const selectedRole = ref('manager')
const showPassword = ref(false)
const remember = ref(true)
const loading = ref(false)

const ROLE_ICONS = {
  manager: ShieldCheck,
  supervisor: UserCog,
  accountant: Calculator,
  rider: Bike,
}

async function signIn() {
  if (loading.value) return
  loading.value = true
  // brief delay to convey progress; real auth wires in here later
  await new Promise((r) => setTimeout(r, 550))
  auth.loginAs(selectedRole.value)
  router.push('/dashboard')
}
</script>

<template>
  <div class="stagger">
    <div class="fld mb-8">
      <h1 class="text-3xl font-extrabold tracking-tight">{{ t('login.title') }}</h1>
      <p class="text-muted-foreground mt-2 text-sm">{{ t('login.subtitle') }}</p>
    </div>

    <form class="space-y-5" @submit.prevent="signIn">
      <!-- Username -->
      <div class="fld space-y-2">
        <label for="username" class="text-sm font-semibold">{{ t('login.username') }}</label>
        <div class="group relative">
          <User
            class="text-muted-foreground group-focus-within:text-primary pointer-events-none absolute top-1/2 size-[18px] -translate-y-1/2 transition-colors start-3.5"
          />
          <input
            id="username"
            v-model="username"
            type="text"
            autocomplete="username"
            class="input-modern"
            placeholder="admin"
          />
        </div>
      </div>

      <!-- Password -->
      <div class="fld space-y-2">
        <div class="flex items-center justify-between">
          <label for="password" class="text-sm font-semibold">{{ t('login.password') }}</label>
          <a href="#" class="text-primary text-xs font-semibold hover:underline" @click.prevent>
            {{ t('login.forgot') }}
          </a>
        </div>
        <div class="group relative">
          <Lock
            class="text-muted-foreground group-focus-within:text-primary pointer-events-none absolute top-1/2 size-[18px] -translate-y-1/2 transition-colors start-3.5"
          />
          <input
            id="password"
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="current-password"
            class="input-modern !pe-11"
            placeholder="••••••••"
          />
          <button
            type="button"
            :aria-label="showPassword ? t('login.hidePassword') : t('login.showPassword')"
            class="text-muted-foreground hover:text-foreground hover:bg-accent absolute top-1/2 -translate-y-1/2 rounded-md p-1.5 transition-colors end-2"
            @click="showPassword = !showPassword"
          >
            <EyeOff v-if="showPassword" class="size-[18px]" />
            <Eye v-else class="size-[18px]" />
          </button>
        </div>
      </div>

      <!-- Remember me -->
      <label class="fld flex w-fit cursor-pointer items-center gap-2 text-sm">
        <input
          v-model="remember"
          type="checkbox"
          class="border-input accent-primary focus:ring-primary/30 size-4 rounded"
        />
        <span class="text-muted-foreground">{{ t('login.remember') }}</span>
      </label>

      <!-- Role picker (demo) -->
      <div class="fld space-y-2.5 pt-1">
        <p class="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
          {{ t('login.demoHint') }}
        </p>
        <div class="grid grid-cols-2 gap-2.5">
          <button
            v-for="r in ALL_ROLES"
            :key="r"
            type="button"
            class="group relative flex items-center gap-2.5 overflow-hidden rounded-lg border px-3 py-2.5 text-start text-sm font-medium transition-all duration-200"
            :class="
              selectedRole === r
                ? 'border-primary bg-primary/10 text-primary shadow-sm ring-1 ring-primary/30'
                : 'border-input hover:border-primary/40 hover:bg-accent hover:-translate-y-px'
            "
            @click="selectedRole = r"
          >
            <component
              :is="ROLE_ICONS[r]"
              class="size-4 shrink-0 transition-colors"
              :class="selectedRole === r ? 'text-primary' : 'text-muted-foreground'"
            />
            <span class="truncate">{{ t(`roles.${r}`) }}</span>
          </button>
        </div>
      </div>

      <Button
        type="submit"
        size="lg"
        class="fld group mt-2 h-12 w-full gap-2 text-[15px] shadow-lg shadow-primary/25 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/30 active:translate-y-0"
        :disabled="loading"
      >
        <Loader2 v-if="loading" class="size-4 animate-spin" />
        <template v-else>
          {{ t('login.submit') }}
          <ArrowRight
            class="size-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5"
          />
        </template>
        <span v-if="loading">{{ t('login.signingIn') }}</span>
      </Button>
    </form>
  </div>
</template>

<style scoped>
/* Modern filled input */
.input-modern {
  height: 3rem;
  width: 100%;
  border-radius: var(--radius-md);
  border: 1px solid transparent;
  background-color: var(--muted);
  padding-inline-start: 2.75rem;
  padding-inline-end: 1rem;
  font-size: 0.875rem;
  outline: none;
  transition: all 0.2s ease;
}
.input-modern::placeholder {
  color: color-mix(in oklch, var(--muted-foreground) 60%, transparent);
}
.input-modern:hover {
  background-color: color-mix(in oklch, var(--muted) 92%, var(--foreground));
}
.input-modern:focus {
  border-color: var(--primary);
  background-color: var(--background);
  box-shadow: 0 0 0 4px color-mix(in oklch, var(--primary) 15%, transparent);
}

/* Staggered entrance */
.fld {
  opacity: 0;
  animation: rise 0.55s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}
.fld:nth-child(1) { animation-delay: 0.05s; }
.fld:nth-child(2) { animation-delay: 0.12s; }
.stagger form .fld:nth-child(1) { animation-delay: 0.12s; }
.stagger form .fld:nth-child(2) { animation-delay: 0.19s; }
.stagger form .fld:nth-child(3) { animation-delay: 0.26s; }
.stagger form .fld:nth-child(4) { animation-delay: 0.33s; }
.stagger form .fld:nth-child(5) { animation-delay: 0.4s; }
@keyframes rise {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (prefers-reduced-motion: reduce) {
  .fld { animation: none; opacity: 1; }
}
</style>
