import { cookies } from 'next/headers'
import { api } from '@/lib/api'
import EmptyState from '@/components/EmptyState'
import PageHeader from '@/components/PageHeader'
import CourseCard from '@/components/CourseCard'

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
              <CourseCard
                key={course.id}
                href={`/dashboard/courses/${course.id}`}
                title={course.title}
                description={course.description}
                category={course.categoryName}
                instructor={course.instructorName}
                lessonCount={course.lessonCount}
                progress={progress}
                status={course.status}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
