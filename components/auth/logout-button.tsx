'use client';

import { useTransition } from 'react';
import { logoutAction } from './actions';
import { Button } from '../ui';

const LogoutButton = () => {
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction();
    });
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      type="button"
      onClick={handleLogout}
      disabled={isPending}
      className="px-2 text-xs font-semibold uppercase tracking-wide text-primary-300 hover:text-primary-200"
    >
      {isPending ? 'Saindo...' : 'Sair'}
    </Button>
  );
};

export default LogoutButton;
