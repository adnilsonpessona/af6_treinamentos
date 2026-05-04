import { cookies } from 'next/headers'
import Link from 'next/link'
import { api } from '@/lib/api'
import { notFound } from 'next/navigation'
import Badge from '@/components/Badge'
import ProgressBar from '@/components/ProgressBar'
import { ButtonLink } from '@/components/Button'
import { CheckCircle2, FileText, PlayCircle } from 'lucide-react'

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

      {/* Hero: course pages use a primary indigo cover with white text. */}
      <div className="rounded-lg bg-brand-primary p-7 text-white sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="new" className="bg-white text-brand-primary">{course.categoryName}</Badge>
              <Badge tone="intermediate">{course.instructorName}</Badge>
            </div>
            <h1 className="text-white">{course.title}</h1>
            <p className="max-w-3xl text-base leading-7 text-white/80">{course.description}</p>
          </div>
          <div className="min-w-[15rem] rounded-lg border border-white/20 bg-white/10 px-5 py-4">
            <div className="text-xs font-semibold uppercase text-white/72">Conteúdo</div>
            <div className="mt-3 text-3xl font-bold text-white">{course.lessons?.length ?? 0}</div>
            <div className="mt-1 text-sm text-white/72">aula(s) disponíveis</div>
          </div>
        </div>
      </div>

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

          <ProgressBar value={Number(progress.progressPercentage ?? 0)} label="Progresso do curso" />

          {progress.courseCompleted && (
            <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-brand-success">
              <CheckCircle2 size={20} />
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
                    className="course-lesson-link group flex items-start gap-4 p-4 transition-colors duration-200 hover:bg-brand-light"
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0 transition-all ${
                      isCompleted
                        ? 'bg-brand-success/10 text-brand-success'
                        : 'bg-brand-primary/10 text-brand-primary group-hover:bg-brand-primary group-hover:text-white'
                    }`}>
                      {isCompleted ? <CheckCircle2 size={18} /> : index + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-brand-text truncate ${isCompleted ? 'text-brand-text/70' : ''}`}>
                        {lesson.title}
                      </p>
                      <div className="mt-1 flex items-center gap-3 text-xs text-brand-text-muted">
                        {lesson.hasVideo && <span className="inline-flex items-center gap-1"><PlayCircle size={13} /> Vídeo</span>}
                        {lesson.hasText && <span className="inline-flex items-center gap-1"><FileText size={13} /> Texto</span>}
                      </div>
                    </div>

                    {lp && (
                      <Badge tone={isCompleted ? 'completed' : lp.videoPercentage ? 'in-progress' : 'neutral'} className="shrink-0">
                        {isCompleted ? '✓ Concluída' : lp.videoPercentage ? `${lp.videoPercentage}%` : 'Não iniciada'}
                      </Badge>
                    )}
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <ButtonLink href="/dashboard/courses" variant="secondary">Voltar ao catálogo</ButtonLink>
    </div>
  )
}
