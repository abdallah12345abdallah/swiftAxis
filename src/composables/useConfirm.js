import { reactive, markRaw } from 'vue'

/* One shared confirmation dialog for the whole app (rendered once by
   <ConfirmHost /> in App.vue). Call it from anywhere:

     const confirm = useConfirm()
     const ok = await confirm({
       title, message,                 // copy (already translated)
       tone: 'danger',                 // danger | warning | primary | success
       icon: Power,                    // optional lucide icon (defaults per tone)
       subject: 'محمد الغامدي · R-001', // optional pill naming what is affected
       details: [{ label, value }],    // optional summary rows
       input: { label, placeholder, required }, // optional note field
       confirmText, cancelText,
       onConfirm: async (inputValue) => { ... }, // optional; the button spins
     })                                          // while it runs, return false
                                                 // (or throw) to keep it open
   It resolves to false when dismissed, otherwise to the note text when an
   input was asked for, or true. */

const state = reactive({
  open: false,
  busy: false,
  failed: false,
  missing: false,
  value: '',
  opts: {},
})
let resolver = null

function finish(result) {
  state.open = false
  const r = resolver
  resolver = null
  r?.(result)
}

export function confirm(opts = {}) {
  if (resolver) finish(false) // a new request replaces an unanswered one
  state.opts = { tone: 'danger', ...opts, icon: opts.icon ? markRaw(opts.icon) : null }
  state.value = opts.input?.value ?? ''
  state.busy = false
  state.failed = false
  state.missing = false
  state.open = true
  return new Promise((resolve) => (resolver = resolve))
}

export async function acceptConfirm() {
  if (state.busy) return
  const o = state.opts
  if (o.input?.required && !state.value.trim()) {
    state.missing = true
    return
  }
  state.missing = false
  state.failed = false
  if (o.onConfirm) {
    state.busy = true
    try {
      const r = await o.onConfirm(state.value.trim())
      if (r === false) return
    } catch {
      state.failed = true
      return
    } finally {
      state.busy = false
    }
  }
  finish(o.input ? state.value.trim() : true)
}

export function dismissConfirm() {
  if (state.busy) return
  finish(false)
}

export const confirmState = state

export function useConfirm() {
  return confirm
}
