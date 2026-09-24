<script setup>
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowLeft, Save, Printer, Search, FilePlus2, Copy, RefreshCw, Plus, Trash2, Check, AlertTriangle, Lock, X, Ban,
  Keyboard, CornerDownLeft, Equal, Hash, Sparkles,
  FileText, CalendarDays, CalendarRange, AlignRight, ListOrdered, Repeat2, Calculator,
} from 'lucide-vue-next'
import { useConfirm } from '@/composables/useConfirm'
import PageHeader from '@/components/common/PageHeader.vue'
import BrandLogo from '@/components/common/BrandLogo.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import QuickPick from '@/components/journal/QuickPick.vue'
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

/* General journal entry — keyboard-first.
   The cursor starts in the account field of the new line. Account and cost
   center are search fields (type digits or letters, ↑/↓, Enter). Enter walks
   account → cost center → debit (empty? → credit) → description → Enter adds
   the line and opens the next one, which keeps the cost center and the
   description. "=" in an amount fills what balances the entry; amounts accept
   arithmetic (120*3). Enter on an empty new line of a balanced entry saves it
   and opens a new entry that keeps the date, document type, year, statement
   and last cost center. Ctrl+S saves · Ctrl+Enter saves and starts a new one ·
   Alt+↑ pulls the last line back up · Esc clears the new line · Alt+N new.
   Fixes kept from the Toby spec: no date clamp, search needs a fiscal year,
   totals not swapped, unsaved changes ask first, date must fall in the year. */

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
  accounts.value
    .filter((a) => !a.isGroup && a.active !== false)
    .map((a) => ({ value: a.id, code: a.code, label: locale.value === 'ar' ? a.name : a.en, hint: t(`accounting.types.${a.type}`) })),
)
const centerOptions = computed(() => centers.value.filter((c) => c.active).map((c) => ({ value: c.id, code: c.code ?? '', label: c.name })))
const docTypeOptions = computed(() => docTypes.value.map((d) => ({ value: d.id, label: locale.value === 'ar' ? d.name : d.en, hint: d.prefix })))
const yearOptions = computed(() => years.value.map((y) => ({ value: y.id, label: locale.value === 'ar' ? y.name : y.en, hint: y.closed ? t('journal.yearClosed') : `${y.dateFrom} → ${y.dateTo}`, disabled: y.closed })))
const defaultYear = () => (years.value.find((y) => y.isDefault) ?? years.value[years.value.length - 1])?.id ?? ''
const accName = (id) => {
  const a = accounts.value.find((x) => x.id === id)
  return a ? (locale.value === 'ar' ? a.name : a.en) : ''
}
const accCode = (id) => accounts.value.find((x) => x.id === id)?.code ?? ''
const ccName = (id) => centers.value.find((c) => c.id === id)?.name ?? ''

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

/* a fresh entry; `carry` keeps what the next entry should start with */
function resetEntry(carry = null) {
  Object.assign(header, blankHeader(), carry?.header ?? {})
  lines.value = []
  Object.assign(entry, blankLine(), carry?.line ?? {})
  lastAdded.value = -1
  snapshot = snap()
  focus(accountEl)
}
function loadEntry(e) {
  Object.assign(header, { id: e.id, serial: e.serial, ref: e.ref, date: e.date, description: e.description, docType: e.docType, fiscalYear: e.fiscalYear, source: e.source, editable: e.editable, createdBy: e.createdBy, status: e.status, voidReason: e.voidReason ?? '' })
  lines.value = e.lines.map((l) => ({ account: l.account, costCenter: l.costCenter ?? '', debit: l.debit, credit: l.credit, description: l.description ?? '' }))
  Object.assign(entry, blankLine(), { costCenter: lines.value.at(-1)?.costCenter ?? '', description: lines.value.at(-1)?.description ?? '' })
  lastAdded.value = -1
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
  // the cursor waits in the account field of the new line
  if (!readOnly.value) focus(accountEl)
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

/* ── the new line (bottom row of the sheet) ─────────────── */
const blankLine = () => ({ account: '', costCenter: '', debit: '', credit: '', description: '' })
const entry = reactive(blankLine())
const accountEl = ref(null)
const centerEl = ref(null)
const debitEl = ref(null)
const creditEl = ref(null)
const descEl = ref(null)
const lastAdded = ref(-1)
const shake = ref('')
// focus once the DOM settles, and again a frame later if something else took it meanwhile
const focus = (r) =>
  nextTick(() => {
    r.value?.focus?.()
    requestAnimationFrame(() => {
      const el = r.value?.$el ?? r.value
      if (el instanceof HTMLElement && !el.contains(document.activeElement)) r.value?.focus?.()
    })
  })
// the template refers to fields by name (refs are unwrapped inside templates)
const fields = { account: accountEl, center: centerEl, debit: debitEl, credit: creditEl, desc: descEl }
const focusField = (name) => focus(fields[name])
/* show what is missing: a message, a short shake on the field, the cursor on it */
function nudge(field, msg) {
  if (msg) toast.error(msg)
  shake.value = ''
  requestAnimationFrame(() => requestAnimationFrame(() => (shake.value = field)))
  focusField(field)
}

/* amounts: Arabic digits, "," or "٫" as decimal point, and simple arithmetic */
function toNumber(v) {
  const s = String(v ?? '')
    .replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d))
    .replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d))
    .replace(/[٫,]/g, '.')
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/\s+/g, '')
  if (!s) return null
  if (!/^[0-9+\-*/().]+$/.test(s)) return NaN
  try {
    const n = Function(`"use strict"; return (${s})`)()
    return Number.isFinite(n) ? Math.round(n * 100) / 100 : NaN
  } catch {
    return NaN
  }
}

