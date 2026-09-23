/* Seed data for the demo. Realistic enough to exercise every dashboard widget:
   goals, under-performers (< 70%), and wallets over the 700-SAR limit. */

export const CONTRACTS = {
  hunger: { ar: 'هانجر استيشن — جدة', en: 'Hunger Station — Jeddah' },
  internal: { ar: 'عقود داخلية', en: 'Internal contracts' },
  jahez: { ar: 'جاهز — جدة', en: 'Jahez — Jeddah' },
}

/** Cities (US-004 filter). */
export const CITIES = {
  jeddah: { ar: 'جدة', en: 'Jeddah' },
  makkah: { ar: 'مكة المكرمة', en: 'Makkah' },
  taif: { ar: 'الطائف', en: 'Taif' },
}

/** Vehicle types (US-001). */
export const VEHICLE_TYPES = {
  motorcycle: { ar: 'دراجة نارية', en: 'Motorcycle' },
  car: { ar: 'سيارة', en: 'Car' },
}

/** Work shifts — a vehicle carries up to two riders, one per shift. */
export const SHIFTS = {
  morning: { ar: 'صباحي', en: 'Morning' },
  evening: { ar: 'مسائي', en: 'Evening' },
}

/** Vehicle operational status. maintenance/fault carry a from/to period. */
export const VEHICLE_STATUS = {
  active: { ar: 'تعمل', en: 'Active' },
  maintenance: { ar: 'في الصيانة', en: 'In maintenance' },
  fault: { ar: 'عطل', en: 'Fault' },
}

/** Contracts registry (US-002). amount = contract value in SAR. commission formula lives in EP-03. */
export const CONTRACT_LIST = [
  { id: 'hunger', company: 'هانجر استيشن', amount: 120000, start: '2026-01-01', end: '2026-12-31', active: true },
  { id: 'jahez', company: 'جاهز', amount: 80000, start: '2026-01-01', end: '2026-12-31', active: true },
  { id: 'internal', company: 'عقود داخلية', amount: 60000, start: '2026-01-01', end: null, active: true },
]

/** Riders with current-month performance. commission in SAR.
    `contract` stays as the primary contract for backward-compat (dashboard);
    `contracts` is the full list a rider is linked to (US-002). */
export const RIDERS = [
  { id: 'R-001', name: 'محمد الغامدي', photo: null, nationalId: '1043215678', mobile: '0551234567', city: 'jeddah', contract: 'hunger', contracts: ['hunger'], vehicleId: 'v1', vehicleType: 'motorcycle', vehicle: 'ABC-1234', orders: 512, goal: 480, commission: 4820, wallet: 340, active: true },
  { id: 'R-002', name: 'عبدالله القحطاني', photo: null, nationalId: '1055678901', mobile: '0553456789', city: 'jeddah', contract: 'hunger', contracts: ['hunger', 'internal'], vehicleId: 'v2', vehicleType: 'motorcycle', vehicle: 'DEF-5678', orders: 604, goal: 480, commission: 5960, wallet: 910, active: true },
  { id: 'R-003', name: 'يوسف الزهراني', photo: null, nationalId: '1067890123', mobile: '0556789012', city: 'makkah', contract: 'jahez', contracts: ['jahez'], vehicleId: 'v3', vehicleType: 'motorcycle', vehicle: 'GHI-9012', orders: 318, goal: 480, commission: 2740, wallet: 155, active: true },
  { id: 'R-004', name: 'فهد العمري', photo: null, nationalId: '1078901234', mobile: '0559012345', city: 'jeddah', contract: 'internal', contracts: ['internal'], vehicleId: 'v4', vehicleType: 'car', vehicle: 'JKL-3456', orders: 470, goal: 450, commission: 4390, wallet: 780, active: true },
  { id: 'R-005', name: 'سلطان الحربي', photo: null, nationalId: '1089012345', mobile: '0552345678', city: 'taif', contract: 'hunger', contracts: ['hunger'], vehicleId: 'v5', vehicleType: 'motorcycle', vehicle: 'MNO-7890', orders: 289, goal: 480, commission: 2510, wallet: 60, active: true },
  { id: 'R-006', name: 'ماجد الشمري', photo: null, nationalId: '1090123456', mobile: '0554567890', city: 'jeddah', contract: 'jahez', contracts: ['jahez'], vehicleId: 'v6', vehicleType: 'motorcycle', vehicle: 'PQR-2345', orders: 553, goal: 480, commission: 5320, wallet: 1180, active: true },
  { id: 'R-007', name: 'تركي المطيري', photo: null, nationalId: '1101234567', mobile: '0557890123', city: 'makkah', contract: 'internal', contracts: ['internal'], vehicleId: 'v7', vehicleType: 'car', vehicle: 'STU-6789', orders: 401, goal: 450, commission: 3680, wallet: 240, active: true },
  { id: 'R-008', name: 'ناصر الدوسري', photo: null, nationalId: '1112345678', mobile: '0550123456', city: 'jeddah', contract: 'hunger', contracts: ['hunger'], vehicleId: 'v2', vehicleType: 'motorcycle', vehicle: 'DEF-5678', orders: 0, goal: 480, commission: 0, wallet: 0, active: false },
]

/** Trend series per period. labels align to orders/commissions arrays. */
export const TRENDS = {
  day: {
    labels: ['8ص', '10ص', '12م', '2م', '4م', '6م', '8م', '10م'],
    orders: [18, 42, 71, 96, 128, 174, 212, 236],
    commissions: [180, 420, 720, 980, 1310, 1780, 2160, 2410],
  },
  month: {
    labels: ['أسبوع 1', 'أسبوع 2', 'أسبوع 3', 'أسبوع 4'],
    orders: [742, 861, 798, 946],
    commissions: [7180, 8420, 7960, 9240],
  },
  year: {
    labels: ['ينا', 'فبر', 'مار', 'أبر', 'ماي', 'يون', 'يول', 'أغس', 'سبت', 'أكت', 'نوف', 'ديس'],
    orders: [2980, 3210, 3020, 3347, 3510, 3680, 3890, 3720, 3450, 3610, 3980, 4120],
    commissions: [28900, 31200, 29800, 33470, 35100, 36800, 38900, 37200, 34500, 36100, 39800, 41200],
  },
}

/** The signed-in rider's personal weekly orders (US-020). */
export const RIDER_WEEK = {
  labels: ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'],
  orders: [72, 88, 64, 96, 81, 103, 8],
  dailyGoal: 80,
}

