// src/lib/api/index.ts
// Exportações centralizadas da API

export { apiClient, ApiError } from './client'
export { authEndpoints, type AuthResponse } from './endpoints/auth'
export { usersEndpoints, type User, type CreateUserRequest } from './endpoints/users'
export { coursesEndpoints, type Course, type CreateCourseRequest } from './endpoints/courses'

// Agregar todos os endpoints
export const api = {
  auth: authEndpoints,
  users: usersEndpoints,
  courses: coursesEndpoints,
}
