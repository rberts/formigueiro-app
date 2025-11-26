import { NextResponse, type NextResponseInit } from 'next/server';
import { createRouteHandlerClient } from '@/lib/supabase/server';
import { getActiveOrganizationForUser } from '@/lib/organizations';

type ApiErrorCode = 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'DB_ERROR';
type ApiSuccess<T> = { success: true; data: T };
type ApiErrorResponse = { success: false; error: { code: ApiErrorCode; message: string; details?: unknown } };

type RouteContext = { params: { id: string; userId: string } };

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

export async function DELETE(
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
    console.error('[DELETE /api/projects/:id/members/:userId] erro ao validar projeto:', projectError);
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

  const { error, count } = await supabase
    .from('project_members')
    .delete({ returning: 'minimal', count: 'exact' })
    .eq('project_id', params.id)
    .eq('user_id', params.userId);

  if (error) {
    console.error('[DELETE /api/projects/:id/members/:userId] supabase error:', error);
    return errorResponse(
      'DB_ERROR',
      'Erro ao remover membro do projeto.',
      500,
      { supabase_code: error.code, supabase_message: error.message }
    );
  }

  if (!count) {
    return errorResponse('NOT_FOUND', 'Membro não encontrado neste projeto.', 404);
  }

  return successResponse({ user_id: params.userId });
}
