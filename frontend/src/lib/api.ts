const PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000'
const INTERNAL_API_URL = process.env.INTERNAL_API_URL ?? 'http://api:5000'
const API_URL = typeof window === 'undefined' ? INTERNAL_API_URL : PUBLIC_API_URL

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> ?? {}),
  }

  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${API_URL}${path}`, { ...options, headers })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(error.message ?? 'Erro na requisição')
  }

  if (res.status === 204) return undefined as T
  return res.json()
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      request<{ token: string; fullName: string; email: string; role: string; companyId?: string | null; companyName?: string | null; department: string; expiresAt: string }>(
        '/api/v1/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
    logout: (token: string) =>
      request('/api/v1/auth/logout', { method: 'POST' }, token),
    activate: (data: { token: string; password: string; confirmPassword: string }) =>
      request('/api/v1/auth/activate', { method: 'POST', body: JSON.stringify(data) }),
  },
  users: {
    list: (token: string, params?: { department?: string; role?: string }) => {
      const qs = new URLSearchParams(params as Record<string, string>).toString()
      return request<any[]>(`/api/v1/users${qs ? '?' + qs : ''}`, {}, token)
    },
    create: (token: string, data: any) =>
      request('/api/v1/users', { method: 'POST', body: JSON.stringify(data) }, token),
    update: (token: string, id: string, data: any) =>
      request(`/api/v1/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }, token),
    activate: (token: string, id: string) =>
      request(`/api/v1/users/${id}/activate`, { method: 'PATCH' }, token),
    deactivate: (token: string, id: string) =>
      request(`/api/v1/users/${id}/deactivate`, { method: 'PATCH' }, token),
    resendActivation: (token: string, id: string) =>
      request(`/api/v1/users/${id}/resend-activation`, { method: 'POST' }, token),
    delete: (token: string, id: string) =>
      request(`/api/v1/users/${id}`, { method: 'DELETE' }, token),
  },
  companies: {
    list: (token: string, activeOnly?: boolean) =>
      request<any[]>(`/api/v1/companies${activeOnly ? '?activeOnly=true' : ''}`, {}, token),
    create: (token: string, data: { empresa: number; revenda: number; razaoSocial: string; nomeFantasia: string; cnpj: string }) =>
      request('/api/v1/companies', { method: 'POST', body: JSON.stringify(data) }, token),
    update: (token: string, id: string, data: { empresa: number; revenda: number; razaoSocial: string; nomeFantasia: string; cnpj: string }) =>
      request(`/api/v1/companies/${id}`, { method: 'PUT', body: JSON.stringify(data) }, token),
    activate: (token: string, id: string) =>
      request(`/api/v1/companies/${id}/activate`, { method: 'PATCH' }, token),
    deactivate: (token: string, id: string) =>
      request(`/api/v1/companies/${id}/deactivate`, { method: 'PATCH' }, token),
  },
  categories: {
    list: (token: string, activeOnly?: boolean) =>
      request<any[]>(`/api/v1/categories${activeOnly ? '?activeOnly=true' : ''}`, {}, token),
    create: (token: string, data: { name: string; parentCategoryId?: string | null }) =>
      request('/api/v1/categories', { method: 'POST', body: JSON.stringify(data) }, token),
    update: (token: string, id: string, data: { name: string; parentCategoryId?: string | null }) =>
      request(`/api/v1/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }, token),
    activate: (token: string, id: string) =>
      request(`/api/v1/categories/${id}/activate`, { method: 'PATCH' }, token),
    deactivate: (token: string, id: string) =>
      request(`/api/v1/categories/${id}/deactivate`, { method: 'PATCH' }, token),
    delete: (token: string, id: string) =>
      request(`/api/v1/categories/${id}`, { method: 'DELETE' }, token),
  },
  courses: {
    list: (token: string) => request<any[]>('/api/v1/courses', {}, token),
    get: (token: string, id: string) => request<any>(`/api/v1/courses/${id}`, {}, token),
    create: (token: string, data: any) =>
      request('/api/v1/courses', { method: 'POST', body: JSON.stringify(data) }, token),
    update: (token: string, id: string, data: any) =>
      request(`/api/v1/courses/${id}`, { method: 'PUT', body: JSON.stringify(data) }, token),
    submit: (token: string, id: string) =>
      request(`/api/v1/courses/${id}/submit`, { method: 'POST' }, token),
    approve: (token: string, id: string) =>
      request(`/api/v1/courses/${id}/approve`, { method: 'POST' }, token),
    reject: (token: string, id: string, comment: string) =>
      request(`/api/v1/courses/${id}/reject`, { method: 'POST', body: JSON.stringify({ comment }) }, token),
    setPermissions: (token: string, id: string, data: any) =>
      request(`/api/v1/courses/${id}/permissions`, { method: 'PUT', body: JSON.stringify(data) }, token),
    createLesson: (token: string, courseId: string, data: any) =>
      request(`/api/v1/courses/${courseId}/lessons`, { method: 'POST', body: JSON.stringify(data) }, token),
    updateLesson: (token: string, courseId: string, lessonId: string, data: any) =>
      request(`/api/v1/courses/${courseId}/lessons/${lessonId}`, { method: 'PUT', body: JSON.stringify(data) }, token),
    deleteLesson: (token: string, courseId: string, lessonId: string) =>
      request(`/api/v1/courses/${courseId}/lessons/${lessonId}`, { method: 'DELETE' }, token),
    streamVideoUrl: (courseId: string, lessonId: string, vt: string) =>
      `${PUBLIC_API_URL}/api/v1/courses/${courseId}/lessons/${lessonId}/video?vt=${encodeURIComponent(vt)}`,
    downloadPdfUrl: (courseId: string, lessonId: string) =>
      `${PUBLIC_API_URL}/api/v1/courses/${courseId}/lessons/${lessonId}/pdf`,
    getVideoToken: (token: string, courseId: string, lessonId: string) =>
      request<{ token: string }>(`/api/v1/courses/${courseId}/lessons/${lessonId}/video-token`, {}, token),
    uploadThumbnail: async (token: string, courseId: string, file: File) => {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch(`${API_URL}/api/v1/courses/${courseId}/thumbnail`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      })
      if (!res.ok) {
        const e = await res.json().catch(() => ({ message: res.statusText }))
        throw new Error(e.message)
      }
      return res.json() as Promise<{ thumbnailPath: string }>
    },
    uploadVideo: async (token: string, courseId: string, lessonId: string, file: File) => {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch(`${API_URL}/api/v1/courses/${courseId}/lessons/${lessonId}/video`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      })
      if (!res.ok) {
        const e = await res.json().catch(() => ({ message: res.statusText }))
        throw new Error(e.message)
      }
      return res.json() as Promise<{ videoPath: string }>
    },
    delete: (token: string, id: string) =>
      request(`/api/v1/courses/${id}`, { method: 'DELETE' }, token),
    archive: (token: string, id: string) =>
      request(`/api/v1/courses/${id}/archive`, { method: 'POST' }, token),
  },
  departments: {
    list: (token: string, activeOnly?: boolean) =>
      request<any[]>(`/api/v1/departments${activeOnly ? '?activeOnly=true' : ''}`, {}, token),
    create: (token: string, data: { name: string }) =>
      request('/api/v1/departments', { method: 'POST', body: JSON.stringify(data) }, token),
    update: (token: string, id: string, data: { name: string }) =>
      request(`/api/v1/departments/${id}`, { method: 'PUT', body: JSON.stringify(data) }, token),
    activate: (token: string, id: string) =>
      request(`/api/v1/departments/${id}/activate`, { method: 'PATCH' }, token),
    deactivate: (token: string, id: string) =>
      request(`/api/v1/departments/${id}/deactivate`, { method: 'PATCH' }, token),
    delete: (token: string, id: string) =>
      request(`/api/v1/departments/${id}`, { method: 'DELETE' }, token),
  },
  progress: {
    updateVideo: (token: string, data: { lessonId: string; percentageWatched: number; lastSecond: number }) =>
      request('/api/v1/progress/video', { method: 'POST', body: JSON.stringify(data) }, token),
    recordAccess: (token: string, lessonId: string) =>
      request('/api/v1/progress/lesson-access', { method: 'POST', body: JSON.stringify(lessonId) }, token),
    getCourseProgress: (token: string, courseId: string) =>
      request<any>(`/api/v1/progress/course/${courseId}`, {}, token),
  },
  reports: {
    admin: (token: string, params?: any) => {
      const qs = new URLSearchParams(params).toString()
      return request<any>(`/api/v1/reports/admin${qs ? '?' + qs : ''}`, {}, token)
    },
    manager: (token: string) => request<any>('/api/v1/reports/manager', {}, token),
    instructor: (token: string) => request<any[]>('/api/v1/reports/instructor', {}, token),
    myProgress: (token: string) => request<any>('/api/v1/reports/my-progress', {}, token),
  },
}
