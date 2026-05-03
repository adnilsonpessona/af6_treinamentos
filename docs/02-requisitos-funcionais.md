# Requisitos Funcionais — Plataforma de Treinamentos

## RF01 — Autenticação e Sessão

### RF01.1 — Login com e-mail e senha
- O funcionário realiza login com e-mail e senha previamente cadastrados
- Deve ser gerado um JWT com validade configurável (ex: 8 horas)
- Senhas armazenadas com hash bcrypt

### RF01.2 — Login com Google (OAuth 2.0)
- O funcionário pode autenticar via conta Google
- O sistema vincula a conta Google ao e-mail já cadastrado pelo Admin
- Se o e-mail do Google não existir na base, o login é negado com mensagem clara
- Não é permitido criar conta nova via Google — o usuário precisa ser pré-cadastrado

### RF01.3 — Logout
- O sistema invalida o token JWT no logout
- A sessão é encerrada e o tempo de acesso é registrado

### RF01.4 — Registro de sessão
- A cada login é registrado: data/hora, IP de origem, user agent e perfil do usuário
- A cada logout é registrado: data/hora e duração total da sessão

---

## RF02 — Cadastro e Gestão de Usuários

### RF02.1 — Pré-cadastro pelo Administrador
O Admin preenche os seguintes dados para cadastrar um funcionário:
- Nome completo (obrigatório)
- E-mail (obrigatório, único na base)
- CPF (obrigatório, único na base, armazenado apenas como identificador interno)
- Departamento (obrigatório)
- Cargo (obrigatório)
- Perfil de acesso: Administrador, Gestor, Instrutor ou Funcionário (obrigatório)

### RF02.2 — E-mail de ativação
- Após o pré-cadastro, o sistema envia automaticamente um e-mail de ativação ao funcionário
- O link de ativação tem validade de 48 horas
- O link expirado é invalidado e o Admin pode reenviar um novo link manualmente
- Ao reenviar, o link anterior é invalidado imediatamente
- O funcionário clica no link, define sua senha e tem acesso imediato à plataforma

### RF02.3 — Perfis de acesso
O sistema possui 4 perfis fixos. Cada usuário tem exatamente um perfil:

| Perfil | Descrição |
|---|---|
| Administrador | Controle total da plataforma |
| Gestor | Acompanha progresso do seu departamento |
| Instrutor | Cria e gerencia conteúdo de cursos |
| Funcionário | Consome os treinamentos |

### RF02.4 — Edição de usuário
- Admin pode editar todos os dados de um usuário (exceto CPF)
- Admin pode desativar um usuário (impede login sem excluir o histórico)
- Admin pode reativar um usuário desativado

---

## RF03 — Categorias

### RF03.1 — Gestão de categorias
- Somente o Admin cria, edita e desativa categorias
- Cada curso pertence a exatamente uma categoria
- Categoria não pode ser excluída se houver cursos vinculados

---

## RF04 — Cursos

### RF04.1 — Criação de curso pelo Instrutor
O Instrutor preenche:
- Título do curso (obrigatório)
- Descrição (obrigatório)
- Categoria (obrigatório)
- Thumbnail/capa (opcional)
- Status inicial: **Rascunho**

### RF04.2 — Aulas do curso
- Um curso tem uma lista plana de aulas (sem módulos intermediários)
- Cada aula pode ter: vídeo, conteúdo de texto, ou ambos
- O Instrutor define a ordem das aulas
- O funcionário pode assistir as aulas em qualquer ordem

### RF04.3 — Aula com vídeo
- O Instrutor faz upload do arquivo de vídeo (formato mp4)
- O vídeo é armazenado no servidor (caminho configurável via variável de ambiente)
- O streaming é servido pela API com suporte a HTTP Range Requests
- O player deve suportar: play, pause, seek, velocidade e tela cheia

### RF04.4 — Aula com conteúdo de texto
- O Instrutor digita o conteúdo de texto via editor rich text (ex: TipTap ou Quill)
- O conteúdo é armazenado em formato HTML no banco de dados
- Todo conteúdo de texto pode ser baixado em PDF pelo funcionário
- O PDF é gerado dinamicamente pela API no momento do download

