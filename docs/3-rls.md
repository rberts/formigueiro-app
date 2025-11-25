# 6. Segurança, Multi-Tenancy e Row Level Security (RLS)

Esta seção define como os dados são isolados entre diferentes usuários e organizações, garantindo o funcionamento seguro do modelo SaaS.  
Cada usuário só poderá visualizar dados pertencentes às organizações e projetos onde ele tiver sido adicionado.

A segurança é implementada combinando:

- **Supabase Auth**
- **organization_members** para controle de acesso por organização
- **project_members** para controle por projeto
- **Row Level Security (RLS)** em todas as tabelas do domínio

---

## 6.1 Princípios de Segurança

1. **RLS ativado em todas as tabelas**  
   Incluindo:  
   `profiles`, `organizations`, `organization_members`,  
   `clients`, `projects`, `project_members`,  
   `tasks`, `task_assignees`, `task_activity_log`.

2. **Nenhum acesso anônimo**  
   Todas as consultas dependem de um usuário autenticado via `auth.uid()`.

3. **Isolamento por organização**  
   Um usuário só acessa dados das organizações onde possui registro em `organization_members`.

4. **Restrição adicional por projeto**  
   Para acessar projetos e tarefas, o usuário também precisa constar em `project_members`.

---

## 6.2 Regras Gerais por Tabela (Conceito)

### 6.2.1 `profiles`
- Usuário só pode visualizar e atualizar **seu próprio perfil**.  
- Regra: `id = auth.uid()`.

---

### 6.2.2 `organizations`
- Usuário só pode ver organizações onde é membro.  
- Regra:  
  Existe uma linha em `organization_members` com:  
  - `organization_id = organizations.id`  
  - `user_id = auth.uid()`.

---

### 6.2.3 `organization_members`
- Usuário só vê memberships da organização que participa.  
- Pode gerenciar membros apenas se tiver papel `owner` ou `admin`.

---

### 6.2.4 `clients`
- Usuário só acessa clientes de suas organizações.  
- Regra:  
  `clients.organization_id` ∈ organizações onde é membro.

---

### 6.2.5 `projects`
- Usuário só vê projetos quando:  
  1) É membro da organização **e**  
  2) É membro do projeto.

Regra de SELECT:  
- `projects.organization_id` corresponde a uma organização do usuário  
- **E**  
- Existe um registro em `project_members` com:  
  `project_id = projects.id` e `user_id = auth.uid()`.

---

### 6.2.6 `project_members`
- Usuário só vê memberships dos projetos onde participa.  
- Gerenciamento depende de papel (`owner`/`admin`).

---

### 6.2.7 `tasks`
- Usuário só pode ver tarefas de projetos onde é membro.  
- Regra:  
  `tasks.project_id` → projeto onde `auth.uid()` é membro via `project_members`.

- Status de visibilidade:
  - `published`
  - `archived`
  - `trashed`

---

### 6.2.8 `task_assignees`
- Só visível para membros do projeto da tarefa.

---

### 6.2.9 `task_activity_log`
- Usuário só vê logs de tarefas de projetos onde participa.  
- Cada ação registrada deve armazenar `user_id` para auditoria.

---

## 6.3 Política de Multi-Tenant (Resumo)

Para garantir isolamento total entre usuários:

1. Todas as tabelas contêm ligação direta ou indireta com `organization_id`.  
2. O acesso é sempre filtrado por `organization_members` e opcionalmente por `project_members`.  
3. Usuários novos:  
   - Criam sua própria organização.  
   - Só visualizam dados dessa organização.  
   - Só veem outras organizações/projetos quando forem adicionados.

Este modelo garante que **nenhum usuário consiga acessar dados de outra empresa**, mantendo o SaaS seguro e escalável.
