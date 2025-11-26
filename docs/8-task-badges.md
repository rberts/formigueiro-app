# 8. Task Badges

Padrão oficial de badges para status e visibilidade de tasks. Público: devs e designers.

## 8.1 Contexto
- SaaS de trabalho: Organizações → Projetos → Tasks.
- Página principal de tasks: `/projects/[id]` (tasks published).
- Filtros e sorting descritos em `6-task-filters.md` e `7-task-sorting.md`.
- Este documento foca apenas nos badges visuais (status e visibilidade).

## 8.2 Badges de Status

### 8.2.1 Status disponíveis
- `to_start`
- `in_progress`
- `pending`
- `done`

### 8.2.2 Texto exibido
- `to_start` → **A fazer**
- `in_progress` → **Em andamento**
- `pending` → **Pendente**
- `done` → **Concluída**

### 8.2.3 Cores (referência conceitual)
- A fazer (`to_start`) → `--color-slate-400` (cinza)
- Em andamento (`in_progress`) → `--color-indigo-500` (indigo/roxo)
- Pendente (`pending`) → `--color-orange-400` (laranja)
- Concluída (`done`) → `--color-green-400` (verde)

Observação: usar de forma consistente onde o status aparecer em badge para identificação rápida.

## 8.3 Badges de Visibilidade

### 8.3.1 Estados
- `published`
- `archived`
- `trashed`

### 8.3.2 Texto exibido
- `published` → **Ativa**
- `archived` → **Arquivado**
- `trashed` → **Excluída**

### 8.3.3 Cores (referência conceitual)
- Ativa (`published`) → `--color-blue-300`
- Arquivado (`archived`) → `--color-stone-400`
- Excluída (`trashed`) → `--color-rose-400`

Intenção: azul claro para ativo, stone/cinza para inativo/arquivado, rose suave para exclusão sem ser agressivo.

## 8.4 Estilo Global dos Badges
- Formato: **pill** totalmente arredondado.
- Preenchimento: estilo **soft** (fundo claro da cor, texto em tom mais forte da mesma cor).
- Tamanho: pequeno (XS); altura reduzida, padding horizontal leve (ex.: `px-2`/`px-3`), tipografia `text-xs`.
- Ícones: **não usar ícones** dentro dos badges (cor + texto bastam).

## 8.5 Diretrizes de Uso
- Usar em listas de tasks (`/projects/[id]`), cards (incluindo Kanban futuro), modais/detalhes, tabelas.
- Status e visibilidade são distintos:
  - Status = estágio do fluxo.
  - Visibilidade = ativa/arquivada/excluída.
- Quando ambos aparecem juntos: status como principal; visibilidade como complemento (ex.: perto do título ou seção secundária).

## 8.6 Acessibilidade e Contraste
- Garantir contraste adequado entre fundo e texto do badge.
- Não depender só da cor: sempre exibir texto (“Concluída”, “Arquivado”, “Excluída”).
- Em temas claro/escuro, manter o padrão “fundo soft + texto forte” com legibilidade.

## 8.7 Exemplos Conceituais
- Task ativa:
  - Título
  - Badge de status: **Em andamento** (indigo)
  - Badge de visibilidade: **Ativa** (azul claro)
- Task arquivada:
  - Status: **Concluída**
  - Visibilidade: **Arquivado** (stone)
- Task na lixeira:
  - Status: qualquer
  - Visibilidade: **Excluída** (rose)
