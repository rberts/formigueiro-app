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

export async function GET(): Promise<NextResponse<ApiSuccess<unknown> | ApiErrorResponse>> {
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
    .select('id, name, status, start_date, due_date, client_id, created_at')
    .eq('organization_id', organization.id);

  if (error) {
    console.error('[GET /api/projects] supabase error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'DB_ERROR',
          message: 'Erro ao buscar projetos.',
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
    return noOrganization();
  }

  let body: {
    client_id?: string;
    name?: string;
    description?: string;
    start_date?: string;
    due_date?: string;
  };

  try {
    body = await request.json();
  } catch {
    return badRequest('Corpo da requisição inválido.');
  }

  const clientId = body.client_id?.trim();
  const name = body.name?.trim();

  if (!clientId || !name) {
    return badRequest('Campos obrigatórios: client_id e name.');
  }

  const { data, error } = await supabase
    .from('projects')
    .insert({
      organization_id: organization.id,
      client_id: clientId,
      name,
      description: body.description ?? null,
      start_date: body.start_date ?? null,
      due_date: body.due_date ?? null,
      status: 'active',
      created_by: userData.user.id
    })
    .select('id, name, status, start_date, due_date, client_id, created_at')
    .single();

  if (error) {
    console.error('[POST /api/projects] supabase error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'DB_ERROR',
          message: 'Erro ao criar projeto.',
          details: { supabase_code: error.code, supabase_message: error.message }
        }
      },
      { status: 500 }
    );
  }

  // Vincula automaticamente o criador como membro "owner" do projeto recém-criado.
  const { error: memberError } = await supabase.from('project_members').insert({
    project_id: data.id,
    user_id: userData.user.id,
    role: 'owner'
  });

  if (memberError) {
    console.error('[POST /api/projects] supabase error (auto member):', memberError);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'DB_ERROR',
          message: 'Projeto criado, mas não foi possível adicionar o criador como membro.',
          details: { supabase_code: memberError.code, supabase_message: memberError.message, project_id: data.id }
        }
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, data } satisfies ApiSuccess<typeof data>, { status: 201 });
}
