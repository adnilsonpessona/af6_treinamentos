# Diagrama de Arquitetura - Frontend Melhorado

## Estrutura Proposta

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # RootLayout com ErrorBoundary
│   ├── page.tsx
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx        # Login - Com validação Zod
│   │   └── activate/
│   │       └── page.tsx        # Activate - Com validação Zod
│   ├── (protected)/
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── admin/
│   │   │   ├── users/
│   │   │   │   └── page.tsx    # Lazy-loaded AdminUsersManager
│   │   │   ├── companies/
│   │   │   │   └── page.tsx
│   │   │   └── categories/
│   │   │       └── page.tsx
│   │   ├── instructor/
│   │   │   └── [courseId]/
│   │   │       ├── page.tsx    # Editor com Error Boundary
│   │   │       └── lesson/
│   │   │           └── [lessonId]/page.tsx
│   │   └── reports/
│   │       └── page.tsx
│   └── api/
│       └── auth/
│           ├── login/route.ts   # Secure cookie handling
│           └── logout/route.ts
│
├── components/
│   ├── ErrorBoundary.tsx       # ✅ NOVO - Proteção contra crashes
│   ├── AppSidebar.tsx
│   ├── PageHeader.tsx
│   ├── FeedbackAlert.tsx
│   ├── EmptyState.tsx
│   │
│   ├── Admin/
│   │   ├── Users/
│   │   │   ├── UsersManager.tsx      # Container
│   │   │   ├── UsersTable.tsx        # Presentational
│   │   │   ├── UserRow.tsx           # Componente pequeno
│   │   │   ├── UserForm.tsx          # Formulário
│   │   │   ├── UserActions.tsx       # Botões
│   │   │   └── index.ts
│   │   │
│   │   ├── Companies/
│   │   │   └── (similar structure)
│   │   │
│   │   ├── Categories/
│   │   │   └── (similar structure)
│   │   │
│   │   ├── Skeleton.tsx              # ✅ NOVO - Loading state
│   │   └── index.ts
│   │
│   ├── Instructor/
│   │   ├── CourseEditor.tsx          # Com Error Boundary
│   │   ├── LessonForm.tsx            # Validado com Zod
│   │   ├── LessonViewer.tsx
│   │   ├── RichTextEditor.tsx
│   │   └── index.ts
│   │
│   └── Common/
│       ├── ToggleSwitch.tsx
│       ├── SearchField.tsx
│       ├── SearchableSelect.tsx
│       └── Pagination.tsx
│
├── lib/
│   ├── api/                           # ✅ NOVO - Modular API
│   │   ├── client.ts                 # ✅ Cliente HTTP centralizado
│   │   ├── endpoints/
│   │   │   ├── auth.ts               # ✅ Endpoints de auth
│   │   │   ├── users.ts              # ✅ Endpoints de users
│   │   │   ├── courses.ts            # ✅ Endpoints de cursos
│   │   │   ├── lessons.ts            # ✅ Endpoints de aulas
│   │   │   ├── categories.ts
│   │   │   ├── companies.ts
│   │   │   └── reports.ts
│   │   ├── types.ts                  # Tipos de resposta
│   │   └── index.ts                  # Export centralizado
│   │
│   ├── validation/                    # ✅ NOVO - Schemas Zod
│   │   ├── schemas.ts                # ✅ Todos os schemas
│   │   └── index.ts
│   │
│   ├── hooks/                         # ✅ NOVO - Custom hooks
│   │   ├── useApi.ts                 # ✅ Hook para fetch
│   │   ├── useAuth.ts                # ✅ Hook de auth (TODO)
│   │   ├── useForm.ts                # Hook genérico (TODO)
│   │   ├── useNotification.ts        # Hook de notificação (TODO)
│   │   └── index.ts
│   │
│   ├── auth/                         # Existente - pode mover para hooks
│   │   ├── server.ts                # Cookies no servidor
│   │   └── client.ts                # Cookies no cliente (TODO)
│   │
│   ├── utils/                        # ✅ NOVO - Helpers
│   │   ├── formatters.ts            # Formatação de dados
│   │   ├── validators.ts            # Validadores customizados
│   │   ├── constants.ts             # Constantes
│   │   └── index.ts
│   │
│   ├── error/                        # ✅ NOVO - Tratamento de erro
│   │   ├── handler.ts               # AppError class
│   │   └── logger.ts                # Logging centralizado
│   │
│   ├── config.ts                    # Configurações
│   ├── api.ts                       # ❌ SERÁ REMOVIDO (refatorado acima)
│   └── auth.ts                      # ✅ Será mantido com melhorias
│
├── types/                            # ✅ NOVO - Organizado
│   ├── index.ts                     # Re-export principal
│   ├── api.ts                       # Tipos de resposta API
│   ├── domain.ts                    # Modelos de negócio
│   ├── components.ts                # Props de componentes
│   └── forms.ts                     # Schemas de formulários
│
├── __tests__/                        # ✅ NOVO - Testes
│   ├── setup.ts                     # Configuração Vitest
│   ├── components/
│   │   ├── AdminOverview.test.tsx
│   │   ├── UserForm.test.tsx
│   │   └── ErrorBoundary.test.tsx
│   ├── lib/
│   │   ├── api.test.ts
│   │   ├── validation.test.ts
│   │   └── hooks.test.ts
│   └── integration/
│       ├── auth-flow.test.tsx
│       └── admin-flow.test.tsx
│
├── middleware.ts                    # ✅ Existente - pode melhorar
├── env.ts                           # ✅ NOVO - Validação de env
└── globals.css                      # Estilos globais

