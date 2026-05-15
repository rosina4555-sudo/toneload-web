import api from './axios'
import { z } from 'zod'


// ─── VALIDATION SCHEMAS ───

export const registerSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(60, 'Name is too long')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name contains invalid characters'),
  email: z
    .string()
    .email('Please enter a valid email address')
    .toLowerCase(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address').toLowerCase(),
})

export const updateProfileSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(60, 'Name is too long'),
  email: z
    .string()
    .email('Please enter a valid email address')
    .toLowerCase(),
})

// ─── API ACTIONS ───

export const authApi = {
  /**
   * Sign In
   * Endpoint: /auth/signin
   */
  async login(credentials) {
    const validated = loginSchema.parse(credentials)
    const { data } = await api.post('/auth/signin', {
      email: validated.email,
      password: validated.password,
    })
    return data
  },

  /**
   * Sign Up
   * Endpoint: /auth/signup
   */
  async register(payload) {
    const validated = registerSchema.parse(payload)
    const { data } = await api.post('/auth/signup', {
      name: validated.fullName, // mapping fullName to 'name' for backend
      email: validated.email,
      password: validated.password,
    })
    return data
  },

  /**
   * Social Authentication (Google)
   */
  async googleAuth(token) {
    const { data } = await api.post('/auth/google', { token })
    return data
  },

  async logout() {
    await api.post('/auth/logout')
  },

  async refresh() {
    const { data } = await api.post('/auth/refresh')
    return data
  },

  async getMe() {
    const { data } = await api.get('/auth/me')
    return data
  },

  async requestPasswordReset(payload) {
    const validated = forgotPasswordSchema.parse(payload)
    const { data } = await api.post('/auth/forgot-password', validated)
    return data
  },

  async updateProfile(payload) {
    const validated = updateProfileSchema.parse(payload)
    const { data } = await api.patch('/auth/me', {
        name: validated.fullName,
        email: validated.email
    })
    return data
  },

  async uploadAvatar(file) {
    const form = new FormData()
    form.append('avatar', file)
    const { data } = await api.post('/auth/me/avatar', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },

  async deleteAccount() {
    await api.delete('/auth/me')
  },
}