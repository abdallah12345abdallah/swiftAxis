import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { fetchAccounts, fetchCostCenters, fetchFiscalYears, fetchDocumentTypes } from '@/api/ledger'
import { fetchAdminUnits, fetchStatementItems } from '@/api/accounting'

/* Reference lists every accounting screen picks from, as Dropdown options.
   Load once per screen with `load()`. */
export function useAccountingOptions() {
  const { locale } = useI18n()
  const accounts = ref([])
  const centers = ref([])
  const years = ref([])
  const docTypes = ref([])
  const units = ref([])
  const items = ref([])
  const loaded = ref(false)

  async function load() {
    ;[accounts.value, centers.value, years.value, docTypes.value, units.value, items.value] = await Promise.all([
      fetchAccounts(), fetchCostCenters(), fetchFiscalYears(), fetchDocumentTypes(), fetchAdminUnits(), fetchStatementItems(),
    ])
    loaded.value = true
  }

  const name = (x) => (locale.value === 'ar' ? x.name : x.en || x.name)
  const accountLabel = (a) => `${a.code} — ${name(a)}`
  const allAccountOptions = computed(() => accounts.value.map((a) => ({ value: a.id, label: accountLabel(a), hint: a.isGroup ? 'G' : '' })))
  const leafAccountOptions = computed(() => accounts.value.filter((a) => !a.isGroup && a.active !== false).map((a) => ({ value: a.id, label: accountLabel(a) })))
  const groupAccountOptions = computed(() => accounts.value.filter((a) => a.isGroup).map((a) => ({ value: a.id, label: accountLabel(a), hint: `L${a.level}` })))
  const centerOptions = computed(() => centers.value.map((c) => ({ value: c.id, label: `${c.code ?? ''} — ${c.name}`.replace(/^ — /, '') })))
  const yearOptions = computed(() => years.value.map((y) => ({ value: y.id, label: name(y), hint: y.closed ? '🔒' : '' })))
  const docTypeOptions = computed(() => docTypes.value.map((d) => ({ value: d.id, label: name(d), hint: d.prefix })))
  const unitOptions = computed(() => units.value.map((u) => ({ value: u.id, label: `${u.code} — ${name(u)}` })))
  const itemOptions = computed(() => items.value.map((i) => ({ value: i.id, label: `${i.code} — ${name(i)}`, hint: i.statement })))
  const defaultYear = computed(() => (years.value.find((y) => y.isDefault) ?? years.value[years.value.length - 1])?.id ?? '')
  const yearById = (id) => years.value.find((y) => y.id === id)

  return { load, loaded, accounts, centers, years, docTypes, units, items, name, allAccountOptions, leafAccountOptions, groupAccountOptions, centerOptions, yearOptions, docTypeOptions, unitOptions, itemOptions, defaultYear, yearById }
}
