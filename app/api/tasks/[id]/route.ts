import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/lib/supabase/server';
import { getActiveOrganizationForUser } from '@/lib/organizations';
import type { Database } from '@/types/database';

type ApiErrorCode = 'VALIDATION_ERROR' | 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'DB_ERROR' | 'INTERNAL_ERROR';
type ApiSuccess<T> = { success: true; data: T; error: null };
type ApiErrorResponse = { success: false; data: null; error: { code: ApiErrorCode; message: string; details?: unknown } };

type RouteContext = { params: { id: string } };
type TaskStatus = Database['public']['Tables']['tasks']['Row']['status'];
type TaskVisibility = Database['public']['Tables']['tasks']['Row']['visibility'];
type TaskUpdate = Database['public']['Tables']['tasks']['Update'];

const successResponse = <T>(data: T, init?: ResponseInit) =>
  NextResponse.json({ success: true, data, error: null } satisfies ApiSuccess<T>, init);

const errorResponse = (code: ApiErrorCode, message: string, status: number, details?: unknown) =>
  NextResponse.json({ success: false, data: null, error: { code, message, details } } satisfies ApiErrorResponse, {
    status
  });

const unauthorized = () => errorResponse('UNAUTHORIZED', 'Usuário não autenticado.', 401);

const allowedStatuses: TaskStatus[] = ['to_start', 'in_progress', 'pending', 'done'];
const allowedVisibilities: TaskVisibility[] = ['published', 'archived', 'trashed'];

const ensureTaskAccessible = async (
  supabase: ReturnType<typeof createRouteHandlerClient>,
  taskId: string,
  organizationId: string
) => {
  return supabase
    .from('tasks')
    .select(
      'id, project_id, title, description, status, visibility, start_date, due_date, created_by, created_at, updated_at, projects!inner(id, organization_id)'
    )
    .eq('id', taskId)
    .eq('projects.organization_id', organizationId)
    .maybeSingle();
};

export async function GET(
  _request: Request,
  { params }: RouteContext
): Promise<NextResponse<ApiSuccess<unknown> | ApiErrorResponse>> {
  const supabase = createRouteHandlerClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    return unauthorized();
  }

  const organization = await getActiveOrganizationForUser(userData.user.id, supabase);
  if (!organization) {
    return errorResponse('FORBIDDEN', 'Nenhuma organização ativa encontrada para este usuário.', 403);
  }

  const {
    data: taskWithProject,
    error: taskError
  } = await ensureTaskAccessible(supabase, params.id, organization.id);

  if (taskError) {
    console.error('[GET /api/tasks/:id] supabase error:', taskError);
    return errorResponse(
      'DB_ERROR',
      'Erro ao buscar tarefa.',
      500,
      { supabase_code: taskError.code, supabase_message: taskError.message }
    );
  }

  if (!taskWithProject) {
    return errorResponse('NOT_FOUND', 'Tarefa não encontrada para a organização ativa.', 404);
  }

  const { projects: _project, ...task } = taskWithProject;
  return successResponse(task);
}

export async function PUT(
  request: Request,
  { params }: RouteContext
): Promise<NextResponse<ApiSuccess<unknown> | ApiErrorResponse>> {
  const supabase = createRouteHandlerClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    return unauthorized();
  }

  const organization = await getActiveOrganizationForUser(userData.user.id, supabase);
  if (!organization) {
    return errorResponse('FORBIDDEN', 'Nenhuma organização ativa encontrada para este usuário.', 403);
  }

  let body: {
    title?: string;
    description?: string;
    status?: TaskStatus;
    visibility?: TaskVisibility;
    start_date?: string;
    due_date?: string;
  };

  try {
    body = await request.json();
  } catch {
    return errorResponse('VALIDATION_ERROR', 'Corpo da requisição inválido.', 400);
  }

  const {
    data: taskWithProject,
    error: taskError
  } = await ensureTaskAccessible(supabase, params.id, organization.id);

  if (taskError) {
    console.error('[PUT /api/tasks/:id] supabase error (validation):', taskError);
    return errorResponse(
      'DB_ERROR',
      'Erro ao validar tarefa.',
      500,
      { supabase_code: taskError.code, supabase_message: taskError.message }
    );
  }

  if (!taskWithProject) {
    return errorResponse('NOT_FOUND', 'Tarefa não encontrada para a organização ativa.', 404);
  }

  const title = body.title?.trim();
  const description = body.description?.trim();

  if (body.status && !allowedStatuses.includes(body.status)) {
    return errorResponse('VALIDATION_ERROR', 'Status da tarefa inválido.', 400);
  }

  if (body.visibility && !allowedVisibilities.includes(body.visibility)) {
    return errorResponse('VALIDATION_ERROR', 'Visibilidade inválida.', 400);
  }

  const updatePayload: TaskUpdate = {
    title: body.title !== undefined ? title || null : undefined,
    description: body.description !== undefined ? description ?? null : undefined,
    status: body.status ?? undefined,
    visibility: body.visibility ?? undefined,
    start_date: body.start_date !== undefined ? body.start_date.trim() || null : undefined,
    due_date: body.due_date !== undefined ? body.due_date.trim() || null : undefined
  };

  const {
    data,
    error: updateError
  } = await supabase
    .from('tasks')
    .update(updatePayload)
    .eq('id', params.id)
    .eq('project_id', taskWithProject.project_id)
    .select('id, project_id, title, description, status, visibility, start_date, due_date, created_by, created_at, updated_at')
    .maybeSingle();

  if (updateError) {
    console.error('[PUT /api/tasks/:id] supabase error (update):', updateError);
    return errorResponse(
      'DB_ERROR',
      'Erro ao atualizar tarefa.',
      500,
      { supabase_code: updateError.code, supabase_message: updateError.message }
    );
  }

  if (!data) {
    return errorResponse('NOT_FOUND', 'Tarefa não encontrada para a organização ativa.', 404);
  }

  return successResponse(data);
}
