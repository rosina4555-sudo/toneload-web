<template>
  <div class="landing">
    <header class="nav" :class="{ scrolled }">
      <div class="container nav-inner">
        <a class="logo" href="#">
          <PhShieldCheck :size="28" weight="fill" class="logo-icon" />
          Toneload
        </a>
        <nav class="nav-links">
          <a href="#how-it-works">Process</a>
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
        </nav>
        <div class="nav-actions">
          <a href="#" class="nav-signin">Login</a>
          <a href="#" class="btn-primary btn-sm">Get Started</a>
        </div>
        <button class="hamburger" @click="mobileOpen = !mobileOpen">
          <PhList v-if="!mobileOpen" :size="24" /><PhX v-else :size="24" />
        </button>
      </div>
      <div class="mobile-menu" v-if="mobileOpen">
        <a href="#how-it-works" @click="mobileOpen = false">Process</a>
        <a href="#features" @click="mobileOpen = false">Features</a>
        <a href="#pricing" @click="mobileOpen = false">Pricing</a>
        <a href="#" class="btn-primary btn-full mt">Get Started</a>
      </div>
    </header>

    <section class="hero">
      <div class="container hero-grid">
        <div class="hero-content">
          <span class="badge">Trusted by 240+ Global Agencies</span>
          <h1>Instantly align your team with any <span class="text-accent">brand voice</span></h1>
          <p class="lead">
            Eliminate the risk of off-brand content. Toneload synchronizes your entire writing team so every client gets perfect copy from the very first draft.
          </p>
          <div class="hero-btns">
            <a href="#" class="btn-primary btn-lg">Add to Chrome — It's Free</a>
            <a href="#how-it-works" class="btn-outline btn-lg">
              <PhPlayCircle :size="20" /> View Demo
            </a>
          </div>
        </div>
        <div class="hero-visual">
          <div class="interface-mock">
            <div class="mock-header">
              <div class="mock-dots"><span></span><span></span><span></span></div>
              <div class="mock-search">toneload.app</div>
            </div>
            <div class="mock-body">
              <div class="mock-sidebar"></div>
              <div class="mock-main">
                <div class="mock-line long"></div>
                <div class="mock-line"></div>
                <div class="mock-tag">Brand Match: 98%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="section-white" id="features">
      <div class="container">
        <div class="text-center mb-64">
          <h2 class="section-title">End the confusion of client switching</h2>
          <p class="section-desc">When your writers juggle multiple accounts, tone drifts. Toneload provides the guardrails to keep every word intentional.</p>
        </div>

        <div class="feature-cards">
          <div class="card" v-for="p in problems" :key="p.title">
            <div class="card-icon"><component :is="p.icon" weight="duotone" :size="50" /></div>
            <h3>{{ p.title }}</h3>
            <p>{{ p.body }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="section-white" id="how-it-works">
      <div class="container">
        <div class="text-center mb-64">
          <h2 class="section-title">A simplified workflow for elite teams</h2>
          <p class="section-desc">From onboarding to delivery, Toneload ensures your agency remains the gold standard for client consistency.</p>
        </div>

        <div class="steps-container">
          <div class="step-item" v-for="(s, i) in steps" :key="s.title">
            <div class="step-illustration">
              <img :src="`/images/illustrations/${s.svg}.svg`" :alt="s.title" class="svg-placeholder" />
            </div>
            <div class="step-meta">
              <!-- <div class="step-number">0{{ i + 1 }}</div> -->
              <div class="step-content">
                <h3>{{ s.title }}</h3>
                <p>{{ s.body }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="section-gray" id="pricing">
      <div class="container">
        <div class="text-center mb-64">
          <h2 class="section-title">Transparent pricing for growing teams</h2>
        </div>
        <div class="pricing-grid">
          <div class="price-card" :class="{ featured: p.featured }" v-for="p in plans" :key="p.name">
            <div class="p-head">
              <span class="p-name">{{ p.name }}</span>
              <div class="p-amount">
                <span class="currency">$</span>{{ p.price }}<span class="period">/mo</span>
              </div>
            </div>
            <ul class="p-features">
              <li v-for="f in p.features" :key="f"><PhCheckCircle :size="18" weight="fill" /> {{ f }}</li>
            </ul>
            <a href="#" :class="p.featured ? 'btn-primary' : 'btn-outline'" class="btn-full">{{ p.cta }}</a>
          </div>
        </div>
      </div>
    </section>

    <footer class="footer">
      <div class="container">
        <div class="footer-top">
          <div class="footer-info">
             <a class="logo white" href="#">Toneload</a>
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
  { title: 'Create a Profile', body: "Upload samples or a URL. Our engine maps the brand's DNA in seconds.", svg: "add_post"},
  { title: 'Deploy to the Team', body: "Sync the profile across your workspace so every writer has instant access.", svg: "shared_workspace"},
  { title: 'Write with Confidence', body: "Real-time scoring and vocabulary flags guide every sentence you produce.", svg: "writing"},
]

const plans = [
  { name: 'Individual', price: '0', features: ['1 Brand Profile', '20 Daily Checks', 'Chrome Extension'], cta: 'Get Started', featured: false },
  { name: 'Professional', price: '29', features: ['10 Brand Profiles', 'Unlimited Checks', 'Priority Support', 'Custom Vocabulary'], cta: 'Try Pro Free', featured: true },
  { name: 'Agency', price: '89', features: ['Unlimited Profiles', '5 Team Seats', 'Admin Dashboard', 'White-labeling'], cta: 'Contact Sales', featured: false },
]

const footerCols = [
  { head: 'Product', links: ['How it works', 'Features', 'Pricing'] },
  { head: 'Legal', links: ['Privacy Policy', 'Terms of Service', 'Security'] }
]
</script>

<style scoped>
.landing {
  --primary: #0066FF;
  --primary-hover: #0052cc;
  --navy: #0A192F;
  --text-main: #1A1C21;
  --text-muted: #4F5665;
  --bg-gray: #F8FAFC;
  --green: #10B981;
  color: var(--text-main);
  line-height: 1.5;
}

.container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }

