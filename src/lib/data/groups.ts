import "server-only";

import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/dal";
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
  let query = supabase.from("groups").select("*").order("name");
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

  return groups.map((g) => ({
    ...g,
    courseName: courseMap.get(g.course_id)?.name ?? "Mata kuliah",
    courseCode: courseMap.get(g.course_id)?.code ?? "",
  }));
}

export async function getAllGroupsForAdmin(): Promise<GroupWithDetails[]> {
  if (!isSupabaseConfigured()) {
    return DUMMY_GROUPS;
  }

  const groups = await fetchGroupsWithCourse();
  return attachDetails(groups);
}

export async function getMyGroupsForStudent(): Promise<GroupWithDetails[]> {
  if (!isSupabaseConfigured()) {
    return DUMMY_GROUPS;
  }

  const profile = await getCurrentProfile();
  if (!profile) {
    return [];
  }

  const supabase = await createClient();
  const { data: memberships, error } = await supabase
    .from("group_members")
    .select("group_id")
    .eq("profile_id", profile.id);

  if (error) {
    throw new Error("Gagal memuat data kelompok.");
  }

  const groupIds = (memberships ?? []).map((m) => m.group_id);
  if (groupIds.length === 0) {
    return [];
  }

  const { data: groups, error: groupsError } = await supabase
    .from("groups")
    .select("*")
    .in("id", groupIds)
    .order("name");

  if (groupsError) {
    throw new Error("Gagal memuat data kelompok.");
  }

  const uniqueCourseIds = [...new Set((groups ?? []).map((g) => g.course_id))];
  const { data: courses } = await supabase
    .from("courses")
    .select("id, name, code")
    .in("id", uniqueCourseIds);
  const courseMap = new Map((courses ?? []).map((c) => [c.id, c]));

  const rawGroups: RawGroup[] = (groups ?? []).map((g) => ({
    ...g,
    courseName: courseMap.get(g.course_id)?.name ?? "Mata kuliah",
    courseCode: courseMap.get(g.course_id)?.code ?? "",
  }));

  return attachDetails(rawGroups);
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
