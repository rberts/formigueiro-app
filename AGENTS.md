# Contexto rápido para o Codex

## Stack e arquitetura
- Next.js 14+ com App Router; RSC como padrão e Client Components só quando necessário.
- SSR/SSG conforme página; Server Actions liberadas para operações seguras.
- Back-end BFF via rotas internas `app/api/*/route.ts` (REST) e Server Actions.
- Supabase para PostgreSQL, Auth, RLS, Storage e funções SQL.
- UI com TailwindCSS + shadcn/ui (componentes instalados em `components/ui`, tokens em `tailwind.config.js`).
- Todo código em TypeScript; componentes como arrow functions.

## Estrutura de pastas esperada (`src/`)
- `app/` com `layout.tsx`, `page.tsx`, rotas (incluindo `(auth)/login`, `(auth)/register`, `dashboard/`).
- `app/api/*/route.ts` para handlers REST (GET/POST/PUT/PATCH/DELETE).
- `components/` dividido em `ui/`, `layout/`, `forms/`, `shared/`.
- `lib/` com `supabase/` (`server.ts`, `client.ts`), `utils/`, `validators/`.
- `styles/` com `globals.css`, `tailwind.css`.

## Padrões de API (Next.js)
- Formato de sucesso: `{"success": true, "data": {}, "error": null}`.
- Formato de erro: `{"success": false, "data": null, "error": {"code": "...", "message": "..."}}`.
- Rotas principais:
  - `/api/clients`: GET (listar, `search`), POST (criar), PUT `/api/clients/:id`, DELETE `/api/clients/:id`.
  - `/api/projects`: GET (query `client_id`, `status`), POST (criar), GET `/api/projects/:id`, PUT `/api/projects/:id`, POST `/api/projects/:id/archive`.
  - `/api/tasks`: GET com `project_id`, `visibility`; POST (criar com `assignees`); PUT `/api/tasks/:id`; POST `/api/tasks/:id/status`; POST `/api/tasks/:id/{archive|restore|trash}`.
  - `/api/task-logs`: GET com `task_id`.
- Erros padronizados: `VALIDATION_ERROR`, `UNAUTHORIZED`, `FORBIDDEN`, `INTERNAL_ERROR`.

## Modelagem de dados (Supabase)
- Tabelas principais: `profiles`, `organizations`, `organization_members`, `clients`, `projects`, `project_members`, `tasks`, `task_assignees`, `task_activity_log`.
- Status de tarefas: execução `to_start | in_progress | pending | done`; visibilidade `published | archived | trashed`.
- Relacionamentos-chave:
  - `organizations` ↔ `organization_members` (isolamento por membership).
  - `clients` pertencem a `organizations` (incluem `cnpj` e `address`).
  - `projects` pertencem a `clients` e `organizations`; acesso também via `project_members`.
  - `tasks` pertencem a `projects`; responsáveis em `task_assignees`; histórico em `task_activity_log`.

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
