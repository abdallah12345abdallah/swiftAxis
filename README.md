# SwiftAxis Logistics — Rider Commission Management

نظام إدارة مناديب الشحن بالعمولة — a modern (2026) Arabic-first, RTL admin dashboard for
**SwiftAxis Logistics** (Jeddah, KSA). Manages delivery riders, contracts, daily orders, a
flexible commission engine, cash wallets, vehicle expenses, a general ledger, and VAT/purchases.

This repository is the **frontend foundation**: design system, app shell, auth/roles, i18n, and
the main dashboard. Data currently comes from a mock API layer (`src/api`) — swap
`src/services/http.js` for the real Spring backend when it is ready.

## Tech stack

- **Vue 3** (`<script setup>`, Composition API) + **Vite**
- **Tailwind CSS v4** + **shadcn-vue** (Reka UI) design system
- **Pinia** (state) · **Vue Router** (routing + role guard)
- **vue-i18n** — Arabic (default, RTL) + English (LTR)
- **ApexCharts** (`vue3-apexcharts`) for charts
- Font: **IBM Plex Sans Arabic**

## Brand

Palette sampled from the SwiftAxis logo: **blue** `#1E6FE0` (primary), **orange** `#F47A20`
(accent), **navy** `#0A1E45` (chrome). Full light/dark theming via CSS tokens in
`src/assets/main.css`. The logo is a scalable SVG in `src/components/common/BrandLogo.vue`.

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build
```

### Demo login

There is no backend yet — the login screen lets you sign in as any of the four roles
(**Manager / Supervisor / Accountant / Rider**). A dev **role switcher** in the topbar changes
the active role live. The dashboard renders a team overview for staff roles and a personal view
for riders. Visit `/dev/ui` for the design-system style guide.

## Roles (US-026)

| Role | Access |
|------|--------|
| Manager | Everything, incl. users, settings, commissions setup |
| Supervisor | Riders, orders, wallets, reports |
| Accountant | Commissions, wallets, vehicles, ledger, purchases/VAT, reports |
| Rider | Own daily orders + personal dashboard only |

## Structure

```
src/
  api/          mock service layer + fixtures
  assets/       main.css — Tailwind v4 theme tokens
  components/   ui/ (primitives) · charts/ · dashboard/ · common/
  composables/  useCurrency (SAR) …
  layouts/      DashboardLayout · AuthLayout
  lib/          utils (cn) · constants (roles, nav, thresholds)
  locales/      ar.json · en.json
  pages/        Login · Dashboard · Placeholder (per-epic) · StyleGuide
  router/       routes + role guard
  stores/       auth · ui (theme/locale/sidebar)
```

## Roadmap

Foundation + main Dashboard (EP-06) are done. Next phases build out the remaining epics
(EP-01…EP-05, EP-07…EP-09) and integrate the real backend.
