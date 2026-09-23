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

The app shell is a "glass island": a brand-gradient ground, a floating glass sidebar that keeps every link visible (grouped by domain, drawer on phones), and the page as a floating sheet (`src/layouts/DashboardLayout.vue`, groups in `NAV_GROUPS`, counts from `src/api/nav.js`). The active module's sub-screens unfold inside the island (`src/lib/subScreens.js`; tabbed pages sync their tab to `?tab=` via `useRouteTab`).

There is no backend yet — the login screen lets you sign in as any of the five roles
(**Manager / Supervisor / Accountant / Warehouse keeper / Rider**). A dev **role switcher** inside the account menu at the foot of the sidebar changes
the active role live. The dashboard renders a team overview for staff roles and a personal view
for riders. Visit `/dev/ui` for the design-system style guide.

## Roles (US-026)

| Role | Access |
|------|--------|
| Manager | Everything, incl. users, settings, commissions setup |
| Supervisor | Riders, orders (incl. manual orders), wallets, reports |
| Accountant | Commissions, wallets (deposit approval, withdrawals, debts), treasury & banks, sales invoices, vehicles, ledger, purchases/VAT, reports |
| Warehouse keeper | Vehicles (handover, fuel sheet, expense items), treasury payment vouchers, purchases. A supervisor account can be converted to this role from the Users screen |
| Rider | Own daily orders + personal dashboard only |

## Modules

| Module | Route | Highlights |
|--------|-------|------------|
| Riders | `/riders` | Profile photo, rider code (R-001) shown on every screen, side panel from the dashboard / reports |
| Daily orders | `/orders` | Daily logs, Hunger Station import, **manual single-order entry** (order no, time, km, price, collected) |
| Cash wallets | `/wallets` | Handover with mandatory receipt → **accountant approval** with dated note; withdrawals (auto payment voucher); debts & debit/credit notices |
| Treasury & banks | `/treasury` | Cash boxes / bank accounts, receipt & payment vouchers, transfers, statements, rider ↔ custody-box links |
| Vehicles | `/vehicles` | Chassis/colour/model/year/tank, handover between riders or the company per work shift, editable shifts, fuel sheet, expense-item catalog, per-vehicle cost centers & charts |
| Purchases & VAT | `/purchases` | Suppliers, purchase-item catalog, vehicle → cost center, supplier tax no. on the invoice, input VAT |
| Sales invoices | `/sales` | Register a partner sheet as an invoice; VAT added automatically; output VAT report |
| Ledger | `/ledger` | Journal (with voided entries), trial balance, P&L, cost centers — every module above posts balanced entries here |
| Journal entry | `/ledger/entry` | Full general-journal screen (document type & number, fiscal year, serial, line entry with debit/credit exclusivity and Enter flow, inline-editable lines, save / print / show / new / duplicate / refresh) |
| General accounts | `/accounting` | Sidebar tree mirroring the partner's accounting menu: settings (system settings, currencies, fiscal years, month close, annual closing, admin units, cost centers, chart-of-accounts tree, statement items + allocation) and reports (master data, detailed / changed journal, 7 account statements, trial balance by level, income statement & balance sheet by account or by item, financial ratios). All computed from the same journal every module posts into |

**Tables** use one shared "soft well" look (`.soft-table` in `src/assets/main.css`, `src/components/ui/table/DataTable.vue`): rounded rows on a tinted well, an optional `#expand` slot for detail rows, and a numbered pager. Row actions always go through `src/components/common/ActionMenu.vue` (a ⋮ dropdown), never inline buttons.

## Structure

```
src/
  api/          mock service layer + fixtures
  assets/       main.css — Tailwind v4 theme tokens
  components/   ui/ (primitives) · charts/ · dashboard/ · common/ · riders/ · orders/ · wallets/
                treasury/ · vehicles/ · purchases/ · sales/ · ledger/ · users/
  composables/  useCurrency (SAR) …
  layouts/      DashboardLayout · AuthLayout
  lib/          utils (cn) · constants (roles, nav, thresholds)
  locales/      ar.json · en.json
  pages/        Dashboard · Riders · Orders · Wallets · Treasury · Vehicles · Purchases · Sales
                Commissions · Ledger · Reports · Users · Settings · StyleGuide
  router/       routes + role guard
  stores/       auth · ui (theme/locale/sidebar)
```

## Roadmap

All epics (EP-01…EP-11) are built on the mock layer, including the partner change requests
(treasury, deposit approval, manual orders, vehicle handover, sales invoices, warehouse-keeper role).
Contracts changes are on hold until a real contract is reviewed. Next: integrate the Spring backend.