export const RIDER_WALLET = {
  balance: 340,
  lastMovement: { type: 'deposit', amount: 96, label: 'كاش أوردرات اليوم' },
}

/* ── Accounting (EP-07 / cross-epic) ────────────────────── */

/** Chart of accounts as a tree. Groups (isGroup) only structure the tree; postings go
    to leaves. level 1 = class, 2 = group, 3 = account. statementItem links a leaf to
    a financial-statement item (see STATEMENT_ITEMS). */
export const CHART_OF_ACCOUNTS = [
  { id: 'assets', code: '1000', name: 'الأصول', en: 'Assets', type: 'asset', parent: null, level: 1, isGroup: true, active: true },
  { id: 'current_assets', code: '1100', name: 'الأصول المتداولة', en: 'Current assets', type: 'asset', parent: 'assets', level: 2, isGroup: true, active: true },
  { id: 'cash', code: '1010', name: 'الصندوق', en: 'Cash', type: 'asset', parent: 'current_assets', level: 3, isGroup: false, active: true, statementItem: 'bs_cash' },
  { id: 'bank', code: '1020', name: 'البنك', en: 'Bank', type: 'asset', parent: 'current_assets', level: 3, isGroup: false, active: true, statementItem: 'bs_cash' },
  { id: 'input_vat', code: '1030', name: 'ضريبة القيمة المضافة — المدخلات', en: 'Input VAT', type: 'asset', parent: 'current_assets', level: 3, isGroup: false, active: true, statementItem: 'bs_other_current' },
  { id: 'rider_wallets', code: '1040', name: 'عُهد المناديب (كاش)', en: 'Rider cash on hand', type: 'asset', parent: 'current_assets', level: 3, isGroup: false, active: true, statementItem: 'bs_cash' },
  { id: 'receivables', code: '1050', name: 'ذمم العملاء', en: 'Accounts receivable', type: 'asset', parent: 'current_assets', level: 3, isGroup: false, active: true, statementItem: 'bs_receivables' },
  { id: 'rider_receivables', code: '1060', name: 'مديونيات المناديب', en: 'Rider receivables', type: 'asset', parent: 'current_assets', level: 3, isGroup: false, active: true, statementItem: 'bs_receivables' },
  { id: 'fixed_assets', code: '1200', name: 'الأصول الثابتة', en: 'Fixed assets', type: 'asset', parent: 'assets', level: 2, isGroup: true, active: true },
  { id: 'vehicles_asset', code: '1210', name: 'السيارات والدراجات', en: 'Vehicles', type: 'asset', parent: 'fixed_assets', level: 3, isGroup: false, active: true, statementItem: 'bs_fixed' },
  { id: 'liabilities', code: '2000', name: 'الالتزامات', en: 'Liabilities', type: 'liability', parent: null, level: 1, isGroup: true, active: true },
  { id: 'current_liabilities', code: '2100', name: 'الالتزامات المتداولة', en: 'Current liabilities', type: 'liability', parent: 'liabilities', level: 2, isGroup: true, active: true },
  { id: 'riders_payable', code: '2010', name: 'ذمم المناديب (عمولات)', en: 'Riders payable', type: 'liability', parent: 'current_liabilities', level: 3, isGroup: false, active: true, statementItem: 'bs_payables' },
  { id: 'suppliers', code: '2020', name: 'الموردون', en: 'Suppliers payable', type: 'liability', parent: 'current_liabilities', level: 3, isGroup: false, active: true, statementItem: 'bs_payables' },
  { id: 'output_vat', code: '2030', name: 'ضريبة القيمة المضافة — المخرجات', en: 'Output VAT', type: 'liability', parent: 'current_liabilities', level: 3, isGroup: false, active: true, statementItem: 'bs_tax' },
  { id: 'equity', code: '3000', name: 'حقوق الملكية', en: 'Equity', type: 'equity', parent: null, level: 1, isGroup: true, active: true },
  { id: 'capital', code: '3010', name: 'رأس المال', en: 'Capital', type: 'equity', parent: 'equity', level: 3, isGroup: false, active: true, statementItem: 'bs_capital' },
  { id: 'retained_earnings', code: '3020', name: 'الأرباح المحتجزة', en: 'Retained earnings', type: 'equity', parent: 'equity', level: 3, isGroup: false, active: true, statementItem: 'bs_retained' },
  { id: 'revenue', code: '4000', name: 'الإيرادات', en: 'Revenue', type: 'revenue', parent: null, level: 1, isGroup: true, active: true },
  { id: 'delivery_revenue', code: '4010', name: 'إيرادات التوصيل', en: 'Delivery revenue', type: 'revenue', parent: 'revenue', level: 3, isGroup: false, active: true, statementItem: 'is_revenue' },
  { id: 'expenses', code: '5000', name: 'المصروفات', en: 'Expenses', type: 'expense', parent: null, level: 1, isGroup: true, active: true },
  { id: 'operating_expenses', code: '5100', name: 'مصروفات تشغيلية', en: 'Operating expenses', type: 'expense', parent: 'expenses', level: 2, isGroup: true, active: true },
  { id: 'commissions_expense', code: '5010', name: 'مصروف العمولات', en: 'Commissions expense', type: 'expense', parent: 'operating_expenses', level: 3, isGroup: false, active: true, statementItem: 'is_cost' },
  { id: 'vehicle_expense', code: '5020', name: 'مصروفات السيارات', en: 'Vehicle expenses', type: 'expense', parent: 'operating_expenses', level: 3, isGroup: false, active: true, statementItem: 'is_cost' },
  { id: 'supplies_expense', code: '5030', name: 'مصروف المستلزمات', en: 'Supplies & purchases', type: 'expense', parent: 'operating_expenses', level: 3, isGroup: false, active: true, statementItem: 'is_cost' },
  { id: 'admin_expenses', code: '5200', name: 'مصروفات إدارية وعمومية', en: 'General & admin expenses', type: 'expense', parent: 'expenses', level: 2, isGroup: true, active: true },
  { id: 'general_expense', code: '5040', name: 'مصروفات عمومية وإدارية', en: 'General & admin expenses', type: 'expense', parent: 'admin_expenses', level: 3, isGroup: false, active: true, statementItem: 'is_admin' },
  { id: 'salaries_expense', code: '5050', name: 'رواتب وأجور', en: 'Salaries & wages', type: 'expense', parent: 'admin_expenses', level: 3, isGroup: false, active: true, statementItem: 'is_admin' },
]

