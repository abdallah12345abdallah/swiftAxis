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

/** Contracts registry (US-002). commission formula lives in EP-03. */
export const CONTRACT_LIST = [
  { id: 'hunger', company: 'هانجر استيشن', city: 'jeddah', start: '2026-01-01', end: '2026-12-31', active: true },
  { id: 'jahez', company: 'جاهز', city: 'jeddah', start: '2026-01-01', end: '2026-12-31', active: true },
  { id: 'internal', company: 'عقود داخلية', city: 'jeddah', start: '2026-01-01', end: null, active: true },
]

/** Riders with current-month performance. commission in SAR.
    `contract` stays as the primary contract for backward-compat (dashboard);
    `contracts` is the full list a rider is linked to (US-002). */
export const RIDERS = [
  { id: 'R-001', name: 'محمد الغامدي', nationalId: '1043215678', mobile: '0551234567', city: 'jeddah', contract: 'hunger', contracts: ['hunger'], vehicleType: 'motorcycle', vehicle: 'ABC-1234', orders: 512, goal: 480, commission: 4820, wallet: 340, active: true },
  { id: 'R-002', name: 'عبدالله القحطاني', nationalId: '1055678901', mobile: '0553456789', city: 'jeddah', contract: 'hunger', contracts: ['hunger', 'internal'], vehicleType: 'motorcycle', vehicle: 'DEF-5678', orders: 604, goal: 480, commission: 5960, wallet: 910, active: true },
  { id: 'R-003', name: 'يوسف الزهراني', nationalId: '1067890123', mobile: '0556789012', city: 'makkah', contract: 'jahez', contracts: ['jahez'], vehicleType: 'motorcycle', vehicle: 'GHI-9012', orders: 318, goal: 480, commission: 2740, wallet: 155, active: true },
  { id: 'R-004', name: 'فهد العمري', nationalId: '1078901234', mobile: '0559012345', city: 'jeddah', contract: 'internal', contracts: ['internal'], vehicleType: 'car', vehicle: 'JKL-3456', orders: 470, goal: 450, commission: 4390, wallet: 780, active: true },
  { id: 'R-005', name: 'سلطان الحربي', nationalId: '1089012345', mobile: '0552345678', city: 'taif', contract: 'hunger', contracts: ['hunger'], vehicleType: 'motorcycle', vehicle: 'MNO-7890', orders: 289, goal: 480, commission: 2510, wallet: 60, active: true },
  { id: 'R-006', name: 'ماجد الشمري', nationalId: '1090123456', mobile: '0554567890', city: 'jeddah', contract: 'jahez', contracts: ['jahez'], vehicleType: 'motorcycle', vehicle: 'PQR-2345', orders: 553, goal: 480, commission: 5320, wallet: 1180, active: true },
  { id: 'R-007', name: 'تركي المطيري', nationalId: '1101234567', mobile: '0557890123', city: 'makkah', contract: 'internal', contracts: ['internal'], vehicleType: 'car', vehicle: 'STU-6789', orders: 401, goal: 450, commission: 3680, wallet: 240, active: true },
  { id: 'R-008', name: 'ناصر الدوسري', nationalId: '1112345678', mobile: '0550123456', city: 'jeddah', contract: 'hunger', contracts: ['hunger'], vehicleType: 'motorcycle', vehicle: 'VWX-0123', orders: 0, goal: 480, commission: 0, wallet: 0, active: false },
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
