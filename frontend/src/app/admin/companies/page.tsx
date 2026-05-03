import { cookies } from 'next/headers'
import { api } from '@/lib/api'
import AdminCompaniesManager from '@/components/AdminCompaniesManager'
import PageHeader from '@/components/PageHeader'

export default async function AdminCompaniesPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value ?? ''

  let companies: any[] = []
  try {
    companies = await api.companies.list(token, false)
  } catch {
    companies = []
  }

  return (
    <div>
      <PageHeader eyebrow="Administração" title="Empresas" description="Gerencie o cadastro corporativo utilizado para distribuir treinamentos e organizar a visibilidade dos cursos." />
      <AdminCompaniesManager token={token} initialCompanies={companies} />
    </div>
  )
}
