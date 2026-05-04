import { ChevronLeft, ChevronRight } from 'lucide-react'

type Props = {
  current: number
  total: number
  onChange: (page: number) => void
  count: number
  label: string
}

function getPageNumbers(current: number, total: number): (number | null)[] {
  const pages: (number | null)[] = []

  for (let index = 1; index <= total; index += 1) {
    if (index === 1 || index === total || Math.abs(index - current) <= 1) {
      pages.push(index)
    } else if (pages[pages.length - 1] !== null) {
      pages.push(null)
    }
  }

  return pages
}

export default function AdminPagination({ current, total, onChange, count, label }: Props) {
  if (total <= 1) return null

  return (
    <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-brand-text-muted">
        {count} {label} — página {current} de {total}
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={current === 1}
          onClick={() => onChange(current - 1)}
          className="ui-button-secondary min-h-0 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={14} /> Anterior
        </button>
        {getPageNumbers(current, total).map((page, index) =>
          page === null ? (
            <span key={`ellipsis-${index}`} className="px-2 py-2 text-sm text-brand-text-muted">…</span>
          ) : (
            <button
              key={page}
              type="button"
              onClick={() => onChange(page)}
              className={`min-h-0 rounded-full border px-3 py-2 text-sm font-semibold transition-colors ${
                current === page
                  ? 'border-brand-primary bg-brand-primary text-white shadow-[0_10px_18px_rgba(55,48,163,0.18)]'
                  : 'border-brand-border/70 bg-white text-brand-text hover:bg-brand-light'
              }`}
            >
              {page}
            </button>
          )
        )}
        <button
          type="button"
          disabled={current === total}
          onClick={() => onChange(current + 1)}
          className="ui-button-secondary min-h-0 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
        >
          Próxima <ChevronRight size={14} />
        </button>
      </div>
    </div>
  )
}
