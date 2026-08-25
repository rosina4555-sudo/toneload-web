<template>
  <header class="topbar">
    <RouterLink to="/" class="home-btn" aria-label="Back to home">
      <PhHouse :size="20" weight="bold" />
    </RouterLink>

    <button class="menu-btn" aria-label="Toggle menu" @click="$emit('toggle-sidebar')">
      <PhList :size="22" weight="bold" />
    </button>

    <h2 class="page-title font-display">{{ pageTitle }}</h2>

    <div class="topbar-right">
      <RouterLink to="/dashboard/brands/new" class="new-brand-btn">
        <PhPlus :size="16" weight="bold" />
        <span>New Brand</span>
      </RouterLink>

      <div ref="menuRef" class="user-menu" @click="open = !open">
        <div class="avatar">{{ initials }}</div>
        <span class="user-name">{{ auth.user?.name?.split(' ')[0] ?? 'Account' }}</span>
        <PhCaretDown :size="13" />

        <Transition name="menu-pop">
          <div v-if="open" class="menu-panel" @click.stop>
            <div class="menu-user">
              <p class="menu-name">{{ auth.user?.name }}</p>
              <p class="menu-email">{{ auth.user?.email }}</p>
            </div>
            <RouterLink to="/dashboard/settings" class="menu-item" @click="open = false">
              <PhGearSix :size="17" /> Settings
            </RouterLink>
            <RouterLink to="/dashboard/billing" class="menu-item" @click="open = false">
              <PhCreditCard :size="17" /> Billing
            </RouterLink>
            <button class="menu-item menu-item--danger" @click="signOut">
              <PhSignOut :size="17" /> Sign out
            </button>
          </div>
        </Transition>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { PhList, PhPlus, PhCaretDown, PhGearSix, PhCreditCard, PhSignOut, PhHouse } from '@phosphor-icons/vue'

defineEmits(['toggle-sidebar'])

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const open = ref(false)
const menuRef = ref(null)

const pageTitle = computed(() => {
  const map = {
    Dashboard: 'Overview',
    BrandDetail: 'Brand Profile',
    BrandCreate: 'New Brand',
    Brands: 'Brands',
    Analysis: 'Scoring History',
    Teams: 'Team',
    Billing: 'Billing',
    Settings: 'Settings',
  }
  return map[route.name] ?? route.meta.title
})

const initials = computed(() =>
  (auth.user?.name ?? '')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'U',
)

function onClickOutside(e) {
  if (menuRef.value && !menuRef.value.contains(e.target)) open.value = false
}
onMounted(() => document.addEventListener('mousedown', onClickOutside))
onBeforeUnmount(() => document.removeEventListener('mousedown', onClickOutside))

async function signOut() {
  open.value = false
  await auth.logout()
}
</script>

<style scoped>
.topbar {
  display: flex;
  align-items: center;
  gap: 14px;
  height: 64px;
  padding: 0 24px;
  background: var(--bg-page);
  border-bottom: 1px solid var(--border);
}
.home-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  color: var(--text-secondary);
  text-decoration: none;
  transition: background 0.14s, color 0.14s;
  flex-shrink: 0;
}
.home-btn:hover { background: var(--bg-surface); color: var(--text-primary); }
.menu-btn {
  display: none;
  border: none;
  background: none;
  cursor: pointer;
  color: var(--text-primary);
  padding: 6px;
  border-radius: 8px;
}
.menu-btn:hover { background: var(--bg-surface); }
.page-title { font-size: 18px; letter-spacing: -0.2px; }
.topbar-right { margin-left: auto; display: flex; align-items: center; gap: 14px; }

.new-brand-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 38px;
  padding: 0 16px;
  border-radius: 6px;
  background: var(--brand);
  color: #fff;
  text-decoration: none;
  font-size: 13.5px;
  font-weight: 500;
  letter-spacing: -0.15px;
  border: 1px solid var(--brand);
  transition: background 0.14s ease, border-color 0.14s ease;
}
.new-brand-btn:hover { background: var(--brand-hover); border-color: var(--brand-hover); }

.user-menu { position: relative; display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 4px; border-radius: 10px; }
.user-menu:hover { background: var(--bg-surface); }
.avatar {
  display: grid; place-items: center;
  width: 34px; height: 34px;
  border-radius: 50%;
  background: var(--brand-light);
  color: var(--brand-text);
  font-size: 12.5px;
  font-weight: 600;
}
.user-name { font-size: 14px; font-weight: 500; }

.menu-panel {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 240px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  box-shadow: 0 16px 40px rgba(10, 25, 47, 0.12);
  overflow: hidden;
  z-index: 100;
}
.menu-user { padding: 14px 16px; border-bottom: 1px solid var(--border); }
.menu-name { font-weight: 600; font-size: 14px; }
.menu-email { font-size: 12.5px; color: var(--text-muted); margin-top: 2px; }
.menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 11px 16px;
  background: none;
  border: none;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  text-decoration: none;
  cursor: pointer;
  text-align: left;
}
.menu-item:hover { background: var(--bg-surface); }
.menu-item--danger { color: var(--error-text); }

.menu-pop-enter-active, .menu-pop-leave-active { transition: all 0.15s ease; }
.menu-pop-enter-from, .menu-pop-leave-to { opacity: 0; transform: translateY(-6px); }

@media (max-width: 900px) {
  .menu-btn { display: inline-flex; }
  .user-name { display: none; }
}
@media (max-width: 520px) {
  .new-brand-btn span { display: none; }
  .new-brand-btn { width: 38px; padding: 0; justify-content: center; }
}
</style>
