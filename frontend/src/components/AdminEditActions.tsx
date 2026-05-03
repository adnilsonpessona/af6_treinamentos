import { Check, X } from 'lucide-react'

type Props = {
  onSave: () => void
  onCancel: () => void
  saveDisabled?: boolean
}

export default function AdminEditActions({ onSave, onCancel, saveDisabled }: Props) {
  return (
    <>
      <button
        type="button"
        onClick={onSave}
        disabled={saveDisabled}
        className="ui-button-primary min-h-0 px-3 py-2 text-xs disabled:opacity-60"
      >
        <Check size={13} /> Salvar
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="ui-button-secondary min-h-0 px-3 py-2 text-xs"
      >
        <X size={13} /> Cancelar
      </button>
    </>
  )
}