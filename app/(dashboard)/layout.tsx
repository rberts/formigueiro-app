import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import AppShell from '../../components/layout/app-shell';
import { createServerClient, getUser } from '../../lib/supabase/server';

const DashboardLayout = async ({ children }: { children: ReactNode }) => {
  const user = await getUser();
  if (!user) {
    redirect('/login');
  }

  const supabase = createServerClient();

  const { data: membership, error: membershipError } = await supabase
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle();

  if (membershipError) {
    throw new Error('Falha ao carregar organização do usuário.');
  }

  const organizationId = membership?.organization_id;
  if (!organizationId) {
    redirect('/');
  }

  const { data: organization, error: organizationError } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', organizationId)
    .single();

  if (organizationError || !organization) {
    throw new Error('Organização não encontrada para o usuário.');
  }

  return (
    <AppShell user={user} organization={organization}>
      {children}
    </AppShell>
  );
};

export default DashboardLayout;
