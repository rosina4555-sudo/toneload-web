# Varnish — Full Product Specification
### Brand Identity Engine v4 | Build Reference Document

---

## What This Document Is

This is the single source of truth for building Varnish. It covers every
component, every business rule, every integration, and every decision already
made. Read it top to bottom before writing any service code. When in doubt
about a decision, this document is the answer.

---

## 1. Product Definition

### What Varnish Is

Varnish is a Chrome extension that loads a client's complete brand identity
profile into a sidebar, then watches what a writer types in real time and
tells them — phrase by phrase — where they are drifting from that brand's
identity.

It does not write. It does not generate. It watches and tells.

### The Core Problem It Solves

Marketing agencies manage multiple client brands simultaneously. Writers
switch between clients several times a day. Without the right context loaded,
tone bleeds between clients. A writer finishing a fintech brief unconsciously
carries that vocabulary into a lifestyle brand draft. The client notices.
Trust erodes. Revision cycles expand.

Varnish fixes this at the point of writing — not in a style guide nobody
reads, not in a post-publish review, but the moment the writer starts typing.

### What Varnish Is Not

- Not an AI writer or content generator
- Not a social media scheduler
- Not an SEO tool
- Not a brand analytics dashboard
- Not a replacement for a creative brief

---

## 2. The Three-Layer Identity Model

Every decision in the system is grounded in this model. Understand it
completely before building anything.

```
CORE VOICE          — who the brand is (immutable, rebuilt via pipeline)
    ↓
TONE MODIFIERS      — how the brand feels in a situation (version-controlled)
    ↓
CHANNEL CONSTRAINTS — where the communication happens (system defaults + brand overrides)
```

### Core Voice
The permanent DNA of how a brand writes. Extracted from their corpus.
Never changes unless a rebuild is triggered and approved. Includes:
structural fingerprint (sentence length, rhythm, rhetorical patterns),
semantic identity (embedding neighborhoods), lexical profile (vocabulary
philosophy), and voice dimension scores (formality, warmth, energy, etc.)

### Tone Modifiers
Situational emotional adjustments. Created and named by the brand profile
owner (e.g. "Launch Campaign", "Investor Update", "Support Response").
Each tone context stores a plain English description plus numeric behavioral
modifiers that widen or narrow acceptable ranges on the core voice. Tone
never replaces voice — it adjusts the tolerance thresholds around it.

### Channel Constraints
Platform-specific structural expectations. System-defined for all major
platforms (LinkedIn, Twitter, Blog, Email, etc.). Brand owners can override
specific thresholds per channel for their brand. Detected automatically by
the extension based on which website the writer is on. The writer never
selects a channel manually.

---

## 3. Business Rules

These are non-negotiable. They are enforced at the service layer and at the
database level where possible.

### Identity Rules
- BR-I-01: Every brand has exactly one active identity version at a time
- BR-I-02: Rebuilds create a new identity version — they never overwrite the active one
- BR-I-03: Identity versions are immutable once status reaches active/archived/failed
- BR-I-04: Every analysis result is permanently pinned to the identity version that scored it
- BR-I-05: Identity evolution requires explicit human approval — the system never auto-applies changes
- BR-I-06: Small corpus mode activates below 25,000 words — clustering is disabled, single centroid used
- BR-I-07: Large corpus mode activates above 25,000 words — full neighborhood clustering enabled

### Scoring Rules
- BR-S-01: Alignment score (0–100) and confidence score are always separate outputs — never merged
- BR-S-02: Raw alignment score is computed from three primary dimensions only: structural (55%), lexical (25%), semantic (20%)
- BR-S-03: Tone and channel are range modifiers applied after raw scoring — not scoring dimensions
- BR-S-04: The interpreted alignment score is what the writer sees — raw score is stored internally
- BR-S-05: Semantic scoring may complete asynchronously — the system returns structural + lexical immediately and updates semantic score when ready
- BR-S-06: Confidence levels: very_low / low / medium / high / very_high — based on draft length, signal density, and semantic certainty
- BR-S-07: LLM is only invoked for flag explanations and rewrites — never for core scoring
- BR-S-08: Ephemeral checks (is_stored=false) are not retained in history and are eligible for archival after 30 days
- BR-S-09: Free plan users are limited to 20 checks per day — enforced at the API layer

