<template>
  <div>
    <PageHeader title="Brands" subtitle="Every client voice your team writes for.">
      <template #actions>
        <RouterLink to="/dashboard/brands/new" class="btn-new">
          <PhPlus :size="16" weight="bold" /><span>New Brand</span>
        </RouterLink>
      </template>
    </PageHeader>

    <!-- Toolbar -->
    <div class="toolbar">
      <div class="search-wrap">
        <PhMagnifyingGlass :size="16" />
        <input v-model.trim="search" type="search" placeholder="Search brands…" />
      </div>
      <span class="result-count">{{ filtered.length }} brand{{ filtered.length === 1 ? '' : 's' }}</span>
    </div>

    <!-- States -->
    <div v-if="store.loading && !store.items.length" class="grid">
      <div v-for="n in 3" :key="n" class="skeleton-card" />
    </div>

    <EmptyState
      v-else-if="!filtered.length"
      title="No brands yet"
      description="Create your first brand profile — Brandload will crawl its public content and build its identity automatically."
    >
      <template #icon><PhTag :size="26" /></template>
      <template #action>
        <BaseButton @click="$router.push('/dashboard/brands/new')"><PhPlus :size="15" weight="bold" /> Create a brand</BaseButton>
      </template>
    </EmptyState>

    <div v-else class="grid">
      <BrandCard v-for="brand in filtered" :key="brand.id" :brand="brand" />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useBrandsStore } from '@/stores/brands'
import PageHeader from '@/components/ui/PageHeader.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BrandCard from '@/components/dashboard/BrandCard.vue'
import { PhPlus, PhTag, PhMagnifyingGlass } from '@phosphor-icons/vue'

const store = useBrandsStore()
const search = ref('')

const filtered = computed(() => {
  const s = search.value.toLowerCase()
  if (!s) return store.items
  return store.items.filter((b) =>
    b.name.toLowerCase().includes(s) || (b.description ?? '').toLowerCase().includes(s),
  )
})

onMounted(() => store.fetchList())
</script>

<style scoped>
.btn-new {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 40px;
  padding: 0 18px;
  border-radius: 6px;
  background: var(--brand);
  color: #fff;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: -0.15px;
  border: 1px solid var(--brand);
  transition: background 0.14s ease, border-color 0.14s ease;
}
.btn-new:hover { background: var(--brand-hover); border-color: var(--brand-hover); }
.btn-new span { display: inline; }

@media (max-width: 520px) {
  .btn-new span { display: none; }
  .btn-new { width: 40px; padding: 0; justify-content: center; }
}

.toolbar { display: flex; align-items: center; gap: 14px; margin-bottom: 20px; flex-wrap: wrap; }
.search-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  max-width: 380px;
  height: 42px;
  padding: 0 14px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 10px;
}
.search-wrap svg { color: var(--text-disabled); flex-shrink: 0; }
.search-wrap input {
  width: 100%;
  border: none;
  outline: none;
  background: none;
  font-size: 14px;
  font-family: inherit;
  color: var(--text-primary);
}
.result-count { font-size: 13px; color: var(--text-muted); }

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 14px;
}

.skeleton-card {
  height: 170px;
  border-radius: 14px;
  background: linear-gradient(90deg, var(--bg-sunken) 25%, var(--bg-surface) 50%, var(--bg-sunken) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
}
@keyframes shimmer { to { background-position: -200% 0; } }
</style>
