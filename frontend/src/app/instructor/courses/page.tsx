import { cookies } from 'next/headers'
import Link from 'next/link'
import { api } from '@/lib/api'
import EmptyState from '@/components/EmptyState'
import PageHeader from '@/components/PageHeader'

const STATUS_LABEL: Record<string, string> = {
  Rascunho: 'Rascunho',
  AguardandoAprovacao: 'Aguardando',
  Publicado: 'Publicado',
  Reprovado: 'Reprovado',
}

const STATUS_CLASSES: Record<string, string> = {
  Rascunho: 'ui-badge-neutral',
  AguardandoAprovacao: 'ui-badge-warning',
  Publicado: 'ui-badge-success',
  Reprovado: 'ui-badge-danger',
}

export default async function InstructorCoursesPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value ?? ''

  let courses: any[] = []
  try {
    courses = await api.courses.list(token)
  } catch {
    courses = []
  }

  const sorted = [...courses].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <PageHeader
          eyebrow="Instrutor"
          title="Meus cursos"
          description="Acompanhe o status editorial dos treinamentos, revise conteúdos e avance rapidamente para a gestão de aulas."
          className="mb-0 max-w-3xl"
        />
        <Link href="/instructor/courses/new" className="ui-button-primary">
          Novo curso
        </Link>
      </div>

      {sorted.length === 0 ? (
        <div className="space-y-4">
          <EmptyState message="Você ainda não criou nenhum curso." />
          <Link href="/instructor/courses/new" className="ui-button-primary inline-flex">
            Criar primeiro curso
          </Link>
        </div>
      ) : (
        <div className="ui-card overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead className="border-b border-brand-border/60 bg-brand-light text-[11px] font-bold uppercase tracking-[0.14em] text-brand-text-muted">
              <tr>
                <th className="px-4 py-3 text-left">Título</th>
                <th className="px-4 py-3 text-left">Categoria</th>
                <th className="px-4 py-3 text-left">Aulas</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Atualizado</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/50">
              {sorted.map((course) => (
                <tr key={course.id} className="transition-colors hover:bg-brand-light/40">
                  <td className="px-4 py-4">
                    <div className="max-w-sm">
                      <p className="truncate font-semibold text-brand-text">{course.title}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-brand-text-muted">{course.categoryName}</td>
                  <td className="px-4 py-4 text-brand-text-muted">{course.lessonCount}</td>
                  <td className="px-4 py-4">
                    <span className={`ui-badge ${STATUS_CLASSES[course.status] ?? 'ui-badge-neutral'}`}>
                      {STATUS_LABEL[course.status] ?? course.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-xs text-brand-text-muted">
                    {new Date(course.updatedAt).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <Link
                      href={`/instructor/courses/${course.id}`}
                      className="ui-button-secondary inline-flex px-3 py-2 text-xs"
                    >
                      Gerenciar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
