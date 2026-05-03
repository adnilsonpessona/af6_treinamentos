'use client'

import { useEffect, useMemo, useState } from 'react'
import AdminSearchField from '@/components/AdminSearchField'
import AdminPagination from '@/components/AdminPagination'
import EmptyState from '@/components/EmptyState'

type UserProgressItem = {
  userId: string
  userName: string
  courseId: string
  courseTitle: string
  department?: string
  progressPercentage: number
  isCompleted: boolean
}

type StudentProgressItem = {
  userId: string
  userName: string
  department?: string
  progressPercentage: number
  isCompleted: boolean
}

type CourseReport = {
  courseId: string
  courseTitle: string
  totalStudents: number
  completedStudents: number
  lessonStats: { lessonId: string; lessonTitle: string; totalAccesses: number; completionPercentage: number }[]
  studentProgress: StudentProgressItem[]
}

type PersonalCourse = {
  courseId: string
  courseTitle: string
  categoryName: string
  progressPercentage: number
  isCompleted: boolean
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="ui-stat-card">
      <p className="text-[0.72rem] font-bold uppercase tracking-[0.14em] text-brand-text-muted">{label}</p>
      <p className="mt-3 text-4xl font-bold text-brand-primary">{value}</p>
      <div className="mt-4 h-1 w-16 rounded-full bg-gradient-progress opacity-50" />
    </div>
  )
}

const PAGE_SIZE = 15

