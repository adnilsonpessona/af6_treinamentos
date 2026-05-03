# Análise do Frontend - Propostas de Melhorias

## 📊 Resumo Executivo

A plataforma frontend está bem estruturada com Next.js 15, React 19 e TypeScript. A arquitetura segue boas práticas e o design system está bem definido. Identifiquei oportunidades de melhorias em performance, manutenibilidade, segurança e experiência do usuário.

---

## 1️⃣ Arquitetura & Estrutura

### ✅ Pontos Positivos
- **Stack moderno**: Next.js 15, React 19, TypeScript 5
- **Padrão App Router**: Estrutura limpa de pastas por feature
- **Middleware de autenticação**: Implementado e funcional
- **Absolute imports**: Configurados com `@/*`

### 🔴 Problemas Identificados

#### 1.1 Falta de Organização de Utils e Helpers
```
└── src/lib/
    ├── api.ts           (2000+ linhas, muito grande)
    ├── auth.ts          (básico)
    └── .gitkeep
```

**Impacto**: O arquivo `api.ts` é monolítico e difícil de manter.

**Proposta**:
```
└── src/lib/
    ├── api/
    │   ├── client.ts
    │   ├── endpoints/
    │   │   ├── auth.ts
    │   │   ├── users.ts
    │   │   ├── courses.ts
    │   │   ├── lessons.ts
    │   │   └── reports.ts
    │   └── types.ts
    ├── auth/
    │   ├── server.ts
    │   ├── client.ts
    │   └── middleware.ts
    ├── utils/
    │   ├── validators.ts
    │   ├── formatters.ts
    │   └── constants.ts
    ├── hooks/
    │   ├── useAuth.ts
    │   ├── useApi.ts
    │   └── useForm.ts
    └── config.ts
```

#### 1.2 Types Desorganizados
A pasta `src/types` tem apenas um `index.ts`. Tipos espalhados por componentes.

**Proposta**:
```
└── src/types/
    ├── index.ts
    ├── api.ts          (respostas API)
    ├── domain.ts       (User, Course, Lesson, etc)
    ├── components.ts   (props dos componentes)
    └── forms.ts        (schemas de validação)
```

---

## 2️⃣ Componentes

### ✅ Pontos Positivos
- 31 componentes reutilizáveis
- Nomenclatura clara (Admin*, Instructor*, etc)
- Bom uso de composição
- Design system consistente com Tailwind

### 🔴 Problemas Identificados

#### 2.1 Falta de Validação de Props
**Exemplo de risco**:
```typescript
// AdminOverview.tsx - sem validação
type Props = {
  badge: string
  title: string
  description: string
  stats: OverviewStat[]
}
```

**Proposta**: Usar `zod` para validação de runtime:
```typescript
import { z } from 'zod'

const OverviewStatSchema = z.object({
  label: z.string().min(1),
  value: z.union([z.string(), z.number()]),
  toneClassName: z.string().optional(),
})

const AdminOverviewPropsSchema = z.object({
  badge: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  stats: z.array(OverviewStatSchema).min(1),
})

type Props = z.infer<typeof AdminOverviewPropsSchema>
```

#### 2.2 Componentes Admin Muito Complexos
`AdminUsersManager.tsx`, `AdminCompaniesManager.tsx` provavelmente têm 500+ linhas.

**Proposta**: Decompor em subcomponentes menores:
```
components/
├── Admin/
│   ├── Users/
│   │   ├── UsersManager.tsx       (orquestrador)
│   │   ├── UsersTable.tsx
│   │   ├── UserRow.tsx
│   │   ├── UserForm.tsx
│   │   └── UserActions.tsx
│   ├── Companies/
│   │   ├── CompaniesManager.tsx
│   │   ├── CompaniesTable.tsx
│   │   ├── CompanyRow.tsx
│   │   └── CompanyForm.tsx
```

#### 2.3 Falta de Error Boundaries
**Risco**: Um erro em um componente pode quebrar toda a página.

**Proposta**: Criar `ErrorBoundary.tsx`:
```typescript
'use client'
import { Component } from 'react'

interface Props {
  children: React.ReactNode
  fallback?: React.ReactNode
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

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-red-700">Ocorreu um erro</p>
          </div>
        )
      )
    }
    return this.props.children
  }
}
```

---

## 3️⃣ Autenticação & Segurança

### ✅ Pontos Positivos
- Middleware bem configurado
- Proteção de rotas públicas/privadas
- Uso de cookies HttpOnly (implícito com next-auth)

### 🔴 Problemas Identificados

#### 3.1 Token Armazenado em Cookies Sem Segurança Explícita
`src/lib/auth.ts` - sem configuração de `Secure`, `SameSite`.

