# Especificações Técnicas — Arquitetura e Tecnologias do Projeto

## 1. Visão Geral da Arquitetura

Este documento define as tecnologias e padrões obrigatórios que serão utilizados na implementação da aplicação.  
O objetivo é garantir consistência, escalabilidade e alinhamento com boas práticas para desenvolvimento Web moderno.

A aplicação seguirá uma arquitetura baseada em:

- **Front-end com React** utilizando um framework híbrido (SSR/SSG).
- **Back-end serverless** através de rotas internas do próprio Next.js.
- **Supabase** como camada principal de dados, autenticação, permissões e armazenamento.
- **Tailwind + shadcn/ui** como fundação do design system.

---

## 2. Tecnologias Principais (Padrões Obrigatórios)

### 2.1 Front-end

**Framework:** **Next.js (App Router)**  
**Versão recomendada:** 14 ou superior.

O front deve:

- Usar **React Server Components** como padrão.
- Utilizar **Client Components** apenas quando necessário.
- Estruturar rotas e layouts na pasta `app/`.
- Utilizar **Server Actions** quando apropriado para operações seguras.
- Implementar SSR/SSG conforme a necessidade das páginas.

---

### 2.2 UI e Design System

A aplicação deve utilizar:

- **TailwindCSS**
- **shadcn/ui**

Padrões:

- Componentes do shadcn devem ser instalados individualmente em `components/ui`.
- Customizações devem ser feitas via Tailwind.
- Toda a estilização deve seguir tokens definidos em `tailwind.config.js`.
- O layout global será definido em `app/layout.tsx`.

---

### 2.3 Back-end (BFF com Next.js)

O back-end será implementado no próprio projeto, utilizando:

- **Route Handlers** (`app/api/*/route.ts`)
- Padrões REST:
  - `GET` → leitura
  - `POST` → criação
  - `PUT/PATCH` → atualização
  - `DELETE` → remoção
- **Server Actions** para formulários e operações seguras

Regras gerais:

- Nenhum segredo de ambiente deve ser exposto ao cliente.
- Toda lógica de negócio deve estar no servidor.
- O cliente deve sempre se comunicar via chamadas para `/api/*` ou Server Actions.

---

### 2.4 Supabase (Back-end de Dados)

A aplicação utiliza o Supabase como serviço de:

- **PostgreSQL**
- **Autenticação**
- **Row Level Security (RLS)**
- **Storage**
- **Funções SQL & Policies**

Padrões de uso:

- Cliente **server-side** configurado em:
  - `lib/supabase/client-server.ts`
- Cliente **browser** (somente se necessário) em:
  - `lib/supabase/client-browser.ts`
- Toda comunicação com o banco deve utilizar o Supabase Client.

---

## 3. Estrutura de Pastas do Projeto

O projeto deve seguir rigorosamente a seguinte organização:

```
src/
  app/
    layout.tsx
    page.tsx

    (auth)/
      login/
        page.tsx
      register/
        page.tsx

    dashboard/
      page.tsx

    api/
      resources/
        route.ts
      profile/
        route.ts

  components/
    ui/
    layout/
    forms/
    shared/

  lib/
    supabase/
      client-server.ts
      client-browser.ts
    utils/
    validators/

  styles/
    globals.css
    tailwind.css
```

---

## 4. Padrões Globais de Desenvolvimento

- Todo código deve ser escrito em **TypeScript**.
- Componentes React devem ser criados com **function components** usando arrow functions.
- Nomes de arquivos devem seguir o padrão **kebab-case**.
- API deve sempre retornar objetos JSON consistentes.
- Regras de negócio nunca devem ser implementadas no cliente.
- Requisições devem ser feitas via:
  - Rotas internas (`/api/*`)
  - Server Actions
- Estilização sempre com Tailwind.