### Plan and Access Rules
- BR-P-01: Free plan: 1 brand profile, 20 checks/day, no shareable briefs, no team features
- BR-P-02: Pro plan: 10 brand profiles, unlimited checks, shareable briefs, 1 user
- BR-P-03: Agency plan: unlimited profiles, unlimited checks, shareable briefs, up to 5 writers, team analytics
- BR-P-04: Team features are exclusively Agency plan — attempting team creation on any other plan returns 403
- BR-P-05: Brand count limits are enforced at creation time — not retroactively
- BR-P-06: Downgrading from Agency to Pro does not delete existing brands above the Pro limit — they are archived until the user removes them or upgrades

### Team Rules
- BR-T-01: Team owner has full permissions on all team brands and all team members
- BR-T-02: Admins can manage writers and brands but cannot delete the team or change owner
- BR-T-03: Writers can only read brand profiles and run analysis — they cannot modify profiles
- BR-T-04: Invites expire after 7 days — expired invites cannot be accepted
- BR-T-05: A user can belong to multiple teams but only one team can own a given brand

### Auth Rules
- BR-A-01: Access tokens expire after 60 minutes
- BR-A-02: Refresh tokens expire after 30 days
- BR-A-03: Refresh token rotation — every use of a refresh token issues a new pair and revokes the old one
- BR-A-04: Extension tokens expire after 2 hours and are silently refreshed via dashboard session
- BR-A-05: Passwords must be minimum 8 characters — hashed with bcrypt, cost factor 12
- BR-A-06: A user may have at most 10 active API credentials at a time

### Webhook Rules
- BR-W-01: All webhook payloads are signed with HMAC-SHA256 using the endpoint's signing secret
- BR-W-02: Receivers must validate the signature and reject requests where |now - timestamp| > 300 seconds
- BR-W-03: Failed deliveries are retried up to 5 times with exponential backoff: 1s, 5s, 30s, 2min, 10min
- BR-W-04: An endpoint with 10 consecutive failures is auto-disabled with a reason stored
- BR-W-05: Signing secrets are shown only once at creation — never retrievable after that

---

## 4. System Architecture

### Stack

| Layer | Technology |
|---|---|
| API | FastAPI (Python 3.12) |
| ORM | SQLModel + SQLAlchemy 2.x |
| Database | PostgreSQL 16 + pgvector |
| Migrations | Alembic (autogenerate) |
| Background jobs | Celery + Redis |
| Embeddings | OpenAI text-embedding-3-small (1536 dims) |
| LLM | GPT-4o-mini (flag explanations, rewrites only) |
| Cache | Redis |
| Extension | Plasmo + React + Tailwind |
| Dashboard | Vue 3 + Tailwind v4 |
| Payments | Stripe |
| Auth | Custom JWT (bcrypt + python-jose) |

### Service Roles

Two database roles — never use the same credentials for both:

- `varnish_app` — API layer connection pool. RLS enforced. Standard permissions.
- `varnish_service` — Worker/pipeline pool. BYPASSRLS. Used only by Celery workers,
  billing webhook handler, and the evolution service. Never exposed to the API layer.

### Project Structure

```
varnish-api/
├── app/
│   ├── main.py                    # FastAPI app, CORS, router mount, rate limiting
│   ├── dependencies.py            # get_db, get_current_user, require_plan, set_user_context
│   ├── core/
│   │   ├── config.py              # Settings via pydantic-settings
│   │   ├── security.py            # JWT encode/decode, bcrypt hashing
│   │   └── exceptions.py          # Custom HTTP exceptions
│   ├── api/
│   │   └── v1/
│   │       ├── router.py          # Mounts all sub-routers
│   │       ├── auth.py            # /auth endpoints
│   │       ├── brands.py          # /brands endpoints
│   │       ├── analysis.py        # /analysis endpoints
│   │       ├── teams.py           # /teams endpoints
│   │       ├── billing.py         # /billing endpoints
│   │       ├── webhooks.py        # /webhooks endpoints
│   │       └── public.py          # /public endpoints (no auth)
│   ├── models/                    # All SQLModel models (already built)
│   ├── schemas/                   # Pydantic request/response schemas
│   │   ├── auth.py
│   │   ├── brand.py
│   │   ├── analysis.py
│   │   ├── team.py
│   │   ├── billing.py
│   │   └── webhook.py
│   ├── services/                  # Business logic — no DB calls here
│   │   ├── auth_service.py
│   │   ├── brand_service.py
│   │   ├── analysis_service.py
│   │   ├── embedding_service.py
│   │   ├── team_service.py
│   │   ├── billing_service.py
│   │   └── webhook_service.py
│   ├── repositories/              # All DB queries — no business logic here
│   │   ├── user_repo.py
│   │   ├── brand_repo.py
│   │   ├── analysis_repo.py
│   │   ├── team_repo.py
│   │   └── webhook_repo.py
│   └── workers/
│       ├── celery_app.py          # Celery + Redis config
│       ├── scrape_task.py         # Fetch URL, extract clean text
│       ├── embed_task.py          # Chunk, embed, cluster, build identity version
│       ├── evolution_task.py      # Drift analysis, proposal generation
│       └── webhook_task.py        # Delivery + retry logic
├── alembic/
│   ├── env.py                     # pgvector render_item hook required here
│   └── versions/
├── migrations_manual/             # Raw SQL that Alembic cannot autogenerate
│   ├── 001_rls_policies.sql
│   ├── 002_db_triggers.sql
│   └── 003_materialized_views.sql
├── tests/
├── .env
└── pyproject.toml
```

