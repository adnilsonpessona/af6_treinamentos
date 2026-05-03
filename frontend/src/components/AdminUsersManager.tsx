'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import AdminCreateSection from '@/components/AdminCreateSection'
import AdminDangerButton from '@/components/AdminDangerButton'
import AdminEditActions from '@/components/AdminEditActions'
import AdminFeedbackAlert from '@/components/AdminFeedbackAlert'
import AdminFilterSummary from '@/components/AdminFilterSummary'
import AdminInlineConfirm from '@/components/AdminInlineConfirm'
import AdminOverview from '@/components/AdminOverview'
import AdminPagination from '@/components/AdminPagination'
import AdminSearchField from '@/components/AdminSearchField'
import AdminTableEmptyRow from '@/components/AdminTableEmptyRow'
import AdminTableHeadCell from '@/components/AdminTableHeadCell'
import AdminToolbar from '@/components/AdminToolbar'
import ToggleSwitch from '@/components/ToggleSwitch'
import { ArrowUpDown, ArrowUp, ArrowDown, X, Check, Pencil, Mail, SlidersHorizontal, Users } from 'lucide-react'

type UserItem = {
  id: string
  fullName: string
  email: string
  companyId?: string | null
  companyName?: string | null
  department: string
  jobTitle: string
  role: string | number
  status: string | number
  createdAt: string
}

type Props = {
  token: string
  initialUsers: UserItem[]
  companies: { id: string; nomeFantasia: string }[]
}

type CreateForm = {
  fullName: string
  email: string
  cpf: string
  companyId: string
  department: string
  jobTitle: string
  role: number
}

type EditForm = {
  fullName: string
  email: string
  companyId: string
  department: string
  jobTitle: string
  role: number
}

const ROLE_OPTIONS = [
  { label: 'Administrador', value: 1 },
  { label: 'Gestor', value: 2 },
  { label: 'Instrutor', value: 3 },
  { label: 'Funcionario', value: 4 },
]

function normalizeRole(role: string | number): number {
  if (typeof role === 'number') return role
  const byName: Record<string, number> = {
    Administrador: 1,
    Gestor: 2,
    Instrutor: 3,
    Funcionario: 4,
  }
  return byName[role] ?? 4
}

function roleLabel(role: string | number): string {
  const value = normalizeRole(role)
  return ROLE_OPTIONS.find((r) => r.value === value)?.label ?? String(role)
}

function normalizeStatus(status: string | number): number {
  if (typeof status === 'number') return status
  const byName: Record<string, number> = {
    PendingActivation: 1,
    Active: 2,
    Inactive: 3,
  }
  return byName[status] ?? 1
}

function statusLabel(status: string | number): string {
  const value = normalizeStatus(status)
  if (value === 2) return 'Ativo'
  if (value === 1) return 'Pendente'
  return 'Inativo'
}

function statusClasses(status: string | number): string {
  const value = normalizeStatus(status)
  if (value === 2) return 'ui-badge-success'
  if (value === 1) return 'ui-badge-warning'
  return 'ui-badge-danger'
}

function roleClasses(role: string | number): string {
  const value = normalizeRole(role)
  if (value === 1) return 'ui-badge-info'
  if (value === 2) return 'ui-badge-warning'
  if (value === 3) return 'ui-badge-success'
  return 'ui-badge-neutral'
}