**Proposta**: Adicionar utilitários de cookie seguro:
```typescript
// src/lib/auth/cookies.ts
import { cookies } from 'next/headers'

export async function setSecureAuthCookie(token: string, expiresAt: string) {
  const cookieStore = await cookies()
  
  cookieStore.set({
    name: AUTH_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000),
    path: '/',
  })
}

export async function clearAuthCookies() {
  const cookieStore = await cookies()
  cookieStore.delete(AUTH_COOKIE)
  cookieStore.delete(AUTH_ROLE_COOKIE)
  cookieStore.delete(AUTH_NAME_COOKIE)
  cookieStore.delete(AUTH_DEPT_COOKIE)
}
```

#### 3.2 Falta de CSRF Protection
Nenhuma proteção CSRF explícita detectada.

**Proposta**: Implementar verificação de origem/referer:
```typescript
// src/lib/security/csrf.ts
export function validateCsrfToken(request: NextRequest, token: string) {
  // Verificar token da sessão contra o fornecido
  // Padrão duplo-envio ou sessão-baseado
}
```

#### 3.3 Falta de Rate Limiting
**Proposta**: Adicionar rate limiting em `/api/logout`, `/api/login`:
```typescript
// src/lib/security/rateLimit.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '10 s'),
})

export async function checkRateLimit(key: string) {
  return ratelimit.limit(key)
}
```

---

## 4️⃣ Performance

### ✅ Pontos Positivos
- `output: 'standalone'` configurado
- Suporte a Next.js Image Optimization

### 🔴 Problemas Identificados

#### 4.1 Falta de Code Splitting
Componentes admin grandes não estão sendo lazy-loaded.

**Proposta**:
```typescript
// src/app/admin/layout.tsx
import dynamic from 'next/dynamic'

const AdminUsersManager = dynamic(
  () => import('@/components/AdminUsersManager'),
  {
    loading: () => <AdminSkeleton />,
    ssr: false,
  }
)
```

#### 4.2 Sem Otimização de Imagens
`next.config.ts` permite remotePatterns mas sem otimização.

**Proposta**:
```typescript
// next.config.ts
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [...],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
}
```

#### 4.3 Sem Cache Policy
APIs não têm estratégia de cache clara.

**Proposta**:
```typescript
// src/lib/api/cache.ts
export const CACHE_STRATEGY = {
  users: { revalidate: 60 },        // 1 min
  courses: { revalidate: 300 },     // 5 min
  lessons: { revalidate: 600 },     // 10 min
  reports: { revalidate: 3600 },    // 1 hour
  auth: { revalidate: 0 },          // no-cache
}
```

#### 4.4 Sem Minificação de CSS Condicional
Tailwind está gerando CSS não utilizado.

**Proposta**: Usar PurgeCSS (já padrão em Tailwind v4):
```javascript
// tailwind.config.ts - já configurado mas verify:
const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/app/**/*.{js,ts,jsx,tsx}',
    // Ser específico evita CSS não utilizado
  ],
}
```

---

## 5️⃣ Tratamento de Erros & Logging

### 🔴 Problemas Críticos

#### 5.1 Sem Tratamento Centralizado de Erros
Cada componente faz `try/catch` isolado.

**Proposta**: Criar cliente de erro centralizado:
```typescript
// src/lib/error/handler.ts
export class AppError extends Error {
  constructor(
    public code: string,
    public statusCode: number = 500,
    message?: string
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export const handleApiError = (error: unknown) => {
  if (error instanceof AppError) return error
  if (error instanceof Error) {
    return new AppError('UNKNOWN_ERROR', 500, error.message)
  }
  return new AppError('UNKNOWN_ERROR', 500)
}
```

#### 5.2 Sem Logging Estruturado
**Proposta**: Integrar `pino` ou `winston`:
```typescript
// src/lib/logging/logger.ts
import pino from 'pino'

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
    },
  },
})
```

#### 5.3 Sem Telemetria de Erro
**Proposta**: Integrar Sentry:
```typescript
// src/lib/error/sentry.ts
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
})
```

---

## 6️⃣ Testes

### 🔴 Problemas Críticos

#### 6.1 Sem Testes Automatizados
**Proposta**: Estrutura de testes:
```
src/
├── __tests__/
│   ├── components/
│   │   ├── AdminOverview.test.tsx
│   │   └── ...
│   ├── lib/
│   │   ├── api.test.ts
│   │   └── auth.test.ts
│   └── integration/
│       └── admin-flow.test.tsx
```

**Setup recomendado**:
```json
{
  "devDependencies": {
    "@testing-library/react": "^15",
    "@testing-library/jest-dom": "^6",
    "jest": "^29",
    "jest-environment-jsdom": "^29",
    "@types/jest": "^29",
    "vitest": "^1"
  }
}
```

---

## 7️⃣ TypeScript & Qualidade de Código

### ✅ Pontos Positivos
- `strict: true` habilitado
- Tipagem bem feita

### 🔴 Problemas Identificados