---

## 5. Database Layer

### Migration Order

Run in this exact order on a fresh database:

1. `alembic upgrade head` — creates all tables, indexes, constraints
2. `migrations_manual/001_rls_policies.sql` — RLS enable + all policies
3. `migrations_manual/002_db_triggers.sql` — immutability, version_number auto-increment, tone modifier deactivation, identity version immutability
4. `migrations_manual/003_materialized_views.sql` — brand_summary, team_analytics_summary, brand_drift_trends, vocabulary_usage_analytics, tone_context_performance

### DB Session Middleware

Every request must set the RLS user context before any query runs:

```python
# app/dependencies.py
async def get_db_with_user_context(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await db.execute(
        text("SET LOCAL app.current_user_id = :uid"),
        {"uid": current_user.id}
    )
    return db
```

For worker tasks using `varnish_service` role, skip this — RLS is bypassed.

### Alembic env.py — Required pgvector hook

```python
from pgvector.sqlalchemy import Vector

def render_item(type_, obj, autogen_context):
    if type_ == "type" and isinstance(obj, Vector):
        autogen_context.imports.add("from pgvector.sqlalchemy import Vector")
        return f"Vector({obj.dim})"
    return False

context.configure(
    ...,
    render_item=render_item,
)
```

Without this, autogenerate writes broken `pgvector.sqlalchemy.vector.VECTOR(dim=1536)` paths.

---

## 6. Authentication System

### Models Required

**`UserCredentials`** — linked one-to-one with User, stores bcrypt password hash.

**`RefreshToken`** — stores hashed refresh tokens, revocation state, expiry.
Use the same pattern from your Kingdom Data project.

### Token Architecture

```
Sign up / Sign in
    ↓
Server issues:
  access_token  — JWT, expires 60min, contains user_id + plan
  refresh_token — opaque random string, hashed + stored in DB, expires 30 days
    ↓
Client stores:
  access_token  — memory only (never localStorage)
  refresh_token — httpOnly cookie (dashboard) OR chrome.storage.local (extension)
```

### JWT Payload

```json
{
  "sub": "<user_id>",
  "plan": "pro",
  "email": "user@example.com",
  "exp": 1716652800,
  "iat": 1716649200,
  "type": "access"
}
```

Plan is embedded in the JWT so plan-gating checks on the hot path (scoring)
do not require a DB lookup. When a user upgrades, existing tokens still work
until they expire — max 60 minutes of stale plan state is acceptable.

### Extension Authentication Flow

The extension does not have its own login screen.

```
1. User logs into app.varnish.so (dashboard)
   → Server sets httpOnly refresh token cookie

2. User clicks "Connect Extension" in dashboard
   → Dashboard calls POST /auth/extension-token
   → Server reads the cookie session, issues a short-lived extension token
     (type = extension_token in APICredential table, expires 2 hours)
   → Token returned in response body (not cookie — extension cannot read cookies)

3. Extension receives token via postMessage from dashboard page
   → Extension stores in chrome.storage.local (encrypted by Chrome to OS profile)

4. Extension uses token for all API calls:
   Authorization: Bearer <extension_token>

5. Every 90 minutes, extension silently calls GET /auth/extension-token/refresh
   → If dashboard cookie session still valid: new token issued transparently
   → If dashboard session expired: extension shows "Session expired — reconnect"
     prompt that opens app.varnish.so/reconnect in a new tab

6. User logout on dashboard calls POST /auth/signout
   → Revokes refresh token in DB
   → Revokes all extension tokens for that user (cascade in APICredential)
   → Extension detects 401 on next request, shows reconnect prompt
```

### Plan-Gating Dependency

