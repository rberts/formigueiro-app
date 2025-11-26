# 2. Modelagem de Dados (Supabase)

Baseada no schema atual (tipos em `types/database.ts`).

## 2.1 Entidades Principais
- `profiles`
- `organizations`
- `organization_members`
- `clients`
- `projects`
- `project_members`
- `tasks`
- `task_assignees`
- `task_activity_log`

## 2.2 Tabelas e Colunas (NOT NULL explícito)

### profiles
- **id (uuid, PK, NOT NULL)**: igual a `auth.users.id`
- full_name (text, null)
- avatar_url (text, null)
- created_at (timestamptz, NOT NULL)
- updated_at (timestamptz, NOT NULL)

### organizations
- **id (uuid, PK, NOT NULL)**
- name (text, NOT NULL)
- cnpj (text, null)
- address (text, null)
- phone (text, null)
- email (text, null)
- created_by (uuid, NOT NULL, FK → profiles.id)
- created_at (timestamptz, NOT NULL)
- updated_at (timestamptz, NOT NULL)

### organization_members
- **organization_id (uuid, PK1, NOT NULL, FK → organizations.id)**
- **user_id (uuid, PK2, NOT NULL, FK → profiles.id)**
- role (text, NOT NULL) — `owner` | `admin` | `member`
- created_at (timestamptz, NOT NULL)

### clients
- **id (uuid, PK, NOT NULL)**
- organization_id (uuid, NOT NULL, FK → organizations.id)
- name (text, NOT NULL)
- contact_name (text, null)
- contact_email (text, null)
- contact_phone (text, null)
- cnpj (text, null)
- address (text, null)
- notes (text, null)
- created_by (uuid, NOT NULL, FK → profiles.id)
- created_at (timestamptz, NOT NULL)
- updated_at (timestamptz, NOT NULL)

### projects
- **id (uuid, PK, NOT NULL)**
- organization_id (uuid, NOT NULL, FK → organizations.id)
- client_id (uuid, NOT NULL, FK → clients.id)
- name (text, NOT NULL)
- description (text, null)
- status (text, NOT NULL) — `active` (atual padrão), outros estados podem ser adicionados
- start_date (date, null)
- due_date (date, null)
- created_by (uuid, NOT NULL, FK → profiles.id)
- created_at (timestamptz, NOT NULL)
- updated_at (timestamptz, NOT NULL)

### project_members
- **project_id (uuid, PK1, NOT NULL, FK → projects.id)**
- **user_id (uuid, PK2, NOT NULL, FK → profiles.id)**
- role (text, NOT NULL) — `owner`, `member`
- created_at (timestamptz, NOT NULL)

### tasks
- **id (uuid, PK, NOT NULL)**
- project_id (uuid, NOT NULL, FK → projects.id)
- title (text, NOT NULL)
- description (text, null)
- status (text, NOT NULL) — `to_start` | `in_progress` | `pending` | `done`
- visibility (text, NOT NULL) — `published` | `archived` | `trashed`
- due_date (date, null)
- start_date (date, null)
- created_by (uuid, NOT NULL, FK → profiles.id)
- created_at (timestamptz, NOT NULL)
- updated_at (timestamptz, NOT NULL)

### task_assignees
- **task_id (uuid, PK1, NOT NULL, FK → tasks.id)**
- **user_id (uuid, PK2, NOT NULL, FK → profiles.id)**
- created_at (timestamptz, NOT NULL)

### task_activity_log
- **id (uuid, PK, NOT NULL)**
- task_id (uuid, NOT NULL, FK → tasks.id)
- user_id (uuid, NOT NULL, FK → profiles.id)
- action_type (text, NOT NULL) — ex.: `STATUS_CHANGED`, `ARCHIVED`, `RESTORED`, `TRASHED`
- from_status (text, null)
- to_status (text, null)
- from_due_date (date, null)
- to_due_date (date, null)
- description (text, null)
- created_at (timestamptz, NOT NULL, default now())

## 2.3 Relacionamentos e Constraints
- Uma **organization** tem muitos **clients**, **projects** e **organization_members**.
- Um **project** pertence a uma **organization** e a um **client**.
- **project_members** vincula usuários (profiles) a projetos; criador do projeto entra como `owner`.
- Uma **task** pertence a um **project**; acesso depende de membership em `project_members`.
- **task_assignees**: usuários responsáveis por uma task (devem ser membros do projeto).
- **task_activity_log** registra ações executadas por um usuário; visível apenas para membros do projeto.
- PK compostas:
  - `organization_members (organization_id, user_id)`
  - `project_members (project_id, user_id)`
  - `task_assignees (task_id, user_id)`
- FKs com integridade referencial; inserções devem respeitar organização/projeto/membership.

## 2.4 Status e Visibilidade de Tasks
- **status**: `to_start` | `in_progress` | `pending` | `done` (default: `to_start`)
- **visibility**: `published` | `archived` | `trashed` (default: `published`)

## 2.5 Observações de Negócio
- Usuário que cria um projeto é adicionado automaticamente em `project_members` como `owner`.
- Assignees validados contra `project_members`.
- Logs usam `action_type` (não `action`) e guardam estados de status e due_date quando aplicável.
