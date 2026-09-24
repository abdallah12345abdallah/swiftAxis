<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Info, Users, Truck, BookOpen, FileText, Check } from 'lucide-vue-next'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { DatePicker } from '@/components/ui/datepicker'
import { Dropdown } from '@/components/ui/dropdown'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Tabs } from '@/components/ui/tabs'
import { useToast } from '@/composables/useToast'
import { useCurrency } from '@/composables/useCurrency'
import { cn } from '@/lib/utils'
import { createReceipt, createPayment } from '@/api/treasury'
import { fetchContracts } from '@/api/riders'
import { fetchSuppliers, fetchPurchases } from '@/api/purchases'

/* Receipt (money in) or payment (money out) voucher. The counterparty is a
   customer (a contract company → receivables), a supplier (→ suppliers
   payable) or any postable account. Paying by account may pick an expense
   item — its GL account is used — and any cost center, which is how the
   warehouse charges a vehicle (#6). A payment carries the purchase invoice
   number; for a supplier its recorded purchase invoices are suggested. */
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
const { sar } = useCurrency()
const isPayment = computed(() => props.mode === 'payment')
const saving = ref(false)

const today = () => new Date().toISOString().slice(0, 10)
const blank = () => ({
  treasuryId: props.defaultTreasury || props.treasuryOptions[0]?.value || '',
  date: today(),
  amount: '',
  partyType: isPayment.value ? 'supplier' : 'customer',
  partyId: '',
  party: '',
  account: isPayment.value ? 'general_expense' : 'delivery_revenue',
  expenseItem: '',
  costCenter: '',
  invoiceNo: '',
  description: '',
})
const form = reactive(blank())
const errors = reactive({})

/* counterparties: loaded when the dialog opens */
const customers = ref([])
const suppliers = ref([])
const purchases = ref([])
async function loadParties() {
  ;[customers.value, suppliers.value, purchases.value] = await Promise.all([fetchContracts(), fetchSuppliers(), fetchPurchases()])
}

const partyTabs = computed(() => [
  { value: 'customer', label: t('treasury.voucher.partyTypes.customer'), icon: Users },
  { value: 'supplier', label: t('treasury.voucher.partyTypes.supplier'), icon: Truck },
  { value: 'account', label: t('treasury.voucher.partyTypes.account'), icon: BookOpen },
])
const customerOptions = computed(() => customers.value.filter((c) => c.active).map((c) => ({ value: c.id, label: c.company })))
const supplierOptions = computed(() => suppliers.value.filter((s) => s.active).map((s) => ({ value: s.id, label: s.name, hint: s.taxNo })))
const itemOptions = computed(() => [{ value: '', label: t('treasury.voucher.noExpenseItem') }, ...props.expenseItemOptions])
const ccOptions = computed(() => [{ value: '', label: t('treasury.voucher.costCenterPh') }, ...props.costCenterOptions])
// the selected supplier's recorded purchase invoices, newest first
const supplierInvoices = computed(() =>
  form.partyType === 'supplier' && form.partyId
    ? purchases.value.filter((p) => p.supplierId === form.partyId && p.invoiceNo && p.invoiceNo !== '—').slice(0, 6)
    : [],
)

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
    loadParties()
  },
)
// switching the party type clears the previous pick
watch(
  () => form.partyType,
  () => {
    form.partyId = ''
    form.invoiceNo = ''
    delete errors.partyId
    delete errors.account
  },
)
watch(
  () => form.partyId,
  () => {
    if (form.partyType === 'supplier') form.invoiceNo = ''
  },
)
// an expense item brings its own GL account
watch(
  () => form.expenseItem,
  (id) => {
    const item = props.expenseItemOptions.find((i) => i.value === id)
    if (item?.account) form.account = item.account
  },
)

