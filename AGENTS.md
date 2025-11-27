# Contexto rápido para o Codex

## Stack e arquitetura
- Next.js 14+ com App Router; RSC como padrão e Client Components só quando necessário.
- SSR/SSG conforme página; Server Actions liberadas para operações seguras.
- Back-end BFF via rotas internas `app/api/*/route.ts` (REST) e Server Actions.
- Supabase para PostgreSQL, Auth, RLS, Storage e funções SQL.
- UI com TailwindCSS + shadcn/ui (componentes instalados em `components/ui`, tokens em `tailwind.config.js`).
- Todo código em TypeScript; componentes como arrow functions.
- Consumo interno de APIs/Server Actions: usar URL absoluta `NEXT_PUBLIC_SITE_URL` (fallback `http://localhost:3000`) + cabeçalho `cookie` para forward de sessão.

## Fontes rápidas (docs)
- Stack/estrutura: `docs/1-stack.md`, `docs/2-models.md`.
- Segurança/RLS: `docs/3-rls.md`.
- APIs e ordem de validação: `docs/4-api-routes.md`.
- UI/UX: `docs/5-ui-guidelines.md`, `docs/11-interaction-guidelines.md`.
- Tasks: filtros `docs/6-task-filters.md`, ordenação `docs/7-task-sorting.md`, badges `docs/8-task-badges.md`, Kanban `docs/9-kanban.md`, componentes `docs/10-task-components.md`.

## Estrutura de pastas atual
- `app/` (raiz, sem `src/`), com `layout.tsx`, `globals.css`, rotas `(auth)`, `(dashboard)` (incluindo `/projects`, `/clients`), e APIs em `app/api/*/route.ts`.
- `(dashboard)/projects/[id]/` contém página de detalhes, formulários de task, controles de status e histórico, e formulário de membros.
- `components/ui/` (shadcn: button, card, input, label, dialog, scroll-area, etc.; tokens em `app/globals.css`, tema dark em `:root`).
- `lib/` com `supabase/server.ts` (createServerComponentClient/createRouteHandlerClient) e `organizations.ts` (getActiveOrganizationForUser).
- `types/database.ts` com schema Supabase.

## Padrões de API (Next.js)
- Formato de sucesso: `{"success": true, "data": ...}`.
- Formato de erro: `{"success": false, "error": {"code": "...", "message": "...", "details"?: {...}}}`.
- Ordem de validação nas rotas: (1) `auth.getUser`, (2) org ativa via `getActiveOrganizationForUser`, (3) projeto pertence à org (quando aplicável), (4) task pertence ao projeto/org (quando aplicável).
- Rotas principais:
  - `/api/clients` (+ `/api/clients/:id`).
  - `/api/projects` (+ `/api/projects/:id`, `/api/projects/:id/members`, `/api/projects/:id/members/:userId`).
  - `/api/tasks` (+ `/api/tasks/:id`, `/api/tasks/:id/status`, `/api/tasks/:id/{archive|restore|trash}`).
  - `/api/task-logs` (query `task_id`).
- Erros padronizados: `VALIDATION_ERROR`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `DB_ERROR`, `INTERNAL_ERROR`.

## Modelagem de dados (Supabase)
- Tabelas: `profiles`, `organizations`, `organization_members`, `clients`, `projects`, `project_members`, `tasks`, `task_assignees`, `task_activity_log`.
- Status/visibilidade de tarefas: `to_start | in_progress | pending | done`; visibilidade `published | archived | trashed`.
- Relacionamentos-chave:
  - Organização → clients/projects/members.
  - Projects pertencem à organização e client; acesso por `project_members` (criador entra como `owner`).
  - Tasks pertencem ao projeto; assignees em `task_assignees` (membros do projeto); logs em `task_activity_log` (campo `action_type`).

## Segurança e RLS
- RLS habilitado em todas as tabelas do domínio; nenhuma consulta anônima.
- Acesso por organização: usuário precisa estar em `organization_members` para ver dados dessa org.
- Acesso a projetos/tarefas: além da organização, exige presença em `project_members`.
- `profiles`: usuário só vê/edita sua própria linha (`id = auth.uid()`).
- Logs (`task_activity_log`) guardam `user_id` para auditoria.

## Supabase clients
- Uso server-side preferencial via `lib/supabase/server.ts`.
- Cliente browser (`lib/supabase/client.ts`) só quando realmente necessário.
- Nenhum segredo exposto ao cliente; lógica de negócio fica no servidor.

## Convenções gerais de desenvolvimento
- Nomes de arquivos em kebab-case.
- APIs sempre retornam JSON consistente.
- Estilização exclusivamente com Tailwind/shadcn; customizações via Tailwind tokens.
- Cliente comunica-se apenas via rotas internas `/api/*` ou Server Actions; nada de lógica crítica no cliente.
- UI/tema: dark em `:root`, tokens em `app/globals.css`; após mutações, usar `router.refresh()` em componentes client.

## Tasks — status, visibilidade e badges
- Status: `to_start` (A fazer), `in_progress` (Em andamento), `pending` (Pendente), `done` (Concluída).
- Visibilidade: `published` (Ativa), `archived` (Arquivado), `trashed` (Excluída). Listas principais/board só mostram `published`.
- Cores conceituais dos badges: `to_start` → slate-400; `in_progress` → indigo-500; `pending` → orange-400; `done` → green-400; `published` → blue-300; `archived` → stone-400; `trashed` → rose-400. Formato pill soft, texto sempre visível.

## Tasks — filtros e ordenação (`/projects/[id]`)
- Filtros client-side combinados via AND: status (multi), assignees (OR entre selecionados), período por interseção, texto (título/descrição), toggle “incluir sem data”.
- Persistência em querystring (ex.: `status=...&assignees=...&from=...&to=...&search=...`); ação “Limpar filtros” zera estado/URL.
- Ordenação default: `created_at_desc`; opções `created_at_asc`, `due_date_asc` (mais próximas), `due_date_desc` (mais distantes). Aplicar após filtros; persistir em `sort`.

## Kanban (`/projects/[id]/board`)
- 4 colunas fixas por status (A fazer → Em andamento → Pendente → Concluída); somente `published`.
- Ordenação dentro da coluna: `due_date` mais próximas primeiro; tasks sem data vão ao fim.
- Drag-and-drop com `@hello-pangea/dnd`: mover atualiza status, registra log e aplica highlight leve pós-movimento.

## Componentes oficiais de tasks (reutilizar)
- Listagem: `TaskList`, `TaskCard`, `TaskRow`, `TaskEmptyState`.
- Status/visibilidade/ações: `TaskStatusBadge`, `TaskVisibilityBadge`, `TaskStatusControls`, `TaskActionsMenu`.
- Assignees: `TaskAssigneeAvatar`, `TaskAssigneesList`, `TaskAssigneeSelector`.
- Datas/prazo: `TaskDates`, `TaskDueIndicator`.
- Histórico: `TaskHistory`, `TaskHistoryItem`.
- Kanban: `TaskKanbanBoard`, `TaskKanbanColumn`, `TaskKanbanCard`.

## Microinterações e feedback
- Animações leves (150–200ms, ease-out); hover com fundo/borda sutil; focus ring visível.
- Ações assíncronas: spinner inline + botão desabilitado; toast de sucesso/erro; highlight suave no item atualizado.
- Drawer lateral para detalhes ao clicar em `TaskCard`; lista/board permanece ao fundo.
- Filtros/ordenação: fade rápido na lista ao aplicar novos estados.
