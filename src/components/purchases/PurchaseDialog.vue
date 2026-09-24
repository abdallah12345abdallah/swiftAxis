<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Plus, Trash2 } from 'lucide-vue-next'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { DatePicker } from '@/components/ui/datepicker'
import { Dropdown } from '@/components/ui/dropdown'
import { Switch } from '@/components/ui/switch'
import { FileDrop } from '@/components/ui/file-drop'
import { Button } from '@/components/ui/button'
import { useCurrency } from '@/composables/useCurrency'
import { useToast } from '@/composables/useToast'
import { computeLine, computeTotals, createPurchase } from '@/api/purchases'
import { fetchUnits } from '@/api/catalogs'

/* One purchase invoice, one or more items (partner: "I can buy more than one
   item"). Each line: an item from the catalog (or free text), qty, unit price
   and whether it is subject to VAT; "prices include VAT" applies to the whole
   invoice. Header fields stay as they were. */

const props = defineProps({
  open: { type: Boolean, default: false },
  supplierOptions: { type: Array, default: () => [] },
  costCenterOptions: { type: Array, default: () => [] },
  vehicleOptions: { type: Array, default: () => [] }, // [{ value, label, costCenter }]
  suppliers: { type: Array, default: () => [] }, // raw list (taxNo lookup)
  itemOptions: { type: Array, default: () => [] }, // purchase items catalog (#6): [{ value, label, hint, unit }]
})
const emit = defineEmits(['update:open', 'saved'])

const { t, locale } = useI18n()
const { sar, num } = useCurrency()
const toast = useToast()
const saving = ref(false)
const receipt = ref(null)
const OTHER = '__other__'
const today = () => new Date().toISOString().slice(0, 10)

const blankHeader = () => ({
  supplierId: '', date: today(), inclVat: false, vehicleId: '', costCenter: '', invoiceNo: '', supplierTaxNo: '',
})
let uid = 0
const blankLine = () => ({ key: ++uid, itemId: '', itemType: '', unit: '', qty: 1, unitPrice: '', taxable: true })

const form = reactive(blankHeader())
const lines = ref([blankLine()])
const errors = reactive({})
const lineErrors = ref({}) // key → { item?, qty?, unitPrice? }

const units = ref([])
const unitOptions = computed(() =>
  units.value.filter((u) => u.active !== false).map((u) => ({ value: u.code, label: `${u.code} — ${locale.value === 'ar' ? u.name : u.en}` })),
)
const unitLabel = (code) => {
  const u = units.value.find((x) => x.code === code)
  return u ? (locale.value === 'ar' ? u.name : u.en) : ''
}

watch(
  () => props.open,
  (v) => {
    if (!v) return
    Object.assign(form, blankHeader())
    lines.value = [blankLine()]
    receipt.value = null
    Object.keys(errors).forEach((k) => delete errors[k])
    lineErrors.value = {}
    if (!units.value.length) fetchUnits().then((u) => (units.value = u))
  },
)

// the supplier's registered tax no. prefills the invoice field; it stays editable (#6)
watch(
  () => form.supplierId,
  (id) => {
    form.supplierTaxNo = props.suppliers.find((s) => s.id === id)?.taxNo ?? ''
  },
)

const itemPickOptions = computed(() => [...props.itemOptions, { value: OTHER, label: t('purchases.fields.itemOther') }])
const catalogItem = (l) => (l.itemId && l.itemId !== OTHER ? props.itemOptions.find((o) => o.value === l.itemId) : null)
const lineUnit = (l) => unitLabel(catalogItem(l)?.unit ?? l.unit)

const lineTotals = computed(() => lines.value.map((l) => computeLine({ ...l, inclVat: form.inclVat })))
const totals = computed(() => computeTotals({ lines: lines.value, inclVat: form.inclVat }))
const anyTaxable = computed(() => lines.value.some((l) => l.taxable))

function addLine() {
  lines.value.push(blankLine())
}
function removeLine(i) {
  if (lines.value.length === 1) return
  const [gone] = lines.value.splice(i, 1)
  delete lineErrors.value[gone.key]
}

