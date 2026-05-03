# 🎓 Plataforma de Treinamentos - Implementação Concluída

## ✅ Status Final: COMPLETO E DEPLOYADO

Data: 2026-05-01  
Ambiente: Development (Docker Compose)  
Versão: 1.0 - Multi-tenant com Hierarquia de Categorias

---

## 📋 Resumo das Funcionalidades Implementadas

### 1. **Suporte Multi-Tenant por Empresa (Empresa/Revenda)**
✅ **Concluído e Testado**

- **Entidade Company**: Modelo completo com campos:
  - `empresa` (int): Identificador da empresa
  - `revenda` (int): Identificador da revenda
  - `razaoSocial` (string): Razão social
  - `nomeFantasia` (string): Nome fantasia
  - `cnpj` (string, único): CNPJ com 14 dígitos
  - `isActive` (bool): Status ativo/inativo

- **Relacionamentos Validados**:
  - Users → Companies (opcional, Many-to-One)
  - Courses → Companies (obrigatório, Many-to-One)
  - Validações: CNPJ único, par (Empresa, Revenda) único

- **Endpoints de Administração**:
  - `GET /api/v1/companies` - Listar empresas
  - `POST /api/v1/companies` - Criar empresa
  - `PUT /api/v1/companies/{id}` - Editar empresa
  - `PATCH /api/v1/companies/{id}/activate` - Ativar
  - `PATCH /api/v1/companies/{id}/deactivate` - Desativar

### 2. **Hierarquia de Categorias por Departamento**
✅ **Concluído e Testado**

- **Estrutura Implementada**:
  - Categorias: Entidades pai com `Department` obrigatório
  - Subcategorias: Self-referencing via `ParentCategoryId`
  - Constraint único: (Department, ParentCategoryId, Name)
  - Validação: Subcategorias não podem ter outras subcategorias como pai

- **Validações de Negócio**:
  - Subcategoria deve estar no mesmo departamento que a categoria pai
  - Impossível criar "subcategoria-de-subcategoria"
  - Departamento é campo requerido para todas as categorias

- **API Endpoints**:
  - `GET /api/v1/categories` - Listar com hierarquia
  - `POST /api/v1/categories` - Criar (com validação de hierarquia)
  - `PUT /api/v1/categories/{id}` - Editar
  - `PATCH /api/v1/categories/{id}/activate` - Ativar
  - `PATCH /api/v1/categories/{id}/deactivate` - Desativar

### 3. **Filtro de Visibilidade de Cursos por Empresa + Departamento**
✅ **Concluído e Pronto**

- **Campos de Curso Estendidos**:
  - `CompanyId` (Guid, obrigatório): Empresa proprietária
  - `Department` (string, obrigatório): Departamento
  - `SubCategoryId` (Guid, obrigatório): Subcategoria
  - `AvailableForAllCompanies` (bool): Visível para todas empresas
  - `AvailableForAllDepartments` (bool): Visível para todos departamentos

- **Lógica de Filtro Implementada** (CourseRepository):
  ```
  Curso é visível se:
    (AvailableForAllCompanies OR CompanyId == userCompanyId)
    AND
    (AvailableForAllDepartments OR Department == userDepartment)
  ```

- **Segurança nos Endpoints**:
  - `StreamVideo()`: Valida acesso via `GetCourseDetailAsync()`
  - `DownloadPdf()`: Valida acesso via `GetCourseDetailAsync()`
  - Usuários não-admin/instructor bloqueados se não passam na visibilidade

### 4. **Linkagem de Usuários a Empresas**
✅ **Concluído e Validado**

- **Campo em User**:
  - `CompanyId` (Guid?, nullable): Referência à empresa
  - Validação: Funcionário (role 4) DEVE ter companyId

- **Comportamentos**:
  - Usuário Funcionário → REQUERIDO ter CompanyId
  - Usuário Administrador/Gestor/Instrutor → CompanyId opcional
  - FK Restrict: Empresa não pode ser deletada se tem usuários

### 5. **Contexto de Empresa no JWT**
✅ **Concluído**

- **Claims JWT Estendidos**:
  - `"sub"`: user ID
  - `"email"`: user email
  - `"role"`: user role
  - `"department"`: user department
  - **`"companyId"`**: company ID (novo) ✨

- **AuthResponse Estendida**:
  - `CompanyId` (Guid?)
  - `CompanyName` (string?)
  - `Department` (string)

---

## 🗄️ Banco de Dados - Migração Aplicada

### Mudanças no Schema

**Nova Tabela:**
- `companies` - 7 colunas (id, empresa, revenda, razao_social, nome_fantasia, cnpj, is_active, created_at, updated_at)

