import "server-only";

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { Group } from "@/lib/types/database";

export type MemberInfo = {
  profileId: string;
  fullName: string;
  nickname: string | null;
};

export type CourseTaskDeadline = {
  id: string;
  title: string;
  deadline: string;
};

export type GroupWithDetails = Group & {
  courseName: string;
  courseCode: string;
  members: MemberInfo[];
};

const now = new Date().toISOString();

const DUMMY_GROUPS: GroupWithDetails[] = [
  {
    id: "dummy-group-1",
    course_id: "dummy-2",
    name: "Kelompok 1",
    leader_id: null,
    notes: null,
    wa_group_link: "https://chat.whatsapp.com/dummy-group-link",
    presentation_at: null,
    created_at: now,
    updated_at: now,
    courseName: "Basis Data Terapan",
    courseCode: "MK-102",
    members: [
      {
        profileId: "dummy-student-1",
        fullName: "Mahasiswa Contoh Satu",
        nickname: "Mhs1",
      },
      {
        profileId: "dummy-student-2",
        fullName: "Mahasiswa Contoh Dua",
        nickname: "Mhs2",
      },
    ],
  },
];

type RawGroup = Group & { courseName: string; courseCode: string };

async function attachDetails(groups: RawGroup[]): Promise<GroupWithDetails[]> {
  if (groups.length === 0) {
    return [];
  }

  const supabase = await createClient();
  const groupIds = groups.map((g) => g.id);

  const { data: members } = await supabase
    .from("group_members")
    .select("group_id, profile_id")
    .in("group_id", groupIds);

  const profileIds = [...new Set((members ?? []).map((m) => m.profile_id))];
  const { data: profiles } =
    profileIds.length > 0
      ? await supabase
          .from("profiles")
          .select("id, full_name, nickname")
          .in("id", profileIds)
      : { data: [] as { id: string; full_name: string; nickname: string | null }[] };

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

  return groups.map((group) => ({
    ...group,
    members: (members ?? [])
      .filter((m) => m.group_id === group.id)
      .map((m) => {
        const profile = profileMap.get(m.profile_id);
        return {
          profileId: m.profile_id,
          fullName: profile?.full_name ?? "Mahasiswa",
          nickname: profile?.nickname ?? null,
        };
      })
      .sort((a, b) => a.fullName.localeCompare(b.fullName)),
  }));
}

async function fetchGroupsWithCourse(courseIds?: string[]): Promise<RawGroup[]> {
  const supabase = await createClient();
  // Sorted in JS, not via Postgres .order("name") — Postgres collation sorts
  // "Kelompok 10" before "Kelompok 2" (plain string compare), which read as
  // out of order to admins naming groups "Kelompok 1", "Kelompok 2", ...
  // localeCompare's numeric mode treats the embedded number as a number.
  let query = supabase.from("groups").select("*");
  if (courseIds) {
    query = query.in("course_id", courseIds);
  }
  const { data: groups, error } = await query;

  if (error) {
    throw new Error("Gagal memuat data kelompok.");
  }
  if (!groups || groups.length === 0) {
    return [];
  }

  const uniqueCourseIds = [...new Set(groups.map((g) => g.course_id))];
  const { data: courses } = await supabase
    .from("courses")
    .select("id, name, code")
    .in("id", uniqueCourseIds);
  const courseMap = new Map((courses ?? []).map((c) => [c.id, c]));

  return groups
    .map((g) => ({
      ...g,
      courseName: courseMap.get(g.course_id)?.name ?? "Mata kuliah",
      courseCode: courseMap.get(g.course_id)?.code ?? "",
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "id", { numeric: true }));
}

// Every signed-in user — admin or student — can read every group (see
// groups_select_authenticated / group_members_select_authenticated in the
// RLS migration): a small alih-jenjang class expects everyone to be able to
// see the whole roster's groupings, not just their own. Pass a courseId to
// scope the query to one course's page instead of the whole class.
export async function getAllGroups(courseId?: string): Promise<GroupWithDetails[]> {
  if (!isSupabaseConfigured()) {
    return courseId
      ? DUMMY_GROUPS.filter((g) => g.course_id === courseId)
      : DUMMY_GROUPS;
  }

  const groups = await fetchGroupsWithCourse(courseId ? [courseId] : undefined);
  return attachDetails(groups);
}

export async function getStudentProfilesForSelect(): Promise<
  { id: string; full_name: string }[]
> {
  if (!isSupabaseConfigured()) {
    return [
      { id: "dummy-student-1", full_name: "Mahasiswa Contoh Satu" },
      { id: "dummy-student-2", full_name: "Mahasiswa Contoh Dua" },
    ];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("role", "student")
    .order("full_name");

  if (error) {
    throw new Error("Gagal memuat daftar mahasiswa.");
  }

  return data ?? [];
}

/** Deadlines shown read-only on each group card, so the admin sees what the
 * group is working toward without maintaining a separate progress record. */
export async function getCourseTaskDeadlines(
  courseId: string,
): Promise<CourseTaskDeadline[]> {
  if (!isSupabaseConfigured()) {
    return [
      {
        id: "dummy-task-2",
        title: "Tugas Kelompok 1: ERD",
        deadline: now,
      },
    ];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasks")
    .select("id, title, deadline")
    .eq("course_id", courseId)
    .eq("status", "active")
    .order("deadline");

  if (error) {
    throw new Error("Gagal memuat deadline tugas.");
  }

  return data ?? [];
}