/** Cost centers (US-025) with monthly budgets in SAR.
    cc-veh-* centers belong to a single vehicle (vehicleId set). */
export const COST_CENTERS = [
  { id: 'cc-hunger', code: 'CC-100', unitId: 'u-jed', name: 'هانجر — جدة', budget: 120000, active: true },
  { id: 'cc-jahez', code: 'CC-200', unitId: 'u-jed', name: 'جاهز — جدة', budget: 80000, active: true },
  { id: 'cc-internal', code: 'CC-300', unitId: 'u-hq', name: 'العقود الداخلية', budget: 60000, active: true },
  { id: 'cc-fleet', code: 'CC-400', unitId: 'u-hq', name: 'أسطول السيارات — عام', budget: 40000, active: true },
  { id: 'cc-veh-v1', code: 'CC-401', unitId: 'u-jed', name: 'مركبة ABC-1234', budget: 0, active: true, vehicleId: 'v1' },
  { id: 'cc-veh-v2', code: 'CC-402', unitId: 'u-jed', name: 'مركبة DEF-5678', budget: 0, active: true, vehicleId: 'v2' },
  { id: 'cc-veh-v3', code: 'CC-403', unitId: 'u-mak', name: 'مركبة GHI-9012', budget: 0, active: true, vehicleId: 'v3' },
  { id: 'cc-veh-v4', code: 'CC-404', unitId: 'u-jed', name: 'مركبة JKL-3456', budget: 0, active: true, vehicleId: 'v4' },
  { id: 'cc-veh-v5', code: 'CC-405', unitId: 'u-taif', name: 'مركبة MNO-7890', budget: 0, active: true, vehicleId: 'v5' },
  { id: 'cc-veh-v6', code: 'CC-406', unitId: 'u-jed', name: 'مركبة PQR-2345', budget: 0, active: true, vehicleId: 'v6' },
  { id: 'cc-veh-v7', code: 'CC-407', unitId: 'u-mak', name: 'مركبة STU-6789', budget: 0, active: true, vehicleId: 'v7' },
]

/** Document types for journal entries (the "symbol" of the general journal screen).
    Each type numbers its own documents: prefix-year-0001. */
export const DOCUMENT_TYPES = [
  { id: 'jv', name: 'قيد يومية عامة', en: 'General journal entry', prefix: 'JV' },
  { id: 'rv', name: 'سند قبض', en: 'Receipt voucher', prefix: 'RV' },
  { id: 'pv', name: 'سند صرف', en: 'Payment voucher', prefix: 'PV' },
  { id: 'ov', name: 'قيد افتتاحي', en: 'Opening entry', prefix: 'OV' },
  { id: 'adj', name: 'قيد تسوية', en: 'Adjustment entry', prefix: 'ADJ' },
]

/** Fiscal years. A journal entry must fall inside its fiscal year; closed years reject new entries. */
export const FISCAL_YEARS = [
  { id: 'fy2025', name: 'السنة المالية 2025', en: 'Fiscal year 2025', year: 2025, dateFrom: '2025-01-01', dateTo: '2025-12-31', isDefault: false, closed: true },
  { id: 'fy2026', name: 'السنة المالية 2026', en: 'Fiscal year 2026', year: 2026, dateFrom: '2026-01-01', dateTo: '2026-12-31', isDefault: true, closed: false },
]

/** Seed journal entries (balanced). serial = global running number, ref = document
    number (per document type). lines: [{account, costCenter, debit, credit, description}] */
export const JOURNAL = [
  {
    id: 'j0', serial: 0, ref: 'OV-2026-0001', docType: 'ov', fiscalYear: 'fy2026', date: '2026-01-01', source: 'opening',
    description: 'القيد الافتتاحي — أرصدة أول المدة 2026', createdBy: 'سارة الدوسري',
    lines: [
      { account: 'bank', costCenter: null, debit: 190000, credit: 0, description: 'رصيد البنك' },
      { account: 'cash', costCenter: null, debit: 35000, credit: 0, description: 'رصيد الصندوق' },
      { account: 'vehicles_asset', costCenter: 'cc-fleet', debit: 234500, credit: 0, description: 'قيمة الأسطول' },
      { account: 'rider_wallets', costCenter: null, debit: 3665, credit: 0, description: 'عُهد المناديب' },
      { account: 'capital', costCenter: null, debit: 0, credit: 450000, description: 'رأس المال' },
      { account: 'retained_earnings', costCenter: null, debit: 0, credit: 13165, description: 'أرباح محتجزة من 2025' },
    ],
  },
  {
    id: 'j1', serial: 1, ref: 'JV-2026-0001', docType: 'jv', fiscalYear: 'fy2026', date: '2026-06-30', source: 'commissions',
    description: 'عمولات شهر يونيو 2026', createdBy: 'سارة الدوسري',
    lines: [
      { account: 'commissions_expense', costCenter: 'cc-hunger', debit: 18200, credit: 0, description: 'عمولات مناديب هانجر' },
      { account: 'riders_payable', costCenter: 'cc-hunger', debit: 0, credit: 18200, description: '' },
    ],
  },
  {
    id: 'j2', serial: 2, ref: 'JV-2026-0002', docType: 'jv', fiscalYear: 'fy2026', date: '2026-06-28', source: 'vehicles',
    description: 'صيانة سيارة ABC-1234', createdBy: 'فيصل الجهني',
    lines: [
      { account: 'vehicle_expense', costCenter: 'cc-fleet', debit: 650, credit: 0, description: 'صيانة دورية' },
      { account: 'cash', costCenter: 'cc-fleet', debit: 0, credit: 650, description: '' },
    ],
  },
  {
    id: 'j3', serial: 3, ref: 'JV-2026-0003', docType: 'jv', fiscalYear: 'fy2026', date: '2026-06-25', source: 'purchases',
    description: 'شراء مستلزمات — قطع غيار', createdBy: 'سارة الدوسري',
    lines: [
      { account: 'supplies_expense', costCenter: 'cc-fleet', debit: 1200, credit: 0, description: 'قطع غيار دراجات' },
      { account: 'input_vat', costCenter: 'cc-fleet', debit: 180, credit: 0, description: 'ضريبة مدخلات' },
      { account: 'suppliers', costCenter: 'cc-fleet', debit: 0, credit: 1380, description: '' },
    ],
  },
  {
    id: 'j4', serial: 4, ref: 'JV-2026-0004', docType: 'jv', fiscalYear: 'fy2026', date: '2026-07-01', source: 'manual',
    description: 'إيجار المستودع — يوليو', createdBy: 'سارة الدوسري',
    lines: [
      { account: 'general_expense', costCenter: 'cc-internal', debit: 4000, credit: 0, description: 'إيجار شهر يوليو' },
      { account: 'bank', costCenter: 'cc-internal', debit: 0, credit: 4000, description: 'تحويل بنكي' },
    ],
    modifiedAt: '2026-07-02T10:15', modifiedBy: 'سارة الدوسري',
  },
  {
    id: 'j5', serial: 5, ref: 'JV-2026-0005', docType: 'jv', fiscalYear: 'fy2026', date: '2026-06-12', source: 'manual',
    description: 'قيد مكرر بالخطأ — ملغى', createdBy: 'سارة الدوسري', status: 'voided', voidedAt: '2026-06-13T09:00', voidedBy: 'أحمد العتيبي', voidReason: 'تكرار قيد الإيجار',
    lines: [
      { account: 'general_expense', costCenter: 'cc-internal', debit: 4000, credit: 0, description: 'إيجار' },
      { account: 'bank', costCenter: 'cc-internal', debit: 0, credit: 4000, description: '' },
    ],
  },
]

