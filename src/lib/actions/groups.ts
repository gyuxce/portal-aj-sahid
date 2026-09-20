"use server";

import { revalidatePath } from "next/cache";

import { requireAdminProfile } from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";
import {
  groupSchema,
  presentationScheduleSchema,
  updateGroupSchema,
} from "@/lib/validations/groups";

export type ActionState = { error?: string; success?: boolean } | null;

// "layout" so the nested /[courseId] pages are covered too — revalidating
// only the exact "/admin/groups" path left the per-course list stale, so a
// newly created group did not show up until a hard reload.
function revalidateGroupViews() {
  revalidatePath("/admin/groups", "layout");
  revalidatePath("/dashboard/groups", "layout");
}

// The picker sends one comma-joined hidden field (see StudentPicker) instead
// of many same-name checkboxes, so this always gets every selected id.
function parseProfileIds(value: FormDataEntryValue | null): string[] {
  if (typeof value !== "string" || value.length === 0) {
    return [];
  }
  return value.split(",").filter(Boolean);
}

export async function createGroup(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdminProfile();

  const parsed = groupSchema.safeParse({
    course_id: formData.get("course_id"),
    name: formData.get("name"),
    wa_group_link: formData.get("wa_group_link"),
    profile_ids: parseProfileIds(formData.get("profile_ids")),
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
    name: formData.get("name"),
    profile_ids: parseProfileIds(formData.get("profile_ids")),
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

  const { error: updateError } = await supabase
    .from("groups")
    .update({
      name: parsed.data.name,
      wa_group_link: parsed.data.wa_group_link || null,
    })
    .eq("id", parsed.data.group_id);

  if (updateError) {
    return {
      error:
        updateError.code === "23505"
          ? "Nama kelompok sudah dipakai di mata kuliah ini."
          : "Gagal menyimpan perubahan kelompok.",
    };
  }

  revalidateGroupViews();
  return { success: true };
}

export async function updateGroupPresentation(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdminProfile();

  const parsed = presentationScheduleSchema.safeParse({
    group_id: formData.get("group_id"),
    presentation_at: formData.get("presentation_at"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("groups")
    .update({
      presentation_at: parsed.data.presentation_at
        ? new Date(parsed.data.presentation_at).toISOString()
        : null,
    })
    .eq("id", parsed.data.group_id);

  if (error) {
    return { error: "Gagal menyimpan jadwal presentasi." };
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

export async function deleteGroup(groupId: string) {
  await requireAdminProfile();
  const supabase = await createClient();
  // ON DELETE CASCADE on group_members takes care of memberships.
  const { error } = await supabase.from("groups").delete().eq("id", groupId);

  if (error) {
    throw new Error("Gagal menghapus kelompok.");
  }

  revalidateGroupViews();
}
