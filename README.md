# Formigueiro — SaaS de projetos e tarefas

Aplicação multi-tenant construída com **Next.js (App Router)**, **Supabase** e **Tailwind + shadcn/ui** para gestão de organizações, clientes, projetos e tarefas.

## Stack
- Next.js 14 (App Router) com Server Components e Server Actions
- TypeScript
- Supabase (PostgreSQL, Auth, Storage, RLS)
- TailwindCSS + shadcn/ui

## Estrutura principal
```
app/
  (auth)/login, register
  (dashboard)/layout.tsx, page.tsx, clients/, projects/, tasks/
  api/
    clients/, clients/[id]/
    projects/, projects/[id]/
components/
  ui/ (shadcn)
  layout/ (sidebar, header, shell)
  clients/, projects/, auth/
lib/
  supabase/ (server.ts, client.ts)
  organizations.ts
types/ (database.ts)
```

## Ambiente
Crie `.env.local` com:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Scripts
```
npm run dev      # desenvolvimento
npm run build    # build de produção
npm run start    # start em produção
npm run lint     # lint
npm run typecheck
```

## Supabase
- Clientes server-side: `createServerComponentClient` (somente leitura de cookies em Server Components).
- Route Handlers / Server Actions: `createRouteHandlerClient` (leitura e escrita de cookies).
- Função utilitária: `getActiveOrganizationForUser(userId)` para resolver a organização ativa.
- RLS aplicado em todas as tabelas de domínio conforme docs/3-rls.md.

## Módulos prontos
- **Auth**: login/registro com Supabase Auth (Server Actions), criação automática de organização/membership no registro.
- **Clients**: CRUD via `/api/clients` e `/api/clients/[id]`, listagem e criação em `/clients`.
- **Projects**: CRUD via `/api/projects` e `/api/projects/[id]`, listagem e criação em `/projects`.

## API (formato base)
```
Sucesso: { "success": true, "data": ... }
Erro: { "success": false, "error": { "code": "...", "message": "...", "details"?: ... } }
```

## UI / Design
- Tailwind tokens em `tailwind.config.ts`.
- Componentes shadcn em `components/ui`.
- Layout autenticado (`app/(dashboard)/layout.tsx`) com sidebar e header exibindo usuário/org ativa.

## Banco e RLS
- Modelo em `docs/2-models.md` (inclui cnpj/address em clients).
- Políticas em `docs/3-rls.md`.
- Tipos em `types/database.ts` gerenciam colunas (use aliases `contact_email/contact_phone` → `email/phone` nas queries).

## Dicas de desenvolvimento
- Sempre usar as rotas internas (`/api/*`) ou Server Actions para lógica de negócio.
- Encaminhar cookies em fetch server-side para preservar sessão Supabase.
- Não expor segredos no cliente; use apenas as envs públicas fornecidas.
