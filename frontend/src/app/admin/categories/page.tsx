import { cookies } from 'next/headers'
import { api } from '@/lib/api'
import AdminCategoriesManager from '@/components/AdminCategoriesManager'
import PageHeader from '@/components/PageHeader'

export default async function AdminCategoriesPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value ?? ''

  let categories: any[] = []
  try {
    categories = await api.categories.list(token, false)
  } catch {
    categories = []
  }

  return (
    <div>
      <PageHeader eyebrow="Administração" title="Categorias" description="Organize o catálogo com uma hierarquia de categorias e subcategorias mais clara para navegação e governança." />
      <AdminCategoriesManager token={token} initialCategories={categories} />
    </div>
  )
}
