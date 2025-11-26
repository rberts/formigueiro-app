'use client';

import { useState, useTransition, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from '@/components/ui';

type ProjectMemberOption = {
  id: string;
  name: string;
};

type ApiError = { code: string; message: string; details?: unknown };
type ApiResponse<T> = { success: true; data: T; error: null } | { success: false; data: null; error: ApiError };

type AddProjectMemberFormProps = {
  projectId: string;
  availableMembers: ProjectMemberOption[];
};

const AddProjectMemberForm = ({ projectId, availableMembers }: AddProjectMemberFormProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [selectedUserId, setSelectedUserId] = useState('');
  const [role, setRole] = useState('member');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!selectedUserId) {
      setError('Selecione um usuário da organização.');
      return;
    }

    startTransition(async () => {
      const response = await fetch(`/api/projects/${projectId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: selectedUserId,
          role: role.trim() || undefined
        })
      });

      const data = (await response.json()) as ApiResponse<{ user_id: string }>;

      if (!response.ok || !('success' in data) || data.success === false) {
        const message = data && 'error' in data && data.error?.message ? data.error.message : 'Erro ao adicionar membro.';
        setError(message);
        return;
      }

      setSuccess('Membro adicionado com sucesso.');
      setSelectedUserId('');
      setRole('member');
      router.refresh();
    });
  };

  return (
    <Card className="border border-slate-800 bg-slate-900/60">
      <CardHeader>
        <CardTitle className="text-lg">Adicionar membro</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="member">Usuário</Label>
            <select
              id="member"
              name="member"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
            >
              <option value="">Selecione um usuário</option>
              {availableMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name || member.id}
                </option>
              ))}
            </select>
            {availableMembers.length === 0 ? (
              <p className="text-xs text-slate-500">Todos os membros da organização já estão neste projeto.</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Papel</Label>
            <Input id="role" name="role" value={role} onChange={(e) => setRole(e.target.value)} placeholder="member" />
            <p className="text-xs text-slate-400">Default: member</p>
          </div>
          {error ? <p className="text-sm text-red-400">{error}</p> : null}
          {success ? <p className="text-sm text-green-400">{success}</p> : null}
          <Button type="submit" className="w-full" disabled={isPending || availableMembers.length === 0}>
            {isPending ? 'Adicionando...' : 'Adicionar ao projeto'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddProjectMemberForm;
