<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { DialogTitle, DialogDescription } from 'reka-ui'
import { AlertTriangle, AlertCircle, CircleHelp, CheckCircle2, Loader2 } from 'lucide-vue-next'
import { Dialog } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { confirmState as s, acceptConfirm, dismissConfirm } from '@/composables/useConfirm'

/* The single confirmation dialog (see useConfirm). A tinted badge with the
   action's icon pulses above the question; the confirm button carries the
   tone (red for destructive, orange for important, green for approvals). */
const { t } = useI18n()

const DEFAULT_ICON = { danger: AlertTriangle, warning: AlertCircle, primary: CircleHelp, success: CheckCircle2 }
const tone = computed(() => s.opts.tone ?? 'danger')
const icon = computed(() => s.opts.icon ?? DEFAULT_ICON[tone.value] ?? AlertTriangle)
const BUTTON = {
  danger: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  warning: 'bg-primary text-primary-foreground hover:bg-primary/90',
  primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
  success: 'bg-success text-success-foreground hover:bg-success/90',
}

function onOpen(v) {
  if (!v) dismissConfirm()
}
</script>

<template>
  <Dialog :open="s.open" size="sm" :morph="false" @update:open="onOpen">
    <template #header>
      <div class="confirm-head flex flex-col items-center pt-2 text-center" :data-tone="tone">
        <span class="confirm-badge relative grid size-16 place-items-center rounded-2xl">
          <span class="confirm-ring" aria-hidden="true" />
          <span class="confirm-ring r2" aria-hidden="true" />
          <component :is="icon" class="confirm-icon relative size-7" :stroke-width="2" />
        </span>
        <DialogTitle class="mt-4 text-lg leading-tight font-bold tracking-tight">{{ s.opts.title }}</DialogTitle>
        <DialogDescription v-if="s.opts.message" class="text-muted-foreground mt-2 max-w-[34ch] text-[13.5px] leading-relaxed">
          {{ s.opts.message }}
        </DialogDescription>
      </div>
    </template>

    <div class="space-y-3">
      <p v-if="s.opts.subject" class="flex justify-center">
        <span class="bg-muted text-foreground max-w-full truncate rounded-full px-3.5 py-1 text-sm font-semibold">{{ s.opts.subject }}</span>
      </p>

      <dl v-if="s.opts.details?.length" class="bg-muted/50 divide-border/70 divide-y rounded-xl px-4">
        <div v-for="d in s.opts.details" :key="d.label" class="flex items-center justify-between gap-4 py-2.5 text-sm">
          <dt class="text-muted-foreground">{{ d.label }}</dt>
          <dd class="font-bold tabular-nums">{{ d.value }}</dd>
        </div>
      </dl>

      <div v-if="s.opts.input" class="space-y-1.5">
        <label class="text-sm font-medium">{{ s.opts.input.label }}</label>
        <Input
          v-model="s.value"
          :placeholder="s.opts.input.placeholder ?? ''"
          :class="s.missing && 'border-danger'"
          @keydown.enter.prevent="acceptConfirm"
        />
        <p v-if="s.missing" class="text-danger text-xs">{{ t('common.required') }}</p>
      </div>

      <p v-if="s.failed" class="text-danger bg-danger/10 rounded-lg px-3 py-2 text-center text-xs">{{ t('confirm.failed') }}</p>
    </div>

    <template #footer>
      <Button variant="outline" class="sm:!flex-1" :disabled="s.busy" @click="dismissConfirm">{{ s.opts.cancelText ?? t('common.cancel') }}</Button>
      <Button class="sm:!flex-1" :class="BUTTON[tone]" :disabled="s.busy" @click="acceptConfirm">
        <Loader2 v-if="s.busy" class="animate-spin" />
        <component :is="icon" v-else />
        {{ s.opts.confirmText ?? t('common.confirm') }}
      </Button>
    </template>
  </Dialog>
</template>

<style scoped>
.confirm-head { --tone: var(--destructive); width: 100%; }
.confirm-head[data-tone='warning'] { --tone: var(--primary); }
.confirm-head[data-tone='primary'] { --tone: var(--primary); }
.confirm-head[data-tone='success'] { --tone: var(--success); }

.confirm-badge {
  color: var(--tone);
  background: color-mix(in srgb, var(--tone) 13%, var(--card));
  animation: badge-in 0.5s cubic-bezier(0.2, 0.9, 0.3, 1.3) both;
}
/* two soft rings breathe out from the badge */
.confirm-ring {
  position: absolute; inset: 0; border-radius: inherit;
  border: 2px solid color-mix(in srgb, var(--tone) 35%, transparent);
  animation: ring 2.4s ease-out infinite;
}
.confirm-ring.r2 { animation-delay: 1.2s; }
/* the icon gives a short shake when the dialog opens */
.confirm-icon { animation: nudge 0.6s 0.25s ease-in-out both; }
.confirm-head[data-tone='success'] .confirm-icon,
.confirm-head[data-tone='primary'] .confirm-icon { animation: pop 0.5s 0.2s cubic-bezier(0.2, 0.9, 0.3, 1.4) both; }

@keyframes badge-in { from { opacity: 0; transform: scale(0.6) rotate(-8deg); } }
@keyframes ring { from { transform: scale(1); opacity: 0.9; } to { transform: scale(1.6); opacity: 0; } }
@keyframes nudge { 0%, 100% { rotate: 0deg; } 20% { rotate: -12deg; } 40% { rotate: 10deg; } 60% { rotate: -6deg; } 80% { rotate: 3deg; } }
@keyframes pop { from { transform: scale(0.4); opacity: 0; } }
@media (prefers-reduced-motion: reduce) {
  .confirm-badge, .confirm-ring, .confirm-icon { animation: none !important; }
  .confirm-ring { display: none; }
}
</style>
