'use client';

import { Button } from '../ui';

const AppHeader = () => (
  <header className="flex h-16 items-center justify-between border-b border-slate-800 bg-slate-900/60 px-6">
    <div className="space-y-0.5">
      <p className="text-xs uppercase tracking-[0.3em] text-primary-300">Formigueiro</p>
      <p className="text-sm text-slate-300">Gerenciador de projetos e tarefas</p>
    </div>
    <div className="flex items-center gap-3">
      <Button variant="outline" size="sm" type="button">
        TODO: Menu do usuário
      </Button>
    </div>
  </header>
);

export default AppHeader;
