import { createServerClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database';

export const getActiveOrganizationForUser = async (
  userId: string
): Promise<Database['public']['Tables']['organizations']['Row'] | null> => {
  const supabase = createServerClient();

  const { data: membership, error: membershipError } = await supabase
    .from('organization_members')
    .select('organization_id, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (membershipError || !membership?.organization_id) {
    return null;
  }

  const { data: organization, error: organizationError } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', membership.organization_id)
    .single();

  if (organizationError || !organization) {
    return null;
  }

  return organization;
};
