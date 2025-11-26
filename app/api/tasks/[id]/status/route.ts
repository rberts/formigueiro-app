import { NextResponse, type NextResponseInit } from 'next/server';
import { createRouteHandlerClient } from '@/lib/supabase/server';
import { getActiveOrganizationForUser } from '@/lib/organizations';
import type { Database } from '@/types/database';

type ApiErrorCode = 'VALIDATION_ERROR' | 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'DB_ERROR';
type ApiSuccess<T> = { success: true; data: T; error: null };
type ApiErrorResponse = { success: false; error: { code: ApiErrorCode; message: string; details?: unknown }; data: null };

type RouteContext = { params: { id: string } };
type TaskRow = Database['public']['Tables']['tasks']['Row'];
type TaskStatus = TaskRow['status'];

type TaskLogInsert = Database['public']['Tables']['task_activity_log']['Insert'] & {
  project_id?: string;
  organization_id?: string;
  action?: string;
  from_visibility?: string | null;
  to_visibility?: string | null;
  action_type?: string;
};

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
    .select('id, project_id, title, description, status, visibility, start_date, due_date, created_by, created_at, updated_at, projects!inner(id, organization_id)')
    .eq('id', taskId)
    .eq('projects.organization_id', orgId)
    .maybeSingle();

export async function POST(
  request: Request,
  { params }: RouteContext
): Promise<NextResponse<ApiSuccess<TaskRow> | ApiErrorResponse>> {
  const supabase = createRouteHandlerClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    return unauthorized();
  }

  const organization = await getActiveOrganizationForUser(userData.user.id, supabase);
  if (!organization) {
    return errorResponse('FORBIDDEN', 'Nenhuma organização ativa encontrada para este usuário.', 403);
  }

  let body: { status?: TaskStatus };
  try {
    body = await request.json();
  } catch {
    return errorResponse('VALIDATION_ERROR', 'Corpo da requisição inválido.', 400);
  }

  const newStatus = body.status;
  const allowedStatuses: TaskStatus[] = ['to_start', 'in_progress', 'pending', 'done'];

  if (!newStatus || !allowedStatuses.includes(newStatus)) {
    return errorResponse('VALIDATION_ERROR', 'Status inválido.', 400);
  }

  const {
    data: task,
    error: taskError
  } = await fetchTaskInOrg(supabase, params.id, organization.id);

  if (taskError) {
    console.error('[POST /api/tasks/:id/status] erro ao validar tarefa:', taskError);
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

  const { data: updatedTask, error: updateError } = await supabase
    .from('tasks')
    .update({ status: newStatus })
    .eq('id', params.id)
    .select('id, project_id, title, description, status, visibility, start_date, due_date, created_by, created_at, updated_at')
    .maybeSingle();

  if (updateError) {
    console.error('[POST /api/tasks/:id/status] erro ao atualizar tarefa:', updateError);
    return errorResponse(
      'DB_ERROR',
      'Erro ao atualizar status da tarefa.',
      500,
      { supabase_code: updateError.code, supabase_message: updateError.message }
    );
  }

  const logPayload: TaskLogInsert = {
    task_id: task.id,
    user_id: userData.user.id,
    action_type: 'STATUS_CHANGED',
    from_status: task.status,
    to_status: newStatus
  };

  const { error: logError } = await supabase.from('task_activity_log').insert(logPayload);

  if (logError) {
    console.error('[TASK ACTIVITY LOG ERROR]', logError);
    return errorResponse(
      'DB_ERROR',
      'Erro ao registrar log de atividade.',
      500,
      { supabase_code: logError.code, supabase_message: logError.message }
    );
  }

  return successResponse(updatedTask);
}
