# 5. UI Guidelines

## 5.1 Componentes Padrão
- **Buttons**: `Button` (variants primary/secondary/destructive), usar `size="sm"` para ações em cards.
- **Cards**: `Card`, `CardHeader`, `CardContent` para blocos de listagem/form.
- **Dialog**: `Dialog`, `DialogTrigger`, `DialogContent` para modais (histórico).
- **ScrollArea**: para listas longas em modais.
- **Forms**: inputs/textarea/select com borda `border-slate-700/800`, texto claro.
- **Badges**: usar classes utilitárias (rounded-full, bg-slate-800, text-slate-200) para status.

## 5.2 Tasks – UX
- **Status**: `to_start`, `in_progress`, `pending`, `done`.
  - Badge: fundo neutro escuro, texto claro; `done` pode usar tom de sucesso leve.
- **Visibilidade**: `published` (default), `archived`, `trashed`; mostrar apenas quando relevante (ex.: itens arquivados/lixeira).
- **Ordenação**: por `due_date` asc ou `created_at` desc; mostrar datas formatadas.
- **Assignees**: multi-select; mostrar nomes quando disponível.

## 5.3 TaskStatusControls
- Local: dentro do card da tarefa.
- Comportamento: select de status + botões Arquivar/Restaurar/Lixeira condicionados à visibilidade.
- Sempre chamar `router.refresh()` após sucesso; mostrar erro inline.
- Estilo: linha de ações com `flex gap-2`, botões `size="sm"`.

## 5.4 TaskHistory (modal)
- Trigger: botão “Histórico” ao lado dos controles de status.
- Ao abrir: fetch `/api/task-logs?task_id=...`; estados de loading/erro/sucesso.
- Timeline:
  - Ordenar ASC.
  - Cada item: hora `dd/MM/yyyy HH:mm`, ação amigável, `from_status -> to_status`, `from_due_date -> to_due_date`, descrição se houver, usuário (nome se disponível).
  - Layout: bullet à esquerda, conteúdo com borda e fundo escuro; `ScrollArea` se muitos itens.

## 5.5 Listas e Cards de Tarefas
- Card: borda `border-slate-800`, fundo `bg-slate-900/60`, `p-4`, `space-y-2`.
- Título: `text-sm font-medium text-slate-100`.
- Descrição: `text-sm text-slate-300`.
- Metadados (datas): `text-xs text-slate-400`.
- Ações: linha inferior com status controls + histórico.

## 5.6 Filtros / Ordenação / Board (futuro)
- **TaskFilters** (topo da página/board):
  - Select de status, visibilidade, ordenação (due_date/status/created_at).
  - Busca por título.
- **TaskColumn** (Kanban `/projects/[id]/board`):
  - Props: `title`, `status`, `tasks[]`.
  - Droppable (futuro), mantém estilo de card.
- **TaskCard**:
  - Props: task (id, title, status, visibility, due_date, assignees).
  - Inclui badges de status/visibilidade, datas, controles rápidos (opcional).

## 5.7 Skeletons e Loading
- Usar blocos com `animate-pulse`, altura fixa, bordas arredondadas, fundos `bg-slate-800/70`.
- Para listas de tasks: 3–5 skeletons com título e linhas curtas.
- Para modais: skeleton simples de linhas empilhadas.

## 5.8 Acessibilidade
- Buttons e inputs com `aria-label` quando o texto não for explícito (ex.: ícones).
- Dialog: usar `DialogTitle` e foco inicial no conteúdo.
- Timeline: ordem cronológica, texto claro para leitores de tela.
- Contraste: manter tokens dark já definidos (background/foreground) para alta legibilidade.
