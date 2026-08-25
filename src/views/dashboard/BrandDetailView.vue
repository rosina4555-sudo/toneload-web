<template>
  <div v-if="store.current">
    <!-- Header -->
    <header class="brand-header">
      <RouterLink to="/dashboard/brands" class="back-link"><PhArrowLeft :size="15" weight="bold" /> All brands</RouterLink>

      <div class="brand-title-row">
        <div class="brand-avatar font-display">{{ initials }}</div>
        <div class="brand-title">
          <h1>{{ brand.name }}</h1>
          <div class="brand-sub">
            <BaseBadge :tone="statusTone" :dot="isBuilding">{{ statusLabel }}</BaseBadge>
            <span v-if="brand.active_version" class="sub-text">{{ brand.active_version }} · {{ corpusLabel }}</span>
            <a v-if="brand.website_url" :href="brand.website_url" target="_blank" rel="noopener" class="sub-link">{{ hostname }}</a>
          </div>
        </div>
        <div class="header-actions">
          <BaseButton variant="ghost" size="sm" :disabled="isBuilding" @click="rebuildModal = true">
            <PhArrowsClockwise :size="14" /> Rebuild
          </BaseButton>
          <ConfirmDialog
            :open="rebuildModal"
            title="Rebuild identity?"
            confirm-label="Start rebuild"
            message="A new identity version will be built from the latest corpus. The current active version keeps serving until the rebuild completes."
            @confirm="doRebuild"
            @cancel="rebuildModal = false"
          />
          <ConfirmDialog
            :open="deleteModal"
            title="Delete brand?"
            confirm-label="Delete permanently"
            message="This removes the brand, its vocabulary, tone contexts and scoring history. This cannot be undone."
            :loading="acting"
            @confirm="doDelete"
            @cancel="deleteModal = false"
          />
          <button class="icon-danger" aria-label="Delete brand" @click="deleteModal = true"><PhTrash :size="16" /></button>
        </div>
      </div>

      <!-- Build progress banner -->
      <Transition name="fade">
        <div v-if="isBuilding" class="build-banner">
          <span class="pulse-ring" />
          <div class="build-copy">
            <strong>Identity build in progress…</strong>
            <span>Crawling, embedding and modelling this brand's voice. The page updates automatically — no refresh needed.</span>
          </div>
        </div>
      </Transition>
    </header>

    <!-- Tabs -->
    <nav class="tabs">
      <button
        v-for="t in tabs"
        :key="t.key"
        class="tab"
        :class="{ active: activeTab === t.key }"
        @click="setTab(t.key)"
      >
        {{ t.label }}
      </button>
    </nav>

    <!-- ── Voice overview ──────────────────────────────────────────────── -->
    <section v-if="activeTab === 'voice'" class="tab-panel">
      <div class="panel-grid">
        <div class="card">
          <h3>Voice descriptors</h3>
          <ul v-if="voice?.descriptors?.length" class="descriptor-list">
            <li v-for="d in voice.descriptors" :key="d">{{ d }}</li>
          </ul>
          <p v-else class="muted">Voice profile appears once the first build completes.</p>
        </div>
        <div class="card">
          <h3>Voice dimensions</h3>
          <template v-if="voice">
            <VoiceDimensionBar v-for="(v, k) in voice.dimensions" :key="k" :label="labelFor(k)" :value="v" />
          </template>
          <p v-else class="muted">No dimension scores yet.</p>
        </div>
      </div>

      <div class="card results-card">
        <h3>Recent scoring runs</h3>
        <table v-if="recentResults.length" class="data-table">
          <thead>
            <tr><th>Content</th><th>Channel</th><th>Tone</th><th>Score</th><th>Flags</th><th>When</th></tr>
          </thead>
          <tbody>
            <tr v-for="r in recentResults" :key="r.id">
              <td class="cell-preview">{{ r.content_preview }}</td>
              <td>{{ r.channel }}</td>
              <td>{{ r.tone_context ?? '—' }}</td>
              <td><ScorePill :score="r.alignment_score" /></td>
              <td>
                <BaseBadge v-if="r.flag_count" :tone="r.open_flag_count ? 'danger' : 'success'">{{ r.flag_count }}</BaseBadge>
                <span v-else class="muted">—</span>
              </td>
              <td class="cell-time">{{ timeAgo(r.created_at) }}</td>
            </tr>
          </tbody>
        </table>
        <p v-else class="muted">No stored scoring runs for this brand yet.</p>
      </div>
    </section>

    <!-- ── Vocabulary ──────────────────────────────────────────────────── -->
    <section v-if="activeTab === 'vocabulary'" class="tab-panel">
      <div class="card">
        <div class="panel-head">
          <div>
            <h3>Vocabulary</h3>
            <p class="panel-sub">Words the engine should block or favour. System-extracted entries come from the corpus; user-defined ones are yours.</p>
          </div>
          <form class="add-term" @submit.prevent="addTerm">
            <input v-model.trim="newTerm" type="text" placeholder="Add a term…" />
            <select v-model="newAction">
              <option value="block">Block</option>
              <option value="allow">Favour</option>
            </select>
            <BaseButton type="submit" size="sm" :loading="addingTerm">Add</BaseButton>
          </form>
        </div>

        <table v-if="vocabulary.length" class="data-table">
          <thead><tr><th>Term</th><th>Action</th><th>Source</th><th></th></tr></thead>
          <tbody>
            <tr v-for="entry in vocabulary" :key="entry.id">
              <td class="term-cell">{{ entry.term }}</td>
              <td>
                <BaseBadge :tone="entry.action === 'block' ? 'danger' : 'success'">{{ entry.action === 'block' ? 'Block' : 'Favour' }}</BaseBadge>
              </td>
              <td class="cell-time">{{ entry.source === 'user_defined' ? 'You' : 'System extracted' }}</td>
              <td class="cell-action">
                <button class="row-delete" aria-label="Remove term" @click="removeTerm(entry)">&times;</button>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-else class="muted">No vocabulary entries yet — add one above.</p>
      </div>
    </section>

    <!-- ── Tone contexts ───────────────────────────────────────────────── -->
    <section v-if="activeTab === 'tone'" class="tab-panel">
      <div class="card">
        <div class="panel-head">
          <div>
            <h3>Tone contexts</h3>
            <p class="panel-sub">Situational adjustments around the core voice — e.g. “Launch Campaign”. Tone never replaces voice; it widens or narrows tolerances.</p>
          </div>
          <form class="add-term" @submit.prevent="addTone">
            <input v-model.trim="newToneName" type="text" placeholder="e.g. Investor Update" required />
            <BaseButton type="submit" size="sm" :loading="addingTone">Add tone</BaseButton>
          </form>
        </div>

        <div v-if="toneContexts.length" class="tone-list">
          <div v-for="tone in toneContexts" :key="tone.id" class="tone-item">
            <div class="tone-main">
              <strong>{{ tone.name }}</strong>
              <BaseBadge v-if="!tone.is_active" tone="neutral">inactive</BaseBadge>
            </div>
            <textarea
              v-model="tone._descDraft"
              rows="2"
              class="tone-edit"
              placeholder="Describe when writers use this tone… (auto-saves on blur)"
              @blur="saveToneDescription(tone)"
            ></textarea>
            <button class="tone-remove" @click="removeTone(tone)">Remove tone</button>
          </div>
        </div>
        <p v-else class="muted">No tone contexts yet — add one above.</p>
      </div>
    </section>

    <!-- ── Channel overrides ───────────────────────────────────────────── -->
    <section v-if="activeTab === 'channels'" class="tab-panel">
      <div class="card">
        <h3>Channel overrides</h3>
        <p class="panel-sub">Structural thresholds per platform. Values here override system defaults for this brand only.</p>

        <div class="channel-grid">
          <div v-for="ch in channels" :key="ch.channel" class="channel-card">
            <h4>{{ channelName(ch.channel) }}</h4>
            <div class="field-slider">
              <label :for="`max-sent-${ch.channel}`">Max sentence length: <strong>{{ ch.max_sentence_length }}</strong></label>
              <input :id="`max-sent-${ch.channel}`" v-model.number="ch.max_sentence_length" type="range" min="8" max="45" @change="markChannelDirty(ch)" />
            </div>
            <div class="field-slider">
              <label :for="`min-read-${ch.channel}`">Min readability: <strong>{{ ch.min_readability }}</strong></label>
              <input :id="`min-read-${ch.channel}`" v-model.number="ch.min_readability" type="range" min="30" max="95" @change="markChannelDirty(ch)" />
            </div>
            <BaseButton v-if="ch._dirty" size="sm" :loading="savingChannel === ch.channel" @click="saveChannel(ch)">Save override</BaseButton>
            <span v-else class="saved-note">Saved</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ── Share ───────────────────────────────────────────────────────── -->
    <section v-if="activeTab === 'share'" class="tab-panel">
      <div class="card share-card">
        <h3>Shareable brand brief</h3>
        <p class="panel-sub">A public, read-only brief of this brand's voice. Anyone with the link can view it — perfect for onboarding new writers.</p>

        <div v-if="shareToken" class="share-row">
          <code class="share-link font-mono">{{ shareUrl }}</code>
          <BaseButton variant="subtle" size="sm" @click="copyShareLink"><PhCopy :size="14" /> Copy link</BaseButton>
          <button class="btn-revoke" @click="revokeShare">Revoke</button>
        </div>
        <BaseButton v-else :loading="sharing" @click="createShare"><PhLink :size="15" /> Generate share link</BaseButton>
      </div>
    </section>
  </div>

  <!-- Loading / missing states -->
  <EmptyState v-else-if="store.error && !store.loading" title="Brand not found" description="It may have been deleted.">
    <template #action>
      <BaseButton variant="ghost" @click="$router.push('/dashboard/brands')">Back to brands</BaseButton>
    </template>
  </EmptyState>
  <div v-else class="detail-loading"><span class="big-spinner" /></div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBrandsStore } from '@/stores/brands'
