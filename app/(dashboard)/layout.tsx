import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import AppShell from '../../components/layout/app-shell';
import { createServerComponentClient } from '../../lib/supabase/server';
import { getActiveOrganizationForUser } from '../../lib/organizations';

const DashboardLayout = async ({ children }: { children: ReactNode }) => {
  const supabase = createServerComponentClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) {
    redirect('/login');
  }

  const organization = await getActiveOrganizationForUser(user.id);

  if (!organization) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-center text-slate-200">
        <div className="space-y-2">
          <p className="text-xl font-semibold">Nenhuma organização encontrada</p>
          <p className="text-slate-400">
            Sua conta está sem organização ativa. Crie ou associe uma organização para continuar.
          </p>
        </div>
      </main>
    );
  }

  return (
    <AppShell user={user} organization={organization}>
      {children}
    </AppShell>
  );
};

export default DashboardLayout;
