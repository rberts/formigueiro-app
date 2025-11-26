import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/lib/supabase/server';
import { getActiveOrganizationForUser } from '@/lib/organizations';
import type { Database } from '@/types/database';

type ApiErrorCode = 'VALIDATION_ERROR' | 'UNAUTHORIZED' | 'FORBIDDEN' | 'DB_ERROR' | 'INTERNAL_ERROR';
type ApiSuccess<T> = { success: true; data: T; error: null };
type ApiErrorResponse = { success: false; data: null; error: { code: ApiErrorCode; message: string; details?: unknown } };

type TaskStatus = Database['public']['Tables']['tasks']['Row']['status'];
type TaskVisibility = Database['public']['Tables']['tasks']['Row']['visibility'];
type TaskInsert = Database['public']['Tables']['tasks']['Insert'];

const successResponse = <T>(data: T, init?: ResponseInit) =>
  NextResponse.json({ success: true, data, error: null } satisfies ApiSuccess<T>, init);

const errorResponse = (code: ApiErrorCode, message: string, status: number, details?: unknown) =>
  NextResponse.json({ success: false, data: null, error: { code, message, details } } satisfies ApiErrorResponse, {
    status
  });

const unauthorized = () => errorResponse('UNAUTHORIZED', 'Usuário não autenticado.', 401);

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
  const projectId = searchParams.get('project_id')?.trim();
  const visibilityParam = searchParams.get('visibility')?.trim();

  if (!projectId) {
    return errorResponse('VALIDATION_ERROR', 'O parâmetro project_id é obrigatório.', 400);
  }

  const allowedVisibilities: TaskVisibility[] = ['published', 'archived', 'trashed'];
  const visibility: TaskVisibility = visibilityParam ? (visibilityParam as TaskVisibility) : 'published';

  if (visibilityParam && !allowedVisibilities.includes(visibility)) {
    return errorResponse('VALIDATION_ERROR', 'Parâmetro visibility inválido.', 400);
  }

  const {
    data: project,
    error: projectError
  } = await supabase
    .from('projects')
    .select('id')
    .eq('id', projectId)
    .eq('organization_id', organization.id)
    .maybeSingle();

  if (projectError) {
    console.error('[GET /api/tasks] erro ao validar projeto:', projectError);
    return errorResponse(
      'DB_ERROR',
      'Erro ao validar projeto.',
      500,
      { supabase_code: projectError.code, supabase_message: projectError.message }
    );
  }

  if (!project) {
    return errorResponse('FORBIDDEN', 'Projeto não encontrado ou fora da organização ativa.', 403);
  }

  const { data, error } = await supabase
    .from('tasks')
    .select('id, project_id, title, description, status, visibility, start_date, due_date, created_at, updated_at')
    .eq('project_id', projectId)
    .eq('visibility', visibility);

  if (error) {
    console.error('[GET /api/tasks] supabase error:', error);
    return errorResponse(
      'DB_ERROR',
      'Erro ao buscar tarefas.',
      500,
      { supabase_code: error.code, supabase_message: error.message }
    );
  }

  return successResponse(data);
}

