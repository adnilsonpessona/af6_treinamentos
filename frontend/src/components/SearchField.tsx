import { Search } from 'lucide-react'

type Props = {
  id: string
  name: string
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  className?: string
}

export default function SearchField({
  id,
  name,
  label,
  value,
  onChange,
  placeholder,
  className,
}: Props) {
  return (
    <div className={className}>
      <label htmlFor={id} className="ui-label">{label}</label>
      <div className="relative">
        <Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-brand-text-muted" />
        <input
          id={id}
          name={name}
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="ui-input pl-11"
        />
      </div>
    </div>
  )
}