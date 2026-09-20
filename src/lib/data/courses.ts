import "server-only";

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { Course, CourseLink, Schedule } from "@/lib/types/database";

export type CourseWithSchedule = Course & {
  schedules: Schedule[];
  activeLink: CourseLink | null;
};

const now = new Date().toISOString();

// Shown when Supabase isn't configured yet, so the UI stays reviewable
// without a backend (see AGENTS.md point 8: "fallback data dummy").
const DUMMY_COURSES: CourseWithSchedule[] = [
  {
    id: "dummy-1",
    code: "MK-101",
    name: "Pemrograman Web Lanjut",
    lecturer: "Dr. Contoh Dosen",
    status: "active",
    created_at: now,
    updated_at: now,
    schedules: [
      {
        id: "dummy-schedule-1",
        course_id: "dummy-1",
        day_of_week: "friday",
        start_time: "19:00",
        end_time: "21:00",
        note: "Zoom malam Jumat",
        is_active: true,
        created_at: now,
        updated_at: now,
      },
    ],
    activeLink: {
      id: "dummy-link-1",
      course_id: "dummy-1",
      url: "https://zoom.example.test/mk-101",
      label: "Zoom Jumat malam",
      is_active: true,
      archived_at: null,
      created_by: "dummy-admin",
      created_at: now,
    },
  },
  {
    id: "dummy-2",
    code: "MK-102",
    name: "Basis Data Terapan",
    lecturer: "Dr. Contoh Dosen Dua",
    status: "active",
    created_at: now,
    updated_at: now,
    schedules: [
      {
        id: "dummy-schedule-2",
        course_id: "dummy-2",
        day_of_week: "saturday",
        start_time: "08:00",
        end_time: "10:00",
        note: "Ruang B1",
        is_active: true,
        created_at: now,
        updated_at: now,
      },
    ],
    activeLink: null,
  },
];

function attachRelations(
  courses: Course[],
  schedules: Schedule[],
  links: CourseLink[],
): CourseWithSchedule[] {
  return courses.map((course) => ({
    ...course,
    schedules: schedules.filter((s) => s.course_id === course.id),
    activeLink: links.find((l) => l.course_id === course.id) ?? null,
  }));
}

/** RLS already restricts students to active rows; this mirrors that filter
 * explicitly so the query intent is clear. */
export async function getActiveCoursesForStudent(): Promise<
  CourseWithSchedule[]
> {
  if (!isSupabaseConfigured()) {
    return DUMMY_COURSES;
  }

  const supabase = await createClient();
  const { data: courses, error } = await supabase
    .from("courses")
    .select("*")
    .eq("status", "active")
    .order("name", { ascending: true });

  if (error) {
    throw new Error("Gagal memuat daftar mata kuliah.");
  }

  if (!courses || courses.length === 0) {
    return [];
  }

  const courseIds = courses.map((c) => c.id);
  const [{ data: schedules }, { data: links }] = await Promise.all([
    supabase
      .from("schedules")
      .select("*")
      .in("course_id", courseIds)
      .eq("is_active", true),
    supabase
      .from("course_links")
      .select("*")
      .in("course_id", courseIds)
      .eq("is_active", true),
  ]);

  return attachRelations(courses, schedules ?? [], links ?? []);
}

/** Admin sees active and archived courses, and all schedules/links. */
export async function getAllCoursesForAdmin(): Promise<CourseWithSchedule[]> {
  if (!isSupabaseConfigured()) {
    return DUMMY_COURSES;
  }

  const supabase = await createClient();
  const { data: courses, error } = await supabase
    .from("courses")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Gagal memuat daftar mata kuliah.");
  }

  if (!courses || courses.length === 0) {
    return [];
  }

  const courseIds = courses.map((c) => c.id);
  const [{ data: schedules }, { data: links }] = await Promise.all([
    supabase.from("schedules").select("*").in("course_id", courseIds),
    supabase
      .from("course_links")
      .select("*")
      .in("course_id", courseIds)
      .eq("is_active", true),
  ]);

  return attachRelations(courses, schedules ?? [], links ?? []);
}
