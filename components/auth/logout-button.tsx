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
    <Button variant="outline" size="sm" type="button" onClick={handleLogout} disabled={isPending}>
      {isPending ? 'Saindo...' : 'Sair'}
    </Button>
  );
};

export default LogoutButton;
