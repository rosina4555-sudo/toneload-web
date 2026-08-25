/**
 * Axios mock adapter — the single switch between the mock world and the real API.
 *
 * Enabled while VITE_USE_MOCK !== 'false'. Every request that flows through
 * the shared axios instance is answered here with realistic latency, status
 * codes and payload shapes identical to the real Brandload API contract.
 * Swapping to the live backend later is a one-line env change; no call sites
 * are ever modified.
 */

import {
  PLAN_LIMITS,
  BILLING_PLANS,
  users,
  teams,
  teamMembers,
  teamInvites,
  brands,
  toneContexts,
  vocabulary,
  channelOverrides,
  analysisResults,
  activities,
  subscriptions,
  usage,
  apiCredentials,
  publicUser,
  findBrand,
  nextId,
} from './db'

export const isMockEnabled = () => import.meta.env.VITE_USE_MOCK !== 'false'

/* ── Plumbing ───────────────────────────────────────────────────────────── */

const delay = (ms = 120 + Math.random() * 280) => new Promise((r) => setTimeout(r, ms))

function fail(status, detail) {
  const err = new Error(typeof detail === 'string' ? detail : 'Request failed')
  err.response = { status, data: typeof detail === 'string' ? { detail } : detail }
  return Promise.reject(err)
}

function noContent() {
  return { data: null, status: 204, statusText: 'No Content', headers: {}, config: {} }
}

/** Current signed-in user — first seeded user in mock mode. */
const currentUser = () => users[0]

const currentUserTeam = () => teams.find((t) => t.owner_id === currentUser().id) ?? teams[0] ?? null

const fakeToken = () => `mock.${btoa(String(Math.random())).replace(/=/g, '')}.${Date.now()}`

/* ── Build pipeline simulation (spec §7) ────────────────────────────────── *
 * New/rebuilding brands sit in "building" for ~15s so the dashboard's
 * polling UI can be exercised end-to-end against the mock.                  */

function scheduleBuildCompletion(brandId, ms = 15000) {
  setTimeout(() => {
    const brand = findBrand(brandId)
    if (!brand || brand.identity_status !== 'building') return
    brand.identity_status = 'ready'
    brand.active_version = `v${1 + Math.floor(Math.random() * 4)}`
    brand.corpus_mode = Math.random() > 0.4 ? 'large_corpus' : 'small_corpus'
    brand.alignment_avg = 78 + Math.floor(Math.random() * 16)
    brand.updated_at = new Date().toISOString()
    if (!brand.voice) {
      brand.voice = {
        descriptors: ['Confident and plain-spoken', 'Concrete over abstract', 'Short declarative rhythm'],
        dimensions: { formality: 60, warmth: 55, energy: 50, complexity: 45, humor: 25, directness: 75, persuasion_intensity: 55, emotional_expressiveness: 40 },
      }
    }
    activities.unshift({
      id: nextId('act'),
      type: 'build.completed',
      message: `Identity build completed for ${brand.name}`,
      brand_id: brand.id,
      created_at: new Date().toISOString(),
    })
  }, ms)
}

/* ── Route table ────────────────────────────────────────────────────────── *
 * [method, pattern, handler] where handler(captures, body, query).          */

const SEG = '([^/]+)'
const noContentHandler = () => noContent()

