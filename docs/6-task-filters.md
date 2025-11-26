# 6. Task Filters — /projects/[id]

Documento de especificação para filtros de tarefas na página principal de um projeto. Público-alvo: devs e designers.

## 6.1 Escopo
- Página: `/projects/[id]`.
- Apenas tasks com `visibility = 'published'`.
- Tasks `archived` e `trashed` ficam fora deste contexto (páginas separadas).

## 6.2 Tipos de Filtro

### 6.2.1 Status
- Valores: `to_start`, `in_progress`, `pending`, `done`.
- Multi-select (checkboxes ou lista com múltipla seleção).
- Sem seleção = não filtra por status.
- Com seleção = exibe somente tasks nos status escolhidos (em conjunto com demais filtros).

### 6.2.2 Responsável (assignee)
- Multi-select de usuários do projeto.
- Regra: task entra se tiver **pelo menos um** assignee selecionado (OR entre selecionados).
- Sem seleção = não filtra por responsável.

### 6.2.3 Período (datas)
- Intervalo: `De` (início) e `Até` (fim).
- Regra de interseção: task aparece se `(task_inicio <= filtro_fim) AND (task_fim >= filtro_inicio)`.
  - Entra se começa antes e termina dentro.
  - Entra se começa dentro e termina depois.
  - Entra se totalmente dentro.
- Consistente com cronogramas (Jira, Asana).

### 6.2.4 Texto (search)
- Campo único (case-insensitive).
- Atua sobre título e descrição.
- Combina com os demais filtros.

### 6.2.5 Tarefas sem data
- Toggle “Incluir tarefas sem data”.
- Regra: task entra se `start_date IS NULL` **ou** `due_date IS NULL`.
- Interação com período: quando ativado, tasks sem data aparecem mesmo se o intervalo estiver definido.

## 6.3 Visibilidade / Escopo
- `/projects/[id]` mostra apenas `visibility = 'published'`.
- `archived` e `trashed` não aparecem e não têm filtro aqui (tratamento em páginas separadas).

## 6.4 Comportamento dos Filtros

### 6.4.1 Aplicação (client-side)
- Filtros aplicados no client sobre a lista de tasks já carregadas (published).
- Motivo: simplicidade e experimentação na primeira versão (futuro server-side é possível).

### 6.4.2 Combinação (AND)
- Todos os filtros combinam via conjunção:
  - Status: task deve estar em um dos selecionados (se houver).
  - Responsável: task deve ter pelo menos um dos selecionados (se houver).
  - Período: task deve intersectar o intervalo (se definido).
  - Texto: task deve corresponder à busca (se definida).
  - Sem data: se toggle ativo, tasks sem data entram (independente do período).

## 6.5 Estado Inicial / Padrão
- Ao abrir `/projects/[id]`:
  - Tasks published do projeto.
  - Filtros vazios:
    - Status: nenhum selecionado (equivale a todos).
    - Assignees: nenhum selecionado (equivale a todos).
    - Período: sem datas.
    - Texto: vazio.
    - “Tarefas sem data”: desmarcado (padrão).
- UI inicial: botão “Filtros” visível, lista completa de published.

## 6.6 Reset / Limpar Filtros
- Ação “Limpar filtros” deve:
  - Voltar todos ao estado inicial descrito em 6.5.
  - Remover parâmetros de filtro da URL (ver 6.8).
  - Lista volta a exibir todas as tasks published.

## 6.7 Layout (UI)
- Filtros em **Drawer lateral** (Sheet/Dialog) abrindo da direita.
- Botão “Filtros” na interface principal aciona o Drawer.
- Lista permanece ao fundo.
- Componentes sugeridos (shadcn): Drawer/Sheet (Dialog), Select/Multi-select, Date picker, Input.
- Sem código detalhado, apenas guideline de uso consistente.

## 6.8 Persistência via URL
- Filtros persistem na URL: `/projects/[id]?status=in_progress,done&assignees=123,456&from=2025-01-01&to=2025-01-31&search=relatorio`.
- Ao recarregar: ler parâmetros e refletir na UI do Drawer.
- Ao limpar: remover/resetar parâmetros de filtro da URL.

## 6.9 Exemplos de Cenários
- Status + assignees + período + texto: “in_progress”, usuários X e Y, mês atual, texto “relatório”.
- Mostrar apenas tasks sem data: toggle ativo; aparecem mesmo com período definido.
- Combinação período + status + assignees: filtra por interseção de datas e por OR de assignees dentro dos status escolhidos.
