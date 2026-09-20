import "server-only";

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { Profile } from "@/lib/types/database";

export async function getAllStudents(): Promise<Profile[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "student")
    .order("full_name");

  if (error) {
    throw new Error("Gagal memuat daftar mahasiswa.");
  }

  return data ?? [];
}
