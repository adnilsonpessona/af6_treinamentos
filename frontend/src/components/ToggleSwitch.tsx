'use client'

interface Props {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  label?: string
  size?: 'sm' | 'md'
}

export default function ToggleSwitch({ checked, onChange, disabled, label, size = 'md' }: Props) {
  const trackSize = size === 'sm' ? 'w-8 h-4' : 'w-11 h-6'
  const thumbSize = size === 'sm' ? 'w-3 h-3' : 'w-5 h-5'
  const thumbTranslate = size === 'sm'
    ? (checked ? 'translate-x-4' : 'translate-x-0.5')
    : (checked ? 'translate-x-5' : 'translate-x-0.5')

  return (
    <label className={`inline-flex items-center gap-2.5 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`relative inline-flex flex-shrink-0 ${trackSize} rounded-full border transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 ${
          checked ? 'border-brand-primary bg-brand-primary' : 'border-brand-border-strong bg-[#d7d1c7]'
        }`}
      >
        <span
          className={`mt-0.5 inline-block ${thumbSize} transform rounded-full bg-white shadow-[0_2px_8px_rgba(23,33,38,0.18)] transition-transform duration-200 ${thumbTranslate}`}
        />
      </button>
      {label && (
        <span className="select-none text-sm text-brand-text">{label}</span>
      )}
    </label>
  )
}
