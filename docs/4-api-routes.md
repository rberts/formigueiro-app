# 8. Especificação das Rotas da API (Next.js /app/api)

> Observação:  
> A API é uma camada opcional, porém recomendada para concentrar lógica de negócio mais complexa.  
> Operações simples podem ser feitas diretamente com o Supabase Client no front-end.  
> Operações que envolvem múltiplos passos devem passar pela API.

---

# 8.1 Convenções Gerais da API

### Formato de resposta bem-sucedida
```json
{
  "success": true,
  "data": {},
  "error": null
}
```

### Formato de resposta com erro
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Descrição do erro"
  }
}
```

---

# 8.2 Rotas de Clientes (`/api/clients`)

## 8.2.1 Listar clientes  
**GET** `/api/clients`

Query params:  
- `search` (opcional)

---

## 8.2.2 Criar cliente  
**POST** `/api/clients`

Body:
```json
{
  "name": "Cliente X",
  "contact_name": "Fulano",
  "contact_email": "email@cliente.com",
  "contact_phone": "+55...",
  "notes": "Observações"
}
```

---

## 8.2.3 Atualizar cliente  
**PUT** `/api/clients/:id`

Body:
```json
{
  "name": "Novo nome",
  "contact_name": "Novo contato",
  "contact_email": "novoemail@cliente.com",
  "contact_phone": "+55...",
  "notes": "Texto atualizado"
}
```

---

## 8.2.4 Deletar cliente  
**DELETE** `/api/clients/:id`

---

# 8.3 Rotas de Projetos (`/api/projects`)

## 8.3.1 Listar projetos  
**GET** `/api/projects`

Query params:
- `client_id`
- `status`

---

## 8.3.2 Criar projeto  
**POST** `/api/projects`

Body:
```json
{
  "client_id": "uuid",
  "name": "Projeto X",
  "description": "Descrição opcional",
  "status": "active",
  "start_date": "2025-01-01",
  "due_date": "2025-02-01"
}
```

---

## 8.3.3 Detalhes do projeto  
**GET** `/api/projects/:id`

---

## 8.3.4 Atualizar projeto  
**PUT** `/api/projects/:id`

---

## 8.3.5 Arquivar projeto  
**POST** `/api/projects/:id/archive`

---

# 8.4 Rotas de Tarefas (`/api/tasks`)

## 8.4.1 Listar tarefas  
**GET** `/api/tasks?project_id=uuid&visibility=published`

---

## 8.4.2 Criar tarefa  
**POST** `/api/tasks`

Body:
```json
{
  "project_id": "uuid",
  "title": "Criar protótipo",
  "description": "Detalhes",
  "status": "to_start",
  "visibility": "published",
  "due_date": "2025-01-25",
  "assignees": ["uuid1", "uuid2"]
}
```

---

## 8.4.3 Atualizar tarefa  
**PUT** `/api/tasks/:id`

---

## 8.4.4 Mudar status  
**POST** `/api/tasks/:id/status`

Body:
```json
{
  "status": "done"
}
```

---

## 8.4.5 Arquivar / Restaurar / Enviar para lixeira

### Arquivar  
**POST** `/api/tasks/:id/archive`

### Restaurar  
**POST** `/api/tasks/:id/restore`

### Lixeira  
**POST** `/api/tasks/:id/trash`

---

# 8.5 Rotas de Logs de Tarefa (`/api/task-logs`)

## 8.5.1 Listar logs  
**GET** `/api/task-logs?task_id=uuid`

---

# 8.6 Padronização de Erros

### Tipos de erros

- `VALIDATION_ERROR`
- `UNAUTHORIZED`
- `FORBIDDEN`
- `INTERNAL_ERROR`

### Exemplo:
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "FORBIDDEN",
    "message": "Você não tem permissão para acessar este projeto."
  }
}
```
