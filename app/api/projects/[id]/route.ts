import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/lib/supabase/server';
import { getActiveOrganizationForUser } from '@/lib/organizations';

type ApiError = { code: string; message: string; details?: unknown };
type ApiSuccess<T> = { success: true; data: T };
type ApiErrorResponse = { success: false; error: ApiError };

const unauthenticated = (): NextResponse<ApiErrorResponse> =>
  NextResponse.json(
    { success: false, error: { code: 'UNAUTHENTICATED', message: 'Usuário não autenticado.' } },
    { status: 401 }
  );

const noOrganization = (): NextResponse<ApiErrorResponse> =>
  NextResponse.json(
    { success: false, error: { code: 'NO_ORGANIZATION', message: 'Nenhuma organização ativa encontrada para este usuário.' } },
    { status: 400 }
  );

const badRequest = (message: string, details?: unknown): NextResponse<ApiErrorResponse> =>
  NextResponse.json({ success: false, error: { code: 'BAD_REQUEST', message, details } }, { status: 400 });

const notFound = (message: string): NextResponse<ApiErrorResponse> =>
  NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message } }, { status: 404 });

const internalError = (message: string, details?: unknown): NextResponse<ApiErrorResponse> =>
  NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message, details } }, { status: 500 });

type RouteContext = { params: { id: string } };

export async function GET(_: Request, { params }: RouteContext): Promise<NextResponse<ApiSuccess<unknown> | ApiErrorResponse>> {
  const supabase = createRouteHandlerClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    return unauthenticated();
  }

  const organization = await getActiveOrganizationForUser(userData.user.id, supabase);
  if (!organization) {
    return noOrganization();
  }

  const { data, error } = await supabase
    .from('projects')
    .select('id, name, status, start_date, due_date, client_id, created_at, description')
    .eq('id', params.id)
    .eq('organization_id', organization.id)
    .maybeSingle();

  if (error) {
    console.error('[GET /api/projects/:id] supabase error:', error);
    return internalError('Erro ao buscar projeto.', { supabase_code: error.code, supabase_message: error.message });
  }

  if (!data) {
    return notFound('Projeto não encontrado para a organização ativa.');
  }

  return NextResponse.json({ success: true, data } satisfies ApiSuccess<typeof data>);
}

export async function PUT(request: Request, { params }: RouteContext): Promise<NextResponse<ApiSuccess<unknown> | ApiErrorResponse>> {
  const supabase = createRouteHandlerClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    return unauthenticated();
  }

  const organization = await getActiveOrganizationForUser(userData.user.id, supabase);
  if (!organization) {
    return noOrganization();
  }

  let body: {
    client_id?: string;
    name?: string;
    description?: string;
    status?: string;
    start_date?: string;
    due_date?: string;
  };

  try {
    body = await request.json();
  } catch {
    return badRequest('Corpo da requisição inválido.');
  }

  const { data, error } = await supabase
    .from('projects')
    .update({
      client_id: body.client_id ?? undefined,
      name: body.name ?? undefined,
      description: body.description ?? undefined,
      status: body.status ?? undefined,
      start_date: body.start_date ?? undefined,
      due_date: body.due_date ?? undefined
    })
    .eq('id', params.id)
    .eq('organization_id', organization.id)
    .select('id, name, status, start_date, due_date, client_id, created_at, description')
    .maybeSingle();

  if (error) {
    console.error('[PUT /api/projects/:id] supabase error:', error);
    return internalError('Erro ao atualizar projeto.', { supabase_code: error.code, supabase_message: error.message });
  }

  if (!data) {
    return notFound('Projeto não encontrado para a organização ativa.');
  }

  return NextResponse.json({ success: true, data } satisfies ApiSuccess<typeof data>);
}

export async function DELETE(_: Request, { params }: RouteContext): Promise<NextResponse<ApiSuccess<unknown> | ApiErrorResponse>> {
  const supabase = createRouteHandlerClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    return unauthenticated();
  }

  const organization = await getActiveOrganizationForUser(userData.user.id, supabase);
  if (!organization) {
    return noOrganization();
  }

  const { error, count } = await supabase
    .from('projects')
    .delete({ count: 'exact', returning: 'minimal' })
    .eq('id', params.id)
    .eq('organization_id', organization.id);

  if (error) {
    console.error('[DELETE /api/projects/:id] supabase error:', error);
    return internalError('Erro ao deletar projeto.', { supabase_code: error.code, supabase_message: error.message });
  }

  if (!count) {
    return notFound('Projeto não encontrado para a organização ativa.');
  }

  return NextResponse.json({ success: true, data: { id: params.id } } satisfies ApiSuccess<{ id: string }>);
}
