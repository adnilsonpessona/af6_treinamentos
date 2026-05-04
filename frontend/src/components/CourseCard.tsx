import Link from 'next/link'
import Badge from '@/components/Badge'
import ProgressBar from '@/components/ProgressBar'
import type { BadgeTone } from '@/components/Badge'

type Props = {
  href: string
  title: string
  description?: string | null
  category?: string | null
  instructor?: string | null
  lessonCount?: number
  progress?: number
  status?: string
}

function statusTone(status?: string): BadgeTone {
  if (status === 'Publicado') return 'new'
  if (status === 'AguardandoAprovacao') return 'in-progress'
  if (status === 'Reprovado') return 'advanced'
  return 'neutral'
}

function statusLabel(status?: string) {
  if (status === 'AguardandoAprovacao') return 'Em andamento'
  if (status === 'Publicado') return 'Novo'
  return status ?? 'Curso'
}

// Use <CourseCard /> in course grids to keep thumbnails, metadata, progress and CTA consistent.
export default function CourseCard({
  href,
  title,
  description,
  category,
  instructor,
  lessonCount,
  progress,
  status,
}: Props) {
  return (
    <Link href={href} className="card-course group">
      <div className="p-4">
        <div className="card-course-thumbnail flex items-start justify-between p-4">
          <Badge tone={statusTone(status)}>{statusLabel(status)}</Badge>
          {category && <Badge tone="new">{category}</Badge>}
        </div>
      </div>

      <div className="flex flex-1 flex-col px-6 pb-6">
        <h3 className="line-clamp-2 text-brand-text group-hover:text-brand-primary">{title}</h3>
        {description && <p className="mt-2 line-clamp-3 text-sm text-brand-text-muted">{description}</p>}
        <div className="mt-4 space-y-3 text-sm text-brand-text-muted">
          {typeof lessonCount === 'number' && <p>{lessonCount} aula(s)</p>}
          {instructor && <p>Instrutor: {instructor}</p>}
          {typeof progress === 'number' && <ProgressBar value={progress} />}
        </div>
        <div className="mt-auto flex items-center justify-between gap-4 border-t border-brand-border pt-4">
          <Badge tone="intermediate">Intermediário</Badge>
          <span className="btn btn-primary btn-sm">Continuar</span>
        </div>
      </div>
    </Link>
  )
}
