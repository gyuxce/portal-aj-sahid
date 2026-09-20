"use server";

import { revalidatePath } from "next/cache";

import { requireAdminProfile } from "@/lib/dal";
import { nimToSyntheticEmail } from "@/lib/constants";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  bulkStudentSchema,
  parseStudentList,
  resetPasswordSchema,
} from "@/lib/validations/students";

export type StudentRowResult = {
  nim: string;
  fullName: string;
  status: "ok" | "error";
  message?: string;
};

export type BulkCreateState = {
  error?: string;
  rows?: StudentRowResult[];
} | null;

export async function bulkCreateStudents(
  _prevState: BulkCreateState,
  formData: FormData,
): Promise<BulkCreateState> {
  await requireAdminProfile();

  const parsed = bulkStudentSchema.safeParse({
    shared_password: formData.get("shared_password"),
    raw_list: formData.get("raw_list"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  const rows = parseStudentList(parsed.data.raw_list);
  if (rows.length === 0) {
    return { error: "Tidak ada baris yang bisa diproses." };
  }

  let adminClient: ReturnType<typeof createAdminClient>;
  try {
    adminClient = createAdminClient();
  } catch {
    return {
      error:
        "SUPABASE_SERVICE_ROLE_KEY belum diisi di .env.local. Minta admin teknis mengisinya dulu.",
    };
  }

  const supabase = await createClient();
  const results: StudentRowResult[] = [];

  for (const row of rows) {
    if (!row.nim || !row.fullName) {
      results.push({
        ...row,
        status: "error",
        message: "Format harus: NIM, Nama Lengkap",
      });
      continue;
    }

    const email = nimToSyntheticEmail(row.nim);
    const { data: created, error: createError } =
      await adminClient.auth.admin.createUser({
        email,
        password: parsed.data.shared_password,
        email_confirm: true,
        user_metadata: { full_name: row.fullName, role: "student" },
      });

    if (createError || !created.user) {
      results.push({
        ...row,
        status: "error",
        message: createError?.message.includes("already been registered")
          ? "NIM sudah terdaftar"
          : "Gagal membuat akun",
      });
      continue;
    }

    // handle_new_user() trigger already created the profiles row from
    // user_metadata; it doesn't know about NIM, so fill that in here.
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ nim: row.nim })
      .eq("id", created.user.id);

    if (updateError) {
      results.push({
        ...row,
        status: "error",
        message: "Akun dibuat tapi gagal menyimpan NIM",
      });
      continue;
    }

    results.push({ ...row, status: "ok" });
  }

  revalidatePath("/admin/students");
  return { rows: results };
}

export type ResetPasswordState = { error?: string; success?: boolean } | null;

export async function resetStudentPassword(
  _prevState: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  await requireAdminProfile();

  const parsed = resetPasswordSchema.safeParse({
    profile_id: formData.get("profile_id"),
    new_password: formData.get("new_password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  let adminClient: ReturnType<typeof createAdminClient>;
  try {
    adminClient = createAdminClient();
  } catch {
    return {
      error:
        "SUPABASE_SERVICE_ROLE_KEY belum diisi di .env.local. Minta admin teknis mengisinya dulu.",
    };
  }

  const { error } = await adminClient.auth.admin.updateUserById(
    parsed.data.profile_id,
    { password: parsed.data.new_password },
  );

  if (error) {
    return { error: "Gagal reset password." };
  }

  return { success: true };
}
