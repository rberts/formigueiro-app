'use server';

import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';

type LoginActionResult = { error?: string };

export const loginAction = async (formData: FormData): Promise<LoginActionResult | void> => {
  const email = formData.get('email')?.toString().trim();
  const password = formData.get('password')?.toString() ?? '';

  if (!email || !password) {
    return { error: 'E-mail e senha são obrigatórios.' };
  }

  const supabase = createServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message || 'Não foi possível autenticar.' };
  }

  redirect('/');
};
