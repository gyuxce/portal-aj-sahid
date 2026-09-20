"use server";

import { revalidatePath } from "next/cache";

import { requireAdminProfile } from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";
import {
  groupSchema,
  manageMembersSchema,
  progressSchema,
  waLinkSchema,
} from "@/lib/validations/groups";

export type ActionState = { error?: string; success?: boolean } | null;

function revalidateGroupViews() {
  revalidatePath("/admin/groups");
  revalidatePath("/dashboard/groups");
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
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("groups").insert({
    course_id: parsed.data.course_id,
    name: parsed.data.name,
    notes: parsed.data.notes || null,
    wa_group_link: parsed.data.wa_group_link || null,
  });

  if (error) {
    return {
      error:
        error.code === "23505"
          ? "Nama kelompok sudah dipakai di mata kuliah ini."
          : "Gagal menyimpan kelompok.",
    };
  }

  revalidateGroupViews();
  return { success: true };
}

// Adds the newly selected members and sets the leader in one save, so the
// admin doesn't have to submit "Anggota" and then separately submit "Ketua
// kelompok" for what is really one action.
export async function saveGroupMembers(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdminProfile();

  const parsed = manageMembersSchema.safeParse({
    group_id: formData.get("group_id"),
    profile_ids: formData.getAll("profile_ids"),
    leader_id: formData.get("leader_id") || undefined,
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

  const { error: leaderError } = await supabase
    .from("groups")
    .update({ leader_id: parsed.data.leader_id || null })
    .eq("id", parsed.data.group_id);

  if (leaderError) {
    return { error: "Gagal memperbarui ketua kelompok." };
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

export async function updateGroupWaLink(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdminProfile();

  const parsed = waLinkSchema.safeParse({
    group_id: formData.get("group_id"),
    wa_group_link: formData.get("wa_group_link"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("groups")
    .update({ wa_group_link: parsed.data.wa_group_link || null })
    .eq("id", parsed.data.group_id);

  if (error) {
    return { error: "Gagal menyimpan link WA." };
  }

  revalidateGroupViews();
  return { success: true };
}

export async function updateGroupProgress(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const admin = await requireAdminProfile();

  const parsed = progressSchema.safeParse({
    group_id: formData.get("group_id"),
    task_id: formData.get("task_id"),
    progress_status: formData.get("progress_status"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("group_task_updates").upsert(
    {
      group_id: parsed.data.group_id,
      task_id: parsed.data.task_id,
      progress_status: parsed.data.progress_status,
      notes: parsed.data.notes || null,
      updated_by: admin.id,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "group_id,task_id" },
  );

  if (error) {
    return { error: "Gagal menyimpan progres." };
  }

  revalidateGroupViews();
  return { success: true };
}
