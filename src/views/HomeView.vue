<template>
  <div class="landing">
    <header class="nav" :class="{ scrolled }">
      <div class="container nav-inner">
        <div class="nav-logo">
          <div class="nav-logo-icon">
            <img src="/images/logo_test1.png" alt="toneload" class="nav-logo-img" />
          </div>
          <span class="nav-logo-name">Toneload</span>
          <span class="nav-badge">beta</span>
        </div>
        <!-- <a class="logo" href="#">
          <img src="/images/logo_test1.png" alt="Toneload Logo" />
          Toneload
        </a> -->

        <nav class="nav-links">
          <a href="#how-it-works">Process</a>
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
        </nav>

        <div class="nav-actions">
          <a href="#" class="nav-signin">Login</a>
          <a href="#" class="btn-primary btn-sm">Get Started</a>
        </div>

        <button class="hamburger" @click="mobileOpen = !mobileOpen" :aria-expanded="mobileOpen" aria-label="Toggle menu">
          <PhList v-if="!mobileOpen" :size="22" weight="bold" />
          <PhX v-else :size="22" weight="bold" />
        </button>
      </div>

      <!-- Mobile Menu -->
      <Transition name="slide-down">
        <div class="mobile-menu" v-if="mobileOpen">
          <div class="mobile-menu-inner">
            <div class="mobile-nav-links">
              <a href="#how-it-works" @click="mobileOpen = false">Process</a>
              <a href="#features" @click="mobileOpen = false">Features</a>
              <a href="#pricing" @click="mobileOpen = false">Pricing</a>
            </div>
            <div class="mobile-menu-divider"></div>
            <div class="mobile-menu-actions">
              <a href="#" class="btn-outline btn-full">Login</a>
              <a href="#" class="btn-primary btn-full">Get Started — Free</a>
            </div>
          </div>
        </div>
      </Transition>
    </header>

    <!-- Hero -->
    <section class="hero">
      <div class="container hero-grid">
        <div class="hero-content">
          <span class="badge">Trusted by 240+ Global Agencies</span>
          <h1>Instantly align your team with any <span class="text-accent">brand voice</span></h1>
          <p class="lead">
            Eliminate the risk of off-brand content. Toneload synchronizes your entire writing team so every client gets perfect copy from the very first draft.
          </p>
          <div class="hero-btns">
            <a href="#" class="btn-primary btn-lg">
              <PhBrowsers :size="18" weight="bold" />
              Add to Chrome — It's Free
            </a>
            <a href="#how-it-works" class="btn-ghost btn-lg">
              <PhPlayCircle :size="18" weight="fill" />
              View Demo
            </a>
          </div>
        </div>

        <!-- ── Hero Visual: Motion.dev / GSAP Animation Placeholder ── -->
        <!-- 
          ANIMATION RECOMMENDATION:
          Replace this block with a Motion.dev (or GSAP) animated composition.
          See the comment block below for specific implementation guidance.
        -->
        <div class="hero-visual">
          <div class="score-card-stack">

            <!-- Main Score Card -->
            <div class="score-card score-card--main">
              <div class="score-card-header">
                <span class="score-card-brand">Acme Corp</span>
                <span class="score-pill score-pill--high">On Brand</span>
              </div>
              <div class="score-ring-wrap">
                <svg class="score-ring" viewBox="0 0 120 120">
                  <circle class="ring-bg" cx="60" cy="60" r="50" />
                  <circle class="ring-fill" cx="60" cy="60" r="50"
                    stroke-dasharray="314"
                    stroke-dashoffset="28"
                  />
                </svg>
                <div class="score-value">91<span>%</span></div>
              </div>
              <p class="score-label">Brand Match Score</p>
            </div>

            <!-- Flag Chip — floats top-right -->
            <div class="float-chip float-chip--flag">
              <PhWarningCircle :size="14" weight="fill" class="chip-icon chip-icon--warn" />
              <span>"leverage" flagged</span>
            </div>

            <!-- Suggestion Chip — floats bottom-left -->
            <div class="float-chip float-chip--suggest">
              <PhArrowClockwise :size="14" weight="fill" class="chip-icon chip-icon--ok" />
              <span>Try "built for"</span>
            </div>

            <!-- Team Sync indicator -->
            <div class="float-chip float-chip--team">
              <span class="dot-live"></span>
              <span>3 writers synced</span>
            </div>

          </div>
        </div>
        <!-- END Hero Visual -->
      </div>
    </section>

    <!-- Features -->
    <section class="section-white" id="features">
      <div class="container">
        <div class="text-center mb-64">
          <h2 class="section-title">End the confusion of client switching</h2>
          <p class="section-desc">When your writers juggle multiple accounts, tone drifts. Toneload provides the guardrails to keep every word intentional.</p>
        </div>
        <div class="feature-cards">
          <div class="card" v-for="p in problems" :key="p.title">
            <div class="card-icon"><component :is="p.icon" weight="duotone" :size="40" /></div>
            <h3>{{ p.title }}</h3>
            <p>{{ p.body }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- How it Works -->
    <section class="section-gray" id="how-it-works">
      <div class="container">
        <div class="text-center mb-64">
          <h2 class="section-title">A simplified workflow for elite teams</h2>
          <p class="section-desc">From onboarding to delivery, Toneload ensures your agency remains the gold standard for client consistency.</p>
        </div>
        <div class="steps-container">
          <div class="step-item" v-for="(s, i) in steps" :key="s.title">
            <div class="step-number-badge">{{ String(i + 1) }}</div>
            <div class="step-illustration">
              <img :src="`/images/illustrations/${s.svg}.svg`" :alt="s.title" class="svg-placeholder" />
            </div>
            <div class="step-content">
              <h3>{{ s.title }}</h3>
              <p>{{ s.body }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Pricing -->
    <section class="section-white" id="pricing">
      <div class="container">
        <div class="text-center mb-64">
          <h2 class="section-title">Transparent pricing for growing teams</h2>
          <p class="section-desc">No hidden fees. Cancel anytime.</p>
        </div>
        <div class="pricing-grid">
          <div class="price-card" :class="{ featured: p.featured }" v-for="p in plans" :key="p.name">
            <div v-if="p.featured" class="featured-label">Most Popular</div>
            <div class="p-head">
              <span class="p-name">{{ p.name }}</span>
              <div class="p-amount">
                <span class="currency">$</span>{{ p.price }}<span class="period">/mo</span>
              </div>
            </div>
            <ul class="p-features">
              <li v-for="f in p.features" :key="f">
                <PhCheckCircle :size="16" weight="fill" class="check-icon" /> {{ f }}
              </li>
            </ul>
            <a href="#" :class="p.featured ? 'btn-primary btn-full' : 'btn-outline btn-full'">{{ p.cta }}</a>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="container">
        <div class="footer-top">
          <div class="footer-info">
            <a class="logo logo-white" href="#">
              <PhShieldCheck :size="22" weight="fill" class="logo-icon" />
              Toneload
            </a>
            <p>The standard for agency brand alignment.</p>
          </div>
          <div class="footer-links" v-for="col in footerCols" :key="col.head">
            <h4>{{ col.head }}</h4>
            <a v-for="l in col.links" :key="l" href="#">{{ l }}</a>
          </div>
        </div>
        <div class="footer-bottom">
          <p>© 2026 Toneload Inc. All rights reserved.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import {
  PhShieldCheck, PhList, PhX, PhPlayCircle, PhCheckCircle,
  PhArrowClockwise, PhWarningCircle, PhBrowsers
} from "@phosphor-icons/vue"

const scrolled = ref(false)
const mobileOpen = ref(false)
const onScroll = () => { scrolled.value = window.scrollY > 20 }
onMounted(() => window.addEventListener('scroll', onScroll))
onUnmounted(() => window.removeEventListener('scroll', onScroll))

const problems = [
  { icon: PhArrowClockwise, title: 'Eliminate Context Loss', body: "Stop relying on memory. Load exact brand rules the moment you open a document." },
  { icon: PhWarningCircle, title: 'Reduce Revision Cycles', body: "Catch off-brand terminology before the client ever sees it, saving hours of back-and-forth." },
  { icon: PhBrowsers, title: 'Unified Team Logic', body: "Ensure your junior writers and seniors are working from the same stylistic source of truth." },
]

const steps = [
  { title: 'Create a Profile', body: "Upload samples or a URL. Our engine maps the brand's DNA in seconds.", svg: "add_post" },
  { title: 'Deploy to the Team', body: "Sync the profile across your workspace so every writer has instant access.", svg: "shared_workspace" },
  { title: 'Write with Confidence', body: "Real-time scoring and vocabulary flags guide every sentence you produce.", svg: "writing" },
]

const plans = [
  { name: 'Individual', price: '0', features: ['1 Brand Profile', '20 Daily Checks', 'Chrome Extension'], cta: 'Get Started Free', featured: false },
  { name: 'Professional', price: '29', features: ['10 Brand Profiles', 'Unlimited Checks', 'Priority Support', 'Custom Vocabulary'], cta: 'Try Pro Free', featured: true },
  { name: 'Agency', price: '89', features: ['Unlimited Profiles', '5 Team Seats', 'Admin Dashboard', 'White-labeling'], cta: 'Contact Sales', featured: false },
]

const footerCols = [
  { head: 'Product', links: ['How it works', 'Features', 'Pricing'] },
  { head: 'Legal', links: ['Privacy Policy', 'Terms of Service', 'Security'] }
]
</script>

<style scoped>
/* ── Google Font (add to index.html head) ──────────────────────────────────
   <link rel="preconnect" href="https://fonts.googleapis.com">
   <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
   ──────────────────────────────────────────────────────────────────────── */

.landing {
  --primary: #0066FF;
  --primary-dark: #0047CC;
  --primary-light: #EBF3FF;
  --navy: #0A192F;
  --text-main: #1A1C21;
  --text-muted: #5A6478;
  --bg-gray: #F6F8FB;
  --border: #E4E9F0;
  --green: #10B981;
  --warn: #F59E0B;
  --radius: 10px;
  --radius-lg: 16px;
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.06);
  --shadow-md: 0 8px 30px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 24px 60px rgba(0, 0, 0, 0.10);
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  color: var(--text-main);
  line-height: 1.6;
}

.container {
  max-width: 1160px;
  margin: 0 auto;
  padding: 0 24px;
}


/* ════════════════════════════════════════
   TYPOGRAPHY
   ════════════════════════════════════════ */
h1 {
  font-size: clamp(32px, 5vw, 52px);
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.025em;
  margin-bottom: 20px;
  color: var(--navy);
}

h2.section-title {
  font-size: clamp(26px, 3.5vw, 36px);
  font-weight: 800;
  color: var(--navy);
  margin-bottom: 14px;
  letter-spacing: -0.02em;
}

.section-desc {
  font-size: 17px;
  color: var(--text-muted);
  max-width: 560px;
  margin: 0 auto;
  line-height: 1.7;
}

.lead {
  font-size: 18px;
  color: var(--text-muted);
  margin-bottom: 36px;
  max-width: 500px;
  line-height: 1.75;
}

.text-accent { color: var(--primary); }
.text-center { text-align: center; }
.mb-64 { margin-bottom: 64px; }


/* ════════════════════════════════════════
   BUTTONS — clean, consistent system
   ════════════════════════════════════════ */

/* Base shared styles */
.btn-primary,
.btn-outline,
.btn-ghost {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: inherit;
  font-weight: 600;
  border-radius: var(--radius);
  text-decoration: none;
  cursor: pointer;
  border: 2px solid transparent;
  transition: background 0.18s, color 0.18s, border-color 0.18s, box-shadow 0.18s, transform 0.12s;
  white-space: nowrap;
  line-height: 1;
}

.btn-primary:active,
.btn-outline:active,
.btn-ghost:active {
  transform: translateY(1px);
}

/* Sizes */
.btn-sm  { padding: 9px 18px;  font-size: 13.5px; }
.btn-md  { padding: 12px 22px; font-size: 15px; }
.btn-lg  { padding: 15px 28px; font-size: 15.5px; }
.btn-full { width: 100%; }

/* Primary */
.btn-primary {
  background: var(--primary);
  color: #fff;
  border-color: var(--primary);
  box-shadow: 0 1px 3px rgba(0, 102, 255, 0.25), 0 4px 14px rgba(0, 102, 255, 0.2);
}
.btn-primary:hover {
  background: var(--primary-dark);
  border-color: var(--primary-dark);
  box-shadow: 0 2px 6px rgba(0, 102, 255, 0.3), 0 8px 20px rgba(0, 102, 255, 0.25);
}

/* Outline */
.btn-outline {
  background: transparent;
  color: var(--navy);
  border-color: var(--border);
}
.btn-outline:hover {
  background: var(--bg-gray);
  border-color: #C8D2E0;
}

/* Ghost (hero secondary) */
.btn-ghost {
  background: transparent;
  color: var(--text-muted);
  border-color: transparent;
  padding-left: 8px;
  padding-right: 8px;
}
.btn-ghost:hover {
  color: var(--navy);
  background: rgba(0, 0, 0, 0.04);
}

/* Nav-specific login link */
.nav-signin {
  font-weight: 600;
  font-size: 14px;
  color: var(--text-muted);
  text-decoration: none;
  padding: 9px 14px;
  border-radius: var(--radius);
  transition: color 0.15s, background 0.15s;
}
.nav-signin:hover {
  color: var(--navy);
  background: var(--bg-gray);
}


/* ════════════════════════════════════════
   NAVIGATION
   ════════════════════════════════════════ */
.nav {
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 100;
  transition: background 0.3s, box-shadow 0.3s, padding 0.3s;
  background: transparent;
  padding: 18px 0;
}

.nav.scrolled {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 1px 0 var(--border), var(--shadow-sm);
  padding: 12px 0;
}

.nav-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

.logo {
  font-weight: 800;
  font-size: 2px;
  display: flex;
  align-items: center;
  gap: 7px;
  color: var(--navy);
  text-decoration: none;
  letter-spacing: -0.02em;
  flex-shrink: 0;
}

.nav-logo {display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.nav-logo-icon { width: 40px; height: 40px; overflow: hidden; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.nav-logo-img  { width: 100%; height: 100%; object-fit: contain; font-size: 24;}
.nav-logo-name { font-size: 24px; font-weight: 800; color: var(--text-primary); letter-spacing: -0.4px; }
.nav-badge {
  font-family: 'JetBrains Mono', monospace; font-size: 9px; font-weight: 500;
  padding: 2px 6px; border-radius: 4px;
  background: var(--bg-surface); border: 1px solid var(--border);
  color: var(--text-muted); letter-spacing: 0.3px;
}

.logo-white { color: #fff !important; }
.logo-icon { color: var(--primary); flex-shrink: 0; }

/* Desktop nav links */
.nav-links {
  display: none;
  align-items: center;
  gap: 4px;
  flex: 1;
  justify-content: center;
}

.nav-links a {
  text-decoration: none;
  color: var(--text-muted);
  font-weight: 600;
  font-size: 14px;
  padding: 7px 14px;
  border-radius: 8px;
  transition: color 0.15s, background 0.15s;
}

.nav-links a:hover {
  color: var(--navy);
  background: var(--bg-gray);
}

/* Desktop action buttons */
.nav-actions {
  display: none;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

/* Hamburger */
.hamburger {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  background: transparent;
  border: 1.5px solid var(--border);
  border-radius: 8px;
  color: var(--navy);
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
  flex-shrink: 0;
}

.hamburger:hover {
  background: var(--bg-gray);
  border-color: #C8D2E0;
}

/* ── Mobile Menu ─────────────────────────────────────── */
.mobile-menu {
  background: #fff;
  border-top: 1px solid var(--border);
  overflow: hidden;
}

.mobile-menu-inner {
  padding: 20px 24px 28px;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.mobile-nav-links {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: 16px;
}

.mobile-nav-links a {
  display: block;
  text-decoration: none;
  color: var(--text-main);
  font-weight: 600;
  font-size: 16px;
  padding: 12px 16px;
  border-radius: var(--radius);
  transition: background 0.15s, color 0.15s;
}

.mobile-nav-links a:hover {
  background: var(--bg-gray);
  color: var(--primary);
}

.mobile-menu-divider {
  height: 1px;
  background: var(--border);
  margin-bottom: 16px;
}

.mobile-menu-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* Slide-down transition for mobile menu */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: max-height 0.28s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.22s ease;
  max-height: 500px;
  opacity: 1;
  overflow: hidden;
}

.slide-down-enter-from,
.slide-down-leave-to {
  max-height: 0;
  opacity: 0;
}

/* ── Responsive breakpoints ─────────────────────── */
@media (min-width: 768px) {
  .hamburger { display: none; }
  .nav-links { display: flex; }
  .nav-actions { display: flex; }
  .mobile-menu { display: none !important; }
}


/* ════════════════════════════════════════
   HERO
   ════════════════════════════════════════ */
.hero {
  padding: 148px 0 96px;
  background: linear-gradient(165deg, #FFFFFF 0%, #F4F7FF 60%, #EBF3FF 100%);
  overflow: hidden;
}

.hero-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 64px;
  align-items: center;
}

@media (min-width: 992px) {
  .hero-grid {
    grid-template-columns: 1fr 1fr;
    gap: 48px;
  }
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--primary-light);
  color: var(--primary);
  font-size: 11.5px;
  font-weight: 700;
  padding: 6px 12px;
  border-radius: 20px;
  margin-bottom: 22px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  border: 1px solid rgba(0, 102, 255, 0.15);
}

.hero-btns {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}


/* ════════════════════════════════════════
   HERO VISUAL — Score Card Stack
   (Replace this entire block with Motion.dev)
   ════════════════════════════════════════ */
.hero-visual {
  display: flex;
  align-items: center;
  justify-content: center;
}

.score-card-stack {
  position: relative;
  width: 300px;
  height: 320px;
}

/* Main card */
.score-card {
  background: #fff;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  padding: 28px 28px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--border);
}

.score-card--main {
  position: absolute;
  top: 0; left: 0; right: 0;
}

.score-card-header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.score-card-brand {
  font-weight: 700;
  font-size: 14px;
  color: var(--navy);
}

.score-pill {
  font-size: 11px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.score-pill--high {
  background: #D1FAE5;
  color: #065F46;
}

/* SVG ring */
.score-ring-wrap {
  position: relative;
  width: 110px;
  height: 110px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.score-ring {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  transform: rotate(-90deg);
}

.ring-bg {
  fill: none;
  stroke: #EDF2F7;
  stroke-width: 10;
}

.ring-fill {
  fill: none;
  stroke: var(--primary);
  stroke-width: 10;
  stroke-linecap: round;
  transition: stroke-dashoffset 1s ease;
}

.score-value {
  font-size: 32px;
  font-weight: 800;
  color: var(--navy);
  letter-spacing: -0.03em;
  line-height: 1;
}

.score-value span {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-muted);
}

.score-label {
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 500;
  margin-top: 4px;
}

/* Floating chips */
.float-chip {
  position: absolute;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 7px 13px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-main);
  box-shadow: var(--shadow-md);
  white-space: nowrap;
  animation: float-bob 3s ease-in-out infinite;
}

.float-chip--flag {
  top: -16px;
  right: -24px;
  animation-delay: 0s;
}

.float-chip--suggest {
  bottom: 56px;
  left: -32px;
  animation-delay: 1s;
}

.float-chip--team {
  bottom: 8px;
  right: -20px;
  animation-delay: 2s;
}

.chip-icon--warn { color: var(--warn); }
.chip-icon--ok   { color: var(--green); }

.dot-live {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--green);
  animation: pulse-dot 1.5s ease-in-out infinite;
}

@keyframes float-bob {
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-5px); }
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
  50%       { opacity: 0.85; box-shadow: 0 0 0 5px rgba(16, 185, 129, 0); }
}


/* ════════════════════════════════════════
   SECTIONS
   ════════════════════════════════════════ */
.section-white { padding: 96px 0; background: #fff; }
.section-gray  { padding: 96px 0; background: var(--bg-gray); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }


/* ════════════════════════════════════════
   FEATURE CARDS
   ════════════════════════════════════════ */
.feature-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

.card {
  background: #fff;
  padding: 36px 32px;
  border-radius: var(--radius-lg);
  border: 0px solid var(--border);
  transition: box-shadow 0.2s, transform 0.2s;
}

.card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.card-icon {
  color: var(--primary);
  margin-bottom: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  /* background: var(--primary-light); */
  border-radius: 12px;
}

.card h3 {
  font-size: 17px;
  font-weight: 700;
  margin-bottom: 10px;
  color: var(--navy);
  letter-spacing: -0.01em;
}

.card p {
  color: var(--text-muted);
  font-size: 15px;
  line-height: 1.7;
}


/* ════════════════════════════════════════
   STEPS
   ════════════════════════════════════════ */
.steps-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 48px;
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  position: relative;
}

.step-number-badge {
  font-size: 11px;
  font-weight: 800;
  color: var(--primary);
  background: var(--primary-light);
  border: 0px solid rgba(0, 102, 255, 0.15);
  border-radius: 20px;
  padding: 4px 12px;
  letter-spacing: 0.08em;
  margin-bottom: 20px;
}

.step-illustration {
  width: 100%;
  border-radius: var(--radius-lg);
  aspect-ratio: 16 / 10;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  overflow: hidden;
  background: var(--primary-light);
  border: 0px solid rgba(0, 102, 255, 0.1);
}

.svg-placeholder {
  width: 75%;
  height: auto;
  opacity: 0.85;
}

.step-content h3 {
  font-size: 17px;
  font-weight: 700;
  margin-bottom: 10px;
  color: var(--navy);
  letter-spacing: -0.01em;
}

.step-content p {
  color: var(--text-muted);
  font-size: 15px;
  line-height: 1.7;
}


/* ════════════════════════════════════════
   PRICING
   ════════════════════════════════════════ */
.pricing-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  align-items: start;
}

