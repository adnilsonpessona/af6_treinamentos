'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  House,
  LayoutDashboard,
  BookOpen,
  BarChart3,
  PenSquare,
  Users,
  Building2,
  Tag,
  ClipboardCheck,
  LogOut,
  Menu,
  Layers,
  ChevronRight,
  ChevronDown,
  Search,
  X,
} from 'lucide-react'

interface Props {
  role: string
  fullName: string
}

export default function AppSidebar({ role, fullName }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [adminOpen, setAdminOpen] = useState(true)

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  async function handleLogout() {
    await fetch('/api/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  const primaryItems = [
    { href: '/dashboard', icon: <House size={18} />, label: 'Início' },
    { href: '/dashboard/courses', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
    {
      href: '/reports',
      icon: <BarChart3 size={18} />,
      label: 'Relatórios',
      visible: ['Administrador', 'Gestor', 'Instrutor'].includes(role),
    },
    {
      href: '/instructor/courses',
      icon: <PenSquare size={18} />,
      label: 'Meus Cursos',
      visible: role === 'Instrutor' || role === 'Administrador',
    },
  ].filter((item) => item.visible !== false)

  const secondaryItems = [
    { href: '/dashboard/courses', icon: <BookOpen size={18} />, label: 'Treinamentos' },
  ]

  const adminItems = [
    { href: '/admin/users', label: 'Usuários', icon: <Users size={17} /> },
    { href: '/admin/companies', label: 'Empresas', icon: <Building2 size={17} /> },
    { href: '/admin/departments', label: 'Departamentos', icon: <Layers size={17} /> },
    { href: '/admin/categories', label: 'Categorias', icon: <Tag size={17} /> },
    { href: '/admin/courses', label: 'Aprovações', icon: <ClipboardCheck size={17} /> },
  ]

  const searchValue = search.trim().toLowerCase()
  const filteredPrimaryItems = primaryItems.filter((item) =>
    item.label.toLowerCase().includes(searchValue),
  )
  const filteredSecondaryItems = secondaryItems.filter((item) =>
    item.label.toLowerCase().includes(searchValue),
  )
  const filteredAdminItems = adminItems.filter((item) =>
    item.label.toLowerCase().includes(searchValue),
  )
  const adminActive = filteredAdminItems.some((item) => pathname.startsWith(item.href))
  const showAdminSection =
    role === 'Administrador' && (searchValue.length === 0 || filteredAdminItems.length > 0)

  return (
    <>
      {/* Mobile hamburger */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-30 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#6f46ba] text-white shadow-[0_16px_36px_rgba(96,64,171,0.38)] md:hidden"
        aria-label="Abrir navegação"
      >
        <Menu size={18} />
      </button>

      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-30 bg-slate-950/35 backdrop-blur-[2px] transition-opacity duration-300 md:hidden ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className={[
          'fixed inset-y-0 left-0 z-40 flex flex-col overflow-hidden',
          'bg-[linear-gradient(180deg,#6f46ba_0%,#6a42b4_52%,#653eaf_100%)]',
          'shadow-[12px_0_36px_rgba(85,51,152,0.18)]',
          'transition-all duration-300',
          mobileOpen ? 'translate-x-0' : 'translate-x-[-120%]',
          'w-[min(17rem,calc(100vw-3rem))]',
          'md:sticky md:top-0 md:left-auto md:inset-y-auto md:z-auto',
          'md:translate-x-0 md:shrink-0 md:h-screen',
          collapsed ? 'md:w-20' : 'md:w-61',
        ].join(' ')}
      >
        {/* Logo / Brand */}
        <div
          className={`flex items-center ${
            collapsed ? 'justify-center px-3 py-5' : 'justify-between px-5 py-9'
          }`}
        >
          {!collapsed && (
            <div className="flex min-w-0 items-center gap-3 pr-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black shadow-[0_12px_24px_rgba(0,0,0,0.18)]">
                <div className="grid h-5 w-5 grid-cols-2 gap-0.5 rounded-sm">
                  <span className="rounded-xs bg-[#f6d85c]" />
                  <span className="rounded-xs bg-[#58d1ff]" />
                  <span className="rounded-xs bg-[#6d48ff]" />
                  <span className="rounded-xs bg-[#96e17d]" />
                </div>
              </div>
              <span className="truncate text-[1.05rem] font-medium tracking-tight text-white">
                AF6 Treinamentos
              </span>
            </div>
          )}
          {collapsed && (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black shadow-[0_12px_24px_rgba(0,0,0,0.18)]">
              <span className="text-xs font-bold tracking-[0.18em] text-white">AF6</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setCollapsed((v) => !v)}
              className="hidden shrink-0 rounded-xl p-2 text-white/72 transition-colors hover:bg-white/10 hover:text-white md:inline-flex"
              title={collapsed ? 'Expandir menu' : 'Recolher menu'}
            >
              {collapsed ? <ChevronRight size={16} /> : <Menu size={16} />}
            </button>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="inline-flex shrink-0 rounded-xl p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white md:hidden"
              aria-label="Fechar navegação"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Search */}
        {!collapsed && (
          <div className="px-4 pb-4">
            <label className="relative block">
              <Search
                size={18}
                className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-white/78"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search"
                className="h-10 w-full rounded-xl border border-white/6 bg-white/12 pr-4 pl-11 text-[0.95rem] text-white placeholder:text-white/72 focus:border-white/14 focus:bg-white/16 focus:outline-none"
              />
            </label>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2">
          <div className="space-y-1">
            {filteredPrimaryItems.map((item) => (
              <SidebarLink
                key={item.href + item.label}
                href={item.href}
                pathname={pathname}
                collapsed={collapsed}
                icon={item.icon}
                label={item.label}
              />
            ))}

            {showAdminSection && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setAdminOpen((v) => !v)}
                  className={`flex w-full items-center rounded-xl px-3 py-3 text-left text-[0.96rem] font-medium transition-colors ${
                    collapsed ? 'justify-center' : 'gap-3'
                  } ${
                    adminActive
                      ? 'text-white'
                      : 'text-white/86 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Users size={18} className="shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1">Administração</span>
                      {adminOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </>
                  )}
                </button>

                {!collapsed && adminOpen && (
                  <div className="mt-1 ml-9 space-y-0.5">
                    {filteredAdminItems.map((item) => (
                      <SidebarSubLink
                        key={item.href}
                        href={item.href}
                        pathname={pathname}
                        label={item.label}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </nav>

        {/* User card */}
        {!collapsed && (
          <div className="px-4 py-3">
            <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/7 px-4 py-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20">
                <span className="text-xs font-bold text-white">
                  {fullName
                    .split(' ')
                    .slice(0, 2)
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()}
                </span>
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white" title={fullName}>
                  {fullName}
                </p>
                <p className="text-xs text-white/60">{role}</p>
              </div>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="flex justify-center py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
              <span className="text-xs font-bold text-white">
                {fullName
                  .split(' ')
                  .slice(0, 2)
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()}
              </span>
            </div>
          </div>
        )}

        {/* Footer */}
        <div
          className={`border-t border-white/8 ${
            collapsed ? 'px-2 py-3' : 'px-2 py-3'
          } space-y-1`}
        >
          {filteredSecondaryItems.map((item) => (
            <SidebarLink
              key={item.href + item.label}
              href={item.href}
              pathname={pathname}
              collapsed={collapsed}
              icon={item.icon}
              label={item.label}
            />
          ))}

          <button
            onClick={handleLogout}
            title="Sair"
            className={`flex w-full items-center rounded-xl text-[0.96rem] font-medium text-white/88 transition-colors hover:bg-white/10 hover:text-white ${
              collapsed ? 'justify-center px-3 py-3' : 'gap-3 px-3 py-3'
            }`}
          >
            <LogOut size={18} />
            {!collapsed && <span>Sair</span>}
          </button>
        </div>
      </aside>
    </>
  )
}

// ─── Sub-components ───────────────────────────────────────

function SidebarLink({
  href,
  pathname,
  icon,
  label,
  collapsed,
}: {
  href: string
  pathname: string
  icon: React.ReactNode
  label: string
  collapsed: boolean
}) {
  const isActive =
    pathname === href || (href !== '/dashboard' && pathname.startsWith(href))

  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      className={`flex items-center rounded-xl text-[0.96rem] font-medium transition-all duration-150 ${
        collapsed ? 'justify-center px-3 py-3' : 'gap-3 px-3 py-3'
      } ${
        isActive
          ? 'bg-white text-[#6a42b4] shadow-[0_10px_24px_rgba(255,255,255,0.16)]'
          : 'text-white/88 hover:bg-white/10 hover:text-white'
      }`}
    >
      <span className="shrink-0">{icon}</span>
      {!collapsed && <span className="truncate">{label}</span>}
    </Link>
  )
}

function SidebarSubLink({
  href,
  pathname,
  label,
}: {
  href: string
  pathname: string
  label: string
}) {
  const isActive = pathname === href || pathname.startsWith(href)

  return (
    <Link
      href={href}
      className={`block rounded-lg px-3 py-2.5 text-[0.95rem] transition-colors ${
        isActive ? 'bg-white/12 text-white' : 'text-white/76 hover:bg-white/8 hover:text-white'
      }`}
    >
      {label}
    </Link>
  )
}