// one side per line: typing on one side clears the other
watch(() => entry.debit, (v) => { if (String(v ?? '').trim() !== '') entry.credit = '' })
watch(() => entry.credit, (v) => { if (String(v ?? '').trim() !== '') entry.debit = '' })

const totalDebit = computed(() => lines.value.reduce((s, l) => s + (Number(l.debit) || 0), 0))
const totalCredit = computed(() => lines.value.reduce((s, l) => s + (Number(l.credit) || 0), 0))
const difference = computed(() => Math.round((totalDebit.value - totalCredit.value) * 100) / 100)
const balanced = computed(() => totalDebit.value > 0 && difference.value === 0)
const dockState = computed(() => (balanced.value ? 'ok' : lines.value.length ? 'off' : 'empty'))
const balanceFill = computed(() => {
  const hi = Math.max(totalDebit.value, totalCredit.value)
  return hi ? Math.round((Math.min(totalDebit.value, totalCredit.value) / hi) * 100) : 0
})

/* "=" fills the side and amount that balance the entry */
function fillBalance() {
  const d = difference.value
  if (!d) {
    toast.info(t('journal.nothingToBalance'))
    return
  }
  if (d > 0) Object.assign(entry, { credit: String(d), debit: '' })
  else Object.assign(entry, { debit: String(-d), credit: '' })
  focus(descEl)
}

function onAmountKey(side, e) {
  if (e.ctrlKey || e.metaKey || e.altKey) return // page shortcuts
  if (e.key === '=') {
    e.preventDefault()
    fillBalance()
    return
  }
  if (e.key === 'Escape') {
    e.preventDefault()
    escNewLine()
    return
  }
  if (e.key !== 'Enter') return
  e.preventDefault()
  const n = toNumber(entry[side])
  if (Number.isNaN(n)) return nudge(side, t('journal.errAmountFormat'))
  if (n !== null && n > 0) {
    entry[side] = String(n)
    return focus(descEl)
  }
  entry[side] = ''
  if (side === 'debit') return focus(creditEl)
  // both sides empty
  nudge('debit', t('journal.errAmount'))
}

function commitLine() {
  if (readOnly.value) return
  if (!entry.account) return nudge('account', t('journal.errPickAccount'))
  if (!entry.costCenter) return nudge('center', t('journal.errPickCenter'))
  const d = toNumber(entry.debit)
  const c = toNumber(entry.credit)
  if (Number.isNaN(d) || Number.isNaN(c)) return nudge('debit', t('journal.errAmountFormat'))
  if (!(d > 0) && !(c > 0)) return nudge('debit', t('journal.errAmount'))
  lines.value.push({ account: entry.account, costCenter: entry.costCenter, debit: d > 0 ? d : 0, credit: c > 0 ? c : 0, description: entry.description.trim() })
  lastAdded.value = lines.value.length - 1
  // the next line keeps the cost center and the description
  Object.assign(entry, { account: '', debit: '', credit: '' })
  focus(accountEl)
}
function onDescKey(e) {
  if (e.ctrlKey || e.metaKey || e.altKey) return // page shortcuts
  if (e.key === 'Enter') {
    e.preventDefault()
    commitLine()
  } else if (e.key === 'Escape') {
    e.preventDefault()
    escNewLine()
  }
}
/* something typed in the new line (the clear button shows only then) */
const entryHasContent = computed(() => Object.values(entry).some((v) => String(v ?? '').trim() !== ''))
function clearLine() {
  Object.assign(entry, blankLine())
  focus(accountEl)
}
/* Enter on an empty new line: a balanced entry is saved and a new one opens */
function onEmptyEnter() {
  if (!lines.value.length) return nudge('account', t('journal.startHint'))
  if (!balanced.value) return nudge('account', t('journal.notBalancedEnter', { amount: sar(Math.abs(difference.value), { decimals: 2 }) }))
  saveAndNew()
}
/* Alt+↑: pull the last line back into the new line to fix it */
function editLast() {
  if (readOnly.value || !lines.value.length) return
  const l = lines.value.pop()
  Object.assign(entry, { account: l.account, costCenter: l.costCenter, debit: l.debit ? String(l.debit) : '', credit: l.credit ? String(l.credit) : '', description: l.description })
  lastAdded.value = -1
  focus(accountEl)
}

function removeLine(i) {
  lines.value.splice(i, 1)
  lastAdded.value = -1
}
/* account pickers of the saved lines, by index, to move the cursor up to them */
/* the fields of each saved line, by index, so the cursor can move between them */
const rowEls = []
const setRowEl = (i, name, el) => {
  if (!rowEls[i]) rowEls[i] = {}
  rowEls[i][name] = el
}
function focusRowField(i, name) {
  nextTick(() => {
    const el = rowEls[i]?.[name]
    if (i >= 0 && i < lines.value.length && el) el.focus?.()
    else focus(accountEl)
  })
}
const focusRow = (i) => focusRowField(i, 'account')

/* Enter on a saved line walks it like the new line: account → cost center →
   debit (empty → credit) → description → the next line (or the new line) */
