# 5. Modelagem de Banco de Dados (Supabase)

Esta seção define a modelagem inicial do banco de dados no Supabase para o gerenciador de projetos e tarefas.  
O objetivo é permitir que empresas organizem **clientes, projetos e tarefas**, mantendo vínculo entre essas informações e registrando histórico das alterações.

A modelagem considera:

- PostgreSQL (Supabase)
- Multi-tenant com isolamento por organização
- Acesso controlado por membership
- Registro de logs de atividades das tarefas

---

## 5.1 Visão Geral das Entidades

Entidades principais:

- **profiles** — dados complementares dos usuários autenticados  
- **organizations** — empresas que usam o sistema  
- **organization_members** — vínculo entre usuários e organizações  
- **clients** — clientes atendidos pela organização  
- **projects** — projetos vinculados a um cliente  
- **project_members** — usuários participantes de um projeto  
- **tasks** — tarefas vinculadas a um projeto  
- **task_assignees** — responsáveis por cada tarefa  
- **task_activity_log** — histórico de alterações das tarefas  

---

## 5.2 Tabelas e Colunas

### 5.2.1 `profiles`

Dados complementares de cada usuário autenticado.

| Coluna        | Tipo        | Descrição                                  |
|---------------|-------------|--------------------------------------------|
| id            | uuid        | PK — igual ao `auth.users.id`              |
| full_name     | text        | Nome completo                              |
| avatar_url    | text        | URL do avatar                              |
| created_at    | timestamptz | Data de criação                            |
| updated_at    | timestamptz | Última atualização                         |

---

### 5.2.2 `organizations` (atualizado)

Representa uma empresa que utiliza o sistema.

| Coluna         | Tipo        | Descrição                               |
|----------------|-------------|-----------------------------------------|
| id             | uuid        | PK                                      |
| name           | text        | Nome da organização                     |
| cnpj           | text        | CNPJ da organização                     |
| address        | text        | Endereço completo                       |
| phone          | text        | Telefone de contato                     |
| email          | text        | E-mail de contato                       |
| created_by     | uuid        | FK → `profiles.id`                      |
| created_at     | timestamptz | Data de criação                         |
| updated_at     | timestamptz | Última atualização                      |

---

### 5.2.3 `organization_members`

Vínculo entre usuários e organizações.

| Coluna          | Tipo        | Descrição                                       |
|-----------------|-------------|-------------------------------------------------|
| organization_id | uuid        | FK → `organizations.id`                         |
| user_id         | uuid        | FK → `profiles.id`                              |
| role            | text        | `owner`, `admin`, `member`                      |
| created_at      | timestamptz | Data de criação                                 |

**PK composta:** `(organization_id, user_id)`

---

### 5.2.4 `clients`

Clientes pertencentes a uma organização.

| Coluna         | Tipo        | Descrição                               |
|----------------|-------------|-----------------------------------------|
| id             | uuid        | PK                                      |
| organization_id| uuid        | FK → `organizations.id`                 |
| name           | text        | Nome do cliente                         |
| contact_name   | text        | Nome do contato principal               |
| contact_email  | text        | E-mail do contato                       |
| contact_phone  | text        | Telefone do contato                     |
| notes          | text        | Observações                             |
| created_by     | uuid        | FK → `profiles.id`                      |
| created_at     | timestamptz | Criado em                               |
| updated_at     | timestamptz | Atualizado em                           |

---

### 5.2.5 `projects`

Projetos vinculados a clientes.

| Coluna         | Tipo        | Descrição                               |
|----------------|-------------|-----------------------------------------|
| id             | uuid        | PK                                      |
| organization_id| uuid        | FK → `organizations.id`                 |
| client_id      | uuid        | FK → `clients.id`                       |
| name           | text        | Nome do projeto                         |
| description    | text        | Descrição                               |
| status         | text        | `active`, `archived`, etc.              |
| start_date     | date        | Início                                   |
| due_date       | date        | Prazo                                    |
| created_by     | uuid        | Autor                                    |
| created_at     | timestamptz | Criado em                                |
| updated_at     | timestamptz | Atualizado em                            |

---

### 5.2.6 `project_members`

Vínculo entre usuários e projetos.

| Coluna     | Tipo        | Descrição                           |
|------------|-------------|-------------------------------------|
| project_id | uuid        | FK → `projects.id`                  |
| user_id    | uuid        | FK → `profiles.id`                  |
| role       | text        | `owner`, `member`                   |
| created_at | timestamptz | Data de criação                     |

**PK composta:** `(project_id, user_id)`

---

### 5.2.7 `tasks`

Tarefas vinculadas a um projeto.

#### Status de execução:
- `to_start`
- `in_progress`
- `pending`
- `done`

#### Status de visibilidade (atualizado):
- `published`
- `archived`
- `trashed`

| Coluna        | Tipo        | Descrição                         |
|---------------|-------------|-----------------------------------|
| id            | uuid        | PK                                |
| project_id    | uuid        | FK → `projects.id`                |
| title         | text        | Título da tarefa                  |
| description   | text        | Descrição                         |
| status        | text        | Status de execução                |
| visibility    | text        | `published`, `archived`, `trashed`|
| due_date      | date        | Prazo                             |
| start_date    | date        | Início                            |
| created_by    | uuid        | FK → `profiles.id`                |
| created_at    | timestamptz | Criado em                         |
| updated_at    | timestamptz | Atualizado em                     |

---

### 5.2.8 `task_assignees`

Responsáveis atribuídos a cada tarefa.

| Coluna     | Tipo        | Descrição                           |
|------------|-------------|-------------------------------------|
| task_id    | uuid        | FK → `tasks.id`                     |
| user_id    | uuid        | FK → `profiles.id`                  |
| created_at | timestamptz | Data de atribuição                  |

**PK composta:** `(task_id, user_id)`

---

### 5.2.9 `task_activity_log`

Histórico de alterações de tarefas.

| Coluna         | Tipo        | Descrição                                 |
|----------------|-------------|-------------------------------------------|
| id             | uuid        | PK                                        |
| task_id        | uuid        | FK → `tasks.id`                           |
| user_id        | uuid        | FK → `profiles.id`                        |
| action_type    | text        | Tipo da ação                              |
| from_status    | text        | Status anterior                           |
| to_status      | text        | Novo status                               |
| from_due_date  | date        | Prazo anterior                            |
| to_due_date    | date        | Novo prazo                                |
| description    | text        | Descrição da mudança                      |
| created_at     | timestamptz | Data da ação                              |

---

## 5.3 Resumo dos Relacionamentos

- Uma **organization** tem muitos **clients**, **projects** e **users**  
- Um **client** pertence a apenas **uma organization**  
- Um **project** pertence a um **client**  
- O acesso ao projeto é controlado por **project_members**  
- Uma **task** pertence a um **project** e pode ter vários responsáveis  
- Cada tarefa possui múltiplos registros em `task_activity_log`  

---

## 5.4 Observação sobre Multi-Tenancy

A tabela `organization_members` é a base do isolamento de dados no modelo SaaS.  
Combinada com RLS:

- O usuário só vê organizações onde é membro  
- Só vê clientes e projetos dessa organização  
- E, para maior restrição, só vê projetos onde foi adicionado via `project_members`

Essa estrutura garante que **cada usuário só visualize seus próprios dados** ou dados de projetos onde foi explicitamente convidado.
