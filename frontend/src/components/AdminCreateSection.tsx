import type { ReactNode } from 'react'

type Props = {
  eyebrow: string
  title: string
  description: string
  icon?: ReactNode
  children: ReactNode
  className?: string
}

export default function AdminCreateSection({
  eyebrow,
  title,
  description,
  icon,
  children,
  className,
}: Props) {
  return (
    <section className={className ?? 'ui-card p-6 sm:p-7'}>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="ui-section-title">{eyebrow}</p>
          <h3 className="mt-2">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-brand-text-muted">{description}</p>
        </div>
        {icon ? (
          <div className="hidden h-12 w-12 items-center justify-center rounded-2xl bg-brand-accent text-brand-primary sm:flex">
            {icon}
          </div>
        ) : null}
      </div>
      {children}
    </section>
  )
}