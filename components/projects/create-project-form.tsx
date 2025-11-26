'use client';

import { useState, useTransition, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from '../ui';

type ApiError = { code: string; message: string; details?: unknown };
type ApiResponse<T> = { success: true; data: T } | { success: false; error: ApiError };

type ClientOption = {
  id: string;
  name: string;
};

type CreateProjectFormProps = {
  clients: ClientOption[];
};

const CreateProjectForm = ({ clients }: CreateProjectFormProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [clientId, setClientId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!clientId) {
      setError('Selecione um cliente.');
      return;
    }
    if (!name.trim()) {
      setError('Nome do projeto é obrigatório.');
      return;
    }

    startTransition(async () => {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: clientId,
          name: name.trim(),
          description: description.trim() || undefined,
          start_date: startDate || undefined,
          due_date: dueDate || undefined
        })
      });

      const data = (await response.json()) as ApiResponse<{ id: string }>;

      if (!response.ok || !('success' in data) || data.success === false) {
        const message = data && 'error' in data && data.error?.message ? data.error.message : 'Erro ao criar projeto.';
        setError(message);
        return;
      }

      setSuccess('Projeto criado com sucesso.');
      setName('');
      setDescription('');
      setStartDate('');
      setDueDate('');
      setClientId('');
      router.refresh();
    });
  };

  return (
    <Card className="border border-slate-800 bg-slate-900/60">
      <CardHeader>
        <CardTitle className="text-lg">Novo projeto</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="client">Cliente *</Label>
            <select
              id="client"
              name="client"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
              required
            >
              <option value="">Selecione um cliente</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input id="name" name="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Projeto X" required />
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
              placeholder="Detalhes do projeto"
            />
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
            {isPending ? 'Criando...' : 'Criar projeto'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateProjectForm;
