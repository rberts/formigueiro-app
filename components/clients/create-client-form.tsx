'use client';

import { useState, useTransition, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from '../ui';

type ApiError = { code: string; message: string; details?: unknown };
type ApiResponse<T> = { success: true; data: T } | { success: false; error: ApiError };

const CreateClientForm = () => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Nome é obrigatório.');
      return;
    }

    startTransition(async () => {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim() || undefined, phone: phone.trim() || undefined })
      });

      const data = (await response.json()) as ApiResponse<{ id: string }>;

      if (!response.ok || !('success' in data) || data.success === false) {
        const message = data && 'error' in data && data.error?.message ? data.error.message : 'Erro ao criar cliente.';
        setError(message);
        return;
      }

      setName('');
      setEmail('');
      setPhone('');
      router.refresh();
    });
  };

  return (
    <Card className="border border-slate-800 bg-slate-900/60">
      <CardHeader>
        <CardTitle className="text-lg">Novo cliente</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input id="name" name="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Cliente X" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@cliente.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input id="phone" name="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+55..." />
          </div>
          {error ? <p className="text-sm text-red-400">{error}</p> : null}
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Criando...' : 'Criar cliente'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateClientForm;
