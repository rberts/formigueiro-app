# 1. Stack e Arquitetura Atual

## 1.1 Visão Geral
- **Next.js 14+ (App Router) com TypeScript**
- **Supabase**: PostgreSQL, Auth e RLS
- **shadcn/ui + TailwindCSS**: design system (componentes em `components/ui`)
- **SSR/SSG** conforme página; Server Actions liberadas
- **API interna** em `/app/api/*` (REST)
- **Multi-tenant** por organização; acesso refinado por projeto

## 1.2 Estrutura de Pastas (principal)
```
app/
  layout.tsx
  globals.css
  (auth)/...
  (dashboard)/
    projects/
      page.tsx               # lista de projetos
      [id]/page.tsx          # detalhes do projeto (tasks, membros, histórico)
      [id]/create-task-form.tsx
      [id]/task-status-controls.tsx
      [id]/task-history.tsx
      [id]/add-project-member-form.tsx
    clients/...
    tasks/...
  api/
    clients/route.ts
    clients/[id]/route.ts
    projects/route.ts
    projects/[id]/route.ts
    projects/[id]/members/route.ts
    projects/[id]/members/[userId]/route.ts
    tasks/route.ts
    tasks/[id]/route.ts
    tasks/[id]/status/route.ts
    tasks/[id]/archive/route.ts
    tasks/[id]/restore/route.ts
    tasks/[id]/trash/route.ts
    task-logs/route.ts
components/
  ui/ (button, card, input, label, dialog, scroll-area, etc.)
  projects/, clients/, layout/, lib/
lib/
  supabase/server.ts         # createServerComponentClient / createRouteHandlerClient
  organizations.ts           # getActiveOrganizationForUser
types/
  database.ts                # tipos gerados do Supabase
```

## 1.3 shadcn/ui
- Componentes instalados em `components/ui` (ex.: `dialog.tsx`, `scroll-area.tsx`, `button.tsx`).
- Estilos via Tailwind + tokens em `app/globals.css` (tema dark aplicado em `:root`).
- Para adicionar novos componentes: rodar o gerador do shadcn, salvar em `components/ui`, expor em `components/ui/index.ts` se precisar import global.

## 1.4 Padrões de Renderização
- **Server Components** por padrão (SSR) para páginas sensíveis e carregamento de dados server-side.
- **Client Components** apenas quando há interação (ex.: formulários, dialogs, status controls, task history).
- Cookies/sessão lidos via `createServerComponentClient` (server) ou `createRouteHandlerClient` (API/server actions).
- Requisições do servidor para a API usam URL absoluta `NEXT_PUBLIC_SITE_URL` (fallback `http://localhost:3000`) + cabeçalho `cookie`.

## 1.5 Fluxos Implementados
- Autenticação Supabase; criação automática de organização e membership `owner`.
- CRUD de clients.
- CRUD de projects; criador é adicionado como `project_member` com papel `owner`.
- Membros de projeto: listar/adicionar/remover.
- CRUD de tasks + assignees (validação por membership do projeto).
- Status/visibilidade de tasks: status change, archive, restore, trash.
- Logs automáticos em `task_activity_log` (`action_type`).
- UI: TaskStatusControls, TaskHistory (modal), membros, formulários de criação.

## 1.6 Convenções Gerais
- TypeScript em todo o código.
- Arquivos em kebab-case.
- Respostas de API: `{ success: true, data }` ou `{ success: false, error: { code, message, details? } }`.
- Negócio apenas no servidor (APIs/Server Actions).  
- Estilização exclusivamente com Tailwind/shadcn.
