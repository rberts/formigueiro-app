'use client';

import Link from 'next/link';
import { useState, useTransition, type FormEvent } from 'react';
import { registerAction } from './actions';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label } from '../../../components/ui';

const RegisterPage = () => {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setError(null);

    startTransition(async () => {
      const result = await registerAction(formData);
      if (result && 'error' in result && result.error) {
        setError(result.error);
      }
    });
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Criar conta</CardTitle>
          <CardDescription>Cadastre-se para começar a organizar sua operação.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="full_name">Nome completo</Label>
              <Input id="full_name" name="full_name" placeholder="Seu nome" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="organization_name">Nome da organização</Label>
              <Input id="organization_name" name="organization_name" placeholder="Minha Empresa LTDA" required />
            </div>
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
              {isPending ? 'Criando conta...' : 'Criar conta'}
            </Button>
          </form>
          <p className="text-sm text-slate-300">
            Já tem conta?{' '}
            <Link href="/login" className="text-primary-300 hover:text-primary-200">
              Entrar
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
};

export default RegisterPage;
