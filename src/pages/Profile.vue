<script setup>
import { reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import PageHeader from '@/components/common/PageHeader.vue'
import Avatar from '@/components/common/Avatar.vue'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'

const { t } = useI18n()
const auth = useAuthStore()
const toast = useToast()

const form = reactive({ name: auth.user?.name ?? '', mobile: '05xxxxxxxx' })

function save() {
  toast.success(t('profile.saved'))
}
</script>

<template>
  <div>
    <PageHeader :title="t('profile.title')" :subtitle="t('profile.subtitle')" />

    <Card class="max-w-xl">
      <CardContent class="space-y-5 pt-5">
        <div class="flex items-center gap-4">
          <Avatar :initials="auth.initials" class="size-16 text-xl" />
          <div>
            <p class="text-lg font-bold">{{ auth.user?.name }}</p>
            <Badge class="mt-1">{{ t(`roles.${auth.role}`) }}</Badge>
          </div>
        </div>

        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('profile.name') }}</label>
          <Input v-model="form.name" />
        </div>
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('profile.mobile') }}</label>
          <Input v-model="form.mobile" dir="ltr" inputmode="tel" />
        </div>

        <div class="flex justify-end">
          <Button @click="save">{{ t('common.save') }}</Button>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
