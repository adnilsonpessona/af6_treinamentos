# Stack e Arquitetura — Plataforma de Treinamentos

## Visão Geral

Plataforma interna corporativa para postagem e consumo de treinamentos em vídeo e texto por funcionários da empresa. Hospedada em servidor Windows on-premise com acesso via rede interna e externa (internet).

---

## Stack Tecnológica

### Frontend
- **Framework:** Next.js (versão mais recente LTS)
- **Linguagem:** TypeScript
- **Estilização:** Tailwind CSS
- **Gerenciador de pacotes:** npm
- **Player de vídeo:** video.js ou react-player (com suporte a range requests e rastreamento de progresso)
- **Autenticação client-side:** next-auth (para integração com Google OAuth e sessão JWT)

### Backend
- **Framework:** ASP.NET Core 10
- **Linguagem:** C#
- **ORM:** Entity Framework Core 10 com provider Npgsql (PostgreSQL)
- **Autenticação:** JWT Bearer Tokens
- **Envio de e-mail:** SMTP via MailKit
- **Geração de PDF:** QuestPDF (para download de conteúdo de texto)
- **Streaming de vídeo:** endpoint próprio com suporte a HTTP Range Requests

### Banco de Dados
- **SGBD:** PostgreSQL 16
- **Migrations:** EF Core Migrations (code-first)
- **Naming convention:** snake_case para tabelas e colunas

### Infraestrutura e DevOps
- **Containerização:** Docker com Docker Compose
- **Ambiente de desenvolvimento:** WSL2 + Docker Desktop no Windows
- **IDE:** VS Code com extensões C# Dev Kit, ESLint, Prettier, Docker
- **Servidor de produção:** Windows Server com Docker Engine e IIS como reverse proxy
- **SSL:** Certificado corporativo ou Let's Encrypt via win-acme

---

## Arquitetura da Solução

```
/treinamentos                  ← raiz do repositório
  /docs                        ← toda a documentação do projeto
  /frontend                    ← projeto Next.js
    /src
      /app                     ← App Router do Next.js
      /components              ← componentes reutilizáveis
      /lib                     ← utilitários, helpers, configurações
      /types                   ← tipos TypeScript globais
    Dockerfile
    package.json
    next.config.ts
    tailwind.config.ts
  /backend                     ← projeto ASP.NET Core 10
    /src
      /Treinamentos.API        ← projeto principal (Controllers, Program.cs)
      /Treinamentos.Domain     ← entidades, interfaces, enums
      /Treinamentos.Application← serviços, DTOs, casos de uso
      /Treinamentos.Infrastructure← EF Core, repositórios, e-mail, storage
    Dockerfile
    Treinamentos.sln
  docker-compose.yml           ← ambiente de desenvolvimento
  docker-compose.prod.yml      ← overrides de produção
  .env.example                 ← variáveis de ambiente de exemplo (vai para o git)
  .env                         ← variáveis reais (NÃO vai para o git)
  .gitignore
  README.md
```

---

## Arquitetura em Camadas — Backend

O backend segue arquitetura em camadas com separação clara de responsabilidades:

```
Controllers (API)
    └── Application (Services + DTOs)
            └── Domain (Entities + Interfaces)
            └── Infrastructure (EF Core + Repositórios + E-mail + Storage)
```

- **Controllers:** recebem requisições HTTP, validam entrada, delegam para os Services
- **Application:** orquestra regras de negócio, não conhece banco nem HTTP
- **Domain:** entidades puras, enums, interfaces de repositório — sem dependências externas
- **Infrastructure:** implementações concretas — EF Core DbContext, repositórios, envio de e-mail, armazenamento de arquivos

---

## Comunicação Frontend ↔ Backend

- Toda comunicação via **API REST** em JSON
- Autenticação via **JWT Bearer Token** no header `Authorization`
- O Next.js consome a API via `fetch` no lado do servidor (Server Components) e no cliente quando necessário
- CORS configurado para aceitar apenas a origem do frontend
- Prefixo de rota da API: `/api/v1/`

---

## Deploy no Windows Server

```
Internet → Firewall (porta 443) → IIS (reverse proxy + SSL)
    ├── / → container Next.js (porta 3000)
    └── /api → container ASP.NET Core (porta 5000)

PostgreSQL → container postgres (porta 5432, rede interna apenas)
Vídeos → pasta C:\videos mapeada como volume no container da API
```

O IIS termina o SSL. Os containers trafegam internamente em HTTP simples.
