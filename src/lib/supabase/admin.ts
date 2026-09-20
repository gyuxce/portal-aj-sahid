import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/types/database";

/**
 * Service-role Supabase client. Bypasses RLS entirely and can call
 * supabase.auth.admin.*. NEVER import this from a Client Component, and
 * never call it outside a Server Action/Route Handler that has already
 * verified the caller is an admin (see requireAdminProfile in lib/dal.ts).
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY belum diisi di .env.local. Diperlukan untuk mengelola akun mahasiswa.",
    );
  }

  return createSupabaseClient<Database>(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
