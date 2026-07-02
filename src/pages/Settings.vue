<script setup>
import { reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import PageHeader from '@/components/common/PageHeader.vue'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { useSettingsStore } from '@/stores/settings'
import { useToast } from '@/composables/useToast'

const { t } = useI18n()
const settings = useSettingsStore()
const toast = useToast()

const form = reactive({ companyName: '', walletThreshold: 0, vatRate: 0, notifyWhatsapp: true, notifyLowPerformer: true })

onMounted(() => {
  settings.init()
  Object.assign(form, { ...settings.$state })
})

function save() {
  settings.save({ ...form })
  toast.success(t('settings.saved'))
}
</script>

<template>
  <div>
    <PageHeader :title="t('settings.title')" :subtitle="t('settings.subtitle')" />

    <div class="grid max-w-2xl gap-6">
      <Card>
        <CardHeader><CardTitle>{{ t('settings.title') }}</CardTitle></CardHeader>
        <CardContent class="space-y-4">
          <div class="space-y-1.5">
            <label class="text-sm font-medium">{{ t('settings.company') }}</label>
            <Input v-model="form.companyName" />
          </div>
          <div class="grid gap-4 sm:grid-cols-2">
            <div class="space-y-1.5">
              <label class="text-sm font-medium">{{ t('settings.walletThreshold') }}</label>
              <Input v-model="form.walletThreshold" type="number" dir="ltr" />
            </div>
            <div class="space-y-1.5">
              <label class="text-sm font-medium">{{ t('settings.vatRate') }}</label>
              <Input v-model="form.vatRate" type="number" dir="ltr" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>{{ t('settings.notifications') }}</CardTitle></CardHeader>
        <CardContent class="space-y-3">
          <label class="flex items-center justify-between rounded-lg bg-muted/40 px-4 py-3">
            <span class="text-sm">{{ t('settings.notifyWhatsapp') }}</span>
            <Switch v-model="form.notifyWhatsapp" />
          </label>
          <label class="flex items-center justify-between rounded-lg bg-muted/40 px-4 py-3">
            <span class="text-sm">{{ t('settings.notifyLowPerformer') }}</span>
            <Switch v-model="form.notifyLowPerformer" />
          </label>
        </CardContent>
      </Card>

      <div class="flex justify-end">
        <Button @click="save">{{ t('common.save') }}</Button>
      </div>
    </div>
  </div>
</template>
