"use server";

import { revalidatePath } from "next/cache";

import { requireAdminProfile } from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";
import { groupSchema, updateGroupSchema } from "@/lib/validations/groups";

export type ActionState = { error?: string; success?: boolean } | null;

// "layout" so the nested /[courseId] pages are covered too — revalidating
// only the exact "/admin/groups" path left the per-course list stale, so a
// newly created group did not show up until a hard reload.
function revalidateGroupViews() {
  revalidatePath("/admin/groups", "layout");
  revalidatePath("/dashboard/groups", "layout");
}

export async function createGroup(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdminProfile();

  const parsed = groupSchema.safeParse({
    course_id: formData.get("course_id"),
    name: formData.get("name"),
    notes: formData.get("notes"),
    wa_group_link: formData.get("wa_group_link"),
    profile_ids: formData.getAll("profile_ids"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  const supabase = await createClient();
  const { data: group, error } = await supabase
    .from("groups")
    .insert({
      course_id: parsed.data.course_id,
      name: parsed.data.name,
      notes: parsed.data.notes || null,
      wa_group_link: parsed.data.wa_group_link || null,
    })
    .select("id")
    .single();

  if (error || !group) {
    return {
      error:
        error?.code === "23505"
          ? "Nama kelompok sudah dipakai di mata kuliah ini."
          : "Gagal menyimpan kelompok.",
    };
  }

  if (parsed.data.profile_ids.length > 0) {
    const { error: memberError } = await supabase.from("group_members").insert(
      parsed.data.profile_ids.map((profileId) => ({
        group_id: group.id,
        profile_id: profileId,
      })),
    );

    if (memberError) {
      revalidateGroupViews();
      return {
        error:
          "Kelompok tersimpan, tapi anggota gagal ditambahkan. Tambahkan lewat form kelompok di bawah.",
      };
    }
  }

  revalidateGroupViews();
  return { success: true };
}

export async function updateGroup(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdminProfile();

  const parsed = updateGroupSchema.safeParse({
    group_id: formData.get("group_id"),
    profile_ids: formData.getAll("profile_ids"),
    wa_group_link: formData.get("wa_group_link"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  const supabase = await createClient();

  if (parsed.data.profile_ids.length > 0) {
    const { error } = await supabase.from("group_members").insert(
      parsed.data.profile_ids.map((profileId) => ({
        group_id: parsed.data.group_id,
        profile_id: profileId,
      })),
    );

    if (error) {
      return {
        error:
          error.code === "23505"
            ? "Salah satu mahasiswa sudah ada di kelompok ini."
            : "Gagal menambahkan anggota.",
      };
    }
  }

  const { error: linkError } = await supabase
    .from("groups")
    .update({ wa_group_link: parsed.data.wa_group_link || null })
    .eq("id", parsed.data.group_id);

  if (linkError) {
    return { error: "Gagal menyimpan link grup WhatsApp." };
  }

  revalidateGroupViews();
  return { success: true };
}

export async function removeGroupMember(groupId: string, profileId: string) {
  await requireAdminProfile();
  const supabase = await createClient();
  const { error } = await supabase
    .from("group_members")
    .delete()
    .eq("group_id", groupId)
    .eq("profile_id", profileId);

  if (error) {
    throw new Error("Gagal menghapus anggota.");
  }

  revalidateGroupViews();
}