```

---

## Fluxo de Dados

```
┌─────────────────────────────────────────────────────────────────┐
│                         PAGE (React Component)                  │
│                       src/app/users/page.tsx                    │
└────────────┬────────────────────────────────────────────────────┘
             │
             ├─ ErrorBoundary (proteção)
             │
             ├─ Wrapped Component
             │
             ├──> useApiMutation (estado de request)
             │
             ├──> useForm (validação Zod)
             │
             └──> UserForm (componente)
                    │
                    └──> Input fields
                    │
                    └──> Validate com schema
                    │
                    └──> Call mutate()


┌─────────────────────────────────────────────────────────────────┐
│                     MUTATION / FETCH CALL                       │
│                     mutate({ data })                            │
└────────────┬────────────────────────────────────────────────────┘
             │
             ├──> usersEndpoints.update(token, id, data)
             │
             ├──> apiClient.put('/api/v1/users/{id}', data)
             │
             ├──> request<T>(path, options)
             │
             ├──> fetch() com headers seguros
             │    - Authorization: Bearer token
             │    - Content-Type: application/json
             │    - Timeout: 30s
             │    - Error handling completo
             │
             └──> Response | ApiError


┌─────────────────────────────────────────────────────────────────┐
│                         ERROR HANDLING                          │
└────────────┬────────────────────────────────────────────────────┘
             │
             ├─ ApiError (status 4xx/5xx)
             │   └─ Mostrar FeedbackAlert
             │
             ├─ Timeout (408)
             │   └─ Retry automático ou mensagem
             │
             ├─ Network Error
             │   └─ Fallback para offline
             │
             ├─ Validation Error (Zod)
             │   └─ Mostrar erros inline
             │
             └─ Unexpected Error
                 └─ ErrorBoundary pega
                    └─ Mostrar UI de erro

