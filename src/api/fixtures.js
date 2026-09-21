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
  { id: 'R-001', name: 'محمد الغامدي', nationalId: '1043215678', mobile: '0551234567', city: 'jeddah', contract: 'hunger', contracts: ['hunger'], vehicleId: 'v1', vehicleType: 'motorcycle', vehicle: 'ABC-1234', orders: 512, goal: 480, commission: 4820, wallet: 340, active: true },
  { id: 'R-002', name: 'عبدالله القحطاني', nationalId: '1055678901', mobile: '0553456789', city: 'jeddah', contract: 'hunger', contracts: ['hunger', 'internal'], vehicleId: 'v2', vehicleType: 'motorcycle', vehicle: 'DEF-5678', orders: 604, goal: 480, commission: 5960, wallet: 910, active: true },
  { id: 'R-003', name: 'يوسف الزهراني', nationalId: '1067890123', mobile: '0556789012', city: 'makkah', contract: 'jahez', contracts: ['jahez'], vehicleId: 'v3', vehicleType: 'motorcycle', vehicle: 'GHI-9012', orders: 318, goal: 480, commission: 2740, wallet: 155, active: true },
  { id: 'R-004', name: 'فهد العمري', nationalId: '1078901234', mobile: '0559012345', city: 'jeddah', contract: 'internal', contracts: ['internal'], vehicleId: 'v4', vehicleType: 'car', vehicle: 'JKL-3456', orders: 470, goal: 450, commission: 4390, wallet: 780, active: true },
  { id: 'R-005', name: 'سلطان الحربي', nationalId: '1089012345', mobile: '0552345678', city: 'taif', contract: 'hunger', contracts: ['hunger'], vehicleId: 'v5', vehicleType: 'motorcycle', vehicle: 'MNO-7890', orders: 289, goal: 480, commission: 2510, wallet: 60, active: true },
  { id: 'R-006', name: 'ماجد الشمري', nationalId: '1090123456', mobile: '0554567890', city: 'jeddah', contract: 'jahez', contracts: ['jahez'], vehicleId: 'v6', vehicleType: 'motorcycle', vehicle: 'PQR-2345', orders: 553, goal: 480, commission: 5320, wallet: 1180, active: true },
  { id: 'R-007', name: 'تركي المطيري', nationalId: '1101234567', mobile: '0557890123', city: 'makkah', contract: 'internal', contracts: ['internal'], vehicleId: 'v7', vehicleType: 'car', vehicle: 'STU-6789', orders: 401, goal: 450, commission: 3680, wallet: 240, active: true },
  { id: 'R-008', name: 'ناصر الدوسري', nationalId: '1112345678', mobile: '0550123456', city: 'jeddah', contract: 'hunger', contracts: ['hunger'], vehicleId: 'v2', vehicleType: 'motorcycle', vehicle: 'DEF-5678', orders: 0, goal: 480, commission: 0, wallet: 0, active: false },
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

/** Chart of accounts. type ∈ asset|liability|equity|revenue|expense. */
export const CHART_OF_ACCOUNTS = [
  { id: 'cash', code: '1010', name: 'الصندوق', en: 'Cash', type: 'asset' },
  { id: 'bank', code: '1020', name: 'البنك', en: 'Bank', type: 'asset' },
  { id: 'input_vat', code: '1030', name: 'ضريبة القيمة المضافة — المدخلات', en: 'Input VAT', type: 'asset' },
  { id: 'rider_wallets', code: '1040', name: 'عُهد المناديب (كاش)', en: 'Rider cash on hand', type: 'asset' },
  { id: 'riders_payable', code: '2010', name: 'ذمم المناديب (عمولات)', en: 'Riders payable', type: 'liability' },
  { id: 'suppliers', code: '2020', name: 'الموردون', en: 'Suppliers payable', type: 'liability' },
  { id: 'capital', code: '3010', name: 'رأس المال', en: 'Capital', type: 'equity' },
  { id: 'delivery_revenue', code: '4010', name: 'إيرادات التوصيل', en: 'Delivery revenue', type: 'revenue' },
  { id: 'commissions_expense', code: '5010', name: 'مصروف العمولات', en: 'Commissions expense', type: 'expense' },
  { id: 'vehicle_expense', code: '5020', name: 'مصروفات السيارات', en: 'Vehicle expenses', type: 'expense' },
  { id: 'supplies_expense', code: '5030', name: 'مصروف المستلزمات', en: 'Supplies & purchases', type: 'expense' },
]

/** Cost centers (US-025) with monthly budgets in SAR.
    cc-veh-* centers belong to a single vehicle (vehicleId set). */
