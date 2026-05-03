# Plataforma de Treinamentos Corporativos

Plataforma web para gestão e consumo de treinamentos corporativos, com suporte a vídeos, quizzes, trilhas de aprendizado e acompanhamento de progresso.

## Visão Geral

| Camada      | Tecnologia                        |
|-------------|-----------------------------------|
| Frontend    | Next.js 15, TypeScript, Tailwind  |
| Backend     | ASP.NET Core 10, EF Core          |
| Banco       | PostgreSQL 16                     |
| Auth        | NextAuth v5 + JWT                 |
| Infra       | Docker / Docker Compose           |

---

## Pré-requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Windows/macOS) ou Docker Engine + Docker Compose v2 (Linux)
- WSL2 habilitado no Windows (recomendado para melhor performance)
- Git

---

## Iniciando em Desenvolvimento

### 1. Clone o repositório

```bash
git clone <repo-url>
cd af6_treinamentos
```

### 2. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` e preencha as variáveis obrigatórias:

| Variável | Descrição |
|---|---|
| `POSTGRES_PASSWORD` | Senha do banco de dados |
| `Jwt__Secret` | Chave secreta JWT com no mínimo 32 caracteres |
| `NEXTAUTH_SECRET` | Segredo do frontend |
| `INTERNAL_API_URL` | URL interna da API para o frontend em Docker (`http://api:5000`) |
| `NEXT_PUBLIC_API_URL` | URL pública da API no navegador (`http://localhost:5000`) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Credenciais OAuth Google (opcional) |
| `Smtp__*` | Configurações de e-mail (opcional) |

### 3. Suba o ambiente de desenvolvimento

```bash
docker compose up --build
```

Aguarde todos os serviços subirem. Nesse modo:
- a API roda com `dotnet watch`
- o frontend roda com `next dev`
- alterações em `backend/` e `frontend/` refletem sem rebuild manual de imagem

Endereços do ambiente:
- **Frontend**: http://localhost:3000
- **API**: http://localhost:5000
- **PostgreSQL**: localhost:5433

### 4. Observações de desenvolvimento

- O `docker-compose.yml` é o ambiente de desenvolvimento.
- O frontend usa bind mount do código local.
- O backend usa `dotnet watch`.
- Na primeira subida, o frontend instala dependências no volume nomeado antes de abrir a porta 3000.
- Depois da primeira instalação, o container reaproveita `node_modules` e sobe muito mais rápido.
- Se instalar novas dependências no frontend, pode ser necessário recriar o serviço:

```bash
docker compose up -d --build frontend
```

---

## Rodando Migrations

Em ambiente de desenvolvimento, a API aplica migrations automaticamente ao iniciar.

Se quiser executar manualmente:

```bash
docker compose exec api dotnet ef database update
```

Para criar uma nova migration:

```bash
docker compose exec api dotnet ef migrations add <NomeDaMigration> \
  --project src/Treinamentos.Infrastructure \
  --startup-project src/Treinamentos.API
```

---

## Estrutura do Projeto

```
af6_treinamentos/
├── docs/                        # Documentação adicional
├── frontend/                    # Aplicação Next.js
│   ├── src/
│   │   ├── app/                 # App Router (páginas e layouts)
│   │   ├── components/          # Componentes reutilizáveis
│   │   ├── lib/                 # Utilitários e helpers
│   │   └── types/               # Tipos TypeScript globais
│   └── Dockerfile
├── backend/                     # API ASP.NET Core 10
│   ├── src/
│   │   ├── Treinamentos.API/            # Controllers, Program.cs
│   │   ├── Treinamentos.Domain/         # Entidades e interfaces
│   │   ├── Treinamentos.Application/    # Use cases, DTOs, services
│   │   └── Treinamentos.Infrastructure/ # EF Core, repositórios
│   └── Dockerfile
├── videos/                      # Volume local de vídeos (dev)
├── docker-compose.yml
├── docker-compose.prod.yml
├── .env.example
└── README.md
```

---

## Deploy em Produção

O ambiente de produção usa o compose base junto com o override em `docker-compose.prod.yml`.

### 1. Configure o servidor

- Instale Docker Engine e Docker Compose v2
- Configure o IIS como reverse proxy (Windows Server) ou Nginx (Linux)

### 2. Suba com override de produção

```bash
cp .env.example .env
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

Nesse modo:
- o frontend roda a partir da imagem buildada via `frontend/Dockerfile`
- a API roda a partir da imagem publicada via `backend/Dockerfile`
- o override de produção remove o hot reload e aplica política de restart

### 3. IIS como Reverse Proxy (Windows Server)

Instale o módulo **Application Request Routing (ARR)** e configure um site no IIS apontando para:
- `http://localhost:3000` — Frontend
- `http://localhost:5000` — API (prefixo `/api`)

Exemplo de `web.config` para o IIS:

```xml
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="Frontend" stopProcessing="true">
          <match url="(.*)" />
          <action type="Rewrite" url="http://localhost:3000/{R:1}" />
        </rule>
      </rules>
    </rewrite>
  </system.webServer>
</configuration>
```

> Em produção, os containers não expõem portas diretamente ao host — todo o tráfego passa pelo reverse proxy.

---

## Comandos Úteis

```bash
# Subir ambiente de desenvolvimento
docker compose up --build

# Subir em background
docker compose up -d --build

# Ver logs de um serviço
docker compose logs -f api

# Ver logs do frontend
docker compose logs -f frontend

# Recriar apenas o frontend
docker compose up -d --build frontend

# Recriar apenas a API
docker compose up -d --build api

# Parar tudo
docker compose down

# Acessar o banco de dados
docker compose exec postgres psql -U treinamentos_user -d treinamentos

# Parar tudo e remover volumes
docker compose down -v
```
