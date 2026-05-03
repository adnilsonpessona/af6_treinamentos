import { cookies } from 'next/headers'
import { api } from '@/lib/api'
import CourseApprovalList from '@/components/CourseApprovalList'
import EmptyState from '@/components/EmptyState'
import PageHeader from '@/components/PageHeader'

export default async function AdminCoursesPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value ?? ''

  let courses: any[] = []
  try {
    courses = await api.courses.list(token)
  } catch {
    courses = []
  }

  const pending = courses.filter((c: any) => c.status === 'AguardandoAprovacao')
  const approved = courses.filter((c: any) => c.status === 'Publicado')
  const rejected = courses.filter((c: any) => c.status === 'Reprovado')

  return (
    <div>
      <PageHeader eyebrow="Administração" title="Aprovação de cursos" description="Acompanhe a fila editorial, publique cursos aprovados e devolva feedback objetivo quando houver reprovação." />

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="ui-stat-card">
          <p className="text-sm font-semibold text-brand-warning">Aguardando</p>
          <p className="ui-stat-number text-brand-warning">{pending.length}</p>
        </div>
        <div className="ui-stat-card">
          <p className="text-sm font-semibold text-brand-success">Publicados</p>
          <p className="ui-stat-number text-brand-success">{approved.length}</p>
        </div>
        <div className="ui-stat-card">
          <p className="text-sm font-semibold text-brand-danger">Reprovados</p>
          <p className="ui-stat-number text-brand-danger">{rejected.length}</p>
        </div>
      </div>

      {pending.length === 0 ? (
        <EmptyState message="Nenhum curso aguardando aprovação." />
      ) : (
        <CourseApprovalList courses={pending} token={token} />
      )}
    </div>
  )
}
