interface Props {
  eyebrow: string
  title: string
  description?: string
  className?: string
}

export default function PageHeader({ eyebrow, title, description, className }: Props) {
  return (
    <div className={className ?? 'mb-6 max-w-2xl'}>
      <p className="ui-section-title">{eyebrow}</p>
      <h1 className="mt-2">{title}</h1>
      {description && (
        <p className="mt-3 text-sm leading-6 text-brand-text-muted">{description}</p>
      )}
    </div>
  )
}