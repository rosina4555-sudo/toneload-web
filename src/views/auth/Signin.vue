<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { loginSchema, registerSchema } from '@/api/auth'
import AuthInput from '@/components/ui/AuthInput.vue' 

const router = useRouter()
const route  = useRoute()
const auth   = useAuthStore()

const isSignUp = ref(false)
const loading  = ref(false)
const showPass = ref(false)

const form = reactive({ fullName: '', email: '', password: '', confirmPassword: '' })
const errors = reactive({ fullName: '', email: '', password: '', confirmPassword: '', general: '' })

const checkMode = () => {
  isSignUp.value = route.query.mode === 'signup'
}

onMounted(checkMode)
watch(() => route.query.mode, checkMode)

function clearErrors() {
  Object.keys(errors).forEach(k => errors[k] = '')
}

async function handleSubmit() {
  clearErrors();
  
  const schema = isSignUp.value ? registerSchema : loginSchema;
  
  // 1. Log the result to see the structure of your specific Zod version
  const result = schema.safeParse(form);
  console.log("Zod Result Object:", result);

  if (!result.success) {
    // 2. Try standard Zod 3.x path
    if (result.error?.errors) {
      result.error.errors.forEach((e) => {
        const field = e.path[0];
        if (field in errors) errors[field] = e.message;
      });
    } 
    // 3. Fallback: Try the "flatten" method if version 4/beta is different
    else if (result.error?.flatten) {
      const flattened = result.error.flatten();
      const fieldErrors = flattened.fieldErrors;
      for (const field in fieldErrors) {
        if (field in errors) errors[field] = fieldErrors[field][0];
      }
    }
    return;
  }

  loading.value = true;
  try {
    isSignUp.value ? await auth.register(form) : await auth.login(form);
    router.push(route.query.redirect || '/dashboard');
  } catch (err) {
    errors.general = err.response?.data?.message || 'Authentication failed';
  } finally {
    loading.value = false;
  }
}


</script>

<template>
  <div class="auth-page">
    <div class="auth-container">
      
      <div class="auth-visual">
        <div class="visual-content">
          <RouterLink to="/" class="logo white">
            <img src="/images/logo_test1.png" class="logo-icon" alt="Toneload" />
            Toneload
          </RouterLink>
          <div class="testimonial">
            <p>"The standard for agency brand alignment. We've cut revision cycles by 40%."</p>
            <span>— Sarah Jenkins, Creative Director</span>
          </div>
        </div>
      </div>

      <div class="auth-form-section">
        <div class="form-header-mobile">
          <img src="/images/logo_test1.png" class="logo-icon" alt="Toneload" />
          <span class="logo-text">Toneload</span>
        </div>

        <div class="form-card">
          <div class="form-intro">
            <h1>{{ isSignUp ? 'Create your account' : 'Welcome back' }}</h1>
            <p>{{ isSignUp ? 'Join 240+ agencies using Toneload.' : 'Enter your details to access your dashboard.' }}</p>
          </div>

          <div v-if="errors.general" class="alert-error">
            <PhWarningCircle :size="18" weight="fill" />
            {{ errors.general }}
          </div>

          <button class="btn-google" type="button">
            <PhGoogleLogo :size="20" weight="bold" />
            {{ isSignUp ? 'Sign up with Google' : 'Sign in with Google' }}
          </button>

          <div class="divider"><span>or continue with email</span></div>

          <form @submit.prevent="handleSubmit" novalidate>
            <AuthInput 
              v-if="isSignUp"
              v-model="form.fullName"
              label="Full Name"
              placeholder="John Doe"
              :icon="PhUser"
              id="name"
              :error="errors.fullName"
            />

            <AuthInput 
              v-model="form.email"
              label="Email Address"
              placeholder="name@agency.com"
              type="email"
              :icon="PhEnvelopeSimple"
              id="email"
              :error="errors.email"
            />

            <AuthInput 
              v-model="form.password"
              label="Password"
              placeholder="••••••••"
              :type="showPass ? 'text' : 'password'"
              :icon="PhLockKey"
              id="pass"
              :error="errors.password"
            >
              <template #label-right>
                <a href="#" v-if="!isSignUp" class="forgot-link">Forgot?</a>
              </template>
              <template #input-right>
                <button type="button" class="toggle-pass" @click="showPass = !showPass">
                  <PhEye v-if="!showPass" :size="18" />
                  <PhEyeClosed v-else :size="18" />
                </button>
              </template>
            </AuthInput>

            <AuthInput 
              v-if="isSignUp"
              v-model="form.confirmPassword"
              label="Confirm Password"
              placeholder="••••••••"
              type="password"
              :icon="PhLockKey"
              id="confirm"
              :error="errors.confirmPassword"
            />

            <button type="submit" class="btn-primary btn-full" :disabled="loading">
              <span v-if="!loading">{{ isSignUp ? 'Create Account' : 'Sign In' }}</span>
              <span v-else>Processing...</span>
              <PhArrowRight v-if="!loading" :size="18" weight="bold" />
            </button>
          </form>

          <p class="auth-footer">
            {{ isSignUp ? 'Already have an account?' : "Don't have an account?" }}
            <button @click="router.push({ query: { mode: isSignUp ? 'login' : 'signup' } })" class="toggle-btn">
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

<style scoped>
.auth-page {
  --primary: #0066FF;
  --primary-hover: #0052cc;
  --navy: #0A192F;
  --text-main: #1A1C21;
  --text-muted: #64748B;
  --border: #E2E8F0;
  --error: #DC2626;
  --error-bg: #FEF2F2;
  
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

@media (min-width: 1024px) {
  .auth-container {
    grid-template-columns: 40% 60%;
  }
}

/* ── Left Sidebar ── */
.auth-visual {
  display: none;
  background: var(--navy);
  padding: 60px;
  position: relative;
}

@media (min-width: 1024px) {
  .auth-visual {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
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
  margin-bottom: 120px;
}

.logo-icon { width: 42px; height: 42px; object-fit: contain; }

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
  gap: 12px;
  margin-bottom: 40px;
}

@media (min-width: 1024px) {
  .form-header-mobile { display: none; }
}

.logo-text { font-weight: 800; font-size: 22px; color: var(--navy); }

.form-card {
  width: 100%;
  max-width: 420px;
}

.form-intro { margin-bottom: 32px; }
.form-intro h1 { font-size: 28px; font-weight: 800; color: var(--navy); margin-bottom: 8px; }
.form-intro p { color: var(--text-muted); font-size: 15px; }

.alert-error {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--error-bg);
  color: var(--error);
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  margin-bottom: 20px;
  border: 1px solid #FCA5A5;
}

/* ── Social Button ── */
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
  color: var(--navy);
  cursor: pointer;
  margin-bottom: 24px;
}

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

/* ── Action Button ── */
.btn-primary {
  background: var(--primary);
  color: #fff;
  border: none;
  padding: 14px;
  border-radius: 8px;
  font-weight: 700;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: 0.2s;
}

.btn-full { width: 100%; margin-top: 10px; }
.btn-primary:hover { background: var(--primary-hover); }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

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
}

.form-mini-footer {
  margin-top: auto;
  padding-top: 40px;
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: var(--text-muted);
}
</style>