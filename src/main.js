import { createApp } from 'vue'
import { createPinia } from 'pinia'
import VueApexCharts from 'vue3-apexcharts'

import '@fontsource/cairo/400.css'
import '@fontsource/cairo/500.css'
import '@fontsource/cairo/600.css'
import '@fontsource/cairo/700.css'
import '@fontsource/cairo/800.css'
import './assets/main.css'

import App from './App.vue'
import { router } from './router'
import { i18n } from './i18n'
import { useUiStore } from './stores/ui'
import { useAuthStore } from './stores/auth'
import { vCardLabels } from './lib/cardLabels'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(i18n)
app.use(VueApexCharts)
// hand-written tables name their cells from their own header row, for the
// card layout phones get (see src/lib/cardLabels.js)
app.directive('card-labels', vCardLabels)

// Restore persisted theme / locale / session before the first render.
useUiStore().init()
useAuthStore().init()

app.use(router)
app.mount('#app')
