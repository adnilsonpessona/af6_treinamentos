import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import AppSidebar from '@/components/AppSidebar'
import { decodeCookieValue } from '@/lib/cookies'

export default async function InstructorLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const role = cookieStore.get('auth_role')?.value ?? ''
  const rawName = cookieStore.get('auth_name')?.value ?? ''
  const fullName = decodeCookieValue(rawName)

  if (role !== 'Instrutor' && role !== 'Administrador') {
    redirect('/dashboard')
  }

  return (
    <div className="app-shell flex min-h-screen">
      <AppSidebar role={role} fullName={fullName} />
      <main className="min-w-0 flex-1 overflow-auto">
        <div className="page-shell">
          <div className="page-content">{children}</div>
        </div>
      </main>
    </div>
  )
}
