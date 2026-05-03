// src/lib/api/endpoints/courses.ts
// Endpoints de cursos

import { apiClient } from '../client'

export interface Course {
  id: string
  title: string
  description: string
  categoryId: string
  categoryName: string
  companyId: string
  companyName: string
  department: string
  status: 'Rascunho' | 'AguardandoAprovacao' | 'Publicado' | 'Reprovado'
  thumbnailPath?: string
  lessonsCount: number
  createdAt: string
  updatedAt: string
}

export interface CreateCourseRequest {
  title: string
  description: string
  categoryId: string
  companyId: string
  department: string
  availableForAllCompanies?: boolean
  availableForAllDepartments?: boolean
}

export interface UpdateCourseRequest {
  title?: string
  description?: string
  categoryId?: string
  department?: string
}

export const coursesEndpoints = {
  list: (token: string, params?: { status?: string; categoryId?: string; companyId?: string }) => {
    const qs = new URLSearchParams(params as Record<string, string>).toString()
    return apiClient.get<Course[]>(
      `/api/v1/courses${qs ? '?' + qs : ''}`,
      { token },
    )
  },

  get: (token: string, id: string) =>
    apiClient.get<Course>(`/api/v1/courses/${id}`, { token }),

  create: (token: string, data: CreateCourseRequest) =>
    apiClient.post<Course>('/api/v1/courses', data, { token }),

  update: (token: string, id: string, data: UpdateCourseRequest) =>
    apiClient.put<Course>(`/api/v1/courses/${id}`, data, { token }),

  submit: (token: string, id: string) =>
    apiClient.post(`/api/v1/courses/${id}/submit`, {}, { token }),

  approve: (token: string, id: string) =>
    apiClient.post(`/api/v1/courses/${id}/approve`, {}, { token }),

  reject: (token: string, id: string, reason: string) =>
    apiClient.post(
      `/api/v1/courses/${id}/reject`,
      { reason },
      { token },
    ),

  delete: (token: string, id: string) =>
    apiClient.delete(`/api/v1/courses/${id}`, { token }),
}
