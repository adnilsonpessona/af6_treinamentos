import { cookies } from 'next/headers'
import Link from 'next/link'
import { api } from '@/lib/api'

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value ?? ''
  const role = cookieStore.get('auth_role')?.value ?? ''
  const rawName = cookieStore.get('auth_name')?.value ?? ''
  const fullName = decodeURIComponent(rawName)

  let courses: any[] = []
  let myProgress: any = null

  try {
    courses = await api.courses.list(token)
    if (role === 'Funcionario' || role === 'Gestor') {
      myProgress = await api.reports.myProgress(token)
    }
  } catch {}

  const publishedCount = courses.filter((course: any) => course.status === 'Publicado').length
  const pendingCount = courses.filter((course: any) => course.status === 'AguardandoAprovacao').length
  const draftCount = courses.filter((course: any) => course.status === 'Rascunho').length

  return (
    <div>
      <section className="ui-card overflow-hidden p-7 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="ui-badge ui-badge-info w-fit">Painel principal</div>
            <h1 className="mt-5">Olá, {fullName}.</h1>
            <p className="mt-3 max-w-xl text-base leading-7">
              Acompanhe o ritmo dos treinamentos, os cursos disponíveis e o que exige atenção agora.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:min-w-md">
            <QuickFact label="Cursos totais" value={courses.length} />
            <QuickFact label="Publicados" value={publishedCount} />
            <QuickFact label="Em revisão" value={pendingCount} />
          </div>
        </div>
      </section>

      {myProgress && (
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <StatCard label="Disponíveis" value={myProgress.availableCourses} color="blue" />
          <StatCard label="Em andamento" value={myProgress.startedCourses} color="yellow" />
          <StatCard label="Concluídos" value={myProgress.completedCourses} color="green" />
        </div>
      )}

      {role === 'Administrador' && (
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <StatCard label="Publicados" value={publishedCount} color="green" />
          <StatCard label="Aguardando aprovação" value={pendingCount} color="yellow" />
          <StatCard label="Rascunhos" value={draftCount} color="blue" />
        </div>
      )}

      <div className="mt-10 mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="ui-section-title">Catálogo</p>
          <h2 className="mt-2">
            {role === 'Administrador' ? 'Todos os cursos' : 'Treinamentos disponíveis'}
          </h2>
        </div>
        <p className="text-sm text-brand-text-muted">{courses.length} item(ns)</p>
      </div>

      {courses.length === 0 ? (
        <div className="ui-card-muted p-8 text-center text-brand-text-muted">Nenhum treinamento disponível.</div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {courses.map((course: any) => (
            <Link key={course.id} href={`/dashboard/courses/${course.id}`}
              className="ui-card group overflow-hidden p-5 transition-transform duration-200 hover:-translate-y-0.5">
              <div className="mb-5 rounded-[20px] border border-brand-border/60 bg-[linear-gradient(135deg,rgba(20,90,114,0.14),rgba(20,90,114,0.03)_52%,rgba(164,104,22,0.12))] p-4">
                <div className="flex items-start justify-between gap-3">
                  <span className="ui-badge ui-badge-info">
                    {course.categoryName}
                  </span>
                  <StatusBadge status={course.status} />
                </div>
                <div className="mt-10 text-xs font-semibold uppercase tracking-[0.16em] text-brand-text-muted">
                  {course.lessonCount} aula(s)
                </div>
              </div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="font-semibold text-brand-text group-hover:text-brand-primary">{course.title}</h3>
              </div>
              <p className="line-clamp-2 text-sm text-brand-text-muted">
                {course.description}
              </p>
              <div className="mt-4 flex items-center justify-between text-xs text-brand-text-muted">
                <span>{course.instructorName}</span>
                <span className="font-semibold text-brand-primary">Abrir curso</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

function QuickFact({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[20px] border border-brand-border/60 bg-white/70 px-4 py-4">
      <div className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-brand-text-muted">{label}</div>
      <div className="mt-3 text-3xl font-extrabold tracking-tighter text-brand-text">{value}</div>
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    blue: 'text-brand-primary',
    yellow: 'text-brand-warning',
    green: 'text-brand-success',
  }
  return (
    <div className="ui-stat-card">
      <p className={`ui-stat-number ${colors[color]}`}>{value}</p>
      <p className="mt-2 text-sm font-semibold text-brand-text">{label}</p>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Publicado: 'ui-badge-success',
    Rascunho: 'ui-badge-neutral',
    AguardandoAprovacao: 'ui-badge-warning',
    Reprovado: 'ui-badge-danger',
  }
  const labels: Record<string, string> = {
    Publicado: 'Publicado',
    Rascunho: 'Rascunho',
    AguardandoAprovacao: 'Aguardando',
    Reprovado: 'Reprovado',
  }
  return (
    <span className={`ui-badge ${map[status] ?? 'ui-badge-neutral'}`}>
      {labels[status] ?? status}
    </span>
  )
}
