<script setup>
import { ref, reactive, computed, watch, onMounted, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowLeft, Save, Printer, Search, FilePlus2, Copy, RefreshCw, Plus, Trash2, Check, AlertTriangle, Lock, X, Ban,
} from 'lucide-vue-next'
import { useConfirm } from '@/composables/useConfirm'
import PageHeader from '@/components/common/PageHeader.vue'
import BrandLogo from '@/components/common/BrandLogo.vue'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { DatePicker } from '@/components/ui/datepicker'
import { Dropdown } from '@/components/ui/dropdown'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { useCurrency } from '@/composables/useCurrency'
import { useDate } from '@/lib/format'
import { useToast } from '@/composables/useToast'
import { useAuthStore } from '@/stores/auth'
import { printReport } from '@/lib/export'
import { VEHICLE_STATUS } from '@/api/fixtures'
import { vehicleByCostCenter } from '@/api/vehicles'
import {
  fetchAccounts, fetchCostCenters, fetchDocumentTypes, fetchFiscalYears, fetchJournalEntry,
  saveJournalEntry, findJournalEntry, duplicateJournalEntry, validateJournalEntry, voidJournalEntry,
} from '@/api/ledger'

/* General journal entry screen — rebuilt from the Toby desktop spec:
   header (serial, date, statement, document type, document no, fiscal year),
   a line-entry row with the debit/credit exclusivity + Enter focus flow,
   an inline-editable lines table with totals, and the save / print / show /
   new / duplicate / refresh actions. Known gaps in the original are fixed:
   no date-range clamp, search needs a fiscal year, totals not swapped,
   unsaved changes ask before discarding, date must fall in the fiscal year. */

const route = useRoute()
const router = useRouter()
const { t, locale } = useI18n()
const confirm = useConfirm()
const { sar, num } = useCurrency()
const { formatDate } = useDate()
const toast = useToast()
const auth = useAuthStore()

const today = () => new Date().toISOString().slice(0, 10)

/* ── reference data ─────────────────────────────────────── */
const loading = ref(true)
const accounts = ref([])
const centers = ref([])
const docTypes = ref([])
const years = ref([])

const accountOptions = computed(() =>
  accounts.value.filter((a) => !a.isGroup && a.active !== false).map((a) => ({ value: a.id, label: `${a.code} — ${locale.value === 'ar' ? a.name : a.en}`, hint: a.type })),
)
const centerOptions = computed(() => centers.value.filter((c) => c.active).map((c) => ({ value: c.id, label: `${c.code ?? ''} — ${c.name}`.replace(/^ — /, '') })))
const docTypeOptions = computed(() => docTypes.value.map((d) => ({ value: d.id, label: locale.value === 'ar' ? d.name : d.en, hint: d.prefix })))
const yearOptions = computed(() => years.value.map((y) => ({ value: y.id, label: locale.value === 'ar' ? y.name : y.en, hint: y.closed ? t('journal.yearClosed') : `${y.dateFrom} → ${y.dateTo}`, disabled: y.closed })))
const defaultYear = () => (years.value.find((y) => y.isDefault) ?? years.value[years.value.length - 1])?.id ?? ''
const accName = (id) => {
  const a = accounts.value.find((x) => x.id === id)
  return a ? (locale.value === 'ar' ? a.name : a.en) : ''
}
const accCode = (id) => accounts.value.find((x) => x.id === id)?.code ?? ''
const ccName = (id) => centers.value.find((c) => c.id === id)?.name ?? ''
const ccCode = (id) => centers.value.find((c) => c.id === id)?.code ?? ''

async function loadReference() {
  ;[accounts.value, centers.value, docTypes.value, years.value] = await Promise.all([fetchAccounts(), fetchCostCenters(), fetchDocumentTypes(), fetchFiscalYears()])
}

/* ── the entry ──────────────────────────────────────────── */
const blankHeader = () => ({ id: null, serial: null, ref: '', date: today(), description: '', docType: 'jv', fiscalYear: defaultYear(), source: 'manual', editable: true, createdBy: '', status: 'posted', voidReason: '' })
const header = reactive(blankHeader())
const lines = ref([])
let snapshot = ''
const snap = () => JSON.stringify({ h: { ...header }, l: lines.value })
const dirty = computed(() => snap() !== snapshot)
const readOnly = computed(() => !header.editable)

