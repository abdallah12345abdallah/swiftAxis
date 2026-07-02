import { reactive } from 'vue'

/** Global toast store (module singleton). Rendered by ToastHost. */
export const toastState = reactive({ items: [] })
let seq = 0

function push(type, message, timeout = 3200) {
  const id = ++seq
  toastState.items.push({ id, type, message })
  if (timeout) setTimeout(() => dismiss(id), timeout)
  return id
}

function dismiss(id) {
  const i = toastState.items.findIndex((t) => t.id === id)
  if (i > -1) toastState.items.splice(i, 1)
}

export function useToast() {
  return {
    success: (m) => push('success', m),
    error: (m) => push('error', m),
    info: (m) => push('info', m),
    dismiss,
  }
}
