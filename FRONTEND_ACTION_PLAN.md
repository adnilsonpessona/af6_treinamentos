# Frontend - Plano de Ação para Melhorias

## 🎯 Objetivo
Implementar incrementalmente melhorias críticas de arquitetura, segurança e performance no frontend.

---

## FASE 1: REORGANIZAÇÃO (Semana 1)

### Tarefa 1.1: Refatorar `src/lib/api.ts`

**Atual**: Arquivo monolítico com 2000+ linhas  
**Novo**: Estrutura modular por endpoint

**Estrutura**:
```
src/lib/api/
├── client.ts          ← Cliente HTTP base
├── endpoints/
│   ├── auth.ts
│   ├── users.ts
│   ├── courses.ts
│   ├── lessons.ts
│   └── reports.ts
├── types.ts           ← Tipos de resposta
└── index.ts           ← Exportações
```

**Comando**:
```bash
# Criar diretório
mkdir -p src/lib/api/endpoints

# Arquivo: src/lib/api/client.ts
# Arquivo: src/lib/api/types.ts
# Arquivo: src/lib/api/endpoints/*.ts
# Arquivo: src/lib/api/index.ts
```

---

### Tarefa 1.2: Organizar Types

**Novo**:
```
src/types/
├── index.ts
├── api.ts             ← Respostas da API
├── domain.ts          ← Modelos de negócio
├── components.ts      ← Props de componentes
└── forms.ts           ← Schemas de validação
```

---

### Tarefa 1.3: Criar Structure de Hooks

**Novo**:
```
src/lib/hooks/
├── useAuth.ts         ← useAuth() hook
├── useApi.ts          ← useApi() para fetch
├── useForm.ts         ← useForm() genérico
├── useNotification.ts ← useNotification()
└── index.ts
```

---

## FASE 2: SEGURANÇA (Semana 2)

### Tarefa 2.1: Implementar Validação com Zod

**Criar**: `src/lib/validation/schemas.ts`

```typescript
import { z } from 'zod'

// Auth
export const LoginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
})

export const CreateUserSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(3),
  role: z.enum(['Admin', 'Instructor', 'Student']),
  department: z.string(),
})

export const CreateCourseSchema = z.object({
  title: z.string().min(5, 'Mínimo 5 caracteres'),
  description: z.string().min(20),
  categoryId: z.string().uuid(),
})

// Exportar tipos
export type LoginInput = z.infer<typeof LoginSchema>
export type CreateUserInput = z.infer<typeof CreateUserSchema>
```

---

### Tarefa 2.2: Adicionar Security Headers

**Editar**: `next.config.ts`

```typescript
async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        { key: 'X-XSS-Protection', value: '1; mode=block' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'geolocation=()' },
        { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
      ],
    },
  ]
}
```

---

### Tarefa 2.3: Criar Error Boundary

**Criar**: `src/components/ErrorBoundary.tsx`

```typescript
'use client'
import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error) {
    console.error('Error caught:', error)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 mx-4 my-4">
            <h2 className="font-semibold text-red-900">Ocorreu um erro</h2>
            <p className="text-sm text-red-700 mt-2">
              Por favor, recarregue a página ou tente novamente.
            </p>
          </div>
        )
      )
    }
    return this.props.children
  }
}
```

---

## FASE 3: PERFORMANCE (Semana 3)

### Tarefa 3.1: Code Splitting com Dynamic Imports

**Editar**: Componentes Admin grandes

```typescript
// src/app/admin/users/page.tsx
import dynamic from 'next/dynamic'
import { Suspense } from 'react'

const AdminUsersManager = dynamic(
  () => import('@/components/AdminUsersManager'),
  {
    loading: () => <AdminSkeleton />,
    ssr: false,
  }
)

export default function AdminUsersPage() {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <AdminUsersManager />
    </Suspense>
  )
}
```

---

### Tarefa 3.2: Adicionar Skeleton Loaders

**Criar**: `src/components/Skeletons.tsx`

```typescript
export function CardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-4 bg-gray-200 rounded mb-4" />
      <div className="h-4 bg-gray-200 rounded w-5/6 mb-4" />
      <div className="h-8 bg-gray-300 rounded mt-4" />
    </div>
  )
}

export function AdminSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map(i => (
        <CardSkeleton key={i} />
      ))}
    </div>
  )
}
```

---

### Tarefa 3.3: Otimizar Tailwind CSS

**Editar**: `tailwind.config.ts`

```typescript
const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    // ... existente
  },
  // Purge CSS não utilizado automaticamente
  corePlugins: {
    preflight: true,
  },
}
```

---

## FASE 4: MANUTENIBILIDADE (Semana 4)

### Tarefa 4.1: Decompose Componentes Admin

**Exemplo**: `AdminUsersManager.tsx` → Múltiplos componentes

