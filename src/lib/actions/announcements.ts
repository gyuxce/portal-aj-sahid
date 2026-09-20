"use server";

import { revalidatePath } from "next/cache";

import { requireAdminProfile } from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";
import { announcementSchema } from "@/lib/validations/announcements";

export type ActionState = { error?: string; success?: boolean } | null;

function revalidateAnnouncementViews() {
  revalidatePath("/admin/announcements");
  revalidatePath("/dashboard/announcements");
  revalidatePath("/dashboard");
}

export async function createAnnouncement(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const admin = await requireAdminProfile();

  const parsed = announcementSchema.safeParse({
    course_id: formData.get("course_id") || undefined,
    title: formData.get("title"),
    body: formData.get("body"),
    // Unchecked checkboxes are omitted from FormData entirely (null, not
    // undefined) — z.optional() only accepts undefined.
    is_pinned: formData.get("is_pinned") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("announcements").insert({
    course_id: parsed.data.course_id || null,
    title: parsed.data.title,
    body: parsed.data.body,
    is_pinned: parsed.data.is_pinned === "on",
    created_by: admin.id,
  });

  if (error) {
    return { error: "Gagal menyimpan pengumuman." };
  }

  revalidateAnnouncementViews();
  return { success: true };
}

export async function updateAnnouncement(
  announcementId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdminProfile();

  const parsed = announcementSchema.safeParse({
    course_id: formData.get("course_id") || undefined,
    title: formData.get("title"),
    body: formData.get("body"),
    is_pinned: formData.get("is_pinned") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("announcements")
    .update({
      course_id: parsed.data.course_id || null,
      title: parsed.data.title,
      body: parsed.data.body,
      is_pinned: parsed.data.is_pinned === "on",
    })
    .eq("id", announcementId);

  if (error) {
    return { error: "Gagal menyimpan perubahan." };
  }

  revalidateAnnouncementViews();
  return { success: true };
}

export async function deleteAnnouncement(announcementId: string) {
  await requireAdminProfile();
  const supabase = await createClient();
  const { error } = await supabase
    .from("announcements")
    .delete()
    .eq("id", announcementId);

  if (error) {
    throw new Error("Gagal menghapus pengumuman.");
  }

  revalidateAnnouncementViews();
}

export async function togglePinned(announcementId: string, isPinned: boolean) {
  await requireAdminProfile();
  const supabase = await createClient();
  const { error } = await supabase
    .from("announcements")
    .update({ is_pinned: isPinned })
    .eq("id", announcementId);

  if (error) {
    throw new Error("Gagal memperbarui status pin.");
  }

  revalidateAnnouncementViews();
}
