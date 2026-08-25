/**
 * Mock database — seeded, in-memory, lives for the duration of the tab.
 *
 * The shape of every record mirrors what the real Brandload (Varnish) API
 * returns (see brandload_specification.md §6–§13). When the backend ships,
 * flip VITE_USE_MOCK=false and this whole folder stops being used — no
 * call-site changes required.
 */

export const PLAN_LIMITS = {
  free:   { brands: 1,  checks_per_day: 20,  shareable_briefs: false, team_features: false },
  pro:    { brands: 10, checks_per_day: null, shareable_briefs: true,  team_features: false },
  agency: { brands: null, checks_per_day: null, shareable_briefs: true, team_features: true },
}

export const BILLING_PLANS = [
  {
    id: 'free',
    name: 'Free',
    price_monthly: 0,
    tagline: 'Try the engine on a single brand.',
    limits: PLAN_LIMITS.free,
    features: ['1 brand profile', '20 checks / day', 'Core voice + vocabulary scoring'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price_monthly: 29,
    tagline: 'For freelancers and single-brand teams.',
    limits: PLAN_LIMITS.pro,
    features: ['10 brand profiles', 'Unlimited checks', 'Shareable brand briefs', 'Priority support'],
  },
  {
    id: 'agency',
    name: 'Agency',
    price_monthly: 79,
    tagline: 'For agencies juggling many client voices.',
    limits: PLAN_LIMITS.agency,
    features: ['Unlimited brand profiles', 'Unlimited checks', 'Up to 5 writers', 'Team analytics', 'Shareable brand briefs'],
    popular: true,
  },
]

const now = Date.now()
const iso = (offsetMinutes) => new Date(now - offsetMinutes * 60_000).toISOString()

let uid = 0
export const nextId = (prefix = 'id') => `${prefix}_${(++uid).toString(36)}${Math.random().toString(36).slice(2, 8)}`

/* ── Users ──────────────────────────────────────────────────────────────── */

export const users = [
  {
    id: 'usr_demo',
    name: 'Amara Osei',
    email: 'demo@brandload.so',
    password: 'brandload123', // demo credentials — documented in the README
    plan: 'agency',
    avatar_url: null,
    created_at: iso(60 * 24 * 120),
  },
]

/* ── Teams ──────────────────────────────────────────────────────────────── */

export const teams = [
  {
    id: 'team_brightlane',
    name: 'Brightlane Collective',
    owner_id: 'usr_demo',
    seats_limit: 5,
    created_at: iso(60 * 24 * 100),
  },
]

export const teamMembers = [
  { id: 'mem_1', team_id: 'team_brightlane', user_id: 'usr_demo', name: 'Amara Osei', email: 'demo@brandload.so', role: 'owner', joined_at: iso(60 * 24 * 100) },
  { id: 'mem_2', team_id: 'team_brightlane', user_id: null, name: 'Kofi Mensah', email: 'kofi@brightlane.co', role: 'admin', joined_at: iso(60 * 24 * 64) },
  { id: 'mem_3', team_id: 'team_brightlane', user_id: null, name: 'Lena Ortiz', email: 'lena@brightlane.co', role: 'writer', joined_at: iso(60 * 24 * 31) },
  { id: 'mem_4', team_id: 'team_brightlane', user_id: null, name: 'Tom Baker', email: 'tom@brightlane.co', role: 'writer', joined_at: iso(60 * 24 * 9) },
]

/** BR-T-04: invites expire after 7 days */
export const teamInvites = [
  { id: 'inv_1', team_id: 'team_brightlane', email: 'nadia@brightlane.co', role: 'writer', status: 'pending', created_at: iso(60 * 24 * 2), expires_at: new Date(now + 5 * 24 * 60 * 60_000).toISOString() },
]

/* ── Brands ─────────────────────────────────────────────────────────────── */

export const brands = [
  {
    id: 'brn_fintech',
    name: 'Ledgerly',
    website_url: 'https://ledgerly.io',
    description: 'SMB bookkeeping platform — plain-spoken fintech voice.',
    identity_status: 'ready',
    corpus_mode: 'large_corpus',
    active_version: 'v3',
    alignment_avg: 86,
    team_id: 'team_brightlane',
    share_token: 'brf_7kd93ma2',
    created_at: iso(60 * 24 * 90),
    updated_at: iso(60 * 30),
    voice: {
      descriptors: ['Direct but warm', 'Numbers-first storytelling', 'Never salesy'],
      dimensions: { formality: 68, warmth: 62, energy: 55, complexity: 48, humor: 22, directness: 84, persuasion_intensity: 58, emotional_expressiveness: 35 },
    },
  },
  {
    id: 'brn_lifestyle',
    name: 'Solstice Living',
    website_url: 'https://solsticeliving.com',
    description: 'Slow-lifestyle brand — sensory, unhurried prose.',
    identity_status: 'ready',
    corpus_mode: 'small_corpus',
    active_version: 'v2',
    alignment_avg: 91,
    team_id: 'team_brightlane',
    share_token: null,
    created_at: iso(60 * 24 * 45),
    updated_at: iso(60 * 12),
    voice: {
      descriptors: ['Quietly confident', 'Sensory and concrete', 'Long, breathing sentences'],
      dimensions: { formality: 40, warmth: 88, energy: 42, complexity: 35, humor: 30, directness: 52, persuasion_intensity: 38, emotional_expressiveness: 76 },
    },
  },
  {
    id: 'brn_devtool',
    name: 'Hookline',
    website_url: 'https://hookline.dev',
    description: 'Webhooks infrastructure for developers.',
    identity_status: 'building',
    corpus_mode: 'large_corpus',
    active_version: null,
    alignment_avg: null,
    team_id: 'team_brightlane',
    share_token: null,
    created_at: iso(18),
    updated_at: iso(18),
    voice: null,
  },
]

/* ── Tone contexts ──────────────────────────────────────────────────────── */

export const toneContexts = [
  { id: 'tone_launch', brand_id: 'brn_fintech', name: 'Launch Campaign', description: 'Announcement copy for product launches — energetic but credible.', is_active: true, created_at: iso(60 * 24 * 80) },
  { id: 'tone_support', brand_id: 'brn_fintech', name: 'Support Response', description: 'Customer-facing replies — calm, precise, empathetic.', is_active: true, created_at: iso(60 * 24 * 76) },
  { id: 'tone_social', brand_id: 'brn_lifestyle', name: 'Social Caption', description: 'Short-form captions — soft, evocative, minimal hashtags.', is_active: true, created_at: iso(60 * 24 * 40) },
]

/* ── Vocabulary ─────────────────────────────────────────────────────────── */

export const vocabulary = [
  { id: 'voc_1', brand_id: 'brn_fintech', term: 'revolutionary', source: 'system_extracted', action: 'block' },
  { id: 'voc_2', brand_id: 'brn_fintech', term: 'game-changer', source: 'system_extracted', action: 'block' },
  { id: 'voc_3', brand_id: 'brn_fintech', term: 'reconciliation', source: 'system_extracted', action: 'allow' },
  { id: 'voc_4', brand_id: 'brn_fintech', term: 'synergy', source: 'user_defined', action: 'block' },
  { id: 'voc_5', brand_id: 'brn_lifestyle', term: 'hack', source: 'user_defined', action: 'block' },
  { id: 'voc_6', brand_id: 'brn_lifestyle', term: 'unhurried', source: 'system_extracted', action: 'allow' },
]

/* ── Channel overrides ──────────────────────────────────────────────────── */

export const channelOverrides = [
  { id: 'cho_1', brand_id: 'brn_fintech', channel: 'linkedin', max_sentence_length: 25, min_readability: 60 },
  { id: 'cho_2', brand_id: 'brn_lifestyle', channel: 'twitter_x', max_sentence_length: 18, min_readability: 70 },
]

/* ── Analysis results ───────────────────────────────────────────────────── */

export const analysisResults = [
  { id: 'anl_1', brand_id: 'brn_fintech', content_preview: 'Ledgerly makes reconciliation effortless so you close the books before lunch…', alignment_score: 92, confidence_score: 'high', channel: 'linkedin', tone_context: 'Launch Campaign', flags: [], created_at: iso(95), is_stored: true },
  {
    id: 'anl_2', brand_id: 'brn_fintech', content_preview: 'Our revolutionary dashboard is a game-changer for your finance team…', alignment_score: 54, confidence_score: 'medium', channel: 'blog', tone_context: null,
    flags: [
      { phrase: 'revolutionary', type: 'vocabulary', severity: 'high', resolution: null, suggestion: 'Describe what it actually changes instead of labelling it.' },
      { phrase: 'game-changer', type: 'vocabulary', severity: 'high', resolution: null, suggestion: 'Lead with a concrete outcome: “closes books 3× faster”.' },
      { phrase: 'your finance team', type: 'structural', severity: 'low', resolution: 'overridden_by_channel', suggestion: null },
    ],
    created_at: iso(60 * 26), is_stored: true,
  },
  { id: 'anl_3', brand_id: 'brn_lifestyle', content_preview: 'Morning light pools across linen sheets. Nothing hurries here…', alignment_score: 96, confidence_score: 'very_high', channel: 'instagram', tone_context: 'Social Caption', flags: [], created_at: iso(60 * 31), is_stored: true },
  {
    id: 'anl_4', brand_id: 'brn_lifestyle', content_preview: 'This productivity hack will change how you relax…', alignment_score: 47, confidence_score: 'low', channel: 'blog', tone_context: null,
    flags: [
      { phrase: 'hack', type: 'vocabulary', severity: 'high', resolution: null, suggestion: '“Ritual” or “practice” fits the slow-living register.' },
      { phrase: 'will change how you', type: 'structural', severity: 'medium', resolution: null, suggestion: 'Soften into invitation rather than promise.' },
    ],
    created_at: iso(60 * 50), is_stored: true,
  },
  { id: 'anl_5', brand_id: 'brn_fintech', content_preview: 'Close the books 3× faster with automated reconciliation…', alignment_score: 88, confidence_score: 'high', channel: 'email', tone_context: 'Launch Campaign', flags: [], created_at: iso(60 * 74), is_stored: true },
  { id: 'anl_6', brand_id: 'brn_fintech', content_preview: 'Hey folks! Super stoked to announce something HUGE…', alignment_score: 51, confidence_score: 'medium', channel: 'linkedin', tone_context: 'Launch Campaign', flags: [{ phrase: 'stoked', type: 'tone', severity: 'medium', resolution: null, suggestion: 'Credible excitement: “Today we’re shipping…”.' }], created_at: iso(60 * 98), is_stored: true },
  { id: 'anl_7', brand_id: 'brn_lifestyle', content_preview: 'Consider the table set for one, at dusk, by an open window…', alignment_score: 90, confidence_score: 'high', channel: 'blog', tone_context: 'Social Caption', flags: [], created_at: iso(60 * 120), is_stored: true },
  { id: 'anl_8', brand_id: 'brn_fintech', content_preview: 'We built Ledgerly because month-end shouldn’t feel like tax season…', alignment_score: 85, confidence_score: 'high', channel: 'google_docs', tone_context: 'Support Response', flags: [], created_at: iso(60 * 140), is_stored: true },
]

/* ── Recent activity feed (dashboard overview) ──────────────────────────── */

export const activities = [
  { id: 'act_1', type: 'build.completed', message: 'Identity build completed for Solstice Living', brand_id: 'brn_lifestyle', created_at: iso(60 * 12) },
  { id: 'act_2', type: 'analysis.flagged', message: '2 high-severity flags on “Our revolutionary dashboard…”', brand_id: 'brn_fintech', created_at: iso(60 * 26) },
  { id: 'act_3', type: 'team.invited', message: 'Nadia was invited as a writer', brand_id: null, created_at: iso(60 * 24 * 2) },
  { id: 'act_4', type: 'build.started', message: 'Identity build started for Hookline', brand_id: 'brn_devtool', created_at: iso(18) },
  { id: 'act_5', type: 'share.created', message: 'Share brief link generated for Ledgerly', brand_id: 'brn_fintech', created_at: iso(60 * 24 * 3) },
]

/* ── Billing ────────────────────────────────────────────────────────────── */

export const subscriptions = [
  {
    user_id: 'usr_demo',
    plan: 'agency',
    status: 'active',
    current_period_end: new Date(now + 19 * 24 * 60 * 60_000).toISOString(),
    invoices: [
      { id: 'in_3', amount: 79, currency: 'usd', status: 'paid', date: iso(60 * 24 * 11) },
      { id: 'in_2', amount: 79, currency: 'usd', status: 'paid', date: iso(60 * 24 * 41) },
      { id: 'in_1', amount: 29, currency: 'usd', status: 'paid', date: iso(60 * 24 * 71) },
    ],
  },
]

/** BR-S-09: free plan usage counter */
export const usage = { user_id: 'usr_demo', date: new Date().toDateString(), checks_today: 14 }

/* ── Settings: API credentials & extension tokens (BR-A-06) ─────────────── */

export const apiCredentials = [
  { id: 'key_1', label: 'CI pipeline', prefix: 'bl_live_aX3', created_at: iso(60 * 24 * 60), last_used_at: iso(60 * 5) },
  { id: 'key_2', label: 'Zapier integration', prefix: 'bl_live_kQ9', created_at: iso(60 * 24 * 20), last_used_at: iso(60 * 24 * 4) },
]

/* ── Helpers ────────────────────────────────────────────────────────────── */

export function publicUser(user) {
  const { password, ...rest } = user
  return rest
}

export function findBrand(id) {
  return brands.find((b) => b.id === id)
}

export function resetDb() {
  // Used by tests to get a clean slate.
  brands.length = 0
  analysisResults.length = 0
}
