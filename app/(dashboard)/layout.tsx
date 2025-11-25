import type { ReactNode } from 'react';
import AppShell from '../../components/layout/app-shell';

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  // TODO: Validar usuário autenticado e organização ativa antes de renderizar.
  return <AppShell>{children}</AppShell>;
};

export default DashboardLayout;
