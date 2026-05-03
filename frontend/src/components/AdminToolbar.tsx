import { Plus, X } from 'lucide-react'
import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
  expanded: boolean
  openLabel: string
  closeLabel?: string
  onToggle: () => void
}

export default function AdminToolbar({
  children,
  expanded,
  openLabel,
  closeLabel = 'Fechar cadastro',
  onToggle,
}: Props) {
  return (
    <section className="ui-card border-brand-border/65 bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(240,246,252,0.94)_100%)] p-5 sm:p-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        {children}
        <button
          type="button"
          onClick={onToggle}
          className={expanded ? 'ui-button-secondary' : 'ui-button-primary'}
        >
          {expanded ? <><X size={15} /> {closeLabel}</> : <><Plus size={15} /> {openLabel}</>}
        </button>
      </div>
    </section>
  )
}