async function submit() {
  if (saving.value) return
  Object.keys(errors).forEach((k) => delete errors[k])
  if (!form.treasuryId) errors.treasuryId = t('treasury.voucher.errTreasury')
  if (!(Number(form.amount) > 0)) errors.amount = t('treasury.voucher.errAmount')
  if (form.partyType !== 'account' && !form.partyId) errors.partyId = form.partyType === 'customer' ? t('treasury.voucher.errCustomer') : t('treasury.voucher.errSupplier')
  if (form.partyType === 'account' && !form.account) errors.account = t('treasury.voucher.errAccount')
  if (Object.keys(errors).length) return
  saving.value = true
  const base = {
    treasuryId: form.treasuryId,
    date: form.date,
    amount: form.amount,
    partyType: form.partyType,
    partyId: form.partyType === 'account' ? null : form.partyId,
    party: form.partyType === 'account' ? form.party : '',
    account: form.partyType === 'account' ? form.account : undefined,
    description: form.description,
  }
  try {
    const row = isPayment.value
      ? await createPayment({ ...base, expenseItem: form.partyType === 'account' ? form.expenseItem || null : null, costCenter: form.costCenter || null, invoiceNo: form.invoiceNo })
      : await createReceipt(base)
    toast.success(t('treasury.voucher.saved', { ref: row.ref }))
    emit('saved')
    emit('update:open', false)
  } catch (e) {
    if (e.message === 'PARTY_REQUIRED') errors.partyId = t('common.required')
    else if (e.message === 'ACCOUNT_REQUIRED') errors.account = t('treasury.voucher.errAccount')
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
          <Input v-model="form.amount" type="number" dir="ltr" :invalid="!!errors.amount" />
          <p v-if="errors.amount" class="text-danger text-xs">{{ errors.amount }}</p>
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

          <!-- supplier -->
          <div v-else-if="form.partyType === 'supplier'" :class="cn('space-y-1.5', !isPayment && 'sm:col-span-2')">
            <label class="text-sm font-medium">{{ t('treasury.voucher.supplier') }}</label>
            <Dropdown v-model="form.partyId" :options="supplierOptions" :placeholder="t('treasury.voucher.supplierPh')" :invalid="!!errors.partyId" />
            <p v-if="errors.partyId" class="text-danger text-xs">{{ errors.partyId }}</p>
          </div>

          <!-- account -->
          <template v-else>
            <div class="space-y-1.5">
              <label class="text-sm font-medium">{{ t('treasury.voucher.account') }}</label>
              <Dropdown v-model="form.account" :options="accountOptions" :placeholder="t('treasury.voucher.accountPh')" :invalid="!!errors.account" />
              <p v-if="errors.account" class="text-danger text-xs">{{ errors.account }}</p>
            </div>
            <div class="space-y-1.5">
              <label class="text-sm font-medium">{{ isPayment ? t('treasury.voucher.party') : t('treasury.voucher.payer') }} <span class="text-muted-foreground text-xs font-normal">({{ t('common.optional') }})</span></label>
              <Input v-model="form.party" />
            </div>
            <div v-if="isPayment" class="space-y-1.5">
              <label class="text-sm font-medium">{{ t('treasury.voucher.expenseItem') }} <span class="text-muted-foreground text-xs font-normal">({{ t('common.optional') }})</span></label>
              <Dropdown v-model="form.expenseItem" :options="itemOptions" :placeholder="t('treasury.voucher.expenseItemPh')" />
            </div>
          </template>

          <!-- purchase invoice number (payments) -->
          <div v-if="isPayment" class="space-y-1.5">
            <label class="text-sm font-medium">{{ t('treasury.voucher.invoiceNo') }} <span class="text-muted-foreground text-xs font-normal">({{ t('common.optional') }})</span></label>
            <Input v-model="form.invoiceNo" dir="ltr" :placeholder="t('treasury.voucher.invoiceNoPh')" />
          </div>
        </div>

        <div v-if="supplierInvoices.length && isPayment" class="space-y-1.5">
          <p class="text-muted-foreground text-xs">{{ t('treasury.voucher.supplierInvoices') }}</p>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="p in supplierInvoices"
              :key="p.id"
              type="button"
              :aria-pressed="form.invoiceNo === p.invoiceNo"
              :class="cn(
                'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors motion-reduce:transition-none outline-none focus-visible:ring-4 focus-visible:ring-primary/30',
                form.invoiceNo === p.invoiceNo ? 'border-primary bg-primary/10 text-primary' : 'bg-card text-muted-foreground hover:text-foreground',
              )"
              @click="form.invoiceNo = p.invoiceNo"
            >
              <Check v-if="form.invoiceNo === p.invoiceNo" class="size-3.5" /><FileText v-else class="size-3.5" />
              <span dir="ltr" class="font-medium tabular-nums">{{ p.invoiceNo }}</span>
              <span class="tabular-nums opacity-80">· {{ sar(p.total) }}</span>
            </button>
          </div>
        </div>

        <p class="text-muted-foreground flex items-start gap-2 text-xs">
          <Info class="mt-0.5 size-3.5 shrink-0" />
          {{ isPayment ? t('treasury.voucher.postsDebit', { account: postingLabel }) : t('treasury.voucher.postsCredit', { account: postingLabel }) }}
        </p>
      </fieldset>

      <div v-if="isPayment" class="space-y-1.5">
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
