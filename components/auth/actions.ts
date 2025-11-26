'use server';

import { redirect } from 'next/navigation';
import { createRouteHandlerClient } from '@/lib/supabase/server';

export const logoutAction = async () => {
  const supabase = createRouteHandlerClient();
  await supabase.auth.signOut();
  redirect('/login');
};
