<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { Save } from 'lucide-vue-next'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Dropdown } from '@/components/ui/dropdown'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/composables/useToast'
import { useAccountingOptions } from '@/composables/useAccountingOptions'
import { fetchAccountingSettings, saveAccountingSettings, fetchCurrencies } from '@/api/accounting'

const { t } = useI18n()
const toast = useToast()
const opts = useAccountingOptions()
const loading = ref(true)
const saving = ref(false)
const currencies = ref([])
const form = reactive({ baseCurrency: '', decimals: 2, defaultFiscalYear: '', requireCostCenter: true, allowBackdated: true, autoPostModules: true, retainedEarningsAccount: '', inputVatAccount: '', outputVatAccount: '', numbering: {} })

const currencyOptions = computed(() => currencies.value.filter((c) => c.active).map((c) => ({ value: c.code, label: `${c.code} — ${c.name}` })))
const openYearOptions = computed(() => opts.yearOptions.value.filter((y) => !opts.yearById(y.value)?.closed))
const decimalsOptions = [0, 2, 3].map((n) => ({ value: n, label: String(n) }))

onMounted(async () => {
  const [s, c] = await Promise.all([fetchAccountingSettings(), fetchCurrencies(), opts.load()])
  Object.assign(form, s, { numbering: { ...s.numbering } })
  currencies.value = c
  loading.value = false
})

async function save() {
  if (saving.value) return
  saving.value = true
  try {
    await saveAccountingSettings({ ...form, numbering: { ...form.numbering } })
    toast.success(t('accounting.settings.saved'))
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div v-if="loading" class="space-y-4"><Skeleton class="h-48 rounded-2xl" /><Skeleton class="h-48 rounded-2xl" /></div>
  <div v-else class="space-y-5">
    <Card>
      <CardHeader><CardTitle>{{ t('accounting.settings.general') }}</CardTitle></CardHeader>
      <CardContent class="grid gap-4 sm:grid-cols-3">
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('accounting.settings.baseCurrency') }}</label>
          <Dropdown v-model="form.baseCurrency" :options="currencyOptions" />
        </div>
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('accounting.settings.decimals') }}</label>
          <Dropdown v-model="form.decimals" :options="decimalsOptions" />
        </div>
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('accounting.settings.defaultYear') }}</label>
          <Dropdown v-model="form.defaultFiscalYear" :options="openYearOptions" />
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader><CardTitle>{{ t('accounting.settings.rules') }}</CardTitle></CardHeader>
      <CardContent class="space-y-3">
        <label class="bg-muted/40 flex items-center justify-between rounded-lg px-4 py-3"><span class="text-sm">{{ t('accounting.settings.requireCostCenter') }}</span><Switch v-model="form.requireCostCenter" /></label>
        <label class="bg-muted/40 flex items-center justify-between rounded-lg px-4 py-3"><span class="text-sm">{{ t('accounting.settings.allowBackdated') }}</span><Switch v-model="form.allowBackdated" /></label>
        <label class="bg-muted/40 flex items-center justify-between rounded-lg px-4 py-3"><span class="text-sm">{{ t('accounting.settings.autoPost') }}</span><Switch v-model="form.autoPostModules" /></label>
      </CardContent>
    </Card>

    <Card>
      <CardHeader><CardTitle>{{ t('accounting.settings.accounts') }}</CardTitle></CardHeader>
      <CardContent class="grid gap-4 sm:grid-cols-3">
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('accounting.settings.retained') }}</label>
          <Dropdown v-model="form.retainedEarningsAccount" :options="opts.leafAccountOptions.value" searchable />
        </div>
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('accounting.settings.inputVat') }}</label>
          <Dropdown v-model="form.inputVatAccount" :options="opts.leafAccountOptions.value" searchable />
        </div>
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('accounting.settings.outputVat') }}</label>
          <Dropdown v-model="form.outputVatAccount" :options="opts.leafAccountOptions.value" searchable />
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>{{ t('accounting.settings.numbering') }}</CardTitle>
        <p class="text-muted-foreground text-xs">{{ t('accounting.settings.numberingHint') }}</p>
      </CardHeader>
      <CardContent class="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <div v-for="d in opts.docTypes.value" :key="d.id" class="space-y-1.5">
          <label class="text-sm font-medium">{{ opts.name(d) }}</label>
          <Input v-model="form.numbering[d.id]" dir="ltr" class="uppercase" maxlength="4" />
        </div>
      </CardContent>
    </Card>

    <div class="flex justify-end">
      <Button :disabled="saving" @click="save"><Save /> {{ t('common.save') }}</Button>
    </div>
  </div>
</template>
