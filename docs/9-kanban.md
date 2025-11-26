# 9. Kanban Board

Especificação da visão Kanban do sistema de tasks. Público: devs e designers.

## 9.1 Contexto
- SaaS: Organizações → Projetos → Tasks.
- Visão alternativa à lista de `/projects/[id]`, rota típica `/projects/[id]/board`.
- Relacionados: `6-task-filters.md`, `7-task-sorting.md`, `8-task-badges.md`, `10-task-components.md`, `11-interaction-guidelines.md`.
- Apenas tasks `published`; não há colunas de lixeira/arquivado.

## 9.2 Estrutura de Colunas
- 4 colunas fixas mapeadas a status:
  - `to_start` → **A fazer**
  - `in_progress` → **Em andamento**
  - `pending` → **Pendente**
  - `done` → **Concluída**
- Ordem esquerda→direita: A fazer → Em andamento → Pendente → Concluída.
- Sem colunas para lixeira/arquivadas.

## 9.3 Componentes
- **`<TaskKanbanBoard />`**: renderiza o board completo; recebe tasks do projeto (filtradas) e distribui por status.
- **`<TaskKanbanColumn />`**: coluna de um status; título, contagem (opcional), lista de cards, estado vazio.
- **`<TaskKanbanCard />`**: card individual; info resumida da task.
- **`<TaskDueIndicator />`**: mostra “Atrasada” / “Vence hoje” / “Vence em X dias”.
- **`<TaskAssigneesList />`**: avatares de responsáveis.
- Padrões visuais reutilizam badges, fontes, espaçamentos definidos no sistema.

## 9.4 Conteúdo do `<TaskKanbanCard />`
- Título da task.
- `<TaskDueIndicator />`: atrasada / vence hoje / vence em X dias (baseado em `due_date`).
- `<TaskAssigneesList />`: grupo de responsáveis.
- Não há botões/menus no card; para ações/detalhes, o card inteiro é clicável.

## 9.5 Interação ao Clicar no Card
- Clique abre **drawer lateral** com `<TaskDetails />`.
- Drawer anima da lateral, mantendo a lista/board ao fundo (ver `11-interaction-guidelines.md`).
- Não há rota separada específica; padrão é o drawer.

## 9.6 Ordenação dentro das Colunas
- Regra fixa: ordenar por **`due_date (mais próximas → mais distantes)`**.
- Tasks sem data (`start_date` ou `due_date` ausentes) vão **ao fim da coluna**.
- Foco em urgência temporal dentro de cada status.

## 9.7 Filtros e Sorting
- Respeita filtros de `6-task-filters.md` (status, assignees, período por interseção, texto, “tarefas sem data”).
- Só tasks que passam pelos filtros aparecem no board.
- Sorting global (lista) existe, mas no Kanban a ordenação interna é sempre por `due_date` na coluna (sem variação).

## 9.8 Drag-and-Drop (D&D)
- Biblioteca: **`@hello-pangea/dnd`** (sucessora do react-beautiful-dnd; compatível com React/Next 18).
- Movimento: arrastar de uma coluna a outra atualiza `status` para o status da coluna destino; registra log em `task_activity_log`; highlight por ~1s após sucesso (ver interações).
- Sem restrições de movimento: pode mover entre quaisquer colunas.
- Lixeira/arquivo não fazem parte do board (são ações externas ao Kanban).

## 9.9 Microinterações no Kanban (ver `11-interaction-guidelines.md`)
- Durante drag: card com opacidade reduzida (~0.8), leve scale (~1.02), sombra/elevação.
- Ao entrar em nova coluna: coluna com fundo mais claro, borda/linha de foco; opcional pulso leve indicando alvo válido.
- Após soltar: transição suave para posição final + highlight suave no card por ~1s para indicar onde ficou.

## 9.10 Colunas Vazias
- Coluna sem tasks: mostrar mensagem discreta, ex.: “Nenhuma tarefa aqui ainda”.
- Sugere que é possível arrastar tasks para lá ou criar novas com aquele status (quando existir).

## 9.11 Tasks sem Data no Kanban
- Tasks sem `start_date` ou `due_date` aparecem normalmente na coluna do status.
- Sempre posicionadas **no fim da coluna**, após tasks com due_date definido.

## 9.12 Contexto de Uso
- Rota `/projects/[id]/board` complementa a lista vertical de `/projects/[id]`.
- Fornece visão de fluxo por status e urgência de prazo.
- Filtros/sorting podem ser compartilhados via URL/router state/tab no futuro.
