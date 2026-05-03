import { cookies } from 'next/headers'
import { api } from '@/lib/api'
import NewCourseForm from '@/components/NewCourseForm'
import PageHeader from '@/components/PageHeader'

export default async function NewCoursePage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value ?? ''

  let categories: any[] = []
  let companies: any[] = []
  let departments: any[] = []
  try {
    ;[categories, companies, departments] = await Promise.all([
      api.categories.list(token, true),
      api.companies.list(token, true),
      api.departments.list(token, true),
    ])
  } catch {
    categories = []
    companies = []
    departments = []
  }

  return (
    <div>
      <PageHeader
        eyebrow="Instrutor"
        title="Novo curso"
        description="Estruture um novo treinamento com escopo, audiência e taxonomia alinhados ao catálogo da plataforma."
      />
      <NewCourseForm token={token} categories={categories} companies={companies} departments={departments} />
    </div>
  )
}
