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
  // console.log("Zod Result Object:", result);

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
            <img src="/images/voice_load_logo_web.png" class="logo-icon" alt="Voiceload" />
            Brandload
          </RouterLink>
          <div class="testimonial">
            <p>"The standard for agency brand alignment. We've cut revision cycles by 40%."</p>
            <span>— Sarah Jenkins, Creative Director</span>
          </div>
        </div>
      </div>

      <div class="auth-form-section">
        <div class="form-header-mobile">
          <img src="/images/voice_load_logo_web.png" class="logo-icon" alt="Voiceload" />
          <span class="logo-text">Brandload</span>
        </div>

        <div class="form-card">
          <div class="form-intro">
            <h1>{{ isSignUp ? 'Create your account' : 'Welcome back' }}</h1>
            <p>{{ isSignUp ? 'Join 240+ agencies using Brandload.' : 'Enter your details to access your dashboard.' }}</p>
          </div>

          <div v-if="errors.general" class="alert-error">
            <PhWarningCircle :size="18" weight="fill" />
            {{ errors.general }}
          </div>

          <!-- <button class="btn-google" type="button">
            <PhGoogleLogo :size="20" weight="bold" />
            {{ isSignUp ? 'Sign up with Google' : 'Sign in with Google' }}
          </button> -->
          <button class="btn-google" type="button">
  <svg class="google-icon" viewBox="0 0 48 48" width="18" height="18">
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
    <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 01-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
  </svg>
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
  --border: #E4E9F0;
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
  font-size: 22px;
  font-weight: 700;
  color: #fff;
  text-decoration: none;
  margin-bottom: 100px;
  letter-spacing: -0.2px;
}

.logo-icon { width: 44px; height: 44px; object-fit: contain; }

.testimonial {
  color: #fff;
  max-width: 380px;
}

.testimonial p {
  font-size: 20px;
  font-weight: 500;
  line-height: 1.4;
  margin-bottom: 14px;
  opacity: 0.9;
}

.testimonial span {
  color: var(--primary);
  font-weight: 600;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

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
  gap: 10px;
  margin-bottom: 32px;
}

@media (min-width: 1024px) {
  .form-header-mobile { display: none; }
}

.logo-text { font-weight: 700; font-size: 20px; color: var(--navy); letter-spacing: -0.2px; }

.form-card {
  width: 100%;
  max-width: 400px;
}

.form-intro { margin-bottom: 24px; }
.form-intro h1 { font-size: 22px; font-weight: 700; color: var(--navy); margin-bottom: 6px; letter-spacing: -0.2px; }
.form-intro p { color: var(--text-muted); font-size: 14px; }

.alert-error {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--error-bg);
  color: var(--error);
  padding: 10px 12px;
  border-radius: 6px;
  font-size: 13px;
  margin-bottom: 16px;
  border: 1px solid #FCA5A5;
}

.btn-google {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: #fff;
  border: 1px solid var(--border);
  padding: 10px;
  border-radius: 6px;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: #3c4043;
  cursor: pointer;
  margin-bottom: 20px;
  transition: background 0.14s, border-color 0.14s;
}

.btn-google:hover {
  background: #f8f9fa;
  border-color: var(--border-strong);
}

.google-icon {
  flex-shrink: 0;
}

.divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 20px 0;
  color: var(--text-muted);
  font-size: 12px;
}

.divider::before, .divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid var(--border);
}

.divider span { padding: 0 10px; }

.btn-primary {
  background: var(--primary);
  color: #fff;
  border: none;
  padding: 10px;
  border-radius: 6px;
  font-weight: 500;
  font-size: 14px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: background 0.14s;
  letter-spacing: -0.1px;
}

.btn-full { width: 100%; margin-top: 8px; }
.btn-primary:hover { background: var(--primary-hover); }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

.forgot-link { color: var(--primary); text-decoration: none; font-size: 12px; font-weight: 600; }

.auth-footer {
  text-align: center;
  margin-top: 24px;
  font-size: 13px;
  color: var(--text-muted);
}

.toggle-btn {
  background: none;
  border: none;
  color: var(--primary);
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: color 0.14s;
}
.toggle-btn:hover { color: var(--primary-hover); }

.form-mini-footer {
  margin-top: auto;
  padding-top: 32px;
  display: flex;
  gap: 10px;
  font-size: 11px;
  color: var(--text-muted);
}

.form-mini-footer a {
  color: var(--text-muted);
  text-decoration: none;
  transition: color 0.14s;
}
.form-mini-footer a:hover { color: var(--text-primary); }
</style>