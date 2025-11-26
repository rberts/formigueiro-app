import type { ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import AppHeader from './app-header';
import AppSidebar from './app-sidebar';

type Organization = Database['public']['Tables']['organizations']['Row'];

export type AppShellProps = {
  children: ReactNode;
  user?: User | null;
  organization?: Organization | null;
};

const AppShell = ({ children, user: _user, organization: _organization }: AppShellProps) => (
  <div className="flex min-h-screen bg-slate-950 text-slate-50">
    <AppSidebar />
    <div className="flex flex-1 flex-col">
      <AppHeader />
      <main className="flex-1 bg-slate-950 p-8">{children}</main>
    </div>
  </div>
);

export default AppShell;
