import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
export default defineConfig({
  plugins: [vue()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  build: {
    outDir: 'ddtest-out', emptyOutDir: true, minify: false,
    lib: { entry: 'ddtest.entry.js', formats: ['iife'], name: 'DDTest', fileName: () => 'bundle.js' },
  },
})
