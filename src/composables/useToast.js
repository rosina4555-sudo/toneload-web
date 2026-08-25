import { reactive } from 'vue'

let uid = 0
const toasts = reactive([])

/**
 * Shared toast notifications.
 * Usage: const toast = useToast(); toast.success('Saved'); toast.error('Nope')
 */
export function useToast() {
  function push(kind, message, timeout = 3500) {
    const id = ++uid
    toasts.push({ id, kind, message })
    setTimeout(() => dismiss(id), timeout)
  }

  function dismiss(id) {
    const i = toasts.findIndex((t) => t.id === id)
    if (i !== -1) toasts.splice(i, 1)
  }

  return {
    toasts,
    dismiss,
    success: (msg) => push('success', msg),
    error: (msg) => push('error', msg),
    info: (msg) => push('info', msg),
  }
}
