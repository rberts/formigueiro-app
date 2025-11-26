'use server';

import { redirect } from 'next/navigation';
import { createRouteHandlerClient } from '@/lib/supabase/server';

type RegisterActionResult = { error?: string };

export const registerAction = async (formData: FormData): Promise<RegisterActionResult | void> => {
  const fullName = formData.get('full_name')?.toString().trim();
  const organizationName = formData.get('organization_name')?.toString().trim();
  const email = formData.get('email')?.toString().trim();
  const password = formData.get('password')?.toString() ?? '';

  if (!fullName || !organizationName || !email || !password) {
    return { error: 'Preencha todos os campos.' };
  }

  const supabase = createRouteHandlerClient();

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password });
  if (signUpError || !signUpData.user) {
    return { error: signUpError?.message || 'Não foi possível criar sua conta.' };
  }

  const userId = signUpData.user.id;

  const { error: profileError } = await supabase.from('profiles').insert({
    id: userId,
    full_name: fullName
  });
  if (profileError) {
    return { error: 'Conta criada, mas falhou ao salvar seu perfil.' };
  }

  const { data: orgData, error: orgError } = await supabase
    .from('organizations')
    .insert({ name: organizationName, created_by: userId })
    .select('id')
    .single();

  if (orgError || !orgData) {
    return { error: 'Conta criada, mas falhou ao criar a organização.' };
  }

  const { error: memberError } = await supabase.from('organization_members').insert({
    organization_id: orgData.id,
    user_id: userId,
    role: 'owner'
  });

  if (memberError) {
    return { error: 'Organização criada, mas falhou ao vincular seu usuário.' };
  }

  // TODO: Se existir coluna active_organization_id em profiles, setar aqui.

  redirect('/');
};