function resetEntry() {
  Object.assign(header, blankHeader())
  lines.value = []
  Object.assign(entry, blankLine())
  snapshot = snap()
  nextTick(() => accountDd.value?.focus?.())
}
function loadEntry(e) {
  Object.assign(header, { id: e.id, serial: e.serial, ref: e.ref, date: e.date, description: e.description, docType: e.docType, fiscalYear: e.fiscalYear, source: e.source, editable: e.editable, createdBy: e.createdBy, status: e.status, voidReason: e.voidReason ?? '' })
  lines.value = e.lines.map((l) => ({ account: l.account, costCenter: l.costCenter ?? '', debit: l.debit, credit: l.credit, description: l.description ?? '' }))
  snapshot = snap()
}

onMounted(async () => {
  await loadReference()
  if (route.params.id) {
    try {
      loadEntry(await fetchJournalEntry(route.params.id))
    } catch {
      toast.error(t('journal.notFound'))
      resetEntry()
    }
  } else resetEntry()
  loading.value = false
})
watch(
  () => route.params.id,
  async (id) => {
    if (!id) return
    try {
      loadEntry(await fetchJournalEntry(id))
    } catch {
      toast.error(t('journal.notFound'))
    }
  },
)

/* ── line entry row (debit ⟷ credit exclusivity, Enter flow) ─ */
const blankLine = () => ({ account: '', costCenter: '', debit: '', credit: '', description: '' })
const entry = reactive(blankLine())
const accountDd = ref(null)
const centerDd = ref(null)
const debitEl = ref(null)
const creditEl = ref(null)
const descEl = ref(null)
const focusEl = (r) => nextTick(() => (r.value?.focus ? r.value.focus() : r.value?.$el?.focus?.()))

const debitFilled = computed(() => String(entry.debit).trim() !== '')
const creditFilled = computed(() => String(entry.credit).trim() !== '')
watch(() => entry.debit, (v) => { if (String(v).trim() !== '') entry.credit = '' })
watch(() => entry.credit, (v) => { if (String(v).trim() !== '') entry.debit = '' })

function onDebitEnter() {
  debitFilled.value ? focusEl(descEl) : focusEl(creditEl)
}
function onCreditEnter() {
  creditFilled.value ? focusEl(descEl) : creditEl.value?.$el?.blur?.()
}

function addLine() {
  if (readOnly.value) return
  const debit = Number(entry.debit)
  const credit = Number(entry.credit)
  const hasAmount = (debitFilled.value && Number.isFinite(debit) && debit > 0) || (creditFilled.value && Number.isFinite(credit) && credit > 0)
  if (!entry.account || !entry.costCenter || !hasAmount) {
    toast.error(t('journal.errLine'))
    return
  }
  lines.value.push({ account: entry.account, costCenter: entry.costCenter, debit: debitFilled.value ? debit : 0, credit: creditFilled.value ? credit : 0, description: entry.description.trim() })
  // account, amounts and description reset; the cost center stays for the next line (as in the original)
  Object.assign(entry, { account: '', debit: '', credit: '', description: '' })
  focusEl(accountDd)
}
function removeLine(i) {
  lines.value.splice(i, 1)
}
/* inline edits: keep one side per line, coerce numbers (invalid → 0, never silent null) */
function setAmount(l, side, v) {
  const n = Number(v)
  l[side] = Number.isFinite(n) && n >= 0 ? n : 0
  if (l[side] > 0) l[side === 'debit' ? 'credit' : 'debit'] = 0
}

const totalDebit = computed(() => lines.value.reduce((s, l) => s + (Number(l.debit) || 0), 0))
const totalCredit = computed(() => lines.value.reduce((s, l) => s + (Number(l.credit) || 0), 0))
const balanced = computed(() => totalDebit.value > 0 && Math.round((totalDebit.value - totalCredit.value) * 100) === 0)
const difference = computed(() => Math.round((totalDebit.value - totalCredit.value) * 100) / 100)

