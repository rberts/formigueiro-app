import { NextResponse, type NextResponseInit } from 'next/server';
import { createRouteHandlerClient } from '@/lib/supabase/server';
import { getActiveOrganizationForUser } from '@/lib/organizations';
import type { Database } from '@/types/database';

type ApiErrorCode = 'VALIDATION_ERROR' | 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'DB_ERROR';
type ApiSuccess<T> = { success: true; data: T };
type ApiErrorResponse = { success: false; error: { code: ApiErrorCode; message: string; details?: unknown } };

type RouteContext = { params: { id: string } };
const successResponse = <T>(data: T, init?: NextResponseInit) =>
  NextResponse.json({ success: true, data } satisfies ApiSuccess<T>, init);

const errorResponse = (code: ApiErrorCode, message: string, status: number, details?: unknown) =>
  NextResponse.json({ success: false, error: { code, message, details } } satisfies ApiErrorResponse, {
    status
  });

const unauthorized = () => errorResponse('UNAUTHORIZED', 'Usuário não autenticado.', 401);

const ensureProjectInOrg = async (
  supabase: ReturnType<typeof createRouteHandlerClient>,
  projectId: string,
  organizationId: string
) => {
  return supabase.from('projects').select('id').eq('id', projectId).eq('organization_id', organizationId).maybeSingle();
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

  const { data: project, error: projectError } = await ensureProjectInOrg(supabase, params.id, organization.id);

  if (projectError) {
    console.error('[GET /api/projects/:id/members] erro ao validar projeto:', projectError);
    return errorResponse(
      'DB_ERROR',
      'Erro ao validar projeto.',
      500,
      { supabase_code: projectError.code, supabase_message: projectError.message }
    );
  }

  if (!project) {
    return errorResponse('NOT_FOUND', 'Projeto não encontrado para a organização ativa.', 404);
  }

  const { data, error } = await supabase
    .from('project_members')
    .select('user_id, role, created_at, profiles(full_name)')
    .eq('project_id', params.id);

  if (error) {
    console.error('[GET /api/projects/:id/members] supabase error:', error);
    return errorResponse(
      'DB_ERROR',
      'Erro ao buscar membros do projeto.',
      500,
      { supabase_code: error.code, supabase_message: error.message }
    );
  }

  const members = data?.map((member) => ({
    user_id: member.user_id,
    role: member.role,
    created_at: member.created_at,
    full_name: (member.profiles as { full_name: string | null } | null)?.full_name ?? null
  }));

  return successResponse(members);
}

export async function POST(
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

  let body: { user_id?: string; role?: string };

  try {
    body = await request.json();
  } catch {
    return errorResponse('VALIDATION_ERROR', 'Corpo da requisição inválido.', 400);
  }

  const targetUserId = body.user_id?.trim();
  const role = body.role?.trim() || 'member';

  if (!targetUserId) {
    return errorResponse('VALIDATION_ERROR', 'O campo user_id é obrigatório.', 400);
  }

  const { data: project, error: projectError } = await ensureProjectInOrg(supabase, params.id, organization.id);

  if (projectError) {
    console.error('[POST /api/projects/:id/members] erro ao validar projeto:', projectError);
    return errorResponse(
      'DB_ERROR',
      'Erro ao validar projeto.',
      500,
      { supabase_code: projectError.code, supabase_message: projectError.message }
    );
  }

  if (!project) {
    return errorResponse('NOT_FOUND', 'Projeto não encontrado para a organização ativa.', 404);
  }

  const {
    data: orgMember,
    error: orgMemberError
  } = await supabase
    .from('organization_members')
    .select('user_id')
    .eq('organization_id', organization.id)
    .eq('user_id', targetUserId)
    .maybeSingle();

  if (orgMemberError) {
    console.error('[POST /api/projects/:id/members] erro ao validar membro da organização:', orgMemberError);
    return errorResponse(
      'DB_ERROR',
      'Erro ao validar vínculo com a organização.',
      500,
      { supabase_code: orgMemberError.code, supabase_message: orgMemberError.message }
    );
  }

  if (!orgMember) {
    return errorResponse('FORBIDDEN', 'Usuário não pertence à organização ativa.', 403);
  }

  const { data, error } = await supabase
    .from('project_members')
    .insert({
      project_id: params.id,
      user_id: targetUserId,
      role
    })
    .select('user_id, role, created_at, profiles(full_name)')
    .maybeSingle();

  if (error) {
    if (error.code === '23505') {
      return errorResponse('VALIDATION_ERROR', 'Usuário já é membro deste projeto.', 400);
    }
    console.error('[POST /api/projects/:id/members] supabase error:', error);
    return errorResponse(
      'DB_ERROR',
      'Erro ao adicionar membro ao projeto.',
      500,
      { supabase_code: error.code, supabase_message: error.message }
    );
  }

  const member = data
    ? {
        user_id: data.user_id,
        role: data.role,
        created_at: data.created_at,
        full_name: (data.profiles as { full_name: string | null } | null)?.full_name ?? null
      }
    : null;

  return successResponse(member, { status: 201 });
}