```

---

## Fluxo de Autenticação

```
USER                    FRONTEND                API                BACKEND
  │                         │                    │                    │
  ├─ Click Login ─────────> │                    │                    │
  │                         │                    │                    │
  │                    Fill Form (email, pass)  │                    │
  │                         │                    │                    │
  │                  Validate com Zod           │                    │
  │                         │                    │                    │
  │                    mutate({email, pass})    │                    │
  │                         │                    │                    │
  │                         ├─ POST /api/v1/auth/login ───────────>  │
  │                         │    (email, password)                   │
  │                         │                    │                   │
  │                         │                    │        Validate   │
  │                         │                    │        Hash pwd   │
  │                         │                    │        Generate   │
  │                         │                    │        JWT ────── Response
  │                         │                    │                   │
  │                         │  <─────── 200 OK with token ───────────│
  │                         │     (token, role, expiresAt)           │
  │                         │                    │                    │
  │                    Call /api/auth/login      │                    │
  │                    (route handler)            │                    │
  │                         │                    │                    │
  │                    Set cookies (HttpOnly)    │                    │
  │                    (secure, sameSite)        │                    │
  │                         │                    │                    │
  │                    Redirect to /dashboard    │                    │
  │                         │                    │                    │
  │  <────── Redirect ───────│                    │                    │
  │                         │                    │                    │
  └─> Dashboard (auth middleware permite)       │                    │

```

---

## Comparação: Antes vs Depois

### ANTES (Estrutura Atual)
```
src/lib/
├── api.ts                (2000+ linhas)  ❌ Monolítico
└── auth.ts               (básico)        ⚠️ Incompleto

Componentes sem validação de props
sem error boundaries
sem estrutura de hooks
sem tratamento centralizado de erro
sem separação de concerns
```

### DEPOIS (Estrutura Proposta)
```
src/lib/
├── api/
│   ├── client.ts         ✅ ~100 linhas
│   └── endpoints/
│       ├── auth.ts       ✅ ~30 linhas
│       ├── users.ts      ✅ ~40 linhas
│       ├── courses.ts    ✅ ~45 linhas
│       └── ...
├── validation/
│   └── schemas.ts        ✅ ~150 linhas (todos schemas)
├── hooks/
│   ├── useApi.ts         ✅ Fetch com estado
│   ├── useAuth.ts        ✅ Auth simplificado
│   └── useForm.ts        ✅ Form com validação
├── error/
│   ├── handler.ts        ✅ Tratamento centralizado
│   └── logger.ts         ✅ Logging estruturado
└── utils/
    ├── formatters.ts     ✅ Helpers de formatação
    └── validators.ts     ✅ Validadores custom

Componentes com props validadas ✅
ErrorBoundary proteção ✅
Hooks reutilizáveis ✅
Tratamento centralizado ✅
Type-safe em todo lugar ✅
```

---

## Benefícios da Nova Arquitetura

### 🎯 Maintainability
- Cada arquivo tem responsabilidade única (SRP)
- Fácil encontrar onde implementar mudanças
- Menos merge conflicts

### 🔒 Security
- Validação em todas as entradas (Zod)
- Tratamento centralizado de erros
- Cookies seguros (HttpOnly, Secure, SameSite)
- Security headers no servidor

### ⚡ Performance
- Code splitting com lazy loading
- Skeleton loaders para melhor UX
- Cache strategy clara
- Menos re-renders

### 🧪 Testability
- Componentes pequenos e isoláveis
- Hooks testáveis
- Funções puras
- Fácil mockar API

### 📦 Type Safety
- TypeScript strict mode
- Zod para runtime validation
- Tipos derivados de schemas
- Menos runtime errors

---

## Estatísticas Esperadas Após Refactor

| Métrica | Antes | Depois | Ganho |
|---------|-------|--------|-------|
| Linhas de código (api.ts) | 2000+ | ~250 | -87% |
| Bundle size | ? | -15-20% | ⬇️ |
| Componentes > 300 linhas | 5-8 | 0 | 100% |
| Type coverage | ~70% | 95%+ | +25% |
| Test coverage | 0% | 50%+ | +50% |
| Tempo build | ~60s | ~45s | -25% |
| Lighthouse score | ? | 90+ | ⬆️ |

---

**Data**: 2 de Maio de 2026  
**Autor**: Análise Automatizada  
**Status**: 🟢 Pronto para Implementação
