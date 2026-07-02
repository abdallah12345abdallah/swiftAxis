# SwiftAxis — Frontend (Vue 3)

Delivery Rider Commission Management System for SwiftAxis Logistics (Jeddah). Arabic-first, RTL.

## Tech Stack
- Vue 3 + Composition API (`<script setup>`), JavaScript (not TS)
- Vite (build) · Tailwind CSS v4 (CSS-first `@theme` in `src/assets/main.css`)
- shadcn-vue / Reka UI primitives (`src/components/ui`)
- Pinia · Vue Router · vue-i18n (ar default + en)
- ApexCharts via vue3-apexcharts

## Conventions
- `<script setup>` only, never Options API
- Components PascalCase; composables `useX`
- All copy through i18n — no hardcoded strings (keys in `src/locales/*.json`)
- RTL-first: use Tailwind **logical** utilities (`ps-/pe-/ms-/me-/start-/end-`), never `pl-/pr-`
- Colors via tokens only (`bg-primary`, `bg-orange`, `text-muted-foreground`, …) — never hex in components
- `cn()` from `@/lib/utils` to compose classes
- `@` alias → `src`

## Design tokens
Defined in `src/assets/main.css`. Brand: primary blue, `orange` accent, `navy` chrome.
Light + dark via `.dark` on `<html>`. Radius `--radius: 0.9rem` (rounded-2xl cards).

## Data
No backend yet. Mock layer in `src/api` (fixtures + async fns with `mockDelay`). To integrate
the real Spring API, implement Axios in `src/services/http.js` and replace the `src/api/*` fns.

## Roles & routing
Roles + nav + access matrix in `src/lib/constants.js` (single source). Router guard in
`src/router/index.js` gates routes by `meta.roles`. Auth is mocked in `src/stores/auth.js`.

## Commands
- `npm run dev` · `npm run build`
