import { cookies } from 'next/headers'
import Link from 'next/link'
import { api } from '@/lib/api'
import EmptyState from '@/components/EmptyState'
import PageHeader from '@/components/PageHeader'

function statusClasses(status: string) {
  if (status === 'Publicado') return 'ui-badge-success'
  if (status === 'AguardandoAprovacao') return 'ui-badge-warning'
  if (status === 'Reprovado') return 'ui-badge-danger'
  return 'ui-badge-neutral'
}

function statusLabel(status: string) {
  if (status === 'AguardandoAprovacao') return 'Aguardando'
  return status
}

export default async function TrainingsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; status?: string }>
}) {
  const params = await searchParams
  const query = (params.q ?? '').trim().toLowerCase()
  const categoryFilter = (params.category ?? '').trim().toLowerCase()
  const statusFilter = (params.status ?? '').trim()

  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value ?? ''
  const role = cookieStore.get('auth_role')?.value ?? ''

  let courses: any[] = []
  let progressMap = new Map<string, number>()

  try {
    courses = await api.courses.list(token)

    if (role === 'Funcionario' || role === 'Gestor') {
      const progress = await api.reports.myProgress(token)
      for (const item of progress?.courses ?? []) {
        progressMap.set(item.courseId, Number(item.progressPercentage ?? 0))
      }
    }
  } catch {
    courses = []
  }

  const categories = [...new Set(courses.map((c) => String(c.categoryName ?? '')))]
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b))

  const statuses = [...new Set(courses.map((c) => String(c.status ?? '')))]
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b))

  const filtered = courses.filter((course) => {
    const byQuery =
      !query ||
      String(course.title ?? '').toLowerCase().includes(query) ||
      String(course.description ?? '').toLowerCase().includes(query) ||
      String(course.instructorName ?? '').toLowerCase().includes(query)

    const byCategory = !categoryFilter || String(course.categoryName ?? '').toLowerCase() === categoryFilter
    const byStatus = !statusFilter || String(course.status ?? '') === statusFilter

    return byQuery && byCategory && byStatus
  })

  return (
    <div>
      <PageHeader eyebrow="Catálogo" title="Treinamentos" description="Encontre cursos por tema, status e instrutor com uma navegação mais limpa do catálogo." />

      <form className="ui-card mb-6 p-5 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            id="q"
            name="q"
            defaultValue={params.q ?? ''}
            placeholder="Buscar por título, descrição ou instrutor"
            className="ui-input md:col-span-2"
          />
          <select
            id="category"
            name="category"
            defaultValue={params.category ?? ''}
            className="ui-input"
          >
            <option value="">Todas categorias</option>
            {categories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <select
            id="status"
            name="status"
            defaultValue={params.status ?? ''}
            className="ui-input"
          >
            <option value="">Todos status</option>
            {statuses.map((status) => (
              <option key={status} value={status}>{statusLabel(status)}</option>
            ))}
          </select>
        </div>
        <div className="flex justify-end mt-3">
          <button type="submit" className="ui-button-primary">
            Filtrar
          </button>
        </div>
      </form>

      {filtered.length === 0 ? (
        <EmptyState message="Nenhum treinamento encontrado para os filtros aplicados." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((course) => {
            const progress = progressMap.get(course.id)
            return (
              <Link
                key={course.id}
                href={`/dashboard/courses/${course.id}`}
                className="ui-card group p-5 transition-transform duration-200 hover:-translate-y-0.5"
              >
                <div className="mb-4 rounded-[20px] border border-brand-border/60 bg-[linear-gradient(135deg,rgba(20,90,114,0.14),rgba(20,90,114,0.03)_52%,rgba(164,104,22,0.12))] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <span className="ui-badge ui-badge-info">
                      {course.categoryName}
                    </span>
                    <span className={`ui-badge ${statusClasses(course.status)}`}>
                      {statusLabel(course.status)}
                    </span>
                  </div>
                  <p className="mt-10 text-xs font-semibold uppercase tracking-[0.14em] text-brand-text-muted">{course.lessonCount} aula(s)</p>
                </div>
                <h2 className="mb-2 line-clamp-2 font-semibold text-brand-text group-hover:text-brand-primary">{course.title}</h2>
                <p className="mb-3 line-clamp-3 text-sm text-brand-text-muted">{course.description}</p>
                <p className="text-xs text-brand-text-muted">Instrutor: {course.instructorName}</p>

                {typeof progress === 'number' && (
                  <div className="mt-4">
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="text-brand-text-muted">Progresso</span>
                      <span className="font-semibold text-brand-primary">{progress}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-brand-border/70">
                      <div className="h-2 rounded-full bg-[linear-gradient(90deg,#145a72_0%,#1f7a5a_100%)]" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                )}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
