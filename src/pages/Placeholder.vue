<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { Construction } from 'lucide-vue-next'
import PageHeader from '@/components/common/PageHeader.vue'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const { t } = useI18n()
const route = useRoute()

const title = computed(() => t(route.meta.titleKey ?? 'nav.dashboard'))
</script>

<template>
  <div>
    <PageHeader :title="title" />
    <Card class="grid place-items-center py-20 text-center">
      <div class="max-w-md space-y-4">
        <div class="bg-primary/10 text-primary mx-auto flex size-16 items-center justify-center rounded-2xl">
          <Construction class="size-8" />
        </div>
        <Badge variant="accent">{{ t('placeholder.comingSoon') }}</Badge>
        <p class="text-muted-foreground">{{ t('placeholder.description', { title }) }}</p>
      </div>
    </Card>
  </div>
</template>