export const COST_CENTERS = [
  { id: 'cc-hunger', name: 'هانجر — جدة', budget: 120000, active: true },
  { id: 'cc-jahez', name: 'جاهز — جدة', budget: 80000, active: true },
  { id: 'cc-internal', name: 'العقود الداخلية', budget: 60000, active: true },
  { id: 'cc-fleet', name: 'أسطول السيارات — عام', budget: 40000, active: true },
  { id: 'cc-veh-v1', name: 'مركبة ABC-1234', budget: 0, active: true, vehicleId: 'v1' },
  { id: 'cc-veh-v2', name: 'مركبة DEF-5678', budget: 0, active: true, vehicleId: 'v2' },
  { id: 'cc-veh-v3', name: 'مركبة GHI-9012', budget: 0, active: true, vehicleId: 'v3' },
  { id: 'cc-veh-v4', name: 'مركبة JKL-3456', budget: 0, active: true, vehicleId: 'v4' },
  { id: 'cc-veh-v5', name: 'مركبة MNO-7890', budget: 0, active: true, vehicleId: 'v5' },
  { id: 'cc-veh-v6', name: 'مركبة PQR-2345', budget: 0, active: true, vehicleId: 'v6' },
  { id: 'cc-veh-v7', name: 'مركبة STU-6789', budget: 0, active: true, vehicleId: 'v7' },
]

/** Seed journal entries (balanced). lines: [{account, costCenter, debit, credit}] */
export const JOURNAL = [
  {
    id: 'j1', ref: 'JV-2026-0001', date: '2026-06-30', source: 'commissions',
    description: 'عمولات شهر يونيو 2026',
    lines: [
      { account: 'commissions_expense', costCenter: 'cc-hunger', debit: 18200, credit: 0 },
      { account: 'riders_payable', costCenter: 'cc-hunger', debit: 0, credit: 18200 },
    ],
  },
  {
    id: 'j2', ref: 'JV-2026-0002', date: '2026-06-28', source: 'vehicles',
    description: 'صيانة سيارة ABC-1234',
    lines: [
      { account: 'vehicle_expense', costCenter: 'cc-fleet', debit: 650, credit: 0 },
      { account: 'cash', costCenter: 'cc-fleet', debit: 0, credit: 650 },
    ],
  },
  {
    id: 'j3', ref: 'JV-2026-0003', date: '2026-06-25', source: 'purchases',
    description: 'شراء مستلزمات — قطع غيار',
    lines: [
      { account: 'supplies_expense', costCenter: 'cc-fleet', debit: 1200, credit: 0 },
      { account: 'input_vat', costCenter: 'cc-fleet', debit: 180, credit: 0 },
      { account: 'suppliers', costCenter: 'cc-fleet', debit: 0, credit: 1380 },
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
  { id: 'v1', plate: 'ABC-1234', type: 'motorcycle', morningRiderId: 'R-001', eveningRiderId: null, value: 18000, status: 'active', statusFrom: null, statusTo: null, costCenter: 'cc-veh-v1' },
  { id: 'v2', plate: 'DEF-5678', type: 'motorcycle', morningRiderId: 'R-002', eveningRiderId: 'R-008', value: 18500, status: 'active', statusFrom: null, statusTo: null, costCenter: 'cc-veh-v2' },
  { id: 'v3', plate: 'GHI-9012', type: 'motorcycle', morningRiderId: 'R-003', eveningRiderId: null, value: 16500, status: 'active', statusFrom: null, statusTo: null, costCenter: 'cc-veh-v3' },
  { id: 'v4', plate: 'JKL-3456', type: 'car', morningRiderId: 'R-004', eveningRiderId: null, value: 78000, status: 'maintenance', statusFrom: '2026-07-10', statusTo: '2026-07-30', costCenter: 'cc-veh-v4' },
  { id: 'v5', plate: 'MNO-7890', type: 'motorcycle', morningRiderId: 'R-005', eveningRiderId: null, value: 15500, status: 'active', statusFrom: null, statusTo: null, costCenter: 'cc-veh-v5' },
  { id: 'v6', plate: 'PQR-2345', type: 'motorcycle', morningRiderId: 'R-006', eveningRiderId: null, value: 19000, status: 'active', statusFrom: null, statusTo: null, costCenter: 'cc-veh-v6' },
  { id: 'v7', plate: 'STU-6789', type: 'car', morningRiderId: 'R-007', eveningRiderId: null, value: 69000, status: 'active', statusFrom: null, statusTo: null, costCenter: 'cc-veh-v7' },
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