**Tabela Users (Estendida):**
- ➕ `company_id` (uuid, nullable, FK com Restrict)

**Tabela Categories (Estendida):**
- ➕ `department` (varchar 100, not null)
- ➕ `parent_category_id` (uuid, nullable, FK self-referencing)
- ❌ Removido: unique index em (name)
- ➕ Novo: unique index em (department, parent_category_id, name)

**Tabela Courses (Estendida):**
- ➕ `company_id` (uuid, not null, FK)
- ➕ `department` (varchar 100, not null)
- ➕ `sub_category_id` (uuid, not null, FK)
- ➕ `available_for_all_companies` (boolean, default false)
- ➕ `available_for_all_departments` (boolean, default false)

**Índices Criados:**
- `i_x_companies_cnpj` (único)
- `i_x_companies_empresa_revenda` (composto, único)
- `i_x_categories_parent_category_id`
- `i_x_categories_department_parent_category_id_name` (composto, único)
- `i_x_courses_company_id`
- `i_x_courses_sub_category_id`
- `i_x_users_company_id`

**Status da Migração:**
- ✅ Arquivo: `20260501185223_AddCompaniesAndCategoryHierarchy`
- ✅ Aplicada ao banco de dados
- ✅ Referential integrity com `OnDelete(DeleteBehavior.Restrict)` em FKs

---

## 🚀 Deployment - Status de Serviços

### Containers em Execução

```
✓ treinamentos-postgres    (PostgreSQL 16-Alpine)
  └─ Port: 0.0.0.0:5433 → 5432/tcp
  └─ Status: Healthy

✓ treinamentos-api         (.NET 10 API)
  └─ Port: 0.0.0.0:5000 → 5000/tcp
  └─ Status: Running (listening on http://[::]:5000)
  └─ Migrations: Applied (0 pending)

✓ treinamentos-frontend    (Next.js 15.3.1)
  └─ Port: 0.0.0.0:3000 → 3000/tcp
  └─ Status: Ready
```

### Testes de Validação ✅

**Teste 1: Login com JWT**
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"testadmin@example.com","password":"test123"}'
→ ✅ Token JWT retornado com claims incluindo companyId
```

**Teste 2: Company Management**
```bash
POST /api/v1/companies (Admin only)
→ ✅ Empresa criada com validações (CNPJ único, Empresa/Revenda único)
```

**Teste 3: Category Hierarchy**
```bash
POST /api/v1/categories (Department + ParentCategoryId)
→ ✅ Categoria pai criada
→ ✅ Subcategoria criada sob categoria pai
→ ✅ Validação: Subcategoria está no mesmo departamento
```

---

## 📱 Frontend - Componentes Atualizados

### Páginas Novas
- ✅ `/admin/companies` - Gerenciamento de empresas (CRUD + activate/deactivate)

### Componentes Reescritos
- ✅ **AdminCompaniesManager.tsx** - Novo, com form inline e search
- ✅ **AdminCategoriesManager.tsx** - Reescrito, mostra hierarquia por departamento
- ✅ **AdminUsersManager.tsx** - Estendido com seleção de empresa

### Componentes para Cursos
- ✅ **NewCourseForm.tsx** - Reescrito, requer: Company → Department → Category → Subcategory
- ✅ **InstructorCourseEditor.tsx** - Estendido com campos de visibilidade

### UI/UX Melhorias
- ✅ **AppSidebar.tsx** - Toggle de collapse + link `/admin/companies`
- ✅ Todos os dropdowns com validação de hierarquia
- ✅ Campos de visibilidade (checkboxes) para empresa/departamento

### Tipos TypeScript Atualizados
- ✅ `User` - `companyId?`, `companyName?`
- ✅ `Category` - `department`, `parentCategoryId`, `parentCategoryName`
- ✅ `Course` - `companyId`, `companyName`, `department`, `subCategoryId`, `subCategoryName`, visibility flags
- ✅ Novo: `Company` interface

---

## 🔐 Segurança e Autorização

### Implementado
- ✅ `[Authorize(Roles = "Administrador")]` em CompaniesController
- ✅ Media endpoints (StreamVideo, DownloadPdf) validam acesso via company/department
- ✅ ReportService filtra cursos pela visibilidade
- ✅ JWT claims incluem companyId para contexto no frontend
- ✅ Validações de negócio:
  - Funcionário DEVE ter empresa
  - Empresa não pode ser deletada com usuários
  - Subcategoria deve ser do mesmo departamento

---

## 📊 DTOs Alterados

### Company
```csharp
// CreateCompanyRequest
{
  "empresa": 1,
  "revenda": 100,
  "razaoSocial": "Company Ltd",
  "nomeFantasia": "Company",
  "cnpj": "12345678901234"
}

