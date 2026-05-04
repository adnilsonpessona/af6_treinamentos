'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import { useEffect } from 'react'

interface Props {
  value: string
  onChange: (html: string) => void
  placeholder?: string
}

export default function RichTextEditor({ value, onChange, placeholder }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
    ],
    content: value || '',
    onUpdate({ editor }) {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none min-h-[200px] px-4 py-3 focus:outline-none',
      },
    },
  })

  // Sync external value changes (e.g. loading existing lesson)
  useEffect(() => {
    if (!editor) return
    const current = editor.getHTML()
    if (value !== current) {
      editor.commands.setContent(value || '', false)
    }
  }, [value, editor])

  if (!editor) return null

  return (
    <div className="overflow-hidden rounded-2xl border border-brand-border bg-white shadow-[0_18px_42px_rgba(23,33,38,0.08)] focus-within:ring-2 focus-within:ring-brand-primary/20">
      <div className="flex flex-wrap gap-1 border-b border-brand-border/70 bg-brand-light px-2 py-1.5">
        <ToolBtn
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Negrito"
        >
          <b>B</b>
        </ToolBtn>
        <ToolBtn
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Itálico"
        >
          <i>I</i>
        </ToolBtn>
        <ToolBtn
          active={editor.isActive('strike')}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          title="Tachado"
        >
          <s>S</s>
        </ToolBtn>
        <div className="mx-1 w-px bg-brand-border" />
        <ToolBtn
          active={editor.isActive('heading', { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          title="Título 2"
        >
          H2
        </ToolBtn>
        <ToolBtn
          active={editor.isActive('heading', { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          title="Título 3"
        >
          H3
        </ToolBtn>
        <div className="mx-1 w-px bg-brand-border" />
        <ToolBtn
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Lista com marcadores"
        >
          •—
        </ToolBtn>
        <ToolBtn
          active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="Lista numerada"
        >
          1—
        </ToolBtn>
        <ToolBtn
          active={editor.isActive('blockquote')}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          title="Citação"
        >
          ❝
        </ToolBtn>
        <ToolBtn
          active={editor.isActive('code')}
          onClick={() => editor.chain().focus().toggleCode().run()}
          title="Código inline"
        >
          {'<>'}
        </ToolBtn>
        <div className="mx-1 w-px bg-brand-border" />
        <ToolBtn
          active={false}
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Desfazer"
        >
          ↩
        </ToolBtn>
        <ToolBtn
          active={false}
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Refazer"
        >
          ↪
        </ToolBtn>
      </div>

      <div className="relative bg-white">
        {!value && placeholder && editor.isEmpty && (
          <p className="pointer-events-none absolute left-4 top-3 text-sm text-brand-text-muted/70">
            {placeholder}
          </p>
        )}
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}

function ToolBtn({
  children,
  active,
  onClick,
  disabled,
  title,
}: {
  children: React.ReactNode
  active: boolean
  onClick: () => void
  disabled?: boolean
  title?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`rounded-lg px-2.5 py-1.5 font-mono text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        active
          ? 'bg-brand-primary text-white shadow-[0_10px_24px_rgba(55,48,163,0.22)]'
          : 'text-brand-text-muted hover:bg-white hover:text-brand-text'
      }`}
    >
      {children}
    </button>
  )
}
