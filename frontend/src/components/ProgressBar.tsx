type Props = {
  value: number
  label?: string
  className?: string
}

function clamp(value: number) {
  if (Number.isNaN(value)) return 0
  return Math.min(100, Math.max(0, value))
}

// Use <ProgressBar value={72} /> to render the standard LMS progress indicator.
export default function ProgressBar({ value, label, className = '' }: Props) {
  const safeValue = clamp(value)

  return (
    <div className={className}>
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-sm text-brand-text-muted">{label ?? 'Progresso'}</span>
        <span className="progress-label">{safeValue}%</span>
      </div>
      <progress className="progress-bar" value={safeValue} max={100} aria-label={label ?? 'Progresso'} />
    </div>
  )
}
