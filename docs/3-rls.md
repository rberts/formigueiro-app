# 3. RLS e Segurança (Supabase)

RLS ativado em todas as tabelas do domínio. Nenhum acesso anônimo; toda policy usa `auth.uid()`.

## 3.1 Princípios
- Isolamento por organização via `organization_members`.
- Restrição adicional por projeto via `project_members` para projetos, tasks e assignees.
- Logs só visíveis a membros do projeto da tarefa.

## 3.2 Policies (conceito)

### profiles
- SELECT/UPDATE: `id = auth.uid()`.
- INSERT: apenas pelo sistema (via backend); não expor publicamente.

### organizations
- SELECT: existe `organization_members` com `organization_id = organizations.id` e `user_id = auth.uid()`.
- INSERT: permitida a criação inicial (via backend); CHECK `created_by = auth.uid()`.
- UPDATE/DELETE: apenas `owner/admin` da org (validar via função/role em `organization_members`).

### organization_members
- SELECT: `organization_id` pertence a organizações do usuário.
- INSERT/DELETE/UPDATE: somente `owner/admin` da mesma organização.
- CHECK: `organization_id` pertence a org onde `auth.uid()` é `owner/admin`.

### clients
- SELECT/UPDATE/DELETE: `clients.organization_id` em organizações onde `auth.uid()` é membro.
- INSERT: `organization_id` deve ser de organização do usuário.

### projects
- SELECT: `projects.organization_id` em organizações onde o usuário é membro **e** existe `project_members(project_id = projects.id, user_id = auth.uid())`.
- INSERT: `organization_id` deve ser de organização do usuário; `created_by = auth.uid()`. Após criação, inserir `project_members` para o criador.
- UPDATE/DELETE: apenas se o usuário for membro do projeto (idealmente `owner/admin` do projeto).

### project_members
- SELECT: somente para projetos onde usuário é membro (`project_members.project_id = projects.id` e `project_members.user_id = auth.uid()`).
- INSERT/DELETE/UPDATE: apenas `owner/admin` do projeto/organização.
- CHECK: `project_id` pertence a organização do usuário e usuário-alvo é membro da mesma organização.

### tasks
- SELECT: task cujo `project_id` pertence a projeto onde `auth.uid()` é membro (`project_members`).
- INSERT: `project_id` deve pertencer a projeto onde `auth.uid()` é membro; `created_by = auth.uid()`.
- UPDATE/DELETE: apenas membro do projeto (idealmente validar papel).
- Visibilidade (`published/archived/trashed`) não ignora restrição de membership.

### task_assignees
- SELECT: apenas se `task_id` pertence a projeto onde `auth.uid()` é membro.
- INSERT/DELETE: apenas membro do projeto (idealmente `owner/admin`); `user_id` inserido deve ser membro do projeto.

### task_activity_log
- SELECT: apenas se `task_id` pertence a projeto onde `auth.uid()` é membro.
- INSERT: apenas membro do projeto (registrado pelo backend ao mudar status/visibilidade/due_date).
- Campos `task_id` e `user_id` obrigatórios; `action_type` deve refletir a ação executada.

## 3.3 Exemplos de Using/Check (esqueleto SQL)
- Projeto visível:
  ```sql
  USING (
    EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.project_id = projects.id
        AND pm.user_id = auth.uid()
    )
  );
  ```
- Task visível:
  ```sql
  USING (
    EXISTS (
      SELECT 1
      FROM project_members pm
      WHERE pm.project_id = tasks.project_id
        AND pm.user_id = auth.uid()
    )
  );
  ```
- Log visível:
  ```sql
  USING (
    EXISTS (
      SELECT 1
      FROM tasks t
      JOIN project_members pm ON pm.project_id = t.project_id
     WHERE t.id = task_activity_log.task_id
       AND pm.user_id = auth.uid()
    )
  );
  ```

## 3.4 Resumo de Acesso
- Usuário precisa ser **membro da organização** para ver org/clients/projects.
- Precisa ser **membro do projeto** para ver/editar project, tasks, assignees e logs.
- Logs seguem o mesmo isolamento que a task à qual pertencem.
