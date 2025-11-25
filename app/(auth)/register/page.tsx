import Link from 'next/link';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label } from '../../../components/ui';

const RegisterPage = () => (
  <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Criar conta</CardTitle>
        <CardDescription>Cadastre-se para começar a organizar sua operação.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full-name">Nome completo</Label>
            <Input id="full-name" name="full-name" placeholder="Seu nome" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" name="email" type="email" placeholder="voce@email.com" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input id="password" name="password" type="password" placeholder="********" required />
          </div>
          <Button className="w-full" type="submit">
            Criar conta
          </Button>
          <p className="text-xs text-slate-400">
            TODO: Criar usuário no Supabase Auth e criar organização padrão vinculada ao perfil.
          </p>
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

export default RegisterPage;
