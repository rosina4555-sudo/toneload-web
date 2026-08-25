<template>
  <nav v-if="crumbs.length > 1" class="breadcrumbs" aria-label="Breadcrumb">
    <ol class="trail">
      <li
        v-for="(crumb, i) in crumbs"
        :key="crumb.path"
        class="crumb"
        :class="{ 'crumb--current': i === crumbs.length - 1 }"
      >
        <PhCaretRight v-if="i > 0" :size="11" weight="bold" class="sep" />
        <!-- Last crumb is the current page: plain text, not a link -->
        <span v-if="i === crumbs.length - 1" class="label label--current" aria-current="page">{{ crumb.label }}</span>
        <RouterLink v-else :to="crumb.path" class="label label--link">{{ crumb.label }}</RouterLink>
      </li>
    </ol>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { PhCaretRight } from '@phosphor-icons/vue'
import { useBrandsStore } from '@/stores/brands'

const route = useRoute()
const brandsStore = useBrandsStore()

// Labels for each dashboard path segment. Anything unknown falls back to
// a title-cased segment name so new routes get sensible crumbs for free.
const CRUMB_LABELS = {
  '/dashboard': 'Overview',
  '/dashboard/brands': 'Brands',
  '/dashboard/brands/new': 'New Brand',
  '/dashboard/analysis': 'Scoring History',
  '/dashboard/teams': 'Team',
  '/dashboard/billing': 'Billing',
  '/dashboard/settings': 'Settings',
}

const crumbs = computed(() => {
  const list = []

  // Walk every matched dashboard route (layout first, then children).
  // The layout route has no path of its own — skip it.
  for (const matched of route.matched) {
    if (!matched.path || !matched.path.startsWith('/dashboard')) continue
    const path = routerResolve(matched.path)
    list.push({ path, label: crumbLabel(matched, path) })
  }
  return list
})

/** Turns a matched record's pattern into the concrete URL (/brands/:id -> /brands/brn_x). */
function routerResolve(pattern) {
  return pattern.replace(/:(\w+)/g, (_, key) => route.params[key] ?? '')
}

function crumbLabel(matched, concretePath) {
  // Brand detail shows the actual brand name when it's known
  if (matched.name === 'BrandDetail') {
    return brandsStore.items.find((b) => b.id === route.params.id)?.name ?? 'Brand Profile'
  }
  return (
    CRUMB_LABELS[concretePath] ??
    matched.meta?.breadcrumb ??
    // Generic fallback: title-case the last static segment of the pattern
    matched.path.split('/').filter((s) => s && !s.startsWith(':')).pop()?.replace(/^\w/, (c) => c.toUpperCase()) ??
    '…'
  )
}
</script>

<style scoped>
.breadcrumbs { margin-bottom: 16px; }

.trail {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  gap: 2px;
  list-style: none;

  /* Narrow viewports: scroll horizontally instead of wrapping or squashing,
     with faded edges hinting there is more to either side. */
  overflow-x: auto;
  scrollbar-width: none;
  -webkit-mask-image: linear-gradient(90deg, transparent 0, #000 12px, #000 calc(100% - 12px), transparent 100%);
          mask-image: linear-gradient(90deg, transparent 0, #000 12px, #000 calc(100% - 12px), transparent 100%);
}
.trail::-webkit-scrollbar { display: none; }

.crumb {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  flex-shrink: 0;
}

.sep { color: var(--text-disabled); }

.label {
  font-size: 13px;
  line-height: 1;
  padding: 4px 2px;
}
.label--link {
  color: var(--text-muted);
  text-decoration: none;
  border-radius: 6px;
  transition: color 0.12s;
}
.label--link:hover { color: var(--brand); }
.label--current {
  color: var(--text-primary);
  font-weight: 600;
}

@media (max-width: 900px) {
  .breadcrumbs { margin-bottom: 12px; }
  .label { font-size: 12.5px; }
}
</style>
