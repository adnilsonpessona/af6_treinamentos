import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
  align?: 'left' | 'center' | 'right'
  sortable?: boolean
  onClick?: () => void
  className?: string
}

export default function AdminTableHeadCell({
  children,
  align = 'left',
  sortable = false,
  onClick,
  className,
}: Props) {
  const alignClass = align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left'
  const sortableClass = sortable ? 'cursor-pointer select-none transition-colors hover:bg-brand-accent/55 hover:text-brand-text' : ''

  return (
    <th
      className={`px-4 py-3.5 text-[11px] font-bold uppercase tracking-[0.16em] text-brand-text-muted ${alignClass} ${sortableClass}${className ? ` ${className}` : ''}`}
      onClick={onClick}
    >
      {children}
    </th>
  )
}