# Frontend - Métricas, Monitoramento & Observabilidade

## 📊 Métricas de Performance Atual

### Bundle Size Analysis
```bash
# Executar após próximo build:
npm run build
du -sh .next/
# Esperar: ~5-7 MB (produção com standalone)
```

**Tamanho por página** (estimado):
- Login: ~45 KB
- Dashboard: ~120 KB  
- Admin Users: ~150 KB
- Instructor Editor: ~180 KB

**Dependências mais pesadas**:
1. react-player: ~240 KB
2. @tiptap (editor): ~180 KB
3. lucide-react: ~120 KB
4. tailwindcss: ~80 KB

---

## 🎯 Web Vitals Target (Google Lighthouse)

### Metas por Página

| Página | LCP | CLS | FID/INP |
|--------|-----|-----|---------|
| Login | <2.5s | <0.1 | <100ms |
| Dashboard | <2.5s | <0.1 | <100ms |
| Admin | <3.0s | <0.15 | <150ms |
| Instructor | <3.5s | <0.2 | <200ms |

### Performance Budget
```javascript
// next.config.ts - adicionar:
const performanceBudget = {
  bundles: [
    {
      name: 'main',
      maxSize: '200kb',
    },
    {
      name: 'admin',
      maxSize: '150kb',
    },
  ],
}
```

---

## 🔍 Monitoramento com Sentry

### Setup Recomendado

```bash
npm install @sentry/nextjs
```

**Criar**: `sentry.client.config.ts`
```typescript
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
  
  // Filtrar erros desnecessários
  beforeSend(event, hint) {
    const error = hint.originalException
    
    // Ignorar network errors esperados
    if (error?.message?.includes('NetworkError')) {
      return null
    }
    
    return event
  },

  // Integrations
  integrations: [
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
})
```

**Criar**: `sentry.server.config.ts`
```typescript
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
})
```

### Alertas Recomendados

- [ ] Error rate > 1%
- [ ] Response time > 3s
- [ ] 500 errors any
- [ ] Dead letter queue anomalias
- [ ] User session drop > 10%

---

## 📈 Logging Estruturado

### Setup com Pino

```bash
npm install pino pino-pretty
```

**Criar**: `src/lib/logging/logger.ts`
```typescript
import pino from 'pino'

const isProduction = process.env.NODE_ENV === 'production'

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  
  ...(isProduction ? {
    transport: undefined, // JSON para stdout
  } : {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      },
    },
  }),
  
  // Contexto padrão
  base: {
    service: 'treinamentos-frontend',
    version: process.env.NEXT_PUBLIC_VERSION || '0.1.0',
  },
})

// Usar em componentes:
// logger.info({ userId, action: 'login_success' })
// logger.error({ error: err.message, context: 'course_save' })
```

### Eventos Importantes a Logar

```typescript
// src/lib/logging/events.ts

export const events = {
  // Auth
  AUTH_LOGIN_SUCCESS: (email: string) => ({
    event: 'auth.login.success',
    email,
    timestamp: new Date(),
  }),

  AUTH_LOGIN_FAILED: (email: string, reason: string) => ({
    event: 'auth.login.failed',
    email,
    reason,
    timestamp: new Date(),
  }),

  AUTH_LOGOUT: (userId: string) => ({
    event: 'auth.logout',
    userId,
    timestamp: new Date(),
  }),

  // Course
  COURSE_CREATED: (courseId: string, instructorId: string) => ({
    event: 'course.created',
    courseId,
    instructorId,
    timestamp: new Date(),
  }),

  COURSE_SUBMITTED: (courseId: string) => ({
    event: 'course.submitted',
    courseId,
    timestamp: new Date(),
  }),

  // Lesson
  LESSON_VIDEO_STARTED: (lessonId: string, userId: string) => ({
    event: 'lesson.video.started',
    lessonId,
    userId,
    timestamp: new Date(),
  }),

  LESSON_COMPLETED: (lessonId: string, userId: string, duration: number) => ({
    event: 'lesson.completed',
    lessonId,
    userId,
    duration,
    timestamp: new Date(),
  }),

  // API
  API_ERROR: (endpoint: string, statusCode: number, error: string) => ({
    event: 'api.error',
    endpoint,
    statusCode,
    error,
    timestamp: new Date(),
    severity: 'high',
  }),

  // UI
  FORM_VALIDATION_ERROR: (formId: string, errors: string[]) => ({
    event: 'form.validation_error',
    formId,
    errorCount: errors.length,
    timestamp: new Date(),
  }),
}
```

### Dashboard de Logs (Recomendado)
- **DataDog**: Logs + APM
- **New Relic**: Full-stack observability
- **ELK Stack**: Self-hosted (Elasticsearch + Logstash + Kibana)
- **Grafana Loki**: Lightweight, self-hosted

---

## 🧪 Testes & Coverage

### Configuração Vitest

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
    
    // Coverage
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/__tests__/',
        '*.config.ts',
        'src/env.ts',
      ],
      lines: 80,
      functions: 80,
      branches: 70,
      statements: 80,
    },
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

### Coverage Target por Categoria

| Categoria | Target | Status |
|-----------|--------|--------|
| Components | 80% | 🟡 0% (novo setup) |
| Lib/Utils | 85% | 🟡 0% (novo setup) |
| Hooks | 90% | 🟡 0% (novo setup) |
| API | 85% | 🟡 0% (novo setup) |
| Pages | 70% | 🟡 0% (novo setup) |

