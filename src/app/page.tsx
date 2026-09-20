import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/dal";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export default async function RootPage() {
  if (!isSupabaseConfigured()) {
    redirect("/login");
  }

  const user = await getCurrentUser();
  redirect(user ? "/dashboard" : "/login");
}
