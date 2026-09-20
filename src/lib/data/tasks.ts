import "server-only";

import { getCurrentProfile } from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { Task } from "@/lib/types/database";

export type TaskMaterialSummary = {
  id: string;
  title: string;
  material_type: string;
  status: string;
  href: string | null;
};

export type TaskGroupMember = {
  profileId: string;
  fullName: string;
  nickname: string | null;
};

export type TaskGroupSummary = {
  id: string;
  name: string;
  waGroupLink: string | null;
  members: TaskGroupMember[];
};

export type TaskWithCourse = Task & {
  courseName: string;
  courseCode: string;
  materials: TaskMaterialSummary[];
  /** The current user's own group for this task's course, if the task is a
   * group task and they're a member of one — null for individual tasks,
   * admins, or students not yet placed in a group. */
  myGroup: TaskGroupSummary | null;
};

const SIGNED_URL_EXPIRY_SECONDS = 60 * 60; // 1 hour

const now = new Date();
const inDays = (days: number) =>
  new Date(now.getTime() + days * 24 * 60 * 60 * 1000).toISOString();

const DUMMY_TASKS: TaskWithCourse[] = [
  {
    id: "dummy-task-1",
    task_code: "TASK-001",
    course_id: "dummy-1",
    title: "Tugas Individu 1: Setup Proyek",
    task_type: "individual",
    description: "Buat repo dan deploy hello world.",
    deadline: inDays(5),
    status: "active",
    created_by: "dummy-admin",
    updated_by: null,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
    courseName: "Pemrograman Web Lanjut",
    courseCode: "MK-101",
    materials: [],
    myGroup: null,
  },
  {
    id: "dummy-task-2",
    task_code: "TASK-002",
    course_id: "dummy-2",
    title: "Tugas Kelompok 1: ERD",
    task_type: "group",
    description: "Rancang ERD untuk studi kasus.",
    deadline: inDays(10),
    status: "active",
    created_by: "dummy-admin",
    updated_by: null,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
    courseName: "Basis Data Terapan",
    courseCode: "MK-102",
    materials: [
      {
        id: "dummy-material-2",
        title: "Template ERD",
        material_type: "pdf",
        status: "active",
        href: "https://drive.example.test/template-erd",
      },
    ],
    myGroup: {
      id: "dummy-group-1",
      name: "Kelompok 1",
      waGroupLink: "https://chat.whatsapp.com/dummy-group-link",
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
  },
];

// RLS on `materials` already restricts non-admin sessions to status='active'
// rows, so this returns the right thing for both student and admin callers
// without any extra filtering here.
async function attachTaskExtras(tasks: Task[]): Promise<TaskWithCourse[]> {
  if (tasks.length === 0) {
    return [];
  }

  const supabase = await createClient();
  const courseIds = [...new Set(tasks.map((t) => t.course_id))];
  const taskIds = tasks.map((t) => t.id);

  const [{ data: courses }, { data: materials }] = await Promise.all([
    supabase.from("courses").select("id, name, code").in("id", courseIds),
    supabase.from("materials").select("*").in("task_id", taskIds),
  ]);

  const courseMap = new Map((courses ?? []).map((c) => [c.id, c]));

  const storagePaths = (materials ?? [])
    .map((m) => m.storage_path)
    .filter((p): p is string => Boolean(p));
  const { data: signedUrls } =
    storagePaths.length > 0
      ? await supabase.storage
          .from("class-materials")
          .createSignedUrls(storagePaths, SIGNED_URL_EXPIRY_SECONDS)
      : { data: null };
  const urlMap = new Map(
    (signedUrls ?? [])
      .filter((u) => u.signedUrl && !u.error)
      .map((u) => [u.path, u.signedUrl]),
  );

  const withMaterials = tasks.map((task) => ({
    ...task,
    courseName: courseMap.get(task.course_id)?.name ?? "Mata kuliah",
    courseCode: courseMap.get(task.course_id)?.code ?? "",
    materials: (materials ?? [])
      .filter((m) => m.task_id === task.id)
      .map((m) => ({
        id: m.id,
        title: m.title,
        material_type: m.material_type,
        status: m.status,
        href: m.external_url ?? (m.storage_path ? (urlMap.get(m.storage_path) ?? null) : null),
      })),
    myGroup: null as TaskGroupSummary | null,
  }));

  return attachMyGroup(withMaterials);
}

/** For group-type tasks, finds the current user's own group in that task's
 * course (a group is tied to a course, not a specific task) and attaches
 * its members + WhatsApp link — so a student opening a group task
 * immediately sees who they're working with and how to reach them. */
async function attachMyGroup(
  tasks: TaskWithCourse[],
): Promise<TaskWithCourse[]> {
  const groupCourseIds = [
    ...new Set(
      tasks.filter((t) => t.task_type === "group").map((t) => t.course_id),
    ),
  ];

  if (groupCourseIds.length === 0) {
    return tasks;
  }

  const profile = await getCurrentProfile();
  if (!profile) {
    return tasks;
  }

  const supabase = await createClient();
  const { data: myMemberships } = await supabase
    .from("group_members")
    .select("group_id")
    .eq("profile_id", profile.id);

  const myGroupIds = (myMemberships ?? []).map((m) => m.group_id);
  if (myGroupIds.length === 0) {
    return tasks;
  }

  const { data: myGroups } = await supabase
    .from("groups")
    .select("*")
    .in("id", myGroupIds)
    .in("course_id", groupCourseIds);

  if (!myGroups || myGroups.length === 0) {
    return tasks;
  }

  const groupIds = myGroups.map((g) => g.id);
  const { data: memberRows } = await supabase
    .from("group_members")
    .select("group_id, profile_id")
    .in("group_id", groupIds);

  const profileIds = [...new Set((memberRows ?? []).map((m) => m.profile_id))];
  const { data: profiles } =
    profileIds.length > 0
      ? await supabase
          .from("profiles")
          .select("id, full_name, nickname")
          .in("id", profileIds)
      : { data: [] as { id: string; full_name: string; nickname: string | null }[] };
  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

  const groupByCourseId = new Map(myGroups.map((g) => [g.course_id, g]));

  return tasks.map((task) => {
    if (task.task_type !== "group") {
      return task;
    }
    const group = groupByCourseId.get(task.course_id);
    if (!group) {
      return task;
    }
    return {
      ...task,
      myGroup: {
        id: group.id,
        name: group.name,
        waGroupLink: group.wa_group_link,
        members: (memberRows ?? [])
          .filter((m) => m.group_id === group.id)
          .map((m) => ({
            profileId: m.profile_id,
            fullName: profileMap.get(m.profile_id)?.full_name ?? "Mahasiswa",
            nickname: profileMap.get(m.profile_id)?.nickname ?? null,
          })),
      },
    };
  });
}

export async function getActiveTasksForStudent(): Promise<TaskWithCourse[]> {
  if (!isSupabaseConfigured()) {
    return DUMMY_TASKS;
  }

  const supabase = await createClient();
  const { data: tasks, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("status", "active")
    .order("deadline", { ascending: true });

  if (error) {
    throw new Error("Gagal memuat daftar tugas.");
  }

  return attachTaskExtras(tasks ?? []);
}

export async function getUpcomingTasksForStudent(
  limit: number,
): Promise<TaskWithCourse[]> {
  const tasks = await getActiveTasksForStudent();
  return tasks.slice(0, limit);
}

export async function getAllTasksForAdmin(): Promise<TaskWithCourse[]> {
  if (!isSupabaseConfigured()) {
    return DUMMY_TASKS;
  }

  const supabase = await createClient();
  const { data: tasks, error } = await supabase
    .from("tasks")
    .select("*")
    .order("deadline", { ascending: true });

  if (error) {
    throw new Error("Gagal memuat daftar tugas.");
  }

  return attachTaskExtras(tasks ?? []);
}

export async function getActiveCoursesForTaskForm(): Promise<
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
