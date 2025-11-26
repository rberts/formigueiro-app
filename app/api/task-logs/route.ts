import { NextResponse, type NextResponseInit } from 'next/server';
import { createRouteHandlerClient } from '@/lib/supabase/server';
import { getActiveOrganizationForUser } from '@/lib/organizations';

type ApiErrorCode = 'VALIDATION_ERROR' | 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'DB_ERROR';
type ApiSuccess<T> = { success: true; data: T; error: null };
type ApiErrorResponse = { success: false; error: { code: ApiErrorCode; message: string; details?: unknown }; data: null };

const successResponse = <T>(data: T, init?: NextResponseInit) =>
  NextResponse.json({ success: true, data, error: null } satisfies ApiSuccess<T>, init);

const errorResponse = (code: ApiErrorCode, message: string, status: number, details?: unknown) =>
  NextResponse.json({ success: false, data: null, error: { code, message, details } } satisfies ApiErrorResponse, {
    status
  });

const unauthorized = () => errorResponse('UNAUTHORIZED', 'Usuário não autenticado.', 401);

const fetchTaskInOrg = async (supabase: ReturnType<typeof createRouteHandlerClient>, taskId: string, orgId: string) =>
  supabase
    .from('tasks')
    .select('id, project_id, projects!inner(id, organization_id)')
    .eq('id', taskId)
    .eq('projects.organization_id', orgId)
    .maybeSingle();

export async function GET(request: Request): Promise<NextResponse<ApiSuccess<unknown> | ApiErrorResponse>> {
  const supabase = createRouteHandlerClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    return unauthorized();
  }

  const organization = await getActiveOrganizationForUser(userData.user.id, supabase);
  if (!organization) {
    return errorResponse('FORBIDDEN', 'Nenhuma organização ativa encontrada para este usuário.', 403);
  }

  const searchParams = new URL(request.url).searchParams;
  const taskId = searchParams.get('task_id')?.trim();

  if (!taskId) {
    return errorResponse('VALIDATION_ERROR', 'O parâmetro task_id é obrigatório.', 400);
  }

  const {
    data: task,
    error: taskError
  } = await fetchTaskInOrg(supabase, taskId, organization.id);

  if (taskError) {
    console.error('[GET /api/task-logs] erro ao validar tarefa:', taskError);
    return errorResponse(
      'DB_ERROR',
      'Erro ao validar tarefa.',
      500,
      { supabase_code: taskError.code, supabase_message: taskError.message }
    );
  }

  if (!task) {
    return errorResponse('NOT_FOUND', 'Tarefa não encontrada para a organização ativa.', 404);
  }

  const { data, error } = await supabase
    .from('task_activity_log')
    .select('id, action_type, from_status, to_status, from_due_date, to_due_date, description, user_id, created_at, profiles(full_name)')
    .eq('task_id', taskId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[GET /api/task-logs] supabase error:', error);
    return errorResponse(
      'DB_ERROR',
      'Erro ao buscar logs da tarefa.',
      500,
      { supabase_code: error.code, supabase_message: error.message }
    );
  }

  const logs = data?.map((log) => ({
    id: log.id,
    action: (log as { action_type?: string }).action_type ?? null,
    from_status: (log as { from_status?: string | null }).from_status ?? null,
    to_status: (log as { to_status?: string | null }).to_status ?? null,
    from_due_date: (log as { from_due_date?: string | null }).from_due_date ?? null,
    to_due_date: (log as { to_due_date?: string | null }).to_due_date ?? null,
    description: (log as { description?: string | null }).description ?? null,
    user_id: log.user_id,
    user_name: (log.profiles as { full_name: string | null } | null)?.full_name ?? null,
    created_at: log.created_at
  }));

  return successResponse(logs);
}