/** Audit log seed (US-027). action ∈ login|logout|create|update|delete */
export const AUDIT_LOG = [
  { id: 'a1', at: '2026-07-01T08:12:00', user: 'أحمد العتيبي', role: 'manager', action: 'login', entity: '—', detail: 'تسجيل دخول', ip: '212.11.4.31' },
  { id: 'a2', at: '2026-07-01T08:40:00', user: 'سارة الدوسري', role: 'accountant', action: 'update', entity: 'commissions', detail: 'اعتماد عمولات يونيو', ip: '212.11.4.55' },
  { id: 'a3', at: '2026-07-01T09:05:00', user: 'خالد الشهري', role: 'supervisor', action: 'update', entity: 'orders', detail: 'تعديل أوردرات R-003', ip: '212.11.4.77' },
]

/* ── Commissions (EP-03) ────────────────────────────────── */

/** Per-contract commission formula: base salary + tiered rates past target.
    tiers: ordered brackets over the absolute order count; upTo:null = unbounded last tier. */
export const COMMISSION_FORMULAS = {
  hunger: { target: 480, base: 2500, tiers: [{ upTo: null, perOrder: 6 }] },
  jahez: { target: 480, base: 2400, tiers: [{ upTo: null, perOrder: 6 }] },
  internal: { target: 450, base: 2600, tiers: [{ upTo: 550, perOrder: 7 }, { upTo: null, perOrder: 9 }] },
}
/** Per-rider overrides (riderId → formula). */
export const RIDER_FORMULA_OVERRIDES = {}
/** Formula change history: { contract, at, before, after }. */
export const FORMULA_HISTORY = []
/** Approved/locked monthly runs: { month:'2026-06', lockedAt, ref }. */
export const COMMISSION_RUNS = [{ month: '2026-06', lockedAt: '2026-07-01', ref: 'JV-2026-0001' }]
/** Contract → cost center mapping for auto postings. */
export const CONTRACT_COST_CENTER = { hunger: 'cc-hunger', jahez: 'cc-jahez', internal: 'cc-internal' }

/* ── Daily orders (EP-02) ───────────────────────────────── */

/** Daily order logs. cash = cash collected (feeds wallet). */
export const ORDERS = [
  { id: 'o1', riderId: 'R-001', date: '2026-07-01', orders: 22, cash: 640, hours: 9, notes: '', editedBy: null },
  { id: 'o2', riderId: 'R-001', date: '2026-06-30', orders: 18, cash: 520, hours: 8, notes: '', editedBy: null },
  { id: 'o3', riderId: 'R-002', date: '2026-07-01', orders: 25, cash: 710, hours: 10, notes: '', editedBy: null },
  { id: 'o4', riderId: 'R-003', date: '2026-07-01', orders: 14, cash: 300, hours: 7, notes: 'ازدحام مروري', editedBy: null },
  { id: 'o5', riderId: 'R-006', date: '2026-07-01', orders: 27, cash: 820, hours: 11, notes: '', editedBy: null },
  { id: 'o6', riderId: 'R-001', date: '2026-06-27', orders: 20, cash: 580, hours: 9, notes: '', editedBy: null },
  { id: 'o7', riderId: 'R-001', date: '2026-06-28', orders: 17, cash: 490, hours: 8, notes: '', editedBy: null },
  { id: 'o8', riderId: 'R-001', date: '2026-06-29', orders: 21, cash: 610, hours: 9, notes: '', editedBy: null },
  { id: 'o9', riderId: 'R-001', date: '2026-07-02', orders: 19, cash: 550, hours: 8, notes: '', editedBy: null },
  { id: 'o10', riderId: 'R-002', date: '2026-06-29', orders: 23, cash: 660, hours: 10, notes: '', editedBy: null },
  { id: 'o11', riderId: 'R-002', date: '2026-06-30', orders: 24, cash: 690, hours: 10, notes: '', editedBy: null },
  { id: 'o12', riderId: 'R-002', date: '2026-07-02', orders: 26, cash: 740, hours: 10, notes: '', editedBy: null },
  { id: 'o13', riderId: 'R-003', date: '2026-06-29', orders: 12, cash: 260, hours: 7, notes: '', editedBy: null },
  { id: 'o14', riderId: 'R-003', date: '2026-06-30', orders: 15, cash: 330, hours: 7, notes: '', editedBy: null },
  { id: 'o15', riderId: 'R-004', date: '2026-06-30', orders: 18, cash: 500, hours: 8, notes: '', editedBy: null },
  { id: 'o16', riderId: 'R-004', date: '2026-07-01', orders: 20, cash: 560, hours: 9, notes: '', editedBy: null },
  { id: 'o17', riderId: 'R-005', date: '2026-06-30', orders: 11, cash: 240, hours: 6, notes: '', editedBy: null },
  { id: 'o18', riderId: 'R-005', date: '2026-07-01', orders: 13, cash: 290, hours: 7, notes: '', editedBy: null },
  { id: 'o19', riderId: 'R-006', date: '2026-06-30', orders: 25, cash: 760, hours: 10, notes: '', editedBy: null },
  { id: 'o20', riderId: 'R-007', date: '2026-06-30', orders: 16, cash: 430, hours: 8, notes: '', editedBy: null },
  { id: 'o21', riderId: 'R-007', date: '2026-07-01', orders: 17, cash: 460, hours: 8, notes: '', editedBy: null },
]

