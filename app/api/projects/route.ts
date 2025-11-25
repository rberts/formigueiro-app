import { withApiHandler } from '../../../lib/supabase/server-actions';

export const GET = () =>
  withApiHandler(async () => {
    // TODO: Listar projetos do usuário (organization + project_members) com filtros de status/cliente.
    return { projects: [] };
  });

export const POST = () =>
  withApiHandler(async () => {
    // TODO: Criar projeto vinculado a um cliente e organização ativa.
    return { message: 'Projeto criado (stub)' };
  });
