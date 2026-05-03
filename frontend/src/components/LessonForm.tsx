'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import FeedbackAlert from '@/components/FeedbackAlert'
import dynamic from 'next/dynamic'

const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), { ssr: false })

type LessonType = 'Video' | 'Texto' | 'VideoETexto'

interface ExistingLesson {
  id: string
  title: string
  order: number
  type: LessonType
  contentHtml: string | null
  hasVideo: boolean
}

interface Props {
  token: string
  courseId: string
  lesson?: ExistingLesson
  nextOrder: number
}

const TYPE_OPTIONS: { value: LessonType; label: string }[] = [
  { value: 'Video', label: 'Apenas vídeo' },
  { value: 'Texto', label: 'Apenas texto' },
  { value: 'VideoETexto', label: 'Vídeo e texto' },
]

export default function LessonForm({ token, courseId, lesson, nextOrder }: Props) {
  const router = useRouter()
  const isEdit = !!lesson

  const [title, setTitle] = useState(lesson?.title ?? '')
  const [order, setOrder] = useState(lesson?.order ?? nextOrder)
  const [type, setType] = useState<LessonType>(lesson?.type ?? 'Video')
  const [contentHtml, setContentHtml] = useState(lesson?.contentHtml ?? '')
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const hasVideo = type === 'Video' || type === 'VideoETexto'
  const hasText = type === 'Texto' || type === 'VideoETexto'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    if (hasText && !contentHtml.trim()) {
      setError('O conteúdo de texto é obrigatório para este tipo de aula.')
      return
    }
    if (hasVideo && !videoFile && !lesson?.hasVideo) {
      setError('Selecione um arquivo de vídeo (.mp4).')
      return
    }

    setError(null)
    setSaving(true)
    let lessonId: string | null = null

    try {
      const payload = {
        title: title.trim(),
        order,
        type,
        contentHtml: hasText ? contentHtml : null,
      }

      if (isEdit) {
        setUploadProgress('Salvando aula...')
        await api.courses.updateLesson(token, courseId, lesson.id, payload)
        lessonId = lesson.id
      } else {
        setUploadProgress('Criando aula...')
        const created = await api.courses.createLesson(token, courseId, payload) as { id: string }
        lessonId = created.id
      }

      if (hasVideo && videoFile) {
        setUploadProgress('Enviando vídeo (pode demorar)...')
        await api.courses.uploadVideo(token, courseId, lessonId, videoFile)
      }

      setUploadProgress(null)
      router.push(`/instructor/courses/${courseId}`)
      router.refresh()
    } catch (err: any) {
      if (!isEdit && lessonId) {
        try {
          await api.courses.deleteLesson(token, courseId, lessonId)
        } catch {
          // Best-effort rollback when create succeeds but video upload fails.
        }
      }

      const message = String(err?.message ?? '')
      if (message.includes('MP4')) {
        setError('Falha ao enviar vídeo. Verifique se o arquivo é .mp4 válido e tente novamente.')
      } else {
        setError(message || 'Falha ao salvar aula.')
      }
      setUploadProgress(null)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="ui-card max-w-3xl space-y-6 p-6 sm:p-8">
      {error && <FeedbackAlert tone="error">{error}</FeedbackAlert>}

      <div>
        <p className="ui-section-title">Aula</p>
        <h2 className="mt-2">{isEdit ? 'Editar conteúdo da aula' : 'Criar nova aula'}</h2>
        <p className="mt-2 text-sm leading-6 text-brand-text-muted">Defina ordem, formato de conteúdo e arquivos necessários para publicação.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <label htmlFor="lesson-title" className="ui-label">
            Título da aula <span className="text-red-500">*</span>
          </label>
          <input
            id="lesson-title"
            name="lesson-title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex.: Introdução ao Módulo"
            className="ui-input"
          />
        </div>

        <div>
          <label htmlFor="lesson-order" className="ui-label">
            Ordem
          </label>
          <input
            id="lesson-order"
            name="lesson-order"
            type="number"
            min={1}
            value={order}
            onChange={(e) => setOrder(Number(e.target.value))}
            className="ui-input"
          />
        </div>
      </div>

      <div>
        <label htmlFor="lesson-type" className="ui-label">
          Tipo de conteúdo <span className="text-red-500">*</span>
        </label>
        <select
          id="lesson-type"
          name="lesson-type"
          value={type}
          onChange={(e) => setType(e.target.value as LessonType)}
          className="ui-input"
        >
          {TYPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {hasVideo && (
        <div>
          <label htmlFor="lesson-video" className="ui-label">
            Arquivo de vídeo (.mp4){lesson?.hasVideo ? ' — já possui vídeo enviado' : <span className="text-red-500"> *</span>}
          </label>
          <input
            id="lesson-video"
            name="lesson-video"
            type="file"
            accept="video/mp4"
            onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-brand-text file:mr-3 file:rounded-full file:border-0 file:bg-brand-accent file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-primary hover:file:bg-[#cae1e8]"
          />
          {lesson?.hasVideo && !videoFile && (
            <p className="mt-1 text-xs text-brand-text-muted">Deixe em branco para manter o vídeo atual.</p>
          )}
          {videoFile && (
            <p className="mt-1 text-xs text-brand-text-muted">
              {videoFile.name} ({(videoFile.size / 1_000_000).toFixed(1)} MB)
            </p>
          )}
        </div>
      )}

      {hasText && (
        <div>
          <label className="ui-label">
            Conteúdo de texto <span className="text-red-500">*</span>
          </label>
          <RichTextEditor
            value={contentHtml}
            onChange={setContentHtml}
            placeholder="Digite o conteúdo da aula aqui..."
          />
        </div>
      )}

      {uploadProgress && (
        <div className="ui-card-muted px-3 py-2 text-sm text-brand-primary">
          ⏳ {uploadProgress}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="ui-button-primary disabled:opacity-60"
        >
          {saving ? 'Salvando...' : isEdit ? 'Salvar alterações' : 'Criar aula'}
        </button>
        <button
          type="button"
          onClick={() => router.push(`/instructor/courses/${courseId}`)}
          disabled={saving}
          className="ui-button-secondary disabled:opacity-60"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
