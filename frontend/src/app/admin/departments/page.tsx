import { cookies } from 'next/headers'
import { api } from '@/lib/api'
import AdminDepartmentsManager from '@/components/AdminDepartmentsManager'
import PageHeader from '@/components/PageHeader'

export default async function AdminDepartmentsPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value ?? ''

  let departments: any[] = []
  try {
    departments = await api.departments.list(token, false)
  } catch {
    departments = []
  }

  return (
    <div>
      <PageHeader eyebrow="Administração" title="Departamentos" description="Gerencie as áreas organizacionais usadas para estruturar visibilidade, vínculos e relatórios." />
      <AdminDepartmentsManager token={token} initialDepartments={departments} />
    </div>
  )
}