/* ── Cash wallets (EP-04) ───────────────────────────────── */

/** Wallet movements. type ∈ deposit|handover. amount always positive. */
export const WALLET_MOVEMENTS = [
  { id: 'w1', riderId: 'R-001', date: '2026-06-01', type: 'deposit', amount: 340, label: 'رصيد افتتاحي' },
  { id: 'w2', riderId: 'R-002', date: '2026-06-01', type: 'deposit', amount: 910, label: 'رصيد افتتاحي' },
  { id: 'w3', riderId: 'R-003', date: '2026-06-01', type: 'deposit', amount: 155, label: 'رصيد افتتاحي' },
  { id: 'w4', riderId: 'R-004', date: '2026-06-01', type: 'deposit', amount: 780, label: 'رصيد افتتاحي' },
  { id: 'w5', riderId: 'R-005', date: '2026-06-01', type: 'deposit', amount: 60, label: 'رصيد افتتاحي' },
  { id: 'w6', riderId: 'R-006', date: '2026-06-01', type: 'deposit', amount: 1180, label: 'رصيد افتتاحي' },
  { id: 'w7', riderId: 'R-007', date: '2026-06-01', type: 'deposit', amount: 240, label: 'رصيد افتتاحي' },
]

/* ── Vehicles & expenses (EP-05) ────────────────────────── */

export const EXPENSE_TYPES = {
  fuel: { ar: 'وقود', en: 'Fuel' },
  maintenance: { ar: 'صيانة', en: 'Maintenance' },
  insurance: { ar: 'تأمين', en: 'Insurance' },
  registration: { ar: 'تسجيل', en: 'Registration' },
  fines: { ar: 'مخالفات', en: 'Fines' },
  other: { ar: 'أخرى', en: 'Other' },
}

/** Vehicles. value = purchase value in SAR. Up to two riders (one per shift).
    Each vehicle owns a cost center (cc-veh-*) for its expenses. */
export const VEHICLES = [
  { id: 'v1', plate: 'ABC-1234', type: 'motorcycle', chassis: 'JH2PC37017M200001', color: 'أسود', model: 'Honda CB150', year: 2023, tankCapacity: 12, morningRiderId: 'R-001', eveningRiderId: null, value: 18000, status: 'active', statusFrom: null, statusTo: null, costCenter: 'cc-veh-v1' },
  { id: 'v2', plate: 'DEF-5678', type: 'motorcycle', chassis: 'JH2PC37017M200002', color: 'أحمر', model: 'Honda CB150', year: 2023, tankCapacity: 12, morningRiderId: 'R-002', eveningRiderId: 'R-008', value: 18500, status: 'active', statusFrom: null, statusTo: null, costCenter: 'cc-veh-v2' },
  { id: 'v3', plate: 'GHI-9012', type: 'motorcycle', chassis: 'MLHKC0910P5200003', color: 'أزرق', model: 'Yamaha YBR125', year: 2022, tankCapacity: 13, morningRiderId: 'R-003', eveningRiderId: null, value: 16500, status: 'active', statusFrom: null, statusTo: null, costCenter: 'cc-veh-v3' },
  { id: 'v4', plate: 'JKL-3456', type: 'car', chassis: 'KMHCT41DAKU200004', color: 'أبيض', model: 'Hyundai Accent', year: 2022, tankCapacity: 45, morningRiderId: 'R-004', eveningRiderId: null, value: 78000, status: 'maintenance', statusFrom: '2026-07-10', statusTo: '2026-07-30', costCenter: 'cc-veh-v4' },
  { id: 'v5', plate: 'MNO-7890', type: 'motorcycle', chassis: 'MLHKC0910P5200005', color: 'أسود', model: 'Yamaha YBR125', year: 2021, tankCapacity: 13, morningRiderId: 'R-005', eveningRiderId: null, value: 15500, status: 'active', statusFrom: null, statusTo: null, costCenter: 'cc-veh-v5' },
  { id: 'v6', plate: 'PQR-2345', type: 'motorcycle', chassis: 'JH2PC37017M200006', color: 'أبيض', model: 'Honda CB150', year: 2024, tankCapacity: 12, morningRiderId: 'R-006', eveningRiderId: null, value: 19000, status: 'active', statusFrom: null, statusTo: null, costCenter: 'cc-veh-v6' },
  { id: 'v7', plate: 'STU-6789', type: 'car', chassis: 'JTDBR32E0J0200007', color: 'فضي', model: 'Toyota Yaris', year: 2021, tankCapacity: 42, morningRiderId: 'R-007', eveningRiderId: null, value: 69000, status: 'active', statusFrom: null, statusTo: null, costCenter: 'cc-veh-v7' },
]

export const VEHICLE_EXPENSES = [
  { id: 've1', vehicleId: 'v1', type: 'maintenance', amount: 650, date: '2026-06-28', invoiceNo: 'INV-1021', note: 'صيانة دورية' },
  { id: 've2', vehicleId: 'v1', type: 'fuel', amount: 400, date: '2026-06-20', invoiceNo: 'INV-1005', note: '' },
  { id: 've3', vehicleId: 'v4', type: 'insurance', amount: 1200, date: '2026-06-10', invoiceNo: 'INV-0990', note: 'تأمين سنوي' },
  { id: 've4', vehicleId: 'v6', type: 'fines', amount: 300, date: '2026-06-15', invoiceNo: '—', note: 'مخالفة سرعة' },
]

/* ── Purchases & VAT (EP-09) ────────────────────────────── */

export const SUPPLIER_CATEGORIES = {
  fuel: { ar: 'وقود', en: 'Fuel' },
  parts: { ar: 'قطع غيار', en: 'Spare parts' },
  equipment: { ar: 'معدات', en: 'Equipment' },
  other: { ar: 'أخرى', en: 'Other' },
}

/** Suppliers. taxNo = 15-digit ZATCA reg number (starts & ends with 3). */
export const SUPPLIERS = [
  { id: 's1', name: 'مؤسسة الوقود الوطنية', taxNo: '300000000000003', mobile: '0551112223', category: 'fuel', active: true },
  { id: 's2', name: 'قطع غيار المدينة', taxNo: '310000000000003', mobile: '0554445556', category: 'parts', active: true },
  { id: 's3', name: 'معدات التوصيل المتقدمة', taxNo: '312345678900003', mobile: '0557778889', category: 'equipment', active: true },
]

