import { cookies as nextCookies } from 'next/headers';
import { createServerClient as createServerClientSupabase, type SupabaseClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
}

type CookieStore = ReturnType<typeof nextCookies>;

const getCookieAdapter = (cookieStore: CookieStore) => ({
  get(name: string) {
    return cookieStore.get(name)?.value;
  },
  set(name: string, value: string, options?: Parameters<CookieStore['set']>[1]) {
    try {
      cookieStore.set(name, value, options);
    } catch {
      // noop: during static generation or non-mutating contexts
    }
  },
  remove(name: string, options?: Parameters<CookieStore['delete']>[1]) {
    try {
      if (options) {
        cookieStore.delete({ name, ...options });
      } else {
        cookieStore.delete(name);
      }
    } catch {
      // noop
    }
  }
});

export const createServerClient = (cookieStore: CookieStore = nextCookies()): SupabaseClient<Database> =>
  createServerClientSupabase<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: getCookieAdapter(cookieStore)
  });

export const getSession = async (cookieStore?: CookieStore) => {
  const supabase = createServerClient(cookieStore ?? nextCookies());
  const { data } = await supabase.auth.getSession();
  return data.session ?? null;
};

export const getUser = async (cookieStore?: CookieStore) => {
  const supabase = createServerClient(cookieStore ?? nextCookies());
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
};
