type Props = {
  message: string
  onConfirm: () => void
  onCancel: () => void
  confirmDisabled?: boolean
}

export default function AdminInlineConfirm({ message, onConfirm, onCancel, confirmDisabled }: Props) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-danger/20 bg-[#fff4f4] px-2 py-1.5">
      <span className="text-xs text-brand-danger">{message}</span>
      <button
        type="button"
        onClick={onConfirm}
        disabled={confirmDisabled}
        className="ui-button-danger min-h-0 px-2.5 py-1.5 text-xs disabled:opacity-60"
      >
        Sim
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="ui-button-secondary min-h-0 px-2.5 py-1.5 text-xs"
      >
        Não
      </button>
    </span>
  )
}