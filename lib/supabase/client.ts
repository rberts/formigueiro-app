import { createBrowserClient as createBrowserClientSupabase, type SupabaseClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
}

let browserClient: SupabaseClient<Database> | null = null;

export const createBrowserClient = (): SupabaseClient<Database> => {
  if (browserClient) return browserClient;
  browserClient = createBrowserClientSupabase<Database>(supabaseUrl, supabaseAnonKey);
  return browserClient;
};