```python
def require_plan(*plans: PlanTier):
    async def gate(
        current_user: User = Depends(get_current_user)
    ) -> User:
        if current_user.plan not in plans:
            raise HTTPException(
                status_code=403,
                detail=f"This feature requires one of: {[p.value for p in plans]}"
            )
        return current_user
    return gate

# Usage
@router.post("/teams")
async def create_team(
    user: User = Depends(require_plan(PlanTier.agency))
):
    ...
```

---

## 7. Identity Construction Pipeline

### Trigger Points
- Brand creation (always)
- Manual rebuild triggered by profile owner
- Evolution proposal of type `full_rebuild` approved by profile owner

### Pipeline Stages (in order)

**Stage 1 — content_collection**
- Crawl all URLs from corpus sources
- Target: homepage, about, blog, product pages
- Strip: nav, footer, cookie banners, legal boilerplate
- Persist cleaned text as `CorpusDocument` rows
- Update `CorpusSource.status` = completed or failed

**Stage 2 — corpus_qualification**
- Count total clean words across all `CorpusDocument` rows for this brand
- Below 25,000 words → set `IdentityVersion.corpus_mode` = small_corpus
- Above 25,000 words → set `IdentityVersion.corpus_mode` = large_corpus
- Compute SHA-256 hash of all document IDs + content hashes → store as `corpus_snapshot_hash`

**Stage 3 — structural_analysis**
- Run deterministic NLP analysis on the full corpus
- Extract all StyleDNA metrics (sentence architecture, rhythm, readability, punctuation culture, rhetorical devices, CTA style, voice orientation)
- No LLM call here — pure algorithmic analysis
- Persist as `StyleDNA` row linked to `IdentityVersion`

**Stage 4 — lexical_extraction**
- Compute TF-IDF weighted vocabulary frequency against general English baseline
- Identify statistically distinctive phrases — these become system-suggested allow entries
- Cluster related phrases into semantic groups using phrase embeddings
- Persist `LexicalProfile` + `VocabularyEntry` rows (source = system_extracted)
- Preserve any user-defined VocabularyEntry rows (source = user_defined) — never overwrite them

**Stage 5 — embedding_generation**
- Chunk corpus into 300–500 token pieces
- Embed each chunk via OpenAI text-embedding-3-small
- Persist as `CorpusChunk` rows pinned to this `IdentityVersion`
- Chunking strategy and model version stored in `pipeline_config` on `IdentityVersion`

**Stage 6 — clustering** (large_corpus mode only)
- Run HDBSCAN on chunk embeddings
- Minimum cluster size: 5 chunks
- Noise points reassigned to nearest valid cluster
- Each cluster becomes a `SemanticNeighborhood` row (type = cluster)
- Small corpus mode: compute single centroid, one `SemanticNeighborhood` row (type = centroid)
- Assign `corpus_chunks.neighborhood_id` for each chunk

**Stage 7 — voice_modeling**
- Send representative corpus sample (first 2000 tokens) to GPT-4o-mini
- Extract voice dimension scores (formality, warmth, energy, complexity, humor, directness, persuasion_intensity, emotional_expressiveness)
- Generate 3 plain English voice descriptor sentences
- Persist as `CoreVoiceProfile`

**Stage 8 — tone_initialization**
- For each existing `ToneContext` on this brand, generate suggested numeric modifiers by sending the tone description to GPT-4o-mini
- Create new `ToneModifierSet` rows with generated_by = 'llm_suggestion'
- These are suggestions — they do not activate until the profile owner reviews them

**Stage 9 — version_finalization**
- Set `IdentityVersion.status` = active
- Set `IdentityVersion.build_completed_at` = now
- Update `Brand.active_identity_version_id` to this version
- Archive the previous active version (status = archived)
- Trigger `brand.ready` webhook event
- Refresh `brand_summary` materialized view

### Pipeline Failure Handling

Each stage writes a `PipelineStageExecution` row with its status.
If any stage fails:
- Set `BuildPipelineRun.status` = failed
- Set `BuildPipelineRun.error_stage` + `error_message`
- Trigger `brand.failed` webhook event
- Retry up to 3 times with exponential backoff
- After 3 failures, set `IdentityVersion.status` = failed
- The previous active version remains active — failures never corrupt the working model

---

## 8. Real-Time Scoring Pipeline

### Latency Target: < 500ms

### Input

```python
class ScoreRequest:
    brand_id: str
    content: str            # draft text, 10–5000 chars
    tone_context_id: str    # optional
    store_result: bool      # default false
```

