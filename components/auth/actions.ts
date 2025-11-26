'use server';

import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';

export const logoutAction = async () => {
  const supabase = createServerClient();
  await supabase.auth.signOut();
  redirect('/login');
};
