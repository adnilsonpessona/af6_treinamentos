import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
}

export default function AdminDangerButton({ children, className, type = 'button', ...props }: Props) {
  return (
    <button
      type={type}
      className={`ui-button-ghost min-h-0 border border-brand-danger/20 px-3 py-2 text-xs text-brand-danger disabled:opacity-60 ${className ?? ''}`.trim()}
      {...props}
    >
      {children}
    </button>
  )
}