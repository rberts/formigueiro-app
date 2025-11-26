# 4. Rotas da API (Next.js /app/api)

Formato padrão:
- Sucesso: `{ "success": true, "data": ... }`
- Erro: `{ "success": false, "error": { "code", "message", "details" } }`

Ordem de validação nas rotas protegidas:
1) Usuário autenticado (`auth.getUser`)
2) Organização ativa via `getActiveOrganizationForUser`
3) Projeto pertence à organização (quando aplicável)
4) Tarefa pertence ao projeto/organização (quando aplicável)

## 4.1 Clients
### GET `/api/clients`
- Lista clientes da organização ativa.

### POST `/api/clients`
- Body: `{ name: string, email?, phone?, cnpj?, address? }`
- Cria cliente na organização ativa.

### GET `/api/clients/:id`
- Detalhe do cliente (org ativa).

### PUT `/api/clients/:id`
- Body opcional: `{ name?, email?, phone?, cnpj?, address? }`

### DELETE `/api/clients/:id`
- Remove cliente da org ativa.

## 4.2 Projects
### GET `/api/projects`
- Lista projetos da org ativa.

### POST `/api/projects`
- Body: `{ client_id, name, description?, start_date?, due_date? }`
- Cria projeto (status `active`, `created_by` = usuário) e adiciona criador em `project_members` como `owner`.

### GET `/api/projects/:id`
- Detalhe do projeto da org ativa (precisa ser membro do projeto).

### PUT `/api/projects/:id`
- Body opcional: `{ client_id?, name?, description?, status?, start_date?, due_date? }`

### DELETE `/api/projects/:id`
- Remove projeto da org ativa (membro necessário).

### Project Members
#### GET `/api/projects/:id/members`
- Lista membros do projeto (user_id, role, perfil).

#### POST `/api/projects/:id/members`
- Body: `{ user_id, role?=member }`
- Valida que usuário alvo é membro da organização; cria em `project_members` (trata duplicidade).

#### DELETE `/api/projects/:id/members/:userId`
- Remove vínculo `project_members`.

## 4.3 Tasks
### GET `/api/tasks?project_id=...&visibility=...`
- Lista tasks de um projeto da org ativa; visibilidade default `published`.

### POST `/api/tasks`
- Body: `{ project_id, title, description?, status?=to_start, visibility?=published, start_date?, due_date?, assignee_ids?: string[] }`
- Valida projeto na org ativa e assignees como membros do projeto; insere em `tasks` + `task_assignees`.

### GET `/api/tasks/:id`
- Detalhe da task, validando projeto/org.

### PUT `/api/tasks/:id`
- Body opcional: `{ title?, description?, status?, visibility?, start_date?, due_date? }`
- Atualiza task (membro do projeto requerido).

#### Status e Visibilidade
- POST `/api/tasks/:id/status` — Body: `{ status }`; atualiza status e registra log (`action_type=STATUS_CHANGED`).
- POST `/api/tasks/:id/archive` — Define `visibility=archived` (se não estiver `trashed`); log `ARCHIVED`.
- POST `/api/tasks/:id/restore` — Define `visibility=published`; log `RESTORED`.
- POST `/api/tasks/:id/trash` — Define `visibility=trashed`; log `TRASHED`.

## 4.4 Task Logs
### GET `/api/task-logs?task_id=...`
- Valida task na org/projeto do usuário.
- Retorna logs ordenados por `created_at` (id, action_type, from_status, to_status, from_due_date, to_due_date, description, user_id, user_name?, created_at).

## 4.5 Erros e RLS
- Erros comuns: `UNAUTHORIZED`, `FORBIDDEN`, `VALIDATION_ERROR`, `NOT_FOUND`, `DB_ERROR`.
- As rotas assumem RLS ativo: acesso condicionado a membership em organização e projeto.

## 4.6 Consumo na UI
- `/projects` usa `/api/projects` e `/api/clients`.
- `/projects/[id]` usa `/api/tasks`, `/api/task-logs`, `/api/projects/:id/members`.
- Componentes client: `CreateProjectForm`, `CreateTaskForm`, `TaskStatusControls`, `TaskHistory`, `AddProjectMemberForm`; todos usam `router.refresh()` após sucesso.