/** #11 — a line charged to a vehicle in maintenance / fault gets a note. */
function lineWarning(l) {
  if (!l.costCenter) return null
  const v = vehicleByCostCenter(l.costCenter)
  if (!v || v.status === 'active') return null
  const status = VEHICLE_STATUS[v.status]?.[locale.value] ?? VEHICLE_STATUS[v.status]?.ar ?? v.status
  if (v.statusFrom && v.statusTo) return t('ledger.vehicleWarning', { plate: v.plate, status, from: formatDate(v.statusFrom), to: formatDate(v.statusTo) })
  if (v.statusFrom) return t('ledger.vehicleWarningOpenEnded', { plate: v.plate, status, from: formatDate(v.statusFrom) })
  return t('ledger.vehicleWarningNoPeriod', { plate: v.plate, status })
}
const warnings = computed(() => [...new Set(lines.value.map(lineWarning).filter(Boolean))])

/* ── actions ────────────────────────────────────────────── */
const saving = ref(false)
const ERR = {
  FISCAL_YEAR_REQUIRED: 'journal.errYear', DOC_TYPE_REQUIRED: 'journal.errDocType', YEAR_CLOSED: 'journal.errYearClosed',
  DATE_OUT_OF_YEAR: 'journal.errDate', EMPTY: 'journal.errEmpty', NEGATIVE: 'journal.errLine', BOTH_SIDES: 'journal.errLine',
  UNBALANCED: 'journal.errUnbalanced', NOT_EDITABLE: 'journal.notEditable', NOT_FOUND: 'journal.notFound', MONTH_CLOSED: 'journal.errMonthClosed', REASON_REQUIRED: 'journal.errReason',
}
const payload = () => ({ id: header.id, date: header.date, description: header.description, docType: header.docType, fiscalYear: header.fiscalYear, lines: lines.value, createdBy: auth.user?.name })

async function save() {
  if (saving.value || readOnly.value) return
  const err = validateJournalEntry(payload())
  if (err) {
    toast.error(t(ERR[err]))
    return
  }
  saving.value = true
  try {
    const e = await saveJournalEntry(payload())
    loadEntry(e)
    toast.success(t('journal.saved', { ref: e.ref }))
    if (route.params.id !== e.id) router.replace(`/ledger/entry/${e.id}`)
  } catch (e) {
    toast.error(t(ERR[e.message] ?? 'journal.errGeneric'))
  } finally {
    saving.value = false
  }
}

function print() {
  if (!header.id) {
    toast.error(t('journal.errSaveFirst'))
    return
  }
  printReport()
}

/* new / cancel: identical, but ask before discarding unsaved work */
async function startNew() {
  if (dirty.value) {
    const ok = await confirm({
      tone: 'warning',
      icon: X,
      title: t('journal.discardTitle'),
      message: t('journal.discardHint'),
      confirmText: t('journal.discard'),
    })
    if (!ok) return
  }
  doNew()
}
function doNew() {
  resetEntry()
  if (route.params.id) router.replace('/ledger/entry')
}

/* duplicate: copy of the saved entry (ids cleared) saved as a new document */
async function duplicate() {
  if (!header.id) {
    toast.error(t('journal.errSaveFirst'))
    return
  }
  if (saving.value) return
  saving.value = true
  try {
    const e = await duplicateJournalEntry(header.id, { createdBy: auth.user?.name })
    loadEntry(e)
    toast.success(t('journal.duplicated', { ref: e.ref }))
    router.replace(`/ledger/entry/${e.id}`)
  } catch (e) {
    toast.error(t(ERR[e.message] ?? 'journal.errGeneric'))
  } finally {
    saving.value = false
  }
}

/* show / search */
const searchOpen = ref(false)
const search = reactive({ serial: '', docNo: '' })
const searching = ref(false)
function openSearch() {
  if (!header.fiscalYear) {
    toast.error(t('journal.errYear'))
    return
  }
  Object.assign(search, { serial: '', docNo: '' })
  searchOpen.value = true
}
async function doSearch() {
  if (searching.value) return
  searching.value = true
  try {
    const e = await findJournalEntry({ serial: search.serial, docNo: search.docNo, fiscalYear: header.fiscalYear })
    loadEntry(e)
    searchOpen.value = false
    router.replace(`/ledger/entry/${e.id}`)
  } catch (e) {
    toast.error(e.message === 'CRITERIA_REQUIRED' ? t('journal.errCriteria') : t('journal.notFound'))
  } finally {
    searching.value = false
  }
}

