interface Props {
  message: string
  className?: string
}

export default function EmptyState({ message, className }: Props) {
  return (
    <div className={className ?? 'ui-card-muted p-8 text-center text-brand-text-muted'}>
      {message}
    </div>
  )
}