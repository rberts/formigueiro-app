'use client';

import { useState, useTransition, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from '@/components/ui';

type ApiError = { code: string; message: string; details?: unknown };
type ApiResponse<T> = { success: true; data: T; error: null } | { success: false; data: null; error: ApiError };

type ProjectMember = {
  id: string;
  name: string;
};

type CreateTaskFormProps = {
  projectId: string;
  projectMembers: ProjectMember[];
};

const statusOptions = [
  { value: 'to_start', label: 'A iniciar' },
  { value: 'in_progress', label: 'Em andamento' },
  { value: 'pending', label: 'Pendente' },
  { value: 'done', label: 'Concluída' }
] as const;

const CreateTaskForm = ({ projectId, projectMembers }: CreateTaskFormProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'to_start' | 'in_progress' | 'pending' | 'done'>('to_start');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [assigneeIds, setAssigneeIds] = useState<string[]>([]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!title.trim()) {
      setError('Título é obrigatório.');
      return;
    }

    startTransition(async () => {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId,
          title: title.trim(),
          description: description.trim() || undefined,
          status,
          start_date: startDate || undefined,
          due_date: dueDate || undefined,
          assignee_ids: assigneeIds
        })
      });

      const data = (await response.json()) as ApiResponse<{ id: string }>;

      if (!response.ok || !('success' in data) || data.success === false) {
        const message =
          data && 'error' in data && data.error?.message ? data.error.message : 'Erro ao criar tarefa.';
        setError(message);
        return;
      }

      setSuccess('Tarefa criada com sucesso.');
      setTitle('');
      setDescription('');
      setStartDate('');
      setDueDate('');
      setStatus('to_start');
      setAssigneeIds([]);
      router.refresh();
    });
  };

  return (
    <Card className="border border-slate-800 bg-slate-900/60">
      <CardHeader>
        <CardTitle className="text-lg">Nova tarefa</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input id="title" name="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <textarea
              id="description"
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
              rows={3}
              placeholder="Detalhes da tarefa"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              name="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as typeof status)}
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="assignees">Responsáveis</Label>
            <select
              id="assignees"
              name="assignees"
              multiple
              value={assigneeIds}
              onChange={(event) => {
                const selected = Array.from(event.target.selectedOptions).map((opt) => opt.value);
                setAssigneeIds(selected);
              }}
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
            >
              {projectMembers.length === 0 ? (
                <option disabled>Nenhum membro disponível</option>
              ) : (
                projectMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name || member.id}
                  </option>
                ))
              )}
            </select>
            <p className="text-xs text-slate-400">Use Ctrl/Cmd + clique para múltiplas seleções.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="start_date">Início</Label>
            <Input id="start_date" name="start_date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="due_date">Prazo</Label>
            <Input id="due_date" name="due_date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
          {error ? <p className="text-sm text-red-400">{error}</p> : null}
          {success ? <p className="text-sm text-green-400">{success}</p> : null}
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Criando...' : 'Criar tarefa'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateTaskForm;
