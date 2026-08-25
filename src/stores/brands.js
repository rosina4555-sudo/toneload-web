import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { brandsApi } from '@/api/brands'

/**
 * Brand state — list for the browse views, `current` for the detail page.
 * The build-status polling helper lives here so every consumer polls the
 * same way (spec §10: poll GET /brands/:id every 5s while building).
 */
export const useBrandsStore = defineStore('brands', () => {
  // ── State ────────────────────────────────────────────────────────────────
  const items = ref([])
  const current = ref(null)
  const loading = ref(false)
  const error = ref(null)

  let pollTimer = null

  // ── Getters ──────────────────────────────────────────────────────────────
  const readyBrands = computed(() => items.value.filter((b) => b.identity_status === 'ready'))
  const hasBuilding = computed(() => items.value.some((b) => b.identity_status === 'building'))

  // ── Actions ──────────────────────────────────────────────────────────────
  async function fetchList(params = {}) {
    loading.value = true
    error.value = null
    try {
      const { items: list } = await brandsApi.list(params)
      items.value = list
      return list
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  async function fetchOne(id) {
    loading.value = true
    error.value = null
    try {
      current.value = await brandsApi.get(id)
      return current.value
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  async function create(payload) {
    const brand = await brandsApi.create(payload)
    items.value.unshift(brand)
    return brand
  }

  async function update(id, payload) {
    const updated = await brandsApi.update(id, payload)
    replaceInList(updated)
    if (current.value?.id === id) Object.assign(current.value, updated)
    return updated
  }

  async function remove(id) {
    await brandsApi.remove(id)
    items.value = items.value.filter((b) => b.id !== id)
    if (current.value?.id === id) current.value = null
  }

  async function rebuild(id) {
    const brand = await brandsApi.rebuild(id)
    replaceInList(brand)
    if (current.value?.id === id) Object.assign(current.value, brand)
    return brand
  }

  /**
   * Polls a brand until its identity build settles (ready / failed).
   * Returns a stop() so consumers can clean up on unmount.
   */
  function pollUntilReady(brandId, { intervalMs = 5000, onUpdate, onDone } = {}) {
    stopPolling()
    const tick = async () => {
      try {
        const brand = await brandsApi.get(brandId)
        onUpdate?.(brand)
        if (brand.identity_status !== 'building' && brand.identity_status !== 'pending') {
          stopPolling()
          onDone?.(brand)
        }
      } catch {
        stopPolling()
      }
    }
    pollTimer = setInterval(tick, intervalMs)
    return stopPolling
  }

  function stopPolling() {
    if (pollTimer) {
      clearInterval(pollTimer)
      pollTimer = null
    }
  }

  function replaceInList(updated) {
    const i = items.value.findIndex((b) => b.id === updated.id)
    if (i !== -1) items.value.splice(i, 1, { ...items.value[i], ...updated })
  }

  return {
    items,
    current,
    loading,
    error,
    readyBrands,
    hasBuilding,
    fetchList,
    fetchOne,
    create,
    update,
    remove,
    rebuild,
    pollUntilReady,
    stopPolling,
  }
})