The channel is NOT in the request — the extension detects it from the
current tab URL and sends it as a header: `X-Varnish-Channel: linkedin`

### Scoring Flow

```
Receive request
    ↓
Load from cache (Redis):
  - active IdentityVersion ID for this brand
  - StyleDNA for active version
  - active VocabularyEntry block list for this brand
  - active ToneModifierSet for requested tone context
  - ChannelProfile for detected channel + any BrandChannelOverride
    ↓
Run three components in parallel:

  Component A — Lexical (20ms, no API call)
    - String match draft against block list
    - Semantic similarity against blocked concept embeddings (HNSW lookup)
    - Compute vocabulary alignment score
    - Flag any blocked phrases immediately

  Component B — Structural (50ms, no API call)
    - Extract structural metrics from draft text
    - Compare against StyleDNA baselines
    - Compute structural similarity score

  Component C — Semantic (300ms, one embedding API call)
    - Embed the draft via text-embedding-3-small
    - Large corpus: find nearest SemanticNeighborhood, compute similarity against that cluster
    - Small corpus: cosine similarity against single centroid
    - If exceeds latency budget: return without semantic score, complete async

    ↓
Compute raw_alignment_score:
  structural_score * 0.55 + lexical_score * 0.25 + semantic_score * 0.20
  (if semantic not yet available: structural * 0.69 + lexical * 0.31)

    ↓
Apply tone modifiers:
  For each flag, check if active ToneModifierSet widens the acceptable range
  enough to reclassify the violation as acceptable
  → Set AnalysisFlag.resolution = overridden_by_tone where applicable

    ↓
Apply channel constraints:
  Check structural deviations against channel thresholds
  → Set AnalysisFlag.resolution = overridden_by_channel where applicable

    ↓
Compute interpreted alignment_score (post-modifier)
Compute confidence_score (based on draft length + signal density)

    ↓
Persist AnalysisResult (if store_result=true)
Persist AnalysisFlag rows

    ↓
Return ScoreResponse:
  alignment_score   — 0–100, what the writer sees
  confidence_score  — very_low / low / medium / high / very_high
  flags             — list with phrase, type, severity, resolution, suggestion
  latency_ms
```

### LLM Flag Explanation (on demand only)

Triggered when:
- Writer clicks "Explain" on a flag
- Alignment score drops below 70 and writer requests explanation
- Writer clicks "Rewrite" on a flag or the full draft

```python
prompt = f"""
You are a brand voice consultant for {brand.name}.
Brand voice: {core_voice_profile.voice_descriptors}
Active tone context: {tone_context.description}
Channel: {channel_profile.platform_description}

The following content has a brand alignment issue:
Content: "{flag.phrase}"
Issue type: {flag.type}
Reason: explain why this is off-brand in plain English (1-2 sentences).
Suggestion: provide one concrete alternative (1 sentence).

Respond only with JSON: {{"reason": "...", "suggestion": "..."}}
"""
```

### Redis Caching Strategy

Cache keys and TTLs:

```
brand:{brand_id}:active_version_id         TTL: 5min
brand:{brand_id}:style_dna:{version_id}    TTL: 30min
brand:{brand_id}:vocab_block               TTL: 10min
brand:{brand_id}:tone:{tone_id}:modifiers  TTL: 10min
channel:{channel_type}:profile             TTL: 60min (changes never at runtime)
```

Invalidate on:
- Brand rebuild completion → invalidate all brand:{brand_id}:* keys
- Vocabulary entry change → invalidate brand:{brand_id}:vocab_block
- Tone modifier update → invalidate brand:{brand_id}:tone:{tone_id}:modifiers

---

## 9. Chrome Extension Architecture

### Tech Stack
- Plasmo framework
- React + TypeScript
- Tailwind CSS
- Manifest V3

### Extension Components

```
extension/
├── background/
│   └── index.ts           # Service worker — token refresh, tab detection
├── contents/
│   └── varnish-overlay.tsx # Content script injected into writing surfaces
├── popup/
│   └── index.tsx           # Small popup shown on extension icon click
├── sidepanel/
│   └── index.tsx           # Main sidebar — brand switcher, score, flags
├── lib/
│   ├── api.ts             # All API calls with auth header injection
│   ├── auth.ts            # Token storage + refresh in chrome.storage.local
│   ├── detector.ts        # Detect current writing environment from tab URL
│   └── scorer.ts          # Debounced scoring calls, result caching
└── assets/
```

### Writing Environment Detection

The background service worker reads `tabs.url` to detect channel:

