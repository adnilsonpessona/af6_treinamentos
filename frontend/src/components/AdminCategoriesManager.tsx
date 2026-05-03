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
import { Category } from '@/types'
import ToggleSwitch from '@/components/ToggleSwitch'
import SearchableSelect from '@/components/SearchableSelect'
import { FolderTree, Layers3, Pencil, Plus, Tags, Trash2, X } from 'lucide-react'

interface Props {
  token: string
  initialCategories: Category[]
}

export default function AdminCategoriesManager({ token, initialCategories }: Props) {
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [activeTab, setActiveTab] = useState<'categories' | 'subcategories'>('categories')

  const [newCatName, setNewCatName] = useState('')
  const [newSubName, setNewSubName] = useState('')
  const [newSubParentId, setNewSubParentId] = useState('')

  const [editId, setEditId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editParentId, setEditParentId] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const rootCategories = categories.filter(c => !c.parentCategoryId)
  const subCategories = categories.filter(c => !!c.parentCategoryId)

  const parentOptions = rootCategories.map(c => ({ value: c.id, label: c.name }))
  const activeCount = categories.filter((category) => category.isActive).length

  const refresh = async () => {
    try {
      const data = await api.categories.list(token, false)
      setCategories(data)
    } catch {}
  }

  const handleCreateCategory = async () => {
    if (!newCatName.trim()) return
    setLoading(true); setError('')
    try {
      await api.categories.create(token, { name: newCatName.trim(), parentCategoryId: null })
      setNewCatName('')
      await refresh()
    } catch (e: any) { setError(e.message ?? 'Erro ao criar categoria') }
    finally { setLoading(false) }
  }

  const handleCreateSubcategory = async () => {
    if (!newSubName.trim() || !newSubParentId) return
    setLoading(true); setError('')
    try {
      await api.categories.create(token, { name: newSubName.trim(), parentCategoryId: newSubParentId })
      setNewSubName(''); setNewSubParentId('')
      await refresh()
    } catch (e: any) { setError(e.message ?? 'Erro ao criar subcategoria') }
    finally { setLoading(false) }
  }

  const handleUpdate = async (id: string) => {
    if (!editName.trim()) return
    setLoading(true); setError('')
    try {
      const cat = categories.find(c => c.id === id)
      await api.categories.update(token, id, {
        name: editName.trim(),
        parentCategoryId: cat?.parentCategoryId ? (editParentId || cat.parentCategoryId) : null
      })
      setEditId(null)
      await refresh()
    } catch (e: any) { setError(e.message ?? 'Erro ao atualizar') }
    finally { setLoading(false) }
  }

  const handleToggle = async (cat: Category) => {
    try {
      if (cat.isActive) {
        await api.categories.deactivate(token, cat.id)
      } else {
        await api.categories.activate(token, cat.id)
      }
      await refresh()
    } catch (e: any) { setError(e.message ?? 'Erro ao alterar status') }
  }

  const handleDelete = async (id: string) => {
    setLoading(true); setError('')
    try {
      await api.categories.delete(token, id)
      setDeleteConfirmId(null)
      await refresh()
    } catch (e: any) { setError(e.message ?? 'Erro ao excluir') }
    finally { setLoading(false) }
  }

  const renderTable = (items: Category[], isSubcategory: boolean) => (
    <div className="ui-table-shell">
      <table className="w-full text-sm">
        <thead className="border-b border-brand-border/60 bg-brand-light">
          <tr>
            <AdminTableHeadCell className="px-5">Nome</AdminTableHeadCell>
            {isSubcategory && <AdminTableHeadCell className="px-5">Categoria Pai</AdminTableHeadCell>}
            <AdminTableHeadCell align="center" className="px-5">Ativo</AdminTableHeadCell>
            <AdminTableHeadCell className="px-5">Criado em</AdminTableHeadCell>
            <AdminTableHeadCell className="px-5"></AdminTableHeadCell>
          </tr>
        </thead>
        <tbody className="divide-y divide-brand-border/45 bg-white/70">
          {items.length === 0 && (
            <AdminTableEmptyRow colSpan={isSubcategory ? 5 : 4} message="Nenhum registro encontrado." className="px-5" />
          )}
          {items.map(cat => (
            <tr key={cat.id} className="transition-colors hover:bg-brand-light/75">
              <td className="px-5 py-3">
                {editId === cat.id ? (
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleUpdate(cat.id)}
                      className="ui-input min-h-0 px-3 py-2 text-sm"
                      autoFocus
                    />
                    <AdminEditActions onSave={() => handleUpdate(cat.id)} onCancel={() => setEditId(null)} />
                  </div>
                ) : (
                  <span className="font-medium text-brand-text">{cat.name}</span>
                )}
              </td>
              {isSubcategory && (
                <td className="px-5 py-3 text-brand-text-muted">
                  {editId === cat.id ? (
                    <SearchableSelect
                      options={parentOptions}
                      value={editParentId}
                      onChange={setEditParentId}
                      placeholder="Categoria pai"
                    />
                  ) : (
                    cat.parentCategoryName ?? '—'
                  )}
                </td>
              )}
              <td className="px-5 py-3 text-center">
                <div className="flex justify-center gap-2">
                  <ToggleSwitch checked={cat.isActive} onChange={() => handleToggle(cat)} size="sm" />
                  <span className={`ui-badge ${cat.isActive ? 'ui-badge-success' : 'ui-badge-danger'}`}>
                    {cat.isActive ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </td>
              <td className="px-5 py-3 text-brand-text-muted">
                {new Date(cat.createdAt).toLocaleDateString('pt-BR')}
              </td>
              <td className="px-5 py-3">
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => { setEditId(cat.id); setEditName(cat.name); setEditParentId(cat.parentCategoryId ?? '') }}
                    className="ui-button-secondary min-h-0 px-3 py-2 text-xs"
                  >
                    <Pencil size={13} />
                    Editar
                  </button>
                  {deleteConfirmId === cat.id ? (
                    <AdminInlineConfirm message="Confirmar?" onConfirm={() => handleDelete(cat.id)} onCancel={() => setDeleteConfirmId(null)} />
                  ) : (
                    <AdminDangerButton onClick={() => setDeleteConfirmId(cat.id)}>
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
  )

  return (
    <div className="space-y-6">
      <AdminOverview
        badge="Taxonomia do catálogo"
        title="Categorias e subcategorias"
        description="Estruture a navegação do catálogo com níveis claros, evitando redundância e mantendo o agrupamento editorial consistente."
        stats={[
          { label: 'Total', value: categories.length },
          { label: 'Categorias', value: rootCategories.length },
          { label: 'Ativas', value: activeCount, toneClassName: 'text-brand-success' },
        ]}
      />

      {error && <AdminFeedbackAlert tone="error">{error}</AdminFeedbackAlert>}

      {/* Tabs */}
      <div className="inline-flex w-fit gap-1 rounded-[20px] border border-brand-border/60 bg-[linear-gradient(180deg,rgba(244,248,253,0.98)_0%,rgba(233,240,248,0.92)_100%)] p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
        <button
          onClick={() => setActiveTab('categories')}
          className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors ${activeTab === 'categories' ? 'bg-[linear-gradient(180deg,#ffffff_0%,#f3f8ff_100%)] text-brand-text shadow-[0_12px_24px_rgba(16,31,51,0.08)]' : 'text-brand-text-muted hover:text-brand-text'}`}
        >
          <Tags size={15} />
          Categorias
        </button>
        <button
          onClick={() => setActiveTab('subcategories')}
          className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors ${activeTab === 'subcategories' ? 'bg-[linear-gradient(180deg,#ffffff_0%,#f3f8ff_100%)] text-brand-text shadow-[0_12px_24px_rgba(16,31,51,0.08)]' : 'text-brand-text-muted hover:text-brand-text'}`}
        >
          <Layers3 size={15} />
          Subcategorias
        </button>
      </div>

      {/* Create form */}
      {activeTab === 'categories' && (
        <AdminCreateSection
          eyebrow="Estrutura"
          title="Nova categoria"
          description="Crie a camada principal da taxonomia usada para organizar os cursos."
          icon={<FolderTree size={22} />}
        >
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div className="flex-1">
              <label className="ui-label">Nome da categoria</label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="text"
                  value={newCatName}
                  onChange={e => setNewCatName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCreateCategory()}
                  placeholder="Ex.: Segurança, Atendimento, Operações"
                  className="ui-input flex-1"
                />
                <button
                  onClick={handleCreateCategory}
                  disabled={loading || !newCatName.trim()}
                  className="ui-button-primary disabled:opacity-50"
                >
                  <Plus size={15} />
                  Adicionar
                </button>
              </div>
            </div>
            <div className="ui-card-muted px-4 py-3 xl:max-w-xs">
              <p className="text-[0.72rem] font-bold uppercase tracking-[0.14em] text-brand-text-muted">Boas práticas</p>
              <p className="mt-2 text-sm leading-6 text-brand-text-muted">Evite nomes duplicados entre níveis para manter filtros, cards e navegação previsíveis.</p>
            </div>
          </div>
        </AdminCreateSection>
      )}

      {activeTab === 'subcategories' && (
        <AdminCreateSection
          eyebrow="Estrutura"
          title="Nova subcategoria"
          description="Associe a subcategoria à categoria principal e mantenha a hierarquia limpa."
        >
          <div className="flex flex-col gap-3 xl:flex-row xl:items-start">
            <div className="flex-1">
              <label className="ui-label">Categoria pai</label>
              <SearchableSelect
                options={parentOptions}
                value={newSubParentId}
                onChange={setNewSubParentId}
                placeholder="Selecione a categoria pai"
              />
            </div>
            <div className="flex-1">
              <label className="ui-label">Nome da subcategoria</label>
              <input
                type="text"
                value={newSubName}
                onChange={e => setNewSubName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreateSubcategory()}
                placeholder="Ex.: Onboarding, Pós-venda, Processos"
                className="ui-input flex-1"
              />
            </div>
            <button
              onClick={handleCreateSubcategory}
              disabled={loading || !newSubName.trim() || !newSubParentId}
              className="ui-button-primary disabled:opacity-50"
            >
              <Plus size={15} />
              Adicionar
            </button>
          </div>
        </AdminCreateSection>
      )}

      {activeTab === 'categories' ? renderTable(rootCategories, false) : renderTable(subCategories, true)}
    </div>
  )
}
