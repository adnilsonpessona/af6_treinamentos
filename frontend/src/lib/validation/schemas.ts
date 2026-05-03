// src/lib/validation/schemas.ts
// Schemas de validação com Zod

import { z } from 'zod'

// ============ Auth ============
export const LoginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
})
export type LoginInput = z.infer<typeof LoginSchema>

export const ActivateSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
  confirmPassword: z.string().min(8),
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: 'Senhas não coincidem',
    path: ['confirmPassword'],
  },
)
export type ActivateInput = z.infer<typeof ActivateSchema>

// ============ Users ============
export const CreateUserSchema = z.object({
  email: z.string().email('Email inválido'),
  fullName: z.string().min(3, 'Mínimo 3 caracteres'),
  role: z.enum(['Admin', 'Instructor', 'Student']),
  department: z.string().min(1, 'Departamento obrigatório'),
  companyId: z.string().optional(),
})
export type CreateUserInput = z.infer<typeof CreateUserSchema>

export const UpdateUserSchema = z.object({
  fullName: z.string().min(3).optional(),
  department: z.string().min(1).optional(),
  role: z.enum(['Admin', 'Instructor', 'Student']).optional(),
})
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>

// ============ Courses ============
export const CreateCourseSchema = z.object({
  title: z.string().min(5, 'Mínimo 5 caracteres'),
  description: z.string().min(20, 'Mínimo 20 caracteres'),
  categoryId: z.string().uuid('ID de categoria inválido'),
  companyId: z.string().uuid(),
  department: z.string().min(1),
  availableForAllCompanies: z.boolean().optional(),
  availableForAllDepartments: z.boolean().optional(),
})
export type CreateCourseInput = z.infer<typeof CreateCourseSchema>

export const UpdateCourseSchema = z.object({
  title: z.string().min(5).optional(),
  description: z.string().min(20).optional(),
  categoryId: z.string().uuid().optional(),
  department: z.string().min(1).optional(),
})
export type UpdateCourseInput = z.infer<typeof UpdateCourseSchema>

// ============ Lessons ============
export const CreateLessonSchema = z.object({
  title: z.string().min(3, 'Mínimo 3 caracteres'),
  order: z.number().int().min(1),
  type: z.enum(['Video', 'Texto', 'VideoETexto']),
  content: z.string().optional(),
  videoUrl: z.string().url().optional(),
})
export type CreateLessonInput = z.infer<typeof CreateLessonSchema>

// ============ Categories ============
export const CreateCategorySchema = z.object({
  name: z.string().min(3),
  department: z.string().min(1),
  parentCategoryId: z.string().uuid().optional(),
})
export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>
