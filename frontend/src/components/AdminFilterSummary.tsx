import type { ReactNode } from 'react'
import { X } from 'lucide-react'

type Props = {
  icon: ReactNode
  text: string
  onClear?: () => void
  clearLabel?: string
}

export default function AdminFilterSummary({
  icon,
  text,
  onClear,
  clearLabel = 'Limpar filtros',
}: Props) {
  return (
    <div className="flex items-center gap-2 text-sm text-brand-text-muted">
      {icon}
      <span>{text}</span>
      {onClear && (
        <button
          type="button"
          onClick={onClear}
          className="ml-1 inline-flex items-center gap-1 text-xs font-semibold text-brand-primary hover:underline"
        >
          <X size={12} /> {clearLabel}
        </button>
      )}
    </div>
  )
}