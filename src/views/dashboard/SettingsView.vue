<template>
  <div>
    <PageHeader title="Settings" subtitle="Your account, API access and extension connection." />

    <div class="settings-grid">
      <!-- Profile -->
      <section class="card">
        <h3>Profile</h3>
        <form @submit.prevent="saveProfile">
          <div class="field">
            <label for="set-name">Full name</label>
            <input id="set-name" v-model.trim="profileForm.name" type="text" />
          </div>
          <div class="field">
            <label for="set-email">Email</label>
            <input id="set-email" v-model.trim="profileForm.email" type="email" />
          </div>
          <div class="form-actions">
            <BaseButton type="submit" :loading="savingProfile" :disabled="!profileDirty">Save changes</BaseButton>
          </div>
        </form>
      </section>

      <!-- Extension -->
      <section class="card">
        <h3>Chrome extension</h3>
        <p class="panel-sub">
          The extension signs in through this dashboard — no separate login. Generate a token and paste it into the sidebar once.
        </p>
        <div class="ext-row">
          <BaseButton variant="subtle" :loading="generatingToken" @click="generateExtensionToken">
            <PhPlugsConnected :size="16" /> {{ extensionToken ? 'Regenerate token' : 'Connect extension' }}
          </BaseButton>
          <span v-if="extensionExpires" class="muted">expires in {{ extensionExpires }} min</span>
        </div>

        <div v-if="extensionToken" class="token-box">
          <code class="font-mono">{{ maskedToken }}</code>
          <div class="token-actions">
            <button class="link-btn" @click="reveal = !reveal">{{ reveal ? 'Hide' : 'Reveal' }}</button>
            <button class="link-btn" @click="copyToken">Copy</button>
          </div>
        </div>
      </section>

      <!-- API credentials -->
      <section class="card credentials-card">
        <div class="panel-head">
          <div>
            <h3>API credentials</h3>
            <p class="panel-sub">For programmatic scoring via the public API. Maximum of 10 active keys.</p>
          </div>
          <span class="cred-count">{{ credentials.length }} / 10</span>
        </div>

        <ul class="cred-list">
          <li v-for="c in credentials" :key="c.id" class="cred-row">
            <PhKey :size="17" />
            <div class="cred-main">
              <strong>{{ c.label }}</strong>
              <code class="font-mono">{{ c.prefix }}…</code>
            </div>
            <span class="muted">created {{ formatDate(c.created_at) }}</span>
            <button class="row-remove" aria-label="Revoke credential" @click="revokeCredential(c)">&times;</button>
          </li>
          <li v-if="!credentials.length" class="muted">No API credentials yet.</li>
        </ul>

        <form class="new-cred" @submit.prevent="createCredential">
          <input v-model.trim="newCredLabel" type="text" placeholder="Label, e.g. “CI pipeline”" required />
          <BaseButton type="submit" size="sm" :loading="creatingCred">Create key</BaseButton>
        </form>

        <div v-if="freshSecret" class="secret-box">
          <p><strong>Copy your secret now</strong> — it will never be shown again.</p>
          <code class="font-mono">{{ freshSecret }}</code>
          <button class="link-btn" @click="copySecret">Copy</button>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import api from '@/api/axios'
import { useAuthStore } from '@/stores/auth'
import { credentialsApi, extensionApi } from '@/api/billing'
import { useToast } from '@/composables/useToast'
import { formatDate } from '@/utils/format'
import PageHeader from '@/components/ui/PageHeader.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { PhKey, PhPlugsConnected } from '@phosphor-icons/vue'

const auth = useAuthStore()
const toast = useToast()

// ── Profile ──────────────────────────────────────────────────────────────
const profileForm = reactive({ name: '', email: '' })
const savingProfile = ref(false)

const profileDirty = computed(() =>
  profileForm.name !== (auth.user?.name ?? '') || profileForm.email !== (auth.user?.email ?? ''),
)

async function saveProfile() {
  savingProfile.value = true
  try {
    const updated = await api.patch('/auth/me', { name: profileForm.name, email: profileForm.email })
    auth.user = { ...auth.user, ...updated }
    toast.success('Profile saved.')
  } catch (e) {
    toast.error(e.message)
  } finally {
    savingProfile.value = false
  }
}

// ── Extension token ──────────────────────────────────────────────────────
const extensionToken = ref('')
const extensionExpires = ref(null)
const generatingToken = ref(false)
const reveal = ref(false)

const maskedToken = computed(() => {
  if (!extensionToken.value || reveal.value) return extensionToken.value
  const t = extensionToken.value
  return `${t.slice(0, 12)}${'•'.repeat(18)}${t.slice(-6)}`
})

async function generateExtensionToken() {
  generatingToken.value = true
  try {
    const data = await extensionApi.createToken()
    extensionToken.value = data.token
    extensionExpires.value = Math.round(data.expires_in / 60)
    reveal.value = false
    toast.success('Extension token generated.')
  } catch (e) {
    toast.error(e.message)
  } finally {
    generatingToken.value = false
  }
}

