import type { ReactNode } from 'react'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

type Props = {
  tone: 'error' | 'success'
  children: ReactNode
}

const toneClasses = {
  error: 'ui-alert ui-alert-error',
  success: 'ui-alert ui-alert-success',
} as const

const toneIcons = {
  error: <AlertCircle size={15} className="shrink-0" />,
  success: <CheckCircle2 size={15} className="shrink-0" />,
} as const

export default function FeedbackAlert({ tone, children }: Props) {
  return (
    <div className={toneClasses[tone]}>
      <div className="flex items-start gap-2">
        {toneIcons[tone]}
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  )
}