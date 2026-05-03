import { cookies } from 'next/headers'
import { api } from '@/lib/api'
import { notFound } from 'next/navigation'
import LessonViewer from '@/components/LessonViewer'

export default async function LessonPage({
  params,
}: {
  params: Promise<{ id: string; lessonId: string }>
}) {
  const { id, lessonId } = await params
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value ?? ''

  let course: any
  let progress: any = null

  try {
    course = await api.courses.get(token, id)
    progress = await api.progress.getCourseProgress(token, id)
  } catch {
    notFound()
  }

  const lesson = course.lessons?.find((l: any) => l.id === lessonId)
  if (!lesson) notFound()

  const lessonProgress = progress?.lessons?.find((l: any) => l.lessonId === lessonId)
  const pdfUrl = lesson.hasText ? api.courses.downloadPdfUrl(id, lessonId) : null

  return (
    <LessonViewer
      courseId={id}
      lesson={lesson}
      course={course}
      lessonProgress={lessonProgress ?? null}
      pdfUrl={pdfUrl}
      token={token}
    />
  )
}
