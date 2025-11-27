"use client";
/* eslint-disable no-unused-vars */

import { useState, useTransition, type FormEvent } from "react";
import { Button, Input, Label } from "@/components/ui";
import { cn } from "@/components/lib/utils";
import type { TaskWithAssignees } from "@/types/tasks";

type TaskEditFormProps = {
  task: TaskWithAssignees;
  onSaved: (task: TaskWithAssignees) => void;
  onCancel: () => void;
  assigneeOptions?: {
    id: string;
    full_name: string | null;
    avatar_url?: string | null;
  }[];
};

type StatusOption = TaskWithAssignees["status"];

const statusOptions: { value: StatusOption; label: string }[] = [
  { value: "to_start", label: "A fazer" },
  { value: "in_progress", label: "Em andamento" },
  { value: "pending", label: "Pendente" },
  { value: "done", label: "Concluída" },
];

const formatDateInput = (value: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

const TaskEditForm = ({ task, onSaved, onCancel, assigneeOptions }: TaskEditFormProps) => {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [status, setStatus] = useState<StatusOption>(task.status);
  const [startDate, setStartDate] = useState(formatDateInput(task.start_date));
  const [dueDate, setDueDate] = useState(formatDateInput(task.due_date));
  const [assigneeId, setAssigneeId] = useState(
    task.assignees?.[0]?.id ?? assigneeOptions?.[0]?.id ?? ""
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [actionPending, setActionPending] = useState<"archive" | "trash" | null>(null);

  const parseJsonSafe = async (response: Response) => {
    const text = await response.text();
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch {
      return null;
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        status,
        start_date: startDate || null,
        due_date: dueDate || null,
        assignee_id: assigneeId || null,
      };

      try {
        const response = await fetch(`/api/tasks/${task.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await parseJsonSafe(response);
        if (!response.ok || !data || ("success" in data && data.success === false)) {
          const message =
            (data && "error" in data && data.error?.message) || "Erro ao atualizar tarefa.";
          setError(message);
          return;
        }

        const updatedTask = (data as { success: true; data: TaskWithAssignees }).data;
        onSaved(updatedTask);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erro ao atualizar tarefa.";
        setError(message);
      }
    });
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="task-title">Título</Label>
        <Input
          id="task-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isPending}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="task-description">Descrição</Label>
        <textarea
          id="task-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isPending}
          className={cn(
            "min-h-[120px] w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100",
            "placeholder:text-slate-500 focus:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-700"
          )}
          placeholder="Descreva o trabalho a ser feito..."
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="task-status">Status</Label>
          <select
            id="task-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as StatusOption)}
            disabled={isPending}
            className="w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {assigneeOptions ? (
        <div className="space-y-2">
          <Label htmlFor="task-assignee">Responsável</Label>
          <select
            id="task-assignee"
            value={assigneeId}
            onChange={(e) => setAssigneeId(e.target.value)}
            disabled={isPending}
            className="w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100"
          >
            <option value="">Selecionar</option>
            {assigneeOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.full_name || "Usuário sem nome"}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="task-start-date">Início</Label>
          <Input
            id="task-start-date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            disabled={isPending}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="task-due-date">Entrega</Label>
          <Input
            id="task-due-date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            disabled={isPending}
          />
        </div>
      </div>

      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Salvando..." : "Salvar alterações"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={isPending}
          onClick={onCancel}
        >
          Cancelar
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={isPending || actionPending !== null}
          onClick={() => {
            setActionPending("archive");
            startTransition(async () => {
              try {
                const response = await fetch(`/api/tasks/${task.id}/archive`, { method: "POST" });
                const data = await parseJsonSafe(response);
                if (!response.ok || !data || ("success" in data && data.success === false)) {
                  const message =
                    (data && "error" in data && data.error?.message) || "Erro ao arquivar.";
                  setError(message);
                } else {
                  const updatedTask = (data as { success: true; data: TaskWithAssignees }).data;
                  onSaved(updatedTask);
                }
              } catch (err) {
                const message = err instanceof Error ? err.message : "Erro ao arquivar.";
                setError(message);
              } finally {
                setActionPending(null);
              }
            });
          }}
        >
          {actionPending === "archive" ? "Arquivando..." : "Arquivar"}
        </Button>
        <Button
          type="button"
          variant="destructive"
          disabled={isPending || actionPending !== null}
          onClick={() => {
            setActionPending("trash");
            startTransition(async () => {
              try {
                const response = await fetch(`/api/tasks/${task.id}/trash`, { method: "POST" });
                const data = await parseJsonSafe(response);
                if (!response.ok || !data || ("success" in data && data.success === false)) {
                  const message =
                    (data && "error" in data && data.error?.message) || "Erro ao mover para lixeira.";
                  setError(message);
                } else {
                  const updatedTask = (data as { success: true; data: TaskWithAssignees }).data;
                  onSaved(updatedTask);
                }
              } catch (err) {
                const message =
                  err instanceof Error ? err.message : "Erro ao mover para lixeira.";
                setError(message);
              } finally {
                setActionPending(null);
              }
            });
          }}
        >
          {actionPending === "trash" ? "Excluindo..." : "Excluir"}
        </Button>
      </div>
    </form>
  );
};

export default TaskEditForm;
