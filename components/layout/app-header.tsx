'use client';

import LogoutButton from '../auth/logout-button';

type AppHeaderProps = {
  organizationName?: string;
  userEmail?: string;
  userName?: string;
};

const AppHeader = ({ organizationName, userEmail, userName }: AppHeaderProps) => (
  <header className="flex h-16 items-center justify-between border-b border-slate-800 bg-slate-900/60 px-6">
    <div className="space-y-0.5">
      <p className="text-xs uppercase tracking-[0.3em] text-primary-300">Formigueiro</p>
      <p className="text-sm text-slate-300">
        {organizationName ? `Org ativa: ${organizationName}` : 'Organização não selecionada'}
      </p>
    </div>
    <div className="flex items-center gap-3 text-sm">
      <span className="text-slate-200">{userName || userEmail || 'Usuário'}</span>
      <LogoutButton />
    </div>
  </header>
);

export default AppHeader;
