<template>
  <div class="dashboard-shell">
    <!-- Desktop sidebar -->
    <aside class="sidebar">
      <SidebarNav />
    </aside>

    <!-- Mobile drawer -->
    <Teleport to="body">
      <Transition name="drawer">
        <div v-if="mobileOpen" class="drawer-backdrop" @click.self="mobileOpen = false">
          <aside class="sidebar sidebar--mobile">
            <button class="drawer-close" aria-label="Close menu" @click="mobileOpen = false">&times;</button>
            <SidebarNav />
          </aside>
        </div>
      </Transition>
    </Teleport>

    <div class="main-col">
      <Topbar @toggle-sidebar="mobileOpen = !mobileOpen" />
      <main class="page-container">
        <Breadcrumbs />
        <RouterView />
      </main>
    </div>

    <ToastHost />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import SidebarNav from '@/components/dashboard/SidebarNav.vue'
import Topbar from '@/components/dashboard/Topbar.vue'
import Breadcrumbs from '@/components/dashboard/Breadcrumbs.vue'
import ToastHost from '@/components/ui/ToastHost.vue'

const mobileOpen = ref(false)
const route = useRoute()

// Close the drawer on navigation
watch(() => route.fullPath, () => { mobileOpen.value = false })
</script>

<style scoped>
.dashboard-shell {
  display: flex;
  min-height: 100vh;
}
.sidebar {
  width: 248px;
  flex-shrink: 0;
  background: var(--bg-card);
  border-right: 1px solid var(--border);
  position: sticky;
  top: 0;
  height: 100vh;
}

.main-col { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.page-container {
  flex: 1;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 28px 24px 64px;
}

/* Mobile drawer */
.drawer-backdrop {
  position: fixed;
  inset: 0;
  z-index: 900;
  background: rgba(10, 25, 47, 0.45);
}
.sidebar--mobile {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 910;
  transform: translateX(0);
}
.drawer-close {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 2;
  border: none;
  background: none;
  font-size: 24px;
  color: var(--text-muted);
  cursor: pointer;
}

.drawer-enter-active, .drawer-leave-active { transition: opacity 0.2s ease; }
.drawer-enter-active .sidebar--mobile, .drawer-leave-active .sidebar--mobile { transition: transform 0.22s ease; }
.drawer-enter-from, .drawer-leave-to { opacity: 0; }
.drawer-enter-from .sidebar--mobile, .drawer-leave-to .sidebar--mobile { transform: translateX(-100%); }

@media (max-width: 900px) {
  .sidebar:not(.sidebar--mobile) { display: none; }
  .page-container { padding: 20px 16px 56px; }
}
</style>