export const PURCHASES = [
  { id: 'p1', supplierId: 's2', itemType: 'قطع غيار دراجات', qty: 4, unitPrice: 250, date: '2026-06-25', taxable: true, vehicleId: 'v1', costCenter: 'cc-veh-v1', invoiceNo: 'S-1201', ref: 'PO-2026-0001', preTax: 1000, vat: 150, total: 1150 },
  { id: 'p2', supplierId: 's1', itemType: 'وقود', qty: 1, unitPrice: 800, date: '2026-06-22', taxable: true, vehicleId: null, costCenter: 'cc-fleet', invoiceNo: 'S-0980', ref: 'PO-2026-0002', preTax: 800, vat: 120, total: 920 },
]

/* ── Users (EP-08) ──────────────────────────────────────── */
export const USERS = [
  { id: 'u1', name: 'أحمد العتيبي', role: 'manager', mobile: '0500000001', active: true },
  { id: 'u2', name: 'خالد الشهري', role: 'supervisor', mobile: '0500000002', active: true },
  { id: 'u3', name: 'سارة الدوسري', role: 'accountant', mobile: '0500000003', active: true },
  { id: 'u4', name: 'محمد الغامدي', role: 'rider', mobile: '0551234567', active: true },
]

/* ── Manual orders (#3) ─────────────────────────────────── */

/** Individually-entered orders. Each one rolls up into the rider's daily log
    (orders +1, cash += collected) so counts and wallets stay in sync. */
export const MANUAL_ORDERS = [
  { id: 'mo1', orderNo: 'HS-88213', riderId: 'R-001', date: '2026-07-02', time: '13:40', km: 4.2, price: 18, collected: 18, createdBy: 'خالد الشهري' },
  { id: 'mo2', orderNo: 'HS-88251', riderId: 'R-001', date: '2026-07-02', time: '14:05', km: 6.8, price: 24, collected: 0, createdBy: 'خالد الشهري' },
  { id: 'mo3', orderNo: 'JZ-10422', riderId: 'R-006', date: '2026-07-01', time: '19:20', km: 3.1, price: 15, collected: 15, createdBy: 'خالد الشهري' },
  { id: 'mo4', orderNo: 'HS-88302', riderId: 'R-002', date: '2026-07-02', time: '12:15', km: 5.5, price: 21, collected: 21, createdBy: 'أحمد العتيبي' },
]

/* ── Treasuries & banks (#4) ────────────────────────────── */

export const TREASURY_KINDS = {
  cash: { ar: 'خزنة نقدية', en: 'Cash box' },
  bank: { ar: 'حساب بنكي', en: 'Bank account' },
  rider: { ar: 'خزنة مناديب (عهدة)', en: 'Rider custody box' },
}

/** Treasuries. `account` = the GL account the treasury maps to.
    kind 'rider' boxes hold cash still in riders' hands (عهدة). */
export const TREASURIES = [
  { id: 'tr-main', name: 'الخزنة الرئيسية', kind: 'cash', account: 'cash', opening: 25000, active: true, isMain: true },
  { id: 'tr-bank', name: 'مصرف الراجحي — الحساب الجاري', kind: 'bank', account: 'bank', iban: 'SA0380000000608010167519', opening: 180000, active: true },
  { id: 'tr-riders-jed', name: 'خزنة مناديب جدة', kind: 'rider', account: 'rider_wallets', opening: 0, active: true },
  { id: 'tr-riders-mak', name: 'خزنة مناديب مكة', kind: 'rider', account: 'rider_wallets', opening: 0, active: true },
  { id: 'tr-riders-taif', name: 'خزنة مناديب الطائف', kind: 'rider', account: 'rider_wallets', opening: 0, active: true },
]

/** Rider → treasury link (treasury settings screen). */
export const RIDER_TREASURY = {
  'R-001': 'tr-riders-jed',
  'R-002': 'tr-riders-jed',
  'R-003': 'tr-riders-mak',
  'R-004': 'tr-riders-jed',
  'R-005': 'tr-riders-taif',
  'R-006': 'tr-riders-jed',
  'R-007': 'tr-riders-mak',
  'R-008': 'tr-riders-jed',
}

/** Treasury movements. type ∈ receipt|payment|transfer_in|transfer_out.
    status ∈ posted|pending|rejected (transfers born from cash handovers wait
    for the accountant). amount is always positive. */
export const TREASURY_MOVEMENTS = [
  { id: 'tm1', ref: 'RV-2026-0001', type: 'receipt', treasuryId: 'tr-bank', date: '2026-06-05', amount: 43056, party: 'هانجر استيشن', description: 'سداد فاتورة مايو', account: 'receivables', costCenter: null, riderId: null, status: 'posted', source: 'sales' },
  { id: 'tm2', ref: 'PV-2026-0001', type: 'payment', treasuryId: 'tr-main', date: '2026-06-28', amount: 650, party: 'ورشة النخبة', description: 'صيانة سيارة ABC-1234', account: 'vehicle_expense', costCenter: 'cc-veh-v1', expenseItem: 'maintenance', riderId: null, status: 'posted', source: 'vehicles' },
  { id: 'tm3', ref: 'TR-2026-0001', type: 'transfer_out', treasuryId: 'tr-bank', date: '2026-06-01', amount: 10000, party: 'الخزنة الرئيسية', description: 'تغذية الخزنة الرئيسية', transferId: 'tf1', status: 'posted', source: 'treasury' },
  { id: 'tm4', ref: 'TR-2026-0001', type: 'transfer_in', treasuryId: 'tr-main', date: '2026-06-01', amount: 10000, party: 'مصرف الراجحي — الحساب الجاري', description: 'تغذية الخزنة الرئيسية', transferId: 'tf1', status: 'posted', source: 'treasury' },
  { id: 'tm5', ref: 'RV-2026-0002', type: 'receipt', treasuryId: 'tr-riders-jed', date: '2026-06-01', amount: 3210, party: 'مناديب جدة', description: 'رصيد افتتاحي — عُهد المناديب', account: 'rider_wallets', riderId: null, status: 'posted', source: 'wallets' },
  { id: 'tm6', ref: 'RV-2026-0003', type: 'receipt', treasuryId: 'tr-riders-mak', date: '2026-06-01', amount: 395, party: 'مناديب مكة', description: 'رصيد افتتاحي — عُهد المناديب', account: 'rider_wallets', riderId: null, status: 'posted', source: 'wallets' },
  { id: 'tm7', ref: 'RV-2026-0004', type: 'receipt', treasuryId: 'tr-riders-taif', date: '2026-06-01', amount: 60, party: 'مناديب الطائف', description: 'رصيد افتتاحي — عُهد المناديب', account: 'rider_wallets', riderId: null, status: 'posted', source: 'wallets' },
  { id: 'tm8', ref: 'PV-2026-0002', type: 'payment', treasuryId: 'tr-main', date: '2026-06-20', amount: 500, party: 'عبدالله القحطاني', description: 'سحب من الرصيد — سلفة على الراتب', account: 'riders_payable', costCenter: null, expenseItem: null, riderId: 'R-002', status: 'posted', source: 'withdrawal' },
]