// vehicle chosen → cost center derived from it (#10)
const derivedCostCenter = computed(() => {
  if (!form.vehicleId) return null
  return props.vehicleOptions.find((v) => v.value === form.vehicleId)?.costCenter ?? null
})
const derivedCostCenterName = computed(() =>
  props.costCenterOptions.find((c) => c.value === derivedCostCenter.value)?.label ?? derivedCostCenter.value,
)

function validate() {
  Object.keys(errors).forEach((k) => delete errors[k])
  const le = {}
  if (!form.supplierId) errors.supplierId = t('common.required')
  if (form.supplierTaxNo && !/^3\d{13}3$/.test(form.supplierTaxNo.trim())) errors.supplierTaxNo = t('purchases.supplier.errTax')
  if (!form.vehicleId && !form.costCenter) errors.costCenter = t('common.required')
  lines.value.forEach((l) => {
    const e = {}
    if (!l.itemId || (l.itemId === OTHER && !l.itemType.trim())) e.item = true
    if (!(Number(l.qty) > 0)) e.qty = true
    if (!(Number(l.unitPrice) > 0)) e.unitPrice = true
    if (Object.keys(e).length) le[l.key] = e
  })
  lineErrors.value = le
  if (Object.keys(le).length) errors.lines = t('purchases.lines.errLines')
  return !Object.keys(errors).length
}

