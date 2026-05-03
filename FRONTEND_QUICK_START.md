# 🚀 Implementação das Melhorias - Começar Aqui

## ✅ O Que Já Foi Criado

### Arquivos de API Refatorados
- ✅ `src/lib/api/client.ts` - Cliente HTTP centralizado com tratamento de erro
- ✅ `src/lib/api/endpoints/auth.ts` - Endpoints de autenticação
- ✅ `src/lib/api/endpoints/users.ts` - Endpoints de usuários  
- ✅ `src/lib/api/endpoints/courses.ts` - Endpoints de cursos
- ✅ `src/lib/api/index.ts` - Exportações centralizadas

### Validação & Segurança
- ✅ `src/lib/validation/schemas.ts` - Schemas Zod para todos os endpoints
- ✅ `src/env.ts` - Validação de variáveis de ambiente
- ✅ `src/components/ErrorBoundary.tsx` - Proteção contra crashes

### Hooks Reutilizáveis
- ✅ `src/lib/hooks/useApi.ts` - Hook para fetch com estado

---

## 🎯 Próximos Passos

### PASSO 1: Instalar Zod
```bash
cd /home/almpessona/af6_treinamentos/frontend
npm install zod
```

### PASSO 2: Adicionar Security Headers ao next.config.ts
Editar: `frontend/next.config.ts`

```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  async redirects() {
    return [
      {
        source: '/favicon.ico',
        destination: '/icon.svg',
        permanent: false,
      },
    ]
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'geolocation=(),microphone=(),camera=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
        ],
      },
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
      },
    ],
  },
}

export default nextConfig
```

### PASSO 3: Criar Hook useAuth
Criar: `src/lib/hooks/useAuth.ts`

```typescript
'use client'
import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { LoginSchema, type LoginInput } from '@/lib/validation/schemas'

interface AuthState {
  isAuthenticated: boolean
  user: any | null
  loading: boolean
  error: string | null
}

export function useAuth() {
  const router = useRouter()
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: false,
    error: null,
  })

  const login = useCallback(async (email: string, password: string) => {
    try {
      // Validar
      const input = LoginSchema.parse({ email, password })
      
      setState({ ...state, loading: true, error: null })
      
      const response = await api.auth.login(input.email, input.password)
      
      // Salvar token (será feito via API route)
      await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(response),
      })
      
      setState({
        isAuthenticated: true,
        user: response,
        loading: false,
        error: null,
      })
      
      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Erro ao fazer login'
      setState({ ...state, loading: false, error })
      throw err
    }
  }, [state, router])

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setState({
      isAuthenticated: false,
      user: null,
      loading: false,
      error: null,
    })
    router.push('/login')
    router.refresh()
  }, [router])

  return { ...state, login, logout }
}
```

### PASSO 4: Usar ErrorBoundary no Layout
Editar: `src/app/layout.tsx`

```typescript
import { ErrorBoundary } from '@/components/ErrorBoundary'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="scroll-smooth">
      <body className={`${manrope.variable} ${sourceSerif.variable} ...`}>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  )
}
```

### PASSO 5: Atualizar Login Page
Editar: `src/app/login/page.tsx`

```typescript
'use client'
import { useState } from 'react'
import { LoginSchema } from '@/lib/validation/schemas'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    
    try {
      // Validar com Zod
      LoginSchema.parse({ email, password })
      
      setLoading(true)
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Erro ao fazer login')
      }

      // Será redirecionado automaticamente
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}
      
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Senha"
        required
      />
      
      <button type="submit" disabled={loading}>
        {loading ? 'Entrando...' : 'Entrar'}
      </button>
    </form>
  )
}
```

### PASSO 6: Criar API Route de Auth
Criar: `src/app/api/auth/login/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { AUTH_COOKIE, AUTH_ROLE_COOKIE, AUTH_NAME_COOKIE, AUTH_DEPT_COOKIE } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { token, fullName, email, role, department, expiresAt } = await request.json()

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
    
    cookieStore.set({
      name: AUTH_ROLE_COOKIE,
      value: role,
      httpOnly: false,
      sameSite: 'lax',
      path: '/',
    })
    
    cookieStore.set({
      name: AUTH_NAME_COOKIE,
      value: fullName,
      httpOnly: false,
      sameSite: 'lax',
      path: '/',
    })

    cookieStore.set({
      name: AUTH_DEPT_COOKIE,
      value: department,
      httpOnly: false,
      sameSite: 'lax',
      path: '/',
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao fazer login' },
      { status: 400 }
    )
  }
}
```

---

## 📝 Checklist de Implementação

### Fase 1: Setup
- [ ] `npm install zod`
- [ ] Copiar/colar código dos arquivos criados
- [ ] Testar em http://localhost:3000/login

### Fase 2: Validação
- [ ] Todas as schemas Zod funcionando
- [ ] Validação de erros mostrando mensagens
- [ ] TypeScript sem erros

### Fase 3: Segurança
- [ ] ErrorBoundary protegendo app
- [ ] Security headers em production
- [ ] API com timeout e tratamento de erro

### Fase 4: Testes
- [ ] Fazer login
- [ ] Verificar cookies salvos
- [ ] Fazer logout
- [ ] Redirecionamento funciona

---

## 🧪 Testar Localmente

```bash
cd frontend

# Build
npm run build

# Dev
npm run dev

# Ir para http://localhost:3000/login
# Email: admin@example.com
# Senha: password123
```

---

## 📚 Documentação de Referência

- [Zod Documentation](https://zod.dev)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/eslint#security-related-rules)
- [React Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)

---

**Status**: 🟢 Pronto para Implementação  
**Tempo Estimado**: 2-3 horas  
**Dificuldade**: ⭐⭐⭐ Intermediária