### RF04.5 — Fluxo de publicação
```
Rascunho → Aguardando Aprovação → Publicado
                                 → Reprovado (volta para Rascunho com comentário)
```
- O Instrutor envia o curso para aprovação quando estiver pronto
- O Admin aprova ou reprova com comentário
- Somente cursos com status **Publicado** ficam visíveis para os funcionários

### RF04.6 — Visibilidade do curso
- Ao publicar um curso, o Admin define quais usuários ou departamentos têm acesso
- Um mesmo curso pode ser liberado para múltiplos departamentos ou usuários específicos
- O Admin pode alterar as permissões de acesso a qualquer momento

### RF04.7 — Edição de curso publicado
- O Instrutor pode editar um curso publicado — isso retorna o status para **Rascunho**
- O curso precisa passar pela aprovação novamente antes de ficar visível

---

## RF05 — Progresso do Funcionário

### RF05.1 — Rastreamento de progresso por vídeo
Para cada vídeo assistido por cada funcionário, registrar:
- Percentual assistido (0 a 100)
- Último segundo assistido (para retomada)
- Se o vídeo foi concluído (assistiu ≥ 90% do total)
- Data/hora do primeiro acesso ao vídeo
- Data/hora da conclusão (quando atingir ≥ 90%)
- Número de sessões de visualização

### RF05.2 — Retomada de vídeo
- Ao abrir um vídeo já iniciado, o player retoma automaticamente do último segundo registrado
- O funcionário pode voltar ao início manualmente se desejar

### RF05.3 — Conclusão do curso
- Um curso é considerado concluído quando todas as aulas forem concluídas
- "Aula concluída" significa: vídeo assistido ≥ 90% (se tiver vídeo) E texto acessado pelo menos uma vez (se tiver texto)
- A data de conclusão do curso é registrada automaticamente

---

## RF06 — Notificações por E-mail

### RF06.1 — E-mail de ativação de conta
- Disparado automaticamente pelo sistema ao pré-cadastrar um usuário
- Contém link único de ativação com validade de 48 horas

### RF06.2 — Novo curso disponível
- Ao publicar e liberar um curso, o Admin escolhe quais usuários ou departamentos serão notificados
- O sistema envia e-mail com título do curso, descrição breve e link de acesso
- O envio é assíncrono (não bloqueia a tela do Admin)

### RF06.3 — Reenvio de link de ativação
- O Admin pode reenviar o e-mail de ativação manualmente para usuários pendentes
- O link anterior é invalidado no momento do reenvio

---

## RF07 — Relatórios

### RF07.1 — Relatório do Administrador
Acesso total a todos os dados da plataforma:
- Progresso de todos os funcionários em todos os cursos
- Tempo total de acesso por usuário (soma das sessões)
- Cursos mais acessados
- Funcionários que nunca fizeram login
- Funcionários que iniciaram mas não concluíram cursos
- Filtros por: departamento, cargo, curso, categoria, período

### RF07.2 — Relatório do Gestor
Acesso restrito ao seu departamento:
- Progresso de cada funcionário do departamento por curso
- Tempo de acesso por funcionário
- Quem concluiu ou não cada curso disponível para o departamento
- Mesmos filtros do Admin, limitado ao departamento do Gestor

### RF07.3 — Relatório do Instrutor
Acesso restrito aos cursos que criou:
- Nome e progresso individual de cada funcionário nos seus cursos
- Percentual de conclusão por aula
- Total de acessos por aula
- Data do último acesso por funcionário

### RF07.4 — Progresso do Funcionário (visão própria)
- O funcionário vê seu próprio progresso em cada curso
- Cursos disponíveis, iniciados e concluídos
- Percentual de progresso por curso

---

## RF08 — Logs de Auditoria

Registrar automaticamente, sem intervenção do usuário:
- Login e logout (com IP, user agent e duração da sessão)
- Acesso a cada aula (data/hora de início e fim)
- Progresso em vídeos (atualizado a cada 15 segundos durante a reprodução)
- Download de PDF
- Ações administrativas: cadastro, edição, aprovação/reprovação de cursos, alteração de permissões