const routes = [
  // ── Auth ───────────────────────────────────────────────────────────────
  ['POST', /^\/auth\/signin$/, (_c, body) => {
    const user = users.find((u) => u.email.toLowerCase() === String(body?.email ?? '').toLowerCase())
    if (!user || user.password !== body?.password) return fail(401, 'Invalid email or password.')
    return ok({ access_token: fakeToken(), user: publicUser(user) })
  }],
  ['POST', /^\/auth\/signup$/, (_c, body) => {
    if (users.some((u) => u.email.toLowerCase() === String(body?.email ?? '').toLowerCase())) {
      return fail(400, 'An account with this email already exists.')
    }
    const user = {
      id: nextId('usr'),
      name: body?.name ?? 'New User',
      email: body.email,
      password: body.password,
      plan: 'free',
      avatar_url: null,
      created_at: new Date().toISOString(),
    }
    users.push(user)
    return ok({ access_token: fakeToken(), user: publicUser(user) }, 201)
  }],
  ['POST', /^\/auth\/refresh$/, () => ok({ access_token: fakeToken(), user: publicUser(currentUser()) })],
  ['POST', /^\/auth\/logout$/, noContentHandler],
  ['GET', /^\/auth\/me$/, () => ok(publicUser(currentUser()))],
  ['PATCH', /^\/auth\/me$/, (_c, body) => {
    Object.assign(currentUser(), { name: body.name ?? currentUser().name, email: body.email ?? currentUser().email })
    return ok(publicUser(currentUser()))
  }],
  ['GET', /^\/auth\/api-credentials$/, () => ok(apiCredentials)],
  ['POST', /^\/auth\/api-credentials$/, (_c, body) => {
    if (apiCredentials.length >= 10) return fail(403, 'You can have at most 10 active API credentials.')
    const credential = { id: nextId('key'), label: body.label, prefix: `bl_live_${Math.random().toString(36).slice(2, 5)}`, created_at: new Date().toISOString(), last_used_at: null }
    apiCredentials.push(credential)
    return ok({ credential, secret: `${credential.prefix}_${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}` }, 201)
  }],
  ['DELETE', new RegExp(`^\\/auth\\/api-credentials\\/${SEG}$`), (c) => {
    const i = apiCredentials.findIndex((k) => k.id === c[0])
    if (i === -1) return fail(404, 'Credential not found.')
    apiCredentials.splice(i, 1)
    return noContent()
  }],
  ['POST', /^\/auth\/extension-token$/, () => ok({ token: fakeToken(), expires_in: 7200 })],

  // ── Dashboard stats ────────────────────────────────────────────────────
  ['GET', /^\/dashboard\/stats$/, () => {
    const mine = brands.filter((b) => b.team_id === currentUserTeam()?.id)
    const scored = mine.filter((b) => b.alignment_avg != null)
    return ok({
      active_brands: mine.filter((b) => b.identity_status === 'ready').length,
      building_brands: mine.filter((b) => b.identity_status === 'building').length,
      avg_alignment: scored.length ? Math.round(scored.reduce((s, b) => s + b.alignment_avg, 0) / scored.length) : null,
      checks_today: usage.checks_today,
      checks_limit: PLAN_LIMITS[currentUser().plan].checks_per_day,
      open_flags_7d: analysisResults.flatMap((r) => r.flags).filter((f) => f.resolution == null).length,
      recent_activity: activities.slice(0, 6),
    })
  }],

  // ── Brands ─────────────────────────────────────────────────────────────
  ['GET', /^\/brands$/, (_c, _b, q) => {
    let list = [...brands].sort((a, b) => b.created_at.localeCompare(a.created_at))
    if (q?.search) {
      const s = String(q.search).toLowerCase()
      list = list.filter((b) => b.name.toLowerCase().includes(s) || (b.description ?? '').toLowerCase().includes(s))
    }
    return ok({ items: list.map(serializeBrand), total: list.length })
  }],
  ['POST', /^\/brands$/, (_c, body) => {
    // BR-P-01..03 + BR-P-05: plan limit enforced at creation time
    const limit = PLAN_LIMITS[currentUser().plan].brands
    if (limit !== null && brands.length >= limit) {
      return fail(403, `Your ${currentUser().plan} plan allows ${limit} brand profile${limit > 1 ? 's' : ''}. Upgrade to add more.`)
    }
    const brand = {
      id: nextId('brn'),
      name: body.name,
      website_url: body.website_url ?? null,
      description: body.description ?? null,
      identity_status: 'building',
      corpus_mode: null,
      active_version: null,
      alignment_avg: null,
      team_id: body.team_id ?? null,
      share_token: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      voice: null,
    }
    brands.push(brand)
    activities.unshift({ id: nextId('act'), type: 'build.started', message: `Identity build started for ${brand.name}`, brand_id: brand.id, created_at: brand.created_at })
    scheduleBuildCompletion(brand.id)
    return ok(serializeBrand(brand), 201)
  }],
  ['GET', new RegExp(`^\\/brands\\/${SEG}$`), (c) => {
    const brand = findBrand(c[0])
    if (!brand) return fail(404, 'Brand not found.')
    return ok({
      ...serializeBrand(brand),
      tone_contexts: toneContexts.filter((t) => t.brand_id === brand.id),
      vocabulary: vocabulary.filter((v) => v.brand_id === brand.id),
      channel_overrides: channelOverrides.filter((ch) => ch.brand_id === brand.id),
      recent_results: analysisResults
        .filter((r) => r.brand_id === brand.id)
        .sort((a, b) => b.created_at.localeCompare(a.created_at))
        .slice(0, 5)
        .map((r) => ({ ...r, flag_count: r.flags.length })),
    })
  }],
  ['PATCH', new RegExp(`^\\/brands\\/${SEG}$`), (c, body) => {
    const brand = findBrand(c[0])
    if (!brand) return fail(404, 'Brand not found.')
    for (const key of ['name', 'description', 'website_url']) {
      if (body[key] !== undefined) brand[key] = body[key]
    }
    brand.updated_at = new Date().toISOString()
    return ok(serializeBrand(brand))
  }],
  ['DELETE', new RegExp(`^\\/brands\\/${SEG}$`), (c) => {
    const i = brands.findIndex((b) => b.id === c[0])
    if (i === -1) return fail(404, 'Brand not found.')
    brands.splice(i, 1)
    // Cascade — mirrors FK ON DELETE on the real backend
    for (const coll of [toneContexts, vocabulary, channelOverrides, analysisResults]) {
      for (let j = coll.length - 1; j >= 0; j--) if (coll[j].brand_id === c[0]) coll.splice(j, 1)
    }
    return noContent()
  }],
  ['POST', new RegExp(`^\\/brands\\/${SEG}\\/rebuild$`), (c) => {
    const brand = findBrand(c[0])
    if (!brand) return fail(404, 'Brand not found.')
    if (brand.identity_status === 'building') return fail(409, 'A build is already running for this brand.')
    // BR-I-02: rebuild creates a new version — never overwrites the active one
    brand.identity_status = 'building'
    brand.updated_at = new Date().toISOString()
    activities.unshift({ id: nextId('act'), type: 'build.started', message: `Identity rebuild started for ${brand.name}`, brand_id: brand.id, created_at: brand.updated_at })
    scheduleBuildCompletion(brand.id)
    return ok(serializeBrand(brand), 202)
  }],
  ['POST', new RegExp(`^\\/brands\\/${SEG}\\/share$`), (c) => {
    if (!PLAN_LIMITS[currentUser().plan].shareable_briefs) return fail(403, 'Shareable briefs require the Pro plan or above.')
    const brand = findBrand(c[0])
    if (!brand) return fail(404, 'Brand not found.')
    brand.share_token = brand.share_token ?? `brf_${Math.random().toString(36).slice(2, 10)}`
    return ok({ share_token: brand.share_token })
  }],
  ['DELETE', new RegExp(`^\\/brands\\/${SEG}\\/share$`), (c) => {
    const brand = findBrand(c[0])
    if (!brand) return fail(404, 'Brand not found.')
    brand.share_token = null
    return noContent()
  }],

  // ── Tone contexts ────────────────────────────────────────────────────────
  ['POST', new RegExp(`^\\/brands\\/${SEG}\\/tone-contexts$`), (c, body) => {
    const brand = findBrand(c[0])
    if (!brand) return fail(404, 'Brand not found.')
    const tone = { id: nextId('tone'), brand_id: brand.id, name: body.name, description: body.description ?? '', is_active: true, created_at: new Date().toISOString() }
    toneContexts.push(tone)
    return ok(tone, 201)
  }],
  ['PATCH', new RegExp(`^\\/brands\\/[^/]+\\/tone-contexts\\/${SEG}$`), (c, body) => {
    const tone = toneContexts.find((t) => t.id === c[0])
    if (!tone) return fail(404, 'Tone context not found.')
    Object.assign(tone, {
      name: body.name ?? tone.name,
      description: body.description ?? tone.description,
      is_active: body.is_active ?? tone.is_active,
    })
    return ok(tone)
  }],
  ['DELETE', new RegExp(`^\\/brands\\/[^/]+\\/tone-contexts\\/${SEG}$`), (c) => {
    const i = toneContexts.findIndex((t) => t.id === c[0])
    if (i === -1) return fail(404, 'Tone context not found.')
    toneContexts.splice(i, 1)
    return noContent()
  }],

  // ── Vocabulary ───────────────────────────────────────────────────────────
  ['POST', new RegExp(`^\\/brands\\/${SEG}\\/vocabulary$`), (c, body) => {
    const brand = findBrand(c[0])
    if (!brand) return fail(404, 'Brand not found.')
    const term = String(body.term ?? '').trim()
    if (!term) return fail(422, 'Term is required.')
    const entry = { id: nextId('voc'), brand_id: brand.id, term, source: 'user_defined', action: body.action ?? 'block' }
    vocabulary.push(entry)
    return ok(entry, 201)
  }],
  ['DELETE', new RegExp(`^\\/brands\\/[^/]+\\/vocabulary\\/${SEG}$`), (c) => {
    const i = vocabulary.findIndex((v) => v.id === c[0])
    if (i === -1) return fail(404, 'Vocabulary entry not found.')
    vocabulary.splice(i, 1)
    return noContent()
  }],

  // ── Channel overrides ────────────────────────────────────────────────────
  ['PUT', new RegExp(`^\\/brands\\/${SEG}\\/channel-overrides\\/${SEG}$`), (c, body) => {
    const [brandId, channel] = c
    let override = channelOverrides.find((ch) => ch.brand_id === brandId && ch.channel === channel)
    if (!override) {
      override = { id: nextId('cho'), brand_id: brandId, channel }
      channelOverrides.push(override)
    }
    Object.assign(override, { max_sentence_length: body.max_sentence_length, min_readability: body.min_readability })
    return ok(override)
  }],

  // ── Analysis ─────────────────────────────────────────────────────────────
  ['GET', /^\/analysis$/, (_c, _b, q) => {
    let list = [...analysisResults].sort((a, b) => b.created_at.localeCompare(a.created_at))
    if (q?.brand_id) list = list.filter((r) => r.brand_id === q.brand_id)
    return ok({
      items: list.map((r) => ({ ...r, flag_count: r.flags.length, open_flag_count: r.flags.filter((f) => f.resolution == null).length })),
      total: list.length,
    })
  }],
  ['GET', new RegExp(`^\\/analysis\\/${SEG}$`), (c) => {
    const result = analysisResults.find((r) => r.id === c[0])
    if (!result) return fail(404, 'Analysis result not found.')
    return ok(result)
  }],

  // ── Teams ───────────────────────────────────────────────────────────────
  ['GET', /^\/teams$/, () => ok(teams.map((t) => ({ ...t, members_count: teamMembers.filter((m) => m.team_id === t.id).length })))],
  ['GET', /^\/teams\/[^/]+\/members$/, () => ok({
    members: teamMembers.slice(),
    invites: teamInvites.filter((i) => i.status === 'pending' && new Date(i.expires_at) > new Date()),
  })],
  ['POST', /^\/teams\/[^/]+\/members\/invite$/, (_c, body) => {
    // BR-P-04: team features are Agency-only
    if (!PLAN_LIMITS[currentUser().plan].team_features) return fail(403, 'Team features require the Agency plan.')
    // BR-P-03: up to 5 writers/seats
    const seatCount = teamMembers.length + teamInvites.filter((i) => i.status === 'pending').length
    if (seatCount >= teams[0].seats_limit) return fail(403, 'All team seats are in use. Remove a member before inviting again.')
    if (teamInvites.some((i) => i.email === body.email && i.status === 'pending') || teamMembers.some((m) => m.email === body.email)) {
      return fail(400, 'This person is already on the team or has a pending invite.')
    }
    const invite = { id: nextId('inv'), team_id: teams[0].id, email: body.email, role: body.role ?? 'writer', status: 'pending', created_at: new Date().toISOString(), expires_at: new Date(Date.now() + 7 * 24 * 60 * 60_000).toISOString() }
    teamInvites.push(invite)
    activities.unshift({ id: nextId('act'), type: 'team.invited', message: `${body.email} was invited as a ${invite.role}`, brand_id: null, created_at: invite.created_at })
    return ok(invite, 201)
  }],
  ['PATCH', new RegExp(`^\\/teams\\/[^/]+\\/members\\/${SEG}$`), (c, body) => {
    const member = teamMembers.find((m) => m.id === c[0])
    if (!member) return fail(404, 'Member not found.')
    if (member.role === 'owner') return fail(403, 'The team owner role cannot be changed.')
    if (!['admin', 'writer'].includes(body.role)) return fail(422, 'Role must be admin or writer.')
    member.role = body.role
    return ok(member)
  }],
  ['DELETE', new RegExp(`^\\/teams\\/[^/]+\\/members\\/${SEG}$`), (c) => {
    const member = teamMembers.find((m) => m.id === c[0])
    if (!member) return fail(404, 'Member not found.')
    if (member.role === 'owner') return fail(403, 'The team owner cannot be removed.')
    teamMembers.splice(teamMembers.indexOf(member), 1)
    return noContent()
  }],
  ['DELETE', new RegExp(`^\\/teams\\/[^/]+\\/invites\\/${SEG}$`), (c) => {
    const i = teamInvites.findIndex((iv) => iv.id === c[0])
    if (i === -1) return fail(404, 'Invite not found.')
    teamInvites.splice(i, 1)
    return noContent()
  }],

  // ── Billing ─────────────────────────────────────────────────────────────
  ['GET', /^\/billing\/plans$/, () => ok(BILLING_PLANS)],
  ['GET', /^\/billing\/subscription$/, () => {
    const sub = subscriptions.find((s) => s.user_id === currentUser().id) ?? subscriptions[0]
    const limits = PLAN_LIMITS[currentUser().plan]
    return ok({
      ...sub,
      plan: currentUser().plan,
      limits,
      usage: {
        checks_today: usage.checks_today,
        checks_limit: limits.checks_per_day,
        brands_used: brands.length,
        brands_limit: limits.brands,
      },
    })
  }],
  ['POST', /^\/billing\/checkout$/, (_c, body) => {
    const plan = BILLING_PLANS.find((p) => p.id === body.plan_id)
    if (!plan) return fail(404, 'Plan not found.')
    // Real flow returns a Stripe checkout URL; mock flow switches instantly.
    currentUser().plan = plan.id
    subscriptions[0].plan = plan.id
    subscriptions[0].current_period_end = new Date(Date.now() + 30 * 24 * 60 * 60_000).toISOString()
    return ok({ checkout_url: `/dashboard/billing?switched=${plan.id}` })
  }],
]

/* ── Serializers & helpers ──────────────────────────────────────────────── */

function serializeBrand(brand) {
  return { ...brand }
}

function ok(data, status = 200) {
  return { data, status, statusText: status === 201 ? 'Created' : 'OK', headers: {}, config: {} }
}

/* ── Adapter ────────────────────────────────────────────────────────────── */

export async function mockAdapter(config) {
  await delay()

  const method = (config.method ?? 'get').toUpperCase()
  const rawUrl = config.url ?? ''
  const [path, queryString] = rawUrl.split('?')
  const query = { ...(config.params ?? {}) }
  if (queryString) {
    for (const [k, v] of new URLSearchParams(queryString)) query[k] = v
  }

  let body = config.data
  if (typeof body === 'string') {
    try { body = JSON.parse(body) } catch { /* multipart etc. */ }
  }

  for (const [routeMethod, pattern, handler] of routes) {
    if (routeMethod !== method) continue
    const match = path.match(pattern)
    if (!match) continue
    return handler(match.slice(1), body, query)
  }

  return fail(404, `No mock handler for ${method} ${path}`)
}
