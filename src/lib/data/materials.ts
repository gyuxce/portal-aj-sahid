import "server-only";

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { Material } from "@/lib/types/database";

export type MaterialWithCourse = Material & {
  courseName: string;
  courseCode: string;
  /** Signed URL for uploaded files (storage_path); null for link materials
   * or when signing failed. Regenerated on every page load — see the
   * "materialsBucket" signed URL expiry below. */
  fileUrl: string | null;
};

const SIGNED_URL_EXPIRY_SECONDS = 60 * 60; // 1 hour

const now = new Date().toISOString();

const DUMMY_MATERIALS: MaterialWithCourse[] = [
  {
    id: "dummy-material-1",
    course_id: "dummy-1",
    task_id: null,
    title: "Slide Pertemuan 1",
    material_type: "link",
    meeting_number: 1,
    external_url: "https://drive.example.test/slide-1",
    storage_path: null,
    file_name: null,
    file_size: null,
    status: "active",
    created_by: "dummy-admin",
    created_at: now,
    updated_at: now,
    courseName: "Pemrograman Web Lanjut",
    courseCode: "MK-101",
    fileUrl: null,
  },
];

export type MaterialMeetingGroup = {
  meetingNumber: number | null;
  materials: MaterialWithCourse[];
};

export type MaterialsByCourse = {
  courseId: string;
  courseName: string;
  courseCode: string;
  meetings: MaterialMeetingGroup[];
};

/** Groups a flat material list into course → pertemuan sections. Materials
 * without a meeting number land in a trailing "Lainnya" group. */
export function groupMaterialsByCourseAndMeeting(
  materials: MaterialWithCourse[],
): MaterialsByCourse[] {
  const courseMap = new Map<string, MaterialsByCourse>();

  for (const material of materials) {
    let course = courseMap.get(material.course_id);
    if (!course) {
      course = {
        courseId: material.course_id,
        courseName: material.courseName,
        courseCode: material.courseCode,
        meetings: [],
      };
      courseMap.set(material.course_id, course);
    }

    let meeting = course.meetings.find(
      (m) => m.meetingNumber === material.meeting_number,
    );
    if (!meeting) {
      meeting = { meetingNumber: material.meeting_number, materials: [] };
      course.meetings.push(meeting);
    }
    meeting.materials.push(material);
  }

  for (const course of courseMap.values()) {
    course.meetings.sort((a, b) => {
      if (a.meetingNumber === null) return 1;
      if (b.meetingNumber === null) return -1;
      return a.meetingNumber - b.meetingNumber;
    });
  }

  return [...courseMap.values()].sort((a, b) =>
    a.courseName.localeCompare(b.courseName),
  );
}

async function attachCourseInfo(
  materials: Material[],
): Promise<MaterialWithCourse[]> {
  if (materials.length === 0) {
    return [];
  }

  const supabase = await createClient();
  const courseIds = [...new Set(materials.map((m) => m.course_id))];
  const storagePaths = materials
    .map((m) => m.storage_path)
    .filter((p): p is string => Boolean(p));

  const [{ data: courses }, signedUrls] = await Promise.all([
    supabase.from("courses").select("id, name, code").in("id", courseIds),
    storagePaths.length > 0
      ? supabase.storage
          .from("class-materials")
          .createSignedUrls(storagePaths, SIGNED_URL_EXPIRY_SECONDS)
      : Promise.resolve({ data: null }),
  ]);

  const courseMap = new Map((courses ?? []).map((c) => [c.id, c]));
  const urlMap = new Map(
    (signedUrls.data ?? [])
      .filter((u) => u.signedUrl && !u.error)
      .map((u) => [u.path, u.signedUrl]),
  );

  return materials.map((material) => ({
    ...material,
    courseName: courseMap.get(material.course_id)?.name ?? "Mata kuliah",
    courseCode: courseMap.get(material.course_id)?.code ?? "",
    fileUrl: material.storage_path
      ? (urlMap.get(material.storage_path) ?? null)
      : null,
  }));
}

export async function getActiveMaterialsForStudent(): Promise<
  MaterialWithCourse[]
> {
  if (!isSupabaseConfigured()) {
    return DUMMY_MATERIALS;
  }

  const supabase = await createClient();
  const { data: materials, error } = await supabase
    .from("materials")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Gagal memuat daftar materi.");
  }

  return attachCourseInfo(materials ?? []);
}

export async function getAllMaterialsForAdmin(): Promise<
  MaterialWithCourse[]
> {
  if (!isSupabaseConfigured()) {
    return DUMMY_MATERIALS;
  }

  const supabase = await createClient();
  const { data: materials, error } = await supabase
    .from("materials")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Gagal memuat daftar materi.");
  }

  return attachCourseInfo(materials ?? []);
}
