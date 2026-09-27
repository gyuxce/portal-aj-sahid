import "server-only";

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type NavBadgeTimestamps = Record<string, string | null>;

/** Timestamp konten terbaru per section nav mahasiswa (Tugas/Materi/
 * Pengumuman) — dibandingkan di sisi client terhadap "terakhir dilihat"
 * per section (disimpan di localStorage tiap perangkat) buat nampilin titik
 * notifikasi "ada yang baru". Nggak ada tabel "read state" di server, jadi
 * ini sengaja cuma kasih timestamp mentahnya, bukan status sudah-dibaca. */
export async function getStudentNavBadgeTimestamps(): Promise<NavBadgeTimestamps> {
  if (!isSupabaseConfigured()) {
    return {};
  }

  const supabase = await createClient();
  const [{ data: task }, { data: material }, { data: announcement }] =
    await Promise.all([
      supabase
        .from("tasks")
        .select("created_at")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("materials")
        .select("created_at")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("announcements")
        .select("created_at")
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

  return {
    "/dashboard/tasks": task?.created_at ?? null,
    "/dashboard/materials": material?.created_at ?? null,
    "/dashboard/announcements": announcement?.created_at ?? null,
  };
}

/** Yang paling baru di antara ketiganya — dipakai buat label "Diperbarui
 * X lalu" di Beranda. */
export function latestOf(timestamps: NavBadgeTimestamps): string | null {
  const values = Object.values(timestamps).filter(
    (v): v is string => v !== null,
  );
  if (values.length === 0) return null;
  return values.reduce((latest, current) =>
    new Date(current) > new Date(latest) ? current : latest,
  );
}