#### 7.1 Falta de ESLint Rules Rigorosos
**Proposta**: `.eslintrc.json` melhorado:
```json
{
  "extends": ["next/core-web-vitals"],
  "rules": {
    "@next/next/no-html-link-for-pages": "error",
    "react/no-unescaped-entities": "error",
    "prefer-const": "error",
    "no-var": "error",
    "eqeqeq": ["error", "always"],
    "no-console": ["warn", { "allow": ["error", "warn"] }],
    "@typescript-eslint/explicit-function-return-types": "warn",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": ["error", {
      "argsIgnorePattern": "^_"
    }]
  }
}
```

#### 7.2 Sem Validação de Schemas
**Proposta**: Usar `zod` para validação:
```typescript
// src/lib/validation/schemas.ts
import { z } from 'zod'

export const LoginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
})

export const CreateCourseSchema = z.object({
  title: z.string().min(5),
  description: z.string().min(20),
  categoryId: z.string().uuid(),
})
```

---

## 8️⃣ Acessibilidade & UX

### 🔴 Problemas Identificados

#### 8.1 Componentes Sem ARIA Labels
**Exemplo**: Botões de ação faltam `aria-label`.

**Proposta**:
```typescript
<button
  aria-label="Expandir menu"
  onClick={() => setCollapsed((v) => !v)}
>
  <Menu size={16} />
</button>
```

#### 8.2 Falta de Focus Management
Modais e drawers não gerenciam foco.

**Proposta**: Usar `react-aria`:
```typescript
import { useDialog } from 'react-aria'

export function Modal({ children, isOpen }) {
  const ref = useRef(null)
  const { dialogProps } = useDialog({}, ref)
  
  return (
    <div ref={ref} {...dialogProps}>
      {children}
    </div>
  )
}
```

#### 8.3 Sem Skeleton Loaders
**Proposta**: Criar componentes de skeleton:
```typescript
// components/Skeleton.tsx
export function SkeletonCard() {
  return (
    <div className="animate-pulse">
      <div className="h-4 bg-gray-200 rounded mb-4" />
      <div className="h-4 bg-gray-200 rounded w-5/6" />
    </div>
  )
}
```

---

## 9️⃣ Configuração & Deployment

### 🔴 Problemas Identificados

#### 9.1 Falta de Environment Variables Schema
**Proposta**: `src/env.ts` para validação:
```typescript
import { z } from 'zod'

const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url(),
  INTERNAL_API_URL: z.string().url(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']),
})

export const env = envSchema.parse(process.env)
```

#### 9.2 Sem Segurança de Headers
**Proposta**: `next.config.ts`:
```typescript
const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'geolocation=()' },
        ],
      },
    ]
  },
}
```

---

## 🔟 Dependências & Segurança

### 🔴 Problemas Identificados

#### 10.1 Dependências Desatualizadas?
**Proposta**: Revisar e atualizar:
```bash
npm outdated
npm audit
```

#### 10.2 Falta de Renovação de Token
JWT pode expirar e usuário perde acesso.

**Proposta**: Refresh token middleware:
```typescript
// src/lib/auth/refresh.ts
export async function refreshToken(token: string) {
  try {
    const response = await fetch(`${API_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    })
    if (!response.ok) throw new Error('Token refresh failed')
    return response.json()
  } catch {
    // Redirecionar para login
  }
}
```

---

## 📋 Resumo de Ações Prioritárias

### 🔴 CRÍTICO (Fazer primeiro)
1. **Organizar `src/lib/api.ts`** → Dividir em endpoints específicos
2. **Adicionar validação com Zod** → Schemas para todas as APIs
3. **Security headers** → `next.config.ts`
4. **Error Boundary** → Proteção contra crashes
5. **Logging centralizado** → Pino ou Winston

### 🟡 IMPORTANTE (Fazer em seguida)
6. Decompose componentes Admin complexos
7. Adicionar testes com Vitest/Jest
8. Code splitting com dynamic imports
9. Rate limiting em rotas de API
10. Melhorar acessibilidade (ARIA labels)

### 🟢 MANUTENÇÃO (Melhorias contínuas)
11. Otimização de imagens avançada
12. Cache strategy clara
13. Telemetria com Sentry
14. E2E testes com Playwright

---

## 📦 Dependências Recomendadas

```json
{
  "dependencies": {
    "zod": "^3.22",
    "pino": "^8.18",
    "next-safe-action": "^7.7"
  },
  "devDependencies": {
    "vitest": "^1.0",
    "@testing-library/react": "^15",
    "jest-environment-jsdom": "^29",
    "@typescript-eslint/eslint-plugin": "^7"
  }
}
```

---

## 🎯 Próximos Passos

1. **Reunião de Priorização**: Definir quais melhorias são críticas
2. **Criar branch**: `feat/frontend-improvements`
3. **Implementar incrementalmente**: Não tudo de uma vez
4. **Testes**: Cada mudança com testes
5. **Code Review**: Revisão pares antes de merge

---

**Data**: 2 de Maio de 2026  
**Status**: Análise Completa  
**Próxima Revisão**: Após implementação de melhorias críticas
