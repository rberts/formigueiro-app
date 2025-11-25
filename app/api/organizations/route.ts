import { withApiHandler } from '../../../lib/supabase/server-actions';

export const GET = () =>
  withApiHandler(async () => {
    // TODO: Consultar organizations da organização ativa (multi-tenant) com Supabase.
    return { organizations: [] };
  });

export const POST = () =>
  withApiHandler(async () => {
    // TODO: Criar organization vinculada ao usuário autenticado.
    return { message: 'Organização criada (stub)' };
  });