.price-card {
  background: #fff;
  padding: 36px 32px 32px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  position: relative;
  transition: box-shadow 0.2s;
}

.price-card.featured {
  border: 2px solid var(--primary);
  box-shadow: 0 0 0 4px rgba(0, 102, 255, 0.07), var(--shadow-md);
}

.price-card:hover {
  box-shadow: var(--shadow-md);
}

.featured-label {
  position: absolute;
  top: -13px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--primary);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 14px;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  white-space: nowrap;
}

.p-head { margin-bottom: 28px; }

.p-name {
  display: block;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-muted);
  font-size: 11.5px;
  margin-bottom: 12px;
}

.p-amount {
  font-size: 44px;
  font-weight: 800;
  color: var(--navy);
  letter-spacing: -0.03em;
  line-height: 1;
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.currency {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 4px;
  color: var(--text-muted);
}

.period {
  font-size: 14px;
  color: var(--text-muted);
  font-weight: 500;
  margin-left: 2px;
}

.p-features {
  list-style: none;
  padding: 0;
  margin: 0 0 32px 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.p-features li {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--text-muted);
  font-size: 14.5px;
}

.check-icon {
  color: var(--green);
  flex-shrink: 0;
}


/* ════════════════════════════════════════
   FOOTER
   ════════════════════════════════════════ */
.footer {
  background: var(--navy);
  color: #fff;
  padding: 72px 0 40px;
}

.footer-top {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 48px;
  margin-bottom: 56px;
}

.footer-info .logo {
  color: #fff;
  margin-bottom: 16px;
  display: inline-flex;
}

.footer-info p {
  color: #8A97AA;
  font-size: 14px;
  line-height: 1.7;
}

.footer-links h4 {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  margin-bottom: 20px;
  color: #5A6B80;
  font-weight: 700;
}

.footer-links a {
  display: block;
  color: #8A97AA;
  text-decoration: none;
  margin-bottom: 12px;
  font-size: 14.5px;
  transition: color 0.15s;
}

.footer-links a:hover { color: #fff; }

.footer-bottom {
  border-top: 1px solid #1E2D42;
  padding-top: 32px;
  color: #5A6B80;
  font-size: 13.5px;
}
</style>

<!--
════════════════════════════════════════════════════════════════════════════════
  HERO ANIMATION RECOMMENDATION
════════════════════════════════════════════════════════════════════════════════

  RECOMMENDED: Motion.dev (formerly Framer Motion for the web)
  Install: npm install motion

  Why Motion.dev?
  ─────────────────────────────────────────────────────────────────────────────
  • Works with Vue via the `<Motion>` component or the `motion()` utility
  • Hardware-accelerated (uses CSS compositor where possible)
  • Tiny bundle (~18 kB gzip) — much lighter than GSAP for this use case
  • Spring physics: the chips can "bounce" in with natural feel
  • Stagger and sequence APIs are dead-simple

  Implementation sketch (replace .score-card-stack div):
  ─────────────────────────────────────────────────────────────────────────────
  1. npm install motion
  2. In <script setup>, import { animate, inView, stagger } from 'motion'
  3. onMounted(() => {
       animate('.score-card--main',
         { opacity: [0, 1], y: [24, 0], scale: [0.95, 1] },
         { duration: 0.5, easing: [0.22, 1, 0.36, 1] }
       )
       animate('.float-chip',
         { opacity: [0, 1], y: [16, 0] },
         { delay: stagger(0.15, { start: 0.3 }), duration: 0.4, easing: 'ease-out' }
       )
       // Continuously animate the ring fill on mount:
       animate('.ring-fill',
         { strokeDashoffset: [314, 28] },
         { duration: 1.2, delay: 0.4, easing: [0.22, 1, 0.36, 1] }
       )
     })

  Alternatively: GSAP (GreenSock)
  ─────────────────────────────────────────────────────────────────────────────
  • Better for complex timelines (e.g. sequential card reveals)
  • ScrollTrigger plugin for scroll-driven entry animations
  • Larger bundle but industry standard for marketing pages
  • npm install gsap

  Both are excellent choices. Motion.dev wins on bundle size and Vue DX;
  GSAP wins on timeline control and ScrollTrigger power.

════════════════════════════════════════════════════════════════════════════════
-->