async function submit() {
  if (saving.value || !validate()) return
  saving.value = true
  try {
    await createPurchase({
      ...form,
      lines: lines.value.map((l) => ({
        itemId: l.itemId === OTHER ? null : l.itemId,
        itemType: l.itemId === OTHER ? l.itemType.trim() : '',
        unit: l.itemId === OTHER ? l.unit : '',
        qty: l.qty,
        unitPrice: l.unitPrice,
        taxable: l.taxable,
      })),
    })
    toast.success(t('purchases.saved'))
    emit('saved')
    emit('update:open', false)
  } catch (e) {
    toast.error(e?.message === 'INVALID_TAX' ? t('purchases.supplier.errTax') : t('purchases.lines.errSave'))
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <Dialog :open="open" size="xl" :title="t('purchases.purchaseTitle')" @update:open="emit('update:open', $event)">
    <form class="space-y-5" @submit.prevent="submit">
      <!-- invoice header -->
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('purchases.fields.supplier') }}</label>
          <Dropdown v-model="form.supplierId" :options="supplierOptions" :placeholder="t('purchases.fields.supplier')" :invalid="!!errors.supplierId" />
        </div>
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('purchases.fields.supplierTaxNo') }}</label>
          <Input v-model="form.supplierTaxNo" dir="ltr" inputmode="numeric" placeholder="3xxxxxxxxxxxxx3" :invalid="!!errors.supplierTaxNo" />
          <p v-if="errors.supplierTaxNo" class="text-danger text-xs">{{ errors.supplierTaxNo }}</p>
          <p v-else class="text-muted-foreground text-xs">{{ t('purchases.fields.supplierTaxNoHint') }}</p>
        </div>
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('purchases.fields.invoiceNo') }}</label>
          <Input v-model="form.invoiceNo" dir="ltr" />
        </div>
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('purchases.fields.date') }}</label>
          <DatePicker v-model="form.date" />
        </div>
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('purchases.fields.vehicle') }}</label>
          <Dropdown v-model="form.vehicleId" :options="vehicleOptions" :placeholder="t('purchases.fields.noVehicle')" />
        </div>
        <div class="space-y-1.5">
          <label class="text-sm font-medium">{{ t('purchases.fields.costCenter') }}</label>
          <Dropdown v-if="!form.vehicleId" v-model="form.costCenter" :options="costCenterOptions" :placeholder="t('purchases.fields.costCenter')" :invalid="!!errors.costCenter" />
          <div v-else class="bg-muted/40 text-muted-foreground flex h-10 items-center rounded-lg px-3 text-sm">
            {{ t('purchases.fields.derivedCostCenter') }}: {{ derivedCostCenterName }}
          </div>
        </div>
      </div>

      <!-- item lines -->
      <section class="space-y-2.5">
        <header class="flex flex-wrap items-center gap-3">
          <h4 class="font-bold">{{ t('purchases.lines.title') }}</h4>
          <span class="pd-count">{{ num(lines.length) }}</span>
          <label class="ms-auto flex cursor-pointer items-center gap-2 text-sm">
            <Switch v-model="form.inclVat" :disabled="!anyTaxable" /> {{ t('purchases.fields.inclVat') }}
          </label>
        </header>

        <!-- column names (wide screens) -->
        <div class="pd-grid pd-head" aria-hidden="true">
          <span>{{ t('purchases.fields.item') }}</span>
          <span>{{ t('purchases.fields.qty') }}</span>
          <span>{{ t('purchases.fields.unitPrice') }}</span>
          <span class="text-end">{{ t('purchases.lines.lineTotal') }}</span>
          <span />
        </div>

        <TransitionGroup name="pd-line" tag="div" class="space-y-2">
          <div v-for="(l, i) in lines" :key="l.key" class="pd-line" :class="lineErrors[l.key] && 'is-invalid'">
            <div class="pd-grid">
              <div class="min-w-0 space-y-2">
                <Dropdown
                  v-model="l.itemId"
                  :options="itemPickOptions"
                  :placeholder="t('purchases.fields.itemPh')"
                  :invalid="!!lineErrors[l.key]?.item"
                  :aria-label="t('purchases.fields.item')"
                />
                <div v-if="l.itemId === OTHER" class="grid gap-2 sm:grid-cols-[minmax(0,1fr)_10rem]">
                  <Input v-model="l.itemType" :placeholder="t('purchases.fields.itemType')" :invalid="!!lineErrors[l.key]?.item" :aria-label="t('purchases.fields.itemType')" />
                  <Dropdown v-model="l.unit" :options="unitOptions" :placeholder="t('purchases.items.unit')" :aria-label="t('purchases.items.unit')" searchable />
                </div>
              </div>
              <div class="space-y-1">
                <Input v-model="l.qty" type="number" min="0" dir="ltr" :placeholder="t('purchases.fields.qty')" :invalid="!!lineErrors[l.key]?.qty" :aria-label="t('purchases.fields.qty')" />
                <p v-if="lineUnit(l)" class="text-muted-foreground truncate text-[11px] font-semibold">{{ lineUnit(l) }}</p>
              </div>
              <Input v-model="l.unitPrice" type="number" min="0" dir="ltr" :placeholder="t('purchases.fields.unitPrice')" :invalid="!!lineErrors[l.key]?.unitPrice" :aria-label="t('purchases.fields.unitPrice')" />
              <div class="pd-total">
                <b dir="ltr">{{ sar(lineTotals[i].total) }}</b>
                <span v-if="l.taxable">{{ t('purchases.lines.vatOf', { amount: sar(lineTotals[i].vat) }) }}</span>
                <span v-else>{{ t('purchases.lines.noVat') }}</span>
              </div>
              <button
                type="button"
                class="pd-remove"
                :disabled="lines.length === 1"
                :title="t('purchases.lines.remove')"
                :aria-label="t('purchases.lines.remove')"
                @click="removeLine(i)"
              >
                <Trash2 class="size-4" />
              </button>
            </div>
            <label class="text-muted-foreground mt-2 flex w-fit cursor-pointer items-center gap-2 text-xs font-semibold">
              <Switch v-model="l.taxable" /> {{ t('purchases.fields.taxable') }}
            </label>
          </div>
        </TransitionGroup>

        <p v-if="errors.lines" class="text-danger text-xs">{{ errors.lines }}</p>
        <button type="button" class="pd-add" @click="addLine"><Plus class="size-4" /> {{ t('purchases.lines.add') }}</button>
      </section>

      <!-- invoice totals -->
      <div class="bg-muted/40 grid grid-cols-3 gap-2 rounded-xl p-4 text-center text-sm">
        <div><p class="text-muted-foreground text-xs">{{ t('purchases.fields.preTax') }}</p><p class="mt-1 font-semibold tabular-nums">{{ sar(totals.preTax) }}</p></div>
        <div><p class="text-muted-foreground text-xs">{{ t('purchases.fields.vat') }}</p><p class="text-orange mt-1 font-semibold tabular-nums">{{ sar(totals.vat) }}</p></div>
        <div><p class="text-muted-foreground text-xs">{{ t('purchases.lines.invoiceTotal') }}</p><p class="mt-1 font-bold tabular-nums">{{ sar(totals.total) }}</p></div>
      </div>

      <div class="space-y-1.5">
        <label class="text-sm font-medium">{{ t('purchases.fields.receipt') }}</label>
        <FileDrop v-model="receipt" />
      </div>
    </form>
    <template #footer>
      <Button variant="ghost" @click="emit('update:open', false)">{{ t('common.cancel') }}</Button>
      <Button :disabled="saving" @click="submit">{{ t('common.save') }}</Button>
    </template>
  </Dialog>
