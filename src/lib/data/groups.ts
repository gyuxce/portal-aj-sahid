import "server-only";

import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/dal";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { Group, GroupProgressStatus } from "@/lib/types/database";

export type MemberInfo = {
  profileId: string;
  fullName: string;
  nickname: string | null;
};

export type ProgressInfo = {
  taskId: string;
  taskTitle: string;
  progressStatus: GroupProgressStatus;
  notes: string | null;
  updatedAt: string;
  updatedByName: string;
};

export type GroupWithDetails = Group & {
  courseName: string;
  courseCode: string;
  leaderName: string | null;
  members: MemberInfo[];
  progress: ProgressInfo[];
};

const now = new Date().toISOString();

const DUMMY_GROUPS: GroupWithDetails[] = [
  {
    id: "dummy-group-1",
    course_id: "dummy-2",
    name: "Kelompok 1",
    leader_id: "dummy-student-1",
    notes: null,
    wa_group_link: "https://chat.whatsapp.com/dummy-group-link",
    created_at: now,
    updated_at: now,
    courseName: "Basis Data Terapan",
    courseCode: "MK-102",
    leaderName: "Mahasiswa Contoh Satu",
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
    progress: [
      {
        taskId: "dummy-task-2",
        taskTitle: "Tugas Kelompok 1: ERD",
        progressStatus: "in_progress",
        notes: "ERD draft sudah dibuat.",
        updatedAt: now,
        updatedByName: "Admin Contoh",
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

  const [{ data: members }, { data: progressRows }, { data: profiles }] =
    await Promise.all([
      supabase
        .from("group_members")
        .select("group_id, profile_id")
        .in("group_id", groupIds),
      supabase
        .from("group_task_updates")
        .select("group_id, task_id, progress_status, notes, updated_at, updated_by")
        .in("group_id", groupIds),
      supabase.from("profiles").select("id, full_name, nickname"),
    ]);

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

  const taskIds = [...new Set((progressRows ?? []).map((p) => p.task_id))];
  const { data: tasks } =
    taskIds.length > 0
      ? await supabase.from("tasks").select("id, title").in("id", taskIds)
      : { data: [] as { id: string; title: string }[] };
  const taskMap = new Map((tasks ?? []).map((t) => [t.id, t.title]));

  return groups.map((group) => {
    const groupMembers = (members ?? [])
      .filter((m) => m.group_id === group.id)
      .map((m) => {
        const profile = profileMap.get(m.profile_id);
        return {
          profileId: m.profile_id,
          fullName: profile?.full_name ?? "Mahasiswa",
          nickname: profile?.nickname ?? null,
        };
      });

    const groupProgress = (progressRows ?? [])
      .filter((p) => p.group_id === group.id)
      .map((p) => ({
        taskId: p.task_id,
        taskTitle: taskMap.get(p.task_id) ?? "Tugas",
        progressStatus: p.progress_status as GroupProgressStatus,
        notes: p.notes,
        updatedAt: p.updated_at,
        updatedByName: profileMap.get(p.updated_by)?.full_name ?? "Admin",
      }));

    return {
      ...group,
      leaderName: group.leader_id
        ? (profileMap.get(group.leader_id)?.full_name ?? null)
        : null,
      members: groupMembers,
      progress: groupProgress,
    };
  });
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


export async function getActiveTasksForGroupForm(courseId: string): Promise<
  { id: string; title: string }[]
> {
  if (!isSupabaseConfigured()) {
    return [{ id: "dummy-task-2", title: "Tugas Kelompok 1: ERD" }];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasks")
    .select("id, title")
    .eq("course_id", courseId)
    .eq("status", "active")
    .order("deadline");

  if (error) {
    throw new Error("Gagal memuat daftar tugas.");
  }

  return data ?? [];
}
