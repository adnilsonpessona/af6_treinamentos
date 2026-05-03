# 🤝 Guia de Contribuição

## Bem-vindo!

Obrigado por considerar contribuir para a **Plataforma de Treinamentos**! 

Este documento fornece diretrizes e instruções para contribuir de forma efetiva e segura.

## Segurança em Primeiro Lugar

### 🔒 Proteção de Credenciais

**NUNCA** faça commit de:
- Arquivos `.env` ou `.env.*.local`
- Senhas ou tokens
- Chaves de API (Google, JWT, etc.)
- Certificados ou chaves privadas

### Pre-commit Hooks

O projeto possui hooks automáticos para prevenir commits de arquivos sensíveis:

```bash
# Já configurado automaticamente
git config core.hooksPath .githooks
```

Se o hook rejeitar seu commit:

1. **Verifique o que tentou fazer commit:**
   ```bash
   git diff --cached | grep -i "password\|secret\|api_key"
   ```

2. **Remova do staging:**
   ```bash
   git reset HEAD <arquivo>
   ```

3. **Adicione ao .gitignore se necessário:**
   ```bash
   echo "*.sensitive" >> .gitignore
   ```

## Configuração Inicial

### 1. Fork do Repositório
```bash
# No GitHub, clique em "Fork"
```

### 2. Clone seu Fork
```bash
git clone https://github.com/SEU-USERNAME/af6_treinamentos.git
cd af6_treinamentos
```

### 3. Configure Variáveis de Ambiente
```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Edite com seus valores locais
nano .env  # ou seu editor preferido
```

### 4. Instale Dependencies
```bash
# Backend (.NET)
cd backend
dotnet restore

# Frontend (Node.js)
cd ../frontend
npm ci
```

### 5. Inicie o Projeto
```bash
# Na raiz do projeto
docker-compose up -d
```

## Fluxo de Contribuição

### 1. Crie uma Branch
```bash
# Update main
git fetch origin
git checkout main
git pull origin main

# Crie sua branch
git checkout -b feature/descricao-da-feature
# ou
git checkout -b fix/descricao-do-bug
```

### 2. Faça suas Mudanças
```bash
# Edite os arquivos
# Teste suas mudanças

# Verifique o que vai fazer commit
git diff
git diff --cached

# Adicione os arquivos
git add .

# Commit com mensagem clara
git commit -m "type(scope): descrição concisa"
```

### 3. Commit Message Format

Use **Conventional Commits**:

```
type(scope): subject

body

footer
```

**Types:**
- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Alterações em documentação
- `style`: Formatação, código sem mudança lógica
- `refactor`: Refatoração sem mudança de funcionalidade
- `perf`: Melhoria de performance
- `test`: Testes
- `chore`: Atualizações de dependências, etc.

**Exemplos:**
```
feat(auth): adicionar autenticação com Google

fix(database): corrigir problema de timeout
docs(readme): atualizar instruções de setup
```

### 4. Push e Pull Request
```bash
# Push your branch
git push origin feature/sua-feature

# Abra um Pull Request no GitHub
```

## Padrões de Código

### C# / .NET Backend

```csharp
// Naming conventions
public class UserService { }  // PascalCase para classes
public async Task<User> GetUserAsync(int id) { }  // PascalCase para métodos

// Use async/await
public async Task<User> GetUserAsync(int id)
{
    return await _repository.GetUserAsync(id);
}

// Documentação XML
/// <summary>
/// Obtém um usuário pelo ID
/// </summary>
/// <param name="id">ID do usuário</param>
/// <returns>Usuário encontrado ou null</returns>
public async Task<User> GetUserAsync(int id)
{
    // ...
}
```

### TypeScript / React Frontend

```typescript
// Naming conventions
const UserCard: React.FC<UserProps> = ({ user }) => {};  // PascalCase
const useUserData = () => {};  // camelCase e use* para hooks
const fetchUserData = async () => {};  // camelCase para funções

// Tipos bem definidos
interface UserProps {
    user: IUser;
    onUpdate: (user: IUser) => void;
}

// Componentes funcionais com TypeScript
const UserCard: React.FC<UserProps> = ({ user, onUpdate }) => {
    return (
        <div className="...">
            {user.name}
        </div>
    );
};
```

## Testes

### Backend Tests
```bash
cd backend
dotnet test
```

### Frontend Tests
```bash
cd frontend
npm run test
```

**Requisitos:**
- Testes unitários para novas funcionalidades
- Cobertura mínima de 80%
- Todos os testes devem passar antes do PR

## Documentação

Atualize a documentação para:
- Novas features
- Mudanças em APIs
- Mudanças na arquitetura
- Instruções de setup

Arquivos de referência:
- [docs/](./docs/) - Documentação técnica
- [FRONTEND_*.md](.) - Documentação do frontend
- [README.md](./README.md) - Overview do projeto

## Review Process

1. **Automated Checks:**
   - Testes devem passar
   - Sem conflitos com main
   - Código formatado corretamente

2. **Code Review:**
   - Mínimo 1 aprovação obrigatória
   - Feedback construtivo e educativo
   - Discussão aberta de decisões de design

3. **Merge:**
   - Squash commits para história limpa
   - Delete branch após merge

## Troubleshooting

### Problema: Pre-commit hook rejeita commit
```bash
# Verificar what's being staged
git diff --cached

# Remover arquivo específico
git reset HEAD <arquivo>

# Ou desabilitar temporariamente (NÃO RECOMENDADO)
git commit --no-verify
```

### Problema: Conflitos ao fazer merge
```bash
# Antes de fazer push, sincronize com main
git fetch origin
git rebase origin/main

# Resolva conflitos nos arquivos
# Teste tudo novamente
git add .
git rebase --continue
git push -f origin feature/sua-feature
```

### Problema: Preciso remover um commit
```bash
# Ver últimos commits
git log --oneline

# Se ainda não fez push
git reset --soft HEAD~1  # Mantém mudanças no staging
git reset --hard HEAD~1  # Descarta mudanças

# Se já fez push
git revert <commit-hash>
git push origin main
```

## Report Issues

Encontrou um bug? Abra uma issue com:

1. **Título claro** - Descreva o problema
2. **Descrição** - Passo-a-passo para reproduzir
3. **Esperado vs Atual** - Qual era o comportamento esperado?
4. **Screenshots/logs** - Se aplicável
5. **Environment** - Seu SO, versão .NET, versão Node, etc.

## Questions?

- 💬 Abra uma Discussion
- 📧 Entre em contato pelo email
- 📖 Leia a [documentação](./docs/)

---

**Obrigado por contribuir! 🎉**

Suas contribuições, independente do tamanho, ajudam a tornar este projeto melhor!
