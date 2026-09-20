"use server";

import { revalidatePath } from "next/cache";

import { requireAdminProfile } from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";
import {
  materialSchema,
  materialUpdateSchema,
} from "@/lib/validations/materials";

export type ActionState = { error?: string; success?: boolean } | null;

function revalidateMaterialViews() {
  revalidatePath("/admin/materials");
  revalidatePath("/dashboard/materials");
}

export async function createMaterial(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const admin = await requireAdminProfile();

  // FormData.get() returns null (not undefined) for a field that was never
  // in the form — e.g. task_id on the standalone Materi page, or
  // external_url once the "Upload file" branch deletes it — and z.optional()
  // only accepts undefined, so every optional field here needs `|| undefined`
  // to normalize null/"" before validation.
  const parsed = materialSchema.safeParse({
    course_id: formData.get("course_id"),
    task_id: formData.get("task_id") || undefined,
    title: formData.get("title"),
    material_type: formData.get("material_type"),
    meeting_number: formData.get("meeting_number") || undefined,
    external_url: formData.get("external_url") || undefined,
    storage_path: formData.get("storage_path") || undefined,
    file_name: formData.get("file_name") || undefined,
    file_size: formData.get("file_size") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("materials").insert({
    course_id: parsed.data.course_id,
    task_id: parsed.data.task_id || null,
    title: parsed.data.title,
    material_type: parsed.data.material_type,
    meeting_number: parsed.data.meeting_number ?? null,
    external_url: parsed.data.external_url || null,
    storage_path: parsed.data.storage_path || null,
    file_name: parsed.data.file_name || null,
    file_size: parsed.data.file_size ?? null,
    created_by: admin.id,
  });

  if (error) {
    // Uploaded file already landed in Storage but the DB row failed —
    // clean it up so it doesn't sit there as an orphaned, unlisted file.
    if (parsed.data.storage_path) {
      await supabase.storage
        .from("class-materials")
        .remove([parsed.data.storage_path]);
    }
    return { error: "Gagal menyimpan materi." };
  }

  revalidateMaterialViews();
  return { success: true };
}

export async function updateMaterial(
  materialId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdminProfile();

  const parsed = materialUpdateSchema.safeParse({
    title: formData.get("title"),
    material_type: formData.get("material_type"),
    meeting_number: formData.get("meeting_number") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("materials")
    .update({
      title: parsed.data.title,
      material_type: parsed.data.material_type,
      meeting_number: parsed.data.meeting_number ?? null,
    })
    .eq("id", materialId);

  if (error) {
    return { error: "Gagal menyimpan perubahan." };
  }

  revalidateMaterialViews();
  return { success: true };
}

export async function deleteMaterial(materialId: string) {
  await requireAdminProfile();
  const supabase = await createClient();

  const { data: material } = await supabase
    .from("materials")
    .select("storage_path")
    .eq("id", materialId)
    .single();

  const { error } = await supabase
    .from("materials")
    .delete()
    .eq("id", materialId);

  if (error) {
    throw new Error("Gagal menghapus materi.");
  }

  if (material?.storage_path) {
    await supabase.storage
      .from("class-materials")
      .remove([material.storage_path]);
  }

  revalidateMaterialViews();
}
