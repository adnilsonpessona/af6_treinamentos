'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'

interface Props {
  courseId: string
  lesson: any
  course: any
  lessonProgress: any
  pdfUrl: string | null
  token: string
}

export default function LessonViewer({ courseId, lesson, course, lessonProgress, pdfUrl, token }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const progressInterval = useRef<ReturnType<typeof setInterval> | undefined>(undefined)
  const [textAccessed, setTextAccessed] = useState(false)
  const [videoSrc, setVideoSrc] = useState<string | null>(null)
  const [videoError, setVideoError] = useState<string | null>(null)
  const [videoLoading, setVideoLoading] = useState(false)

  useEffect(() => {
    if (lesson.hasText && !lessonProgress?.textAccessed) {
      api.progress.recordAccess(token, lesson.id).then(() => setTextAccessed(true)).catch(() => {})
    }
  }, [lesson.id, lesson.hasText, lessonProgress?.textAccessed, token])

  useEffect(() => {
    if (!lesson.hasVideo) return
    setVideoLoading(true)
    setVideoError(null)
    api.courses.getVideoToken(token, courseId, lesson.id)
      .then(({ token: vt }) => {
        setVideoSrc(api.courses.streamVideoUrl(courseId, lesson.id, vt))
      })
      .catch((err) => setVideoError(err.message ?? 'Não foi possível carregar o vídeo.'))
      .finally(() => setVideoLoading(false))
  }, [courseId, lesson.id, lesson.hasVideo, token])

  useEffect(() => {
    const video = videoRef.current
    if (!video || !videoSrc) return

    if (lessonProgress?.lastSecond && lessonProgress.lastSecond > 0) {
      video.currentTime = lessonProgress.lastSecond
    }

    const sendProgress = () => {
      if (video.duration > 0) {
        const pct = (video.currentTime / video.duration) * 100
        api.progress.updateVideo(token, {
          lessonId: lesson.id,
          percentageWatched: Math.round(pct * 100) / 100,
          lastSecond: Math.floor(video.currentTime),
        }).catch(() => {})
      }
    }

    progressInterval.current = setInterval(sendProgress, 15000)
    video.addEventListener('ended', sendProgress)
    video.addEventListener('pause', sendProgress)

    return () => {
      clearInterval(progressInterval.current)
      video.removeEventListener('ended', sendProgress)
      video.removeEventListener('pause', sendProgress)
    }
  }, [videoSrc, lesson.id, lessonProgress?.lastSecond, token])

  return (
    <div className="flex flex-col min-h-screen">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-sm text-brand-text/60">
        <Link href={`/dashboard/courses/${courseId}`} className="text-brand-primary hover:text-brand-dark font-medium transition-colors">
          {course.title}
        </Link>
        <span className="text-brand-border">/</span>
        <span className="text-brand-text font-medium">{lesson.title}</span>
      </div>

      {/* Título da aula */}
      <div className="ui-card mb-8 p-6 sm:p-7">
        <div className="flex flex-wrap items-center gap-2">
          <span className="ui-badge ui-badge-info">{course.categoryName}</span>
          <span className="ui-badge ui-badge-neutral">{course.instructorName}</span>
        </div>
        <h1 className="mt-4">{lesson.title}</h1>
      </div>

      {/* Player de vídeo com fundo escuro (Slate-900) */}
      {lesson.hasVideo && (
        <div className="mb-8 flex aspect-video items-center justify-center overflow-hidden rounded-[28px] border border-white/10 bg-[#10232d] shadow-[0_18px_38px_rgba(16,35,45,0.24)]">
          {videoLoading && (
            <span className="text-white text-sm animate-pulse">Carregando vídeo…</span>
          )}
          {videoError && (
            <span className="text-red-400 text-sm px-6 text-center">{videoError}</span>
          )}
          {videoSrc && (
            <video
              ref={videoRef}
              src={videoSrc}
              controls
              className="w-full h-full"
              playsInline
            />
          )}
        </div>
      )}

      {/* Conteúdo de texto com área de leitura confortável */}
      {lesson.hasText && (
        <div className="ui-card mx-auto mb-8 w-full max-w-4xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h2>Conteúdo da Aula</h2>
            {pdfUrl && (
              <a
                href={`${pdfUrl}?token=${token}`}
                target="_blank"
                rel="noopener noreferrer"
                className="ui-button-secondary"
              >
                📄 Baixar PDF
              </a>
            )}
          </div>
          <div
            className="prose prose-lg text-brand-text leading-relaxed max-w-none space-y-4"
            dangerouslySetInnerHTML={{ __html: lesson.contentHtml ?? '' }}
          />
        </div>
      )}

      {/* Footer com navegação */}
      <div className="mt-auto flex items-center justify-between border-t border-brand-border pt-6">
        <Link href={`/dashboard/courses/${courseId}`}
          className="text-sm font-medium text-brand-primary hover:text-brand-dark transition-colors">
          ← Voltar ao curso
        </Link>
        {lessonProgress?.lessonCompleted && (
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-brand-success">
            <span className="inline-flex w-5 h-5 items-center justify-center rounded-full bg-brand-success/10">✓</span>
            Aula concluída
          </span>
        )}
      </div>
    </div>
  )
}
