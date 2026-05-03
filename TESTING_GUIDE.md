# 🧪 Guia Rápido de Testes - Validação Visual

**Objetivo:** Confirmar que a refatoração UI/UX está funcionando corretamente

---

## 1️⃣ Acesso Inicial

1. Abra seu navegador
2. Acesse: **http://localhost:3000**
3. Você deve ver a página de login com:
   - ✅ Tipografia Inter (moderna)
   - ✅ Fundo brand-surface (branco suave)
   - ✅ Botão azul corporativo

---

## 2️⃣ Testes de UI/UX por Página

### 📱 Página de Login
```
Visual Checks:
☐ Input fields com brand-border
☐ Botão "Entrar" com brand-primary (#0056b3)
☐ Texto com leading-relaxed
☐ Tipografia Inter carregada
```

### 🏠 Dashboard
```
Visual Checks:
☐ Sidebar BRANCO com logo "Treinamentos"
☐ NavLinks com hover brand-primary
☐ Link ativo: fundo azul + sombra card
☐ Footer com brand-surface
☐ Ícones em escala adequada
☐ Responsive: collapse funcionando
```

### 📚 Treinamentos (Courses)
```
Visual Checks:
☐ Cards de curso com border-brand-border
☐ Sombra card e card-hover ao passar mouse
☐ Badge status com brand-success (verde)
☐ Tipografia com hierarquia clara
```

### ▶️ Visualizador de Aula (Lesson Viewer)
```
Visual Checks:
☐ Vídeo com fundo brand-dark (Slate-900)
☐ Conteúdo centralizado em max-w-4xl
☐ Texto com leading-relaxed (confortável leitura)
☐ Breadcrumb com brand-primary
☐ Status "Concluído" com badge verde
☐ Prosa legível com spacing adequado
```

### 📊 Relatórios
```
Visual Checks (Admin):
☐ StatCards com shadow-card e card-hover
☐ Tabelas com header brand-surface
☐ Linhas com hover brand-surface/50
☐ Badges: Verde (#10b981) para concluído
☐ Barras de progresso com gradiente azul
☐ Pagination com botões brand-primary
☐ Nenhuma cor cinza (apenas brand colors)
```

### 👥 Admin - Usuários
```
Visual Checks:
☐ Tabela com border-brand-border
☐ Linhas com hover suave
☐ Buttons com brand-primary
☐ Sem cores padrão do Tailwind
```

---

## 3️⃣ Testes de Funcionalidade

### Login Multi-Tenant
```
1. Use credenciais teste
2. Verifique: Dashboard mostra empresa correta
3. Cheque JWT claim 'companyId'
4. Filtre cursos por departamento
```

### Progresso de Aula
```
1. Abra uma aula
2. Verifique: Barra de progresso com gradiente
3. Atualize progresso
4. Observe: Shimmer effect na barra
5. Badge "Concluído" deve aparecer verde
```

### Responsividade
```
1. Chrome DevTools → Toggle device toolbar
2. Teste em: 375px (mobile), 768px (tablet), 1920px (desktop)
3. Verifique: Sidebar collapse no mobile
4. Layout mantém readability em todos os tamanhos
```

---

## 4️⃣ Checklist de Cores

Certifique-se que APENAS essas cores aparecem (sem cinzas):

| Cor | Hex | Uso |
|-----|-----|-----|
| Azul Corporativo | #0056b3 | Botões, links ativos, badges |
| Slate-900 | #0f172a | Fundo player de vídeo |
| Emerald-500 | #10b981 | Progresso completo, badges sucesso |
| Zinc-50 | #f9fafb | Fundo claro (surface) |
| Zinc-200 | #e4e4e7 | Bordas, divisores |
| Zinc-900 | #18181b | Texto principal |
| Branco | #fafafa | Fundo light |
| Emerald-600 | #059669 | Hover em progresso |

**❌ Cores NÃO devem aparecer:**
- gray-50, gray-100, gray-200, gray-300... (genéricos)
- blue-500, blue-600 (não brand)
- red-500, yellow-500 (não utilizadas)

---

## 5️⃣ Testes de Transições

```
Visual Checks:
☐ Hover em buttons: 0.2s suave
☐ Hover em cards: shadow muda para card-hover
☐ Sidebar collapse: 0.3s smooth
☐ Links: cor muda com transition
☐ Progresso: anima quando atualiza (duration-500)
```

---

## 6️⃣ Testes de Acessibilidade

```
Keyboard Navigation:
☐ Tab entre elementos funciona
☐ Focus states visíveis (ring-2 ring-brand-primary)
☐ Botões acessíveis por Enter/Space
☐ Contraste atende WCAG AA

Screen Reader:
☐ Semântica HTML correta (h1, h2, button, etc)
☐ Atributos alt em imagens
☐ Labels em inputs
```

---

## 7️⃣ Performance

```bash
# Verifique em DevTools → Lighthouse
☐ Performance > 90
☐ Accessibility > 90
☐ Best Practices > 90
☐ SEO > 90

# Network tab
☐ CSS bundle size razoável
☐ Nenhuma requisição 404
☐ Fonts carregadas corretamente
```

---

## 8️⃣ Bugs Conhecidos a Evitar

❌ **NÃO deve acontecer:**
- Cores cinzas genéricas (gray-*)
- Sombras padrão (shadow vs shadow-card)
- Linhas com altura < 1.75
- Fundo branco puro em lugar de brand-surface
- Links sem brand-primary

---

## ✅ Teste Final - Caso de Uso Completo

```
1. Login como Administrador
2. Vá para Treinamentos
3. Abra um curso
4. Abra uma aula
5. Verifique visual de cada página
6. Vá para Relatórios
7. Verifique tabelas e estatísticas
8. Teste responsividade (F12 → mobile)
9. Logout e faça login com user diferente
10. Verifique cursos filtrados por company/department
```

---

## 📸 Screenshots para Comparação

### Antes (Gray Theme)
- Sidebar: dark-gray background
- Links: generic blue
- Cards: generic borders
- Tables: default styling
- Badges: random colors

### Depois (Brand Theme) ✨
- Sidebar: White com brand-primary active
- Links: #0056b3 azure blue
- Cards: brand-border com shadow-card
- Tables: brand-surface header
- Badges: #10b981 emerald green

---

## 🐛 Troubleshooting

**Cores aparecem erradas?**
```bash
# Limpe cache do navegador
Ctrl+Shift+Delete (Windows/Linux)
Cmd+Shift+Delete (Mac)
```

**Fonts não carregadas?**
```bash
# Verifique Network tab → Fonts
# Google Fonts deve estar carregando
```

**Tailwind classes não aplicando?**
```bash
# Rebuild frontend
docker compose build frontend --no-cache
docker compose up -d frontend
```

**Sidebar não colapsando?**
```bash
# Verifique JavaScript console (F12)
# Não deve haver erros de React/Next
```

---

## 📝 Notas

- Todos os testes devem passar ✅
- Se algo estiver errado, abra DevTools (F12)
- Inspecione elemento para ver classes aplicadas
- Verifique Console para erros JavaScript
- Todos os endpoints devem responder corretamente

---

**Último update:** 2026-05-01  
**Versão:** 1.0.0 UI/UX Refactored
