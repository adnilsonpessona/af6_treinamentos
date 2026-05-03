import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { api } from '@/lib/api'
import LessonForm from '@/components/LessonForm'
import PageHeader from '@/components/PageHeader'

export default async function EditLessonPage({
  params,
}: {
  params: Promise<{ id: string; lessonId: string }>
}) {
  const { id, lessonId } = await params
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value ?? ''

  let course: any = null
  try {
    course = await api.courses.get(token, id)
  } catch {
    notFound()
  }

  if (!course) notFound()

  const lesson = course.lessons?.find((l: any) => l.id === lessonId)
  if (!lesson) notFound()

  return (
    <div>
      <PageHeader eyebrow="Instrutor" title="Editar aula" description={`Curso: ${course.title}`} />
      <LessonForm
        token={token}
        courseId={id}
        nextOrder={lesson.order}
        lesson={{
          id: lesson.id,
          title: lesson.title,
          order: lesson.order,
          type: lesson.type,
          contentHtml: lesson.contentHtml ?? null,
          hasVideo: lesson.hasVideo,
        }}
      />
    </div>
  )
}