/* ── Rider balances, withdrawals & debts (#4b) ───────────── */

/** Withdrawals from a rider's balance — each one created a payment voucher. */
export const RIDER_WITHDRAWALS = [
  { id: 'wd1', riderId: 'R-002', date: '2026-06-20', amount: 500, reason: 'سلفة على الراتب', treasuryId: 'tr-main', voucherRef: 'PV-2026-0002', by: 'سارة الدوسري' },
]

/** Debts on riders (converted from un-deposited cash, or manual). */
export const RIDER_DEBTS = [
  { id: 'd1', riderId: 'R-006', date: '2026-06-30', amount: 420, remaining: 420, note: 'عجز إيداع يونيو', noticeRef: 'DN-2026-0001', by: 'سارة الدوسري' },
]

/** Debit / credit notices issued to riders. type ∈ debit|credit. */
export const RIDER_NOTICES = [
  { id: 'n1', ref: 'DN-2026-0001', riderId: 'R-006', type: 'debit', date: '2026-06-30', amount: 420, note: 'تحويل المتبقي من الإيداع إلى مديونية', source: 'debt', by: 'سارة الدوسري' },
  { id: 'n2', ref: 'DN-2026-0002', riderId: 'R-002', type: 'debit', date: '2026-06-20', amount: 500, note: 'سحب من الرصيد — سلفة على الراتب', source: 'withdrawal', by: 'سارة الدوسري' },
]

/* ── Vehicle handover, shifts & fuel (#5) ───────────────── */

/** Work shifts (editable). Ids match the legacy SHIFTS keys so existing
    assignments keep resolving. */
export const WORK_SHIFTS = [
  { id: 'morning', name: 'صباحي', en: 'Morning', from: '07:00', to: '15:00', active: true },
  { id: 'evening', name: 'مسائي', en: 'Evening', from: '15:00', to: '23:00', active: true },
]

/** Vehicle handover log. fromType/toType ∈ rider|company. fuel = 0–100 (%). */
export const VEHICLE_HANDOVERS = [
  { id: 'vh1', vehicleId: 'v2', date: '2026-07-01', time: '15:05', shiftId: 'evening', fromType: 'rider', fromRiderId: 'R-002', toType: 'rider', toRiderId: 'R-008', odometer: 18420, fuel: 60, condition: 'good', notes: '', by: 'خالد الشهري' },
  { id: 'vh2', vehicleId: 'v4', date: '2026-07-10', time: '09:30', shiftId: 'morning', fromType: 'rider', fromRiderId: 'R-004', toType: 'company', toRiderId: null, odometer: 61200, fuel: 25, condition: 'damaged', notes: 'خدش في الباب الأمامي — دخول الصيانة', by: 'فيصل الجهني' },
]

/** Fuel sheet — one row per fill-up. Also creates a `fuel` vehicle expense. */
export const FUEL_LOGS = [
  { id: 'f1', vehicleId: 'v1', riderId: 'R-001', date: '2026-06-20', liters: 11.5, amount: 400, odometer: 12210, station: 'الدريس — الحمراء', note: '', expenseId: 've2' },
  { id: 'f2', vehicleId: 'v6', riderId: 'R-006', date: '2026-07-01', liters: 9.8, amount: 23, odometer: 4020, station: 'ساسكو — الروضة', note: '', expenseId: null },
]

/* ── Catalogs (#6) ──────────────────────────────────────── */

/** Expense items (was the fixed EXPENSE_TYPES map). `account` = GL account. */
export const EXPENSE_ITEMS = [
  { id: 'fuel', name: 'وقود', en: 'Fuel', account: 'vehicle_expense', active: true },
  { id: 'maintenance', name: 'صيانة', en: 'Maintenance', account: 'vehicle_expense', active: true },
  { id: 'insurance', name: 'تأمين', en: 'Insurance', account: 'vehicle_expense', active: true },
  { id: 'registration', name: 'تسجيل', en: 'Registration', account: 'vehicle_expense', active: true },
  { id: 'fines', name: 'مخالفات', en: 'Fines', account: 'vehicle_expense', active: true },
  { id: 'rent', name: 'إيجار', en: 'Rent', account: 'general_expense', active: true },
  { id: 'salaries', name: 'رواتب', en: 'Salaries', account: 'salaries_expense', active: true },
  { id: 'other', name: 'أخرى', en: 'Other', account: 'general_expense', active: true },
]

/** Purchase items catalog. */
export const PURCHASE_ITEMS = [
  { id: 'pi1', name: 'قطع غيار دراجات', category: 'parts', unit: 'قطعة', active: true },
  { id: 'pi2', name: 'وقود', category: 'fuel', unit: 'لتر', active: true },
  { id: 'pi3', name: 'صناديق توصيل', category: 'equipment', unit: 'قطعة', active: true },
  { id: 'pi4', name: 'زيوت محركات', category: 'parts', unit: 'عبوة', active: true },
]

/* ── Sales invoices (#7) ────────────────────────────────── */

/** Sales invoices raised from partner sheets (Hunger Station …). VAT is
    computed automatically at VAT_RATE. status ∈ issued|paid */
export const SALES_INVOICES = [
  { id: 'si1', ref: 'SI-2026-0001', contract: 'hunger', period: '2026-05', date: '2026-06-02', orders: 3120, unitPrice: 12, preTax: 37440, vat: 5616, total: 43056, sheet: 'HS-May-2026.xlsx', status: 'paid', journalRef: null },
  { id: 'si2', ref: 'SI-2026-0002', contract: 'hunger', period: '2026-06', date: '2026-07-01', orders: 3347, unitPrice: 12, preTax: 40164, vat: 6024.6, total: 46188.6, sheet: 'HS-June-2026.xlsx', status: 'issued', journalRef: null },
]

