# 7. Task Sorting — /projects/[id]

Especificação de ordenação (sorting) das tasks na página principal de um projeto. Público: devs e designers.

## 7.1 Escopo
- Página: `/projects/[id]`.
- Somente tasks com `visibility = 'published'`.
- Filtros são definidos em `6-task-filters.md` (client-side, persistidos via URL); este documento cobre apenas sorting e sua combinação com filtros.

## 7.2 Opções de Ordenação

### 7.2.1 `created_at`
- `created_at (mais recentes → mais antigas)`: ordem desc, foco na linha do tempo de criação (recém-criadas primeiro).
- `created_at (mais antigas → mais recentes)`: ordem asc, histórico inverso.

### 7.2.2 `due_date`
- `due_date (mais próximas do prazo → mais distantes)`: prazos iminentes primeiro.
- `due_date (mais distantes do prazo → mais próximas)`: prazos mais adiante primeiro.

## 7.3 Ordenação Padrão
- Ao abrir `/projects/[id]`: `created_at (mais recentes → mais antigas)` é aplicada por padrão, mesmo sem filtros ativos.

## 7.4 Interação entre Sorting e Filtros
- Sequência: (1) aplica filtros (status, assignees, período por interseção, texto, “tarefas sem data”) → (2) aplica sorting sobre o subconjunto filtrado.
- Não existe sorting isolado que ignore filtros.

## 7.5 Aplicação e Persistência

### 7.5.1 Client-side
- Sorting é aplicado no frontend sobre a lista carregada (tasks published) após os filtros.

### 7.5.2 URL
- Persistir em `sort` na querystring. Convenções recomendadas:
  - `created_at_desc` (padrão)
  - `created_at_asc`
  - `due_date_asc`  (mais próximas primeiro)
  - `due_date_desc` (mais distantes primeiro)
- Ao recarregar: ler `sort` da URL e refletir no select/dropdown de ordenação.

## 7.6 Critério Secundário (Empates)
- Ordenação estável: em empates (mesmo `created_at` ou `due_date`), manter a ordem de criação existente (sem reordenar por outros campos). Evita reembaralhamentos.

## 7.7 Integração com Kanban (conceito)
- No board `/projects/[id]/board` (detalhado em outro doc), dentro de cada coluna (status), ordenar por `due_date (mais próximas → mais distantes)`. A lógica temporal vale para cada status, independentemente da ordenação da lista principal.

## 7.8 Reset / Limpeza de Ordenação
- Não há botão específico de reset; sempre existe alguma ordenação ativa.
- Para voltar ao padrão, selecionar `created_at (mais recentes → mais antigas)`.

## 7.9 Experiência e Persistência
- Sorting é parte do estado da página, junto com filtros.
- Estado (filtros + sort) codificado na URL; compartilhar/restaurar via URL reproduz a mesma visão.

## 7.10 Exemplos
- Ordenar por `created_at (mais recentes primeiro)` enquanto filtra `in_progress` atribuídas a dois usuários.
- Ordenar por `due_date (mais próximas primeiro)` para ver urgências, combinado com filtro de período.
- Exemplo de URL: `/projects/123?status=in_progress&assignees=uid1,uid2&from=2025-01-01&to=2025-01-31&sort=created_at_desc&search=relatorio`.
