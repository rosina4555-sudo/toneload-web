<template>
  <div class="wizard-page">
    <PageHeader title="New Brand" subtitle="Three steps to load a client's identity." />

    <div class="wizard-card">
      <!-- Step indicator -->
      <ol class="steps">
        <li v-for="(s, i) in stepLabels" :key="s" :class="{ active: i === step, done: i < step }">
          <span class="step-dot">{{ i < step ? '✓' : i + 1 }}</span>
          {{ s }}
        </li>
      </ol>

      <!-- Step 1: Basic info -->
      <section v-if="step === 0" class="step-body">
        <h3>Basic info</h3>
        <div class="field">
          <label for="brand-name">Brand name *</label>
          <input id="brand-name" v-model.trim="form.name" type="text" placeholder="e.g. Ledgerly" />
          <span v-if="errors.name" class="field-error">{{ errors.name }}</span>
        </div>
        <div class="field">
          <label for="brand-url">Website URL</label>
          <input id="brand-url" v-model.trim="form.website_url" type="url" placeholder="https://client.com" @blur="estimateCorpus" />
          <p v-if="corpusEstimate" class="hint">{{ corpusEstimate }}</p>
        </div>
        <div class="field">
          <label for="brand-desc">Description <span class="optional">optional</span></label>
          <textarea id="brand-desc" v-model.trim="form.description" rows="3" placeholder="One line on what this brand is about" />
        </div>
      </section>

      <!-- Step 2: Seed content -->
      <section v-if="step === 1" class="step-body">
        <h3>Seed content</h3>
        <p class="step-hint">
          Optional — paste a few paragraphs that capture how this brand writes.
          We'll combine it with public pages during the build.
        </p>
        <textarea
          v-model="form.sample_copy"
          rows="9"
          class="copy-area"
          placeholder="Paste sample copy here…"
        />
        <div class="word-count">{{ wordCount }} words</div>
      </section>

      <!-- Step 3: Assign & confirm -->
      <section v-if="step === 2" class="step-body">
        <h3>Assign &amp; confirm</h3>
        <div class="review-grid">
          <div class="review-row"><span>Name</span><strong>{{ form.name }}</strong></div>
          <div class="review-row"><span>Website</span><strong>{{ form.website_url || '—' }}</strong></div>
          <div class="review-row"><span>Description</span><strong>{{ form.description || '—' }}</strong></div>
          <div class="review-row"><span>Sample copy</span><strong>{{ wordCount }} words</strong></div>
        </div>

        <div class="field">
          <label for="assign-team">Assign to</label>
          <select id="assign-team" v-model="form.team_id" :disabled="!teamId">
            <option :value="teamId ?? null">Brightlane Collective (team)</option>
            <option :value="null">Personal workspace</option>
          </select>
          <p class="hint">Team assignment lets every writer see this brand in the extension.</p>
        </div>

        <div class="build-note">
          <PhInfo :size="18" weight="fill" />
          On submit we enqueue an identity build. It typically completes within a minute — you can watch progress on the brand page.
        </div>
      </section>

      <!-- Nav buttons -->
      <footer class="wizard-footer">
        <BaseButton v-if="step > 0" variant="ghost" @click="step--">Back</BaseButton>
        <span class="spacer" />
        <BaseButton v-if="step < 2" @click="next">Continue</BaseButton>
        <BaseButton v-else :loading="submitting" @click="submit">Create brand &amp; build identity</BaseButton>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useBrandsStore } from '@/stores/brands'
import { useToast } from '@/composables/useToast'
import PageHeader from '@/components/ui/PageHeader.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { PhInfo } from '@phosphor-icons/vue'

const router = useRouter()
const store = useBrandsStore()
const toast = useToast()

const stepLabels = ['Basic info', 'Seed content', 'Assign & confirm']
const step = ref(0)
const submitting = ref(false)
const errors = reactive({ name: '' })

const teamId = 'team_brightlane'
const form = reactive({
  name: '',
  website_url: '',
  description: '',
  sample_copy: '',
  team_id: teamId,
})

const corpusEstimate = ref('')

