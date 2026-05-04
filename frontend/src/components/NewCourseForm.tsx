'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import FeedbackAlert from '@/components/FeedbackAlert'
import SearchableSelect from '@/components/SearchableSelect'

type Category = {
  id: string
  name: string
  parentCategoryId?: string | null
}

type Company = {
  id: string
  nomeFantasia: string
}

type Department = {
  id: string
  name: string
}

interface Props {
  token: string
  categories: Category[]
  companies: Company[]
  departments: Department[]
}

export default function NewCourseForm({ token, categories, companies, departments }: Props) {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [companyId, setCompanyId] = useState(companies[0]?.id ?? '')
  const [department, setDepartment] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [subCategoryId, setSubCategoryId] = useState('')
  const [availableForAllCompanies, setAvailableForAllCompanies] = useState(false)
  const [availableForAllDepartments, setAvailableForAllDepartments] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const rootCategories = useMemo(
    () => categories.filter((c) => !c.parentCategoryId),
    [categories]
  )

  const subCategories = useMemo(
    () => categories.filter((c) => c.parentCategoryId === categoryId),
    [categories, categoryId]
  )

  const companyOptions = companies.map(c => ({ value: c.id, label: c.nomeFantasia }))
  const departmentOptions = departments.map(d => ({ value: d.name, label: d.name }))
  const categoryOptions = rootCategories.map(c => ({ value: c.id, label: c.name }))
  const subCategoryOptions = subCategories.map(c => ({ value: c.id, label: c.name }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !description.trim() || !companyId || !department || !categoryId || !subCategoryId) return
    setError(null)
    setSaving(true)
    try {
      const course = await api.courses.create(token, {
        title,
        description,
        companyId,
        department,
        categoryId,
        subCategoryId,
        availableForAllCompanies,
        availableForAllDepartments,
      }) as { id: string }
      router.push(`/instructor/courses/${course.id}`)
    } catch (err: any) {
      setError(err?.message ?? 'Falha ao criar curso.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="ui-card max-w-3xl space-y-6 p-6 sm:p-8">
      {error && <FeedbackAlert tone="error">{error}</FeedbackAlert>}

      <div>
        <p className="ui-section-title">Novo curso</p>
        <h2 className="mt-2">Estruture o treinamento</h2>
        <p className="mt-2 text-sm leading-6 text-brand-text-muted">
          Defina escopo, público e taxonomia do curso antes de começar a criar as aulas.
        </p>
      </div>

      <div>
        <label htmlFor="course-title" className="ui-label">
          Título <span className="text-red-500">*</span>
        </label>
        <input
          id="course-title"
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="ui-input"
          placeholder="Ex.: Fundamentos de segurança operacional"
        />
      </div>

      <div>
        <label htmlFor="course-description" className="ui-label">
          Descrição <span className="text-red-500">*</span>
        </label>
        <textarea
          id="course-description"
          required
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="ui-textarea"
          placeholder="Resuma objetivo, público e resultado esperado do treinamento."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="ui-label">Empresa <span className="text-red-500">*</span></label>
          <SearchableSelect
            options={companyOptions}
            value={companyId}
            onChange={setCompanyId}
            placeholder="Selecione a empresa"
          />
        </div>

        <div>
          <label className="ui-label">Departamento <span className="text-red-500">*</span></label>
          <SearchableSelect
            options={departmentOptions}
            value={department}
            onChange={(val) => { setDepartment(val); setCategoryId(''); setSubCategoryId('') }}
            placeholder="Selecione o departamento"
          />
        </div>

        <div>
          <label className="ui-label">Categoria <span className="text-red-500">*</span></label>
          <SearchableSelect
            options={categoryOptions}
            value={categoryId}
            onChange={(val) => { setCategoryId(val); setSubCategoryId('') }}
            placeholder="Selecione a categoria"
          />
        </div>

        <div>
          <label className="ui-label">Subcategoria <span className="text-red-500">*</span></label>
          <SearchableSelect
            options={subCategoryOptions}
            value={subCategoryId}
            onChange={setSubCategoryId}
            placeholder={categoryId ? 'Selecione a subcategoria' : 'Selecione uma categoria primeiro'}
          />
        </div>
      </div>

      <div className="ui-card-muted space-y-3 p-4">
        <p className="ui-section-title">Abrangência</p>
        <label className="flex items-center gap-2 text-sm text-brand-text">
          <input id="new-course-all-companies" name="new-course-all-companies" type="checkbox" checked={availableForAllCompanies} onChange={(e) => setAvailableForAllCompanies(e.target.checked)} />
          Disponível para todas as empresas
        </label>
        <label className="flex items-center gap-2 text-sm text-brand-text">
          <input id="new-course-all-departments" name="new-course-all-departments" type="checkbox" checked={availableForAllDepartments} onChange={(e) => setAvailableForAllDepartments(e.target.checked)} />
          Disponível para todos os departamentos
        </label>
      </div>

      <div className="flex flex-wrap gap-3 pt-2">
        <button
          type="submit"
          disabled={saving || !title.trim() || !description.trim() || !companyId || !department || !categoryId || !subCategoryId}
          className="ui-button-primary"
        >
          {saving ? 'Criando...' : 'Criar curso'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/instructor/courses')}
          className="ui-button-secondary"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
