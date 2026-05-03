'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import AdminCreateSection from '@/components/AdminCreateSection'
import AdminEditActions from '@/components/AdminEditActions'
import AdminFeedbackAlert from '@/components/AdminFeedbackAlert'
import AdminFilterSummary from '@/components/AdminFilterSummary'
import AdminOverview from '@/components/AdminOverview'
import AdminTableEmptyRow from '@/components/AdminTableEmptyRow'
import AdminTableHeadCell from '@/components/AdminTableHeadCell'
import AdminToolbar from '@/components/AdminToolbar'
import ToggleSwitch from '@/components/ToggleSwitch'
import { ArrowDown, ArrowUp, ArrowUpDown, Check, Pencil, Search, X } from 'lucide-react'

type CompanyItem = {
  id: string
  empresa: number
  revenda: number
  razaoSocial: string
  nomeFantasia: string
  cnpj: string
  isActive: boolean
  createdAt: string
}

type Props = {
  token: string
  initialCompanies: CompanyItem[]
}

type CompanyForm = {
  empresa: number
  revenda: number
  razaoSocial: string
  nomeFantasia: string
  cnpj: string
}

type SortField = 'empresa' | 'revenda' | 'razaoSocial' | 'nomeFantasia' | 'cnpj' | 'isActive'

const EMPTY_FORM: CompanyForm = {
  empresa: 0,
  revenda: 0,
  razaoSocial: '',
  nomeFantasia: '',
  cnpj: '',
}

