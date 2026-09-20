"use server";

import { revalidatePath } from "next/cache";

import { requireAdminProfile } from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";
import {
  courseLinkSchema,
  courseSchema,
  scheduleSchema,
} from "@/lib/validations/courses";

export type ActionState = { error?: string; success?: boolean } | null;

function revalidateCourseViews() {
  revalidatePath("/admin/courses");
  revalidatePath("/dashboard/courses");
  revalidatePath("/dashboard");
}

export async function createCourse(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdminProfile();

  const parsed = courseSchema.safeParse({
    code: formData.get("code"),
    name: formData.get("name"),
    lecturer: formData.get("lecturer"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("courses").insert({
    code: parsed.data.code,
    name: parsed.data.name,
    lecturer: parsed.data.lecturer || null,
  });

  if (error) {
    return {
      error:
        error.code === "23505"
          ? "Kode mata kuliah sudah dipakai."
          : "Gagal menyimpan mata kuliah.",
    };
  }

  revalidateCourseViews();
  return { success: true };
}

export async function updateCourse(
  courseId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdminProfile();

  const parsed = courseSchema.safeParse({
    code: formData.get("code"),
    name: formData.get("name"),
    lecturer: formData.get("lecturer"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("courses")
    .update({
      code: parsed.data.code,
      name: parsed.data.name,
      lecturer: parsed.data.lecturer || null,
    })
    .eq("id", courseId);

  if (error) {
    return {
      error:
        error.code === "23505"
          ? "Kode mata kuliah sudah dipakai."
          : "Gagal menyimpan perubahan.",
    };
  }

  revalidateCourseViews();
  return { success: true };
}

export async function deleteCourse(courseId: string) {
  await requireAdminProfile();
  const supabase = await createClient();
  // ON DELETE CASCADE on schedules/course_links/tasks/groups/materials/
  // announcements takes care of everything tied to this course.
  const { error } = await supabase
    .from("courses")
    .delete()
    .eq("id", courseId);

  if (error) {
    throw new Error("Gagal menghapus mata kuliah.");
  }

  revalidateCourseViews();
}

export async function addSchedule(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdminProfile();

  const parsed = scheduleSchema.safeParse({
    course_id: formData.get("course_id"),
    day_of_week: formData.get("day_of_week"),
    start_time: formData.get("start_time"),
    end_time: formData.get("end_time"),
    note: formData.get("note"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("schedules").insert({
    course_id: parsed.data.course_id,
    day_of_week: parsed.data.day_of_week,
    start_time: parsed.data.start_time,
    end_time: parsed.data.end_time,
    note: parsed.data.note || null,
  });

  if (error) {
    return { error: "Gagal menyimpan jadwal." };
  }

  revalidateCourseViews();
  return { success: true };
}

export async function setScheduleActive(scheduleId: string, isActive: boolean) {
  await requireAdminProfile();
  const supabase = await createClient();
  const { error } = await supabase
    .from("schedules")
    .update({ is_active: isActive })
    .eq("id", scheduleId);

  if (error) {
    throw new Error("Gagal memperbarui jadwal.");
  }

  revalidateCourseViews();
}

export async function setActiveCourseLink(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const admin = await requireAdminProfile();

  const parsed = courseLinkSchema.safeParse({
    course_id: formData.get("course_id"),
    url: formData.get("url"),
    label: formData.get("label"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  const supabase = await createClient();

  // Archive the current active link first so the new insert can satisfy
  // the "one active link per course" unique index.
  const { error: archiveError } = await supabase
    .from("course_links")
    .update({ is_active: false, archived_at: new Date().toISOString() })
    .eq("course_id", parsed.data.course_id)
    .eq("is_active", true);

  if (archiveError) {
    return { error: "Gagal mengarsipkan link lama." };
  }

  const { error } = await supabase.from("course_links").insert({
    course_id: parsed.data.course_id,
    url: parsed.data.url,
    label: parsed.data.label || null,
    is_active: true,
    created_by: admin.id,
  });

  if (error) {
    return { error: "Gagal menyimpan link baru." };
  }

  revalidateCourseViews();
  return { success: true };
}
