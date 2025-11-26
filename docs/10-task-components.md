# 10. Task Components

Biblioteca oficial de componentes de UI relacionados a tasks. Público: devs e designers.

## 10.1 Contexto
- SaaS: Organizações → Projetos → Tasks.
- Página principal de tasks: `/projects/[id]` (tasks published).
- Documentos relacionados: `6-task-filters.md` (filtros), `7-task-sorting.md` (ordenação), `8-task-badges.md` (badges).
- Este documento define a família de componentes de tasks (lista, status/visibilidade, assignees, datas, histórico, Kanban, detalhes).

## 10.2 Componentes Principais

### 10.2.1 Lista e Estrutura Geral
- **`<TaskList />`**
  - Renderiza a lista de tasks na página `/projects/[id]`.
  - Pode receber tasks já filtradas/ordenadas ou receber dados brutos + callbacks.
  - Coordena o uso de `<TaskCard />` ou `<TaskRow />`.

- **`<TaskCard />`**
  - Card compacto da task na listagem principal (layout estilo Linear/Asana).
  - Exibe título, status, assignees, due_date, indicadores de prazo, ações.

- **`<TaskRow />`**
  - Versão enxuta/tabular, para listas compactas ou telas secundárias.
  - Variação de layout, compartilhando lógica visual com `<TaskCard />`.

- **`<TaskDetails />`**
  - Tela ou modal/drawer com detalhes completos da task.
  - Mostra descrição, histórico, assignees, datas, logs, etc.
  - Aberta a partir de cliques em `<TaskCard />` (ou ações de menu).

### 10.2.2 Status, Visibilidade e Ações
- **`<TaskStatusBadge />`**
  - Implementa o padrão de `8-task-badges.md` para status (A fazer, Em andamento, Pendente, Concluída).
  - Usado em `<TaskCard />`, `<TaskRow />`, `<TaskDetails />`, Kanban.

- **`<TaskVisibilityBadge />`**
  - Badge de visibilidade (Ativa, Arquivado, Excluída) conforme `8-task-badges.md`.
  - Mais comum em lixeira/arquivadas ou contextos administrativos.

- **`<TaskStatusControls />`**
  - UI para mudar status (e rotas de visibilidade quando fizer sentido).
  - Usa `/api/tasks/:id/status`, `/archive`, `/restore`, `/trash`.

- **`<TaskActionsMenu />`**
  - Menu contextual de ações: editar, abrir detalhes, arquivar, lixeira, histórico, etc.
  - Usado em `<TaskCard />` e possivelmente em Kanban.

### 10.2.3 Assignees
- **`<TaskAssigneeAvatar />`**
  - Avatar/letra de um usuário, usado em listas e detalhes.

- **`<TaskAssigneesList />`**
  - Grupo de avatares inline para múltiplos responsáveis.
  - Presente em `<TaskCard />`, `<TaskRow />`, `<TaskKanbanCard />`, `<TaskDetails />`.

- **`<TaskAssigneeSelector />`**
  - Combobox/multi-select para escolher responsáveis.
  - Usado em criação/edição de task e inline em `<TaskDetails />`.

### 10.2.4 Datas
- **`<TaskDates />`**
  - Exibe `start_date` e `due_date` em formato legível (“Início: ... · Entrega: ...”).

- **`<TaskDueIndicator />`**
  - Indicador textual/visual do prazo:
    - `due_date < hoje` → “Atrasada”
    - `due_date == hoje` → “Vence hoje”
    - `due_date > hoje` → “Vence em X dias”
  - Pode compartilhar cores/estilo com badges, mas é componente próprio.

### 10.2.5 Histórico
- **`<TaskHistory />`**
  - Modal para histórico de atividade (já existente).
  - Usa `/api/task-logs`, exibe timeline cronológica.

- **`<TaskHistoryItem />`**
  - Item individual da timeline (ex.: “Status alterado de A fazer para Em andamento por Usuário X em 10/02/2025 14:32”).

### 10.2.6 Kanban
- **`<TaskKanbanBoard />`**
  - Board completo de um projeto; contém colunas.

- **`<TaskKanbanColumn />`**
  - Coluna (mapeada a um status), agrupa tasks daquele status.

- **`<TaskKanbanCard />`**
  - Card específico para Kanban:
    - layout vertical compacto;
    - status inferido pela coluna;
    - exibe título, assignees, due_date, `TaskDueIndicator`.

## 10.3 Layout do `<TaskCard />` (Lista Principal)
- Layout: compacto, estilo Linear/Asana.
- Linha superior: título à esquerda; `<TaskActionsMenu />` à direita.
- Linha inferior: `<TaskStatusBadge />`, `<TaskAssigneesList />`, `<TaskDueIndicator />`.
- Foco: leitura rápida — título, status, responsáveis, prazo. Reutilizável em múltiplas telas.

## 10.4 Indicadores de Prazo (`<TaskDueIndicator />`)
- Regras:
  - `due_date < hoje`: “Atrasada”
  - `due_date == hoje`: “Vence hoje”
  - `due_date > hoje`: “Vence em X dias”
- Uso: `<TaskCard />`, `<TaskKanbanCard />`, `<TaskDetails />`.

## 10.5 Estados de Carregamento
- Decisão atual: sem skeleton loaders específicos para cards; usar spinner global para carregar lista de tasks.
- Skeletons podem ser evolução futura.

## 10.6 Estado Vazio
- Componente: `<TaskEmptyState />`.
- Conteúdo: ilustração simples/ícone, texto “Nenhuma tarefa criada ainda”, botão primário “Criar tarefa”.
- Uso: `/projects/[id]` quando não há tasks; colunas vazias no Kanban.

## 10.7 Estados de Erro
- Erros de carregar/atualizar/deletar tasks: comunicar via **toast** (Sonner/shadcn).
- Não usar banners fixos ou cards de erro na lista por enquanto.
- Conceito: helper/hook (ex.: `useTaskErrorToast()`), sem detalhar implementação.

## 10.8 Acessibilidade (por agora)
- Diretrizes avançadas (foco, roles, ARIA, teclado) ainda não detalhadas.
- Implementar semântica básica e preparar para evolução futura.

## 10.9 Contexto de Uso
- `/projects/[id]`: `<TaskList />`, `<TaskCard />`, `<TaskStatusBadge />`, `<TaskAssigneesList />`, `<TaskDueIndicator />`, `<TaskActionsMenu />`, `<TaskHistory />`, `<TaskDetails />` (quando implementado).
- Drawer/modal de detalhes: `<TaskDetails />`, `<TaskStatusBadge />`, `<TaskVisibilityBadge />`, `<TaskAssigneeSelector />`, `<TaskDates />`, `<TaskHistory />`.
- Kanban: `<TaskKanbanBoard />`, `<TaskKanbanColumn />`, `<TaskKanbanCard />`, `<TaskDueIndicator />`, `<TaskAssigneesList />`.
- Lixeira/Arquivadas: `<TaskRow />` ou `<TaskCard />` compacto, `<TaskVisibilityBadge />`.
- Reutilização é mandatória: evitar duplicar layouts para cada tela.
