import { withApiHandler } from '../../../lib/supabase/server-actions';

export const GET = () =>
  withApiHandler(async () => {
    // TODO: Listar tarefas do projeto onde o usuário é membro; filtrar por visibilidade.
    return { tasks: [] };
  });

export const POST = () =>
  withApiHandler(async () => {
    // TODO: Criar tarefa vinculada a project_id e registrar activity_log.
    return { message: 'Tarefa criada (stub)' };
  });
