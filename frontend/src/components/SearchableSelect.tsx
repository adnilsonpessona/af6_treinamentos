'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Search, X } from 'lucide-react'

export interface SelectOption {
  value: string
  label: string
  description?: string
}

interface Props {
  options: SelectOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  label?: string
  required?: boolean
  disabled?: boolean
  className?: string
  searchPlaceholder?: string
}

export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = 'Selecione...',
  label,
  required,
  disabled,
  className,
  searchPlaceholder = 'Pesquisar...',
}: Props) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const selected = options.find((o) => o.value === value)

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase()) ||
    (o.description?.toLowerCase().includes(search.toLowerCase()) ?? false)
  )

  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 50)
    else setSearch('')
  }, [open])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleSelect(v: string) {
    onChange(v)
    setOpen(false)
    setSearch('')
  }

  function handleClear(e: React.MouseEvent) {
    e.stopPropagation()
    onChange('')
    setOpen(false)
  }

  return (
    <div className={`relative ${className ?? ''}`} ref={containerRef}>
      {label && (
        <label className="block text-xs font-medium text-zinc-600 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Trigger button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((v) => !v)}
        className={`ui-select-trigger flex items-center justify-between gap-2 text-left transition-colors ${
          disabled
            ? 'cursor-not-allowed'
            : open
            ? 'border-brand-primary bg-white'
            : 'hover:border-brand-border-strong'
        }`}
      >
        <span className={selected ? 'text-brand-text' : 'text-brand-text-muted'}>
          {selected ? selected.label : placeholder}
        </span>
        <div className="flex items-center gap-1 flex-shrink-0">
          {value && !disabled && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              onKeyDown={(e) => e.key === 'Enter' && handleClear(e as any)}
              className="rounded p-0.5 text-brand-text-muted hover:bg-brand-light hover:text-brand-text"
            >
              <X size={12} />
            </span>
          )}
          <ChevronDown size={14} className={`text-brand-text-muted transition-transform ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-[20px] border border-brand-border/70 bg-white shadow-[0_22px_45px_rgba(25,35,40,0.12)]">
          {/* Search input */}
          <div className="border-b border-brand-border/55 p-2">
            <div className="flex items-center gap-2 rounded-2xl border border-brand-border/70 bg-brand-light px-3 py-2">
              <Search size={13} className="text-brand-text-muted flex-shrink-0" />
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className="flex-1 bg-transparent text-sm text-brand-text outline-none placeholder:text-brand-text-muted"
              />
              {search && (
                <button type="button" onClick={() => setSearch('')}>
                  <X size={12} className="text-brand-text-muted hover:text-brand-text" />
                </button>
              )}
            </div>
          </div>

          {/* Options list */}
          <ul className="max-h-52 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-3 text-center text-sm text-brand-text-muted">
                Nenhuma opção encontrada
              </li>
            ) : (
              filtered.map((opt) => (
                <li key={opt.value}>
                  <button
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className={`w-full px-3 py-2.5 text-left text-sm transition-colors ${
                      opt.value === value
                        ? 'bg-brand-accent text-brand-primary font-semibold'
                        : 'text-brand-text hover:bg-brand-light'
                    }`}
                  >
                    <span className="block">{opt.label}</span>
                    {opt.description && (
                      <span className="mt-0.5 block text-xs text-brand-text-muted">{opt.description}</span>
                    )}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
