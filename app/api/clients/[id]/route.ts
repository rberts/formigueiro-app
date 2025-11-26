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
    return badRequest('Nenhuma organização ativa encontrada para este usuário.');
  }

  const { data, error } = await supabase
    .from('clients')
    .select('id, name, email, phone, created_at')
    .eq('id', params.id)
    .eq('organization_id', organization.id)
    .maybeSingle();

  if (error) {
    return internalError('Erro ao buscar cliente.', { code: error.code, message: error.message });
  }

  if (!data) {
    return notFound('Cliente não encontrado para a organização ativa.');
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
    return badRequest('Nenhuma organização ativa encontrada para este usuário.');
  }

  let body: { name?: string; email?: string; phone?: string };
  try {
    body = await request.json();
  } catch {
    return badRequest('Corpo da requisição inválido.');
  }

  const { data, error } = await supabase
    .from('clients')
    .update({
      name: body.name ?? undefined,
      email: body.email ?? undefined,
      phone: body.phone ?? undefined
    })
    .eq('id', params.id)
    .eq('organization_id', organization.id)
    .select('id, name, email, phone, created_at')
    .maybeSingle();

  if (error) {
    return internalError('Erro ao atualizar cliente.', { code: error.code, message: error.message });
  }

  if (!data) {
    return notFound('Cliente não encontrado para a organização ativa.');
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
    return badRequest('Nenhuma organização ativa encontrada para este usuário.');
  }

  const { error, count } = await supabase
    .from('clients')
    .delete({ count: 'exact', returning: 'minimal' })
    .eq('id', params.id)
    .eq('organization_id', organization.id);

  if (error) {
    return internalError('Erro ao deletar cliente.', { code: error.code, message: error.message });
  }

  if (!count) {
    return notFound('Cliente não encontrado para a organização ativa.');
  }

  return NextResponse.json({ success: true, data: { id: params.id } } satisfies ApiSuccess<{ id: string }>);
}
