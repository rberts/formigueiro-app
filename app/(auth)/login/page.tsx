'use client';

import Link from 'next/link';
import { useState, useTransition, type FormEvent } from 'react';
import { loginAction } from './actions';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label } from '../../../components/ui';

const LoginPage = () => {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setError(null);

    startTransition(async () => {
      const result = await loginAction(formData);
      if (result && 'error' in result && result.error) {
        setError(result.error);
      }
    });
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Entrar</CardTitle>
          <CardDescription>Acesse sua conta para gerenciar projetos e tarefas.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" name="email" type="email" placeholder="voce@email.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" name="password" type="password" placeholder="********" required />
            </div>

            {error ? <p className="text-sm text-red-400">{error}</p> : null}

            <Button className="w-full" type="submit" disabled={isPending}>
              {isPending ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
          <p className="text-sm text-slate-300">
            Ainda não tem conta?{' '}
            <Link href="/register" className="text-primary-300 hover:text-primary-200">
              Cadastre-se
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
};

export default LoginPage;