export default function AdminUsersManager({ token, initialUsers, companies }: Props) {
  const router = useRouter()
  const [users, setUsers] = useState<UserItem[]>(initialUsers)
  const [query, setQuery] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('')
  const [roleFilter, setRoleFilter] = useState<number | ''>('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingForm, setEditingForm] = useState<EditForm | null>(null)
  const [createForm, setCreateForm] = useState<CreateForm>({
    fullName: '',
    email: '',
    cpf: '',
    companyId: '',
    department: '',
    jobTitle: '',
    role: 4,
  })
  const [showCreate, setShowCreate] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [sortField, setSortField] = useState<'fullName' | 'email' | 'department' | 'role' | 'status'>('fullName')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const PAGE_SIZE = 10

  function clearMessages() {
    setError(null)
    setSuccess(null)
  }

  async function refreshUsers() {
    const refreshed = await api.users.list(token)
    setUsers(refreshed)
    router.refresh()
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    clearMessages()
    setCreating(true)
    try {
      if (createForm.role === 4 && !createForm.companyId) {
        throw new Error('Funcionário deve estar vinculado a uma empresa.')
      }

      await api.users.create(token, {
        ...createForm,
        companyId: createForm.companyId || null,
      })
      await refreshUsers()
      setCreateForm({
        fullName: '',
        email: '',
        cpf: '',
        companyId: '',
        department: '',
        jobTitle: '',
        role: 4,
      })
      setShowCreate(false)
      setSuccess('Usuário criado com sucesso. Link de ativação enviado por e-mail.')
    } catch (err: any) {
      setError(err?.message ?? 'Falha ao criar usuário.')
    } finally {
      setCreating(false)
    }
  }

  function startEdit(user: UserItem) {
    clearMessages()
    setEditingId(user.id)
    setEditingForm({
      fullName: user.fullName,
      email: user.email,
      companyId: user.companyId ?? '',
      department: user.department,
      jobTitle: user.jobTitle,
      role: normalizeRole(user.role),
    })
  }

  async function saveEdit() {
    if (!editingId || !editingForm) return
    clearMessages()
    setBusyId(editingId)
    try {
      if (editingForm.role === 4 && !editingForm.companyId) {
        throw new Error('Funcionário deve estar vinculado a uma empresa.')
      }

      await api.users.update(token, editingId, {
        ...editingForm,
        companyId: editingForm.companyId || null,
      })
      await refreshUsers()
      setEditingId(null)
      setEditingForm(null)
      setSuccess('Usuário atualizado com sucesso.')
    } catch (err: any) {
      setError(err?.message ?? 'Falha ao atualizar usuário.')
    } finally {
      setBusyId(null)
    }
  }

  async function toggleUserStatus(user: UserItem) {
    clearMessages()
    setBusyId(user.id)
    try {
      if (normalizeStatus(user.status) === 2) {
        await api.users.deactivate(token, user.id)
        setSuccess('Usuário desativado com sucesso.')
      } else {
        await api.users.activate(token, user.id)
        setSuccess('Usuário ativado com sucesso.')
      }
      await refreshUsers()
    } catch (err: any) {
      setError(err?.message ?? 'Falha ao alterar status do usuário.')
    } finally {
      setBusyId(null)
    }
  }

  async function resendActivation(userId: string) {
    clearMessages()
    setBusyId(userId)
    try {
      await api.users.resendActivation(token, userId)
      setSuccess('E-mail de ativação reenviado com sucesso.')
    } catch (err: any) {
      setError(err?.message ?? 'Falha ao reenviar e-mail de ativação.')
    } finally {
      setBusyId(null)
    }
  }

  async function deleteUser(userId: string) {
    clearMessages()
    setBusyId(userId)
    try {
      await api.users.delete(token, userId)
      setUsers(prev => prev.filter(u => u.id !== userId))
      setDeleteConfirmId(null)
      setSuccess('Usuário excluído com sucesso.')
    } catch (err: any) {
      setDeleteConfirmId(null)
      const message = String(err?.message ?? '')
      if (
        message.includes('sessões de login') ||
        message.includes('progresso em vídeos') ||
        message.includes('acessos a aulas') ||
        message.includes('conclusões de curso')
      ) {
        setError(`Exclusão bloqueada: ${message}`)
      } else {
        setError(message || 'Falha ao excluir usuário.')
      }
    } finally {
      setBusyId(null)
    }
  }

  const departments = useMemo(() => {
    return [...new Set(users.map((u) => u.department).filter(Boolean))].sort((a, b) => a.localeCompare(b))
  }, [users])

  function toggleSort(field: 'fullName' | 'email' | 'department' | 'role' | 'status') {
    if (field === sortField) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDir('asc')
    }
    setCurrentPage(1)
  }

  function sortIcon(field: string) {
    if (field !== sortField) return <ArrowUpDown size={12} className="inline ml-1 opacity-30" />
    return sortDir === 'asc' ? <ArrowUp size={12} className="inline ml-1 text-brand-primary" /> : <ArrowDown size={12} className="inline ml-1 text-brand-primary" />
  }

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase()
    return users
      .filter((u) => !departmentFilter || u.department === departmentFilter)
      .filter((u) => !roleFilter || normalizeRole(u.role) === roleFilter)
      .filter((u) => {
        if (!q) return true
        return (
          u.fullName.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.department.toLowerCase().includes(q)
        )
      })
      .sort((a, b) => {
        let cmp = 0
        if (sortField === 'fullName') cmp = a.fullName.localeCompare(b.fullName)
        else if (sortField === 'email') cmp = a.email.localeCompare(b.email)
        else if (sortField === 'department') cmp = a.department.localeCompare(b.department)
        else if (sortField === 'role') cmp = normalizeRole(a.role) - normalizeRole(b.role)
        else if (sortField === 'status') cmp = normalizeStatus(a.status) - normalizeStatus(b.status)
        return sortDir === 'asc' ? cmp : -cmp
      })
  }, [users, query, departmentFilter, roleFilter, sortField, sortDir])

  const totalPages = Math.ceil(filteredUsers.length / PAGE_SIZE)
  const paginatedUsers = useMemo(
    () => filteredUsers.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filteredUsers, currentPage]
  )

  useEffect(() => {
    const maxPage = Math.max(1, totalPages)
    if (currentPage > maxPage) {
      setCurrentPage(maxPage)
    }
  }, [currentPage, totalPages])

  return (
    <div className="space-y-5">
      <AdminOverview
        badge="Administração de acesso"
        title="Operação central de usuários"
        description="Controle cadastro, ativação, papéis e vínculo organizacional com uma leitura mais rápida da base ativa."
        stats={[
          { label: 'Usuários', value: users.length },
          { label: 'Ativos', value: users.filter((user) => normalizeStatus(user.status) === 2).length, toneClassName: 'text-brand-success' },
          { label: 'Pendentes', value: users.filter((user) => normalizeStatus(user.status) === 1).length, toneClassName: 'text-brand-warning' },
        ]}
      />

      <AdminToolbar
        expanded={showCreate}
        openLabel="Novo usuário"
        onToggle={() => { clearMessages(); setShowCreate((prev) => !prev) }}
      >
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between flex-1">
          <div className="grid flex-1 gap-3 md:grid-cols-[minmax(0,1.6fr)_minmax(220px,0.8fr)_minmax(220px,0.8fr)]">
            <AdminSearchField
              id="search-users"
              name="search-users"
              label="Busca"
              value={query}
              onChange={(value) => { setQuery(value); setCurrentPage(1) }}
              placeholder="Buscar por nome, e-mail ou departamento"
            />
            <div>
              <label htmlFor="filter-department" className="ui-label">Departamento</label>
              <select
                id="filter-department"
                name="filter-department"
                value={departmentFilter}
                onChange={(e) => { setDepartmentFilter(e.target.value); setCurrentPage(1) }}
                className="ui-input"
              >
                <option value="">Todos departamentos</option>
                {departments.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="filter-role" className="ui-label">Perfil</label>
              <select
                id="filter-role"
                name="filter-role"
                value={roleFilter}
                onChange={(e) => { setRoleFilter(e.target.value ? Number(e.target.value) : ''); setCurrentPage(1) }}
                className="ui-input"
              >
                <option value="">Todos perfis</option>
                {ROLE_OPTIONS.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex rounded-full border border-brand-border/70 bg-brand-light px-3 py-2">
              <AdminFilterSummary icon={<SlidersHorizontal size={15} />} text={`${filteredUsers.length} resultado(s)`} />
            </div>
          </div>
        </div>
      </AdminToolbar>

      {showCreate && (
        <form onSubmit={handleCreate}>
          <AdminCreateSection
            eyebrow="Cadastro"
            title="Adicionar novo usuário"
            description="Preencha os dados principais e defina o papel inicial de acesso."
            icon={<Users size={22} />}
          >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div>
              <label className="ui-label">Nome completo</label>
              <input id="create-fullName" name="create-fullName" type="text" required value={createForm.fullName} onChange={(e) => setCreateForm((p) => ({ ...p, fullName: e.target.value }))} className="ui-input" />
            </div>
            <div>
              <label className="ui-label">E-mail</label>
              <input id="create-email" name="create-email" type="email" required value={createForm.email} onChange={(e) => setCreateForm((p) => ({ ...p, email: e.target.value }))} className="ui-input" />
            </div>
            <div>
              <label className="ui-label">CPF (somente números)</label>
              <input id="create-cpf" name="create-cpf" type="text" required value={createForm.cpf} onChange={(e) => setCreateForm((p) => ({ ...p, cpf: e.target.value }))} className="ui-input" />
            </div>
            <div>
              <label className="ui-label">Empresa</label>
              <select id="create-companyId" name="create-companyId" value={createForm.companyId} onChange={(e) => setCreateForm((p) => ({ ...p, companyId: e.target.value }))} className="ui-input">
                <option value="">Sem empresa</option>
                {companies.map((c) => <option key={c.id} value={c.id}>{c.nomeFantasia}</option>)}
              </select>
            </div>
            <div>
              <label className="ui-label">Departamento</label>
              <input id="create-department" name="create-department" type="text" required value={createForm.department} onChange={(e) => setCreateForm((p) => ({ ...p, department: e.target.value }))} className="ui-input" />
            </div>
            <div>
              <label className="ui-label">Cargo</label>
              <input id="create-jobTitle" name="create-jobTitle" type="text" required value={createForm.jobTitle} onChange={(e) => setCreateForm((p) => ({ ...p, jobTitle: e.target.value }))} className="ui-input" />
            </div>
            <div>
              <label className="ui-label">Perfil</label>
              <select id="create-role" name="create-role" value={createForm.role} onChange={(e) => setCreateForm((p) => ({ ...p, role: Number(e.target.value) }))} className="ui-input">
                {ROLE_OPTIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
          </div>
          <div className="mt-5 flex justify-end">
            <button type="submit" disabled={creating} className="ui-button-primary disabled:opacity-60">
              <Check size={15} /> {creating ? 'Salvando...' : 'Criar usuário'}
            </button>
          </div>
          </AdminCreateSection>
        </form>
      )}

      {error && <AdminFeedbackAlert tone="error">{error}</AdminFeedbackAlert>}
      {success && <AdminFeedbackAlert tone="success">{success}</AdminFeedbackAlert>}

      <div className="ui-table-shell">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-brand-border/60 bg-brand-light text-[11px] font-bold uppercase tracking-[0.14em] text-brand-text-muted">
              <tr>
                <AdminTableHeadCell sortable onClick={() => toggleSort('fullName')}><span className="flex items-center gap-1">Nome {sortIcon('fullName')}</span></AdminTableHeadCell>
                <AdminTableHeadCell sortable onClick={() => toggleSort('email')}><span className="flex items-center gap-1">E-mail {sortIcon('email')}</span></AdminTableHeadCell>
                <AdminTableHeadCell>Empresa</AdminTableHeadCell>
                <AdminTableHeadCell sortable onClick={() => toggleSort('department')}><span className="flex items-center gap-1">Departamento {sortIcon('department')}</span></AdminTableHeadCell>
                <AdminTableHeadCell>Cargo</AdminTableHeadCell>
                <AdminTableHeadCell sortable onClick={() => toggleSort('role')}><span className="flex items-center gap-1">Perfil {sortIcon('role')}</span></AdminTableHeadCell>
                <AdminTableHeadCell sortable onClick={() => toggleSort('status')}><span className="flex items-center gap-1">Ativo {sortIcon('status')}</span></AdminTableHeadCell>
                <AdminTableHeadCell align="right">Ações</AdminTableHeadCell>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/45 bg-white/70">
              {paginatedUsers.map((user) => (
                <tr key={user.id} className="transition-colors hover:bg-brand-light/75">
                  <td className="px-4 py-3 font-medium text-brand-text">
                    {editingId === user.id && editingForm ? (
                      <input id={`edit-name-${user.id}`} name={`edit-name-${user.id}`} value={editingForm.fullName} onChange={(e) => setEditingForm({ ...editingForm, fullName: e.target.value })} className="ui-input min-h-0 px-3 py-2 text-sm" />
                    ) : user.fullName}
                  </td>
                  <td className="px-4 py-3 text-xs text-brand-text-muted">
                    {editingId === user.id && editingForm ? (
                      <input id={`edit-email-${user.id}`} name={`edit-email-${user.id}`} value={editingForm.email} onChange={(e) => setEditingForm({ ...editingForm, email: e.target.value })} className="ui-input min-h-0 px-3 py-2 text-sm" />
                    ) : user.email}
                  </td>
                  <td className="px-4 py-3 text-xs text-brand-text-muted">
                    {editingId === user.id && editingForm ? (
                      <select id={`edit-company-${user.id}`} name={`edit-company-${user.id}`} value={editingForm.companyId} onChange={(e) => setEditingForm({ ...editingForm, companyId: e.target.value })} className="ui-input min-h-0 px-3 py-2 text-sm">
                        <option value="">Sem empresa</option>
                        {companies.map((c) => <option key={c.id} value={c.id}>{c.nomeFantasia}</option>)}
                      </select>
                    ) : (user.companyName ?? <span className="italic text-brand-text-muted/75">—</span>)}
                  </td>
                  <td className="px-4 py-3 text-brand-text-muted">
                    {editingId === user.id && editingForm ? (
                      <input id={`edit-dept-${user.id}`} name={`edit-dept-${user.id}`} value={editingForm.department} onChange={(e) => setEditingForm({ ...editingForm, department: e.target.value })} className="ui-input min-h-0 px-3 py-2 text-sm" />
                    ) : user.department}
                  </td>
                  <td className="px-4 py-3 text-xs text-brand-text-muted">
                    {editingId === user.id && editingForm ? (
                      <input id={`edit-job-${user.id}`} name={`edit-job-${user.id}`} value={editingForm.jobTitle} onChange={(e) => setEditingForm({ ...editingForm, jobTitle: e.target.value })} className="ui-input min-h-0 px-3 py-2 text-sm" />
                    ) : user.jobTitle}
                  </td>
                  <td className="px-4 py-3">
                    {editingId === user.id && editingForm ? (
                      <select id={`edit-role-${user.id}`} name={`edit-role-${user.id}`} value={editingForm.role} onChange={(e) => setEditingForm({ ...editingForm, role: Number(e.target.value) })} className="ui-input min-h-0 w-auto px-3 py-2 text-sm">
                        {ROLE_OPTIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                      </select>
                    ) : (
                      <span className={`ui-badge ${roleClasses(user.role)}`}>{roleLabel(user.role)}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <ToggleSwitch
                        checked={normalizeStatus(user.status) === 2}
                        onChange={() => toggleUserStatus(user)}
                        disabled={busyId === user.id}
                        size="sm"
                      />
                      <span className={`ui-badge ${statusClasses(user.status)}`}>{statusLabel(user.status)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1.5 flex-wrap">
                      {editingId === user.id ? (
                        <>
                          <AdminEditActions onSave={saveEdit} onCancel={() => { setEditingId(null); setEditingForm(null) }} saveDisabled={busyId === user.id || !editingForm} />
                        </>
                      ) : (
                        <>
                          <button type="button" onClick={() => startEdit(user)} disabled={busyId === user.id} className="ui-button-secondary min-h-0 px-3 py-2 text-xs"><Pencil size={13} /> Editar</button>
                          {normalizeStatus(user.status) === 1 && (
                            <button type="button" onClick={() => resendActivation(user.id)} disabled={busyId === user.id} className="ui-button-ghost min-h-0 border border-brand-border/70 px-3 py-2 text-xs disabled:opacity-60"><Mail size={13} /> Reenviar</button>
                          )}
                          {deleteConfirmId === user.id ? (
                            <AdminInlineConfirm message="Confirmar exclusão?" onConfirm={() => deleteUser(user.id)} onCancel={() => setDeleteConfirmId(null)} confirmDisabled={busyId === user.id} />
                          ) : (
                            <AdminDangerButton onClick={() => setDeleteConfirmId(user.id)} disabled={busyId === user.id}><X size={13} /> Excluir</AdminDangerButton>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <AdminTableEmptyRow colSpan={8} message="Nenhum usuário encontrado." />
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AdminPagination
        current={currentPage}
        total={totalPages}
        onChange={setCurrentPage}
        count={filteredUsers.length}
        label={`usuário${filteredUsers.length !== 1 ? 's' : ''}`}
      />
    </div>
  )
}
