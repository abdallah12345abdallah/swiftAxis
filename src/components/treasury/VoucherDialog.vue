<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Info, Users, Truck, BookOpen, Plus, Trash2 } from 'lucide-vue-next'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { DatePicker } from '@/components/ui/datepicker'
import { Dropdown } from '@/components/ui/dropdown'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Tabs } from '@/components/ui/tabs'
import { useToast } from '@/composables/useToast'
import { useCurrency } from '@/composables/useCurrency'
import { useDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import { createReceipt, createPayment, fetchOpenPurchaseInvoices } from '@/api/treasury'
import { fetchContracts } from '@/api/riders'
import { fetchSuppliers } from '@/api/purchases'

/* Receipt (money in) or payment (money out) voucher. The counterparty is a
   customer (a contract company → receivables), a supplier (→ suppliers
   payable) or an account.
   Payments:
   - to a supplier: one of that supplier's unpaid purchase invoices must be
     picked; the amount starts at what is left on it and can't exceed it.
   - by account: one or more expense lines (item, amount, cost center, note);
     each item brings its GL account, and the voucher amount is their total.
     The cost center per line is how the warehouse charges a vehicle (#6). */
const props = defineProps({
  open: { type: Boolean, default: false },
  mode: { type: String, default: 'payment' }, // receipt | payment
  treasuryOptions: { type: Array, default: () => [] },
  accountOptions: { type: Array, default: () => [] }, // postable, non-treasury accounts
  expenseItemOptions: { type: Array, default: () => [] }, // { value, label, account }
  costCenterOptions: { type: Array, default: () => [] },
  defaultTreasury: { type: String, default: '' },
})
const emit = defineEmits(['update:open', 'saved'])

const { t } = useI18n()
const toast = useToast()
const { sar, num } = useCurrency()
const { formatDate } = useDate()
const isPayment = computed(() => props.mode === 'payment')
const saving = ref(false)

const today = () => new Date().toISOString().slice(0, 10)
const blankLine = () => ({ expenseItem: '', amount: '', costCenter: '', note: '' })
const blank = () => ({
  treasuryId: props.defaultTreasury || props.treasuryOptions[0]?.value || '',
  date: today(),
  amount: '',
  partyType: isPayment.value ? 'supplier' : 'customer',
  partyId: '',
  party: '',
  account: isPayment.value ? 'general_expense' : 'delivery_revenue',
  purchaseId: '',
  lines: [blankLine()],
  costCenter: '',
  description: '',
})
const form = reactive(blank())
const errors = reactive({})
const lineErrors = ref([])

/* counterparties: loaded when the dialog opens */
const customers = ref([])
const suppliers = ref([])
async function loadParties() {
  ;[customers.value, suppliers.value] = await Promise.all([fetchContracts(), fetchSuppliers()])
}

const partyTabs = computed(() => [
  { value: 'customer', label: t('treasury.voucher.partyTypes.customer'), icon: Users },
  { value: 'supplier', label: t('treasury.voucher.partyTypes.supplier'), icon: Truck },
  { value: 'account', label: t('treasury.voucher.partyTypes.account'), icon: BookOpen },
])
const customerOptions = computed(() => customers.value.filter((c) => c.active).map((c) => ({ value: c.id, label: c.company })))
const supplierOptions = computed(() => suppliers.value.filter((s) => s.active).map((s) => ({ value: s.id, label: s.name, hint: s.taxNo })))
const ccOptions = computed(() => [{ value: '', label: t('treasury.voucher.costCenterPh') }, ...props.costCenterOptions])

/* supplier payment: the supplier's purchase invoices that still have a balance */
const invoices = ref([])
const invoicesLoading = ref(false)
const invoiceOptions = computed(() =>
  invoices.value.map((p) => ({
    value: p.id,
    label: p.invoiceNo && p.invoiceNo !== '—' ? p.invoiceNo : p.ref,
    hint: `${formatDate(p.date)} · ${t('treasury.voucher.remaining')} ${sar(p.remaining)}`,
  })),
)
const invoice = computed(() => invoices.value.find((p) => p.id === form.purchaseId) ?? null)
const needsInvoice = computed(() => isPayment.value && form.partyType === 'supplier')

/* payment by account = expense lines; the voucher amount is their total */
const byLines = computed(() => isPayment.value && form.partyType === 'account')
const linesTotal = computed(() => form.lines.reduce((s, l) => s + (Number(l.amount) || 0), 0))
const itemAccount = (id) => props.expenseItemOptions.find((i) => i.value === id)?.account
function addLine() {
  const last = form.lines[form.lines.length - 1]
  // a new line keeps the previous line's cost center
  form.lines.push({ ...blankLine(), costCenter: last?.costCenter ?? '' })
}
function removeLine(i) {
  if (form.lines.length > 1) form.lines.splice(i, 1)
}

/* the account the voucher will post against (shown so the choice is clear) */
const CONTROL = { customer: 'receivables', supplier: 'suppliers' }
const postingAccount = computed(() => CONTROL[form.partyType] ?? form.account)
const postingLabel = computed(() => props.accountOptions.find((a) => a.value === postingAccount.value)?.label ?? postingAccount.value ?? '—')

watch(
  () => props.open,
  (v) => {
    if (!v) return
    Object.assign(form, blank())
    Object.keys(errors).forEach((k) => delete errors[k])
    lineErrors.value = []
    invoices.value = []
    loadParties()
  },
)
// switching the party type clears the previous pick
watch(
  () => form.partyType,
  () => {
    form.partyId = ''
    form.purchaseId = ''
    delete errors.partyId
    delete errors.account
    delete errors.purchaseId
  },
)
watch(
  () => [form.partyType, form.partyId],
  async ([type, id]) => {
    form.purchaseId = ''
    invoices.value = []
    if (!isPayment.value || type !== 'supplier' || !id) return
    invoicesLoading.value = true
    invoices.value = await fetchOpenPurchaseInvoices(id)
    invoicesLoading.value = false
  },
)
// picking an invoice fills in what is left to pay on it
watch(
  () => form.purchaseId,
  () => {
    if (invoice.value) form.amount = invoice.value.remaining
    delete errors.purchaseId
    delete errors.amount
  },
)

function validate() {
  Object.keys(errors).forEach((k) => delete errors[k])
  lineErrors.value = []
  if (!form.treasuryId) errors.treasuryId = t('treasury.voucher.errTreasury')
  if (form.partyType !== 'account' && !form.partyId) errors.partyId = form.partyType === 'customer' ? t('treasury.voucher.errCustomer') : t('treasury.voucher.errSupplier')
  if (needsInvoice.value && form.partyId && !form.purchaseId) errors.purchaseId = t('treasury.voucher.errInvoice')
  if (byLines.value) {
    lineErrors.value = form.lines.map((l) => ({
      expenseItem: l.expenseItem ? '' : t('treasury.voucher.errItem'),
      amount: Number(l.amount) > 0 ? '' : t('treasury.voucher.errAmount'),
    }))
    if (lineErrors.value.some((e) => e.expenseItem || e.amount)) errors.lines = true
  } else {
    if (!(Number(form.amount) > 0)) errors.amount = t('treasury.voucher.errAmount')
    else if (invoice.value && Number(form.amount) > invoice.value.remaining) errors.amount = t('treasury.voucher.errExceeds', { v: sar(invoice.value.remaining) })
    if (!isPayment.value && form.partyType === 'account' && !form.account) errors.account = t('treasury.voucher.errAccount')
  }
  return Object.keys(errors).length === 0
}

async function submit() {
  if (saving.value || !validate()) return
  saving.value = true
  const base = {
    treasuryId: form.treasuryId,
    date: form.date,
    amount: byLines.value ? linesTotal.value : form.amount,
    partyType: form.partyType,
    partyId: form.partyType === 'account' ? null : form.partyId,
    party: form.partyType === 'account' ? form.party : '',
    description: form.description,
  }
  try {
    const row = isPayment.value
      ? await createPayment({
          ...base,
          costCenter: form.costCenter || null,
          ...(byLines.value ? { lines: form.lines.map((l) => ({ ...l })) } : {}),
          ...(needsInvoice.value ? { purchaseId: form.purchaseId } : {}),
        })
      : await createReceipt({ ...base, account: form.partyType === 'account' ? form.account : undefined })
    toast.success(t('treasury.voucher.saved', { ref: row.ref }))
    emit('saved')
    emit('update:open', false)
  } catch (e) {
    if (e.message === 'PARTY_REQUIRED') errors.partyId = t('common.required')
    else if (e.message === 'ACCOUNT_REQUIRED') errors.account = t('treasury.voucher.errAccount')
    else if (e.message === 'INVOICE_REQUIRED') errors.purchaseId = t('treasury.voucher.errInvoice')
    else if (e.message === 'EXCEEDS_INVOICE') errors.amount = t('treasury.voucher.errExceeds', { v: sar(invoice.value?.remaining ?? 0) })
    else if (e.message === 'ITEM_REQUIRED') errors.lines = true
    else errors.amount = t('treasury.voucher.errAmount')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <Dialog :open="open" size="lg" :title="isPayment ? t('treasury.voucher.newPayment') : t('treasury.voucher.newReceipt')" @update:open="emit('update:open', $event)">
    <form class="space-y-4" @submit.prevent="submit">
      <div class="grid gap-4 sm:grid-cols-3">
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('treasury.voucher.treasury') }}</label>
          <Dropdown v-model="form.treasuryId" :options="treasuryOptions" :invalid="!!errors.treasuryId" />
          <p v-if="errors.treasuryId" class="text-danger text-xs">{{ errors.treasuryId }}</p>
        </div>
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('common.date') }}</label>
          <DatePicker v-model="form.date" :clearable="false" />
        </div>
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('common.amount') }}</label>
          <div v-if="byLines" class="bg-muted/40 flex h-11 items-center rounded-xl px-3 font-semibold tabular-nums" dir="ltr">{{ sar(linesTotal) }}</div>
          <Input v-else v-model="form.amount" type="number" dir="ltr" :invalid="!!errors.amount" />
          <p v-if="errors.amount" class="text-danger text-xs">{{ errors.amount }}</p>
          <p v-else-if="byLines" class="text-muted-foreground text-xs">{{ t('treasury.voucher.linesTotalHint') }}</p>
        </div>
      </div>

      <!-- counterparty: customer / supplier / account -->
      <fieldset class="bg-muted/30 space-y-4 rounded-xl border p-4">
        <legend class="px-1 text-sm font-medium">{{ isPayment ? t('treasury.voucher.payTo') : t('treasury.voucher.receiveFrom') }}</legend>
        <Tabs v-model="form.partyType" :tabs="partyTabs" />

        <div class="grid gap-4 sm:grid-cols-2">
          <!-- customer -->
          <div v-if="form.partyType === 'customer'" class="space-y-1.5 sm:col-span-2">
            <label class="text-sm font-medium">{{ t('treasury.voucher.customer') }}</label>
            <Dropdown v-model="form.partyId" :options="customerOptions" :placeholder="t('treasury.voucher.customerPh')" :invalid="!!errors.partyId" />
            <p v-if="errors.partyId" class="text-danger text-xs">{{ errors.partyId }}</p>
          </div>

          <!-- supplier (+ the purchase invoice being paid) -->
          <template v-else-if="form.partyType === 'supplier'">
            <div :class="cn('space-y-1.5', !isPayment && 'sm:col-span-2')">
              <label class="text-sm font-medium">{{ t('treasury.voucher.supplier') }}</label>
              <Dropdown v-model="form.partyId" :options="supplierOptions" :placeholder="t('treasury.voucher.supplierPh')" :invalid="!!errors.partyId" searchable />
              <p v-if="errors.partyId" class="text-danger text-xs">{{ errors.partyId }}</p>
            </div>
            <div v-if="isPayment" class="space-y-1.5">
              <label class="text-sm font-medium">{{ t('treasury.voucher.invoiceNo') }}</label>
              <Dropdown
                v-model="form.purchaseId"
                :options="invoiceOptions"
                :placeholder="!form.partyId ? t('treasury.voucher.pickSupplierFirst') : invoicesLoading ? t('common.loading') : invoiceOptions.length ? t('treasury.voucher.invoicePh') : t('treasury.voucher.noOpenInvoices')"
                :disabled="!form.partyId || !invoiceOptions.length"
                :invalid="!!errors.purchaseId"
                searchable
              />
              <p v-if="errors.purchaseId" class="text-danger text-xs">{{ errors.purchaseId }}</p>
            </div>
            <div v-if="invoice" class="bg-card grid grid-cols-3 gap-2 rounded-lg border px-3 py-2 text-xs sm:col-span-2">
              <span><span class="text-muted-foreground block">{{ t('treasury.voucher.invoiceTotal') }}</span><b class="tabular-nums" dir="ltr">{{ sar(invoice.total) }}</b></span>
              <span><span class="text-muted-foreground block">{{ t('treasury.voucher.paidBefore') }}</span><b class="tabular-nums" dir="ltr">{{ sar(invoice.paid) }}</b></span>
              <span><span class="text-muted-foreground block">{{ t('treasury.voucher.remaining') }}</span><b class="text-primary tabular-nums" dir="ltr">{{ sar(invoice.remaining) }}</b></span>
            </div>
          </template>

          <!-- account -->
          <template v-else>
            <div v-if="!isPayment" class="space-y-1.5">
              <label class="text-sm font-medium">{{ t('treasury.voucher.account') }}</label>
              <Dropdown v-model="form.account" :options="accountOptions" :placeholder="t('treasury.voucher.accountPh')" :invalid="!!errors.account" />
              <p v-if="errors.account" class="text-danger text-xs">{{ errors.account }}</p>
            </div>
            <div :class="cn('space-y-1.5', isPayment && 'sm:col-span-2')">
              <label class="text-sm font-medium">{{ isPayment ? t('treasury.voucher.party') : t('treasury.voucher.payer') }} <span class="text-muted-foreground text-xs font-normal">({{ t('common.optional') }})</span></label>
              <Input v-model="form.party" />
            </div>
          </template>
        </div>

        <!-- expense lines (payment by account) -->
        <div v-if="byLines" class="space-y-2">
          <div class="flex items-center justify-between">
            <label class="text-sm font-medium">{{ t('treasury.voucher.lines') }}</label>
            <Button type="button" variant="outline" size="sm" @click="addLine"><Plus /> {{ t('treasury.voucher.addLine') }}</Button>
          </div>
          <div v-for="(l, i) in form.lines" :key="i" class="bg-card space-y-2 rounded-lg border p-3">
            <div class="flex items-start gap-2">
              <span class="bg-primary/10 text-primary mt-2.5 grid size-6 shrink-0 place-items-center rounded-md text-xs font-bold tabular-nums">{{ num(i + 1) }}</span>
              <div class="grid min-w-0 flex-1 gap-2 sm:grid-cols-[1.4fr_1fr]">
                <div class="space-y-1">
                  <Dropdown v-model="l.expenseItem" :options="expenseItemOptions" :placeholder="t('treasury.voucher.expenseItemPh')" :invalid="!!lineErrors[i]?.expenseItem" searchable />
                  <p v-if="lineErrors[i]?.expenseItem" class="text-danger text-xs">{{ lineErrors[i].expenseItem }}</p>
                </div>
                <div class="space-y-1">
                  <Input v-model="l.amount" type="number" min="0" step="0.01" dir="ltr" :placeholder="t('common.amount')" :invalid="!!lineErrors[i]?.amount" />
                  <p v-if="lineErrors[i]?.amount" class="text-danger text-xs">{{ lineErrors[i].amount }}</p>
                </div>
                <Dropdown v-model="l.costCenter" :options="ccOptions" />
                <Input v-model="l.note" :placeholder="t('treasury.voucher.lineNote')" />
              </div>
              <button
                type="button"
                class="hover:bg-accent text-muted-foreground hover:text-destructive mt-1 inline-flex size-9 shrink-0 items-center justify-center rounded-lg disabled:opacity-40"
                :disabled="form.lines.length <= 1"
                :aria-label="t('treasury.voucher.removeLine')"
                @click="removeLine(i)"
              >
                <Trash2 class="size-4" />
              </button>
            </div>
            <p v-if="l.expenseItem && itemAccount(l.expenseItem)" class="text-muted-foreground ps-8 text-xs">
              {{ t('treasury.voucher.linePosts', { account: accountOptions.find((a) => a.value === itemAccount(l.expenseItem))?.label ?? itemAccount(l.expenseItem) }) }}
            </p>
          </div>
          <div class="flex items-center justify-between px-1 text-sm font-semibold">
            <span>{{ t('treasury.voucher.linesTotal', { n: num(form.lines.length) }) }}</span>
            <span class="tabular-nums" dir="ltr">{{ sar(linesTotal) }}</span>
          </div>
        </div>

        <p v-if="!byLines" class="text-muted-foreground flex items-start gap-2 text-xs">
          <Info class="mt-0.5 size-3.5 shrink-0" />
          {{ isPayment ? t('treasury.voucher.postsDebit', { account: postingLabel }) : t('treasury.voucher.postsCredit', { account: postingLabel }) }}
        </p>
      </fieldset>

      <div v-if="isPayment && !byLines" class="space-y-1.5">
        <label class="text-sm font-medium">{{ t('treasury.voucher.costCenter') }}</label>
        <Dropdown v-model="form.costCenter" :options="ccOptions" />
        <p class="text-muted-foreground text-xs">{{ t('treasury.voucher.costCenterHint') }}</p>
      </div>

      <div class="space-y-1.5">
        <label class="text-sm font-medium">{{ t('treasury.voucher.description') }}</label>
        <Textarea v-model="form.description" :rows="2" />
      </div>
    </form>
    <template #footer>
      <Button variant="ghost" @click="emit('update:open', false)">{{ t('common.cancel') }}</Button>
      <Button :disabled="saving" @click="submit">{{ t('common.save') }}</Button>
    </template>
  </Dialog>
</template>