```typescript
const CHANNEL_MAP: Record<string, string> = {
  "docs.google.com":    "google_docs",
  "linkedin.com":       "linkedin",
  "twitter.com":        "twitter_x",
  "x.com":              "twitter_x",
  "notion.so":          "notion_internal",
  "chat.openai.com":    "chatgpt",
  "claude.ai":          "claude",
  "wordpress.com":      "blog",
};

function detectChannel(url: string): string {
  const hostname = new URL(url).hostname.replace("www.", "");
  return CHANNEL_MAP[hostname] ?? "unknown";
}
```

### Textarea Detection

The content script uses a MutationObserver to detect textareas on the active page:

```typescript
// Watches for contenteditable and textarea elements
// Attaches input listeners for scoring debounce
// Works across Google Docs (div-based), LinkedIn (contenteditable), Twitter
```

### Scoring Debounce

Writer must pause for 800ms before a score request fires. This prevents
flooding the API on every keystroke.

```typescript
const debouncedScore = debounce(async (text: string) => {
  const result = await api.score({
    brand_id: activeBrand.id,
    content: text,
    tone_context_id: activeToneContext?.id,
    store_result: false,
  });
  updateSidebar(result);
}, 800);
```

### Sidebar States

**No brand loaded:**
Prompt to select a brand from the dropdown. Show "Load from brief link" option.

**Brand loaded, not writing:**
Show brand name, active tone context selector, key voice traits (3–4 plain
English labels), vocab block list preview.

**Writing (live scoring):**
- Score badge: large number (e.g. 84), color-coded (green ≥80, amber 60–79, red <60)
- Confidence indicator: shown only when Low or Very Low
- Flagged phrases underlined in the writing surface via content script highlight injection
- Flag list below score: phrase, severity icon, resolution status

**Flag detail (on click):**
- Full flag explanation (LLM-generated, loaded on demand)
- "Rewrite this" button → triggers rewrite API call → shows result inline

---

## 10. Dashboard (Vue 3)

### Routes

```
/                         → redirect to /dashboard
/login                    → sign in page
/signup                   → create account page
/dashboard                → brand list, recent activity
/brands/new               → create brand wizard
/brands/:id               → brand profile detail
/brands/:id/edit          → edit vocab, tone contexts, channel overrides
/brands/:id/rebuild       → trigger rebuild
/brands/:id/share         → manage share link
/teams                    → team management (agency plan)
/teams/:id/members        → member list, invite
/analysis                 → scoring history (stored results)
/billing                  → plan, subscription management
/settings                 → profile, API credentials, extension connection
/brief/:share_token       → public brand brief (no auth, read-only)
```

### Brand Creation Wizard (3 steps)

**Step 1 — Basic info**
Brand name, website URL (optional), description (optional)

**Step 2 — Seed content**
Paste sample copy (optional). Minimum viable: just a URL.
Show corpus quality estimate as URL is entered.

**Step 3 — Assign**
Assign to team (if Agency plan), set as personal brand otherwise.
Review and confirm.

On submit: brand created, pipeline job enqueued, status = pending.
Redirect to brand detail page which polls `GET /brands/:id` every 5 seconds
until status = ready.

### Build Status Polling

```javascript
// In brand detail page
const pollStatus = async () => {
  const brand = await api.getBrand(brandId)
  if (brand.identity_status === 'ready') {
    clearInterval(poller)
    showReadyState()
  } else if (brand.identity_status === 'failed') {
    clearInterval(poller)
    showFailedState()
  }
}
const poller = setInterval(pollStatus, 5000)
```

---

## 11. Feedback and Evolution System

### What Gets Tracked

Every writer action during a session generates a `FeedbackEvent`:
- Suggestion accepted
- Suggestion ignored
- Flag dismissed
- Rewrite accepted / rejected
- Manual override (writer edited a flagged phrase themselves)

### Drift Detection (async job, runs weekly per brand)

The `evolution_task` Celery worker:
1. Queries last 90 days of stored `AnalysisResult` rows for the brand
2. Computes rolling averages of structural and lexical scores
3. Compares against `StyleDNA` baselines from the active version
4. Checks `FeedbackEvent` patterns — are certain flags consistently ignored?
5. If drift exceeds thresholds → creates a `DriftReport`
6. If drift is actionable → creates an `EvolutionProposal` (pending)
7. Notifies brand owner via email: "Your brand model may need a refresh"

### Human Approval Flow

Profile owner sees pending `EvolutionProposal` in dashboard.
Options: Approve / Reject / View evidence.

