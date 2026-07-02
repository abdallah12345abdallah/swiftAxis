<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { UploadCloud, FileText, X } from 'lucide-vue-next'

const props = defineProps({
  modelValue: { type: Object, default: null }, // { name, url, isImage }
  accept: { type: String, default: 'image/*,application/pdf' },
  hint: { type: String, default: '' },
})
const emit = defineEmits(['update:modelValue'])

const { t } = useI18n()
const inputEl = ref(null)
const dragging = ref(false)

const file = computed(() => props.modelValue)

function handle(files) {
  const f = files?.[0]
  if (!f) return
  const url = URL.createObjectURL(f)
  emit('update:modelValue', { name: f.name, url, isImage: f.type.startsWith('image/') })
}
function onDrop(e) {
  dragging.value = false
  handle(e.dataTransfer.files)
}
function clear() {
  emit('update:modelValue', null)
}
</script>

<template>
  <div>
    <div
      v-if="!file"
      class="hover:border-primary/50 hover:bg-accent/40 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-6 text-center transition-colors"
      :class="dragging ? 'border-primary bg-primary/5' : 'border-input'"
      @click="inputEl.click()"
      @dragover.prevent="dragging = true"
      @dragleave.prevent="dragging = false"
      @drop.prevent="onDrop"
    >
      <UploadCloud class="text-muted-foreground size-6" />
      <p class="text-muted-foreground text-sm">{{ hint || t('common.upload') }}</p>
      <input ref="inputEl" type="file" :accept="accept" class="hidden" @change="handle($event.target.files)" />
    </div>

    <div v-else class="flex items-center gap-3 rounded-xl border p-2.5">
      <img v-if="file.isImage" :src="file.url" class="size-11 rounded-lg object-cover" alt="" />
      <span v-else class="bg-muted grid size-11 shrink-0 place-items-center rounded-lg"><FileText class="size-5" /></span>
      <span class="min-w-0 flex-1 truncate text-sm">{{ file.name }}</span>
      <button type="button" class="hover:bg-accent text-muted-foreground rounded-md p-1.5" @click="clear">
        <X class="size-4" />
      </button>
    </div>
  </div>
</template>