```
components/Admin/Users/
├── UsersManager.tsx      ← Orquestrador (state)
├── UsersTable.tsx        ← Tabela (presentational)
├── UserRow.tsx           ← Linha da tabela
├── UserForm.tsx          ← Formulário de edição
├── UserActions.tsx       ← Botões de ação
└── index.ts              ← Export
```

**Pattern**:
```typescript
// UsersTable.tsx (presentational)
export interface UsersTableProps {
  users: User[]
  onEdit: (user: User) => void
  onDelete: (userId: string) => void
}

export function UsersTable({ users, onEdit, onDelete }: UsersTableProps) {
  return (
    <table>
      {/* ... */}
    </table>
  )
}

// UsersManager.tsx (container)
export default function UsersManager() {
  const [users, setUsers] = useState<User[]>([])
  // ... fetch, state management

  return (
    <UsersTable
      users={users}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  )
}
```

---

### Tarefa 4.2: Adicionar Props Validation

**Pattern com Zod**:
```typescript
import { z } from 'zod'

const AdminOverviewPropsSchema = z.object({
  badge: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  stats: z.array(z.object({
    label: z.string(),
    value: z.union([z.string(), z.number()]),
    toneClassName: z.string().optional(),
  })),
})

type Props = z.infer<typeof AdminOverviewPropsSchema>

export default function AdminOverview(props: Props) {
  // Props já validadas em runtime
  // ...
}
```

---

## FASE 5: TESTES (Semana 5)

### Tarefa 5.1: Setup Vitest

**Criar**: `vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/__tests__/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/__tests__/'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

---

### Tarefa 5.2: Exemplo de Teste

**Criar**: `src/__tests__/components/AdminOverview.test.tsx`

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import AdminOverview from '@/components/AdminOverview'

describe('AdminOverview', () => {
  it('renders correctly', () => {
    render(
      <AdminOverview
        badge="Estatísticas"
        title="Dashboard"
        description="Visão geral do sistema"
        stats={[
          { label: 'Usuários', value: 42 },
          { label: 'Cursos', value: 12 },
        ]}
      />
    )

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('validates props with zod', async () => {
    // Teste validação
    const invalidProps = {
      badge: '',
      title: '',
      description: '',
      stats: [],
    }

    expect(() => {
      // Should fail validation
    }).toThrow()
  })
})
```

---

### Tarefa 5.3: E2E com Playwright

**Criar**: `e2e/admin-login.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

test('admin can login and access dashboard', async ({ page }) => {
  await page.goto('http://localhost:3000/login')
  
  await page.fill('input[type="email"]', 'admin@example.com')
  await page.fill('input[type="password"]', 'password123')
  await page.click('button:has-text("Entrar")')
  
  await page.waitForURL('**/dashboard')
  await expect(page.locator('h1')).toContainText('Dashboard')
})
```

---

## 📝 Checklist de Implementação

### FASE 1: Reorganização
- [ ] Criar estrutura de diretórios `src/lib/api`
- [ ] Dividir `api.ts` em módulos de endpoint
- [ ] Organizar types em `src/types/`
- [ ] Criar hooks em `src/lib/hooks/`

### FASE 2: Segurança
- [ ] Adicionar Zod ao projeto: `npm install zod`
- [ ] Criar schemas de validação
- [ ] Adicionar security headers em `next.config.ts`
- [ ] Implementar ErrorBoundary
- [ ] Adicionar logging (Pino/Winston)

### FASE 3: Performance
- [ ] Implementar code splitting em componentes admin
- [ ] Adicionar skeleton loaders
- [ ] Otimizar Tailwind CSS
- [ ] Adicionar cache strategy

### FASE 4: Manutenibilidade
- [ ] Decompose componentes admin grandes
- [ ] Adicionar prop validation com Zod
- [ ] Refatorar componentes complexos
- [ ] Criar documentação de componentes

### FASE 5: Testes
- [ ] Setup Vitest: `npm install -D vitest jsdom`
- [ ] Adicionar @testing-library: `npm install -D @testing-library/react`
- [ ] Criar testes para componentes críticos
- [ ] Setup Playwright para E2E

---

## 🚀 Começar Agora

### 1. Criar Branch
```bash
git checkout -b feat/frontend-improvements
```

### 2. Primeira Tarefa (Reorganização de API)
```bash
mkdir -p src/lib/api/endpoints
# Começar com Tarefa 1.1
```

### 3. Commit Incremental
```bash
git add src/lib/api/
git commit -m "refactor(api): reorganize api structure"
```

---

## 📊 Métricas de Sucesso

- [ ] Bundle size reduzido em 20%
- [ ] Lighthouse score > 90
- [ ] 80% code coverage em componentes críticos
- [ ] 0 security warnings
- [ ] Componentes admin < 300 linhas cada
- [ ] Todos os endpoints validados com Zod

---

**Estimativa**: 4-5 semanas de desenvolvimento  
**Impacto**: Arquitetura melhor, código mais manutenível, segurança aumentada