- Approve full_rebuild → triggers rebuild pipeline
- Approve tone_modifier_update → creates new `ToneModifierSet` (active)
- Approve vocabulary_update → adds/removes `VocabularyEntry` rows
- Reject → proposal marked rejected, no changes

The system never makes changes without this step.

---

## 12. Webhooks

### Payload Envelope

```json
{
  "id": "<delivery_uuid>",
  "type": "brand.ready",
  "api_version": "1.0.0",
  "created_at": "2025-05-01T10:00:00Z",
  "data": { ... }
}
```

### Signature Verification

```python
import hmac, hashlib, time

def verify_webhook(payload: bytes, timestamp: str, signature: str, secret: str) -> bool:
    if abs(time.time() - int(timestamp)) > 300:
        return False
    expected = hmac.new(
        secret.encode(),
        f"{timestamp}.{payload.decode()}".encode(),
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(expected, signature)
```

Header format: `X-Varnish-Signature: t=<timestamp>,v1=<hmac_hex>`

---

## 13. Build Order

Build in this exact sequence. Each component depends on the previous being complete.

### Phase 0 — Foundation (do this first, nothing works without it)
1. PostgreSQL setup, pgvector extension enabled
2. Redis setup
3. Alembic env.py configured with pgvector render_item hook
4. All models in place with CHECK constraints and partial indexes
5. `alembic upgrade head`
6. Manual SQL migrations: RLS, triggers, materialized views
7. Both DB roles created: `varnish_app` (RLS enforced), `varnish_service` (BYPASSRLS)

### Phase 1 — Auth (nothing else works without this)
1. `UserCredentials` model + `RefreshToken` model
2. `auth_service.py` — signup, signin, refresh, signout, extension token
3. JWT encode/decode in `security.py`
4. `POST /auth/signup`
5. `POST /auth/signin`
6. `POST /auth/refresh`
7. `POST /auth/signout`
8. `GET /auth/me`
9. `PATCH /auth/me`
10. `get_current_user` dependency working and tested
11. `require_plan` dependency working and tested

### Phase 2 — Brand CRUD (needed before pipeline)
1. `brand_service.py` — create, read, update, delete, archive
2. `brand_repo.py`
3. `GET /brands` — list with pagination
4. `POST /brands` — create (enqueues pipeline job, returns 202)
5. `GET /brands/:id` — single brand with identity status
6. `PATCH /brands/:id` — update name, vocab, tone overrides
7. `DELETE /brands/:id`
8. Plan limit enforcement on create

### Phase 3 — Identity Construction Pipeline
1. Celery app configured and connected to Redis
2. `scrape_task.py` — URL fetch, content extraction, CorpusDocument creation
3. `embed_task.py` — chunking, OpenAI embedding calls
4. Clustering logic — HDBSCAN for large corpus, centroid for small
5. `StyleDNA` extraction — all structural metrics
6. `LexicalProfile` + `VocabularyEntry` extraction
7. `CoreVoiceProfile` generation via GPT-4o-mini
8. `IdentityVersion` finalization — status transitions
9. `BuildPipelineRun` + `PipelineStageExecution` tracking throughout
10. `POST /brands/:id/rebuild`
11. Test full pipeline end-to-end with a real brand URL

### Phase 4 — Tone and Channel
1. `ToneContext` CRUD endpoints
2. `ToneModifierSet` versioning — create, activate, view history
3. LLM-suggested modifier generation from tone description
4. `BrandChannelOverride` CRUD
5. Test modifier application logic in isolation

### Phase 5 — Scoring API (the core product)
1. `embedding_service.py` — OpenAI embed + cosine similarity utilities
2. `analysis_service.py` — full scoring pipeline orchestration
3. Lexical component — string match + semantic blocked concept detection
4. Structural component — metric extraction + StyleDNA comparison
5. Semantic component — neighborhood matching (async fallback)
6. Modifier application — tone reclassification + channel reclassification
7. Confidence scoring logic
8. `POST /analysis/score`
9. `POST /analysis/rewrite`
10. `GET /analysis` — history
11. `GET /analysis/:id`
12. Redis caching for all hot-path data
13. Rate limiting for free plan (20 checks/day, enforced via Redis counter)

### Phase 6 — Shareable Briefs
1. Share token generation (cryptographically random, URL-safe)
2. `POST /brands/:id/share` — generate token
3. `DELETE /brands/:id/share` — revoke token
4. `GET /public/brands/:share_token` — public read-only brief (no auth)
5. Dashboard `/brief/:share_token` route — public-facing page

