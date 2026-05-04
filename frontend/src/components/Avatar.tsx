type Props = {
  name: string
  src?: string | null
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClass = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-20 w-20 text-xl',
}

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

// Use <Avatar name={fullName} src={photoUrl} /> for user identity.
export default function Avatar({ name, src, size = 'md', className = '' }: Props) {
  if (src) {
    return <img src={src} alt={name} className={`avatar ${sizeClass[size]} ${className}`} />
  }

  return <span className={`avatar ${sizeClass[size]} ${className}`}>{initials(name)}</span>
}
