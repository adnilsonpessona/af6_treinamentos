import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { api } from '@/lib/api'
import InstructorCourseEditor from '@/components/InstructorCourseEditor'
import PageHeader from '@/components/PageHeader'

export default async function InstructorCourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value ?? ''

  let course: any = null
  let categories: any[] = []
  let companies: any[] = []

  try {
    ;[course, categories, companies] = await Promise.all([
      api.courses.get(token, id),
      api.categories.list(token, true),
      api.companies.list(token, true),
    ])
  } catch {
    notFound()
  }

  if (!course) notFound()

  return (
    <div>
      <PageHeader eyebrow="Instrutor" title="Gerenciar curso" description="Edite metadados, aulas, thumbnail e status de submissão do treinamento." />
      <InstructorCourseEditor token={token} course={course} categories={categories} companies={companies} />
    </div>
  )
}
