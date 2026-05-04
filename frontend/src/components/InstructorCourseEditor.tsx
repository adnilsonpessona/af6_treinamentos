'use client'

import { useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import FeedbackAlert from '@/components/FeedbackAlert'
import { api } from '@/lib/api'

type LessonType = 'Video' | 'Texto' | 'VideoETexto'

type Lesson = {
  id: string
  title: string
  order: number
  type: LessonType
  hasVideo: boolean
  hasText: boolean
}

type Course = {
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
  status: string
  thumbnailPath: string | null
  lessons: Lesson[]
}

type Category = { id: string; name: string; department: string; parentCategoryId?: string | null }
type Company = { id: string; nomeFantasia: string }

interface Props {
  token: string
  course: Course
  categories: Category[]
  companies: Company[]
}

const STATUS_LABEL: Record<string, string> = {
  Rascunho: 'Rascunho',
  AguardandoAprovacao: 'Aguardando aprovação',
  Publicado: 'Publicado',
  Reprovado: 'Reprovado',
}

const STATUS_CLASSES: Record<string, string> = {
  Rascunho: 'ui-badge-neutral',
  AguardandoAprovacao: 'ui-badge-warning',
  Publicado: 'ui-badge-success',
  Reprovado: 'ui-badge-danger',
}

function typeLabel(t: LessonType) {
  if (t === 'Video') return '🎬 Vídeo'
  if (t === 'Texto') return '📄 Texto'
  return '🎬📄 Vídeo+Texto'
}

export default function InstructorCourseEditor({ token, course: initial, categories, companies }: Props) {
  const router = useRouter()
  const thumbInput = useRef<HTMLInputElement>(null)

  const [course, setCourse] = useState(initial)
  const [editingMeta, setEditingMeta] = useState(false)
  const [title, setTitle] = useState(initial.title)
  const [description, setDescription] = useState(initial.description)
  const [companyId, setCompanyId] = useState(initial.companyId)
  const [department, setDepartment] = useState(initial.department)
  const [categoryId, setCategoryId] = useState(initial.categoryId)
  const [subCategoryId, setSubCategoryId] = useState(initial.subCategoryId)
  const [availableForAllCompanies, setAvailableForAllCompanies] = useState(initial.availableForAllCompanies)
  const [availableForAllDepartments, setAvailableForAllDepartments] = useState(initial.availableForAllDepartments)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [uploadingThumb, setUploadingThumb] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  function clearMessages() {
    setError(null)
    setSuccess(null)
  }

  const rootCategories = useMemo(
    () => categories.filter((c) => !c.parentCategoryId && (!department || c.department === department)),
    [categories, department]
  )

  const subCategories = useMemo(
    () => categories.filter((c) => c.parentCategoryId === categoryId),
    [categories, categoryId]
  )

  async function refresh() {
    const updated = await api.courses.get(token, course.id) as Course
    setCourse(updated)
    router.refresh()
  }

  async function saveMeta(e: React.FormEvent) {
    e.preventDefault()
    clearMessages()
    setSaving(true)
    try {
      await api.courses.update(token, course.id, {
        title,
        description,
        companyId,
        department,
        categoryId,
        subCategoryId,
        availableForAllCompanies,
        availableForAllDepartments,
      })
      await refresh()
      setEditingMeta(false)
      setSuccess('Informações do curso atualizadas.')
    } catch (err: any) {
      setError(err?.message ?? 'Falha ao salvar.')
    } finally {
      setSaving(false)
    }
  }

  async function handleThumbChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    clearMessages()
    setUploadingThumb(true)
    try {
      await api.courses.uploadThumbnail(token, course.id, file)
      await refresh()
      setSuccess('Thumbnail atualizada.')
    } catch (err: any) {
      setError(err?.message ?? 'Falha ao enviar thumbnail.')
    } finally {
      setUploadingThumb(false)
    }
  }

  async function deleteLesson(lessonId: string) {
    if (!confirm('Excluir esta aula permanentemente?')) return
    clearMessages()
    setDeletingId(lessonId)
    try {
      await api.courses.deleteLesson(token, course.id, lessonId)
      await refresh()
      setSuccess('Aula excluída.')
    } catch (err: any) {
      setError(err?.message ?? 'Falha ao excluir aula.')
    } finally {
      setDeletingId(null)
    }
  }

  async function submitForApproval() {
    if (missingVideoLessons.length > 0) {
      setError('Aula de vídeo sem arquivo enviado. Corrija as aulas sinalizadas antes de enviar para aprovação.')
      return
    }

    if (!confirm('Enviar curso para aprovação pelo administrador?')) return
    clearMessages()
    setSubmitting(true)
    try {
      await api.courses.submit(token, course.id)
      await refresh()
      setSuccess('Curso enviado para aprovação.')
    } catch (err: any) {
      setError(err?.message ?? 'Falha ao enviar para aprovação.')
    } finally {
      setSubmitting(false)
    }
  }

  const missingVideoLessons = useMemo(
    () => course.lessons.filter((lesson) => (lesson.type === 'Video' || lesson.type === 'VideoETexto') && !lesson.hasVideo),
    [course.lessons]
  )

  const canSubmit =
    (course.status === 'Rascunho' || course.status === 'Reprovado') &&
    course.lessons.length > 0 &&
    missingVideoLessons.length === 0
  const canEdit = course.status !== 'AguardandoAprovacao'
  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000'

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="ui-card p-6 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
          <Link
            href="/instructor/courses"
            className="text-sm font-semibold text-brand-primary hover:underline"
          >
            ← Meus cursos
          </Link>
          <span
            className={`ui-badge ${STATUS_CLASSES[course.status] ?? 'ui-badge-neutral'}`}
          >
            {STATUS_LABEL[course.status] ?? course.status}
          </span>
          </div>

          {canSubmit && (
            <button
              type="button"
              onClick={submitForApproval}
              disabled={submitting}
              className="ui-button-primary disabled:opacity-60"
            >
              {submitting ? 'Enviando...' : '✓ Enviar para aprovação'}
            </button>
          )}
        </div>
      </div>

      {error && <FeedbackAlert tone="error">{error}</FeedbackAlert>}
      {success && <FeedbackAlert tone="success">{success}</FeedbackAlert>}

      {course.status === 'Reprovado' && (
        <FeedbackAlert tone="error">
          <strong>Curso reprovado.</strong> Corrija o conteúdo conforme o feedback do administrador e envie novamente para aprovação.
        </FeedbackAlert>
      )}

      {course.status === 'AguardandoAprovacao' && (
        <div className="ui-card-muted px-4 py-3 text-sm text-brand-warning">
          Curso aguardando aprovação do administrador. Edições estão bloqueadas neste momento.
        </div>
      )}

      {missingVideoLessons.length > 0 && (
        <FeedbackAlert tone="error">
          <p className="font-semibold">Aula de vídeo sem arquivo enviado</p>
          <p className="mt-1">Envie o arquivo de vídeo nas aulas abaixo antes de enviar este curso para aprovação:</p>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            {missingVideoLessons
              .sort((a, b) => a.order - b.order)
              .map((lesson) => (
                <li key={lesson.id}>
                  Aula {lesson.order}: {lesson.title}
                </li>
              ))}
          </ul>
        </FeedbackAlert>
      )}

      {/* Meta card */}
      <div className="ui-card p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2>Informações do curso</h2>
          {canEdit && !editingMeta && (
            <button
              type="button"
              onClick={() => { clearMessages(); setEditingMeta(true) }}
              className="text-sm font-semibold text-brand-primary hover:underline"
            >
              Editar
            </button>
          )}
        </div>

        {editingMeta ? (
          <form onSubmit={saveMeta} className="space-y-4">
            <div>
              <label htmlFor="edit-title" className="ui-label">Título</label>
              <input
                id="edit-title"
                name="edit-title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="ui-input"
              />
            </div>
            <div>
              <label htmlFor="edit-description" className="ui-label">Descrição</label>
              <textarea
                id="edit-description"
                name="edit-description"
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="ui-textarea min-h-[7rem]"
              />
            </div>
            <div>
              <label htmlFor="edit-company" className="ui-label">Empresa</label>
              <select
                id="edit-company"
                name="edit-company"
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                className="ui-input"
              >
                <option value="">Selecione</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>{c.nomeFantasia}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="edit-department" className="ui-label">Departamento</label>
              <input
                id="edit-department"
                name="edit-department"
                value={department}
                onChange={(e) => {
                  setDepartment(e.target.value)
                  setCategoryId('')
                  setSubCategoryId('')
                }}
                className="ui-input"
              />
            </div>
            <div>
              <label htmlFor="edit-category" className="ui-label">Categoria</label>
              <select
                id="edit-category"
                name="edit-category"
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value)
                  setSubCategoryId('')
                }}
                className="ui-input"
              >
                <option value="">Selecione</option>
                {rootCategories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="edit-subcategory" className="ui-label">Subcategoria</label>
              <select
                id="edit-subcategory"
                name="edit-subcategory"
                value={subCategoryId}
                onChange={(e) => setSubCategoryId(e.target.value)}
                className="ui-input"
              >
                <option value="">Selecione</option>
                {subCategories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="ui-card-muted space-y-2 p-4">
              <label className="flex items-center gap-2 text-sm text-brand-text">
                <input id="edit-course-all-companies" name="edit-course-all-companies" type="checkbox" checked={availableForAllCompanies} onChange={(e) => setAvailableForAllCompanies(e.target.checked)} />
                Disponível para todas as empresas
              </label>
              <label className="flex items-center gap-2 text-sm text-brand-text">
                <input id="edit-course-all-departments" name="edit-course-all-departments" type="checkbox" checked={availableForAllDepartments} onChange={(e) => setAvailableForAllDepartments(e.target.checked)} />
                Disponível para todos os departamentos
              </label>
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={saving} className="ui-button-primary disabled:opacity-60">
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
              <button type="button" onClick={() => { setTitle(course.title); setDescription(course.description); setCompanyId(course.companyId); setDepartment(course.department); setCategoryId(course.categoryId); setSubCategoryId(course.subCategoryId); setAvailableForAllCompanies(course.availableForAllCompanies); setAvailableForAllDepartments(course.availableForAllDepartments); setEditingMeta(false) }} className="ui-button-secondary">
                Cancelar
              </button>
            </div>
          </form>
        ) : (
          <div className="grid gap-3 text-sm text-brand-text-muted sm:grid-cols-2">
            <div><span className="font-semibold text-brand-text">Título:</span> {course.title}</div>
            <div><span className="font-semibold text-brand-text">Empresa:</span> {course.companyName}</div>
            <div><span className="font-semibold text-brand-text">Departamento:</span> {course.department}</div>
            <div><span className="font-semibold text-brand-text">Categoria:</span> {course.categoryName}</div>
            <div><span className="font-semibold text-brand-text">Subcategoria:</span> {course.subCategoryName}</div>
            <div className="sm:col-span-2"><span className="font-semibold text-brand-text">Descrição:</span> {course.description}</div>
          </div>
        )}
      </div>

      {/* Thumbnail card */}
      <div className="ui-card p-5 sm:p-6">
        <h2 className="mb-3">Thumbnail</h2>
        <div className="flex items-start gap-4">
          {course.thumbnailPath ? (
            <img
              src={`${API_URL}/${course.thumbnailPath}`}
              alt="Thumbnail"
              className="h-20 w-32 rounded-xl border border-brand-border/60 object-cover"
            />
          ) : (
            <div className="flex h-20 w-32 items-center justify-center rounded-xl border border-dashed border-brand-border-strong bg-brand-light text-xs text-brand-text-muted">
              Sem imagem
            </div>
          )}
          {canEdit && (
            <div>
              <button
                type="button"
                onClick={() => thumbInput.current?.click()}
                disabled={uploadingThumb}
                className="ui-button-secondary disabled:opacity-60"
              >
                {uploadingThumb ? 'Enviando...' : course.thumbnailPath ? 'Alterar' : 'Enviar thumbnail'}
              </button>
              <p className="mt-1 text-xs text-brand-text-muted">JPEG, PNG ou WebP. Recomendado: 16:9.</p>
              <input
                id="course-thumbnail-upload"
                name="course-thumbnail-upload"
                ref={thumbInput}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleThumbChange}
                className="hidden"
              />
            </div>
          )}
        </div>
      </div>

      {/* Lessons card */}
      <div className="ui-card p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2>
            Aulas <span className="text-sm font-normal text-brand-text-muted">({course.lessons.length})</span>
          </h2>
          {canEdit && (
            <Link
              href={`/instructor/courses/${course.id}/lessons/new`}
              className="ui-button-primary min-h-0 px-4 py-2 text-sm"
            >
              + Nova aula
            </Link>
          )}
        </div>

        {course.lessons.length === 0 ? (
          <p className="text-sm text-brand-text-muted">
            Nenhuma aula cadastrada.{' '}
            {canEdit && (
              <Link href={`/instructor/courses/${course.id}/lessons/new`} className="font-semibold text-brand-primary hover:underline">
                Adicionar primeira aula →
              </Link>
            )}
          </p>
        ) : (
          <div className="divide-y divide-brand-border/35">
            {[...course.lessons]
              .sort((a, b) => a.order - b.order)
              .map((lesson) => (
                <div key={lesson.id} className="flex items-center justify-between py-3 gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 shrink-0 text-right text-xs text-brand-text-muted">{lesson.order}.</span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-brand-text">{lesson.title}</p>
                      <p className="text-xs text-brand-text-muted">{typeLabel(lesson.type)}</p>
                      {(lesson.type === 'Video' || lesson.type === 'VideoETexto') && !lesson.hasVideo && (
                        <p className="mt-0.5 text-xs font-medium text-brand-danger">Aula de vídeo sem arquivo enviado</p>
                      )}
                    </div>
                  </div>
                  {canEdit && (
                    <div className="flex gap-2 shrink-0">
                      <Link
                        href={`/instructor/courses/${course.id}/lessons/${lesson.id}/edit`}
                        className="ui-button-secondary min-h-0 px-3 py-2 text-xs"
                      >
                        Editar
                      </Link>
                      <button
                        type="button"
                        onClick={() => deleteLesson(lesson.id)}
                        disabled={deletingId === lesson.id}
                        className="ui-button-ghost min-h-0 border border-brand-danger/20 px-3 py-2 text-xs text-brand-danger disabled:opacity-60"
                      >
                        {deletingId === lesson.id ? '...' : 'Excluir'}
                      </button>
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Submit footer */}
      {canSubmit && (
        <div className="ui-card-muted flex items-center justify-between gap-4 p-4">
          <p className="text-sm text-brand-primary">
            O curso está pronto? Envie para o administrador aprovar antes de ficar visível aos alunos.
          </p>
          <button
            type="button"
            onClick={submitForApproval}
            disabled={submitting}
            className="ui-button-primary shrink-0 disabled:opacity-60"
          >
            {submitting ? 'Enviando...' : 'Enviar para aprovação'}
          </button>
        </div>
      )}

      {!canSubmit && (course.status === 'Rascunho' || course.status === 'Reprovado') && course.lessons.length > 0 && missingVideoLessons.length > 0 && (
        <div className="ui-card-muted p-4">
          <p className="text-sm text-brand-warning">
            Envio para aprovação bloqueado: existe aula de vídeo sem arquivo enviado.
          </p>
        </div>
      )}
    </div>
  )
}
