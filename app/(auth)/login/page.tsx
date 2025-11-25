import Link from 'next/link';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label } from '../../../components/ui';

const LoginPage = () => (
  <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Entrar</CardTitle>
        <CardDescription>Acesse sua conta para gerenciar projetos e tarefas.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" name="email" type="email" placeholder="voce@email.com" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input id="password" name="password" type="password" placeholder="********" required />
          </div>
          <Button className="w-full" type="submit">
            Entrar
          </Button>
          <p className="text-xs text-slate-400">
            TODO: Integrar com Supabase Auth e armazenar organização ativa para as próximas requisições.
          </p>
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

export default LoginPage;
