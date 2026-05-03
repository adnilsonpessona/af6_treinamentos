import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { api } from '@/lib/api'
import LessonForm from '@/components/LessonForm'
import PageHeader from '@/components/PageHeader'

export default async function NewLessonPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value ?? ''

  let course: any = null
  try {
    course = await api.courses.get(token, id)
  } catch {
    notFound()
  }

  if (!course) notFound()

  const nextOrder = (course.lessons?.length ?? 0) + 1

  return (
    <div>
      <PageHeader eyebrow="Instrutor" title="Nova aula" description={`Curso: ${course.title}`} />
      <LessonForm token={token} courseId={id} nextOrder={nextOrder} />
    </div>
  )
}