/* ── Typography ── */
h1 { font-size: clamp(32px, 5vw, 52px); font-weight: 800; line-height: 1.1; letter-spacing: -0.02em; margin-bottom: 24px; color: var(--navy); }
h2.section-title { font-size: clamp(28px, 4vw, 36px); font-weight: 700; color: var(--navy); margin-bottom: 16px; }
.section-desc { font-size: 18px; color: var(--text-muted); max-width: 600px; margin: 0 auto; }
.lead { font-size: 19px; color: var(--text-muted); margin-bottom: 40px; max-width: 540px; }
.text-accent { color: var(--primary); }
.text-center { text-align: center; }
.mb-64 { margin-bottom: 64px; }

/* ── Navigation ── */
.nav { position: fixed; top: 0; width: 100%; z-index: 100; transition: all 0.3s; background: transparent; padding: 20px 0; }
.nav.scrolled { background: #fff; box-shadow: 0 4px 20px rgba(0,0,0,0.05); padding: 12px 0; }
.nav-inner { display: flex; align-items: center; justify-content: space-between; }
.logo { font-weight: 800; font-size: 22px; display: flex; align-items: center; gap: 8px; color: var(--navy); text-decoration: none; }
.logo.white { color: #fff; }
.logo-icon { color: var(--primary); }
.nav-links { display: none; gap: 32px; }
@media (min-width: 768px) { .nav-links { display: flex; } }
.nav-links a { text-decoration: none; color: var(--text-muted); font-weight: 500; font-size: 15px; }

/* ── Buttons ── */
.btn-primary { background: var(--primary); color: #fff; padding: 12px 24px; border-radius: 6px; font-weight: 600; text-decoration: none; transition: 0.2s; display: inline-flex; align-items: center; gap: 8px; border: none; cursor: pointer; }
.btn-primary:hover { background: var(--primary-hover); }
.btn-outline { border: 1.5px solid #E2E8F0; color: var(--navy); padding: 12px 24px; border-radius: 6px; font-weight: 600; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; }
.btn-lg { padding: 16px 32px; font-size: 16px; }
.btn-sm { padding: 8px 16px; font-size: 14px; }
.btn-full { width: 100%; justify-content: center; }

/* ── Hero ── */
.hero { padding: 160px 0 100px; background: linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%); }
.hero-grid { display: grid; grid-template-columns: 1fr; gap: 60px; align-items: center; }
@media (min-width: 992px) { .hero-grid { grid-template-columns: 1.2fr 0.8fr; } }
.badge { background: #EBF4FF; color: var(--primary); font-size: 12px; font-weight: 700; padding: 6px 12px; border-radius: 20px; display: inline-block; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 0.05em; }
.hero-btns { display: flex; gap: 16px; flex-wrap: wrap; }

/* ── Interface Mock ── */
.interface-mock { background: #fff; border-radius: 12px; box-shadow: 0 40px 80px rgba(0,0,0,0.08); overflow: hidden; }
.mock-header { background: #F1F5F9; padding: 12px; display: flex; align-items: center; gap: 12px; }
.mock-dots { display: flex; gap: 6px; }
.mock-dots span { width: 8px; height: 8px; background: #CBD5E1; border-radius: 50%; }
.mock-search { background: #fff; flex: 1; border-radius: 4px; height: 20px; font-size: 10px; padding: 2px 10px; color: #94A3B8; }
.mock-body { height: 240px; display: flex; }
.mock-sidebar { width: 60px; background: #F8FAFC; border-right: 1px solid #E2E8F0; }
.mock-main { padding: 24px; flex: 1; }
.mock-line { height: 10px; background: #F1F5F9; border-radius: 2px; margin-bottom: 12px; width: 80%; }
.mock-line.long { width: 100%; }
.mock-tag { background: #D1FAE5; color: #065F46; padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: 700; display: inline-block; margin-top: 20px; }

/* ── Sections ── */
.section-white { padding: 100px 0; background: #fff; }
.section-gray { padding: 100px 0; background: var(--bg-gray); border-top: 1px solid #E2E8F0; border-bottom: 1px solid #E2E8F0; }

/* ── Feature Cards ── */
.feature-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 32px; }
.card { background: #fff; padding: 40px; border-radius: 12px; border: 0px solid #E2E8F0; }
.card-icon { color: var(--primary); margin-bottom: 24px; }
.card h3 { font-size: 20px; font-weight: 700; margin-bottom: 12px; }
.card p { color: var(--text-muted); }

/* ── Steps Section ── */
.steps-container { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 48px; }
.step-item { display: flex; flex-direction: column; align-items: flex-start; }
.step-illustration { width: 100%;  border-radius: 12px; aspect-ratio: 16/10; display: flex; align-items: center; justify-content: center; margin-bottom: 24px; overflow: hidden; border: 0px solid #E2E8F0; }
.svg-placeholder { width: 80%; height: auto; opacity: 0.8; }
.step-meta { display: flex; gap: 16px; }
.step-number { font-size: 24px; font-weight: 800; color: var(--primary); opacity: 0.3; line-height: 1; }
.step-content h3 { font-size: 18px; font-weight: 700; margin-bottom: 10px; color: var(--navy); }
.step-content p { color: var(--text-muted); font-size: 15px; }

/* ── Pricing ── */
.pricing-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; }
.price-card { background: #fff; padding: 40px; border-radius: 12px; border: 1px solid #E2E8F0; display: flex; flex-direction: column; }
.price-card.featured { border: 2px solid var(--primary); position: relative; }
.p-head { margin-bottom: 32px; }
.p-name { font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-muted); font-size: 12px; }
.p-amount { font-size: 48px; font-weight: 800; color: var(--navy); }
.p-amount .currency { font-size: 20px; vertical-align: top; margin-top: 10px; display: inline-block; }
.p-amount .period { font-size: 16px; color: var(--text-muted); font-weight: 400; }
.p-features { list-style: none; padding: 0; margin: 0 0 40px 0; flex: 1; }
.p-features li { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; color: var(--text-muted); font-size: 15px; }

/* ── Footer ── */
.footer { background: var(--navy); color: #fff; padding: 80px 0 40px; }
.footer-top { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 48px; margin-bottom: 60px; }
.footer-info .logo { color: #fff; margin-bottom: 20px; }
.footer-info p { color: #94A3B8; }
.footer-links h4 { font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 24px; color: #64748B; }
.footer-links a { display: block; color: #94A3B8; text-decoration: none; margin-bottom: 12px; font-size: 15px; }
.footer-bottom { border-top: 1px solid #1E293B; padding-top: 40px; color: #64748B; font-size: 14px; }

.hamburger { display: none; background: none; border: none; color: var(--navy); cursor: pointer; }
@media (max-width: 767px) { .hamburger { display: block; } }
</style>