async function copyToken() {
  try {
    await navigator.clipboard.writeText(extensionToken.value)
    toast.success('Token copied.')
  } catch {
    toast.error('Could not copy — select it manually.')
  }
}

// ── API credentials ──────────────────────────────────────────────────────
const credentials = ref([])
const newCredLabel = ref('')
const creatingCred = ref(false)
const freshSecret = ref('')

async function loadCredentials() {
  try {
    credentials.value = await credentialsApi.list()
  } catch (e) {
    toast.error(e.message)
  }
}

async function createCredential() {
  if (!newCredLabel.value) return
  creatingCred.value = true
  try {
    const { credential, secret } = await credentialsApi.create(newCredLabel.value)
    credentials.value.push(credential)
    newCredLabel.value = ''
    freshSecret.value = secret
    toast.success('API key created.')
  } catch (e) {
    toast.error(e.message)
  } finally {
    creatingCred.value = false
  }
}

async function revokeCredential(credential) {
  try {
    await credentialsApi.remove(credential.id)
    credentials.value.splice(credentials.value.indexOf(credential), 1)
    toast.success(`“${credential.label}” revoked.`)
  } catch (e) {
    toast.error(e.message)
  }
}

async function copySecret() {
  try {
    await navigator.clipboard.writeText(freshSecret.value)
    toast.success('Secret copied.')
  } catch {
    toast.error('Could not copy — select it manually.')
  }
}

onMounted(() => {
  profileForm.name = auth.user?.name ?? ''
  profileForm.email = auth.user?.email ?? ''
  loadCredentials()
})
</script>

<style scoped>
.settings-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  align-items: start;
}

.card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 22px;
}
.card h3 { font-family: 'Cabinet Grotesk', sans-serif; font-size: 16.5px; margin-bottom: 14px; }
.panel-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; margin-bottom: 14px; }
.panel-sub { font-size: 13px; color: var(--text-muted); margin-top: -8px; margin-bottom: 14px; max-width: 420px; }

.field { margin-bottom: 16px; }
.field label { display: block; font-size: 13.5px; font-weight: 600; margin-bottom: 7px; }
.field input {
  width: 100%;
  height: 44px;
  padding: 0 13px;
  border: 1px solid var(--border);
  border-radius: 10px;
  font-size: 15px;
  font-family: inherit;
  outline: none;
}
.field input:focus { border-color: var(--border-strong); box-shadow: 0 0 0 3px rgba(245, 166, 35, 0.12); }

.form-actions { display: flex; justify-content: flex-end; }

.ext-row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.token-box {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 14px;
  padding: 11px 14px;
  background: var(--bg-dark);
  border-radius: 10px;
  overflow-x: auto;
}
.token-box code { color: #d9f99d; white-space: nowrap; }
.token-actions { display: flex; gap: 10px; margin-left: auto; flex-shrink: 0; }

.link-btn {
  border: none;
  background: none;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--accent);
  cursor: pointer;
}
.link-btn:hover { text-decoration: underline; }

.credentials-card { grid-column: 1 / -1; }
.cred-count { font-size: 12.5px; font-weight: 600; color: var(--text-muted); background: var(--bg-sunken); padding: 4px 10px; border-radius: 999px; }

.cred-list { list-style: none; display: flex; flex-direction: column; }
.cred-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid var(--border);
  font-size: 14px;
}
.cred-main { display: flex; flex-direction: column; min-width: 180px; }
.cred-main code { font-size: 12px; color: var(--text-muted); }
.cred-row .muted { margin-left: auto; font-size: 12.5px; }
.row-remove {
  border: none;
  background: none;
  font-size: 18px;
  color: var(--text-disabled);
  cursor: pointer;
  padding: 2px 8px;
  border-radius: 7px;
}
.row-remove:hover { color: var(--error-text); background: var(--error-bg); }

.new-cred {
  display: flex;
  gap: 10px;
  margin-top: 16px;
  flex-wrap: wrap;
}
.new-cred input {
  flex: 1;
  min-width: 220px;
  height: 40px;
  padding: 0 13px;
  border: 1px solid var(--border);
  border-radius: 10px;
  font-size: 14px;
  font-family: inherit;
  outline: none;
}
.new-cred input:focus { border-color: var(--border-strong); }

.secret-box {
  margin-top: 14px;
  padding: 14px 16px;
  background: var(--brand-light);
  border-radius: 12px;
}
.secret-box p { font-size: 13.5px; margin-bottom: 8px; }
.secret-box code {
  display: block;
  padding: 9px 12px;
  background: var(--bg-card);
  border-radius: 8px;
  overflow-x: auto;
  white-space: nowrap;
  margin-bottom: 8px;
}

.muted { color: var(--text-muted); font-size: 13px; }

@media (max-width: 800px) {
  .settings-grid { grid-template-columns: 1fr; }
}
</style>