function rowAmountEnter(l, i, side, e) {
  if (e.ctrlKey || e.metaKey || e.altKey) return
  e.preventDefault()
  setAmount(l, side, e.target.value)
  if (side === 'debit' && !(l.debit > 0)) return focusRowField(i, 'credit')
  focusRowField(i, 'desc')
}
function rowDescEnter(i, e) {
  if (e.ctrlKey || e.metaKey || e.altKey) return
  e.preventDefault()
  focusRowField(i + 1, 'account')
}
/* Esc inside a saved line deletes it; the cursor goes up to the line before
   (the first line when the top one was removed, the new line when none are left) */
function escLine(i) {
  if (readOnly.value) return
  removeLine(i)
  rowEls.length = lines.value.length
  toast.info(t('journal.lineRemoved', { n: i + 1 }))
  focusRow(i > 0 ? i - 1 : 0)
}
/* Esc in the new line clears it and steps up to the last saved line */
function escNewLine() {
  Object.assign(entry, blankLine())
  if (lines.value.length) focusRow(lines.value.length - 1)
  else focus(accountEl)
}
/* inline edits on saved lines: one side per line, numbers (invalid → 0) */
function setAmount(l, side, v) {
  const n = toNumber(v)
  l[side] = n > 0 ? n : 0
  if (l[side] > 0) l[side === 'debit' ? 'credit' : 'debit'] = 0
}

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

/** Saves; resolves to the saved entry, or null when it could not. */
async function save({ quiet = false } = {}) {
  if (saving.value || readOnly.value) return null
  const err = validateJournalEntry(payload())
  if (err) {
    toast.error(t(ERR[err]))
    return null
  }
  saving.value = true
  try {
    const e = await saveJournalEntry(payload())
    loadEntry(e)
    if (!quiet) toast.success(t('journal.saved', { ref: e.ref }))
    if (!quiet && route.params.id !== e.id) router.replace(`/ledger/entry/${e.id}`)
    return e
  } catch (e) {
    toast.error(t(ERR[e.message] ?? 'journal.errGeneric'))
    return null
  } finally {
    saving.value = false
  }
}
/** Save, then open a new entry that keeps date, document type, year,
    statement, and the last cost center + description for its first line. */
async function saveAndNew() {
  const carry = {
    header: { date: header.date, docType: header.docType, fiscalYear: header.fiscalYear, description: header.description },
    line: { costCenter: lines.value.at(-1)?.costCenter ?? entry.costCenter, description: lines.value.at(-1)?.description ?? entry.description },
  }
  const e = await save({ quiet: true })
  if (!e) return
  toast.success(t('journal.savedNew', { ref: e.ref }))
  if (route.params.id) await router.replace('/ledger/entry')
  resetEntry(carry)
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

/* page-wide shortcuts (physical keys, so they work on an Arabic layout too) */
function onKey(e) {
  if (loading.value || searchOpen.value || document.querySelector('[data-sa-panel]')) return
  const mod = e.ctrlKey || e.metaKey
  if (mod && e.code === 'KeyS') {
    e.preventDefault()
    save()
  } else if (mod && e.key === 'Enter') {
    e.preventDefault()
    saveAndNew()
  } else if (e.altKey && e.code === 'KeyN') {
    e.preventDefault()
    startNew()
  } else if (e.altKey && e.key === 'ArrowUp') {
    e.preventDefault()
    editLast()
  }
}
onMounted(() => window.addEventListener('keydown', onKey))

/* key map: the used keys light up for a moment when pressed */
const lit = ref(new Set())
const KEY_OF = { Escape: 'Esc', '=': '=', ArrowUp: '↑', ArrowDown: '↓', Enter: 'Enter', Alt: 'Alt', Control: 'Ctrl', Meta: 'Ctrl' }
const litTimers = {}
function flashKey(e) {
  const k = KEY_OF[e.key] ?? (e.code === 'KeyS' && (e.ctrlKey || e.metaKey) ? 'S' : null)
  if (!k) return
  lit.value = new Set(lit.value).add(k)
  clearTimeout(litTimers[k])
  litTimers[k] = setTimeout(() => {
    const next = new Set(lit.value)
    next.delete(k)
    lit.value = next
  }, 380)
}
onMounted(() => window.addEventListener('keydown', flashKey))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', flashKey)
  Object.values(litTimers).forEach(clearTimeout)
})
// the mini keyboard: [label, used?, width]
const KEYMAP = [
  [['Esc', 1], ['1'], ['2'], ['3'], ['…'], ['=', 1], ['⌫', 0, 'w']],
  [['Ctrl', 1, 'w'], ['A'], ['S', 1], ['D'], ['…'], ['Enter', 1, 'xw']],
  [['Alt', 1, 'w'], ['', 0, 'xw'], ['↑', 1], ['↓', 1]],
]
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))