// ---- Admin/Gestor progress table ----
function UserProgressTable({
  items,
  showDepartment,
}: {
  items: UserProgressItem[]
  showDepartment: boolean
}) {
  type SortField = 'userName' | 'courseTitle' | 'department' | 'progressPercentage' | 'isCompleted'
  const [sortField, setSortField] = useState<SortField>('userName')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [query, setQuery] = useState('')

  function toggleSort(field: SortField) {
    if (field === sortField) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDir('asc')
    }
    setCurrentPage(1)
  }

  function sortIcon(field: string) {
    if (field !== sortField) return ' ↕'
    return sortDir === 'asc' ? ' ↑' : ' ↓'
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items
      .filter((item) => {
        if (!q) return true
        return (
          item.userName.toLowerCase().includes(q) ||
          item.courseTitle.toLowerCase().includes(q) ||
          (item.department ?? '').toLowerCase().includes(q)
        )
      })
      .sort((a, b) => {
        let cmp = 0
        if (sortField === 'userName') cmp = a.userName.localeCompare(b.userName)
        else if (sortField === 'courseTitle') cmp = a.courseTitle.localeCompare(b.courseTitle)
        else if (sortField === 'department') cmp = (a.department ?? '').localeCompare(b.department ?? '')
        else if (sortField === 'progressPercentage') cmp = a.progressPercentage - b.progressPercentage
        else if (sortField === 'isCompleted') cmp = Number(a.isCompleted) - Number(b.isCompleted)
        return sortDir === 'asc' ? cmp : -cmp
      })
  }, [items, query, sortField, sortDir])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = useMemo(
    () => filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filtered, currentPage]
  )

  useEffect(() => {
    const maxPage = Math.max(1, totalPages)
    if (currentPage > maxPage) {
      setCurrentPage(maxPage)
    }
  }, [currentPage, totalPages])

  return (
    <div>
      <div className="mb-4">
        <AdminSearchField
          id="search-report-users"
          name="search-report-users"
          label="Busca"
          value={query}
          onChange={(value) => { setQuery(value); setCurrentPage(1) }}
          placeholder="Buscar por usuário, curso ou departamento"
          className="max-w-xs"
        />
      </div>
      {filtered.length === 0 ? (
        <EmptyState message="Nenhum resultado encontrado." />
      ) : (
      <div className="ui-card overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead className="border-b border-brand-border/60 bg-brand-light text-[11px] font-bold uppercase tracking-[0.14em] text-brand-text-muted">
            <tr>
              <th className="cursor-pointer select-none px-5 py-4 text-left transition-colors hover:bg-black/2" onClick={() => toggleSort('userName')}>Usuário{sortIcon('userName')}</th>
              <th className="cursor-pointer select-none px-5 py-4 text-left transition-colors hover:bg-black/2" onClick={() => toggleSort('courseTitle')}>Curso{sortIcon('courseTitle')}</th>
              {showDepartment && (
                <th className="cursor-pointer select-none px-5 py-4 text-left transition-colors hover:bg-black/2" onClick={() => toggleSort('department')}>Departamento{sortIcon('department')}</th>
              )}
              <th className="cursor-pointer select-none px-5 py-4 text-left transition-colors hover:bg-black/2" onClick={() => toggleSort('progressPercentage')}>Progresso{sortIcon('progressPercentage')}</th>
              <th className="cursor-pointer select-none px-5 py-4 text-left transition-colors hover:bg-black/2" onClick={() => toggleSort('isCompleted')}>Concluído{sortIcon('isCompleted')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border/50">
            {paginated.map((item) => (
              <tr key={`${item.userId}-${item.courseId}`} className="transition-colors duration-150 hover:bg-brand-light/40">
                <td className="px-5 py-4 text-brand-text font-medium">{item.userName}</td>
                <td className="px-5 py-4 text-brand-text-muted">{item.courseTitle}</td>
                {showDepartment && <td className="px-5 py-4 text-brand-text-muted">{item.department}</td>}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-brand-primary">{item.progressPercentage}%</span>
                    <div className="w-12 h-1.5 bg-brand-border rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-progress rounded-full"
                        style={{ width: `${item.progressPercentage}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className={`ui-badge ${
                    item.isCompleted 
                      ? 'ui-badge-success' 
                      : 'ui-badge-neutral'
                  }`}>
                    {item.isCompleted ? '✓ Concluído' : 'Em Progresso'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}
      <AdminPagination
        current={currentPage}
        total={totalPages}
        onChange={(p) => setCurrentPage(p)}
        count={filtered.length}
        label="registro(s)"
      />
    </div>
  )
}

// ---- Instructor student progress table ----
function StudentProgressTable({ items }: { items: StudentProgressItem[] }) {
  type SortField = 'userName' | 'department' | 'progressPercentage' | 'isCompleted'
  const [sortField, setSortField] = useState<SortField>('userName')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = useState(1)

  function toggleSort(field: SortField) {
    if (field === sortField) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDir('asc')
    }
    setCurrentPage(1)
  }

  function sortIcon(field: string) {
    if (field !== sortField) return ' ↕'
    return sortDir === 'asc' ? ' ↑' : ' ↓'
  }

  const sorted = useMemo(() => {
    return [...items].sort((a, b) => {
      let cmp = 0
      if (sortField === 'userName') cmp = a.userName.localeCompare(b.userName)
      else if (sortField === 'department') cmp = (a.department ?? '').localeCompare(b.department ?? '')
      else if (sortField === 'progressPercentage') cmp = a.progressPercentage - b.progressPercentage
      else if (sortField === 'isCompleted') cmp = Number(a.isCompleted) - Number(b.isCompleted)
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [items, sortField, sortDir])

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE)
  const paginated = useMemo(
    () => sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [sorted, currentPage]
  )

  useEffect(() => {
    const maxPage = Math.max(1, totalPages)
    if (currentPage > maxPage) {
      setCurrentPage(maxPage)
    }
  }, [currentPage, totalPages])

  if (sorted.length === 0) {
    return <EmptyState message="Nenhum aluno com progresso disponível para este curso." />
  }

  return (
    <div>
      <div className="ui-card overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead className="border-b border-brand-border/60 bg-brand-light text-[11px] font-bold uppercase tracking-[0.14em] text-brand-text-muted">
            <tr>
              <th className="cursor-pointer select-none px-5 py-4 text-left transition-colors hover:bg-black/2" onClick={() => toggleSort('userName')}>Aluno{sortIcon('userName')}</th>
              <th className="cursor-pointer select-none px-5 py-4 text-left transition-colors hover:bg-black/2" onClick={() => toggleSort('department')}>Departamento{sortIcon('department')}</th>
              <th className="cursor-pointer select-none px-5 py-4 text-left transition-colors hover:bg-black/2" onClick={() => toggleSort('progressPercentage')}>Progresso{sortIcon('progressPercentage')}</th>
              <th className="cursor-pointer select-none px-5 py-4 text-left transition-colors hover:bg-black/2" onClick={() => toggleSort('isCompleted')}>Concluído{sortIcon('isCompleted')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border/50">
            {paginated.map((student) => (
              <tr key={student.userId} className="transition-colors duration-150 hover:bg-brand-light/40">
                <td className="px-5 py-4 text-brand-text font-medium">{student.userName}</td>
                <td className="px-5 py-4 text-brand-text-muted">{student.department}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-brand-primary">{student.progressPercentage}%</span>
                    <div className="w-12 h-1.5 bg-brand-border rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-progress rounded-full"
                        style={{ width: `${student.progressPercentage}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className={`ui-badge ${
                    student.isCompleted 
                      ? 'ui-badge-success' 
                      : 'ui-badge-neutral'
                  }`}>
                    {student.isCompleted ? '✓ Concluído' : 'Em Progresso'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <AdminPagination
        current={currentPage}
        total={totalPages}
        onChange={(p) => setCurrentPage(p)}
        count={sorted.length}
        label="aluno(s)"
      />
    </div>
  )
}

// ---- Personal progress table ----
function PersonalProgressTable({ items }: { items: PersonalCourse[] }) {
  type SortField = 'courseTitle' | 'categoryName' | 'progressPercentage' | 'isCompleted'
  const [sortField, setSortField] = useState<SortField>('courseTitle')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = useState(1)

  function toggleSort(field: SortField) {
    if (field === sortField) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDir('asc')
    }
    setCurrentPage(1)
  }

  function sortIcon(field: string) {
    if (field !== sortField) return ' ↕'
    return sortDir === 'asc' ? ' ↑' : ' ↓'
  }

  const sorted = useMemo(() => {
    return [...items].sort((a, b) => {
      let cmp = 0
      if (sortField === 'courseTitle') cmp = a.courseTitle.localeCompare(b.courseTitle)
      else if (sortField === 'categoryName') cmp = a.categoryName.localeCompare(b.categoryName)
      else if (sortField === 'progressPercentage') cmp = a.progressPercentage - b.progressPercentage
      else if (sortField === 'isCompleted') cmp = Number(a.isCompleted) - Number(b.isCompleted)
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [items, sortField, sortDir])

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE)
  const paginated = useMemo(
    () => sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [sorted, currentPage]
  )

  useEffect(() => {
    const maxPage = Math.max(1, totalPages)
    if (currentPage > maxPage) {
      setCurrentPage(maxPage)
    }
  }, [currentPage, totalPages])

  if (sorted.length === 0) {
    return <EmptyState message="Nenhum curso com progresso disponível." />
  }

  return (
    <div>
      <div className="ui-card overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead className="border-b border-brand-border/60 bg-brand-light text-[11px] font-bold uppercase tracking-[0.14em] text-brand-text-muted">
            <tr>
              <th className="cursor-pointer select-none px-5 py-4 text-left transition-colors hover:bg-black/2" onClick={() => toggleSort('courseTitle')}>Curso{sortIcon('courseTitle')}</th>
              <th className="cursor-pointer select-none px-5 py-4 text-left transition-colors hover:bg-black/2" onClick={() => toggleSort('categoryName')}>Categoria{sortIcon('categoryName')}</th>
              <th className="cursor-pointer select-none px-5 py-4 text-left transition-colors hover:bg-black/2" onClick={() => toggleSort('progressPercentage')}>Progresso{sortIcon('progressPercentage')}</th>
              <th className="cursor-pointer select-none px-5 py-4 text-left transition-colors hover:bg-black/2" onClick={() => toggleSort('isCompleted')}>Concluído{sortIcon('isCompleted')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border/50">
            {paginated.map((course) => (
              <tr key={course.courseId} className="transition-colors duration-150 hover:bg-brand-light/40">
                <td className="px-5 py-4 text-brand-text font-medium">{course.courseTitle}</td>
                <td className="px-5 py-4 text-brand-text-muted">{course.categoryName}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-brand-primary">{course.progressPercentage}%</span>
                    <div className="w-12 h-1.5 bg-brand-border rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-progress rounded-full"
                        style={{ width: `${course.progressPercentage}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className={`ui-badge ${
                    course.isCompleted 
                      ? 'ui-badge-success' 
                      : 'ui-badge-neutral'
                  }`}>
                    {course.isCompleted ? '✓ Concluído' : 'Em Progresso'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <AdminPagination
        current={currentPage}
        total={totalPages}
        onChange={(p) => setCurrentPage(p)}
        count={sorted.length}
        label="curso(s)"
      />
    </div>
  )
}

// ---- Main ReportsView ----
export default function ReportsView({ role, data }: { role: string; data: any }) {
  if (!data) return <EmptyState message="Nenhum dado disponível." />

  if (role === 'Administrador') {
    return (
      <div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <StatCard label="Total de usuários" value={data.totalUsers ?? 0} />
          <StatCard label="Cursos publicados" value={data.totalCourses ?? 0} />
          <StatCard label="Nunca logaram" value={data.neverLoggedIn ?? 0} />
        </div>
        <UserProgressTable items={data.userProgress ?? []} showDepartment={true} />
      </div>
    )
  }

  if (role === 'Gestor') {
    return (
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <StatCard label="Departamento" value={data.department ?? '-'} />
          <StatCard label="Total de usuários" value={data.totalUsers ?? 0} />
        </div>
        <UserProgressTable items={data.userProgress ?? []} showDepartment={false} />
      </div>
    )
  }

  if (role === 'Instrutor') {
    if ((data ?? []).length === 0) {
      return <EmptyState message="Nenhum curso com dados de relatório disponível para este instrutor." />
    }

    return (
      <div className="space-y-6">
        {(data ?? []).map((course: CourseReport) => (
          <div key={course.courseId} className="ui-card">
            <div className="mb-6 border-b border-brand-border pb-6">
              <h2 className="text-2xl font-bold text-brand-text mb-2">{course.courseTitle}</h2>
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-sm font-medium text-brand-text-muted">Alunos</p>
                  <p className="text-2xl font-bold text-brand-primary">{course.completedStudents}/{course.totalStudents}</p>
                </div>
                <div className="h-8 w-px bg-brand-border" />
                <div>
                  <p className="text-sm font-medium text-brand-text-muted">Taxa de conclusão</p>
                  <p className="text-2xl font-bold text-brand-success">
                    {course.totalStudents > 0 ? Math.round((course.completedStudents / course.totalStudents) * 100) : 0}%
                  </p>
                </div>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-brand-text mb-4">Desempenho das Aulas</h3>
            <div className="ui-card-muted mb-6 overflow-hidden p-0">
              <table className="w-full text-sm">
                <thead className="border-b border-brand-border/60 bg-white text-[11px] font-bold uppercase tracking-[0.14em] text-brand-text-muted">
                  <tr>
                    <th className="px-5 py-3 text-left">Aula</th>
                    <th className="px-5 py-3 text-left">Acessos</th>
                    <th className="px-5 py-3 text-left">Conclusão</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/50">
                  {(course.lessonStats ?? []).map((lesson) => (
                    <tr key={lesson.lessonId} className="transition-colors hover:bg-white/70">
                      <td className="px-5 py-3 text-brand-text font-medium">{lesson.lessonTitle}</td>
                      <td className="px-5 py-3 font-medium text-brand-text-muted">{lesson.totalAccesses}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-brand-primary">{lesson.completionPercentage}%</span>
                          <div className="w-16 h-1.5 bg-brand-border rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-progress rounded-full"
                              style={{ width: `${lesson.completionPercentage}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3 className="text-lg font-semibold text-brand-text mb-4">Progresso dos Alunos</h3>
            <StudentProgressTable items={course.studentProgress ?? []} />
          </div>
        ))}
      </div>
    )
  }

  // Default (Funcionario)
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Cursos disponíveis" value={data.availableCourses ?? 0} />
        <StatCard label="Em andamento" value={data.startedCourses ?? 0} />
        <StatCard label="Concluídos" value={data.completedCourses ?? 0} />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-brand-text mb-4">Meus Cursos</h2>
        <PersonalProgressTable items={data.courses ?? []} />
      </div>
    </div>
  )
}