### Phase 7 — Teams (Agency plan)
1. `team_service.py` — create, invite, role management
2. `GET /teams`, `POST /teams`
3. `GET /teams/:id`, `PATCH /teams/:id`, `DELETE /teams/:id`
4. `GET /teams/:id/members`
5. `POST /teams/:id/members/invite`
6. `PATCH /teams/:id/members/:member_id` — role update
7. `DELETE /teams/:id/members/:member_id` — remove/leave
8. Invite email sending (use BackgroundTasks, same pattern as Kingdom Data)
9. Invite acceptance flow

### Phase 8 — Billing
1. Stripe products and prices configured in Stripe dashboard
2. `billing_service.py` — checkout session, portal session, webhook handling
3. `GET /billing/plans`
4. `GET /billing/subscription`
5. `POST /billing/checkout`
6. `POST /billing/portal`
7. `POST /billing/webhooks/stripe` — Stripe webhook receiver
8. Idempotency check via `stripe_event_id` on `BillingEvent`
9. Plan update flow: Stripe webhook → update User.plan → invalidate JWT plan cache

### Phase 9 — Webhooks
1. `webhook_service.py` — endpoint management, delivery, signing
2. `GET /webhooks`, `POST /webhooks`
3. `GET /webhooks/:id`, `PATCH /webhooks/:id`, `DELETE /webhooks/:id`
4. `POST /webhooks/:id/rotate-secret`
5. `POST /webhooks/:id/test`
6. `GET /webhooks/:id/deliveries`
7. `webhook_task.py` Celery worker — delivery + exponential backoff retry
8. Auto-disable endpoint at 10 consecutive failures

### Phase 10 — Chrome Extension
1. Plasmo project setup
2. Auth flow — connect to dashboard via postMessage
3. `detector.ts` — channel detection from tab URL
4. `api.ts` — all scoring/brand API calls with token injection
5. Brand switcher UI in sidepanel
6. Textarea detection via content script + MutationObserver
7. Debounced scoring calls
8. Score display + flag highlighting in the writing surface
9. Flag list + explain on demand
10. Rewrite flow
11. Extension token refresh (silent, every 90min)

### Phase 11 — Feedback and Evolution
1. `FeedbackEvent` recording on all writer actions
2. `evolution_task.py` — weekly drift detection job
3. `DriftReport` generation
4. `EvolutionProposal` generation
5. Dashboard approval UI for proposals
6. Approval handler for each proposal type

### Phase 12 — Dashboard
Build in this route order:
1. Auth pages (login, signup)
2. Brand list + brand creation wizard
3. Brand detail + build status polling
4. Brand edit (vocab, tone, channel overrides)
5. Scoring history
6. Team management (agency plan)
7. Billing page
8. Settings page (API credentials, extension connection)
9. Public brief page

---

## 14. Environment Variables

```env
# Database
DATABASE_URL=postgresql+asyncpg://varnish_app:password@localhost:5432/varnish
DATABASE_URL_SERVICE=postgresql+asyncpg://varnish_service:password@localhost:5432/varnish

# Redis
REDIS_URL=redis://localhost:6379/0

# Auth
JWT_SECRET=<256-bit-random-string>
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=30
EXTENSION_TOKEN_EXPIRE_MINUTES=120
BCRYPT_COST_FACTOR=12

# OpenAI
OPENAI_API_KEY=<key>
EMBEDDING_MODEL=text-embedding-3-small
LLM_MODEL=gpt-4o-mini

# Stripe
STRIPE_SECRET_KEY=<key>
STRIPE_WEBHOOK_SECRET=<key>
STRIPE_PRICE_PRO=price_xxx
STRIPE_PRICE_AGENCY=price_xxx

# App
ENVIRONMENT=development
ALLOWED_ORIGINS=["https://app.varnish.so","chrome-extension://"]
APP_URL=https://app.varnish.so
API_URL=https://api.varnish.so
```

---

## 15. What Is Already Built

| Artifact | Status |
|---|---|
| OpenAPI 3.1 spec (openapi.yaml) | Complete |
| All 35 SQLModel models | Complete |
| Enum definitions | Complete |
| Base schema SQL | Complete |
| Hardening migration SQL | Complete |
| RLS migration SQL | Complete |
| Landing page Vue component | Complete |
| Brand color tokens + style.css | Complete |
| fonts.css | Complete |

## What Needs to Be Built

Everything in the Phase 0–12 build order above.
Start with Phase 0. Do not skip ahead.