import { cookies } from 'next/headers'
import { api } from '@/lib/api'
import AdminUsersManager from '@/components/AdminUsersManager'
import PageHeader from '@/components/PageHeader'

export default async function AdminUsersPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value ?? ''

  let users: any[] = []
  let companies: any[] = []
  try {
    ;[users, companies] = await Promise.all([
      api.users.list(token),
      api.companies.list(token, true),
    ])
  } catch {
    users = []
    companies = []
  }

  return (
    <div>
      <PageHeader eyebrow="Administração" title="Usuários" description="Gerencie acessos, papéis, status e vínculo organizacional dos usuários da plataforma." />
      <AdminUsersManager token={token} initialUsers={users} companies={companies} />
    </div>
  )
}