/* void (cancel) a saved manual entry — needs a reason, keeps the audit trail */
async function askVoid() {
  await confirm({
    tone: 'danger',
    icon: Ban,
    title: t('journal.voidTitle'),
    message: t('journal.voidHint', { ref: header.ref }),
    input: { label: t('journal.voidReason'), required: true },
    confirmText: t('journal.void'),
    onConfirm: async (reason) => {
      try {
        const e = await voidJournalEntry(header.id, { reason, by: auth.user?.name })
        loadEntry(e)
        toast.success(t('journal.voided', { ref: e.ref }))
      } catch (e) {
        toast.error(t(ERR[e.message] ?? 'journal.errGeneric'))
        return false
      }
    },
  })
}

/* refresh reference lists */
const refreshing = ref(false)
async function askRefresh() {
  await confirm({
    tone: 'primary',
    icon: RefreshCw,
    title: t('journal.refresh'),
    message: t('journal.refreshHint'),
    onConfirm: async () => {
      refreshing.value = true
      try {
        await loadReference()
        toast.success(t('journal.refreshed'))
      } finally {
        refreshing.value = false
      }
    },
  })
}

const docTypeName = computed(() => docTypeOptions.value.find((d) => d.value === header.docType)?.label ?? '')
const yearName = computed(() => yearOptions.value.find((y) => y.value === header.fiscalYear)?.label ?? '')
</script>

