import "server-only";

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { Announcement } from "@/lib/types/database";

export type AnnouncementWithCourse = Announcement & {
  courseName: string | null;
  courseCode: string | null;
  imageUrl: string | null;
};

const now = new Date().toISOString();

const DUMMY_ANNOUNCEMENTS: AnnouncementWithCourse[] = [
  {
    id: "dummy-ann-1",
    course_id: null,
    title: "Selamat datang di Portal Kelas",
    body: "Portal ini memuat jadwal, tugas, dan pengumuman kelas alih jenjang.",
    is_pinned: true,
    status: "published",
    image_path: null,
    created_by: "dummy-admin",
    created_at: now,
    updated_at: now,
    courseName: null,
    courseCode: null,
    imageUrl: null,
  },
  {
    id: "dummy-ann-2",
    course_id: "dummy-1",
    title: "Perubahan jadwal pertemuan 3",
    body: "Pertemuan pindah ke pukul 19.30.",
    is_pinned: false,
    status: "published",
    image_path: null,
    created_by: "dummy-admin",
    created_at: now,
    updated_at: now,
    courseName: "Pemrograman Web Lanjut",
    courseCode: "MK-101",
    imageUrl: null,
  },
];

async function attachCourseInfo(
  announcements: Announcement[],
): Promise<AnnouncementWithCourse[]> {
  const courseIds = [
    ...new Set(
      announcements
        .map((a) => a.course_id)
        .filter((id): id is string => id !== null),
    ),
  ];

  const supabase = await createClient();

  const courseMap = new Map<string, { name: string; code: string }>();
  if (courseIds.length > 0) {
    const { data: courses } = await supabase
      .from("courses")
      .select("id, name, code")
      .in("id", courseIds);
    for (const c of courses ?? []) {
      courseMap.set(c.id, { name: c.name, code: c.code });
    }
  }

  return announcements.map((a) => ({
    ...a,
    courseName: a.course_id ? (courseMap.get(a.course_id)?.name ?? null) : null,
    courseCode: a.course_id ? (courseMap.get(a.course_id)?.code ?? null) : null,
    imageUrl: a.image_path
      ? supabase.storage.from("announcement-images").getPublicUrl(a.image_path)
          .data.publicUrl
      : null,
  }));
}

function sortPinnedFirst(list: AnnouncementWithCourse[]) {
  return [...list].sort((a, b) => {
    if (a.is_pinned !== b.is_pinned) {
      return a.is_pinned ? -1 : 1;
    }
    return (
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  });
}

export async function getPublishedAnnouncementsForStudent(): Promise<
  AnnouncementWithCourse[]
> {
  if (!isSupabaseConfigured()) {
    return sortPinnedFirst(DUMMY_ANNOUNCEMENTS);
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("announcements")
    .select("*")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Gagal memuat pengumuman.");
  }

  const withCourse = await attachCourseInfo(data ?? []);
  return sortPinnedFirst(withCourse);
}

export async function getActiveCoursesForAnnouncementForm(): Promise<
  { id: string; name: string; code: string }[]
> {
  if (!isSupabaseConfigured()) {
    return [
      { id: "dummy-1", name: "Pemrograman Web Lanjut", code: "MK-101" },
      { id: "dummy-2", name: "Basis Data Terapan", code: "MK-102" },
    ];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("courses")
    .select("id, name, code")
    .eq("status", "active")
    .order("name");

  if (error) {
    throw new Error("Gagal memuat daftar mata kuliah.");
  }

  return data ?? [];
}

export async function getAllAnnouncementsForAdmin(): Promise<
  AnnouncementWithCourse[]
> {
  if (!isSupabaseConfigured()) {
    return sortPinnedFirst(DUMMY_ANNOUNCEMENTS);
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("announcements")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Gagal memuat pengumuman.");
  }

  const withCourse = await attachCourseInfo(data ?? []);
  return sortPinnedFirst(withCourse);
}
