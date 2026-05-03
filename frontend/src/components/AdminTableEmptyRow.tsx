type Props = {
  colSpan: number
  message: string
  className?: string
}

export default function AdminTableEmptyRow({ colSpan, message, className }: Props) {
  return (
    <tr>
      <td className={`px-4 py-10 text-center text-brand-text-muted${className ? ` ${className}` : ''}`} colSpan={colSpan}>
        {message}
      </td>
    </tr>
  )
}