import { brandsApi } from '@/api/brands'
import { useToast } from '@/composables/useToast'
import { timeAgo } from '@/utils/format'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import ScorePill from '@/components/ui/ScorePill.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import VoiceDimensionBar from '@/components/dashboard/VoiceDimensionBar.vue'
import { PhArrowLeft, PhArrowsClockwise, PhTrash, PhCopy, PhLink } from '@phosphor-icons/vue'

const route = useRoute()
const router = useRouter()
const store = useBrandsStore()
const toast = useToast()

const tabs = [
  { key: 'voice', label: 'Voice & Results' },
  { key: 'vocabulary', label: 'Vocabulary' },
  { key: 'tone', label: 'Tone Contexts' },
  { key: 'channels', label: 'Channels' },
  { key: 'share', label: 'Share' },
]
const validTabs = new Set(tabs.map((t) => t.key))
const activeTab = ref(validTabs.has(route.query.tab) ? route.query.tab : 'voice')

watch(() => route.query.tab, (tab) => {
  if (validTabs.has(tab)) activeTab.value = tab
})

function setTab(key) {
  activeTab.value = key
  router.replace({ query: { ...route.query, tab: key === 'voice' ? undefined : key } })
}

const stopPolling = ref(null)
const rebuildModal = ref(false)
const deleteModal = ref(false)
const acting = ref(false)