<template>
  <div>
    <div class="no-print mb-4">
      <Button variant="ghost" size="sm" as="RouterLink" to="/ledger">
        <ArrowLeft class="size-4 rtl:rotate-180" /> {{ t('journal.back') }}
      </Button>
    </div>

    <PageHeader :title="t('journal.title')" :subtitle="t('journal.subtitle')" class="no-print">
      <template #actions>
        <Button variant="ghost" :title="t('journal.refresh')" @click="askRefresh"><RefreshCw :class="refreshing && 'animate-spin'" /></Button>
        <Button variant="outline" @click="startNew"><FilePlus2 /> {{ t('journal.new') }}</Button>
        <Button variant="outline" @click="openSearch"><Search /> {{ t('journal.show') }}</Button>
        <Button variant="outline" :disabled="!header.id" @click="duplicate"><Copy /> {{ t('journal.duplicate') }}</Button>
        <Button variant="outline" :disabled="!header.id" @click="print"><Printer /> {{ t('journal.print') }}</Button>
        <Button v-if="header.id && !readOnly" variant="outline" class="text-danger" @click="askVoid"><Ban /> {{ t('journal.void') }}</Button>
        <Button :disabled="saving || readOnly" @click="save"><Save /> {{ t('journal.save') }}</Button>
      </template>
    </PageHeader>

    <div v-if="loading" class="space-y-4">
      <Skeleton class="h-40 rounded-2xl" />
      <Skeleton class="h-24 rounded-2xl" />
      <Skeleton class="h-64 rounded-2xl" />
    </div>

    <div v-else class="no-print space-y-5">
      <!-- read-only notice for auto-posted / closed-year entries -->
      <div v-if="header.status === 'voided'" class="bg-danger/10 text-danger flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm">
        <Ban class="size-4" /> {{ t('journal.voidedNotice', { reason: header.voidReason }) }}
      </div>
      <div v-else-if="readOnly" class="bg-muted/60 text-muted-foreground flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm">
        <Lock class="size-4" /> {{ t('journal.readOnly', { source: header.source }) }}
      </div>

      <!-- ── header ──────────────────────────────────────── -->
      <Card class="p-5">
        <div class="mb-4 flex flex-wrap items-center gap-2">
          <h2 class="font-semibold">{{ t('journal.header') }}</h2>
          <Badge v-if="header.id" variant="success"><Check class="size-3" /> {{ t('journal.savedBadge') }}</Badge>
          <Badge v-else variant="warning">{{ t('journal.unsavedBadge') }}</Badge>
          <Badge v-if="dirty && header.id" variant="secondary">{{ t('journal.modified') }}</Badge>
        </div>
        <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div class="space-y-1.5">
            <label class="text-sm font-medium">{{ t('journal.serial') }}</label>
            <Input :model-value="header.serial ? String(header.serial) : ''" disabled dir="ltr" :placeholder="t('journal.afterSave')" />
          </div>
          <div class="space-y-1.5">
            <label class="text-sm font-medium">{{ t('journal.docNo') }}</label>
            <Input :model-value="header.ref" disabled dir="ltr" :placeholder="t('journal.afterSave')" />
          </div>
          <div class="space-y-1.5">
            <label class="text-sm font-medium">{{ t('journal.docType') }} <span class="text-danger">*</span></label>
            <Dropdown v-model="header.docType" :options="docTypeOptions" :disabled="readOnly" :placeholder="t('journal.docTypePh')" />
          </div>
          <div class="space-y-1.5">
            <label class="text-sm font-medium">{{ t('journal.fiscalYear') }} <span class="text-danger">*</span></label>
            <Dropdown v-model="header.fiscalYear" :options="yearOptions" :disabled="readOnly" searchable @change="focusEl(accountDd)" />
          </div>
          <div class="space-y-1.5">
            <label class="text-sm font-medium">{{ t('common.date') }}</label>
            <DatePicker v-model="header.date" :disabled="readOnly" :clearable="false" />
          </div>
          <div class="space-y-1.5 sm:col-span-2 xl:col-span-3">
            <label class="text-sm font-medium">{{ t('journal.statement') }}</label>
            <Input v-model="header.description" :disabled="readOnly" :placeholder="t('ledger.form.descriptionPh')" />
          </div>
        </div>
      </Card>

      <!-- ── line entry ──────────────────────────────────── -->
      <Card v-if="!readOnly" class="p-5">
        <h2 class="mb-1 font-semibold">{{ t('journal.addLine') }}</h2>
        <p class="text-muted-foreground mb-4 text-xs">{{ t('journal.flowHint') }}</p>
        <div class="grid gap-3 md:grid-cols-[1.4fr_1.2fr_0.7fr_0.7fr_1.2fr_auto] md:items-end">
          <div class="space-y-1.5">
            <label class="text-xs font-medium">{{ t('journal.account') }}</label>
            <Dropdown ref="accountDd" v-model="entry.account" :options="accountOptions" searchable :placeholder="t('journal.accountPh')" @change="focusEl(centerDd)" />
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-medium">{{ t('journal.costCenter') }}</label>
            <Dropdown ref="centerDd" v-model="entry.costCenter" :options="centerOptions" searchable :placeholder="t('journal.costCenterPh')" @change="focusEl(debitEl)" />
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-medium">{{ t('ledger.debit') }}</label>
            <Input ref="debitEl" v-model="entry.debit" type="number" min="0" step="0.01" dir="ltr" placeholder="0" :disabled="creditFilled" @keydown.enter.prevent="onDebitEnter" />
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-medium">{{ t('ledger.credit') }}</label>
            <Input ref="creditEl" v-model="entry.credit" type="number" min="0" step="0.01" dir="ltr" placeholder="0" :disabled="debitFilled" @keydown.enter.prevent="onCreditEnter" />
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-medium">{{ t('journal.lineStatement') }}</label>
            <Input ref="descEl" v-model="entry.description" :placeholder="t('common.optional')" @keydown.enter.prevent="addLine" />
          </div>
          <Button type="button" class="h-11" @click="addLine"><Plus /> {{ t('journal.add') }}</Button>
        </div>
      </Card>

      <!-- ── lines table ─────────────────────────────────── -->
      <Card class="overflow-hidden">
        <div class="overflow-x-auto">
          <div class="soft-table overflow-x-auto"><table class="w-full text-sm">
            <thead>
              <tr class="text-muted-foreground border-b">
                <th class="px-4 py-3 text-start font-medium">#</th>
                <th class="px-4 py-3 text-start font-medium">{{ t('journal.accountNo') }}</th>
                <th class="px-4 py-3 text-start font-medium">{{ t('journal.accountName') }}</th>
                <th class="hidden px-4 py-3 text-start font-medium md:table-cell">{{ t('journal.ccCode') }}</th>
                <th class="hidden px-4 py-3 text-start font-medium lg:table-cell">{{ t('journal.costCenter') }}</th>
                <th class="px-4 py-3 text-end font-medium">{{ t('ledger.debit') }}</th>
                <th class="px-4 py-3 text-end font-medium">{{ t('ledger.credit') }}</th>
                <th class="hidden px-4 py-3 text-start font-medium lg:table-cell">{{ t('journal.lineStatement') }}</th>
                <th v-if="!readOnly" class="w-12 px-2 py-3" />
              </tr>
            </thead>
            <tbody>
              <tr v-for="(l, i) in lines" :key="i" class="border-b last:border-0">
                <td class="text-muted-foreground px-4 py-2 tabular-nums">{{ i + 1 }}</td>
                <td class="px-4 py-2 tabular-nums" dir="ltr">{{ accCode(l.account) }}</td>
                <td class="px-4 py-2 font-medium">{{ accName(l.account) }}</td>
                <td class="text-muted-foreground hidden px-4 py-2 tabular-nums md:table-cell" dir="ltr">{{ ccCode(l.costCenter) || '—' }}</td>
                <td class="text-muted-foreground hidden px-4 py-2 lg:table-cell">{{ ccName(l.costCenter) || '—' }}</td>
                <td class="px-2 py-1.5">
                  <Input v-if="!readOnly" :model-value="l.debit" type="number" min="0" step="0.01" dir="ltr" class="h-9 w-28 text-end" @update:model-value="setAmount(l, 'debit', $event)" />
                  <span v-else class="block text-end tabular-nums">{{ l.debit ? sar(l.debit, { decimals: 2 }) : '' }}</span>
                </td>
                <td class="px-2 py-1.5">
                  <Input v-if="!readOnly" :model-value="l.credit" type="number" min="0" step="0.01" dir="ltr" class="h-9 w-28 text-end" @update:model-value="setAmount(l, 'credit', $event)" />
                  <span v-else class="block text-end tabular-nums">{{ l.credit ? sar(l.credit, { decimals: 2 }) : '' }}</span>
                </td>
                <td class="hidden px-2 py-1.5 lg:table-cell">
                  <Input v-if="!readOnly" v-model="l.description" class="h-9 min-w-40" />
                  <span v-else class="text-muted-foreground">{{ l.description || '—' }}</span>
                </td>
                <td v-if="!readOnly" class="px-2 py-1.5">
                  <button type="button" class="hover:bg-accent text-muted-foreground hover:text-danger grid size-8 place-items-center rounded-lg" :title="t('common.delete')" @click="removeLine(i)"><Trash2 class="size-4" /></button>
                </td>
              </tr>
              <tr v-if="!lines.length">
                <td :colspan="readOnly ? 8 : 9" class="text-muted-foreground py-10 text-center">{{ t('journal.noLines') }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="bg-muted/40 border-t font-semibold">
                <td colspan="5" class="px-4 py-3">
                  <span class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs" :class="balanced ? 'bg-success/12 text-success' : 'bg-danger/12 text-danger'">
                    <Check v-if="balanced" class="size-3.5" /><AlertTriangle v-else class="size-3.5" />
                    {{ balanced ? t('ledger.balanced') : t('journal.difference', { amount: sar(Math.abs(difference), { decimals: 2 }) }) }}
                  </span>
                </td>
                <td class="px-4 py-3 text-end tabular-nums" dir="ltr">{{ sar(totalDebit, { decimals: 2 }) }}</td>
                <td class="px-4 py-3 text-end tabular-nums" dir="ltr">{{ sar(totalCredit, { decimals: 2 }) }}</td>
                <td :colspan="readOnly ? 1 : 2" class="hidden lg:table-cell" />
              </tr>
            </tfoot>
          </table></div>
        </div>
        <div v-if="warnings.length" class="space-y-1 border-t px-4 py-3">
          <p v-for="w in warnings" :key="w" class="bg-warning/12 text-warning-foreground flex items-start gap-2 rounded-lg px-3 py-2 text-xs">
            <AlertTriangle class="mt-0.5 size-3.5 shrink-0" /> {{ w }}
          </p>
        </div>
      </Card>
    </div>

    <!-- ── print layout (only visible when printing a saved entry) ── -->
    <div v-if="header.id" class="print-area bg-card hidden rounded-2xl border p-8 print:block">
      <div class="mb-6 flex items-start justify-between border-b pb-5">
        <div>
          <BrandLogo :mark-size="40" />
          <h2 class="mt-3 text-xl font-bold">{{ docTypeName }}</h2>
          <p class="text-muted-foreground text-sm">{{ yearName }}</p>
        </div>
        <div class="text-end text-sm">
          <p>{{ t('journal.docNo') }}: <b class="tabular-nums" dir="ltr">{{ header.ref }}</b></p>
          <p>{{ t('journal.serial') }}: <b class="tabular-nums">{{ header.serial }}</b></p>
          <p>{{ t('common.date') }}: <b class="tabular-nums">{{ formatDate(header.date) }}</b></p>
        </div>
      </div>
      <p v-if="header.description" class="mb-4 text-sm">{{ t('journal.statement') }}: {{ header.description }}</p>
      <div class="soft-table overflow-x-auto"><table class="w-full text-sm">
        <thead class="text-muted-foreground border-b">
          <tr>
            <th class="py-2 text-start font-medium">#</th>
            <th class="py-2 text-start font-medium">{{ t('journal.account') }}</th>
            <th class="py-2 text-start font-medium">{{ t('journal.costCenter') }}</th>
            <th class="py-2 text-start font-medium">{{ t('journal.lineStatement') }}</th>
            <th class="py-2 text-end font-medium">{{ t('ledger.debit') }}</th>
            <th class="py-2 text-end font-medium">{{ t('ledger.credit') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(l, i) in lines" :key="i" class="border-b">
            <td class="py-2 tabular-nums">{{ i + 1 }}</td>
            <td class="py-2"><span dir="ltr" class="tabular-nums">{{ accCode(l.account) }}</span> — {{ accName(l.account) }}</td>
            <td class="py-2">{{ ccName(l.costCenter) || '—' }}</td>
            <td class="py-2">{{ l.description || '—' }}</td>
            <td class="py-2 text-end tabular-nums">{{ l.debit ? sar(l.debit, { decimals: 2 }) : '' }}</td>
            <td class="py-2 text-end tabular-nums">{{ l.credit ? sar(l.credit, { decimals: 2 }) : '' }}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr class="font-semibold">
            <td colspan="4" class="py-2">{{ t('common.total') }}</td>
            <td class="py-2 text-end tabular-nums">{{ sar(totalDebit, { decimals: 2 }) }}</td>
            <td class="py-2 text-end tabular-nums">{{ sar(totalCredit, { decimals: 2 }) }}</td>
          </tr>
        </tfoot>
      </table></div>
      <div class="mt-10 flex justify-between text-xs">
        <span>{{ t('journal.createdBy') }}: {{ header.createdBy || '—' }}</span>
        <div class="text-center"><div class="bg-foreground/40 h-px w-48" /><p class="text-muted-foreground mt-1">{{ t('reports.signature') }}</p></div>
      </div>
    </div>

    <!-- search dialog -->
    <Dialog v-model:open="searchOpen" :title="t('journal.searchTitle')" :description="yearName" :icon="Search">
      <form class="space-y-4" @submit.prevent="doSearch">
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="space-y-1.5">
            <label class="text-sm font-medium">{{ t('journal.serial') }}</label>
            <Input v-model="search.serial" type="number" min="1" dir="ltr" />
          </div>
          <div class="space-y-1.5">
            <label class="text-sm font-medium">{{ t('journal.docNo') }}</label>
            <Input v-model="search.docNo" dir="ltr" placeholder="JV-2026-0004" />
          </div>
        </div>
        <p class="text-muted-foreground text-xs">{{ t('journal.searchHint') }}</p>
      </form>
      <template #footer>
        <Button variant="ghost" @click="searchOpen = false">{{ t('common.cancel') }}</Button>
        <Button :disabled="searching" @click="doSearch"><Search /> {{ t('journal.search') }}</Button>
      </template>
    </Dialog>



  </div>
</template>
