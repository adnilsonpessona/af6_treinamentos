# 📤 Guia de Envio para GitHub

## Pré-requisitos

1. **Conta GitHub** - Crie uma em [github.com](https://github.com)
2. **Git instalado** - [Instruções de instalação](https://git-scm.com/downloads)
3. **Autenticação configurada**

## Passo 1: Autenticação GitHub

### Opção A: SSH (Recomendado)

```bash
# Gerar chave SSH
ssh-keygen -t ed25519 -C "seu-email@example.com"

# Copiar a chave pública
cat ~/.ssh/id_ed25519.pub

# Adicionar a chave no GitHub:
# Settings > SSH and GPG keys > New SSH key
```

### Opção B: Personal Access Token

```bash
# Criar um PAT em: https://github.com/settings/tokens
# Copiar o token e usar como senha no git
```

## Passo 2: Criar Repositório no GitHub

1. Faça login em [github.com](https://github.com)
2. Clique em **+** (canto superior direito) → **New repository**
3. Preencha:
   - **Repository name**: `af6_treinamentos` (ou seu nome preferido)
   - **Description**: "Plataforma de Treinamentos - Backend .NET + Frontend Next.js"
   - **Public/Private**: Escolha a privacidade desejada
   - **NÃO** inicialize com README, .gitignore, ou license (já temos)

4. Clique em **Create repository**

## Passo 3: Adicionar Remote e Enviar

```bash
# Navegar para o projeto
cd /home/almpessona/af6_treinamentos

# Adicionar o repositório remoto (substitua YOUR-USERNAME e REPO-NAME)
git remote add origin git@github.com:YOUR-USERNAME/REPO-NAME.git

# Ou se usar HTTPS:
# git remote add origin https://github.com/YOUR-USERNAME/REPO-NAME.git

# Enviar o código
git push -u origin main
```

## Passo 4: Configurar Proteção de Secrets (GitHub Actions)

Se usar GitHub Actions para CI/CD:

1. Vá para **Settings** → **Secrets and variables** → **Actions**
2. Clique em **New repository secret**
3. Adicione cada variável:

```
POSTGRES_DB
POSTGRES_USER
POSTGRES_PASSWORD
ConnectionStrings__DefaultConnection
Jwt__Secret
Google__ClientId
Google__ClientSecret
Smtp__Host
Smtp__Port
Smtp__User
Smtp__Password
NEXTAUTH_SECRET
```

⚠️ **NUNCA** coloque secrets em workflows públicos!

## Passo 5: Proteger a Branch Principal (Recomendado)

1. Vá para **Settings** → **Branches**
2. Clique em **Add rule**
3. Proteja `main`:
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass
   - ✅ Require branches to be up to date

## Verificação de Segurança

```bash
# Verificar que nenhum arquivo sensível foi committed
git log --all --full-history -- .env
git log --all --full-history -- "*.key"
git log --all --full-history -- "*.pfx"

# Resultado esperado: "fatal: your current branch 'main' does not have any commits yet"
# Ou nenhum resultado
```

Se encontrar credenciais commitadas:

```bash
# 1. Instalar git-filter-repo
pip install git-filter-repo

# 2. Remover do histórico
git filter-repo --invert-paths --path .env

# 3. Force push (cuidado!)
git push origin main --force
```

## Colaboradores

Para adicionar colaboradores:

1. Vá para **Settings** → **Collaborators**
2. Clique em **Add people**
3. Digite o username e escolha a permissão

## Configurações Recomendadas

### 1. Configurar Branch Padrão
- **Settings** → **Branches** → Defina `main` como padrão

### 2. Proteger Secrets
- **Settings** → **Security & analysis**
  - ✅ Enable secret scanning
  - ✅ Enable push protection

### 3. Configurar Renovação de Dependências
- **Settings** → **Code security and analysis**
  - ✅ Enable Dependabot version updates
  - ✅ Enable Dependabot security updates

## Troubleshooting

### Erro: "fatal: Permission denied (publickey)"

```bash
# Verificar conexão SSH
ssh -T git@github.com

# Se falhar, configurar SSH novamente
ssh-keygen -t ed25519 -C "seu-email@example.com"
# E adicionar em GitHub Settings
```

### Erro: "fatal: The remote origin already exists"

```bash
git remote remove origin
git remote add origin git@github.com:YOUR-USERNAME/REPO-NAME.git
```

### Branch `master` em vez de `main`

```bash
# Renomear localmente
git branch -M main

# Enviar
git push -u origin main
```

## Próximos Passos

1. ✅ Configurar CI/CD (GitHub Actions)
2. ✅ Adicionar LICENSE
3. ✅ Configurar Wiki do projeto
4. ✅ Adicionar templates de issues
5. ✅ Configurar automatização

## Referências

- [GitHub Docs - Getting started](https://docs.github.com/en/get-started)
- [Git Documentation](https://git-scm.com/doc)
- [SSH Key Setup](https://docs.github.com/en/authentication/connecting-to-github-with-ssh)
- [Managing Secrets](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions)
