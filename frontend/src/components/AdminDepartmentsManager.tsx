'use client'

import { useState } from 'react'
import { api } from '@/lib/api'
import AdminCreateSection from '@/components/AdminCreateSection'
import AdminDangerButton from '@/components/AdminDangerButton'
import AdminEditActions from '@/components/AdminEditActions'
import AdminFeedbackAlert from '@/components/AdminFeedbackAlert'
import AdminInlineConfirm from '@/components/AdminInlineConfirm'
import AdminOverview from '@/components/AdminOverview'
import AdminTableEmptyRow from '@/components/AdminTableEmptyRow'
import AdminTableHeadCell from '@/components/AdminTableHeadCell'
import { Department } from '@/types'
import ToggleSwitch from '@/components/ToggleSwitch'
import { Building2, Pencil, Plus, Trash2 } from 'lucide-react'

interface Props {
  token: string
  initialDepartments: Department[]
}

export default function AdminDepartmentsManager({ token, initialDepartments }: Props) {
  const [departments, setDepartments] = useState<Department[]>(initialDepartments)
  const [newName, setNewName] = useState('')
  const [editId, setEditId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const refresh = async () => {
    try {
      const data = await api.departments.list(token, false)
      setDepartments(data)
    } catch {}
  }

  const handleCreate = async () => {
    if (!newName.trim()) return
    setLoading(true)
    setError('')
    try {
      await api.departments.create(token, { name: newName.trim() })
      setNewName('')
      await refresh()
    } catch (e: any) {
      setError(e.message ?? 'Erro ao criar departamento')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (id: string) => {
    if (!editName.trim()) return
    setLoading(true)
    setError('')
    try {
      await api.departments.update(token, id, { name: editName.trim() })
      setEditId(null)
      await refresh()
    } catch (e: any) {
      setError(e.message ?? 'Erro ao atualizar departamento')
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = async (dept: Department) => {
    try {
      if (dept.isActive) {
        await api.departments.deactivate(token, dept.id)
      } else {
        await api.departments.activate(token, dept.id)
      }
      await refresh()
    } catch (e: any) {
      setError(e.message ?? 'Erro ao alterar status')
    }
  }

  const handleDelete = async (id: string) => {
    setLoading(true)
    setError('')
    try {
      await api.departments.delete(token, id)
      setDeleteConfirmId(null)
      await refresh()
    } catch (e: any) {
      setError(e.message ?? 'Erro ao excluir departamento')
    } finally {
      setLoading(false)
    }
  }

  const activeCount = departments.filter((department) => department.isActive).length
  const inactiveCount = departments.length - activeCount

  return (
    <div className="space-y-6">
      <AdminOverview
        badge="Estrutura organizacional"
        title="Base de departamentos"
        description="Mantenha a divisão interna da operação alinhada com usuários, relatórios e regras de visibilidade do catálogo."
        stats={[
          { label: 'Departamentos', value: departments.length },
          { label: 'Ativos', value: activeCount, toneClassName: 'text-brand-success' },
          { label: 'Inativos', value: inactiveCount, toneClassName: 'text-brand-danger' },
        ]}
      />

      {error && <AdminFeedbackAlert tone="error">{error}</AdminFeedbackAlert>}

      {/* Create form */}
      <AdminCreateSection
        eyebrow="Cadastro"
        title="Novo departamento"
        description="Defina áreas organizacionais usadas para segmentar pessoas, cursos e relatórios."
        icon={<Building2 size={22} />}
      >
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="flex-1">
            <label className="ui-label">Nome do departamento</label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                id="new-department-name"
                name="new-department-name"
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
                placeholder="Ex.: Comercial, Pós-venda, Operações"
                className="ui-input flex-1"
              />
              <button
                onClick={handleCreate}
                disabled={loading || !newName.trim()}
                className="ui-button-primary disabled:opacity-50"
              >
                <Plus size={15} />
                Adicionar
              </button>
            </div>
          </div>
          <div className="ui-card-muted px-4 py-3 xl:max-w-xs">
            <p className="text-[0.72rem] font-bold uppercase tracking-[0.14em] text-brand-text-muted">Uso sugerido</p>
            <p className="mt-2 text-sm leading-6 text-brand-text-muted">Prefira nomes curtos e consistentes para facilitar filtros e leitura em relatórios.</p>
          </div>
        </div>
      </AdminCreateSection>

      {/* Table */}
      <div className="ui-table-shell">
        <table className="w-full text-sm">
          <thead className="border-b border-brand-border/60 bg-brand-light">
            <tr>
              <AdminTableHeadCell className="px-5">Nome</AdminTableHeadCell>
              <AdminTableHeadCell align="center" className="px-5">Ativo</AdminTableHeadCell>
              <AdminTableHeadCell className="px-5">Criado em</AdminTableHeadCell>
              <AdminTableHeadCell className="px-5"></AdminTableHeadCell>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border/45 bg-white/70">
            {departments.length === 0 && (
              <AdminTableEmptyRow colSpan={4} message="Nenhum departamento cadastrado." className="px-5" />
            )}
            {departments.map(dept => (
              <tr key={dept.id} className="transition-colors hover:bg-brand-light/75">
                <td className="px-5 py-3">
                  {editId === dept.id ? (
                    <div className="flex gap-2">
                      <input
                        id={`department-edit-name-${dept.id}`}
                        name={`department-edit-name-${dept.id}`}
                        type="text"
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleUpdate(dept.id)}
                        className="ui-input min-h-0 px-3 py-2 text-sm"
                        autoFocus
                      />
                      <AdminEditActions onSave={() => handleUpdate(dept.id)} onCancel={() => setEditId(null)} />
                    </div>
                  ) : (
                    <span className="font-medium text-brand-text">{dept.name}</span>
                  )}
                </td>
                <td className="px-5 py-3 text-center">
                  <div className="flex justify-center gap-2">
                    <ToggleSwitch
                      checked={dept.isActive}
                      onChange={() => handleToggle(dept)}
                      size="sm"
                    />
                    <span className={`ui-badge ${dept.isActive ? 'ui-badge-success' : 'ui-badge-danger'}`}>
                      {dept.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-3 text-brand-text-muted">
                  {new Date(dept.createdAt).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-5 py-3">
                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={() => { setEditId(dept.id); setEditName(dept.name) }}
                      className="ui-button-secondary min-h-0 px-3 py-2 text-xs"
                    >
                      <Pencil size={13} />
                      Editar
                    </button>
                    {deleteConfirmId === dept.id ? (
                      <AdminInlineConfirm message="Confirmar?" onConfirm={() => handleDelete(dept.id)} onCancel={() => setDeleteConfirmId(null)} />
                    ) : (
                      <AdminDangerButton onClick={() => setDeleteConfirmId(dept.id)}>
                        <Trash2 size={13} />
                        Excluir
                      </AdminDangerButton>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
