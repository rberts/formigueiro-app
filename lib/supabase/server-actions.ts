import { NextResponse } from 'next/server';

export type ApiSuccess<T> = {
  success: true;
  data: T;
};

export type ApiError = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export const successResponse = <T>(data: T, init?: ResponseInit): NextResponse<ApiSuccess<T>> =>
  NextResponse.json({ success: true, data }, init);

export const errorResponse = (code: string, message: string, details?: unknown, init?: ResponseInit): NextResponse<ApiError> =>
  NextResponse.json({ success: false, error: { code, message, details } }, init);

export type SafeAction<T> = () => Promise<T>;

export const withApiHandler = async <T>(handler: SafeAction<T>) => {
  try {
    // TODO: Validar usuário autenticado e organização ativa antes de executar a ação.
    const data = await handler();
    return successResponse(data as T);
  } catch (error) {
    // TODO: Registrar logs de erro na tabela task_activity_log quando pertinente.
    const message = error instanceof Error ? error.message : 'Erro interno';
    return errorResponse('INTERNAL_ERROR', message);
  }
};