const newTerm = ref('')
const newAction = ref('block')
const addingTerm = ref(false)

const newToneName = ref('')
const addingTone = ref(false)

const channels = ref([])
const savingChannel = ref(null)
const sharing = ref(false)

const brand = computed(() => store.current ?? {})
const isBuilding = computed(() => brand.value?.identity_status === 'building')
const voice = computed(() => brand.value?.voice)
const toneContexts = computed(() => brand.value?.tone_contexts ?? [])
const vocabulary = computed(() => brand.value?.vocabulary ?? [])
const recentResults = computed(() => brand.value?.recent_results ?? [])
const shareToken = computed(() => brand.value?.share_token)
const shareUrl = computed(() =>
  typeof window !== 'undefined' ? `${window.location.origin}/brief/${shareToken.value}` : '',
)
const initials = computed(() =>
  (brand.value?.name ?? '').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase(),
)
const hostname = computed(() => {
  try { return new URL(brand.value.website_url).hostname.replace('www.', '') } catch { return '' }
})
const statusLabel = computed(() => ({
  ready: 'Ready', building: 'Building', pending: 'Queued', failed: 'Failed',
}[brand.value?.identity_status] ?? ''))
const statusTone = computed(() => ({
  ready: 'success', building: 'info', pending: 'neutral', failed: 'danger',
}[brand.value?.identity_status] ?? 'neutral'))
const corpusLabel = computed(() =>
  brand.value?.corpus_mode === 'large_corpus' ? 'large corpus mode' : 'small corpus mode',
)