/* ── General accounts module: settings & master data ─────── */

/** Accounting system settings (settings → اعدادات نظام الحسابات). */
export const ACCOUNTING_SETTINGS = {
  baseCurrency: 'SAR',
  decimals: 2,
  defaultFiscalYear: 'fy2026',
  requireCostCenter: true,
  allowBackdated: true,
  autoPostModules: true,
  retainedEarningsAccount: 'retained_earnings',
  inputVatAccount: 'input_vat',
  outputVatAccount: 'output_vat',
  numbering: { jv: 'JV', rv: 'RV', pv: 'PV', ov: 'OV', adj: 'ADJ' },
}

/** Currencies (settings → إدارة العملات). rate = units of base per 1 unit of currency. */
export const CURRENCIES = [
  { id: 'SAR', code: 'SAR', name: 'ريال سعودي', en: 'Saudi riyal', symbol: 'ر.س', rate: 1, isBase: true, active: true },
  { id: 'USD', code: 'USD', name: 'دولار أمريكي', en: 'US dollar', symbol: '$', rate: 3.75, isBase: false, active: true },
  { id: 'EGP', code: 'EGP', name: 'جنيه مصري', en: 'Egyptian pound', symbol: 'ج.م', rate: 0.078, isBase: false, active: true },
  { id: 'AED', code: 'AED', name: 'درهم إماراتي', en: 'UAE dirham', symbol: 'د.إ', rate: 1.02, isBase: false, active: false },
]

/** Closed months per fiscal year (settings → اغلاق الشهر). 'YYYY-MM'. */
export const CLOSED_MONTHS = {
  fy2025: ['2025-01', '2025-02', '2025-03', '2025-04', '2025-05', '2025-06', '2025-07', '2025-08', '2025-09', '2025-10', '2025-11', '2025-12'],
  fy2026: ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05'],
}

/** Administrative units directory (master data → دليل الوحدات الإدارية). */
export const ADMIN_UNITS = [
  { id: 'u-hq', code: 'U-100', name: 'الإدارة العامة — جدة', en: 'Head office — Jeddah', parent: null, active: true },
  { id: 'u-jed', code: 'U-110', name: 'فرع جدة — العمليات', en: 'Jeddah branch — operations', parent: 'u-hq', active: true },
  { id: 'u-mak', code: 'U-120', name: 'فرع مكة المكرمة', en: 'Makkah branch', parent: 'u-hq', active: true },
  { id: 'u-taif', code: 'U-130', name: 'فرع الطائف', en: 'Taif branch', parent: 'u-hq', active: true },
]

/** Financial-statement items (بنود القوائم المالية). statement ∈ income|balance.
    section orders the statement; sign tells how a balance is presented. */
export const STATEMENT_ITEMS = [
  { id: 'is_revenue', statement: 'income', section: 'revenue', code: 'IS-100', name: 'إيرادات التشغيل', en: 'Operating revenue', order: 1 },
  { id: 'is_cost', statement: 'income', section: 'cost', code: 'IS-200', name: 'تكلفة التشغيل', en: 'Cost of operations', order: 2 },
  { id: 'is_admin', statement: 'income', section: 'admin', code: 'IS-300', name: 'مصروفات إدارية وعمومية', en: 'General & admin expenses', order: 3 },
  { id: 'is_other', statement: 'income', section: 'other', code: 'IS-400', name: 'إيرادات ومصروفات أخرى', en: 'Other income & expenses', order: 4 },
  { id: 'bs_cash', statement: 'balance', section: 'current_assets', code: 'BS-110', name: 'النقدية وما في حكمها', en: 'Cash & equivalents', order: 1 },
  { id: 'bs_receivables', statement: 'balance', section: 'current_assets', code: 'BS-120', name: 'الذمم المدينة', en: 'Receivables', order: 2 },
  { id: 'bs_other_current', statement: 'balance', section: 'current_assets', code: 'BS-130', name: 'أصول متداولة أخرى', en: 'Other current assets', order: 3 },
  { id: 'bs_fixed', statement: 'balance', section: 'fixed_assets', code: 'BS-200', name: 'الأصول الثابتة', en: 'Fixed assets', order: 4 },
  { id: 'bs_payables', statement: 'balance', section: 'current_liabilities', code: 'BS-310', name: 'الذمم الدائنة', en: 'Payables', order: 5 },
  { id: 'bs_tax', statement: 'balance', section: 'current_liabilities', code: 'BS-320', name: 'التزامات ضريبية', en: 'Tax liabilities', order: 6 },
  { id: 'bs_capital', statement: 'balance', section: 'equity', code: 'BS-410', name: 'رأس المال', en: 'Capital', order: 7 },
  { id: 'bs_retained', statement: 'balance', section: 'equity', code: 'BS-420', name: 'الأرباح المحتجزة', en: 'Retained earnings', order: 8 },
]

/** Financial-analysis ratio definitions (reports → اعدادات التحليل المالي).
    numerator / denominator are aggregate keys computed by the balances engine. */
export const FINANCIAL_RATIOS = [
  { id: 'current_ratio', name: 'نسبة التداول', en: 'Current ratio', numerator: 'current_assets', denominator: 'current_liabilities', format: 'ratio', target: 1.5, enabled: true },
  { id: 'cash_ratio', name: 'نسبة النقدية', en: 'Cash ratio', numerator: 'cash', denominator: 'current_liabilities', format: 'ratio', target: 0.5, enabled: true },
  { id: 'net_margin', name: 'هامش صافي الربح', en: 'Net profit margin', numerator: 'net_profit', denominator: 'revenue', format: 'percent', target: 15, enabled: true },
  { id: 'expense_ratio', name: 'نسبة المصروفات إلى الإيرادات', en: 'Expense to revenue', numerator: 'expenses', denominator: 'revenue', format: 'percent', target: 85, enabled: true },
  { id: 'debt_to_equity', name: 'الالتزامات إلى حقوق الملكية', en: 'Debt to equity', numerator: 'liabilities', denominator: 'equity', format: 'ratio', target: 1, enabled: false },
  { id: 'roa', name: 'العائد على الأصول', en: 'Return on assets', numerator: 'net_profit', denominator: 'assets', format: 'percent', target: 10, enabled: true },
]