// CompanyResponse
{
  "id": "guid",
  "empresa": 1,
  "revenda": 100,
  "razaoSocial": "...",
  "nomeFantasia": "...",
  "cnpj": "...",
  "isActive": true,
  "createdAt": "2026-05-01T..."
}
```

### Category
```csharp
// CreateCategoryRequest (novo)
{
  "name": "HR Training",
  "department": "RH",           // ← novo obrigatório
  "parentCategoryId": null      // ← novo opcional
}

// CategoryResponse (novo)
{
  "id": "guid",
  "name": "...",
  "department": "RH",           // ← novo
  "parentCategoryId": null,     // ← novo
  "parentCategoryName": null,   // ← novo
  "isActive": true
}
```

### Course
```csharp
// CreateCourseRequest (estendido)
{
  "title": "...",
  "description": "...",
  "companyId": "guid",                    // ← novo obrigatório
  "department": "RH",                     // ← novo obrigatório
  "categoryId": "guid",                   // ← existente (parent)
  "subCategoryId": "guid",                // ← novo obrigatório
  "availableForAllCompanies": false,      // ← novo
  "availableForAllDepartments": false,    // ← novo
  "instructorId": "guid",
  "durationMinutes": 60,
  "videoUrl": "...",
  "resources": "..."
}

// CourseResponse (estendido)
{
  "id": "guid",
  "title": "...",
  "companyId": "guid",
  "companyName": "Company A",
  "department": "RH",
  "categoryId": "guid",
  "categoryName": "HR Training",
  "subCategoryId": "guid",
  "subCategoryName": "Onboarding",
  "availableForAllCompanies": false,
  "availableForAllDepartments": false,
  "instructorId": "guid",
  "isActive": true,
  ...
}
```

### User
```csharp
// CreateUserRequest (estendido)
{
  "email": "...",
  "fullName": "...",
  "cpf": "...",
  "department": "...",
  "jobTitle": "...",
  "role": 4,                // Funcionário
  "companyId": "guid"       // ← novo obrigatório para Funcionário
}

// UserResponse (estendido)
{
  "id": "guid",
  "email": "...",
  "fullName": "...",
  "department": "...",
  "role": 4,
  "companyId": "guid",      // ← novo
  "companyName": "...",     // ← novo
  "status": 2,
  "createdAt": "..."
}
```

---

## 🛠️ Stack Técnico

- **Backend**: .NET 10 / C# / ASP.NET Core 10
- **Frontend**: Next.js 15.3.1 / React 18 / TypeScript 5
- **Database**: PostgreSQL 16 (Alpine)
- **ORM**: Entity Framework Core 10
- **Auth**: JWT (8h expiration)
- **API**: REST, 15 endpoints (v1)
- **Containers**: Docker + Docker Compose
- **Build**: Multi-stage Dockerfile (both backend & frontend)

---

## 📝 Instruções para Executar

### Iniciar Sistema
```bash
cd /home/almpessona/af6_treinamentos

# Construir imagens (se necessário)
docker compose build

# Iniciar containers
docker compose up -d

# Verificar status
docker compose ps

# Ver logs
docker compose logs -f api    # Backend
docker compose logs -f frontend  # Frontend
```

### Acessar Aplicação
- **Frontend**: http://localhost:3000
- **API Docs**: http://localhost:5000/swagger
- **Database**: localhost:5433 (via PostgreSQL client)

### Parar Sistema
```bash
docker compose down

# Com limpeza de volumes
docker compose down -v
```

---

## ✨ Melhorias Futuras (Roadmap)

1. **Advanced Visibility**
   - Permissions granulares (por usuário/grupo)
   - Compartilhamento de cursos entre departamentos

2. **Reporting**
   - Dashboard de progresso por empresa/departamento
   - Analytics de conclusão

3. **Performance**
   - Cache de categorias
   - Pagination nos endpoints
   - Full-text search em cursos

4. **DevOps**
   - CI/CD pipeline (GitHub Actions)
   - Staging/Production environments
   - Database backups automáticos

---

## 📞 Suporte

- **Documentação**: Ver `/backend/Treinamentos.slnx` e `/frontend/src/`
- **API Swagger**: http://localhost:5000/swagger (em desenvolvimento)
- **Testes**: Scripts em `/test-features.sh` e `/test-visibility-features.sh`

---

**Versão**: 1.0  
**Data**: 2026-05-01  
**Status**: ✅ Pronto para Produção (com ajustes de segurança/secrets)
