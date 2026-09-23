/* The general-accounts area (EP-12) mirrors the partner's accounting menu:
   two sections (settings, reports), each with collapsible groups of screens.
   Labels come from i18n: accounting.sections.<key>, accounting.groups.<key>,
   accounting.screens.<key>. `component` names a file in
   src/components/accounting/. `to` links to an existing route instead. */

export const ACCOUNTING_MENU = [
  {
    key: 'settings',
    groups: [
      { key: 'setup', screens: [
        { key: 'systemSettings', component: 'SystemSettings' },
        { key: 'currencies', component: 'Currencies' },
        { key: 'fiscalYears', component: 'FiscalYears' },
        { key: 'monthClose', component: 'MonthClose' },
        { key: 'yearClose', component: 'YearClose' },
      ] },
      { key: 'masterData', screens: [
        { key: 'adminUnits', component: 'AdminUnits' },
        { key: 'costCenters', component: 'CostCenters' },
        { key: 'accountsTree', component: 'AccountsTree' },
      ] },
      { key: 'transactions', screens: [
        { key: 'journalEntry', to: '/ledger/entry' },
        { key: 'journalList', to: '/ledger' },
      ] },
      { key: 'statementItems', screens: [
        { key: 'itemsDirectory', component: 'ItemsDirectory' },
        { key: 'itemsAssignment', component: 'ItemsAssignment' },
      ] },
    ],
  },
  {
    key: 'reports',
    groups: [
      { key: 'masterReports', screens: [
        { key: 'costCentersReport', component: 'CostCentersReport' },
        { key: 'adminUnitsReport', component: 'AdminUnitsReport' },
        { key: 'accountsReport', component: 'AccountsReport' },
        { key: 'itemsReport', component: 'ItemsReport' },
      ] },
      { key: 'journalReports', screens: [
        { key: 'journalDetailed', component: 'JournalDetailed' },
        { key: 'journalChanged', component: 'JournalChanged' },
      ] },
      { key: 'statementReports', screens: [
        { key: 'subAccountStatement', component: 'SubAccountStatement' },
        { key: 'monthlyStatement', component: 'MonthlyStatement' },
        { key: 'monthlySummary', component: 'MonthlySummary' },
        { key: 'mainAccountStatement', component: 'MainAccountStatement' },
        { key: 'costCenterBalances', component: 'CostCenterBalances' },
        { key: 'unitBalances', component: 'UnitBalances' },
        { key: 'extendedStatement', component: 'ExtendedStatement' },
      ] },
      { key: 'trialReports', screens: [{ key: 'trialByLevel', component: 'TrialByLevel' }] },
      { key: 'finalReports', screens: [
        { key: 'incomeStatement', component: 'IncomeStatement' },
        { key: 'incomeByItems', component: 'IncomeByItems' },
        { key: 'balanceSheet', component: 'BalanceSheet' },
        { key: 'balanceSheetByItems', component: 'BalanceSheetByItems' },
      ] },
      { key: 'analysisReports', screens: [{ key: 'analysisSettings', component: 'AnalysisSettings' }] },
    ],
  },
]

export const ALL_SCREENS = ACCOUNTING_MENU.flatMap((s) => s.groups.flatMap((g) => g.screens.map((x) => ({ ...x, section: s.key, group: g.key }))))
export const DEFAULT_SCREEN = 'accountsTree'
