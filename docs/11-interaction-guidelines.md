# 11. Interaction Guidelines

Diretrizes de microinterações e feedback visual. Público: devs e designers.

## 11.1 Contexto Geral
- SaaS: Organizações → Projetos → Tasks.
- Página principal de tasks: `/projects/[id]` (published).
- Documentos relacionados: `6-task-filters.md`, `7-task-sorting.md`, `8-task-badges.md`, `10-task-components.md`.
- Este documento define respostas da UI: animações, hovers, foco, drag-and-drop, toasts, transições.

## 11.2 Estilo Geral de Animações
- Padrão: **soft/leve/natural**.
- Duração típica: 150–200ms.
- Easing: `ease-out` ou similar.
- Animações discretas, priorizando legibilidade e fluidez; servem para contexto, não para chamar atenção excessiva.

## 11.3 Hover e Focus

### 11.3.1 Hover (cards, botões)
- Ao hover: leve mudança de background + realce sutil de borda.
- Não altera layout; apenas sinaliza interatividade.

### 11.3.2 Focus (teclado)
- Focus ring obrigatório em elementos interativos.
- Deve ser claramente visível, não apenas cor de fundo; padrão consistente (outline/borda em cor de destaque).
- Diretrizes de A11y avançadas podem ser detalhadas futuramente; focus ring é mínimo obrigatório.

## 11.4 Feedback para Ações Assíncronas
- Alterar status, assignees, arquivar/restaurar, lixeira, etc.:
  - Spinner inline no botão durante requisição; botão desabilitado ou bloqueia cliques repetidos.
  - Toast de sucesso ao concluir (ex.: “Status atualizado com sucesso”).
  - Toast de erro se falhar (mensagem clara).
  - Highlight leve no card/linha atualizada por ~0.5–1s após sucesso para indicar mudança.

## 11.5 Clique em `<TaskCard />`
- Padrão: abrir um drawer lateral com `<TaskDetails />` na página `/projects/[id]`.
- Drawer entra com animação suave pela lateral; contexto da lista permanece visível ao fundo.

## 11.6 Interações no Kanban

### 11.6.1 Durante drag-and-drop
- Card arrastado: opacidade reduzida (~0.8), pequeno scale (~1.02), elevação/sombra para “flutuar”.

### 11.6.2 Ao entrar em nova coluna
- Coluna candidata: highlight de fundo + borda/linha em cor de foco; opcional pulso suave indicando alvo válido.

### 11.6.3 Após soltar
- Card anima para posição final com transição suave.
- Highlight suave por ~1s para indicar localização final e conclusão da ação.

## 11.7 Microinterações com Datas
- Ao alterar datas (ex.: via `<TaskDetails />`): toast de sucesso após atualização.
- Sem highlight/anim extra nos inputs por ora.

## 11.8 Microinterações com Assignees
- Ao adicionar/remover responsáveis: toast de sucesso; lista de avatares atualiza imediatamente (sem animação específica adicional).

## 11.9 Microinterações com Filtros e Sorting
- Alterar filtros/ordenação: lista de tasks faz um fade suave (saída/entrada rápida dentro dos 150–200ms padrão) ao aplicar novo conjunto.

## 11.10 Microinterações Globais
- Carregamento entre estados/páginas: decisão atual é **spinner global** apenas.
- Sem grandes transições entre páginas (fades/slides); evoluções futuras possíveis (loading bar, transições).

## 11.11 Sons de Interface
- **Não há sons de UI.**
- Nenhuma animação sonora para concluir tarefa, alterar status ou drag-and-drop.
- Justificativa: experiência silenciosa, sem distrações; foco em feedback visual (toasts, highlights, animações leves).