const wordCount = computed(() =>
  form.sample_copy.trim() ? form.sample_copy.trim().split(/\s+/).length : 0,
)

function next() {
  if (!validate()) return
  step.value++
}

function validate() {
  errors.name = ''
  if (step.value === 0) {
    if (!form.name) {
      errors.name = 'Brand name is required.'
      return false
    }
    if (form.website_url && !/^https?:\/\/.+\..+/.test(form.website_url)) {
      toast.error('Website URL must look like https://example.com')
      return false
    }
  }
  return true
}

function estimateCorpus() {
  const url = form.website_url
  if (!url || !/^https?:\/\//.test(url)) {
    corpusEstimate.value = ''
    return
  }
  // Mock heuristic — the real API returns a corpus quality estimate endpoint.
  corpusEstimate.value = 'Looks good — we expect enough public content for a solid build.'
}

async function submit() {
  submitting.value = true
  try {
    const brand = await store.create({
      name: form.name,
      website_url: form.website_url || null,
      description: form.description || null,
      team_id: form.team_id,
      sample_copy: form.sample_copy || null,
    })
    toast.success(`Brand created — building ${brand.name}'s identity…`)
    router.push(`/dashboard/brands/${brand.id}`)
  } catch (e) {
    toast.error(e.message)
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.wizard-page { max-width: 680px; margin: 0 auto; }

.wizard-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 28px;
}

.steps {
  display: flex;
  gap: 8px;
  list-style: none;
  margin-bottom: 28px;
}
.steps li {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-disabled);
  padding-bottom: 10px;
  border-bottom: 2px solid var(--border);
}
.steps li.active { color: var(--text-primary); border-color: var(--brand); }
.steps li.done { color: var(--accent-text); border-color: var(--accent); }
.step-dot {
  display: grid; place-items: center;
  width: 22px; height: 22px;
  border-radius: 50%;
  background: var(--bg-sunken);
  font-size: 11px;
  font-weight: 700;
}
.steps li.active .step-dot { background: var(--brand); color: var(--text-primary); }
.steps li.done .step-dot { background: var(--accent-light); }

.step-body h3 { font-family: 'Cabinet Grotesk', sans-serif; font-size: 19px; margin-bottom: 16px; }
.step-hint { font-size: 14px; color: var(--text-muted); margin-bottom: 14px; }

.field { margin-bottom: 18px; }
.field label { display: block; font-size: 13.5px; font-weight: 600; margin-bottom: 7px; }
.optional { font-weight: 400; color: var(--text-disabled); }
.field input, .field textarea, .field select {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid var(--border);
  border-radius: 10px;
  font-size: 15px;
  font-family: inherit;
  background: var(--bg-card);
  color: var(--text-primary);
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.field input:focus, .field textarea:focus, .field select:focus {
  border-color: var(--border-strong);
  box-shadow: 0 0 0 3px rgba(0, 102, 255, 0.12);
}
.field textarea { resize: vertical; }
.field-error { color: var(--error-text); font-size: 12.5px; margin-top: 6px; display: block; }
.hint { font-size: 12.5px; color: var(--text-muted); margin-top: 6px; }

.copy-area { resize: vertical; }
.word-count { text-align: right; font-size: 12px; color: var(--text-disabled); margin-top: 6px; }

.review-grid { border: 1px solid var(--border); border-radius: 12px; overflow: hidden; margin-bottom: 18px; }
.review-row {
  display: grid;
  grid-template-columns: 130px 1fr;
  gap: 12px;
  padding: 11px 14px;
  font-size: 14px;
  border-bottom: 1px solid var(--border);
}
.review-row:last-child { border-bottom: none; }
.review-row span { color: var(--text-muted); }

.build-note {
  display: flex;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 10px;
  background: var(--brand-light);
  color: var(--brand-text);
  font-size: 13px;
}
.build-note svg { flex-shrink: 0; margin-top: 1px; }

.wizard-footer { display: flex; gap: 12px; margin-top: 24px; }
.spacer { flex: 1; }
.wizard-footer > .base-btn:first-child { order: -1; }
</style>
