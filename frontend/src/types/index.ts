export type UserRole = 'Administrador' | 'Gestor' | 'Instrutor' | 'Funcionario'
export type UserStatus = 'PendingActivation' | 'Active' | 'Inactive'
export type CourseStatus = 'Rascunho' | 'AguardandoAprovacao' | 'Publicado' | 'Reprovado' | 'Arquivado'
export type LessonType = 'Video' | 'Texto' | 'VideoETexto'

export interface User {
  id: string
  fullName: string
  email: string
  companyId?: string | null
  companyName?: string | null
  department: string
  jobTitle: string
  role: UserRole
  status: UserStatus
  createdAt: string
}

export interface Category {
  id: string
  department?: string | null
  name: string
  parentCategoryId?: string | null
  parentCategoryName?: string | null
  isActive: boolean
  createdAt: string
}

export interface Department {
  id: string
  name: string
  isActive: boolean
  createdAt: string
}

export interface Company {
  id: string
  empresa: number
  revenda: number
  razaoSocial: string
  nomeFantasia: string
  cnpj: string
  isActive: boolean
  createdAt: string
}

export interface Course {
  id: string
  title: string
  description: string
  companyId: string
  companyName: string
  department: string
  categoryId: string
  categoryName: string
  subCategoryId: string
  subCategoryName: string
  availableForAllCompanies: boolean
  availableForAllDepartments: boolean
  thumbnailPath: string | null
  status: CourseStatus
  instructorId: string
  instructorName: string
  lessonCount: number
  createdAt: string
  updatedAt: string
}

export interface Lesson {
  id: string
  courseId: string
  title: string
  order: number
  type: LessonType
  hasVideo: boolean
  hasText: boolean
  videoDurationSeconds: number | null
  createdAt: string
}

export interface CourseDetail extends Omit<Course, 'lessonCount'> {
  lessons: Lesson[]
}

export interface VideoProgress {
  lessonId: string
  percentageWatched: number
  lastSecond: number
  isCompleted: boolean
  viewSessions: number
  firstAccessAt: string
  completedAt: string | null
}

export interface CourseProgress {
  courseId: string
  courseTitle: string
  totalLessons: number
  completedLessons: number
  progressPercentage: number
  courseCompleted: boolean
  courseCompletedAt: string | null
  lessons: LessonProgress[]
}

export interface LessonProgress {
  lessonId: string
  lessonTitle: string
  videoCompleted: boolean
  textAccessed: boolean
  lessonCompleted: boolean
  videoPercentage: number | null
  lastSecond: number | null
}

export interface AuthSession {
  token: string
  fullName: string
  email: string
  role: UserRole
  expiresAt: string
}