export async function POST(request: Request): Promise<NextResponse<ApiSuccess<unknown> | ApiErrorResponse>> {
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
    project_id?: string;
    title?: string;
    description?: string;
    status?: TaskStatus;
    visibility?: TaskVisibility;
    start_date?: string;
    due_date?: string;
    assignee_ids?: string[];
  };

  try {
    body = await request.json();
  } catch {
    return errorResponse('VALIDATION_ERROR', 'Corpo da requisição inválido.', 400);
  }

  const projectId = body.project_id?.trim();
  const title = body.title?.trim();
  const description = body.description?.trim();
  const startDate = body.start_date?.trim() || null;
  const dueDate = body.due_date?.trim() || null;

  if (!projectId) {
    return errorResponse('VALIDATION_ERROR', 'O campo project_id é obrigatório.', 400);
  }

  if (!title) {
    return errorResponse('VALIDATION_ERROR', 'O título da tarefa é obrigatório.', 400);
  }

  const allowedStatuses: TaskStatus[] = ['to_start', 'in_progress', 'pending', 'done'];
  const allowedVisibilities: TaskVisibility[] = ['published', 'archived', 'trashed'];
  const assigneeIds = Array.isArray(body.assignee_ids) ? [...new Set(body.assignee_ids.filter(Boolean))] : [];

  if (body.assignee_ids && !Array.isArray(body.assignee_ids)) {
    return errorResponse('VALIDATION_ERROR', 'assignee_ids deve ser um array de strings.', 400);
  }

  const status: TaskStatus = body.status ? (body.status as TaskStatus) : 'to_start';
  const visibility: TaskVisibility = body.visibility ? (body.visibility as TaskVisibility) : 'published';

  if (body.status && !allowedStatuses.includes(status)) {
    return errorResponse('VALIDATION_ERROR', 'Status da tarefa inválido.', 400);
  }

  if (body.visibility && !allowedVisibilities.includes(visibility)) {
    return errorResponse('VALIDATION_ERROR', 'Visibilidade inválida.', 400);
  }

  const {
    data: project,
    error: projectError
  } = await supabase
    .from('projects')
    .select('id')
    .eq('id', projectId)
    .eq('organization_id', organization.id)
    .maybeSingle();

  if (projectError) {
    console.error('[POST /api/tasks] erro ao validar projeto:', projectError);
    return errorResponse(
      'DB_ERROR',
      'Erro ao validar projeto.',
      500,
      { supabase_code: projectError.code, supabase_message: projectError.message }
    );
  }

  if (!project) {
    return errorResponse('FORBIDDEN', 'Projeto não encontrado ou fora da organização ativa.', 403);
  }

  if (assigneeIds.length > 0) {
    const { data: allowedAssignees, error: assigneeCheckError } = await supabase
      .from('project_members')
      .select('user_id')
      .eq('project_id', projectId)
      .in('user_id', assigneeIds);

    if (assigneeCheckError) {
      console.error('[POST /api/tasks] erro ao validar responsáveis:', assigneeCheckError);
      return errorResponse(
        'DB_ERROR',
        'Erro ao validar responsáveis.',
        500,
        { supabase_code: assigneeCheckError.code, supabase_message: assigneeCheckError.message }
      );
    }

    const allowedIds = new Set((allowedAssignees ?? []).map((member) => member.user_id));
    const invalidIds = assigneeIds.filter((id) => !allowedIds.has(id));

    if (invalidIds.length > 0) {
      return errorResponse('VALIDATION_ERROR', 'Alguns responsáveis não pertencem a este projeto.', 400, { invalid_assignee_ids: invalidIds });
    }
  }

  const payload: TaskInsert = {
    project_id: projectId,
    title,
    description: description ?? null,
    status,
    visibility,
    start_date: startDate,
    due_date: dueDate,
    created_by: userData.user.id
  };

  const { data, error } = await supabase
    .from('tasks')
    .insert(payload)
    .select('id, project_id, title, description, status, visibility, start_date, due_date, created_at')
    .single();

  if (error) {
    console.error('[POST /api/tasks] supabase error:', error);
    return errorResponse(
      'DB_ERROR',
      'Erro ao criar tarefa.',
      500,
      { supabase_code: error.code, supabase_message: error.message }
    );
  }

  if (assigneeIds.length > 0) {
    const assigneePayload = assigneeIds.map((userId) => ({
      task_id: data.id,
      user_id: userId
    }));

    const { error: assigneeInsertError } = await supabase.from('task_assignees').insert(assigneePayload);

    if (assigneeInsertError) {
      console.error('[POST /api/tasks] supabase error (assignees):', assigneeInsertError);
      return errorResponse(
        'DB_ERROR',
        'Erro ao associar responsáveis à tarefa.',
        500,
        { supabase_code: assigneeInsertError.code, supabase_message: assigneeInsertError.message }
      );
    }
  }

  return successResponse(data, { status: 201 });
}
