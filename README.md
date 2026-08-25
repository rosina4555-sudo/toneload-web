# Brandload

AI brand-voice platform for African businesses. Brandload builds a reusable
"brand brain" from your website copy, then scores any content against that
identity before you ship it — across LinkedIn, X, Instagram, email, blogs,
Google Docs, and WhatsApp.

This repository contains the **web app**: the marketing landing pages, the
authentication flow, and the full customer **dashboard**, in one codebase but
kept cleanly separated by layout and route sections.

## Stack

| Layer      | Tech                                            |
| ---------- | ----------------------------------------------- |
| Framework  | Vue 3 (Composition API, `<script setup>`)       |
| Routing    | Vue Router 4                                    |
| State      | Pinia                                           |
| Styling    | Tailwind CSS v4 + CSS custom properties         |
| Icons      | Phosphor Icons (`@phosphor-icons/vue`)          |
| Validation | Zod                                             |
| HTTP       | Axios (shared instance + interceptors)          |
| Tests      | Vitest + Vue Test Utils + happy-dom             |
| Build      | Vite                                            |

## Getting started

```bash
npm install
npm run dev        # start dev server
npm run build      # production build to /dist
npx vitest run     # run the test suite
```

## Project structure

```
src/
├── api/                 # HTTP layer — one module per domain
│   ├── axios.js         #   shared instance; auth interceptors + mock adapter hookup
│   ├── auth.js          #   sign-in / sign-up / refresh / logout
│   ├── brands.js        #   brand CRUD, build trigger, share links
│   ├── analysis.js      #   analysis history + detail
│   ├── teams.js         #   members & invites (Agency plan)
│   ├── billing.js       #   plans, subscription, checkout, credentials
│   └── mock/            # ⚠ mock backend (see below)
│       ├── db.js        #   seeded in-memory database
│       └── index.js     #   axios adapter implementing every endpoint
├── components/
│   ├── ui/              # design-system primitives (BaseButton, BaseModal, …)
│   └── dashboard/       # dashboard-specific composites (SidebarNav, Topbar, …)
├── composables/         # useToast, …
├── layouts/             # MarketingLayout · AuthLayout · DashboardLayout
├── router/              # route table split into marketing / auth / dashboard sections
├── stores/              # Pinia stores (auth, brands)
├── utils/               # formatters, helpers
└── views/
    ├── marketing/       # landing & marketing pages
    ├── auth/            # Signin / Signup
    └── dashboard/       # Overview, Brands, BrandDetail, Analysis, Team, Billing, Settings

tests/                   # Vitest suites (mock API contract, pipeline, view smoke tests)
```

### Separation of concerns

The marketing site and the dashboard share one codebase but never share
layout code. Every route belongs to a named section (`marketing`, `auth`,
`dashboard`), each section renders inside its own layout component, and
dashboard routes sit behind a navigation guard that refreshes or redirects on
expired sessions.

## Mock API mode

The dashboard is fully functional against a **mock backend** so UI work never
blocks on the real API.

- Enabled when `VITE_USE_MOCK=true` (or unset) in `.env`.
- Implemented as a **custom axios adapter** on the shared instance: every
  request is answered from a seeded, in-memory database with realistic
  latency, status codes, pagination and plan-limit enforcement
  (e.g. Free plan = 1 brand).
- Because all data flows through the same axios instance and typed API
  modules, switching to the real backend requires **zero call-site changes**:

```bash
# .env
VITE_USE_MOCK=false   # hit the real API
```

The seeded demo account is `demo@brandload.so` / `brandload123` (Agency plan).

## Testing

```bash
npx vitest run            # whole suite
npx vitest                # watch mode
```

Three layers are covered:

1. **Mock API contract tests** — auth flow, brand lifecycle, plan limits.
2. **Pipeline test** — requests through the real axios instance + interceptors.
3. **View smoke tests** — every dashboard view is mounted against the mock API
   and asserted to *settle* (skeletons disappear, real data renders). This is
   what catches render-time crashes that a production build cannot see.

## Git conventions

Conventional Commits (`feat:`, `fix:`, `refactor:`, `test:`, `docs:`) scoped
by area where useful, e.g. `feat(dashboard): add brand creation wizard`.

---

© 2026 Brandload. All rights reserved.
