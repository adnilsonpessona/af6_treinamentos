'use client'

import { useMemo, useState } from 'react'
import { api } from '@/lib/api'
import AdminOverview from '@/components/AdminOverview'
import FeedbackAlert from '@/components/FeedbackAlert'
import SearchField from '@/components/SearchField'
import { useRouter } from 'next/navigation'
import { CheckCircle2, XCircle } from 'lucide-react'

export default function CourseApprovalList({ courses, token }: { courses: any[]; token: string }) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [rejectComment, setRejectComment] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const filteredCourses = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return courses
    return courses.filter((course: any) => {
      return (
        String(course.title ?? '').toLowerCase().includes(q) ||
        String(course.instructorName ?? '').toLowerCase().includes(q) ||
        String(course.categoryName ?? '').toLowerCase().includes(q)
      )
    })
  }, [courses, query])

  const categoryCount = useMemo(() => new Set(courses.map((course: any) => course.categoryName).filter(Boolean)).size, [courses])
  const instructorCount = useMemo(() => new Set(courses.map((course: any) => course.instructorName).filter(Boolean)).size, [courses])

  function clearMessages() {
    setError(null)
    setSuccess(null)
  }

  async function approve(id: string) {
    clearMessages()
    setLoading(id)
    try {
      await api.courses.approve(token, id)
      setSuccess('Curso aprovado com sucesso.')
      router.refresh()
    } catch (err: any) {
      setError(err?.message ?? 'Falha ao aprovar curso.')
    } finally {
      setLoading(null)
    }
  }

  async function reject(id: string) {
    const comment = (rejectComment[id] ?? '').trim()
    if (!comment) return

    clearMessages()
    setLoading(id)
    try {
      await api.courses.reject(token, id, comment)
      setSuccess('Curso reprovado com sucesso.')
      router.refresh()
    } catch (err: any) {
      setError(err?.message ?? 'Falha ao reprovar curso.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-5">
      <AdminOverview
        badge="Fluxo editorial"
        title="Fila de aprovação"
        description="Revise os cursos pendentes, distribua feedback com contexto e mantenha o catálogo publicado com critérios consistentes."
        stats={[
          { label: 'Pendentes', value: courses.length, toneClassName: 'text-brand-warning' },
          { label: 'Categorias', value: categoryCount },
          { label: 'Instrutores', value: instructorCount },
        ]}
      />

      <section className="ui-card p-5 sm:p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-xl">
            <p className="ui-section-title">Fila de revisão</p>
            <h2 className="mt-2">Cursos aguardando decisão</h2>
            <p className="mt-2 text-sm leading-6 text-brand-text-muted">Analise conteúdo, instrutor e enquadramento antes de publicar na plataforma.</p>
          </div>
          <div className="flex w-full flex-col gap-3 xl:w-auto xl:min-w-108">
            <SearchField
              id="search-approvals"
              name="search-approvals"
              label="Buscar curso"
              value={query}
              onChange={setQuery}
              placeholder="Buscar por curso, instrutor ou categoria"
              className="w-full"
            />
            <div className="inline-flex w-fit rounded-full border border-brand-border/70 bg-brand-light px-3 py-2 text-xs font-semibold text-brand-text-muted">
              {filteredCourses.length} curso{filteredCourses.length !== 1 ? 's' : ''} na visualização atual
            </div>
          </div>
        </div>
      </section>

      {error && <FeedbackAlert tone="error">{error}</FeedbackAlert>}
      {success && <FeedbackAlert tone="success">{success}</FeedbackAlert>}

      <div className="space-y-4">
        {filteredCourses.map((course: any) => (
          <div key={course.id} className="ui-card p-5 sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="ui-badge ui-badge-warning">Aguardando aprovação</span>
                  <span className="ui-badge ui-badge-info">{course.categoryName}</span>
                </div>
                <h3 className="mt-4">{course.title}</h3>
                <p className="mt-2 text-sm leading-6 text-brand-text-muted">{course.description}</p>
                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.12em] text-brand-text-muted">Instrutor: {course.instructorName}</p>
              </div>
              <div className="min-w-[16rem] rounded-[20px] border border-brand-border/60 bg-[linear-gradient(180deg,rgba(244,248,253,0.98)_0%,rgba(233,240,248,0.92)_100%)] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.82)]">
                <p className="text-[0.72rem] font-bold uppercase tracking-[0.14em] text-brand-text-muted">Ação necessária</p>
                <p className="mt-2 text-sm leading-6 text-brand-text">Publique o curso ou registre um motivo objetivo para reprovação.</p>
              </div>
            </div>
            <div className="mt-5 flex flex-col gap-3 xl:flex-row xl:items-start">
              <button
                onClick={() => approve(course.id)}
                disabled={loading === course.id}
                className="ui-button-primary min-w-44 justify-center disabled:opacity-60"
              >
                <CheckCircle2 size={16} />
                {loading === course.id ? 'Processando...' : 'Aprovar'}
              </button>
              <div className="flex flex-1 flex-col gap-2 sm:flex-row">
                <input
                  id={`reject-comment-${course.id}`}
                  name={`reject-comment-${course.id}`}
                  type="text"
                  placeholder="Comentário para reprovação..."
                  value={rejectComment[course.id] ?? ''}
                  onChange={(e) =>
                    setRejectComment((prev) => ({
                      ...prev,
                      [course.id]: e.target.value,
                    }))
                  }
                  className="ui-input flex-1"
                />
                <button
                  onClick={() => reject(course.id)}
                  disabled={loading === course.id || !(rejectComment[course.id] ?? '').trim()}
                  className="ui-button-danger min-w-40 justify-center disabled:opacity-60"
                >
                  <XCircle size={16} />
                  Reprovar
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredCourses.length === 0 && (
          <div className="ui-card-muted p-8 text-center text-brand-text-muted">Nenhum curso encontrado para o filtro informado.</div>
        )}
      </div>
    </div>
  )
}
