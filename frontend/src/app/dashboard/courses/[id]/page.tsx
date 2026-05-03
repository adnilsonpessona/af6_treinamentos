import { cookies } from 'next/headers'
import Link from 'next/link'
import { api } from '@/lib/api'
import { notFound } from 'next/navigation'

export default async function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value ?? ''

  let course: any
  let progress: any = null

  try {
    course = await api.courses.get(token, id)
    progress = await api.progress.getCourseProgress(token, id)
  } catch {
    notFound()
  }

  return (
    <div className="space-y-8">
      {/* Navegação */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/dashboard" className="text-brand-primary hover:text-brand-dark font-medium transition-colors">
          Dashboard
        </Link>
        <span className="text-brand-border">/</span>
        <span className="text-brand-text font-medium">{course.title}</span>
      </div>

      {/* Hero - Informações do curso */}
      <div className="ui-card p-7 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="ui-badge ui-badge-info">{course.categoryName}</span>
              <span className="ui-badge ui-badge-neutral">{course.instructorName}</span>
            </div>
            <h1>{course.title}</h1>
            <p className="max-w-3xl text-base leading-7 text-brand-text-muted">{course.description}</p>
          </div>
          <div className="ui-card-muted min-w-[15rem] px-5 py-4">
            <div className="text-[0.72rem] font-bold uppercase tracking-[0.14em] text-brand-text-muted">Conteúdo</div>
            <div className="mt-3 text-3xl font-extrabold tracking-[-0.05em] text-brand-text">{course.lessons?.length ?? 0}</div>
            <div className="mt-1 text-sm text-brand-text-muted">aula(s) disponíveis</div>
          </div>
        </div>
      </div>

      {/* Card de progresso com gradiente */}
      {progress && (
        <div className="ui-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-sm font-semibold text-brand-text/70 block mb-1">Seu Progresso</span>
              <span className="text-3xl font-bold text-brand-primary">{progress.progressPercentage}%</span>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-brand-text">
                {progress.completedLessons}/{progress.totalLessons}
              </p>
              <p className="text-xs text-brand-text/60">aulas concluídas</p>
            </div>
          </div>

          {/* Barra de progresso com gradiente e animação */}
          <div className="relative w-full h-3 bg-brand-border rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-progress rounded-full shadow-lg transition-all duration-500 ease-out"
              style={{ width: `${progress.progressPercentage}%` }}
            />
            <div
              className="absolute top-0 left-0 h-full w-1 bg-white/40 blur-sm transition-all duration-500"
              style={{ left: `${progress.progressPercentage}%` }}
            />
          </div>

          {/* Status de conclusão */}
          {progress.courseCompleted && (
            <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-brand-success">
              <span className="inline-flex w-6 h-6 items-center justify-center rounded-full bg-brand-success text-white text-xs">✓</span>
              Curso concluído com sucesso!
            </div>
          )}
        </div>
      )}

      {/* Seção de aulas */}
      <div>
        <h2 className="mb-4">Aulas</h2>
        <div className="ui-table-shell overflow-hidden">
          {course.lessons?.length === 0 ? (
            <div className="p-8 text-center text-brand-text/60">
              <p>Nenhuma aula disponível neste curso.</p>
            </div>
          ) : (
            <div className="divide-y divide-brand-border">
              {course.lessons?.map((lesson: any, index: number) => {
                const lp = progress?.lessons?.find((l: any) => l.lessonId === lesson.id)
                const isCompleted = lp?.lessonCompleted

                return (
                  <Link
                    key={lesson.id}
                    href={`/dashboard/courses/${id}/lessons/${lesson.id}`}
                    className="group flex items-start gap-4 border-l-4 border-transparent p-4 transition-colors duration-200 hover:border-brand-primary hover:bg-brand-surface"
                  >
                    {/* Badge com número ou checkmark */}
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0 transition-all ${
                      isCompleted
                        ? 'bg-brand-success/10 text-brand-success'
                        : 'bg-brand-primary/10 text-brand-primary group-hover:bg-brand-primary group-hover:text-white'
                    }`}>
                      {isCompleted ? '✓' : index + 1}
                    </div>

                    {/* Informações da aula */}
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-brand-text truncate ${isCompleted ? 'text-brand-text/70' : ''}`}>
                        {lesson.title}
                      </p>
                      <p className="mt-1 text-xs text-brand-text/50">
                        {lesson.hasVideo && '🎥 Vídeo'}
                        {lesson.hasVideo && lesson.hasText && ' · '}
                        {lesson.hasText && '📄 Texto'}
                      </p>
                    </div>

                    {/* Badge de status */}
                    {lp && (
                      <div className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors flex-shrink-0 ${
                        isCompleted
                          ? 'bg-brand-success/10 text-brand-success'
                          : lp.videoPercentage && lp.videoPercentage > 0
                          ? 'bg-yellow-50 text-yellow-700'
                          : 'bg-brand-border text-brand-text/60'
                      }`}>
                        {isCompleted ? '✓ Concluída' : lp.videoPercentage ? `${lp.videoPercentage}%` : 'Não iniciada'}
                      </div>
                    )}
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
