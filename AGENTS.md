# Contexto rápido para o Codex

## Stack e arquitetura
- Next.js 14+ com App Router; RSC como padrão e Client Components só quando necessário.
- SSR/SSG conforme página; Server Actions liberadas para operações seguras.
- Back-end BFF via rotas internas `app/api/*/route.ts` (REST) e Server Actions.
- Supabase para PostgreSQL, Auth, RLS, Storage e funções SQL.
- UI com TailwindCSS + shadcn/ui (componentes instalados em `components/ui`, tokens em `tailwind.config.js`).
- Todo código em TypeScript; componentes como arrow functions.

## Estrutura de pastas atual
- `app/` (raiz, sem `src/`), com `layout.tsx`, `globals.css`, rotas `(auth)`, `(dashboard)` (incluindo `/projects`, `/clients`), e APIs em `app/api/*/route.ts`.
- `(dashboard)/projects/[id]/` contém página de detalhes, formulários de task, controles de status e histórico, e formulário de membros.
- `components/ui/` (shadcn: button, card, input, label, dialog, scroll-area, etc.; tokens em `app/globals.css`, tema dark em `:root`).
- `lib/` com `supabase/server.ts` (createServerComponentClient/createRouteHandlerClient) e `organizations.ts` (getActiveOrganizationForUser).
- `types/database.ts` com schema Supabase.

## Padrões de API (Next.js)
- Formato de sucesso: `{"success": true, "data": ...}`.
- Formato de erro: `{"success": false, "error": {"code": "...", "message": "...", "details"?: {...}}}`.
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