export default function AdminCompaniesManager({ token, initialCompanies }: Props) {
  const router = useRouter()
  const [companies, setCompanies] = useState<CompanyItem[]>(initialCompanies)
  const [showCreate, setShowCreate] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [filterEmpresa, setFilterEmpresa] = useState('')
  const [filterRevenda, setFilterRevenda] = useState('')
  const [filterRazao, setFilterRazao] = useState('')
  const [filterFantasia, setFilterFantasia] = useState('')
  const [filterCnpj, setFilterCnpj] = useState('')
  const [filterStatus, setFilterStatus] = useState<'' | 'true' | 'false'>('')

  const [sortField, setSortField] = useState<SortField>('razaoSocial')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const [createForm, setCreateForm] = useState<CompanyForm>(EMPTY_FORM)
  const [editForm, setEditForm] = useState<CompanyForm>(EMPTY_FORM)

  function clearMessages() {
    setError(null)
    setSuccess(null)
  }

  function clearFilters() {
    setFilterEmpresa('')
    setFilterRevenda('')
    setFilterRazao('')
    setFilterFantasia('')
    setFilterCnpj('')
    setFilterStatus('')
  }

  function toggleSort(field: SortField) {
    if (field === sortField) {
      setSortDir((current) => (current === 'asc' ? 'desc' : 'asc'))
      return
    }

    setSortField(field)
    setSortDir('asc')
  }

  async function refresh() {
    const refreshed = await api.companies.list(token, false)
    setCompanies(refreshed)
    router.refresh()
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    clearMessages()
    setSaving(true)

    try {
      await api.companies.create(token, createForm)
      await refresh()
      setCreateForm(EMPTY_FORM)
      setShowCreate(false)
      setSuccess('Empresa criada com sucesso.')
    } catch (err: any) {
      setError(err?.message ?? 'Falha ao criar empresa.')
    } finally {
      setSaving(false)
    }
  }

  function startEdit(company: CompanyItem) {
    clearMessages()
    setEditingId(company.id)
    setEditForm({
      empresa: company.empresa,
      revenda: company.revenda,
      razaoSocial: company.razaoSocial,
      nomeFantasia: company.nomeFantasia,
      cnpj: company.cnpj,
    })
  }

  async function saveEdit(id: string) {
    clearMessages()
    setLoadingId(id)

    try {
      await api.companies.update(token, id, editForm)
      await refresh()
      setEditingId(null)
      setSuccess('Empresa atualizada com sucesso.')
    } catch (err: any) {
      setError(err?.message ?? 'Falha ao atualizar empresa.')
    } finally {
      setLoadingId(null)
    }
  }

  async function toggleStatus(company: CompanyItem) {
    clearMessages()
    setLoadingId(company.id)

    try {
      if (company.isActive) {
        await api.companies.deactivate(token, company.id)
        setSuccess('Empresa desativada.')
      } else {
        await api.companies.activate(token, company.id)
        setSuccess('Empresa ativada.')
      }

      await refresh()
    } catch (err: any) {
      setError(err?.message ?? 'Falha ao alterar status da empresa.')
    } finally {
      setLoadingId(null)
    }
  }

  const filtered = useMemo(() => {
    return companies
      .filter((company) => !filterEmpresa || String(company.empresa).includes(filterEmpresa))
      .filter((company) => !filterRevenda || String(company.revenda).includes(filterRevenda))
      .filter((company) => !filterRazao || company.razaoSocial.toLowerCase().includes(filterRazao.toLowerCase()))
      .filter((company) => !filterFantasia || company.nomeFantasia.toLowerCase().includes(filterFantasia.toLowerCase()))
      .filter((company) => !filterCnpj || company.cnpj.includes(filterCnpj.replace(/\D/g, '')))
      .filter((company) => {
        if (!filterStatus) return true
        return filterStatus === 'true' ? company.isActive : !company.isActive
      })
      .sort((left, right) => {
        let comparison = 0

        if (sortField === 'empresa') comparison = left.empresa - right.empresa
        else if (sortField === 'revenda') comparison = left.revenda - right.revenda
        else if (sortField === 'razaoSocial') comparison = left.razaoSocial.localeCompare(right.razaoSocial)
        else if (sortField === 'nomeFantasia') comparison = left.nomeFantasia.localeCompare(right.nomeFantasia)
        else if (sortField === 'cnpj') comparison = left.cnpj.localeCompare(right.cnpj)
        else if (sortField === 'isActive') comparison = Number(left.isActive) - Number(right.isActive)

        return sortDir === 'asc' ? comparison : -comparison
      })
  }, [companies, filterCnpj, filterEmpresa, filterFantasia, filterRazao, filterRevenda, filterStatus, sortDir, sortField])

  const anyFilter = filterEmpresa || filterRevenda || filterRazao || filterFantasia || filterCnpj || filterStatus
  const activeCount = companies.filter((company) => company.isActive).length
  const inactiveCount = companies.length - activeCount

  return (
    <div className="space-y-5">
      <AdminOverview
        badge="Cadastro corporativo"
        title="Base de empresas"
        description="Organize o cadastro institucional com filtros por códigos, razão social, fantasia e situação operacional."
        stats={[
          { label: 'Empresas', value: companies.length },
          { label: 'Ativas', value: activeCount, toneClassName: 'text-brand-success' },
          { label: 'Inativas', value: inactiveCount, toneClassName: 'text-brand-danger' },
        ]}
      />

      <AdminToolbar
        expanded={showCreate}
        openLabel="Nova empresa"
        onToggle={() => {
          clearMessages()
          setShowCreate((current) => !current)
        }}
      >
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between flex-1">
          <AdminFilterSummary
            icon={<Search size={15} />}
            text={`${filtered.length} empresa${filtered.length !== 1 ? 's' : ''}`}
            onClear={anyFilter ? clearFilters : undefined}
          />
        </div>
      </AdminToolbar>

      {showCreate && (
        <form onSubmit={handleCreate}>
          <AdminCreateSection
            eyebrow="Cadastro"
            title="Adicionar empresa"
            description="Inclua os códigos internos e os identificadores legais para integração com a plataforma."
          >
          <CompanyFields form={createForm} setForm={setCreateForm} />
          <div className="mt-5 flex justify-end">
            <button type="submit" disabled={saving} className="ui-button-primary disabled:opacity-60">
              <Check size={15} /> {saving ? 'Salvando...' : 'Criar empresa'}
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
            <thead>
              <tr className="border-b border-brand-border/60 bg-brand-light">
                <Th label="Emp." field="empresa" sortField={sortField} sortDir={sortDir} onSort={toggleSort} />
                <Th label="Rev." field="revenda" sortField={sortField} sortDir={sortDir} onSort={toggleSort} />
                <Th label="Razão Social" field="razaoSocial" sortField={sortField} sortDir={sortDir} onSort={toggleSort} />
                <Th label="Nome Fantasia" field="nomeFantasia" sortField={sortField} sortDir={sortDir} onSort={toggleSort} />
                <Th label="CNPJ" field="cnpj" sortField={sortField} sortDir={sortDir} onSort={toggleSort} />
                <Th label="Ativo" field="isActive" sortField={sortField} sortDir={sortDir} onSort={toggleSort} />
                <AdminTableHeadCell align="right">Ações</AdminTableHeadCell>
              </tr>
              <tr className="border-b border-brand-border/45 bg-white/70">
                <td className="px-3 py-2">
                  <input value={filterEmpresa} onChange={(e) => setFilterEmpresa(e.target.value)} placeholder="Filtrar..." className="ui-input min-h-0 w-20 px-3 py-2 text-xs" />
                </td>
                <td className="px-3 py-2">
                  <input value={filterRevenda} onChange={(e) => setFilterRevenda(e.target.value)} placeholder="Filtrar..." className="ui-input min-h-0 w-20 px-3 py-2 text-xs" />
                </td>
                <td className="px-3 py-2">
                  <input value={filterRazao} onChange={(e) => setFilterRazao(e.target.value)} placeholder="Filtrar..." className="ui-input min-h-0 w-full px-3 py-2 text-xs" />
                </td>
                <td className="px-3 py-2">
                  <input value={filterFantasia} onChange={(e) => setFilterFantasia(e.target.value)} placeholder="Filtrar..." className="ui-input min-h-0 w-full px-3 py-2 text-xs" />
                </td>
                <td className="px-3 py-2">
                  <input value={filterCnpj} onChange={(e) => setFilterCnpj(e.target.value.replace(/\D/g, ''))} placeholder="Filtrar..." className="ui-input min-h-0 w-36 px-3 py-2 text-xs" />
                </td>
                <td className="px-3 py-2">
                  <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as '' | 'true' | 'false')} className="ui-input min-h-0 w-auto px-3 py-2 text-xs">
                    <option value="">Todos</option>
                    <option value="true">Ativo</option>
                    <option value="false">Inativo</option>
                  </select>
                </td>
                <td />
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/45 bg-white/70">
              {filtered.length === 0 && (
                <AdminTableEmptyRow colSpan={7} message="Nenhuma empresa encontrada." className="text-sm" />
              )}
              {filtered.map((company) => (
                <tr key={company.id} className="transition-colors hover:bg-brand-light/75">
                  <td className="px-4 py-3 font-mono text-xs text-brand-text">
                    {editingId === company.id ? (
                      <input
                        value={editForm.empresa}
                        type="number"
                        onChange={(e) => setEditForm((current) => ({ ...current, empresa: Number(e.target.value) }))}
                        className="ui-input min-h-0 w-24 px-3 py-2 text-sm"
                      />
                    ) : company.empresa}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-brand-text">
                    {editingId === company.id ? (
                      <input
                        value={editForm.revenda}
                        type="number"
                        onChange={(e) => setEditForm((current) => ({ ...current, revenda: Number(e.target.value) }))}
                        className="ui-input min-h-0 w-24 px-3 py-2 text-sm"
                      />
                    ) : company.revenda}
                  </td>
                  <td className="px-4 py-3 font-medium text-brand-text">
                    {editingId === company.id ? (
                      <input
                        value={editForm.razaoSocial}
                        onChange={(e) => setEditForm((current) => ({ ...current, razaoSocial: e.target.value }))}
                        className="ui-input min-h-0 px-3 py-2 text-sm"
                      />
                    ) : company.razaoSocial}
                  </td>
                  <td className="px-4 py-3 text-brand-text-muted">
                    {editingId === company.id ? (
                      <input
                        value={editForm.nomeFantasia}
                        onChange={(e) => setEditForm((current) => ({ ...current, nomeFantasia: e.target.value }))}
                        className="ui-input min-h-0 px-3 py-2 text-sm"
                      />
                    ) : company.nomeFantasia}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-brand-text-muted">
                    {editingId === company.id ? (
                      <input
                        value={editForm.cnpj}
                        onChange={(e) => setEditForm((current) => ({ ...current, cnpj: e.target.value.replace(/\D/g, '').slice(0, 14) }))}
                        className="ui-input min-h-0 px-3 py-2 text-sm"
                      />
                    ) : company.cnpj}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <ToggleSwitch
                        checked={company.isActive}
                        onChange={() => toggleStatus(company)}
                        disabled={loadingId === company.id}
                        size="sm"
                      />
                      <span className={`ui-badge ${company.isActive ? 'ui-badge-success' : 'ui-badge-danger'}`}>
                        {company.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1.5">
                      {editingId === company.id ? (
                        <>
                          <AdminEditActions onSave={() => saveEdit(company.id)} onCancel={() => setEditingId(null)} saveDisabled={loadingId === company.id} />
                        </>
                      ) : (
                        <button type="button" onClick={() => startEdit(company)} className="ui-button-secondary min-h-0 px-3 py-2 text-xs">
                          <Pencil size={13} /> Editar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function Th({
  label,
  field,
  sortField,
  sortDir,
  onSort,
}: {
  label: string
  field: SortField
  sortField: SortField
  sortDir: 'asc' | 'desc'
  onSort: (field: SortField) => void
}) {
  const active = field === sortField

  return (
    <AdminTableHeadCell sortable onClick={() => onSort(field)}>
      <span className="flex items-center gap-1.5">
        {label}
        {active
          ? sortDir === 'asc'
            ? <ArrowUp size={12} className="text-brand-primary" />
            : <ArrowDown size={12} className="text-brand-primary" />
          : <ArrowUpDown size={12} className="opacity-30" />}
      </span>
    </AdminTableHeadCell>
  )
}

function CompanyFields({
  form,
  setForm,
}: {
  form: CompanyForm
  setForm: React.Dispatch<React.SetStateAction<CompanyForm>>
}) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div>
        <label className="ui-label">Empresa</label>
        <input
          type="number"
          required
          value={form.empresa}
          onChange={(e) => setForm((current) => ({ ...current, empresa: Number(e.target.value) }))}
          className="ui-input"
        />
      </div>
      <div>
        <label className="ui-label">Revenda</label>
        <input
          type="number"
          required
          value={form.revenda}
          onChange={(e) => setForm((current) => ({ ...current, revenda: Number(e.target.value) }))}
          className="ui-input"
        />
      </div>
      <div>
        <label className="ui-label">Razão Social</label>
        <input
          type="text"
          required
          value={form.razaoSocial}
          onChange={(e) => setForm((current) => ({ ...current, razaoSocial: e.target.value }))}
          className="ui-input"
        />
      </div>
      <div>
        <label className="ui-label">Nome Fantasia</label>
        <input
          type="text"
          required
          value={form.nomeFantasia}
          onChange={(e) => setForm((current) => ({ ...current, nomeFantasia: e.target.value }))}
          className="ui-input"
        />
      </div>
      <div className="md:col-span-2">
        <label className="ui-label">CNPJ (somente números)</label>
        <input
          type="text"
          required
          value={form.cnpj}
          maxLength={14}
          onChange={(e) => setForm((current) => ({ ...current, cnpj: e.target.value.replace(/\D/g, '').slice(0, 14) }))}
          className="ui-input"
        />
      </div>
    </div>
  )
}
