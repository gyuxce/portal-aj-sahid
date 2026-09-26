"use server";

import { revalidatePath } from "next/cache";

import { requireAdminProfile } from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";
import { taskSchema, taskUpdateSchema } from "@/lib/validations/tasks";

export type ActionState = {
  error?: string;
  success?: boolean;
  taskId?: string;
} | null;

function revalidateTaskViews() {
  revalidatePath("/admin/tasks");
  revalidatePath("/dashboard/tasks");
  revalidatePath("/dashboard");
}

export async function createTask(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const admin = await requireAdminProfile();

  const parsed = taskSchema.safeParse({
    task_code: formData.get("task_code"),
    course_id: formData.get("course_id"),
    title: formData.get("title"),
    task_type: formData.get("task_type"),
    description: formData.get("description"),
    deadline: formData.get("deadline"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasks")
    .insert({
      task_code: parsed.data.task_code,
      course_id: parsed.data.course_id,
      title: parsed.data.title,
      task_type: parsed.data.task_type,
      description: parsed.data.description || null,
      deadline: parsed.data.deadline
        ? new Date(parsed.data.deadline).toISOString()
        : null,
      created_by: admin.id,
    })
    .select("id")
    .single();

  if (error || !data) {
    return {
      error:
        error?.code === "23505"
          ? "Kode tugas sudah dipakai."
          : "Gagal menyimpan tugas.",
    };
  }

  revalidateTaskViews();
  return { success: true, taskId: data.id };
}

export async function updateTask(
  taskId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const admin = await requireAdminProfile();

  const parsed = taskUpdateSchema.safeParse({
    course_id: formData.get("course_id"),
    title: formData.get("title"),
    task_type: formData.get("task_type"),
    description: formData.get("description"),
    deadline: formData.get("deadline"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("tasks")
    .update({
      course_id: parsed.data.course_id,
      title: parsed.data.title,
      task_type: parsed.data.task_type,
      description: parsed.data.description || null,
      deadline: parsed.data.deadline
        ? new Date(parsed.data.deadline).toISOString()
        : null,
      updated_by: admin.id,
    })
    .eq("id", taskId);

  if (error) {
    return { error: "Gagal memperbarui tugas." };
  }

  revalidateTaskViews();
  return { success: true };
}

export async function deleteTask(taskId: string) {
  await requireAdminProfile();
  const supabase = await createClient();
  const { error } = await supabase.from("tasks").delete().eq("id", taskId);

  if (error) {
    throw new Error("Gagal menghapus tugas.");
  }

  revalidateTaskViews();
}
