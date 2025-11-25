import type { ReactNode } from 'react';
import AppHeader from './app-header';
import AppSidebar from './app-sidebar';

export type AppShellProps = {
  children: ReactNode;
};

const AppShell = ({ children }: AppShellProps) => (
  <div className="flex min-h-screen bg-slate-950 text-slate-50">
    <AppSidebar />
    <div className="flex flex-1 flex-col">
      <AppHeader />
      <main className="flex-1 bg-slate-950 p-8">{children}</main>
    </div>
  </div>
);

export default AppShell;
