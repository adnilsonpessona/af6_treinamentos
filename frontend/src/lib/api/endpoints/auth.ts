// src/lib/api/endpoints/auth.ts
// Endpoints de autenticação

import { apiClient } from '../client'

export interface AuthResponse {
  token: string
  fullName: string
  email: string
  role: string
  companyId?: string | null
  companyName?: string | null
  department: string
  expiresAt: string
}

export interface ActivateRequest {
  token: string
  password: string
  confirmPassword: string
}

export const authEndpoints = {
  login: (email: string, password: string) =>
    apiClient.post<AuthResponse>('/api/v1/auth/login', { email, password }),

  logout: (token: string) =>
    apiClient.post('/api/v1/auth/logout', {}, { token }),

  activate: (data: ActivateRequest) =>
    apiClient.post<AuthResponse>('/api/v1/auth/activate', data),

  refresh: (token: string) =>
    apiClient.post<AuthResponse>('/api/v1/auth/refresh', {}, { token }),
}