const DIMENSION_LABELS = {
  formality: 'Formality', warmth: 'Warmth', energy: 'Energy', complexity: 'Complexity',
  humor: 'Humour', directness: 'Directness',
  persuasion_intensity: 'Persuasion intensity', emotional_expressiveness: 'Emotional expressiveness',
}
const labelFor = (k) => DIMENSION_LABELS[k] ?? k

const CHANNEL_NAMES = {
  linkedin: 'LinkedIn', twitter_x: 'Twitter / X', blog: 'Blog', email: 'Email',
}
const channelName = (c) => CHANNEL_NAMES[c] ?? c

onMounted(async () => {
  try {
    const data = await store.fetchOne(route.params.id)

    // Seed channel cards with existing overrides or sensible system defaults
    channels.value = ['linkedin', 'twitter_x', 'blog', 'email'].map((channel) => {
      const existing = data.channel_overrides.find((o) => o.channel === channel)
      return existing
        ? { ...existing, _dirty: false }
        : { channel, max_sentence_length: defaultMaxSent(channel), min_readability: 60, _dirty: false }
    })

    // Local draft for tone descriptions so blur-save only fires on real edits
    toneContexts.value.forEach((t) => { t._descDraft = t.description })

    if (data.identity_status === 'building') startPolling()
    if (route.query.rebuild) doRebuild()
  } catch {
    /* error state handled in template via store.error */
  }
})

onBeforeUnmount(() => stopPolling.value?.())

function startPolling() {
  stopPolling.value?.()
  stopPolling.value = store.pollUntilReady(brand.value.id, {
    onUpdate(updated) {
      Object.assign(brand.value, updated)
    },
    onDone(updated) {
      Object.assign(brand.value, updated)
      toast.success(`${updated.name}'s identity is ready.`)
    },
  })
}

function defaultMaxSent(channel) {
  return { linkedin: 25, twitter_x: 18, blog: 32, email: 28 }[channel] ?? 26
}

/* ── Actions ─────────────────────────────────────────────────────────── */

async function doRebuild() {
  rebuildModal.value = false
  acting.value = true
  try {
    await store.rebuild(brand.value.id)
    toast.info(`Rebuild started for ${brand.value.name}.`)
    startPolling()
  } catch (e) {
    toast.error(e.message)
  } finally {
    acting.value = false
  }
}

async function doDelete() {
  deleteModal.value = false
  acting.value = true
  try {
    const name = brand.value.name
    await store.remove(route.params.id)
    stopPolling.value?.()
    toast.success(`${name} deleted.`)
    router.push('/dashboard/brands')
  } catch (e) {
    toast.error(e.message)
  } finally {
    acting.value = false
  }
}

async function saveChannel(ch) {
  savingChannel.value = ch.channel
  try {
    await brandsApi.saveChannelOverride(brand.value.id, ch.channel, {
      max_sentence_length: ch.max_sentence_length,
      min_readability: ch.min_readability,
    })
    ch._dirty = false
    toast.success(`${channelName(ch.channel)} override saved.`)
  } catch (e) {
    toast.error(e.message)
  } finally {
    savingChannel.value = null
  }
}

function markChannelDirty(ch) {
  ch._dirty = true
}

async function addTerm() {
  if (!newTerm.value) return
  addingTerm.value = true
  try {
    const entry = await brandsApi.addVocabularyEntry(brand.value.id, { term: newTerm.value, action: newAction.value })
    vocabulary.value.push(entry)
    newTerm.value = ''
    toast.success('Vocabulary entry added.')
  } catch (e) {
    toast.error(e.message)
  } finally {
    addingTerm.value = false
  }
}

async function removeTerm(entry) {
  try {
    await brandsApi.removeVocabularyEntry(brand.value.id, entry.id)
    vocabulary.value.splice(vocabulary.value.indexOf(entry), 1)
  } catch (e) {
    toast.error(e.message)
  }
}

