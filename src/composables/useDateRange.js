import { ref, computed } from 'vue'

/** A from/to pair bound to one range DatePicker. Defaults to the current year to date. */
export function useDateRange(defaultFrom = `${new Date().getFullYear()}-01-01`, defaultTo = new Date().toISOString().slice(0, 10)) {
  const from = ref(defaultFrom)
  const to = ref(defaultTo)
  const range = computed({
    get: () => [from.value, to.value],
    set: ([a, b]) => {
      from.value = a || ''
      to.value = b || ''
    },
  })
  const params = computed(() => ({ from: from.value || undefined, to: to.value || undefined }))
  return { from, to, range, params }
}
