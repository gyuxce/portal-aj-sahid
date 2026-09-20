import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "@/lib/types/database";
import { getSupabaseEnv } from "@/lib/supabase/env";

/**
 * Browser-only Supabase client. Never import this from a Server Component,
 * Server Action, or Route Handler.
 */
export function createClient() {
  const env = getSupabaseEnv();

  if (!env) {
    throw new Error(
      "Supabase belum dikonfigurasi. Isi NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY di .env.local.",
    );
  }

  return createBrowserClient<Database>(env.url, env.publishableKey);
}
