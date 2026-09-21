// TEMPORARY harness — exercises the DatePicker in single + range mode.
import { createApp, h, ref } from 'vue'
import { i18n } from '@/i18n'
import Dialog from '@/components/ui/dialog/Dialog.vue'
import DatePicker from '@/components/ui/datepicker/DatePicker.vue'

const single = ref('2026-07-01')
const range = ref(['', ''])
const dialogOpen = ref(true)
window.__single = single
window.__range = range
window.__dialogOpen = dialogOpen
window.__dialogClosed = false

const App = {
  setup() {
    return () => [
      h(DatePicker, {
        modelValue: range.value,
        range: true,
        'onUpdate:modelValue': (v) => (range.value = v),
      }),
      h(
        Dialog,
        {
          open: dialogOpen.value,
          title: 'قيد يومية',
          'onUpdate:open': (v) => {
            dialogOpen.value = v
            if (!v) window.__dialogClosed = true
          },
        },
        {
          default: () =>
            h(DatePicker, {
              modelValue: single.value,
              max: '2026-07-15',
              'onUpdate:modelValue': (v) => (single.value = v),
            }),
        },
      ),
    ]
  },
}

const app = createApp(App)
app.use(i18n)
app.mount('#app')
window.__mounted = true
