import { withApiHandler } from '../../../lib/supabase/server-actions';

export const GET = () =>
  withApiHandler(async () => {
    // TODO: Listar clients filtrando por organização ativa e search.
    return { clients: [] };
  });

export const POST = () =>
  withApiHandler(async () => {
    // TODO: Criar cliente associado à organização ativa.
    return { message: 'Cliente criado (stub)' };
  });
