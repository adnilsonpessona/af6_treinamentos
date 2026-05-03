// src/lib/api/endpoints/users.ts
// Endpoints de usuários

import { apiClient } from '../client'

export interface User {
  id: string
  email: string
  fullName: string
  role: string
  department: string
  companyId?: string
  status: 'Active' | 'Inactive' | 'PendingActivation'
}

export interface CreateUserRequest {
  email: string
  fullName: string
  role: 'Admin' | 'Instructor' | 'Student'
  department: string
  companyId?: string
}

export interface UpdateUserRequest {
  fullName?: string
  department?: string
  role?: string
}

export const usersEndpoints = {
  list: (token: string, params?: { department?: string; role?: string; status?: string }) => {
    const qs = new URLSearchParams(params as Record<string, string>).toString()
    return apiClient.get<User[]>(
      `/api/v1/users${qs ? '?' + qs : ''}`,
      { token },
    )
  },

  get: (token: string, id: string) =>
    apiClient.get<User>(`/api/v1/users/${id}`, { token }),

  create: (token: string, data: CreateUserRequest) =>
    apiClient.post<User>('/api/v1/users', data, { token }),

  update: (token: string, id: string, data: UpdateUserRequest) =>
    apiClient.put<User>(`/api/v1/users/${id}`, data, { token }),

  activate: (token: string, id: string) =>
    apiClient.patch<User>(`/api/v1/users/${id}/activate`, {}, { token }),

  deactivate: (token: string, id: string) =>
    apiClient.patch<User>(`/api/v1/users/${id}/deactivate`, {}, { token }),

  resendActivation: (token: string, id: string) =>
    apiClient.post(`/api/v1/users/${id}/resend-activation`, {}, { token }),

  delete: (token: string, id: string) =>
    apiClient.delete(`/api/v1/users/${id}`, { token }),
}