const docTypeName = computed(() => docTypeOptions.value.find((d) => d.value === header.docType)?.label ?? '')
const yearName = computed(() => yearOptions.value.find((y) => y.value === header.fiscalYear)?.label ?? '')
const SHORTCUTS = [
  { keys: ['Enter'], label: 'journal.kb.next' },
  { keys: ['↑', '↓'], label: 'journal.kb.pick' },
  { keys: ['='], label: 'journal.kb.balance' },
  { keys: ['Esc'], label: 'journal.kb.clear' },
  { keys: ['Alt', '↑'], label: 'journal.kb.editLast' },
  { keys: ['Ctrl', 'S'], label: 'journal.kb.save' },
  { keys: ['Ctrl', 'Enter'], label: 'journal.kb.saveNew' },
]
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
        <!-- one joined toolbar: create / find, then what applies to the open entry -->
        <div class="je-tools">
          <button type="button" class="je-tool is-icon" :title="t('journal.refresh')" @click="askRefresh"><RefreshCw class="size-4" :class="refreshing && 'animate-spin'" /></button>
          <i class="je-sep" />
          <button type="button" class="je-tool is-main" :title="'Alt + N'" @click="startNew"><FilePlus2 class="size-4" /> {{ t('journal.new') }}</button>
          <button type="button" class="je-tool" @click="openSearch"><Search class="size-4" /> {{ t('journal.show') }}</button>
          <i class="je-sep" />
          <button type="button" class="je-tool" :disabled="!header.id" @click="duplicate"><Copy class="size-4" /> {{ t('journal.duplicate') }}</button>
          <button type="button" class="je-tool" :disabled="!header.id" @click="print"><Printer class="size-4" /> {{ t('journal.print') }}</button>
          <template v-if="header.id && !readOnly">
            <i class="je-sep" />
            <button type="button" class="je-tool is-danger" @click="askVoid"><Ban class="size-4" /> {{ t('journal.void') }}</button>
          </template>
        </div>
      </template>
    </PageHeader>

    <div v-if="loading" class="space-y-4">
      <Skeleton class="h-32 rounded-2xl" />
      <Skeleton class="h-72 rounded-2xl" />
    </div>

    <div v-else class="no-print space-y-5">
      <!-- read-only notice for auto-posted / closed-year / voided entries -->
      <div v-if="header.status === 'voided'" class="bg-danger/10 text-danger flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm">
        <Ban class="size-4" /> {{ t('journal.voidedNotice', { reason: header.voidReason }) }}
      </div>
      <div v-else-if="readOnly" class="bg-muted/60 text-muted-foreground flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm">
        <Lock class="size-4" /> {{ t('journal.readOnly', { source: header.source }) }}
      </div>

      <!-- ── header: the entry's identity on one side, its fields on the other ── -->
      <Card class="je-doc" :data-state="header.id ? 'saved' : 'new'">
        <div class="je-doc-id">
          <span class="je-doc-ic"><FileText class="size-5" /></span>
          <div class="min-w-0">
            <p class="je-doc-lab">{{ t('journal.serial') }}</p>
            <p v-if="header.serial" class="je-doc-no" dir="ltr">#{{ header.serial }}</p>
            <p v-else class="je-doc-pending">{{ t('journal.afterSave') }}</p>
          </div>
          <div class="flex flex-wrap items-center gap-1.5">
            <span v-if="header.ref" class="je-chip" dir="ltr"><Hash class="size-3.5" />{{ header.ref }}</span>
            <Badge v-if="header.id" variant="success"><Check class="size-3" /> {{ t('journal.savedBadge') }}</Badge>
            <Badge v-else variant="warning"><Sparkles class="size-3" /> {{ t('journal.unsavedBadge') }}</Badge>
            <Badge v-if="dirty && header.id" variant="secondary">{{ t('journal.modified') }}</Badge>
          </div>
        </div>
        <div class="je-doc-fields">
          <div class="je-field">
            <label><FileText class="size-3.5" /> {{ t('journal.docType') }} <span class="text-danger">*</span></label>
            <Dropdown v-model="header.docType" :options="docTypeOptions" :disabled="readOnly" :placeholder="t('journal.docTypePh')" />
          </div>
          <div class="je-field">
            <label><CalendarRange class="size-3.5" /> {{ t('journal.fiscalYear') }} <span class="text-danger">*</span></label>
            <Dropdown v-model="header.fiscalYear" :options="yearOptions" :disabled="readOnly" searchable @change="focusField('account')" />
          </div>
          <div class="je-field">
            <label><CalendarDays class="size-3.5" /> {{ t('common.date') }}</label>
            <DatePicker v-model="header.date" :disabled="readOnly" :clearable="false" />
          </div>
          <div class="je-field is-wide">
            <label><AlignRight class="size-3.5" /> {{ t('journal.statement') }}</label>
            <Input v-model="header.description" :disabled="readOnly" :placeholder="t('ledger.form.descriptionPh')" class="border-border" @keydown.enter.prevent="focusField('account')" />
          </div>
        </div>
      </Card>

      <!-- ── the sheet: saved lines + the new line at the bottom ── -->
      <Card class="overflow-clip">
        <div class="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3.5">
          <div class="flex items-center gap-2.5">
            <span class="je-doc-ic is-sm"><ListOrdered class="size-4" /></span>
            <h2 class="font-bold">{{ t('journal.lines') }}</h2>
            <span class="je-chip tabular-nums">{{ t('journal.linesCount', { n: num(lines.length) }) }}</span>
          </div>
          <!-- key map: what each used key does, and a mini keyboard where they light up -->
          <div v-if="!readOnly" class="km hidden items-center gap-4 lg:flex" :aria-label="t('journal.kb.title')">
            <dl class="km-legend">
              <div v-for="s in SHORTCUTS" :key="s.label">
                <dt dir="ltr">{{ s.keys.join('+') }}</dt>
                <dd>{{ t(s.label) }}</dd>
              </div>
            </dl>
            <div class="km-board" aria-hidden="true">
              <div v-for="(row, r) in KEYMAP" :key="r" class="km-row">
                <span
                  v-for="(key, c) in row"
                  :key="c"
                  class="km-key"
                  :class="[key[1] && 'is-hot', key[2] && `is-${key[2]}`, lit.has(key[0]) && 'is-lit']"
                >{{ key[0] }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="p-4">
        <div class="soft-table overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr>
                <th class="w-10 px-3 text-center">#</th>
                <th class="min-w-[260px] px-3 text-start">{{ t('journal.account') }}</th>
                <th class="min-w-[210px] px-3 text-start">{{ t('journal.costCenter') }}</th>
                <th class="w-36 px-3 text-end">{{ t('ledger.debit') }}</th>
                <th class="w-36 px-3 text-end">{{ t('ledger.credit') }}</th>
                <th class="min-w-[200px] px-3 text-start">{{ t('journal.lineStatement') }}</th>
                <th v-if="!readOnly" class="w-24" />
              </tr>
            </thead>
            <tbody>
              <!-- saved lines (still editable) -->
              <tr v-for="(l, i) in lines" :key="i" :class="i === lastAdded && 'je-new'">
                <td class="text-muted-foreground px-3 py-2 text-center text-xs tabular-nums">{{ i + 1 }}</td>
                <td class="px-2 py-1.5">
                  <QuickPick v-if="!readOnly" :ref="(el) => setRowEl(i, 'account', el)" v-model="l.account" :options="accountOptions" size="sm" @next="focusRowField(i, 'center')" @escape="escLine(i)" />
                  <span v-else class="flex items-center gap-2"><b dir="ltr" class="font-mono text-xs tabular-nums">{{ accCode(l.account) }}</b>{{ accName(l.account) }}</span>
                </td>
                <td class="px-2 py-1.5">
                  <QuickPick v-if="!readOnly" :ref="(el) => setRowEl(i, 'center', el)" v-model="l.costCenter" :options="centerOptions" size="sm" @next="focusRowField(i, 'debit')" @escape="escLine(i)" />
                  <span v-else class="text-muted-foreground">{{ ccName(l.costCenter) || '—' }}</span>
                </td>
                <td class="px-2 py-1.5">
                  <input v-if="!readOnly" :ref="(el) => setRowEl(i, 'debit', el)" :value="l.debit || ''" inputmode="decimal" dir="ltr" class="je-amount h-9" placeholder="—" @change="setAmount(l, 'debit', $event.target.value)" @keydown.enter="rowAmountEnter(l, i, 'debit', $event)" @keydown.esc.prevent="escLine(i)" />
                  <span v-else class="block text-end tabular-nums">{{ l.debit ? sar(l.debit, { decimals: 2 }) : '' }}</span>
                </td>
                <td class="px-2 py-1.5">
                  <input v-if="!readOnly" :ref="(el) => setRowEl(i, 'credit', el)" :value="l.credit || ''" inputmode="decimal" dir="ltr" class="je-amount h-9" placeholder="—" @change="setAmount(l, 'credit', $event.target.value)" @keydown.enter="rowAmountEnter(l, i, 'credit', $event)" @keydown.esc.prevent="escLine(i)" />
                  <span v-else class="block text-end tabular-nums">{{ l.credit ? sar(l.credit, { decimals: 2 }) : '' }}</span>
                </td>
                <td class="px-2 py-1.5">
                  <input v-if="!readOnly" :ref="(el) => setRowEl(i, 'desc', el)" v-model="l.description" class="je-text h-9" @keydown.enter="rowDescEnter(i, $event)" @keydown.esc.prevent="escLine(i)" />
                  <span v-else class="text-muted-foreground">{{ l.description || '—' }}</span>
                </td>
                <td v-if="!readOnly" class="px-1 py-1.5">
                  <button type="button" class="hover:bg-danger/10 text-muted-foreground hover:text-danger grid size-8 cursor-pointer place-items-center rounded-lg" :title="t('common.delete')" @click="removeLine(i)"><Trash2 class="size-4" /></button>
                </td>
              </tr>

              <!-- the new line: where the keyboard lives -->
              <tr v-if="!readOnly" class="je-entry">
                <td class="px-3 py-2 text-center"><span class="bg-primary text-primary-foreground grid size-6 place-items-center rounded-full"><Plus class="size-3.5" /></span></td>
                <td class="px-2 py-2" :class="shake === 'account' && 'je-shake'">
                  <QuickPick
                    ref="accountEl"
                    v-model="entry.account"
                    :options="accountOptions"
                    :placeholder="t('journal.accountTypePh')"
                    @next="focusField('center')"
                    @enter-empty="onEmptyEnter"
                    @escape="escNewLine"
                  />
                </td>
                <td class="px-2 py-2" :class="shake === 'center' && 'je-shake'">
                  <QuickPick
                    ref="centerEl"
                    v-model="entry.costCenter"
                    :options="centerOptions"
                    :placeholder="t('journal.centerTypePh')"
                    @next="focusField('debit')"
                    @enter-empty="nudge('center', t('journal.errPickCenter'))"
                    @escape="escNewLine"
                  />
                </td>
                <td class="px-2 py-2" :class="shake === 'debit' && 'je-shake'">
                  <input ref="debitEl" v-model="entry.debit" inputmode="decimal" dir="ltr" class="je-amount h-11" :placeholder="t('ledger.debit')" @keydown="onAmountKey('debit', $event)" />
                </td>
                <td class="px-2 py-2" :class="shake === 'credit' && 'je-shake'">
                  <input ref="creditEl" v-model="entry.credit" inputmode="decimal" dir="ltr" class="je-amount h-11" :placeholder="t('ledger.credit')" @keydown="onAmountKey('credit', $event)" />
                </td>
                <td class="px-2 py-2">
                  <input ref="descEl" v-model="entry.description" class="je-text h-11" :placeholder="t('common.optional')" @keydown="onDescKey" />
                </td>
                <td class="px-1 py-2">
                  <div class="flex items-center justify-end gap-1.5">
                    <!-- clear what is typed in the new line (same as Esc) -->
                    <button
                      v-if="entryHasContent"
                      type="button"
                      class="je-clear hover:bg-danger/10 text-muted-foreground hover:text-danger grid size-9 cursor-pointer place-items-center rounded-lg border"
                      :title="t('journal.kb.clear') + ' (Esc)'"
                      @click="clearLine"
                    ><X class="size-4" /></button>
                    <button type="button" class="bg-primary text-primary-foreground hover:bg-primary/90 grid size-9 cursor-pointer place-items-center rounded-lg" :title="t('journal.add') + ' (Enter)'" @click="commitLine"><CornerDownLeft class="size-4" /></button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        </div>

        <!-- what the next line inherits, and how to get going -->
        <div v-if="!readOnly" class="je-hints">
          <span v-if="!lines.length" class="is-lead"><Keyboard class="size-3.5" /> {{ t('journal.startHint') }}</span>
          <span v-if="entry.costCenter || entry.description"><Repeat2 class="size-3.5" /> {{ t('journal.carryHint') }}</span>
          <span><Calculator class="size-3.5" /> {{ t('journal.calcHint') }}</span>
        </div>
        <EmptyState v-if="readOnly && !lines.length" compact :title="t('journal.noLines')" />

        <div v-if="warnings.length" class="space-y-1 border-t px-4 py-3">
          <p v-for="w in warnings" :key="w" class="bg-warning/12 text-warning-foreground flex items-start gap-2 rounded-lg px-3 py-2 text-xs">
            <AlertTriangle class="mt-0.5 size-3.5 shrink-0" /> {{ w }}
          </p>
        </div>

        <!-- ── totals + save: the sheet's own footer, pinned while you type ── -->
        <div class="sf" :data-state="dockState">
          <div class="sf-sum">
            <span class="sf-tot">
              <i class="sf-dot is-dr" />{{ t('journal.totalDebit') }}
              <b dir="ltr">{{ sar(totalDebit, { decimals: 2 }) }}</b>
            </span>
            <span class="sf-tot">
              <i class="sf-dot is-cr" />{{ t('journal.totalCredit') }}
              <b dir="ltr">{{ sar(totalCredit, { decimals: 2 }) }}</b>
            </span>
            <span v-if="dockState !== 'empty'" class="sf-state">
              <Check v-if="dockState === 'ok'" class="size-3.5" />
              <AlertTriangle v-else class="size-3.5" />
              <template v-if="dockState === 'ok'">{{ t('journal.balancedFull') }}</template>
              <template v-else>{{ t('journal.differenceShort', { amount: sar(Math.abs(difference), { decimals: 2 }) }) }}</template>
            </span>
            <button v-if="dockState === 'off' && !readOnly" type="button" class="sf-bal" :title="t('journal.kb.balance') + ' (=)'" @click="fillBalance">
              <Equal class="size-3.5" /> {{ t('journal.balanceBtn') }}
            </button>
          </div>
          <div v-if="!readOnly" class="flex items-center gap-2">
            <button type="button" class="sf-btn" :disabled="saving" :title="'Ctrl + Enter'" @click="saveAndNew"><FilePlus2 class="size-4" /> {{ t('journal.saveNew') }}</button>
            <button type="button" class="sf-btn is-main" :disabled="saving" :title="'Ctrl + S'" @click="save"><Save class="size-4" /> {{ t('journal.save') }}</button>
          </div>
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
            <Input v-model="search.serial" type="number" min="1" dir="ltr" @keydown.enter.prevent="doSearch" />
          </div>
          <div class="space-y-1.5">
            <label class="text-sm font-medium">{{ t('journal.docNo') }}</label>
            <Input v-model="search.docNo" dir="ltr" placeholder="JV-2026-0004" @keydown.enter.prevent="doSearch" />
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

<style scoped>
.je-chip { display: inline-flex; align-items: center; gap: 0.25rem; border-radius: 9999px; padding: 0.1rem 0.6rem; font-size: 12px; font-weight: 700; background: var(--muted); color: var(--foreground); font-variant-numeric: tabular-nums; }
/* page toolbar: one joined strip instead of loose buttons */
.je-tools { display: flex; flex-wrap: wrap; align-items: center; gap: 2px; padding: 3px; border-radius: 0.9rem; border: 1px solid var(--border); background: var(--card); }
.je-tool {
  display: inline-flex; align-items: center; gap: 0.4rem; height: 2.15rem; padding: 0 0.8rem; border-radius: 0.65rem; cursor: pointer;
  font-size: 13px; font-weight: 700; color: var(--foreground); white-space: nowrap; transition: background-color 0.15s, color 0.15s;
}
.je-tool:hover:not(:disabled) { background: var(--muted); }
.je-tool.is-icon { width: 2.15rem; padding: 0; justify-content: center; color: var(--muted-foreground); }
.je-tool.is-main { color: var(--primary); }
.je-tool.is-main:hover { background: color-mix(in srgb, var(--primary) 10%, transparent); }
.je-tool.is-danger { color: var(--danger); }
.je-tool.is-danger:hover { background: color-mix(in srgb, var(--danger) 10%, transparent); }
.je-tool:disabled { opacity: 0.4; cursor: not-allowed; }
.je-sep { width: 1px; height: 1.25rem; margin-inline: 2px; background: var(--border); }

/* entry header: identity panel + fields */
.je-doc { display: grid; grid-template-columns: 17rem minmax(0, 1fr); overflow: hidden; }
.je-doc-id {
  display: grid; grid-template-columns: auto minmax(0, 1fr); align-content: center; gap: 0.75rem 0.85rem; padding: 1.25rem;
  border-inline-end: 1px solid var(--border); background: color-mix(in srgb, var(--primary) 5%, var(--card));
}
.je-doc-id > :last-child { grid-column: 1 / -1; }
.je-doc[data-state='saved'] .je-doc-id { background: color-mix(in srgb, var(--success) 5%, var(--card)); }
.je-doc-ic { display: grid; place-items: center; width: 2.75rem; height: 2.75rem; border-radius: 0.85rem; flex: none; color: var(--primary); background: color-mix(in srgb, var(--primary) 13%, var(--card)); }
.je-doc-ic.is-sm { width: 2rem; height: 2rem; border-radius: 0.65rem; }
.je-doc[data-state='saved'] .je-doc-id .je-doc-ic { color: var(--success); background: color-mix(in srgb, var(--success) 14%, var(--card)); }
.je-doc-lab { font-size: 11px; font-weight: 800; color: var(--muted-foreground); }
.je-doc-no { font: 800 1.45rem/1.2 ui-monospace, 'IBM Plex Mono', monospace; letter-spacing: -0.01em; }
.je-doc-pending { font-size: 13px; font-weight: 700; color: var(--muted-foreground); }
.je-doc-fields { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)) minmax(0, 1.6fr); gap: 1rem; align-content: center; padding: 1.25rem; }
.je-field { display: grid; gap: 0.4rem; min-width: 0; }
.je-field > label { display: inline-flex; align-items: center; gap: 0.35rem; font-size: 12px; font-weight: 700; color: var(--muted-foreground); }
@media (max-width: 80rem) {
  .je-doc { grid-template-columns: 1fr; }
  .je-doc-id { border-inline-end: 0; border-bottom: 1px solid var(--border); grid-template-columns: auto auto minmax(0, 1fr); align-items: center; }
  .je-doc-id > :last-child { grid-column: auto; justify-self: end; }
  .je-doc-fields { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .je-field.is-wide { grid-column: 1 / -1; }
}
@media (max-width: 40rem) {
  .je-doc-id { grid-template-columns: auto minmax(0, 1fr); }
  .je-doc-id > :last-child { grid-column: 1 / -1; justify-self: start; }
  .je-doc-fields { grid-template-columns: 1fr; }
}

/* hints under the sheet */
.je-hints { display: flex; flex-wrap: wrap; align-items: center; gap: 0.4rem; padding: 0.7rem 1.25rem; border-top: 1px solid var(--border); font-size: 12px; color: var(--muted-foreground); }
.je-hints > span { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.2rem 0.7rem; border-radius: 9999px; background: var(--muted); }
.je-hints > span.is-lead { color: var(--primary); font-weight: 700; background: color-mix(in srgb, var(--primary) 10%, transparent); }

.je-kbd { display: inline-block; min-width: 1.35rem; padding: 0 0.3rem; border: 1px solid var(--border); border-bottom-width: 2px; border-radius: 5px; background: var(--card); color: var(--foreground); font-size: 10.5px; font-weight: 700; text-align: center; line-height: 1.35rem; }

/* inputs on the sheet */
.je-amount, .je-text {
  width: 100%; border-radius: 0.5rem; border: 1px solid var(--border); background: var(--card);
  padding-inline: 0.65rem; font-size: 0.875rem; outline: none; transition: border-color 0.15s, background-color 0.15s;
}
.je-amount { text-align: end; font-variant-numeric: tabular-nums; font-weight: 700; }
.je-amount:hover, .je-text:hover { border-color: color-mix(in srgb, var(--primary) 40%, var(--border)); }
.je-amount:focus, .je-text:focus { border-color: var(--primary); }

/* the new line: tinted strip with an orange edge */
.je-entry > td { background: color-mix(in srgb, var(--primary) 6%, var(--card)) !important; }
.je-entry > td:first-child { box-shadow: inset 3px 0 0 var(--primary); }
[dir='rtl'] .je-entry > td:first-child { box-shadow: inset -3px 0 0 var(--primary); }

/* a line that was just added glows once */
.je-new > td { animation: je-flash 1.2s ease-out; }
@keyframes je-flash { from { background: color-mix(in srgb, var(--success) 20%, var(--card)); } }

/* a field that needs attention gives a short shake */
.je-shake { animation: je-shake 0.35s ease; }
@keyframes je-shake { 20% { translate: -4px 0; } 40% { translate: 4px 0; } 60% { translate: -3px 0; } 80% { translate: 2px 0; } }

/* sheet footer: totals, balance state and save in one slim bar at the bottom
   of the lines card; it stays pinned to the bottom of the screen while you type */
.sf {
  position: sticky; bottom: 0; z-index: 5; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 0.75rem 1.25rem;
  padding: 0.75rem 1.25rem; border-top: 1px solid var(--border); background: var(--card);
}
.sf::before { content: ''; position: absolute; inset-inline: 0; top: -1px; height: 2px; background: transparent; transition: background-color 0.3s; }
.sf[data-state='ok']::before { background: var(--success); }
.sf[data-state='off']::before { background: var(--warning); }
.sf-sum { display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem 1.5rem; }
.sf-tot { display: inline-flex; align-items: center; gap: 0.5rem; font-size: 12px; font-weight: 700; color: var(--muted-foreground); }
.sf-tot b { font-size: 1.05rem; font-weight: 900; color: var(--foreground); font-variant-numeric: tabular-nums; }
.sf-dot { width: 0.55rem; height: 0.55rem; border-radius: 0.2rem; }
.sf-dot.is-dr { background: var(--brand); }
.sf-dot.is-cr { background: var(--primary); }
.sf-state {
  display: inline-flex; align-items: center; gap: 0.35rem; height: 1.85rem; padding: 0 0.75rem; border-radius: 9999px;
  font-size: 12px; font-weight: 800; font-variant-numeric: tabular-nums; transition: background-color 0.3s, color 0.3s;
}
.sf[data-state='ok'] .sf-state { background: var(--success); color: white; }
.sf[data-state='off'] .sf-state { background: color-mix(in srgb, var(--warning) 16%, var(--card)); color: var(--warning-foreground); }
.sf-bal {
  display: inline-flex; align-items: center; gap: 0.3rem; height: 1.85rem; padding: 0 0.7rem; border-radius: 9999px; cursor: pointer;
  font-size: 12px; font-weight: 800; border: 1px solid var(--border); background: var(--card); transition: border-color 0.15s, color 0.15s;
}
.sf-bal:hover { border-color: var(--primary); color: var(--primary); }
.sf-btn {
  display: inline-flex; align-items: center; gap: 0.4rem; height: 2.4rem; padding: 0 1rem; border-radius: 0.75rem; cursor: pointer;
  font-size: 13px; font-weight: 800; white-space: nowrap; border: 1px solid var(--border); background: var(--card); transition: border-color 0.15s, background-color 0.15s;
}
.sf-btn:hover:not(:disabled) { border-color: var(--primary); }
.sf-btn.is-main { padding: 0 1.4rem; background: var(--primary); border-color: var(--primary); color: var(--primary-foreground); }
.sf-btn.is-main:hover:not(:disabled) { background: color-mix(in srgb, var(--primary) 88%, black); }
.sf-btn:disabled { opacity: 0.6; cursor: progress; }
@media (max-width: 40rem) {
  .sf > div:last-child { width: 100%; }
  .sf-btn { flex: 1; justify-content: center; }
}
@media (prefers-reduced-motion: reduce) { .sf-state, .sf::before { transition: none; } }

@media (prefers-reduced-motion: reduce) { .je-new > td, .je-shake { animation: none; } }

/* key map */
/* all shortcuts in one row, each in its own chip */
.km-legend { display: flex; align-items: center; gap: 0.5rem; margin: 0; font-size: 13px; font-weight: 600; color: var(--muted-foreground); }
.km-legend > div {
  display: inline-flex; align-items: center; gap: 0.45rem; white-space: nowrap; height: 2rem; padding: 0 0.75rem;
  border-radius: 9999px; background: var(--card); border: 1px solid var(--border); transition: border-color 0.15s;
}
.km-legend > div:hover { border-color: color-mix(in srgb, var(--primary) 40%, var(--border)); }
.km-legend dt {
  font: 800 12px ui-monospace, 'IBM Plex Mono', monospace; color: var(--primary);
  padding: 0.1rem 0.4rem; border-radius: 0.4rem; background: color-mix(in srgb, var(--primary) 10%, var(--card));
}
.km-legend dd { margin: 0; }
.km-board { display: grid; gap: 4px; padding: 7px; border-radius: 0.9rem; background: var(--muted); }
.km-row { display: flex; justify-content: center; gap: 4px; }
.km-key {
  display: inline-grid; place-items: center; min-width: 1.6rem; height: 1.6rem; padding: 0 0.3rem; border-radius: 0.4rem;
  font: 700 10px ui-monospace, 'IBM Plex Mono', monospace; color: var(--muted-foreground);
  background: var(--card); border: 1px solid var(--border); border-bottom-width: 2px;
  transition: transform 0.12s ease, background-color 0.2s, color 0.2s, border-color 0.2s;
}
.km-key.is-w { min-width: 3.2rem; } .km-key.is-xw { min-width: 4.6rem; }
.km-key.is-hot { color: var(--primary); background: color-mix(in srgb, var(--primary) 9%, var(--card)); border-color: color-mix(in srgb, var(--primary) 35%, var(--border)); }
/* pressed: the key dips and fills orange for a moment */
.km-key.is-lit { background: var(--primary); color: var(--primary-foreground); border-color: var(--primary); transform: translateY(1px); border-bottom-width: 1px; }
@media (prefers-reduced-motion: reduce) { .km-key { transition: none; } }
</style>