async function addTone() {
  if (!newToneName.value) return
  addingTone.value = true
  try {
    const tone = await brandsApi.createToneContext(brand.value.id, { name: newToneName.value })
    tone._descDraft = tone.description
    toneContexts.value.push(tone)
    newToneName.value = ''
    toast.success(`Tone context “${tone.name}” created.`)
  } catch (e) {
    toast.error(e.message)
  } finally {
    addingTone.value = false
  }
}

async function saveToneDescription(tone) {
  if ((tone.description ?? '') === (tone._descDraft ?? '')) return
  try {
    const updated = await brandsApi.updateToneContext(brand.value.id, tone.id, { description: tone._descDraft })
    tone.description = updated.description
    toast.success('Tone description saved.')
  } catch (e) {
    toast.error(e.message)
  }
}

async function removeTone(tone) {
  try {
    await brandsApi.removeToneContext(brand.value.id, tone.id)
    toneContexts.value.splice(toneContexts.value.indexOf(tone), 1)
  } catch (e) {
    toast.error(e.message)
  }
}

async function createShare() {
  sharing.value = true
  try {
    const { share_token } = await brandsApi.createShareLink(brand.value.id)
    brand.value.share_token = share_token
    toast.success('Share link generated.')
  } catch (e) {
    toast.error(e.message)
  } finally {
    sharing.value = false
  }
}

async function revokeShare() {
  try {
    await brandsApi.revokeShareLink(brand.value.id)
    brand.value.share_token = null
    toast.success('Share link revoked.')
  } catch (e) {
    toast.error(e.message)
  }
}

async function copyShareLink() {
  try {
    await navigator.clipboard.writeText(shareUrl.value)
    toast.success('Link copied to clipboard.')
  } catch {
    toast.error('Could not copy — select it manually.')
  }
}
</script>

<style scoped>
.brand-header { margin-bottom: 22px; }
.back-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-muted);
  text-decoration: none;
  margin-bottom: 14px;
}
.back-link:hover { color: var(--text-primary); }

.brand-title-row { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
.brand-avatar {
  display: grid; place-items: center;
  width: 52px; height: 52px;
  border-radius: 14px;
  background: var(--bg-dark);
  color: var(--text-on-dark);
  font-size: 17px;
  font-weight: 700;
  flex-shrink: 0;
}
.brand-title h1 { font-family: 'Cabinet Grotesk', sans-serif; font-size: 26px; letter-spacing: -0.3px; }
.brand-sub { display: flex; align-items: center; gap: 10px; margin-top: 5px; flex-wrap: wrap; }
.sub-text { font-size: 13px; color: var(--text-muted); }
.sub-link { font-size: 13px; color: var(--accent-text); text-decoration: none; }
.sub-link:hover { text-decoration: underline; }

.header-actions { margin-left: auto; display: flex; align-items: center; gap: 8px; }
.icon-danger {
  display: grid; place-items: center;
  width: 36px; height: 36px;
  border-radius: 10px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--error-text);
  cursor: pointer;
}
.icon-danger:hover { background: var(--error-bg); }

.build-banner {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 18px;
  padding: 14px 18px;
  border-radius: 12px;
  background: var(--accent-light);
  color: var(--accent-text);
}
.build-copy { display: flex; flex-direction: column; gap: 2px; }
.build-copy strong { font-size: 14px; }
.build-copy span { font-size: 12.5px; opacity: 0.85; }
.pulse-ring {
  width: 10px; height: 10px;
  border-radius: 50%;
  background: var(--accent);
  animation: pulse 1.4s infinite;
  flex-shrink: 0;
}
@keyframes pulse { 50% { opacity: 0.25; transform: scale(0.8); } }

.tabs {
  display: flex;
  gap: 2px;
  border-bottom: 1.5px solid var(--border);
  margin-bottom: 22px;
  overflow-x: auto;
}
.tab {
  padding: 11px 16px;
  border: none;
  background: none;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-muted);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -1.5px;
  white-space: nowrap;
}
.tab:hover { color: var(--text-primary); }
.tab.active { color: var(--text-primary); font-weight: 600; border-color: var(--brand); }

