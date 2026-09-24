"use server";

import { revalidatePath } from "next/cache";

import { requireAdminProfile } from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";
import {
  announcementSchema,
  announcementUpdateSchema,
} from "@/lib/validations/announcements";

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
    image_path: formData.get("image_path") || undefined,
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
    image_path: parsed.data.image_path || null,
    created_by: admin.id,
  });

  if (error) {
    // Uploaded image already landed in Storage but the DB row failed —
    // clean it up so it doesn't sit there as an orphaned, unlisted file.
    if (parsed.data.image_path) {
      await supabase.storage
        .from("announcement-images")
        .remove([parsed.data.image_path]);
    }
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

  const parsed = announcementUpdateSchema.safeParse({
    course_id: formData.get("course_id") || undefined,
    title: formData.get("title"),
    body: formData.get("body"),
    is_pinned: formData.get("is_pinned") || undefined,
    image_path: formData.get("image_path") || undefined,
    remove_image: formData.get("remove_image") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("announcements")
    .select("image_path")
    .eq("id", announcementId)
    .single();

  const newImagePath = parsed.data.image_path || null;
  const oldImagePath = existing?.image_path ?? null;
  // A freshly-uploaded image replaces the old one; the "hapus gambar"
  // checkbox clears it without replacing. Either way the old file is no
  // longer referenced, so it gets removed from Storage below.
  const shouldClearOldImage =
    (newImagePath && newImagePath !== oldImagePath) ||
    (parsed.data.remove_image === "on" && !newImagePath);

  const { error } = await supabase
    .from("announcements")
    .update({
      course_id: parsed.data.course_id || null,
      title: parsed.data.title,
      body: parsed.data.body,
      is_pinned: parsed.data.is_pinned === "on",
      image_path: newImagePath || (parsed.data.remove_image === "on" ? null : oldImagePath),
    })
    .eq("id", announcementId);

  if (error) {
    if (newImagePath) {
      await supabase.storage.from("announcement-images").remove([newImagePath]);
    }
    return { error: "Gagal menyimpan perubahan." };
  }

  if (shouldClearOldImage && oldImagePath) {
    await supabase.storage.from("announcement-images").remove([oldImagePath]);
  }

  revalidateAnnouncementViews();
  return { success: true };
}

export async function deleteAnnouncement(announcementId: string) {
  await requireAdminProfile();
  const supabase = await createClient();

  const { data: announcement } = await supabase
    .from("announcements")
    .select("image_path")
    .eq("id", announcementId)
    .single();

  const { error } = await supabase
    .from("announcements")
    .delete()
    .eq("id", announcementId);

  if (error) {
    throw new Error("Gagal menghapus pengumuman.");
  }

  if (announcement?.image_path) {
    await supabase.storage
      .from("announcement-images")
      .remove([announcement.image_path]);
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
