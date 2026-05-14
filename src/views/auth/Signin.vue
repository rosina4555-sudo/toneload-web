<template>
  <div class="auth-page">
    <div class="auth-container">
      <!-- ── Left Side: Brand/Visual (Hidden on Mobile) ── -->
      <div class="auth-visual">
        <div class="visual-content">
          <a href="/" class="logo white">
             <img src="/images/logo_test1.png" size="5" weight="fill" class="logo-icon" />
            Toneload
          </a>
          <div class="testimonial">
            <p>"The standard for agency brand alignment. We've cut revision cycles by 40%."</p>
            <span>— Sarah Jenkins, Creative Director</span>
          </div>
        </div>
      </div>

      <!-- ── Right Side: Form ── -->
      <div class="auth-form-section">
        <div class="form-header-mobile">
            <img src="/images/logo_test1.png" size="5" weight="fill" class="logo-icon" />
           <span class="logo-text">Toneload</span>
        </div>

        <div class="form-card">
          <div class="form-intro">
            <h1>{{ isSignUp ? 'Create your account' : 'Welcome back' }}</h1>
            <p>{{ isSignUp ? 'Join 240+ agencies using Toneload.' : 'Enter your details to access your dashboard.' }}</p>
          </div>

          <!-- Social Auth -->
          <button class="btn-google">
            <PhGoogleLogo :size="20" weight="bold" />
            {{ isSignUp ? 'Sign up with Google' : 'Sign in with Google' }}
          </button>

          <div class="divider">
            <span>or continue with email</span>
          </div>

          <form @submit.prevent="handleAuth">
            <div class="input-group" v-if="isSignUp">
              <label>Full Name</label>
              <div class="input-wrapper">
                <PhUser class="input-icon" :size="18" />
                <input type="text" placeholder="John Doe" required />
              </div>
            </div>

            <div class="input-group">
              <label>Email Address</label>
              <div class="input-wrapper">
                <PhEnvelopeSimple class="input-icon" :size="18" />
                <input type="email" placeholder="name@agency.com" required />
              </div>
            </div>

            <div class="input-group">
              <div class="label-row">
                <label>Password</label>
                <a href="#" v-if="!isSignUp" class="forgot-link">Forgot?</a>
              </div>
              <div class="input-wrapper">
                <PhLockKey class="input-icon" :size="18" />
                <input type="password" placeholder="••••••••" required />
              </div>
            </div>

            <button type="submit" class="btn-primary btn-full">
              {{ isSignUp ? 'Create Account' : 'Sign In' }}
            </button>
          </form>

          <p class="auth-footer">
            {{ isSignUp ? 'Already have an account?' : "Don't have an account?" }}
            <button @click="isSignUp = !isSignUp" class="toggle-btn">
              {{ isSignUp ? 'Sign In' : 'Sign Up for Free' }}
            </button>
          </p>
        </div>
        
        <footer class="form-mini-footer">
          <a href="#">Privacy Policy</a>
          <span>•</span>
          <a href="#">Terms of Service</a>
        </footer>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { PhShieldCheck, PhGoogleLogo, PhEnvelopeSimple, PhLockKey, PhUser } from "@phosphor-icons/vue"

const isSignUp = ref(false)

const handleAuth = () => {
  // Logic for Firebase/Supabase/API goes here
  console.log("Form submitted")
}
</script>

<style scoped>
.auth-page {
  --primary: #0066FF;
  --primary-hover: #0052cc;
  --navy: #0A192F;
  --text-main: #1A1C21;
  --text-muted: #64748B;
  --border: #E2E8F0;
  
  min-height: 100vh;
  display: flex;
  background-color: #fff;
  color: var(--text-main);
  font-family: 'Inter', sans-serif;
}

.auth-container {
  display: grid;
  grid-template-columns: 1fr;
  width: 100%;
}

/* ── Responsive Grid ── */
@media (min-width: 1024px) {
  .auth-container {
    grid-template-columns: 40% 60%;
  }
}

/* ── Visual Sidebar (Desktop Only) ── */
.auth-visual {
  display: none;
  background: var(--navy);
  padding: 60px;
  position: relative;
  overflow: hidden;
}

@media (min-width: 1024px) {
  .auth-visual {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
}

.visual-content .logo {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 24px;
  font-weight: 800;
  color: #fff;
  text-decoration: none;
}
/* .logo-text {
    color: #fff;
} */

.logo-icon { width: 50px; height: 50px; overflow: hidden; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }



.testimonial {
  color: #fff;
  max-width: 400px;
}

.testimonial p {
  font-size: 24px;
  font-weight: 500;
  line-height: 1.4;
  margin-bottom: 16px;
  opacity: 0.9;
}

.testimonial span {
  color: var(--primary);
  font-weight: 600;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* ── Form Section ── */
.auth-form-section {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 40px 24px;
}

.form-header-mobile {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 40px;
}

@media (min-width: 1024px) {
  .form-header-mobile { display: none; }
}

.logo-text { font-weight: 800; font-size: 20px; color: var(--navy); }

.form-card {
  width: 100%;
  max-width: 400px;
}

.form-intro { margin-bottom: 32px; }
.form-intro h1 { font-size: 28px; font-weight: 800; color: var(--navy); margin-bottom: 8px; }
.form-intro p { color: var(--text-muted); font-size: 15px; }

/* ── Inputs ── */
.input-group { margin-bottom: 20px; }
.label-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
label { font-size: 14px; font-weight: 600; color: var(--navy); display: block; margin-bottom: 8px; }

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 14px;
  color: var(--text-muted);
}

input {
  width: 100%;
  padding: 12px 12px 12px 42px;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 15px;
  transition: all 0.2s;
  outline: none;
}

input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 4px rgba(0, 102, 255, 0.1);
}

/* ── Buttons ── */
.btn-primary {
  background: var(--primary);
  color: #fff;
  border: none;
  padding: 14px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
  transition: 0.2s;
  margin-top: 12px;
}

.btn-primary:hover { background: var(--primary-hover); }
.btn-full { width: 100%; }

.btn-google {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: #fff;
  border: 1px solid var(--border);
  padding: 12px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 15px;
  color: var(--navy);
  cursor: pointer;
  transition: 0.2s;
}

.btn-google:hover { background: #f8fafc; border-color: #cbd5e1; }

/* ── Utilities ── */
.divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 24px 0;
  color: var(--text-muted);
  font-size: 13px;
}

.divider::before, .divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid var(--border);
}

.divider span { padding: 0 12px; }

.forgot-link { color: var(--primary); text-decoration: none; font-size: 13px; font-weight: 600; }

.auth-footer {
  text-align: center;
  margin-top: 32px;
  font-size: 14px;
  color: var(--text-muted);
}

.toggle-btn {
  background: none;
  border: none;
  color: var(--primary);
  font-weight: 700;
  cursor: pointer;
  padding: 0;
  margin-left: 4px;
}

.form-mini-footer {
  margin-top: auto;
  padding-top: 40px;
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: var(--text-muted);
}

.form-mini-footer a { color: inherit; text-decoration: none; }
</style>