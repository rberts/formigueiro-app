import { cookies } from 'next/headers';
import { createServerClient as createSupabaseClient, type SupabaseClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
}

// Para Server Components: apenas leitura de cookies (no set/remove para evitar erros do Next).
export const createServerComponentClient = (): SupabaseClient<Database> => {
  const cookieStore = cookies();
  return createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      // No-ops para evitar "Cookies can only be modified..." em Server Components.
      set() {},
      remove() {}
    }
  });
};

// Para Route Handlers / Server Actions: leitura e escrita de cookies permitidas.
export const createRouteHandlerClient = (): SupabaseClient<Database> => {
  const cookieStore = cookies();
  return createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options?: Parameters<typeof cookieStore.set>[1]) {
        cookieStore.set(name, value, options);
      },
      remove(name: string, options?: Parameters<typeof cookieStore.delete>[1]) {
        if (options) {
          cookieStore.delete({ name, ...options });
        } else {
          cookieStore.delete(name);
        }
      }
    }
  });
};

export const getSession = async () => {
  const supabase = createServerComponentClient();
  const { data } = await supabase.auth.getSession();
  return data.session ?? null;
};

export const getUser = async () => {
  const supabase = createServerComponentClient();
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
};