</template>

<style scoped>
/* item, qty, unit price, line total, remove */
.pd-grid { display: grid; grid-template-columns: minmax(0, 1fr) 6rem 8rem 8.5rem 2.25rem; gap: 0.6rem; align-items: start; }
.pd-head { padding-inline: 0.85rem; font-size: 11.5px; font-weight: 700; color: var(--muted-foreground); }
.pd-line { padding: 0.75rem 0.85rem; border-radius: 0.9rem; border: 1px solid var(--border); background: var(--card); transition: border-color 0.15s; }
.pd-line:focus-within { border-color: color-mix(in srgb, var(--primary) 45%, var(--border)); }
.pd-line.is-invalid { border-color: color-mix(in srgb, var(--danger) 45%, var(--border)); }
.pd-total { display: grid; justify-items: end; align-content: center; min-height: 2.5rem; line-height: 1.2; }
.pd-total b { font-weight: 800; font-variant-numeric: tabular-nums; }
.pd-total span { font-size: 11px; font-weight: 600; color: var(--muted-foreground); }
.pd-remove {
  display: grid; place-items: center; width: 2.25rem; height: 2.5rem; border-radius: 0.65rem; color: var(--muted-foreground);
  transition: background-color 0.15s, color 0.15s;
}
.pd-remove:hover:not(:disabled) { background: color-mix(in srgb, var(--danger) 10%, transparent); color: var(--danger); }
.pd-remove:disabled { opacity: 0.35; cursor: not-allowed; }
.pd-remove:focus-visible, .pd-add:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
.pd-add {
  display: flex; align-items: center; justify-content: center; gap: 0.4rem; width: 100%; height: 2.6rem; border-radius: 0.9rem;
  border: 1.5px dashed var(--border); font-size: 13px; font-weight: 700; color: var(--primary); transition: border-color 0.15s, background-color 0.15s;
}
.pd-add:hover { border-color: var(--primary); background: color-mix(in srgb, var(--primary) 6%, transparent); }
.pd-count { display: inline-grid; place-items: center; min-width: 1.5rem; height: 1.5rem; padding: 0 0.4rem; border-radius: 9999px; font-size: 11px; font-weight: 800; background: var(--muted); font-variant-numeric: tabular-nums; }

.pd-line-enter-active, .pd-line-leave-active { transition: opacity 0.2s, transform 0.2s; }
.pd-line-enter-from, .pd-line-leave-to { opacity: 0; transform: translateY(-4px); }

@media (max-width: 40rem) {
  .pd-head { display: none; }
  .pd-grid { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) 2.25rem; }
  .pd-grid > :first-child { grid-column: 1 / -1; }
  .pd-total { grid-column: 1 / 3; justify-items: start; min-height: 0; }
  .pd-remove { grid-row: 3; grid-column: 3; }
}
@media (prefers-reduced-motion: reduce) {
  .pd-line, .pd-remove, .pd-add { transition: none; }
  .pd-line-enter-active, .pd-line-leave-active { transition: none; }
}
</style>
