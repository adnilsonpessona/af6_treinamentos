# Security Guidelines

## Sensitive Information Protection

Este projeto utiliza variáveis de ambiente para proteger informações sensíveis. **NUNCA** faça commit de:

- Arquivos `.env` ou `.env.*.local`
- Senhas do banco de dados
- Chaves de API (Google, JWT, etc.)
- Credenciais SMTP
- Certificados ou chaves privadas

## Setting Up Environment Variables

### Development

1. **Backend (.NET)**
   ```bash
   cp .env.example .env
   ```
   Edite `.env` com suas credenciais locais de desenvolvimento

2. **Docker Compose**
   ```bash
   docker-compose up
   ```
   O Docker Compose carregará as variáveis do arquivo `.env`

### Production

1. **Configure as variáveis de ambiente**
   ```bash
   cp .env.prod.example .env.prod
   ```

2. **Use um gerenciador de secrets**
   - Para AWS: AWS Secrets Manager ou Systems Manager Parameter Store
   - Para Azure: Azure Key Vault
   - Para Docker Swarm: Docker Secrets
   - Para Kubernetes: Kubernetes Secrets

3. **Nunca commit arquivos de produção**

## Git Protection

O projeto está configurado com um `.gitignore` robusto que protege:

- `.env` e `.env.*.local` - Arquivos de ambiente
- `*.key` e `*.pfx` - Certificados e chaves privadas
- `obj/` e `bin/` - Diretórios de build

## Environment Variables

### Obrigatórias (Banco de Dados)
- `POSTGRES_DB` - Nome do banco de dados
- `POSTGRES_USER` - Usuário do PostgreSQL
- `POSTGRES_PASSWORD` - **Senha segura do PostgreSQL**
- `ConnectionStrings__DefaultConnection` - String de conexão .NET

### Obrigatórias (Autenticação)
- `Jwt__Secret` - **Chave JWT (mínimo 32 caracteres)**
- `NEXTAUTH_SECRET` - **Chave NextAuth (mínimo 32 caracteres)**

### Recomendadas (Funcionalidades)
- `Google__ClientId` e `Google__ClientSecret` - OAuth Google
- `Smtp__*` - Configurações de email

## Best Practices

1. **Use senhas fortes**
   - Mínimo 16 caracteres para banco de dados
   - Mínimo 32 caracteres para chaves criptográficas

2. **Regenere chaves regularmente**
   - Especialmente em produção

3. **Monitore acessos**
   - Verifique logs de acesso ao banco de dados
   - Configure alertas para atividades suspeitas

4. **Use HTTPS em produção**
   - Configure certificados SSL/TLS

5. **Revise o histórico Git**
   ```bash
   # Se acidentalmente fez commit de credenciais:
   git-filter-repo --invert-paths --path .env
   # E depois force push (cuidado!)
   ```

## For Contributors

Antes de fazer commit:

```bash
# Verifique se há arquivos sensíveis
git status

# Confirme que apenas arquivos públicos estão sendo adicionados
git diff --cached
```

Caso envie credenciais acidentalmente:
1. Notifique o maintainer imediatamente
2. Revogue as credenciais
3. Use `git-filter-repo` para remover do histórico
4. Force push (apenas se autorizado)

## References

- [OWASP Secrets Management](https://owasp.org/www-community/Sensitive_Data_Exposure)
- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)
- [Twelve Factor App - Config](https://12factor.net/config)
