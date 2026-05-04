'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import Badge from '@/components/Badge'
import ProgressBar from '@/components/ProgressBar'
import { ButtonLink } from '@/components/Button'
import { CheckCircle2, FileText, PlayCircle } from 'lucide-react'

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

  const currentProgress = lessonProgress?.lessonCompleted
    ? 100
    : Math.round(Number(lessonProgress?.videoPercentage ?? 0))

  return (
    <div className="grid min-h-screen gap-8 lg:grid-cols-[18rem_minmax(0,1fr)]">
      {/* CourseSidebar: white lesson navigation with active and completed states. */}
      <aside className="course-sidebar -m-8 hidden p-6 lg:block">
        <div className="mb-6">
          <p className="ui-section-title">Curso</p>
          <h2 className="mt-2 text-lg">{course.title}</h2>
        </div>
        <details open className="space-y-3">
          <summary className="cursor-pointer text-sm font-semibold text-brand-text">Módulo principal</summary>
          <div className="mt-3 space-y-1">
            {course.lessons?.map((item: any) => {
              const active = item.id === lesson.id
              const completed = lessonProgress?.lessonCompleted && active

              return (
                <Link
                  key={item.id}
                  href={`/dashboard/courses/${courseId}/lessons/${item.id}`}
                  className={`course-lesson-link flex items-center gap-2 rounded-r-lg px-3 py-2 text-sm text-brand-text-muted transition-colors hover:bg-brand-light ${
                    active ? 'course-lesson-link-active font-semibold text-brand-primary' : ''
                  }`}
                >
                  {completed ? <CheckCircle2 size={16} className="text-brand-success" /> : <PlayCircle size={16} />}
                  <span className="line-clamp-2">{item.title}</span>
                </Link>
              )
            })}
          </div>
        </details>
      </aside>

      <main className="flex min-w-0 flex-col">
        <ProgressBar value={currentProgress} label="Progresso da aula" className="mb-8" />

        <div className="mb-6 flex items-center gap-2 text-sm text-brand-text/60">
          <Link href={`/dashboard/courses/${courseId}`} className="font-medium text-brand-primary transition-colors hover:text-brand-dark">
            {course.title}
          </Link>
          <span className="text-brand-border">/</span>
          <span className="font-medium text-brand-text">{lesson.title}</span>
        </div>

        <div className="ui-card mb-8 p-6 sm:p-7">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="new">{course.categoryName}</Badge>
            <Badge tone="neutral">{course.instructorName}</Badge>
          </div>
          <h1 className="mt-4">{lesson.title}</h1>
        </div>

        {lesson.hasVideo && (
          <div className="mb-8 flex aspect-video items-center justify-center overflow-hidden rounded-lg bg-brand-dark">
            {videoLoading && (
              <span className="animate-pulse text-sm text-white">Carregando vídeo...</span>
            )}
            {videoError && (
              <span className="px-6 text-center text-sm text-red-200">{videoError}</span>
            )}
            {videoSrc && (
              <video
                ref={videoRef}
                src={videoSrc}
                controls
                className="h-full w-full"
                playsInline
              />
            )}
          </div>
        )}

        {lesson.hasText && (
          <div className="ui-card mx-auto mb-8 w-full max-w-4xl p-8">
            <div className="mb-6 flex items-center justify-between gap-4">
              <h2>Conteúdo da Aula</h2>
              {pdfUrl && (
                <a
                  href={`${pdfUrl}?token=${token}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-md"
                >
                  <FileText size={16} /> Baixar PDF
                </a>
              )}
            </div>
            <div
              className="prose prose-lg max-w-none space-y-4 text-brand-text"
              dangerouslySetInnerHTML={{ __html: lesson.contentHtml ?? '' }}
            />
          </div>
        )}

        <div className="mt-auto flex items-center justify-between border-t border-brand-border pt-6">
          <ButtonLink href={`/dashboard/courses/${courseId}`} variant="ghost">
            Voltar ao curso
          </ButtonLink>
          {lessonProgress?.lessonCompleted && (
            <Badge tone="completed" className="inline-flex items-center gap-2">
              <CheckCircle2 size={16} />
              Aula concluída
            </Badge>
          )}
        </div>
      </main>
    </div>
  )
}
