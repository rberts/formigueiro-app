'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Label } from '@/components/ui';

type ApiError = { code: string; message: string; details?: unknown };
type ApiResponse<T> = { success: true; data: T; error: null } | { success: false; data: null; error: ApiError };

type TaskStatus = 'to_start' | 'in_progress' | 'pending' | 'done';
type TaskVisibility = 'published' | 'archived' | 'trashed';

type TaskStatusControlsProps = {
  taskId: string;
  currentStatus: TaskStatus;
  currentVisibility: TaskVisibility;
};

const statusOptions: { value: TaskStatus; label: string }[] = [
  { value: 'to_start', label: 'A iniciar' },
  { value: 'in_progress', label: 'Em andamento' },
  { value: 'pending', label: 'Pendente' },
  { value: 'done', label: 'Concluída' }
];

const TaskStatusControls = ({ taskId, currentStatus, currentVisibility }: TaskStatusControlsProps) => {
  const router = useRouter();
  const [status, setStatus] = useState<TaskStatus>(currentStatus);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const callEndpoint = async (path: string, body?: Record<string, unknown>) => {
    setError(null);
    const response = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined
    });

    const data = (await response.json()) as ApiResponse<unknown>;
    if (!response.ok || ('success' in data && data.success === false)) {
      const message =
        data && 'error' in data && data.error?.message ? data.error.message : 'Erro ao executar ação.';
      setError(message);
      return false;
    }
    return true;
  };

  const handleStatusChange = (nextStatus: TaskStatus) => {
    if (nextStatus === status) return;
    startTransition(async () => {
      const ok = await callEndpoint(`/api/tasks/${taskId}/status`, { status: nextStatus });
      if (ok) {
        setStatus(nextStatus);
        router.refresh();
      }
    });
  };

  const handleArchive = () => {
    startTransition(async () => {
      const ok = await callEndpoint(`/api/tasks/${taskId}/archive`);
      if (ok) router.refresh();
    });
  };

  const handleRestore = () => {
    startTransition(async () => {
      const ok = await callEndpoint(`/api/tasks/${taskId}/restore`);
      if (ok) router.refresh();
    });
  };

  const handleTrash = () => {
    startTransition(async () => {
      const ok = await callEndpoint(`/api/tasks/${taskId}/trash`);
      if (ok) router.refresh();
    });
  };

  return (
    <div className="space-y-2">
      <div className="space-y-1">
        <Label htmlFor={`status-${taskId}`} className="text-xs text-slate-300">
          Status
        </Label>
        <select
          id={`status-${taskId}`}
          value={status}
          onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
          className="w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100"
          disabled={isPending}
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-wrap gap-2 text-xs">
        {currentVisibility !== 'archived' && currentVisibility !== 'trashed' ? (
          <Button size="sm" variant="secondary" onClick={handleArchive} disabled={isPending}>
            Arquivar
          </Button>
        ) : null}
        {currentVisibility !== 'published' ? (
          <Button size="sm" variant="secondary" onClick={handleRestore} disabled={isPending}>
            Restaurar
          </Button>
        ) : null}
        {currentVisibility !== 'trashed' ? (
          <Button size="sm" variant="destructive" onClick={handleTrash} disabled={isPending}>
            Lixeira
          </Button>
        ) : null}
      </div>
      {error ? <p className="text-xs text-red-400">{error}</p> : null}
    </div>
  );
};

export default TaskStatusControls;