.panel-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

.card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 20px;
}
.card h3 { font-family: 'Cabinet Grotesk', sans-serif; font-size: 16.5px; margin-bottom: 12px; }
.results-card { margin-top: 0; }

.descriptor-list { list-style: none; display: flex; flex-direction: column; gap: 9px; }
.descriptor-list li {
  position: relative;
  padding-left: 20px;
  font-size: 14.5px;
  color: var(--text-secondary);
}
.descriptor-list li::before {
  content: '';
  position: absolute;
  left: 2px;
  top: 8px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--brand);
}

.panel-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 14px;
}
.panel-sub { font-size: 13px; color: var(--text-muted); margin-top: 4px; max-width: 520px; }

.add-term { display: flex; gap: 8px; flex-wrap: wrap; }
.add-term input, .add-term select {
  height: 38px;
  padding: 0 12px;
  border: 1px solid var(--border);
  border-radius: 10px;
  font-size: 14px;
  font-family: inherit;
  background: var(--bg-card);
  outline: none;
}
.add-term input { width: 200px; }
.add-term input:focus { border-color: var(--border-strong); }

.data-table { width: 100%; border-collapse: collapse; font-size: 13.5px; }
.data-table th {
  text-align: left;
  font-size: 11.5px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: var(--text-disabled);
  padding: 8px 10px;
  border-bottom: 1px solid var(--border);
}
.data-table td {
  padding: 11px 10px;
  border-bottom: 1px solid var(--border);
  vertical-align: middle;
}
.data-table tr:last-child td { border-bottom: none; }
.cell-preview {
  max-width: 320px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--text-secondary);
}
.term-cell { font-weight: 600; }
.cell-time { color: var(--text-muted); font-size: 12.5px; }
.cell-action { text-align: right; }

.row-delete {
  border: none;
  background: none;
  font-size: 17px;
  color: var(--text-disabled);
  cursor: pointer;
  padding: 2px 8px;
  border-radius: 7px;
}
.row-delete:hover { color: var(--error-text); background: var(--error-bg); }

.tone-list { display: flex; flex-direction: column; gap: 12px; margin-top: 6px; }
.tone-item {
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 14px 16px;
}
.tone-main { display: flex; align-items: center; gap: 10px; }
.tone-edit {
  width: 100%;
  margin-top: 9px;
  padding: 9px 12px;
  border: 1px solid var(--border);
  border-radius: 9px;
  font-size: 13.5px;
  font-family: inherit;
  resize: vertical;
  background: var(--bg-page);
  outline: none;
}
.tone-edit:focus { border-color: var(--border-strong); background: var(--bg-card); }
.tone-remove {
  margin-top: 8px;
  border: none;
  background: none;
  font-size: 12.5px;
  color: var(--text-muted);
  cursor: pointer;
  text-decoration: underline;
}
.tone-remove:hover { color: var(--error-text); }

.channel-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 14px;
  margin-top: 14px;
}
.channel-card {
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.channel-card h4 { font-size: 14.5px; }
.field-slider label { display: block; font-size: 13px; color: var(--text-secondary); margin-bottom: 6px; }
.field-slider input[type='range'] { width: 100%; accent-color: var(--brand); }
.saved-note { font-size: 12.5px; color: var(--success-text); font-weight: 600; }

.share-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-top: 6px; }
.share-link {
  flex: 1;
  min-width: 220px;
  padding: 10px 14px;
  background: var(--bg-sunken);
  border-radius: 9px;
  overflow-x: auto;
  white-space: nowrap;
}
.btn-revoke {
  height: 34px;
  padding: 0 14px;
  border: none;
  border-radius: 9px;
  background: var(--error-bg);
  color: var(--error-text);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}
.btn-revoke:hover { background: #fde2e2; }

.muted { color: var(--text-muted); font-size: 14px; }

.detail-loading { display: grid; place-items: center; min-height: 300px; }
.big-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--bg-sunken);
  border-top-color: var(--brand);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@media (max-width: 800px) {
  .panel-grid { grid-template-columns: 1fr; }
  .header-actions { margin-left: 0; width: 100%; justify-content: flex-end; }
}
</style>
