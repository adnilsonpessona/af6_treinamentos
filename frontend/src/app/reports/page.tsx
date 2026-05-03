import { cookies } from 'next/headers'
import { api } from '@/lib/api'
import ReportsView from '@/components/ReportsView'
import PageHeader from '@/components/PageHeader'

export default async function ReportsPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value ?? ''
  const role = cookieStore.get('auth_role')?.value ?? ''

  let data: any = null
  try {
    if (role === 'Administrador') data = await api.reports.admin(token)
    else if (role === 'Gestor') data = await api.reports.manager(token)
    else if (role === 'Instrutor') data = await api.reports.instructor(token)
    else data = await api.reports.myProgress(token)
  } catch {
    data = null
  }

  return (
    <div>
      <PageHeader
        eyebrow="Análises"
        title="Relatórios"
        description="Acompanhe adoção, progresso e conclusão dos treinamentos conforme o seu papel na plataforma."
      />
      <ReportsView role={role} data={data} />
    </div>
  )
}

