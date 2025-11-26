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

const internalError = (message: string, details?: unknown): NextResponse<ApiErrorResponse> =>
  NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message, details } }, { status: 500 });

export async function GET(): Promise<NextResponse<ApiSuccess<unknown> | ApiErrorResponse>> {
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
    // Aliases para manter payload compatível com o front, usando campos reais da tabela.
    .select('id, name, email:contact_email, phone:contact_phone, created_at')
    .eq('organization_id', organization.id);

  if (error) {
    console.error('[GET /api/clients] supabase error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'DB_ERROR',
          message: 'Erro ao buscar clientes.',
          details: { supabase_code: error.code, supabase_message: error.message }
        }
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, data } satisfies ApiSuccess<typeof data>);
}

export async function POST(request: Request): Promise<NextResponse<ApiSuccess<unknown> | ApiErrorResponse>> {
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

  const name = body.name?.trim();
  if (!name) {
    return badRequest('O nome do cliente é obrigatório.');
  }

  const { data, error } = await supabase
    .from('clients')
    .insert({
      organization_id: organization.id,
      name,
      contact_email: body.email ?? null,
      contact_phone: body.phone ?? null
    })
    .select('id, name, email:contact_email, phone:contact_phone, created_at')
    .single();

  if (error) {
    return internalError('Erro ao criar cliente.', { code: error.code, message: error.message });
  }

  return NextResponse.json({ success: true, data } satisfies ApiSuccess<typeof data>, { status: 201 });
}