### Executar Testes

```bash
# Todos os testes
npm test

# Watch mode
npm test -- --watch

# Coverage report
npm test -- --coverage

# Coverage HTML
open coverage/index.html
```

---

## 🔄 CI/CD Integration

### GitHub Actions (Recomendado)

**Criar**: `.github/workflows/frontend-ci.yml`
```yaml
name: Frontend CI

on:
  push:
    branches: [main, develop]
    paths:
      - 'frontend/**'
  pull_request:
    branches: [main, develop]
    paths:
      - 'frontend/**'

jobs:
  test:
    runs-on: ubuntu-latest
    working-directory: ./frontend

    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: 'frontend/package-lock.json'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Lint
        run: npm run lint
      
      - name: Type check
        run: npx tsc --noEmit
      
      - name: Tests
        run: npm test -- --coverage
      
      - name: Build
        run: npm run build
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          flags: frontend
          name: frontend-coverage

  performance:
    runs-on: ubuntu-latest
    needs: test

    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: 'frontend/package-lock.json'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Lighthouse audit
        uses: treosh/lighthouse-ci-action@v9
        with:
          configPath: './frontend/lighthouserc.json'
          uploadArtifacts: true
```

### package.json Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint --max-warnings 0",
    "type-check": "tsc --noEmit",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "e2e": "playwright test",
    "e2e:ui": "playwright test --ui",
    "analyze": "ANALYZE=true next build",
    "precommit": "npm run lint && npm run type-check"
  }
}
```

### Husky Pre-commit Hook

```bash
npm install -D husky lint-staged

npx husky install
npx husky add .husky/pre-commit "npx lint-staged"
```

**Criar**: `.lintstagedrc.json`
```json
{
  "*.{ts,tsx}": [
    "eslint --fix",
    "prettier --write"
  ],
  "*.{json,md}": [
    "prettier --write"
  ]
}
```

---

## 📱 Performance Profiling

### Chrome DevTools
1. Open DevTools (F12)
2. Go to Performance tab
3. Record user interaction
4. Analyze flame chart
5. Look for:
   - Long tasks > 50ms
   - Main thread blocking
   - Layouts/Paints

### React DevTools
```bash
npm install -D @react-devtools/shell
```

Features:
- Component tree inspection
- Props/state debugging
- Render profiling
- Highlight re-renders

### Next.js Analyze Bundle

```bash
ANALYZE=true npm run build
```

Gera relatório de bundle size por dependência.

---

## 🚀 Checklist de Deploy

### Antes de Deploy em Staging
- [ ] Testes passando (100% suite)
- [ ] Sem warnings do build
- [ ] Coverage > 80%
- [ ] Performance budget dentro dos limites
- [ ] Security headers validados
- [ ] Variáveis de env configuradas
- [ ] Logs configurados

### Antes de Deploy em Produção
- [ ] Code review aprovado
- [ ] E2E tests em staging passando
- [ ] Performance metrics validados
- [ ] Sentry integrado
- [ ] Backup de banco criado
- [ ] Rollback plan documentado
- [ ] Monitoring alerts ativos

---

## 📊 Dashboard Recomendado (Datadog/New Relic)

### Métricas Principais
```
┌─────────────────────────────────────────────────────┐
│           Frontend Performance Dashboard             │
├─────────────────────────────────────────────────────┤
│                                                       │
│ Active Users: 42         Error Rate: 0.2%            │
│ Page Load Time: 1.8s     Apdex: 0.95                 │
│ API Response: 240ms      SLA: 99.8% ✅               │
│                                                       │
├─────────────────────────────────────────────────────┤
│                                                       │
│ Top Pages by Traffic:                                │
│ 1. Dashboard        32% (avg 1.2s)                   │
│ 2. Admin/Users      24% (avg 1.8s)                   │
│ 3. Courses          20% (avg 2.1s)                   │
│ 4. Instructor       14% (avg 2.3s)                   │
│ 5. Reports          10% (avg 1.5s)                   │
│                                                       │
├─────────────────────────────────────────────────────┤
│                                                       │
│ Top Errors:                                          │
│ 1. API timeout (45%)    - Action: increase timeout   │
│ 2. Validation error (30%) - Action: improve UX       │
│ 3. Network error (20%)  - Action: retry logic        │
│ 4. Auth failed (5%)     - Action: monitor            │
│                                                       │
├─────────────────────────────────────────────────────┤
│                                                       │
│ Alertas Ativos: 0       Last Incident: 2h ago       │
│                                                       │
└─────────────────────────────────────────────────────┘
```

---

## 📝 Runbook de Troubleshooting

### Problema: Performance ruim em Production
```
1. Check New Relic/Datadog dashboard
2. Identificar página lenta
3. Profile com DevTools
4. Analisar bundle size
5. Verificar API latency
6. Rollback se necessário
```

### Problema: Erros críticos em Production
```
1. Verificar Sentry alerts
2. Check error rate vs baseline
3. Analisar error traces
4. Correlacionar com deploy
5. Rollback se necessário
6. Root cause analysis
```

### Problema: Baixa taxa de conversão/adesão
```
1. Analisar funnels no Analytics
2. Check user session recordings
3. Identificar pontos de abandono
4. A/B test melhorias
5. Monitor impacto de mudanças
```

---

**Data**: 2 de Maio de 2026  
**Versão**: 1.0  
**Status**: 🟢 Pronto para Implementação
