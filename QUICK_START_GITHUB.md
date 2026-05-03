# 🎯 REFERÊNCIA RÁPIDA - ENVIO PARA GITHUB

## ⏱️ TEMPO: 5 MINUTOS

```bash
# 1. Criar repo em https://github.com/new
# 2. Configurar SSH
# 3. Fazer push (3 linhas abaixo)

git remote add origin git@github.com:USERNAME/af6_treinamentos.git
git push -u origin main
# PRONTO! 🚀
```

---

## 📌 PASSO-A-PASSO VISUAL

```
┌─────────────────────────────────────────────────────────┐
│ PASSO 1: Criar Repositório GitHub                      │
├─────────────────────────────────────────────────────────┤
│ URL: https://github.com/new                            │
│ Nome: af6_treinamentos                                 │
│ Descrição: Plataforma de Treinamentos                  │
│ Privacidade: Public (portfólio) ou Private             │
│ ✅ Botão: Create repository                            │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ PASSO 2: Configurar SSH (1ª vez apenas)                │
├─────────────────────────────────────────────────────────┤
│ Terminal:                                              │
│ $ ssh-keygen -t ed25519 -C "seu@email.com"            │
│ $ cat ~/.ssh/id_ed25519.pub                           │
│                                                        │
│ GitHub:                                                │
│ Settings > SSH and GPG keys > New SSH key             │
│ Cole a chave, clique "Add SSH key"                    │
│                                                        │
│ Teste:                                                 │
│ $ ssh -T git@github.com                               │
│ Esperado: "Hi USERNAME! You've successfully..."       │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ PASSO 3: Fazer Push                                    │
├─────────────────────────────────────────────────────────┤
│ cd /home/almpessona/af6_treinamentos                   │
│                                                        │
│ git remote add origin \                               │
│   git@github.com:USERNAME/af6_treinamentos.git       │
│                                                        │
│ git push -u origin main                               │
│                                                        │
│ Espere ... carregando 268 arquivos ...                │
│ Pronto! ✅                                             │
└─────────────────────────────────────────────────────────┘
```

---

## 🔐 PROTEÇÃO IMPLEMENTADA

| Camada | Proteção | Status |
|--------|----------|--------|
| **Arquivo** | `.gitignore` ignora `.env` | ✅ |
| **Hook** | Pre-commit bloqueia credenciais | ✅ |
| **Histórico** | Nenhuma credencial commitada | ✅ |
| **Documentação** | Guia de segurança incluído | ✅ |

---

## 📝 USAR LOCALMENTE

```bash
cd /home/almpessona/af6_treinamentos

# Copiar template
cp .env.example .env

# Editar valores
nano .env

# Iniciar
docker-compose up -d

# Acessar
# Frontend: http://localhost:3000
# API: http://localhost:5000
```

---

## ✅ DEPOIS DE ENVIAR

```bash
# Confirmar que está no GitHub
git remote -v
# Esperado: origin -> git@github.com:USERNAME/af6_treinamentos.git

# Verificar histórico
git log --oneline

# Verificar branch
git branch
# Esperado: * main
```

---

## 🆘 ERROS COMUNS

| Erro | Solução |
|------|---------|
| `Permission denied (publickey)` | Regenerar SSH: `ssh-keygen -t ed25519` |
| `remote origin already exists` | `git remote remove origin` e refazer |
| `Pre-commit hook rejeita commit` | Normal! Significa que você tentou fazer commit de `.env`. Use `.env.example` |
| `No commits yet on main` | Fazer primeiro commit local: `git commit --allow-empty ...` |

---

## 📚 DOCUMENTAÇÃO

| Arquivo | Propósito |
|---------|----------|
| [ENVIO_GITHUB.md](ENVIO_GITHUB.md) | Instruções com mais detalhes |
| [SECURITY.md](SECURITY.md) | Proteção de credenciais |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Guia para contribuidores |
| [README.md](README.md) | Overview do projeto |

---

## 🎯 VERIFICAÇÃO FINAL

```bash
# Antes de enviar, verifique:
✅ git status  # Sem mudanças não-commitadas
✅ git log     # Pelo menos 1 commit
✅ .env existe localmente (não versionado)
✅ docker-compose ps  # Containers rodando
✅ curl http://localhost:3000  # Frontend respondendo
✅ curl http://localhost:5000  # API respondendo
```

---

**Criado:** Maio 3, 2026  
**Status:** ✅ Pronto para Produção  
**Tempo:** ~5 minutos para enviar
