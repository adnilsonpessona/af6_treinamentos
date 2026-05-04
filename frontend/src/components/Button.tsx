import Link from 'next/link'
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

type BaseProps = {
  children: ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
}

type ButtonProps = BaseProps & ButtonHTMLAttributes<HTMLButtonElement>
type LinkButtonProps = BaseProps & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }

function buttonClassName(variant: ButtonVariant = 'primary', size: ButtonSize = 'md', className = '') {
  return ['btn', `btn-${variant}`, `btn-${size}`, className].filter(Boolean).join(' ')
}

// Use <Button variant="primary" size="md">Salvar</Button> for actions.
export function Button({ children, variant = 'primary', size = 'md', className, ...props }: ButtonProps) {
  return (
    <button className={buttonClassName(variant, size, className)} {...props}>
      {children}
    </button>
  )
}

// Use <ButtonLink href="/dashboard" variant="ghost">Voltar</ButtonLink> for navigation CTAs.
export function ButtonLink({ children, variant = 'primary', size = 'md', className, href, ...props }: LinkButtonProps) {
  return (
    <Link href={href} className={buttonClassName(variant, size, className)} {...props}>
      {children}
    </Link>
  )
}
