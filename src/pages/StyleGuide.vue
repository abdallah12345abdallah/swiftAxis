<script setup>
import { useI18n } from 'vue-i18n'
import PageHeader from '@/components/common/PageHeader.vue'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import BrandLogo from '@/components/common/BrandLogo.vue'

const { t } = useI18n()

const swatches = [
  { name: 'primary', class: 'bg-primary text-primary-foreground' },
  { name: 'orange', class: 'bg-orange text-orange-foreground' },
  { name: 'navy', class: 'bg-navy text-navy-foreground' },
  { name: 'success', class: 'bg-success text-success-foreground' },
  { name: 'warning', class: 'bg-warning text-warning-foreground' },
  { name: 'danger', class: 'bg-danger text-danger-foreground' },
  { name: 'muted', class: 'bg-muted text-muted-foreground' },
  { name: 'card', class: 'bg-card text-card-foreground border' },
]
const buttonVariants = ['default', 'accent', 'secondary', 'outline', 'ghost', 'destructive', 'link']
const badgeVariants = ['default', 'accent', 'secondary', 'success', 'warning', 'danger', 'outline']
</script>

<template>
  <div>
    <PageHeader :title="t('styleguide.title')" subtitle="SwiftAxis Logistics — Design System" />

    <div class="space-y-6">
      <Card>
        <CardHeader><CardTitle>Brand</CardTitle></CardHeader>
        <CardContent class="flex flex-wrap items-center gap-8">
          <BrandLogo :mark-size="44" />
          <div class="bg-navy rounded-xl p-4"><BrandLogo tone="light" :mark-size="44" /></div>
          <BrandLogo mark-only :mark-size="44" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>{{ t('styleguide.colors') }}</CardTitle></CardHeader>
        <CardContent>
          <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div
              v-for="s in swatches"
              :key="s.name"
              :class="s.class"
              class="flex h-20 items-end rounded-xl p-3 text-sm font-medium capitalize shadow-sm"
            >
              {{ s.name }}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>{{ t('styleguide.buttons') }}</CardTitle></CardHeader>
        <CardContent class="flex flex-wrap gap-3">
          <Button v-for="v in buttonVariants" :key="v" :variant="v">{{ v }}</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>{{ t('styleguide.badges') }}</CardTitle></CardHeader>
        <CardContent class="flex flex-wrap gap-3">
          <Badge v-for="v in badgeVariants" :key="v" :variant="v">{{ v }}</Badge>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Progress</CardTitle></CardHeader>
        <CardContent class="max-w-md space-y-4">
          <Progress :value="35" indicator-class="bg-danger" />
          <Progress :value="68" indicator-class="bg-primary" />
          <Progress :value="100" indicator-class="bg-success" />
        </CardContent>
      </Card>
    </div>
  </div>
</template>
