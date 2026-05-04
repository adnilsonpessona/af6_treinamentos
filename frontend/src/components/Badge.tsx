import type { ReactNode } from 'react'

export type BadgeTone =
  | 'beginner'
  | 'intermediate'
  | 'advanced'
  | 'new'
  | 'in-progress'
  | 'completed'
  | 'neutral'
  | 'danger'

const toneClass: Record<BadgeTone, string> = {
  beginner: 'badge-beginner',
  intermediate: 'badge-intermediate',
  advanced: 'badge-advanced',
  new: 'badge-new',
  'in-progress': 'badge-in-progress',
  completed: 'badge-completed',
  neutral: 'ui-badge-neutral',
  danger: 'ui-badge-danger',
}

// Use <Badge tone="completed">Concluído</Badge> for levels and status chips.
export default function Badge({ tone = 'neutral', children, className = '' }: { tone?: BadgeTone; children: ReactNode; className?: string }) {
  return <span className={`ui-badge ${toneClass[tone]} ${className}`}>{children}</span>
}
